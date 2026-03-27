/**
 * 装备系统模块
 * 处理装备获取、强化、分解
 * @version 1.0.0
 */

class EquipmentSystem {
    constructor(gameState) {
        this.state = gameState;
    }

    /**
     * 生成随机装备
     * @param {string} slot - 装备部位
     * @param {string} quality - 品质（可选，随机生成）
     * @returns {Object} 装备对象
     */
    generateEquipment(slot, quality = null) {
        const slotConfig = GameConfig.EQUIPMENT.slots.find(s => s.id === slot);
        if (!slotConfig) {
            return null;
        }

        // 随机品质
        if (!quality) {
            quality = this.randomQuality();
        }

        const qualityConfig = GameConfig.EQUIPMENT.qualities.find(q => q.id === quality);
        const realm = this.state.data.realm.currentRealm;

        // 计算属性
        const baseValue = qualityConfig.baseStats;
        const realmMultiplier = 1 + (realm * 0.2);
        const finalValue = Math.floor(baseValue * realmMultiplier);

        // 从游戏引擎获取颜色管理器
        let qualityColor = qualityConfig.color;
        if (window.gameEngine && window.gameEngine.colorManager) {
            qualityColor = window.gameEngine.colorManager.getEquipmentColor(quality);
        }

        const equipment = {
            id: `${slot}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: this.generateEquipmentName(slot, quality),
            type: 'equipment',
            slot: slot,
            slotName: slotConfig.name,
            quality: quality,
            qualityName: qualityConfig.name,
            qualityColor: qualityColor,
            level: 0,
            stats: {},
            power: 0
        };

        // 设置主属性
        equipment.stats[slotConfig.attribute] = finalValue;
        equipment.power = this.calculatePower(equipment);

        return equipment;
    }

    /**
     * 生成装备名称
     * @param {string} slot - 部位
     * @param {string} quality - 品质
     * @returns {string} 装备名称
     */
    generateEquipmentName(slot, quality) {
        const prefixes = {
            'common': ['破旧的', '普通的'],
            'good': ['精良的', '优质的'],
            'fine': ['卓越的', '稀有的'],
            'exquisite': ['传说的', '史诗的'],
            'divine': ['神器的', '至尊的']
        };

        const names = {
            'weapon': ['长剑', '灵剑', '仙剑', '神剑'],
            'armor': ['道袍', '灵甲', '仙衣', '神甲'],
            'boots': ['布鞋', '灵靴', '仙履', '神靴'],
            'accessory': ['玉佩', '灵珠', '仙坠', '神符']
        };

        const prefix = prefixes[quality][Math.floor(Math.random() * prefixes[quality].length)];
        const name = names[slot][Math.floor(Math.random() * names[slot].length)];

        return prefix + name;
    }

    /**
     * 随机品质
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
     * 穿戴装备
     * @param {string} equipmentId - 装备ID
     * @returns {Object} 结果
     */
    equip(equipmentId) {
        // 先从背包中查找
        let equipment = this.state.data.equipment.inventory.find(item => item.id === equipmentId);
        
        // 如果背包中没有，检查是否已经穿戴
        if (!equipment) {
            for (const [slot, item] of Object.entries(this.state.data.equipment.equipped)) {
                if (item && item.id === equipmentId) {
                    return { success: false, message: '装备已经穿戴' };
                }
            }
            return { success: false, message: '装备不存在' };
        }

        if (equipment.type !== 'equipment' && equipment.type !== undefined) {
            return { success: false, message: '装备不存在' };
        }

        const slot = equipment.slot;
        const currentEquip = this.state.data.equipment.equipped[slot];

        // 如果该部位已有装备，卸下
        if (currentEquip) {
            this.unequip(slot);
        }

        // 穿戴新装备
        this.state.data.equipment.equipped[slot] = equipment;

        // 从背包移除
        const index = this.state.data.equipment.inventory.findIndex(item => item.id === equipmentId);
        this.state.data.equipment.inventory.splice(index, 1);

        this.state.save();

        return {
            success: true,
            message: `穿戴 ${equipment.name}`,
            equipment: equipment
        };
    }

    /**
     * 卸下装备
     * @param {string} slot - 部位
     * @returns {Object} 结果
     */
    unequip(slot) {
        const equipment = this.state.data.equipment.equipped[slot];
        if (!equipment) {
            return { success: false, message: '该部位没有装备' };
        }

        // 放入背包
        this.state.data.equipment.inventory.push(equipment);

        // 卸下
        this.state.data.equipment.equipped[slot] = null;

        this.state.save();

        return {
            success: true,
            message: `卸下 ${equipment.name}`,
            equipment: equipment
        };
    }

    /**
     * 强化装备
     * @param {string} slot - 部位
     * @param {number} successRate - 成功率(0-100)
     * @returns {Object} 结果
     */
    enhance(slot, successRate = 100) {
        const equipment = this.state.data.equipment.equipped[slot];
        if (!equipment) {
            return { success: false, message: '该部位没有装备' };
        }

        // 检查等级上限
        if (equipment.level >= GameConfig.EQUIPMENT.maxEnhanceLevel) {
            return { success: false, message: '装备已达最高强化等级' };
        }

        // 计算消耗
        const cost = this.getEnhanceCost(equipment.level);

        // 检查强化石
        if (!this.state.data.backpack || !this.state.data.backpack.items) {
            return {
                success: false,
                message: '背包系统未初始化'
            };
        }
        
        const stoneIndex = this.state.data.backpack.items.findIndex(item => item.id === 'enhance_stone');
        const stoneItem = stoneIndex !== -1 ? this.state.data.backpack.items[stoneIndex] : null;
        const stoneCount = stoneItem ? (stoneItem.quantity || stoneItem.count || 0) : 0;

        if (stoneCount < cost.stone) {
            return {
                success: false,
                message: `强化石不足，需要 ${cost.stone} 个`
            };
        }
        
        // 检查灵石
        if (!this.state.data.resources || this.state.data.resources.spiritStone < cost.spiritStone) {
            return {
                success: false,
                message: `灵石不足，需要 ${cost.spiritStone} 个`
            };
        }

        // 扣除强化石
        if (stoneItem.count !== undefined) {
            stoneItem.count -= cost.stone;
            // 同时更新 quantity 属性，确保两者保持一致
            stoneItem.quantity = stoneItem.count;
            if (stoneItem.count <= 0) {
                this.state.data.backpack.items.splice(stoneIndex, 1);
            }
        } else if (stoneItem.quantity !== undefined) {
            stoneItem.quantity -= cost.stone;
            // 同时更新 count 属性，确保两者保持一致
            stoneItem.count = stoneItem.quantity;
            if (stoneItem.quantity <= 0) {
                this.state.data.backpack.items.splice(stoneIndex, 1);
            }
        }
        
        // 扣除灵石
        this.state.data.resources.spiritStone -= cost.spiritStone;
        
        // 更新每日任务进度
        if (this.engine && this.engine.dailyTaskSystem) {
            this.engine.dailyTaskSystem.updateTaskProgress('consumeItem', cost.stone, '强化石');
        }

        // 判断强化是否成功
        const random = Math.random() * 100;
        const isSuccess = random <= successRate;
        
        if (isSuccess) {
            // 强化成功
            equipment.level++;

            // 提升属性
            const slotConfig = GameConfig.EQUIPMENT.slots.find(s => s.id === slot);
            
            // 在当前属性值的基础上增加10%
            equipment.stats[slotConfig.attribute] = Math.floor(equipment.stats[slotConfig.attribute] * 1.1);
            equipment.power = this.calculatePower(equipment);

            this.state.save();

            return {
                success: true,
                message: `${equipment.name} 强化至 +${equipment.level}`,
                equipment: equipment,
                isSuccess: true
            };
        } else {
            // 强化失败
            this.state.save();
            
            return {
                success: true,
                message: `${equipment.name} 强化失败`,
                equipment: equipment,
                isSuccess: false
            };
        }
    }

    /**
     * 批量强化
     * @returns {Object} 结果
     */
    batchEnhance() {
        const results = [];
        const slots = ['weapon', 'armor', 'boots', 'necklace', 'ring', 'jade', 'talisman'];

        for (const slot of slots) {
            const equipment = this.state.data.equipment.equipped[slot];
            if (equipment && equipment.level < GameConfig.EQUIPMENT.maxEnhanceLevel) {
                const result = this.enhance(slot);
                results.push(result);
            }
        }

        const successCount = results.filter(r => r.success).length;

        return {
            success: successCount > 0,
            message: `成功强化 ${successCount} 件装备`,
            results: results
        };
    }

    /**
     * 计算强化消耗
     * @param {Object} equipment - 装备对象
     * @returns {number} 强化石数量
     */
    calculateEnhanceCost(equipment) {
        return Math.floor(5 * Math.pow(GameConfig.EQUIPMENT.enhanceCostMultiplier, equipment.level));
    }

    /**
     * 获取强化消耗
     * @param {number} level - 装备等级
     * @returns {Object} 消耗对象
     */
    getEnhanceCost(level) {
        const stone = Math.floor(5 * Math.pow(GameConfig.EQUIPMENT.enhanceCostMultiplier, level));
        const spiritStone = Math.floor(100 * Math.pow(1.1, level));
        return {
            stone,
            spiritStone
        };
    }

    /**
     * 计算下一级装备属性
     * @param {Object} equipment - 装备对象
     * @returns {Object} 下一级装备属性
     */
    calculateNextLevelStats(equipment) {
        const nextLevelStats = {};
        const slotConfig = GameConfig.EQUIPMENT.slots.find(s => s.id === equipment.slot);
        
        if (slotConfig) {
            // 计算所有属性
            for (const [stat, value] of Object.entries(equipment.stats)) {
                if (stat === slotConfig.attribute) {
                    // 基础属性按10%的比例提升
                    nextLevelStats[stat] = Math.floor(value * 1.1);
                } else {
                    // 其他属性保持不变
                    nextLevelStats[stat] = value;
                }
            }
        }
        
        return nextLevelStats;
    }

    /**
     * 分解装备
     * @param {string} equipmentId - 装备ID
     * @returns {Object} 结果
     */
    decompose(equipmentId) {
        const index = this.state.data.equipment.inventory.findIndex(item => item.id === equipmentId);
        if (index === -1) {
            return { success: false, message: '装备不存在' };
        }

        const equipment = this.state.data.equipment.inventory[index];
        if (equipment.type !== 'equipment') {
            return { success: false, message: '该物品不是装备' };
        }

        // 计算返还强化石
        const qualityConfig = GameConfig.EQUIPMENT.qualities.find(q => q.id === equipment.quality);
        const baseReturn = qualityConfig.baseStats / 10;
        const enhanceReturn = equipment.level * 2;
        const totalReturn = Math.floor(baseReturn + enhanceReturn);

        // 添加强化石到背包
        this.addEnhanceStone(totalReturn);

        // 移除装备
        this.state.data.equipment.inventory.splice(index, 1);

        this.state.save();

        return {
            success: true,
            message: `分解成功，获得 ${totalReturn} 强化石`,
            gains: { enhanceStone: totalReturn }
        };
    }

    /**
     * 添加强化石
     * @param {number} count - 数量
     */
    addEnhanceStone(count) {
        // 确保背包数据结构存在
        if (!this.state.data.backpack) {
            this.state.data.backpack = {
                totalSlots: 40,
                unlockedSlots: 10,
                nextUnlockSlot: 11,
                unlockStartTime: Date.now(),
                unlockRequiredTime: 300000,
                lastOnlineTime: Date.now(),
                items: []
            };
        }
        
        if (!this.state.data.backpack.items) {
            this.state.data.backpack.items = [];
        }
        
        const stoneIndex = this.state.data.backpack.items.findIndex(item => item.id === 'enhance_stone');
        if (stoneIndex !== -1) {
            // 同时更新 count 和 quantity 属性，确保两者保持一致
            this.state.data.backpack.items[stoneIndex].count = (this.state.data.backpack.items[stoneIndex].count || 0) + count;
            this.state.data.backpack.items[stoneIndex].quantity = this.state.data.backpack.items[stoneIndex].count;
        } else {
            // 同时设置 count 和 quantity 属性
            this.state.data.backpack.items.push({
                id: 'enhance_stone',
                name: '强化石',
                type: 'material',
                count: count,
                quantity: count
            });
        }
        
        this.state.save();
    }

    /**
     * 计算装备战力
     * @param {Object} equipment - 装备对象
     * @returns {number} 战力值
     */
    calculatePower(equipment) {
        let power = 0;
        for (const [attr, value] of Object.entries(equipment.stats)) {
            switch (attr) {
                case 'attack':
                    power += value * 10;
                    break;
                case 'defense':
                    power += value * 5;
                    break;
                case 'hp':
                    power += value * 2;
                    break;
                case 'speed':
                    power += value * 3;
                    break;
            }
        }
        return Math.floor(power);
    }

    /**
     * 获取所有装备信息
     * @returns {Object} 装备信息
     */
    getAllEquipment() {
        const result = {
            equipped: {},
            inventory: []
        };

        // 已穿戴装备
        for (const [slot, equipment] of Object.entries(this.state.data.equipment.equipped)) {
            if (equipment) {
                result.equipped[slot] = {
                    ...equipment,
                    enhanceCost: this.calculateEnhanceCost(equipment),
                    canEnhance: equipment.level < GameConfig.EQUIPMENT.maxEnhanceLevel
                };
            }
        }

        // 背包中的装备 - 包含type为equipment或undefined的装备
        result.inventory = this.state.data.equipment.inventory
            .filter(item => item.type === 'equipment' || item.type === undefined)
            .map(item => ({
                ...item,
                type: item.type || 'equipment', // 确保type属性存在
                power: this.calculatePower(item),
                equipped: false
            }));
        
        // 标记已穿戴的装备
        for (const [slot, equipment] of Object.entries(this.state.data.equipment.equipped)) {
            if (equipment) {
                const inventoryIndex = result.inventory.findIndex(item => item.id === equipment.id);
                if (inventoryIndex !== -1) {
                    result.inventory[inventoryIndex].equipped = true;
                }
            }
        }

        return result;
    }

    /**
     * 计算装备的总属性加成
     * @returns {Object} 总属性加成
     */
    calculateTotalBonus() {
        const bonus = {
            rootBone: 0,
            agility: 0,
            comprehension: 0,
            attack: 0,
            defense: 0,
            hp: 0,
            speed: 0
        };
        
        if (!this.state.data.equipment || !this.state.data.equipment.equipped) {
            return bonus;
        }
        
        for (const [slot, equipment] of Object.entries(this.state.data.equipment.equipped)) {
            if (equipment && equipment.stats) {
                for (const [attr, value] of Object.entries(equipment.stats)) {
                    if (bonus.hasOwnProperty(attr)) {
                        bonus[attr] += value;
                    }
                }
            }
        }
        
        return bonus;
    }
}

// 兼容模块导出和全局变量
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EquipmentSystem;
}
if (typeof global !== 'undefined') {
    global.EquipmentSystem = EquipmentSystem;
} else if (typeof window !== 'undefined') {
    window.EquipmentSystem = EquipmentSystem;
}
