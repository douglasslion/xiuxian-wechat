/**
 * 万妖塔系统
 * 负责万妖塔的挑战、扫荡、奖励发放等功能
 * @version 1.0.0
 */

class TowerSystem {
    /**
     * 构造函数
     * @param {GameEngine} gameEngine - 游戏引擎实例
     */
    constructor(gameEngine) {
        this.engine = gameEngine;
        this.config = GameConfig.TOWER;
        this.init();
    }

    /**
     * 初始化万妖塔系统
     */
    init() {
        if (!this.engine.state.data.tower) {
            this.engine.state.data.tower = {
                currentFloor: 1,           // 当前层数
                highestFloor: 1,           // 最高通关层数
                clearedFloors: [],         // 已通关的楼层
                dailyChallengeCount: 0,    // 今日挑战次数
                lastChallengeDate: null    // 上次挑战日期
            };
        }
        this.checkDailyReset();
    }

    /**
     * 检查每日重置
     */
    checkDailyReset() {
        const today = new Date().toDateString();
        if (this.engine.state.data.tower.lastChallengeDate !== today) {
            this.engine.state.data.tower.dailyChallengeCount = 0;
            this.engine.state.data.tower.lastChallengeDate = today;
            this.engine.state.save();
        }
    }

    /**
     * 获取指定楼层的怪物信息
     * @param {number} floor - 楼层数
     * @returns {Object} 怪物信息
     */
    getMonster(floor) {
        const baseMonster = this.config.baseMonster;
        let multiplier = 1;
        
        // 计算属性倍率
        for (let i = 1; i < floor; i++) {
            if (i % 10 === 0) {
                multiplier *= this.config.attributeGrowth.milestone;
            } else {
                multiplier *= this.config.attributeGrowth.normal;
            }
        }
        
        // 获取怪物名称
        let monsterName = baseMonster.name;
        for (let i = 0; i < this.config.monsterNameLevels.length; i++) {
            if (floor >= this.config.monsterNameLevels[i]) {
                monsterName = this.config.monsterNames[i];
            }
        }
        
        return {
            name: monsterName,
            level: floor,
            hp: Math.floor(baseMonster.hp * multiplier),
            attack: Math.floor(baseMonster.attack * multiplier),
            defense: Math.floor(baseMonster.defense * multiplier),
            speed: Math.floor(baseMonster.speed * multiplier)
        };
    }

    /**
     * 挑战万妖塔
     * @param {number} floor - 挑战的楼层
     * @returns {Object} 挑战结果
     */
    challenge(floor) {
        // 检查体力
        if (this.engine.state.data.training.cave.spiritPoints < this.config.staminaCost.challenge) {
            return {
                success: false,
                message: '体力不足'
            };
        }
        
        // 检查楼层是否合法
        if (floor !== this.engine.state.data.tower.currentFloor) {
            return {
                success: false,
                message: '只能挑战当前楼层'
            };
        }
        
        // 消耗体力
        this.engine.state.data.training.cave.spiritPoints -= this.config.staminaCost.challenge;
        
        // 更新体力消耗统计
        if (this.engine.achievementSystem) {
            this.engine.achievementSystem.updateStats('staminaUsed', this.config.staminaCost.challenge);
        }
        
        // 更新每日任务进度
        if (this.engine.dailyTaskSystem) {
            this.engine.dailyTaskSystem.updateTaskProgress('consumeStamina', this.config.staminaCost.challenge);
        }
        
        // 获取怪物信息
        const monster = this.getMonster(floor);
        
        // 获取玩家属性
        const playerStats = this.engine.state.data.character.attributes;
        const playerHp = playerStats.rootBone * 100;
        const playerAttack = playerStats.agility * 5 + playerStats.rootBone * 3;
        const playerDefense = playerStats.rootBone * 2;
        
        // 简单的战斗逻辑
        const battleResult = this.simulateBattle(playerHp, playerAttack, playerDefense, monster);
        
        // 更新挑战次数
        this.engine.state.data.tower.dailyChallengeCount++;
        
        if (battleResult.victory) {
            // 通关成功
            const isFirstClear = !this.engine.state.data.tower.clearedFloors.includes(floor);
            
            // 添加到已通关楼层
            if (!this.engine.state.data.tower.clearedFloors.includes(floor)) {
                this.engine.state.data.tower.clearedFloors.push(floor);
            }
            
            // 更新最高楼层
            if (floor >= this.engine.state.data.tower.highestFloor) {
                this.engine.state.data.tower.highestFloor = floor + 1;
            }
            
            // 更新当前楼层
            this.engine.state.data.tower.currentFloor = floor + 1;
            
            // 更新怪物击杀统计
            if (this.engine.achievementSystem) {
                this.engine.achievementSystem.updateStats('monsterKilled', 1);
            }
            
            // 获取奖励
            const rewards = this.getRewards(isFirstClear);
            
            // 发放奖励
            this.grantRewards(rewards);
            
            this.engine.state.save();
            
            return {
                success: true,
                victory: true,
                message: `成功击败${monster.name}，进入第${floor + 1}层`,
                monster: monster,
                rewards: rewards,
                isFirstClear: isFirstClear
            };
        } else {
            // 通关失败
            this.engine.state.save();
            
            return {
                success: true,
                victory: false,
                message: `被${monster.name}击败，请提升实力后再来`,
                monster: monster
            };
        }
    }

    /**
     * 模拟战斗
     * @param {number} playerHp - 玩家生命值
     * @param {number} playerAttack - 玩家攻击力
     * @param {number} playerDefense - 玩家防御力
     * @param {Object} monster - 怪物信息
     * @returns {Object} 战斗结果
     */
    simulateBattle(playerHp, playerAttack, playerDefense, monster) {
        let currentPlayerHp = playerHp;
        let currentMonsterHp = monster.hp;
        
        // 简单的回合制战斗
        let rounds = 0;
        const maxRounds = 100;
        
        while (currentPlayerHp > 0 && currentMonsterHp > 0 && rounds < maxRounds) {
            // 玩家攻击
            const playerDamage = Math.max(1, playerAttack - monster.defense);
            currentMonsterHp -= playerDamage;
            
            // 怪物攻击
            if (currentMonsterHp > 0) {
                const monsterDamage = Math.max(1, monster.attack - playerDefense);
                currentPlayerHp -= monsterDamage;
            }
            
            rounds++;
        }
        
        return {
            victory: currentMonsterHp <= 0,
            rounds: rounds,
            remainingHp: Math.max(0, currentPlayerHp)
        };
    }

    /**
     * 获取奖励
     * @param {boolean} isFirstClear - 是否首次通关
     * @returns {Object} 奖励信息
     */
    getRewards(isFirstClear) {
        const rewardPool = isFirstClear ? this.config.firstClearRewards : this.config.sweepRewards;
        
        // 根据权重随机选择奖励
        const totalWeight = rewardPool.reduce((sum, reward) => sum + reward.weight, 0);
        let random = Math.random() * totalWeight;
        
        for (const reward of rewardPool) {
            random -= reward.weight;
            if (random <= 0) {
                const quantity = Math.floor(
                    Math.random() * (reward.maxQuantity - reward.minQuantity + 1)
                ) + reward.minQuantity;
                
                return {
                    id: reward.id,
                    name: reward.name,
                    quantity: quantity
                };
            }
        }
        
        return null;
    }

    /**
     * 发放奖励
     * @param {Object} reward - 奖励信息
     * @returns {boolean} 是否发放成功
     */
    grantRewards(reward) {
        if (!reward) return false;
        
        // 从统一物品表获取物品配置
        const itemConfig = GameConfig.ITEMS.getItem(reward.id);
        
        if (!itemConfig) {
            console.warn(`物品配置不存在: ${reward.id}`);
            return false;
        }
        
        // 根据物品类型处理
        if (itemConfig.type === 'resource') {
            // 资源类物品直接添加到资源
            if (reward.id === 'spirit_stone') {
                this.engine.state.data.resources.spiritStone += reward.quantity;
            } else if (reward.id === 'immortal_stone') {
                this.engine.state.data.resources.immortalStone += reward.quantity;
                // 更新仙晶统计数据
                if (this.engine.achievementSystem) {
                    this.engine.achievementSystem.updateStats('immortalStone', reward.quantity);
                }
            } else if (reward.id === 'contribution') {
                this.engine.state.data.resources.contribution += reward.quantity;
            }
            return true;
        } else if (itemConfig.type === 'consumable' || itemConfig.type === 'special') {
            // 消耗品和特殊物品添加到背包
            if (!this.engine.state.data.backpack.items) {
                this.engine.state.data.backpack.items = [];
            }
            
            // 检查是否已有该物品（可堆叠物品）
            if (itemConfig.stackable) {
                const existingItem = this.engine.state.data.backpack.items.find(i => i.id === reward.id);
                if (existingItem) {
                    // 检查是否超过最大堆叠数量
                    const newQuantity = existingItem.quantity + reward.quantity;
                    if (newQuantity <= itemConfig.maxStack) {
                        existingItem.quantity = newQuantity;
                    } else {
                        // 超过最大堆叠数量，创建新的堆叠
                        existingItem.quantity = itemConfig.maxStack;
                        const remaining = newQuantity - itemConfig.maxStack;
                        if (remaining > 0) {
                            this.engine.state.data.backpack.items.push({
                                id: reward.id,
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
                        id: reward.id,
                        name: itemConfig.name,
                        quantity: Math.min(reward.quantity, itemConfig.maxStack),
                        type: itemConfig.type,
                        subType: itemConfig.subType || null,
                        icon: itemConfig.icon,
                        description: itemConfig.description
                    });
                }
            } else {
                // 不可堆叠物品，直接添加
                this.engine.state.data.backpack.items.push({
                    id: reward.id,
                    name: itemConfig.name,
                    quantity: reward.quantity,
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
     * 扫荡万妖塔
     * @param {number} floors - 扫荡的楼层数
     * @returns {Object} 扫荡结果
     */
    sweep(floors) {
        // 检查是否可以扫荡（需要看广告）
        // 这里暂时不实现广告逻辑，直接允许扫荡
        
        // 检查扫荡楼层是否合法
        const maxSweepFloor = this.engine.state.data.tower.highestFloor - 1;
        if (floors > maxSweepFloor) {
            return {
                success: false,
                message: `最多只能扫荡到第${maxSweepFloor}层`
            };
        }
        
        if (floors <= 0) {
            return {
                success: false,
                message: '请输入有效的扫荡层数'
            };
        }
        
        // 获取奖励
        const rewards = [];
        for (let i = 0; i < floors; i++) {
            const reward = this.getRewards(false);
            if (reward) {
                rewards.push(reward);
                this.grantRewards(reward);
            }
        }
        
        this.engine.state.save();
        
        return {
            success: true,
            message: `成功扫荡${floors}层`,
            rewards: rewards
        };
    }

    /**
     * 获取万妖塔信息
     * @returns {Object} 万妖塔信息
     */
    getTowerInfo() {
        return {
            currentFloor: this.engine.state.data.tower.currentFloor,
            highestFloor: this.engine.state.data.tower.highestFloor,
            clearedFloors: this.engine.state.data.tower.clearedFloors,
            dailyChallengeCount: this.engine.state.data.tower.dailyChallengeCount,
            currentMonster: this.getMonster(this.engine.state.data.tower.currentFloor)
        };
    }

    /**
     * 重置万妖塔
     * @returns {Object} 重置结果
     */
    reset() {
        this.engine.state.data.tower.currentFloor = 1;
        this.engine.state.save();
        
        return {
            success: true,
            message: '万妖塔已重置'
        };
    }
}

// 兼容模块导出和全局变量
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TowerSystem;
}
if (typeof global !== 'undefined') {
    global.TowerSystem = TowerSystem;
} else if (typeof window !== 'undefined') {
    window.TowerSystem = TowerSystem;
}
