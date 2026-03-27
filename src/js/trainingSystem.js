/**
 * 修为修炼系统模块
 * 处理修为修炼、加速和突破的核心逻辑
 * @version 2.0.0
 */

class TrainingSystem {
    constructor(gameState, gameEngine) {
        this.state = gameState;
        this.engine = gameEngine;
        this.cultivationInterval = null;
        this.bodyTrainingInterval = null;
    }

    // ==================== 修为修炼 ====================

    /**
     * 开始修为修炼
     * @returns {Object} 结果对象
     */
    startCultivation() {
        const cultivation = this.state.data.training.cultivation;

        if (cultivation.active) {
            return { success: false, message: '修炼已在进行中' };
        }

        cultivation.active = true;
        cultivation.lastGainTime = Date.now();

        // 启动定时更新
        this.startCultivationInterval();

        this.state.save();
        return { success: true, message: '开始修为修炼' };
    }

    /**
     * 停止修为修炼
     * @returns {Object} 结果对象
     */
    stopCultivation() {
        const cultivation = this.state.data.training.cultivation;

        if (!cultivation.active) {
            return { success: false, message: '当前没有进行修炼' };
        }

        // 计算并发放剩余收益
        this.calculateCultivationGains();

        // 重置状态
        cultivation.active = false;
        cultivation.lastGainTime = null;

        this.stopCultivationInterval();
        this.state.save();

        return {
            success: true,
            message: '停止修为修炼'
        };
    }

    /**
     * 切换修为修炼状态
     * @returns {Object} 结果对象
     */
    toggleCultivation() {
        const cultivation = this.state.data.training.cultivation;
        return cultivation.active ? this.stopCultivation() : this.startCultivation();
    }

    /**
     * 计算修为修炼收益
     */
    calculateCultivationGains() {
        const cultivation = this.state.data.training.cultivation;
        if (!cultivation.active || !cultivation.lastGainTime) return;

        const now = Date.now();
        const interval = this.getCultivationInterval();
        const timePassed = now - cultivation.lastGainTime;
        const intervalsPassed = Math.floor(timePassed / (interval * 1000));

        if (intervalsPassed > 0) {
            const baseExpGain = intervalsPassed * GameConfig.TRAINING.cultivation.baseExpGain;
            // 基础修炼效率 = baseExpGain
            const baseEfficiency = baseExpGain;
            // 获取功法加成
            const skillBonus = this.engine.skillSystem ? this.engine.skillSystem.calculateTotalBonus() : { cultivationSpeed: 0 };
            const skillAddition = skillBonus.cultivationSpeed || 0;
            // 获取跟脚加成
            const genJiaoAddition = this.state.data.genJiao ? (this.state.data.genJiao.efficiency - 1) : 0;
            // 当前修炼效率 = 基础修炼效率 * (跟脚加成 + 功法加成)
            const totalBonus = 1 + genJiaoAddition + skillAddition;
            const expGain = Math.round(baseEfficiency * totalBonus);
            this.state.data.realm.exp += expGain;
            cultivation.lastGainTime = now;
            cultivation.totalExpGained += expGain;
        }
    }

    /**
     * 获取当前修炼间隔（秒）
     * @returns {number} 修炼间隔
     */
    getCultivationInterval() {
        const cultivation = this.state.data.training.cultivation;
        const config = GameConfig.TRAINING.cultivation;

        // 检查是否有加速效果
        if (cultivation.accelerated && cultivation.accelerateEndTime) {
            const now = Date.now();
            if (cultivation.accelerateEndTime === -1 || now < cultivation.accelerateEndTime) {
                return config.acceleratedInterval;
            } else {
                // 加速效果已过期
                cultivation.accelerated = false;
                cultivation.accelerateEndTime = null;
            }
        }

        // 检查VIP永久加速
        if (this.state.data.player.vipLevel >= 1) {
            return config.acceleratedInterval;
        }

        return config.baseInterval;
    }

    /**
     * 获取修炼状态描述
     * @returns {string} 状态描述
     */
    getCultivationStatus() {
        const cultivation = this.state.data.training.cultivation;
        const interval = this.getCultivationInterval();
        const baseExpGain = GameConfig.TRAINING.cultivation.baseExpGain;
        // 基础修炼效率 = baseExpGain
        const baseEfficiency = baseExpGain;
        // 获取功法加成
        const skillBonus = this.engine.skillSystem ? this.engine.skillSystem.calculateTotalBonus() : { cultivationSpeed: 0 };
        const skillAddition = skillBonus.cultivationSpeed || 0;
        // 获取跟脚加成
        const genJiaoAddition = this.state.data.genJiao ? (this.state.data.genJiao.efficiency - 1) : 0;
        // 当前修炼效率 = 基础修炼效率 * (跟脚加成 + 功法加成)
        const totalBonus = 1 + genJiaoAddition + skillAddition;
        const expGain = Math.round(baseEfficiency * totalBonus);

        if (!cultivation.active) {
            return '开始修炼';
        }

        return `${expGain}点/${interval}秒`;
    }

    /**
     * 启动修为修炼定时器
     */
    startCultivationInterval() {
        if (this.cultivationInterval) return;

        const interval = this.getCultivationInterval();
        this.cultivationInterval = setInterval(() => {
            this.calculateCultivationGains();
            this.state.save();
            // 触发UI更新，无论当前是否在主界面
            if (this.engine && this.engine.uiManager) {
                this.engine.uiManager.refreshCultivationProgress();
            }
        }, interval * 1000);
    }

    /**
     * 停止修为修炼定时器
     */
    stopCultivationInterval() {
        if (this.cultivationInterval) {
            clearInterval(this.cultivationInterval);
            this.cultivationInterval = null;
        }
    }

    // ==================== 炼体修炼 ====================

    /**
     * 开始炼体
     * @returns {Object} 结果对象
     */
    startBodyTraining() {
        const bodyTraining = this.state.data.training.bodyTraining || {};

        if (bodyTraining.active) {
            return { success: false, message: '炼体已在进行中' };
        }

        // 初始化炼体状态
        if (!this.state.data.training.bodyTraining) {
            this.state.data.training.bodyTraining = {
                active: true,
                lastGainTime: Date.now(),
                totalExpGained: 0
            };
        } else {
            this.state.data.training.bodyTraining.active = true;
            this.state.data.training.bodyTraining.lastGainTime = Date.now();
        }

        // 启动定时更新
        this.startBodyTrainingInterval();

        this.state.save();
        return { success: true, message: '开始炼体' };
    }

    /**
     * 停止炼体
     * @returns {Object} 结果对象
     */
    stopBodyTraining() {
        const bodyTraining = this.state.data.training.bodyTraining || {};

        if (!bodyTraining.active) {
            return { success: false, message: '当前没有进行炼体' };
        }

        // 计算并发放剩余收益
        this.calculateBodyTrainingGains();

        // 重置状态
        this.state.data.training.bodyTraining.active = false;
        this.state.data.training.bodyTraining.lastGainTime = null;

        this.stopBodyTrainingInterval();
        this.state.save();

        return {
            success: true,
            message: '停止炼体'
        };
    }

    /**
     * 计算炼体收益
     */
    calculateBodyTrainingGains() {
        const bodyTraining = this.state.data.training.bodyTraining || {};
        if (!bodyTraining.active || !bodyTraining.lastGainTime) return;

        const now = Date.now();
        const interval = 30; // 30秒
        const timePassed = now - bodyTraining.lastGainTime;
        const intervalsPassed = Math.floor(timePassed / (interval * 1000));

        if (intervalsPassed > 0) {
            // 计算炼体效率
            const efficiency = this.engine.bodyTrainingSystem.calculateTrainingEfficiency();
            const expGain = Math.round(efficiency * 30 * intervalsPassed);
            
            // 获得炼体经验
            this.engine.bodyTrainingSystem.gainBodyExp(expGain);
            
            bodyTraining.lastGainTime = now;
            bodyTraining.totalExpGained += expGain;
        }
    }

    /**
     * 启动炼体定时器
     */
    startBodyTrainingInterval() {
        if (this.bodyTrainingInterval) return;

        const interval = 30; // 30秒
        this.bodyTrainingInterval = setInterval(() => {
            this.calculateBodyTrainingGains();
            this.state.save();
            // 触发UI更新 - 只在当前页面是炼体页面时更新
            if (this.engine && this.engine.uiManager) {
                const mainContainer = document.getElementById('main-container');
                if (mainContainer && mainContainer.querySelector('.body-training-page')) {
                    this.engine.uiManager.refreshBodyTrainingPage();
                }
            }
        }, interval * 1000);
    }

    /**
     * 停止炼体定时器
     */
    stopBodyTrainingInterval() {
        if (this.bodyTrainingInterval) {
            clearInterval(this.bodyTrainingInterval);
            this.bodyTrainingInterval = null;
        }
    }

    /**
     * 获取炼体状态描述
     * @returns {string} 状态描述
     */
    getBodyTrainingStatus() {
        const bodyTraining = this.state.data.training.bodyTraining || {};
        const efficiency = this.engine.bodyTrainingSystem.calculateTrainingEfficiency();
        const expGain = Math.round(efficiency * 30);

        if (!bodyTraining.active) {
            return '开始炼体';
        }

        return `${expGain}点/30秒`;
    }

    // ==================== 加速功能 ====================

    /**
     * 获取加速选项信息
     * @returns {Array} 加速选项列表
     */
    getSpeedOptions() {
        const cultivation = this.state.data.training.cultivation;
        const options = GameConfig.TRAINING.cultivation.speedOptions;
        const result = [];

        for (const key in options) {
            const option = options[key];
            let canUse = false;
            let reason = '';

            switch (option.costType) {
                case 'spiritStone':
                    canUse = this.state.data.resources.spiritStone >= option.cost;
                    if (!canUse) reason = '灵石不足';
                    break;
                case 'ad':
                    canUse = true; // 广告总是可用
                    break;
                case 'vip':
                    canUse = this.state.data.player.vipLevel >= option.requiredVip;
                    if (!canUse) reason = `需要VIP${option.requiredVip}`;
                    break;
            }

            result.push({
                ...option,
                canUse,
                reason
            });
        }

        return result;
    }

    /**
     * 使用加速
     * @param {string} optionId - 加速选项ID
     * @returns {Object} 结果对象
     */
    useSpeedUp(optionId) {
        const cultivation = this.state.data.training.cultivation;
        const options = GameConfig.TRAINING.cultivation.speedOptions;
        const option = options[optionId];

        if (!option) {
            return { success: false, message: '无效的加速选项' };
        }

        // 检查是否可以使用
        switch (option.costType) {
            case 'spiritStone':
                if (this.state.data.resources.spiritStone < option.cost) {
                    return { success: false, message: '灵石不足' };
                }
                this.state.data.resources.spiritStone -= option.cost;
                break;
            case 'ad':
                // 广告选项，实际使用时需要调用广告SDK
                break;
            case 'vip':
                if (this.state.data.player.vipLevel < option.requiredVip) {
                    return { success: false, message: `需要VIP${option.requiredVip}` };
                }
                break;
        }

        // 应用加速效果
        cultivation.accelerated = true;
        if (option.duration === -1) {
            // 永久加速
            cultivation.accelerateEndTime = -1;
        } else {
            // 限时加速
            const now = Date.now();
            cultivation.accelerateEndTime = now + option.duration;
        }

        // 重新启动定时器以应用新的间隔
        if (cultivation.active) {
            this.stopCultivationInterval();
            this.startCultivationInterval();
        }

        this.state.save();

        return {
            success: true,
            message: `加速成功！修炼效率翻倍`,
            duration: option.duration
        };
    }

    /**
     * 获取当前修炼效率信息
     * @returns {Object} 效率信息
     */
    getCultivationEfficiency() {
        const interval = this.getCultivationInterval();
        const baseInterval = GameConfig.TRAINING.cultivation.baseInterval;
        const baseExpGain = GameConfig.TRAINING.cultivation.baseExpGain;
        // 基础修炼效率 = baseExpGain
        const baseEfficiency = baseExpGain;
        // 获取功法加成
        const skillBonus = this.engine.skillSystem ? this.engine.skillSystem.calculateTotalBonus() : { cultivationSpeed: 0 };
        const skillAddition = skillBonus.cultivationSpeed || 0;
        // 获取跟脚加成
        const genJiaoAddition = this.state.data.genJiao ? (this.state.data.genJiao.efficiency - 1) : 0;
        // 当前修炼效率 = 基础修炼效率 * (跟脚加成 + 功法加成)
        const totalBonus = 1 + genJiaoAddition + skillAddition;
        const expGain = Math.round(baseEfficiency * totalBonus);

        return {
            currentInterval: interval,
            baseInterval: baseInterval,
            expGain: expGain,
            baseEfficiency: baseEfficiency,
            baseExpGain: baseExpGain,
            skillAddition: skillAddition,
            genJiaoAddition: genJiaoAddition,
            totalBonus: totalBonus,
            isAccelerated: interval < baseInterval,
            efficiency: baseInterval / interval
        };
    }

    // ==================== 旧版兼容方法 ====================

    /**
     * 开始洞府修炼（兼容旧版）
     * @returns {Object} 结果对象
     */
    startCaveTraining() {
        return this.startCultivation();
    }

    /**
     * 停止洞府修炼（兼容旧版）
     * @returns {Object} 结果对象
     */
    stopCaveTraining() {
        return this.stopCultivation();
    }

    /**
     * 使用时间秘法加速（兼容旧版）
     * @returns {Object} 结果对象
     */
    useTimeSecret() {
        return this.useSpeedUp('hour1');
    }

    /**
     * 恢复神识
     */
    recoverSpirit() {
        // 这里可以添加神识恢复的逻辑
        // 目前暂时作为空方法，确保代码正常运行
    }
}

// 兼容模块导出和全局变量
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TrainingSystem;
}
if (typeof global !== 'undefined') {
    global.TrainingSystem = TrainingSystem;
} else if (typeof window !== 'undefined') {
    window.TrainingSystem = TrainingSystem;
}
