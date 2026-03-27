/**
 * 成就系统模块
 * 处理成就的达成检查、奖励领取等功能
 * @version 1.0.0
 */

class AchievementSystem {
    constructor(gameEngine) {
        this.engine = gameEngine;
        this.init();
    }

    /**
     * 初始化成就系统
     */
    init() {
        // 确保游戏状态中有成就相关的数据
        if (!this.engine.state.data.achievements) {
            this.engine.state.data.achievements = {
                completed: [], // 已完成的成就
                claimed: [], // 已领取奖励的成就
                stats: {
                    immortalStone: 0, // 累计获得仙晶数量
                    monsterKilled: 0, // 累计击杀怪物数量
                    equipmentObtained: {}, // 累计获得装备数量（按品质）
                    pillsCrafted: {}, // 累计炼制丹药数量（按等级）
                    staminaUsed: 0, // 累计消耗体力
                    enhanceStoneUsed: 0, // 累计消耗强化石
                    refineStoneUsed: 0, // 累计消耗洗练石
                    skillsMastered: 0 // 累计获得熟练度达到要求的功法数量
                }
            };
        }
        
        // 统计现有装备数量
        this.syncEquipmentStats();
    }
    
    /**
     * 同步装备统计数据
     */
    syncEquipmentStats() {
        const stats = this.engine.state.data.achievements.stats;
        const inventory = this.engine.state.data.equipment?.inventory || [];
        const equipped = this.engine.state.data.equipment?.equipped || {};
        
        // 重置装备统计
        stats.equipmentObtained = {};
        
        // 统计背包中的装备
        inventory.forEach(item => {
            if (item.type === 'equipment' && item.quality) {
                if (!stats.equipmentObtained[item.quality]) {
                    stats.equipmentObtained[item.quality] = 0;
                }
                stats.equipmentObtained[item.quality]++;
            }
        });
        
        // 统计已装备的装备
        Object.values(equipped).forEach(item => {
            if (item && item.quality) {
                if (!stats.equipmentObtained[item.quality]) {
                    stats.equipmentObtained[item.quality] = 0;
                }
                stats.equipmentObtained[item.quality]++;
            }
        });
    }

    /**
     * 检查所有成就的达成状态
     */
    checkAchievements() {
        const achievements = GameConfig.ACHIEVEMENT.achievements;
        const completedAchievements = this.engine.state.data.achievements.completed;
        const claimedAchievements = this.engine.state.data.achievements.claimed;
        const stats = this.engine.state.data.achievements.stats;

        console.log('checkAchievements - 开始检查成就');
        console.log('checkAchievements - 当前境界:', this.engine.state.data.realm.currentRealm);

        // 按类型分组成就
        const achievementsByType = {};
        for (const achievement of achievements) {
            if (!achievementsByType[achievement.type]) {
                achievementsByType[achievement.type] = [];
            }
            achievementsByType[achievement.type].push(achievement);
        }

        // 按顺序检查每个类型的成就
        for (const type in achievementsByType) {
            const typeAchievements = achievementsByType[type];
            // 按order排序
            typeAchievements.sort((a, b) => a.order - b.order);

            for (let i = 0; i < typeAchievements.length; i++) {
                const achievement = typeAchievements[i];
                
                // 如果成就已经完成，跳过
                if (completedAchievements.includes(achievement.id)) {
                    continue;
                }

                // 检查是否是第一个成就，或者前一个成就已经被领取
                if (i > 0) {
                    const prevAchievement = typeAchievements[i - 1];
                    if (!claimedAchievements.includes(prevAchievement.id)) {
                        // 前一个成就未被领取，跳过当前成就
                        continue;
                    }
                }

                // 检查成就条件
                if (this.checkAchievementCondition(achievement, stats)) {
                    // 成就达成
                    console.log(`checkAchievements - 成就达成: ${achievement.name}`);
                    completedAchievements.push(achievement.id);
                    this.engine.state.save();
                }
            }
        }
    }

    /**
     * 检查单个成就的达成条件
     * @param {Object} achievement - 成就信息
     * @param {Object} stats - 游戏统计数据
     * @returns {boolean} 是否达成
     */
    checkAchievementCondition(achievement, stats) {
        switch (achievement.type) {
            case 'realm':
                // 境界成就
                return this.engine.state.data.realm.currentRealm >= achievement.condition.realm;
            case 'immortalStone':
                // 仙晶成就 - 检查当前拥有的仙晶数量
                return this.engine.state.data.resources.immortalStone >= achievement.condition.amount;
            case 'monster':
                // 怪物击杀成就
                return stats.monsterKilled >= achievement.condition.amount;
            case 'equipment':
                // 装备成就
                const equipmentCount = stats.equipmentObtained[achievement.condition.quality] || 0;
                return equipmentCount >= achievement.condition.amount;
            case 'alchemy':
                // 炼丹成就
                const pillCount = stats.pillsCrafted[achievement.condition.level] || 0;
                return pillCount >= achievement.condition.amount;
            case 'stamina':
                // 体力消耗成就
                return stats.staminaUsed >= achievement.condition.amount;
            case 'enhance':
                // 强化石消耗成就
                return stats.enhanceStoneUsed >= achievement.condition.amount;
            case 'refine':
                // 洗练石消耗成就
                return stats.refineStoneUsed >= achievement.condition.amount;
            case 'skill':
                // 功法成就 - 检查功法熟练度
                const skillsData = this.engine.state.data.skills || { list: [] };
                const skillsList = skillsData.list || [];
                const masteredCount = skillsList.filter(skill => skill.proficiency >= achievement.condition.proficiency).length;
                return masteredCount >= achievement.condition.amount;
            default:
                return false;
        }
    }

    /**
     * 获取可领取奖励的成就列表
     * @returns {Array} 可领取奖励的成就列表
     */
    getClaimableAchievements() {
        const completedAchievements = this.engine.state.data.achievements.completed;
        const claimedAchievements = this.engine.state.data.achievements.claimed;
        const achievements = GameConfig.ACHIEVEMENT.achievements;

        // 筛选出已完成但未领取奖励的成就
        const claimableAchievements = achievements.filter(achievement => {
            return completedAchievements.includes(achievement.id) && !claimedAchievements.includes(achievement.id);
        });

        // 按类型分组，并按顺序排序
        const groupedAchievements = {};
        for (const achievement of claimableAchievements) {
            if (!groupedAchievements[achievement.type]) {
                groupedAchievements[achievement.type] = [];
            }
            groupedAchievements[achievement.type].push(achievement);
        }

        // 对每个类型的成就按顺序排序
        for (const type in groupedAchievements) {
            groupedAchievements[type].sort((a, b) => a.order - b.order);
        }

        return groupedAchievements;
    }

    /**
     * 领取成就奖励
     * @param {string} achievementId - 成就ID
     * @returns {Object} 领取结果
     */
    claimAchievement(achievementId) {
        const completedAchievements = this.engine.state.data.achievements.completed;
        const claimedAchievements = this.engine.state.data.achievements.claimed;
        const achievement = GameConfig.ACHIEVEMENT.achievements.find(a => a.id === achievementId);

        // 检查成就是否存在
        if (!achievement) {
            return { success: false, message: '成就不存在' };
        }

        // 检查成就是否已完成
        if (!completedAchievements.includes(achievementId)) {
            return { success: false, message: '成就尚未达成' };
        }

        // 检查成就奖励是否已领取
        if (claimedAchievements.includes(achievementId)) {
            return { success: false, message: '奖励已经领取过了' };
        }

        // 发放奖励
        for (const item of achievement.rewards) {
            this.addItemToInventory(item);
        }

        // 标记成就奖励已领取
        claimedAchievements.push(achievementId);

        // 重新检查所有成就，确保新出现的成就被检测到
        this.checkAchievements();

        this.engine.state.save();

        return { success: true, message: '领取成功' };
    }

    /**
     * 检查是否有可领取的成就奖励
     * @returns {boolean} 是否有可领取的成就奖励
     */
    hasClaimableAchievements() {
        const claimableAchievements = this.getClaimableAchievements();
        for (const type in claimableAchievements) {
            if (claimableAchievements[type].length > 0) {
                return true;
            }
        }
        return false;
    }

    /**
     * 获取所有成就的状态
     * @returns {Array} 成就状态列表
     */
    getAllAchievements() {
        const completedAchievements = this.engine.state.data.achievements.completed;
        const claimedAchievements = this.engine.state.data.achievements.claimed;
        const achievements = GameConfig.ACHIEVEMENT.achievements;

        // 按类型分组
        const groupedAchievements = {};
        for (const achievement of achievements) {
            if (!groupedAchievements[achievement.type]) {
                groupedAchievements[achievement.type] = [];
            }
            groupedAchievements[achievement.type].push({
                ...achievement,
                completed: completedAchievements.includes(achievement.id),
                claimed: claimedAchievements.includes(achievement.id)
            });
        }

        // 对每个类型的成就按顺序排序
        for (const type in groupedAchievements) {
            groupedAchievements[type].sort((a, b) => a.order - b.order);
        }

        return groupedAchievements;
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
                this.updateStats('immortalStone', item.quantity);
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
     * 更新统计数据
     * @param {string} type - 统计类型
     * @param {number} amount - 数量
     * @param {Object} extra - 额外信息
     */
    updateStats(type, amount, extra = {}) {
        const stats = this.engine.state.data.achievements.stats;

        switch (type) {
            case 'immortalStone':
                stats.immortalStone += amount;
                break;
            case 'monsterKilled':
                stats.monsterKilled += amount;
                break;
            case 'equipmentObtained':
                const quality = extra.quality || 'normal';
                if (!stats.equipmentObtained[quality]) {
                    stats.equipmentObtained[quality] = 0;
                }
                stats.equipmentObtained[quality] += amount;
                break;
            case 'pillsCrafted':
                const level = extra.level || 1;
                if (!stats.pillsCrafted[level]) {
                    stats.pillsCrafted[level] = 0;
                }
                stats.pillsCrafted[level] += amount;
                break;
            case 'staminaUsed':
                stats.staminaUsed += amount;
                break;
            case 'enhanceStoneUsed':
                stats.enhanceStoneUsed += amount;
                break;
            case 'refineStoneUsed':
                stats.refineStoneUsed += amount;
                break;
            case 'skillsMastered':
                stats.skillsMastered += amount;
                break;
        }

        // 检查成就
        this.checkAchievements();
        this.engine.state.save();
    }
}

// 兼容模块导出和全局变量
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AchievementSystem;
} else if (typeof window !== 'undefined') {
    window.AchievementSystem = AchievementSystem;
}
