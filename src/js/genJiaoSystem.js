/**
 * 跟脚系统模块
 * 管理玩家跟脚的获取、刷新和属性加成
 * @version 1.0.0
 */

class GenJiaoSystem {
    constructor(gameState) {
        this.state = gameState;
    }

    /**
     * 获取当前跟脚信息
     * @returns {Object} 跟脚信息
     */
    getCurrentGenJiao() {
        const genJiaoData = this.state.data.genJiao || {
            quality: 'mortal',
            name: '凡人修士',
            efficiency: 0.6,
            breakthroughBonus: 0,
            refreshCount: 0,
            lastRefreshTime: null
        };
        const qualityConfig = GameConfig.GENJIAO.qualities.find(q => q.id === genJiaoData.quality);
        
        if (!qualityConfig) {
            return this.getDefaultGenJiao();
        }

        // 从游戏引擎获取颜色管理器
        let color = qualityConfig.color;
        if (window.gameEngine && window.gameEngine.colorManager) {
            color = window.gameEngine.colorManager.getGenJiaoColor(genJiaoData.quality);
        }

        return {
            ...genJiaoData,
            color: color,
            description: qualityConfig.description
        };
    }

    /**
     * 获取默认跟脚信息
     * @returns {Object} 默认跟脚
     */
    getDefaultGenJiao() {
        const qualityConfig = GameConfig.GENJIAO.qualities[0];
        
        // 从游戏引擎获取颜色管理器
        let color = qualityConfig.color;
        if (window.gameEngine && window.gameEngine.colorManager) {
            color = window.gameEngine.colorManager.getGenJiaoColor(qualityConfig.id);
        }
        
        return {
            quality: qualityConfig.id,
            name: qualityConfig.name,
            efficiency: qualityConfig.efficiency,
            breakthroughBonus: qualityConfig.breakthroughBonus,
            color: color,
            description: qualityConfig.description,
            refreshCount: 0,
            lastRefreshTime: null
        };
    }

    /**
     * 刷新跟脚
     * @param {string} refreshType - 刷新类型 (normal, ad, vip)
     * @returns {Object} 刷新结果
     */
    refreshGenJiao(refreshType) {
        const config = GameConfig.GENJIAO.refresh[refreshType];
        
        if (!config) {
            return { success: false, message: '无效的刷新类型' };
        }

        // 检查条件
        const checkResult = this.checkRefreshCondition(refreshType);
        if (!checkResult.canRefresh) {
            return { success: false, message: checkResult.reason };
        }

        // 扣除消耗
        this.deductRefreshCost(refreshType);

        // 生成新跟脚
        const newQuality = this.generateNewQuality(refreshType);
        const qualityConfig = GameConfig.GENJIAO.qualities.find(q => q.id === newQuality);

        // 更新状态
        this.state.data.genJiao = {
            quality: newQuality,
            name: qualityConfig.name,
            efficiency: qualityConfig.efficiency,
            breakthroughBonus: qualityConfig.breakthroughBonus,
            refreshCount: this.state.data.genJiao.refreshCount + 1,
            lastRefreshTime: Date.now()
        };

        this.state.save();

        return {
            success: true,
            message: `恭喜获得【${qualityConfig.name}】！`,
            genJiao: this.getCurrentGenJiao(),
            improved: this.isImproved(newQuality)
        };
    }

    /**
     * 检查刷新条件
     * @param {string} refreshType - 刷新类型
     * @returns {Object} 检查结果
     */
    checkRefreshCondition(refreshType) {
        const config = GameConfig.GENJIAO.refresh[refreshType];
        const state = this.state.data;

        switch (refreshType) {
            case 'normal':
                if (state.resources.spiritStone < config.cost) {
                    return {
                        canRefresh: false,
                        reason: `灵石不足，需要${config.cost}灵石`
                    };
                }
                break;

            case 'ad':
                // 广告刷新暂时不做限制
                break;

            case 'vip':
                // 检查VIP等级（这里暂时不实现VIP系统）
                return {
                    canRefresh: false,
                    reason: 'VIP功能暂未开放'
                };
        }

        return { canRefresh: true };
    }

    /**
     * 扣除刷新消耗
     * @param {string} refreshType - 刷新类型
     */
    deductRefreshCost(refreshType) {
        const config = GameConfig.GENJIAO.refresh[refreshType];
        const state = this.state.data;

        switch (refreshType) {
            case 'normal':
                state.resources.spiritStone -= config.cost;
                break;

            case 'ad':
                // 广告刷新暂时不扣费
                break;

            case 'vip':
                // VIP刷新暂时不扣费
                break;
        }
    }

    /**
     * 生成新跟脚品质
     * @param {string} refreshType - 刷新类型
     * @returns {string} 新品质ID
     */
    generateNewQuality(refreshType) {
        let rates;
        
        switch (refreshType) {
            case 'normal':
                rates = GameConfig.GENJIAO.refreshRates;
                break;
            case 'ad':
                rates = GameConfig.GENJIAO.adRefreshRates;
                break;
            case 'vip':
                rates = GameConfig.GENJIAO.vipRefreshRates;
                break;
            default:
                rates = GameConfig.GENJIAO.refreshRates;
        }

        const random = Math.random();
        let cumulative = 0;

        for (const [quality, rate] of Object.entries(rates)) {
            cumulative += rate;
            if (random < cumulative) {
                return quality;
            }
        }

        // 默认返回最低品质
        return 'mortal';
    }

    /**
     * 判断是否提升
     * @param {string} newQuality - 新品质
     * @returns {boolean} 是否提升
     */
    isImproved(newQuality) {
        const qualities = GameConfig.GENJIAO.qualities;
        const oldIndex = qualities.findIndex(q => q.id === this.state.data.genJiao.quality);
        const newIndex = qualities.findIndex(q => q.id === newQuality);
        return newIndex > oldIndex;
    }

    /**
     * 获取刷新选项列表
     * @returns {Array} 刷新选项
     */
    getRefreshOptions() {
        const options = [];
        const state = this.state.data;

        for (const [key, config] of Object.entries(GameConfig.GENJIAO.refresh)) {
            const option = {
                ...config,
                canUse: true,
                reason: ''
            };

            switch (key) {
                case 'normal':
                    if (state.resources.spiritStone < config.cost) {
                        option.canUse = false;
                        option.reason = `灵石不足（需要${config.cost}）`;
                    }
                    break;

                case 'ad':
                    // 广告刷新暂时可用
                    break;

                case 'vip':
                    option.canUse = false;
                    option.reason = 'VIP功能暂未开放';
                    break;
            }

            options.push(option);
        }

        return options;
    }

    /**
     * 获取跟脚效率加成
     * @returns {number} 效率加成
     */
    getEfficiencyBonus() {
        return this.state.data.genJiao.efficiency;
    }

    /**
     * 获取突破成功率加成
     * @returns {number} 突破成功率加成
     */
    getBreakthroughBonus() {
        return this.state.data.genJiao.breakthroughBonus;
    }
}

// 暴露GenJiaoSystem为全局变量
if (typeof window !== 'undefined') {
    window.GenJiaoSystem = GenJiaoSystem;
}
