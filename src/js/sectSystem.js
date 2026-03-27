/**
 * 宗门系统
 * 管理宗门相关功能，包括加入宗门、完成任务、贡献点管理等
 * @version 1.0.0
 */

class SectSystem {
    constructor(gameEngine) {
        this.engine = gameEngine;
        this.init();
    }

    /**
     * 初始化宗门系统
     */
    init() {
        // 初始化宗门数据
        if (!this.engine.state.data.sect) {
            this.engine.state.data.sect = {
                joinedSect: null, // 已加入的宗门ID
                contribution: 0, // 宗门贡献点
                memberLevel: 'servant', // 宗门成员等级
                dailyTasksCompleted: 0, // 今日完成任务数
                lastTaskReset: Date.now(), // 上次任务重置时间
                buildings: {
                    spirit_array: { level: 1, totalDonation: 0 },
                    alchemy_hall: { level: 1, totalDonation: 0 }
                },
                lastTreasureRefresh: Date.now() // 上次珍宝阁刷新时间
            };
        }
    }

    /**
     * 获取所有宗门列表
     * @returns {Array} 宗门列表
     */
    getSects() {
        return GameConfig.SECT.sects;
    }

    /**
     * 加入宗门
     * @param {string} sectId - 宗门ID
     * @returns {Object} 加入结果
     */
    joinSect(sectId) {
        const sect = GameConfig.SECT.sects.find(s => s.id === sectId);
        if (!sect) {
            return { success: false, message: '宗门不存在' };
        }

        if (this.engine.state.data.sect.joinedSect) {
            return { success: false, message: '已加入其他宗门' };
        }

        // 检查是否达到解锁境界
        const currentRealm = this.engine.state.data.realm;
        const unlockRealm = GameConfig.REALM.realms.findIndex(r => r.id === GameConfig.SECT.unlockRealm);
        if (currentRealm < unlockRealm) {
            return { success: false, message: `需要达到${GameConfig.SECT.unlockRealm}境界才能加入宗门` };
        }

        this.engine.state.data.sect.joinedSect = sectId;
        this.engine.state.data.sect.memberLevel = 'servant';
        this.engine.state.data.sect.contribution = 0;
        this.engine.state.save();

        return { success: true, message: `成功加入${sect.name}` };
    }

    /**
     * 离开宗门
     * @returns {Object} 离开结果
     */
    leaveSect() {
        if (!this.engine.state.data.sect.joinedSect) {
            return { success: false, message: '未加入宗门' };
        }

        this.engine.state.data.sect.joinedSect = null;
        this.engine.state.data.sect.memberLevel = 'servant';
        this.engine.state.data.sect.contribution = 0;
        this.engine.state.save();

        return { success: true, message: '成功离开宗门' };
    }

    /**
     * 获取当前宗门信息
     * @returns {Object|null} 宗门信息
     */
    getCurrentSect() {
        const sectId = this.engine.state.data.sect.joinedSect;
        if (!sectId) {
            return null;
        }
        return GameConfig.SECT.sects.find(s => s.id === sectId);
    }

    /**
     * 获取当前成员等级信息
     * @returns {Object} 成员等级信息
     */
    getCurrentMemberLevel() {
        const levelId = this.engine.state.data.sect.memberLevel;
        return GameConfig.SECT.memberLevels.find(level => level.id === levelId);
    }

    /**
     * 检查并更新成员等级
     */
    checkMemberLevel() {
        const contribution = this.engine.state.data.sect.contribution;
        const memberLevels = GameConfig.SECT.memberLevels;
        
        // 从高到低检查贡献点是否达到等级要求
        for (let i = memberLevels.length - 1; i >= 0; i--) {
            const level = memberLevels[i];
            if (contribution >= level.minContribution) {
                // 杂役到内门弟子可以直接晋升
                if (['servant', 'outer', 'inner'].includes(level.id)) {
                    this.engine.state.data.sect.memberLevel = level.id;
                    this.engine.state.save();
                }
                break;
            }
        }
    }

    /**
     * 每日排名分配职位
     * 注意：此方法应在每天0点调用
     */
    dailyRanking() {
        // 这里简化处理，实际应该获取所有宗门成员的贡献点并排序
        // 然后根据排名分配职位
        // 由于是单机游戏，这里只做模拟处理
        const contribution = this.engine.state.data.sect.contribution;
        
        // 只有贡献点达到10000以上才参与排名分配
        if (contribution >= 10000) {
            // 模拟排名分配
            // 实际应该根据服务器数据进行排名
            const ranking = Math.floor(Math.random() * 123) + 1; // 1-123名
            
            if (ranking === 1) {
                this.engine.state.data.sect.memberLevel = 'master';
            } else if (ranking <= 3) {
                this.engine.state.data.sect.memberLevel = 'vice_master';
            } else if (ranking <= 7) {
                this.engine.state.data.sect.memberLevel = 'protector';
            } else if (ranking <= 15) {
                this.engine.state.data.sect.memberLevel = 'elder';
            } else if (ranking <= 51) {
                this.engine.state.data.sect.memberLevel = 'personal';
            } else if (ranking <= 123) {
                this.engine.state.data.sect.memberLevel = 'true';
            }
            
            this.engine.state.save();
        }
    }

    /**
     * 获取宗门任务列表
     * @returns {Array} 任务列表
     */
    getTasks() {
        // 模拟任务列表
        const tasks = [
            {
                id: 'task_001',
                name: '采集草药',
                description: '前往采集10株草药',
                difficulty: 'low',
                reward: GameConfig.SECT.contribution.task.low,
                completed: false
            },
            {
                id: 'task_002',
                name: '消灭妖兽',
                description: '消灭5只妖兽',
                difficulty: 'medium',
                reward: GameConfig.SECT.contribution.task.medium,
                completed: false
            },
            {
                id: 'task_003',
                name: '护送物资',
                description: '护送宗门物资到指定地点',
                difficulty: 'high',
                reward: GameConfig.SECT.contribution.task.high,
                completed: false
            },
            {
                id: 'task_004',
                name: '挑战秘境',
                description: '挑战宗门秘境并获得胜利',
                difficulty: 'excellent',
                reward: GameConfig.SECT.contribution.task.excellent,
                completed: false
            }
        ];
        
        return tasks;
    }

    /**
     * 完成任务
     * @param {string} taskId - 任务ID
     * @returns {Object} 完成结果
     */
    completeTask(taskId) {
        // 检查是否已加入宗门
        if (!this.engine.state.data.sect.joinedSect) {
            return { success: false, message: '未加入宗门' };
        }
        
        // 检查今日任务完成数
        this.resetDailyTasks();
        const maxTasks = this.getCurrentMemberLevel().maxTasks;
        if (this.engine.state.data.sect.dailyTasksCompleted >= maxTasks) {
            return { success: false, message: `今日任务已达上限(${maxTasks}个)` };
        }
        
        // 模拟任务完成
        // 实际应该检查任务是否存在且未完成
        const task = this.getTasks().find(t => t.id === taskId);
        if (!task) {
            return { success: false, message: '任务不存在' };
        }
        
        // 增加贡献点
        this.engine.state.data.sect.contribution += task.reward;
        this.engine.state.data.sect.dailyTasksCompleted += 1;
        
        // 检查成员等级
        this.checkMemberLevel();
        
        this.engine.state.save();
        return { success: true, message: `任务完成，获得${task.reward}贡献点` };
    }

    /**
     * 重置每日任务
     */
    resetDailyTasks() {
        const now = Date.now();
        const lastReset = this.engine.state.data.sect.lastTaskReset;
        const resetTime = new Date(lastReset);
        const currentTime = new Date(now);
        
        // 检查是否过了0点
        if (currentTime.getDate() !== resetTime.getDate() ||
            currentTime.getMonth() !== resetTime.getMonth() ||
            currentTime.getFullYear() !== resetTime.getFullYear()) {
            this.engine.state.data.sect.dailyTasksCompleted = 0;
            this.engine.state.data.sect.lastTaskReset = now;
            this.engine.state.save();
        }
    }

    /**
     * 捐献资源提升宗门建筑
     * @param {string} buildingId - 建筑ID
     * @param {string} currency - 货币类型
     * @param {number} amount - 数量
     * @returns {Object} 捐献结果
     */
    donateToBuilding(buildingId, currency, amount) {
        // 检查是否已加入宗门
        if (!this.engine.state.data.sect.joinedSect) {
            return { success: false, message: '未加入宗门' };
        }
        
        // 检查货币是否足够
        if (!this.engine.state.hasEnoughCurrency(currency, amount)) {
            return { success: false, message: '货币不足' };
        }
        
        // 检查建筑是否存在
        const building = GameConfig.SECT.buildings.find(b => b.id === buildingId);
        if (!building) {
            return { success: false, message: '建筑不存在' };
        }
        
        // 检查建筑是否可升级
        const currentLevel = this.engine.state.data.sect.buildings[buildingId].level;
        if (currentLevel >= building.maxLevel) {
            return { success: false, message: '建筑已达最高等级' };
        }
        
        // 计算升级所需资源
        const upgradeCost = building.upgradeCost[currentLevel - 1];
        if (amount < upgradeCost) {
            return { success: false, message: `捐献数量不足，需要${upgradeCost}${currency === 'spirit_stone' ? '灵石' : '仙晶'}` };
        }
        
        // 扣除货币
        this.engine.state.deductCurrency(currency, amount);
        
        // 增加建筑总捐献
        this.engine.state.data.sect.buildings[buildingId].totalDonation += amount;
        
        // 检查是否可以升级
        if (this.engine.state.data.sect.buildings[buildingId].totalDonation >= upgradeCost) {
            this.engine.state.data.sect.buildings[buildingId].level += 1;
            this.engine.state.data.sect.buildings[buildingId].totalDonation -= upgradeCost;
        }
        
        // 计算贡献点奖励
        let contributionReward = 0;
        if (currency === 'spirit_stone') {
            contributionReward = Math.floor(amount / 100);
        } else if (currency === 'immortal_stone') {
            contributionReward = amount * 10;
        }
        
        // 增加贡献点
        this.engine.state.data.sect.contribution += contributionReward;
        
        // 检查成员等级
        this.checkMemberLevel();
        
        this.engine.state.save();
        return { success: true, message: `捐献成功，获得${contributionReward}贡献点` };
    }

    /**
     * 获取宗门建筑信息
     * @param {string} buildingId - 建筑ID
     * @returns {Object} 建筑信息
     */
    getBuildingInfo(buildingId) {
        const building = GameConfig.SECT.buildings.find(b => b.id === buildingId);
        if (!building) {
            return null;
        }
        
        // 确保 sect 数据存在
        if (!this.engine.state.data.sect) {
            this.init();
        }
        
        // 确保 buildings 对象存在
        if (!this.engine.state.data.sect.buildings) {
            this.engine.state.data.sect.buildings = {
                spirit_array: { level: 1, totalDonation: 0 },
                alchemy_hall: { level: 1, totalDonation: 0 }
            };
        }
        
        // 确保指定的建筑数据存在
        if (!this.engine.state.data.sect.buildings[buildingId]) {
            this.engine.state.data.sect.buildings[buildingId] = { level: 1, totalDonation: 0 };
        }
        
        const buildingData = this.engine.state.data.sect.buildings[buildingId];
        return {
            ...building,
            ...buildingData
        };
    }

    /**
     * 获取珍宝阁物品
     * @returns {Array} 物品列表
     */
    getTreasureHallItems() {
        // 检查是否需要刷新
        this.refreshTreasureHall();
        
        // 模拟珍宝阁物品
        return [
            {
                id: 'treasure_001',
                name: '疗伤丹',
                price: 100,
                stock: 10,
                description: '恢复生命值'
            },
            {
                id: 'treasure_002',
                name: '经验丹',
                price: 200,
                stock: 5,
                description: '增加经验'
            },
            {
                id: 'treasure_003',
                name: '强化石',
                price: 300,
                stock: 8,
                description: '用于装备强化'
            }
        ];
    }

    /**
     * 刷新珍宝阁
     */
    refreshTreasureHall() {
        const now = Date.now();
        const lastRefresh = this.engine.state.data.sect.lastTreasureRefresh;
        const refreshTime = GameConfig.SECT.buildings.find(b => b.id === 'treasure_hall').refreshTime;
        
        if (now - lastRefresh >= refreshTime) {
            this.engine.state.data.sect.lastTreasureRefresh = now;
            this.engine.state.save();
        }
    }

    /**
     * 购买珍宝阁物品
     * @param {string} itemId - 物品ID
     * @returns {Object} 购买结果
     */
    buyTreasureHallItem(itemId) {
        // 检查是否已加入宗门
        if (!this.engine.state.data.sect.joinedSect) {
            return { success: false, message: '未加入宗门' };
        }
        
        // 模拟购买逻辑
        // 实际应该检查物品是否存在且有库存
        const item = this.getTreasureHallItems().find(i => i.id === itemId);
        if (!item) {
            return { success: false, message: '物品不存在' };
        }
        
        // 检查贡献点是否足够
        if (this.engine.state.data.sect.contribution < item.price) {
            return { success: false, message: '贡献点不足' };
        }
        
        // 扣除贡献点
        this.engine.state.data.sect.contribution -= item.price;
        
        // 模拟添加物品到背包
        // 实际应该根据物品ID添加对应的物品
        this.engine.state.addItemToInventory({ id: item.id, name: item.name, type: 'consumable' }, 1);
        
        this.engine.state.save();
        return { success: true, message: '购买成功' };
    }

    /**
     * 获取藏经阁功法
     * @returns {Array} 功法列表
     */
    getScriptureHallSkills() {
        // 检查是否已加入宗门
        if (!this.engine.state.data.sect.joinedSect) {
            return [];
        }
        
        const sect = this.getCurrentSect();
        const memberLevel = this.getCurrentMemberLevel();
        
        // 模拟功法列表，实际应该根据宗门和成员等级返回不同的功法
        return [
            ...sect.uniqueSkills,
            {
                id: 'basic_attack',
                name: '基础攻击',
                description: '基础攻击技能',
                price: 500
            },
            {
                id: 'basic_defense',
                name: '基础防御',
                description: '基础防御技能',
                price: 500
            }
        ];
    }

    /**
     * 购买藏经阁功法
     * @param {string} skillId - 功法ID
     * @returns {Object} 购买结果
     */
    buyScriptureHallSkill(skillId) {
        // 检查是否已加入宗门
        if (!this.engine.state.data.sect.joinedSect) {
            return { success: false, message: '未加入宗门' };
        }
        
        // 模拟购买逻辑
        // 实际应该检查功法是否存在且符合购买条件
        const skill = this.getScriptureHallSkills().find(s => s.id === skillId);
        if (!skill) {
            return { success: false, message: '功法不存在' };
        }
        
        // 检查贡献点是否足够
        if (this.engine.state.data.sect.contribution < skill.price) {
            return { success: false, message: '贡献点不足' };
        }
        
        // 扣除贡献点
        this.engine.state.data.sect.contribution -= skill.price;
        
        // 模拟学习功法
        // 实际应该根据功法ID添加对应的技能
        this.engine.state.addSkill(skill.id, skill.name, skill.description);
        
        this.engine.state.save();
        return { success: true, message: '购买成功' };
    }
}

// 兼容模块导出和全局变量
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SectSystem;
}
if (typeof global !== 'undefined') {
    global.SectSystem = SectSystem;
} else if (typeof window !== 'undefined') {
    window.SectSystem = SectSystem;
}
