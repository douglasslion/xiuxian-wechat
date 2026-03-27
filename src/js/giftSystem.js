/**
 * 礼包系统模块
 * 处理礼包的获取、购买、限制检查等功能
 * @version 1.0.0
 */

class GiftSystem {
    constructor(gameEngine) {
        this.engine = gameEngine;
        this.init();
    }

    /**
     * 初始化礼包系统
     */
    init() {
        // 确保游戏状态中有礼包相关的数据
        if (!this.engine.state.data.gifts) {
            this.engine.state.data.gifts = {
                purchased: {}, // 记录已购买的礼包
                lastResetTime: new Date().toDateString() // 上次重置购买次数的日期
            };
        }
    }

    /**
     * 获取当前可领取的礼包列表
     * @returns {Array} 可领取的礼包列表
     */
    getAvailableGifts() {
        const now = new Date();
        const gifts = GameConfig.GIFT.gifts;
        const availableGifts = [];

        // 检查是否需要重置每日购买次数
        this.checkAndResetDailyLimits();

        for (const gift of gifts) {
            // 检查时间是否在有效期内
            const startTime = new Date(gift.startTime);
            const endTime = new Date(gift.endTime);
            
            if (now >= startTime && now <= endTime) {
                // 检查购买限制
                const purchaseInfo = this.getPurchaseInfo(gift.id);
                const canPurchase = this.canPurchaseGift(gift, purchaseInfo);
                
                availableGifts.push({
                    ...gift,
                    canPurchase,
                    purchaseInfo
                });
            }
        }

        return availableGifts;
    }

    /**
     * 检查是否需要重置每日购买次数
     */
    checkAndResetDailyLimits() {
        const today = new Date().toDateString();
        const lastResetTime = this.engine.state.data.gifts.lastResetTime;

        if (today !== lastResetTime) {
            // 重置每日购买次数
            const purchased = this.engine.state.data.gifts.purchased;
            for (const giftId in purchased) {
                purchased[giftId].dailyCount = 0;
            }
            this.engine.state.data.gifts.lastResetTime = today;
            this.engine.state.save();
        }
    }

    /**
     * 获取礼包的购买信息
     * @param {string} giftId - 礼包ID
     * @returns {Object} 购买信息
     */
    getPurchaseInfo(giftId) {
        const purchased = this.engine.state.data.gifts.purchased;
        if (!purchased[giftId]) {
            purchased[giftId] = {
                dailyCount: 0,
                totalCount: 0
            };
        }
        return purchased[giftId];
    }

    /**
     * 检查是否可以购买礼包
     * @param {Object} gift - 礼包信息
     * @param {Object} purchaseInfo - 购买信息
     * @returns {boolean} 是否可以购买
     */
    canPurchaseGift(gift, purchaseInfo) {
        // 检查每日购买次数
        if (gift.limit.daily > 0 && purchaseInfo.dailyCount >= gift.limit.daily) {
            return false;
        }

        // 检查总购买次数
        if (gift.limit.total > 0 && purchaseInfo.totalCount >= gift.limit.total) {
            return false;
        }

        // 检查是否有足够的资源购买
        if (gift.type === 'spiritStone' && this.engine.state.data.resources.spiritStone < gift.price) {
            return false;
        }

        if (gift.type === 'immortalStone' && this.engine.state.data.resources.immortalStone < gift.price) {
            return false;
        }

        // 人民币礼包暂时直接返回可以购买
        return true;
    }

    /**
     * 购买礼包
     * @param {string} giftId - 礼包ID
     * @returns {Object} 购买结果
     */
    purchaseGift(giftId) {
        const gifts = GameConfig.GIFT.gifts;
        const gift = gifts.find(g => g.id === giftId);
        
        if (!gift) {
            return { success: false, message: '礼包不存在' };
        }

        // 检查时间是否在有效期内
        const now = new Date();
        const startTime = new Date(gift.startTime);
        const endTime = new Date(gift.endTime);
        
        if (now < startTime || now > endTime) {
            return { success: false, message: '礼包不在有效期内' };
        }

        // 检查购买限制
        const purchaseInfo = this.getPurchaseInfo(giftId);
        if (!this.canPurchaseGift(gift, purchaseInfo)) {
            return { success: false, message: '礼包购买次数已达上限' };
        }

        // 扣除资源
        if (gift.type === 'spiritStone') {
            this.engine.state.data.resources.spiritStone -= gift.price;
        } else if (gift.type === 'immortalStone') {
            this.engine.state.data.resources.immortalStone -= gift.price;
        }

        // 发放物品
        for (const item of gift.items) {
            this.addItemToInventory(item);
        }

        // 更新购买次数
        purchaseInfo.dailyCount++;
        purchaseInfo.totalCount++;
        this.engine.state.save();

        return { success: true, message: '购买成功' };
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

    /**
     * 检查是否有可领取的礼包
     * @returns {boolean} 是否有可领取的礼包
     */
    hasAvailableGifts() {
        const availableGifts = this.getAvailableGifts();
        return availableGifts.some(gift => gift.canPurchase);
    }
}

// 兼容模块导出和全局变量
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GiftSystem;
}