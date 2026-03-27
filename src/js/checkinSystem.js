/**
 * 签到系统模块
 * 处理签到的领取、连续签到检查等功能
 * @version 1.0.0
 */

class CheckinSystem {
    constructor(gameEngine) {
        this.engine = gameEngine;
        this.init();
    }

    /**
     * 初始化签到系统
     */
    init() {
        // 确保游戏状态中有签到相关的数据
        if (!this.engine.state.data.checkin) {
            this.engine.state.data.checkin = {
                type: 'newbie', // 当前签到类型：newbie（新手）或 daily（日常）
                currentDay: 1, // 当前签到天数
                lastCheckinDate: null, // 上次签到日期
                newbieCompleted: false // 新手签到是否完成
            };
        }
    }

    /**
     * 检查是否可以签到
     * @returns {boolean} 是否可以签到
     */
    canCheckin() {
        const checkinData = this.engine.state.data.checkin;
        const today = new Date().toDateString();
        
        // 检查是否已经签到过
        if (checkinData.lastCheckinDate === today) {
            return false;
        }
        
        return true;
    }

    /**
     * 检查是否有可领取的签到奖励
     * @returns {boolean} 是否有可领取的签到奖励
     */
    hasAvailableCheckin() {
        return this.canCheckin();
    }

    /**
     * 领取签到奖励
     * @returns {Object} 领取结果
     */
    checkin() {
        const checkinData = this.engine.state.data.checkin;
        const today = new Date().toDateString();
        
        // 检查是否已经签到过
        if (checkinData.lastCheckinDate === today) {
            return { success: false, message: '今日已经签到过了' };
        }
        
        // 检查是否是连续签到
        if (checkinData.lastCheckinDate) {
            const lastDate = new Date(checkinData.lastCheckinDate);
            const currentDate = new Date(today);
            const diffTime = Math.abs(currentDate - lastDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            // 如果不是连续签到，重置签到天数
            if (diffDays > 1) {
                checkinData.currentDay = 1;
            }
        }
        
        // 获取当前签到类型的奖励配置
        const checkinConfig = GameConfig.CHECKIN[checkinData.type];
        if (!checkinConfig) {
            return { success: false, message: '签到配置不存在' };
        }
        
        // 确保当前天数不超过配置的天数
        if (checkinData.currentDay > checkinConfig.length) {
            // 如果是新手签到完成，切换到日常签到
            if (checkinData.type === 'newbie') {
                checkinData.type = 'daily';
                checkinData.currentDay = 1;
            } else {
                // 日常签到循环
                checkinData.currentDay = 1;
            }
        }
        
        // 获取当天的签到奖励
        const dayReward = checkinConfig.find(item => item.day === checkinData.currentDay);
        if (!dayReward) {
            return { success: false, message: '签到奖励配置不存在' };
        }
        
        // 发放奖励
        for (const item of dayReward.items) {
            this.addItemToInventory(item);
        }
        
        // 更新签到数据
        checkinData.lastCheckinDate = today;
        checkinData.currentDay++;
        
        // 检查新手签到是否完成
        if (checkinData.type === 'newbie' && checkinData.currentDay > checkinConfig.length) {
            checkinData.newbieCompleted = true;
            checkinData.type = 'daily';
            checkinData.currentDay = 1;
        }
        
        this.engine.state.save();
        
        return { success: true, message: '签到成功' };
    }

    /**
     * 获取当前签到信息
     * @returns {Object} 签到信息
     */
    getCheckinInfo() {
        const checkinData = this.engine.state.data.checkin;
        const checkinConfig = GameConfig.CHECKIN[checkinData.type];
        
        // 计算下一次签到的奖励
        let nextDay = checkinData.currentDay;
        let nextReward = null;
        
        if (checkinConfig) {
            if (nextDay > checkinConfig.length) {
                if (checkinData.type === 'newbie') {
                    nextDay = 1;
                    nextReward = GameConfig.CHECKIN.daily[0];
                } else {
                    nextDay = 1;
                    nextReward = checkinConfig[0];
                }
            } else {
                nextReward = checkinConfig.find(item => item.day === nextDay);
            }
        }
        
        return {
            type: checkinData.type,
            currentDay: checkinData.currentDay,
            lastCheckinDate: checkinData.lastCheckinDate,
            newbieCompleted: checkinData.newbieCompleted,
            canCheckin: this.canCheckin(),
            nextReward: nextReward
        };
    }

    /**
     * 添加物品到背包
     * @param {Object} item - 物品信息
     * @returns {boolean} 是否添加成功
     */
    addItemToInventory(item) {
        // 从统一物品表获取物品配置
        const itemConfig = GameConfig.ITEMS.getItem(item.id);
        
        if (!itemConfig) {
            console.warn(`物品配置不存在: ${item.id}`);
            return false;
        }
        
        // 根据物品类型处理
        if (itemConfig.type === 'resource') {
            // 资源类物品直接添加到资源
            if (item.id === 'spirit_stone') {
                this.engine.state.data.resources.spiritStone += item.quantity;
            } else if (item.id === 'immortal_stone') {
                this.engine.state.data.resources.immortalStone += item.quantity;
                // 更新仙晶统计数据
                if (this.engine.achievementSystem) {
                    this.engine.achievementSystem.updateStats('immortalStone', item.quantity);
                }
            } else if (item.id === 'contribution') {
                this.engine.state.data.resources.contribution += item.quantity;
            }
            return true;
        } else if (itemConfig.type === 'consumable' || itemConfig.type === 'special') {
            // 消耗品和特殊物品添加到背包
            if (!this.engine.state.data.backpack.items) {
                this.engine.state.data.backpack.items = [];
            }
            
            // 检查是否已有该物品（可堆叠物品）
            if (itemConfig.stackable) {
                const existingItem = this.engine.state.data.backpack.items.find(i => i.id === item.id);
                if (existingItem) {
                    // 检查是否超过最大堆叠数量
                    const newQuantity = existingItem.quantity + item.quantity;
                    if (newQuantity <= itemConfig.maxStack) {
                        existingItem.quantity = newQuantity;
                    } else {
                        // 超过最大堆叠数量，创建新的堆叠
                        existingItem.quantity = itemConfig.maxStack;
                        const remaining = newQuantity - itemConfig.maxStack;
                        if (remaining > 0) {
                            this.engine.state.data.backpack.items.push({
                                id: item.id,
                                name: itemConfig.name,
                                quantity: remaining,
                                type: itemConfig.type,
                                subType: itemConfig.subType || null,
                                icon: itemConfig.icon,
                                description: itemConfig.description
                            });
                        }
                    }
                } else {
                    // 创建新的物品堆叠
                    this.engine.state.data.backpack.items.push({
                        id: item.id,
                        name: itemConfig.name,
                        quantity: Math.min(item.quantity, itemConfig.maxStack),
                        type: itemConfig.type,
                        subType: itemConfig.subType || null,
                        icon: itemConfig.icon,
                        description: itemConfig.description
                    });
                }
            } else {
                // 不可堆叠物品，直接添加
                this.engine.state.data.backpack.items.push({
                    id: item.id,
                    name: itemConfig.name,
                    quantity: item.quantity,
                    type: itemConfig.type,
                    subType: itemConfig.subType || null,
                    icon: itemConfig.icon,
                    description: itemConfig.description
                });
            }
            return true;
        }
        
        return false;
    }
}

// 兼容模块导出和全局变量
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CheckinSystem;
} else if (typeof window !== 'undefined') {
    window.CheckinSystem = CheckinSystem;
}
