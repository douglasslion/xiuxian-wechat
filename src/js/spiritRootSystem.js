/**
 * 灵根系统模块
 * 处理灵根洗练、品质提升
 * @version 1.0.0
 */

class SpiritRootSystem {
    constructor(gameState) {
        this.state = gameState;
    }

    /**
     * 洗练灵根
     * @param {boolean} useBatch - 是否批量洗练
     * @param {number} batchCount - 批量次数
     * @returns {Object} 洗练结果
     */
    washSpiritRoot(useBatch = false, batchCount = 10) {
        const costPerWash = 100; // 每次消耗灵石
        const count = useBatch ? batchCount : 1;
        const totalCost = costPerWash * count;

        // 检查资源
        if (this.state.data.resources.spiritStone < totalCost) {
            return {
                success: false,
                message: `灵石不足，需要 ${totalCost} 灵石`
            };
        }

        // 扣除灵石
        this.state.data.resources.spiritStone -= totalCost;

        const results = [];
        let bestResult = null;

        for (let i = 0; i < count; i++) {
            const result = this.generateSpiritRoot();
            results.push(result);

            // 记录最佳结果
            if (!bestResult || this.compareQuality(result.quality, bestResult.quality) > 0) {
                bestResult = result;
            }
        }

        // 应用最佳结果
        const oldRoot = { ...this.state.data.spiritRoot };
        const improved = this.compareQuality(bestResult.quality, oldRoot.quality) > 0;

        if (improved || !useBatch) {
            this.state.data.spiritRoot = bestResult;
        }

        this.state.save();

        return {
            success: true,
            message: improved ? `灵根提升至 ${bestResult.qualityName}！` : '灵根未变化',
            improved: improved,
            oldRoot: oldRoot,
            newRoot: bestResult,
            results: useBatch ? results : null,
            cost: totalCost
        };
    }

    /**
     * 生成随机灵根
     * @returns {Object} 灵根对象
     */
    generateSpiritRoot() {
        // 随机决定是否变异 (10%概率)
        const isVariant = Math.random() < 0.1;

        // 随机选择类型
        let type;
        if (isVariant) {
            const variants = GameConfig.SPIRIT_ROOT.variantTypes;
            type = variants[Math.floor(Math.random() * variants.length)];
        } else {
            const basics = GameConfig.SPIRIT_ROOT.basicTypes;
            type = basics[Math.floor(Math.random() * basics.length)];
        }

        // 随机品质（加权随机）
        const quality = this.randomQuality();
        const qualityConfig = GameConfig.SPIRIT_ROOT.qualities.find(q => q.id === quality);

        // 从游戏引擎获取颜色管理器
        let qualityColor = qualityConfig.color;
        if (window.gameEngine && window.gameEngine.colorManager) {
            qualityColor = window.gameEngine.colorManager.getSpiritRootColor(quality);
        }

        return {
            type: type.id,
            typeName: type.name,
            quality: quality,
            qualityName: qualityConfig.name,
            qualityColor: qualityColor,
            variant: isVariant,
            attribute: type.attribute,
            bonus: type.bonus + (isVariant ? 0.1 : 0),
            cultivationBonus: qualityConfig.cultivationBonus
        };
    }

    /**
     * 加权随机品质
     * @returns {string} 品质ID
     */
    randomQuality() {
        const weights = [
            { quality: 'common', weight: 50 },
            { quality: 'good', weight: 30 },
            { quality: 'fine', weight: 15 },
            { quality: 'exquisite', weight: 4 },
            { quality: 'divine', weight: 1 }
        ];

        const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
        let random = Math.random() * totalWeight;

        for (const w of weights) {
            random -= w.weight;
            if (random <= 0) {
                return w.quality;
            }
        }

        return 'common';
    }

    /**
     * 比较两个品质
     * @param {string} quality1 - 品质1
     * @param {string} quality2 - 品质2
     * @returns {number} 1: quality1更好, -1: quality2更好, 0: 相同
     */
    compareQuality(quality1, quality2) {
        const qualities = GameConfig.SPIRIT_ROOT.qualities.map(q => q.id);
        const index1 = qualities.indexOf(quality1);
        const index2 = qualities.indexOf(quality2);

        if (index1 > index2) return 1;
        if (index1 < index2) return -1;
        return 0;
    }

    /**
     * 获取当前灵根信息
     * @returns {Object} 灵根信息
     */
    getCurrentSpiritRoot() {
        const root = this.state.data.spiritRoot;
        const typeConfig = root.variant
            ? GameConfig.SPIRIT_ROOT.variantTypes.find(t => t.id === root.type)
            : GameConfig.SPIRIT_ROOT.basicTypes.find(t => t.id === root.type);
        const qualityConfig = GameConfig.SPIRIT_ROOT.qualities.find(q => q.id === root.quality);

        // 从游戏引擎获取颜色管理器
        let qualityColor = qualityConfig ? qualityConfig.color : '#9e9e9e';
        if (window.gameEngine && window.gameEngine.colorManager) {
            qualityColor = window.gameEngine.colorManager.getSpiritRootColor(root.quality);
        }

        return {
            ...root,
            typeName: typeConfig ? typeConfig.name : root.type,
            qualityName: qualityConfig ? qualityConfig.name : root.quality,
            qualityColor: qualityColor,
            cultivationBonus: qualityConfig ? qualityConfig.cultivationBonus : 0.05,
            attributeName: this.getAttributeName(typeConfig ? typeConfig.attribute : ''),
            totalBonus: this.calculateTotalBonus(root, qualityConfig)
        };
    }

    /**
     * 获取属性名称
     * @param {string} attribute - 属性ID
     * @returns {string} 属性名称
     */
    getAttributeName(attribute) {
        const names = {
            'attack': '攻击',
            'hp': '生命',
            'defense': '防御',
            'crit': '暴击',
            'resist': '抗性',
            'speed': '速度',
            'control': '控制'
        };
        return names[attribute] || attribute;
    }

    /**
     * 计算总加成
     * @param {Object} root - 灵根对象
     * @param {Object} qualityConfig - 品质配置
     * @returns {number} 总加成
     */
    calculateTotalBonus(root, qualityConfig) {
        let bonus = qualityConfig ? qualityConfig.cultivationBonus : 0.05;
        if (root.variant) {
            bonus += 0.1;
        }
        return bonus;
    }

    /**
     * 获取洗练消耗
     * @returns {number} 消耗灵石数
     */
    getWashCost() {
        return 100;
    }
}
