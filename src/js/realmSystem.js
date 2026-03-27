/**
 * 境界突破系统模块
 * 处理境界提升、突破逻辑
 * @version 2.0.0
 */

class RealmSystem {
    constructor(gameState, gameEngine) {
        this.state = gameState;
        this.engine = gameEngine;
    }

    /**
     * 检查是否可以突破
     * @returns {Object} 检查结果
     */
    canBreakthrough() {
        const realm = this.state.data.realm;
        const realmConfig = this.state.getCurrentRealmConfig();
        const requiredExp = this.state.getNextRealmExp();

        // 检查修为是否足够
        if (realm.exp < requiredExp) {
            return {
                canBreakthrough: false,
                reason: '修为不足',
                required: requiredExp,
                current: realm.exp,
                missing: requiredExp - realm.exp
            };
        }

        return {
            canBreakthrough: true,
            required: requiredExp,
            current: realm.exp,
            successRate: this.calculateSuccessRate(),
            isMajorBreakthrough: this.isMajorBreakthrough()
        };
    }

    /**
     * 判断是否是大境界突破
     * @returns {boolean} 是否是大境界突破
     */
    isMajorBreakthrough() {
        const realm = this.state.data.realm;
        const realmConfig = this.state.getCurrentRealmConfig();

        // 当当前层数达到境界最大层数时，是大境界突破
        return realm.currentLayer >= realmConfig.layers;
    }

    /**
     * 计算突破成功率
     * @returns {number} 成功率 (0-1)
     */
    calculateSuccessRate() {
        const realm = this.state.data.realm;
        const realmConfig = this.state.getCurrentRealmConfig();

        // 小境界突破（炼气期层数）100%成功
        if (!this.isMajorBreakthrough()) {
            return 1.0;
        }

        // 大境界突破计算成功率
        // 基础成功率80%，每提升一个大境界减少5%
        let rate = GameConfig.REALM.baseBreakthroughRate;
        rate -= realm.currentRealm * GameConfig.REALM.breakthroughRateDecay;

        // 功法加成
        if (this.state.data.skills && this.state.data.skills.list) {
            this.state.data.skills.list.forEach(skill => {
                if (skill.obtained && skill.effects && skill.effects.breakthroughRate) {
                    rate += skill.effects.breakthroughRate * (skill.proficiency + 1);
                }
            });
        }

        // 突破丹加成（每个+1%）
        const breakthroughPills = this.getBreakthroughPillCount();
        rate += breakthroughPills * GameConfig.REALM.breakthroughPillBonus;

        // 失败次数补偿（每次失败+5%，最多+20%）
        rate += Math.min(this.state.data.realm.breakthroughAttempts * 0.05, 0.2);

        // 最高100%，超过100%就显示100%，必然突破成功
        return Math.min(rate, 1.0);
    }

    /**
     * 获取突破丹数量
     * @returns {number} 突破丹数量
     */
    getBreakthroughPillCount() {
        const pill = this.state.data.inventory.find(item => item.id === 'breakthrough_pill');
        return pill ? pill.count : 0;
    }

    /**
     * 使用突破丹
     * @param {number} count - 使用数量
     * @returns {Object} 结果对象
     */
    useBreakthroughPill(count = 1) {
        const currentCount = this.getBreakthroughPillCount();

        if (currentCount < count) {
            return { success: false, message: '突破丹不足' };
        }

        // 扣除突破丹
        const pillIndex = this.state.data.inventory.findIndex(item => item.id === 'breakthrough_pill');
        if (pillIndex !== -1) {
            this.state.data.inventory[pillIndex].count -= count;
            if (this.state.data.inventory[pillIndex].count <= 0) {
                this.state.data.inventory.splice(pillIndex, 1);
            }
        }

        this.state.save();

        const newRate = this.calculateSuccessRate();
        return {
            success: true,
            message: `使用${count}个突破丹，成功率提升${(count * GameConfig.REALM.breakthroughPillBonus * 100).toFixed(0)}%`,
            newSuccessRate: newRate
        };
    }

    /**
     * 获取突破信息（用于显示）
     * @returns {Object} 突破信息
     */
    getBreakthroughInfo() {
        const check = this.canBreakthrough();
        const realm = this.state.data.realm;
        const realmConfig = this.state.getCurrentRealmConfig();

        return {
            canBreakthrough: check.canBreakthrough,
            reason: check.reason,
            currentExp: realm.exp,
            requiredExp: check.required,
            progress: Math.min(100, Math.floor((realm.exp / check.required) * 100)),
            successRate: check.successRate,
            isMajorBreakthrough: check.isMajorBreakthrough,
            breakthroughPills: this.getBreakthroughPillCount(),
            currentRealm: realmConfig.name,
            currentLayer: realm.currentLayer,
            nextRealm: check.isMajorBreakthrough ?
                GameConfig.REALM.realms[realm.currentRealm + 1]?.name :
                `${realmConfig.name}第${realm.currentLayer + 1}层`
        };
    }

    /**
     * 执行突破
     * @returns {Object} 突破结果
     */
    breakthrough() {
        const check = this.canBreakthrough();
        if (!check.canBreakthrough) {
            return {
                success: false,
                message: check.reason,
                details: check
            };
        }

        const realm = this.state.data.realm;
        const realmConfig = this.state.getCurrentRealmConfig();
        const requiredExp = this.state.getNextRealmExp();

        // 扣除修为
        realm.exp -= requiredExp;

        // 判定突破
        const successRate = this.calculateSuccessRate();
        const roll = Math.random();

        if (roll <= successRate) {
            // 突破成功
            return this.handleBreakthroughSuccess();
        } else {
            // 突破失败
            return this.handleBreakthroughFailure();
        }
    }

    /**
     * 处理突破成功
     * @returns {Object} 结果
     */
    handleBreakthroughSuccess() {
        const realm = this.state.data.realm;
        const oldRealm = this.state.getCurrentRealmConfig();
        const isMajor = this.isMajorBreakthrough();

        // 重置失败次数
        realm.breakthroughAttempts = 0;

        // 增加属性点
        let attributePoints = 0;
        if (isMajor) {
            // 大境界突破
            realm.currentRealm++;
            realm.currentLayer = 1;
            attributePoints = 10; // 大境界突破获得10点
        } else {
            // 小境界突破（炼气期层数）
            realm.currentLayer++;
            attributePoints = 3; // 小境界突破获得3点
        }

        // 发放属性点
        this.engine.addFreePoints(attributePoints);

        this.state.data.stats.breakthroughSuccess++;
        
        // 触发成就检查
        if (this.engine.achievementSystem) {
            this.engine.achievementSystem.checkAchievements();
        }
        
        this.state.save();

        const newRealmConfig = this.state.getCurrentRealmConfig();

        return {
            success: true,
            breakthroughSuccess: true,
            isMajorBreakthrough: isMajor,
            message: `恭喜突破至${newRealmConfig.name}${isMajor ? '' : '第' + realm.currentLayer + '层'}！获得${attributePoints}点自由属性点`,
            oldRealm: oldRealm.name,
            newRealm: newRealmConfig.name,
            newLayer: realm.currentLayer,
            attributePoints: attributePoints,
            unlocks: GameConfig.REALM.unlocks[newRealmConfig.id] || []
        };
    }

    /**
     * 处理突破失败
     * @returns {Object} 结果
     */
    handleBreakthroughFailure() {
        const realm = this.state.data.realm;

        // 损失10%修为
        const loss = Math.floor(this.state.data.realm.exp * 0.1);
        this.state.data.realm.exp = Math.max(0, this.state.data.realm.exp - loss);

        realm.breakthroughAttempts++;
        this.state.data.stats.breakthroughFail++;
        this.state.save();

        return {
            success: true,
            breakthroughSuccess: false,
            message: `突破失败，损失 ${loss} 修为`,
            expLoss: loss,
            attempts: realm.breakthroughAttempts,
            nextAttemptBonus: Math.min(realm.breakthroughAttempts * 5, 20)
        };
    }

    /**
     * 获取境界进度
     * @returns {Object} 进度信息
     */
    getProgress() {
        const realm = this.state.data.realm;
        const realmConfig = this.state.getCurrentRealmConfig();
        const requiredExp = this.state.getNextRealmExp();

        const progress = Math.min(100, Math.floor((realm.exp / requiredExp) * 100));

        return {
            currentRealm: realmConfig.name,
            currentLayer: realm.currentLayer,
            currentExp: realm.exp,
            requiredExp: requiredExp,
            progress: progress,
            remaining: requiredExp - realm.exp
        };
    }

    /**
     * 获取所有境界信息
     * @returns {Array} 境界列表
     */
    getAllRealms() {
        return GameConfig.REALM.realms.map((realm, index) => ({
            ...realm,
            unlocked: index <= this.state.data.realm.currentRealm,
            current: index === this.state.data.realm.currentRealm
        }));
    }
}

// 兼容模块导出和全局变量
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RealmSystem;
}
if (typeof global !== 'undefined') {
    global.RealmSystem = RealmSystem;
} else if (typeof window !== 'undefined') {
    window.RealmSystem = RealmSystem;
}
