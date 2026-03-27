/**
 * 颜色管理模块
 * 统一管理游戏中所有品质的颜色配置
 * @version 1.0.0
 */

class ColorManager {
    constructor() {
        this.qualityColors = {};
        this.initialized = false;
    }

    /**
     * 初始化颜色管理器
     * @param {Object} csvLoader - CSV加载器实例
     */
    async init(csvLoader) {
        if (this.initialized) return;

        // 从CSV加载品质颜色配置
        const qualityColorsData = await csvLoader.loadCSV('quality_colors.csv');
        this.qualityColors = qualityColorsData.reduce((map, item) => {
            map[item.quality_id] = item.color;
            return map;
        }, {});

        this.initialized = true;
    }

    /**
     * 获取品质颜色
     * @param {number|string} qualityId - 品质ID或品质名称
     * @returns {string} 颜色代码
     */
    getQualityColor(qualityId) {
        if (!this.initialized) {
            console.warn('ColorManager not initialized');
            return '#9e9e9e'; // 默认灰色
        }

        // 如果是数字ID，直接返回颜色
        if (typeof qualityId === 'number' || !isNaN(qualityId)) {
            return this.qualityColors[qualityId] || '#9e9e9e';
        }

        // 如果是字符串，进行映射
        return this.mapQualityNameToColor(qualityId);
    }

    /**
     * 将品质名称映射为颜色
     * @param {string} qualityName - 品质名称
     * @returns {string} 颜色代码
     */
    mapQualityNameToColor(qualityName) {
        const qualityMap = {
            // 装备品质
            'common': 1,
            'good': 2,
            'fine': 3,
            'exquisite': 4,
            'divine': 5,
            
            // 灵根品质
            '凡品': 1,
            '良品': 2,
            '精品': 3,
            '绝品': 4,
            '神品': 5,
            
            // 功法品质
            '凡品': 1,
            '良品': 2,
            '精品': 3,
            '绝品': 4,
            '神品': 5,
            
            // 灵宠稀有度
            '普通': 1,
            '稀有': 2,
            '史诗': 3,
            '传说': 6,
            '神话': 7,
            
            // 跟脚品质
            'mortal': 1,
            'postnatal': 1,
            'innate_spirit': 2,
            'innate_demon': 3,
            'innate_divine': 7,
            'pangu': 5,
            'chaos': 6
        };

        const qualityId = qualityMap[qualityName];
        return this.qualityColors[qualityId] || '#9e9e9e';
    }

    /**
     * 获取装备颜色
     * @param {string} quality - 装备品质
     * @returns {string} 颜色代码
     */
    getEquipmentColor(quality) {
        const map = {
            'common': 1,
            'good': 2,
            'fine': 3,
            'exquisite': 4,
            'divine': 5
        };
        return this.qualityColors[map[quality]] || '#9e9e9e';
    }

    /**
     * 获取灵根颜色
     * @param {string} quality - 灵根品质
     * @returns {string} 颜色代码
     */
    getSpiritRootColor(quality) {
        const map = {
            'common': 1,
            'good': 2,
            'fine': 3,
            'exquisite': 4,
            'divine': 5
        };
        return this.qualityColors[map[quality]] || '#9e9e9e';
    }

    /**
     * 获取功法颜色
     * @param {string} quality - 功法品质
     * @returns {string} 颜色代码
     */
    getSkillColor(quality) {
        const map = {
            'common': 1,
            'good': 2,
            'fine': 3,
            'exquisite': 4,
            'divine': 5
        };
        return this.qualityColors[map[quality]] || '#9e9e9e';
    }

    /**
     * 获取灵宠颜色
     * @param {string} rarity - 灵宠稀有度
     * @returns {string} 颜色代码
     */
    getPetColor(rarity) {
        const map = {
            '普通': 1,
            '稀有': 2,
            '史诗': 3,
            '传说': 6,
            '神话': 7
        };
        return this.qualityColors[map[rarity]] || '#9e9e9e';
    }

    /**
     * 获取跟脚颜色
     * @param {string} quality - 跟脚品质
     * @returns {string} 颜色代码
     */
    getGenJiaoColor(quality) {
        const map = {
            'mortal': 1,
            'postnatal': 1,
            'innate_spirit': 2,
            'innate_demon': 3,
            'innate_divine': 7,
            'pangu': 5,
            'chaos': 6
        };
        return this.qualityColors[map[quality]] || '#9e9e9e';
    }

    /**
     * 检查是否初始化
     * @returns {boolean} 是否已初始化
     */
    isInitialized() {
        return this.initialized;
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ColorManager;
}
