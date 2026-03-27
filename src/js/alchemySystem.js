/**
 * 丹炉系统模块
 * 处理丹药炼制、丹炉管理等功能
 * @version 1.0.0
 */

class AlchemySystem {
    constructor(gameState, gameEngine) {
        this.state = gameState;
        this.engine = gameEngine;
        this.initAlchemy();
    }

    /**
     * 初始化丹炉系统
     */
    initAlchemy() {
        // 检查alchemy是否存在且是正确的结构
        if (!this.state.data.alchemy) {
            this.state.data.alchemy = {
                furnace: {
                    level: 1, // 丹炉等级
                    name: '基础丹炉', // 丹炉名称
                    bonus: 0.1, // 丹炉加成（10%）
                    durability: 100 // 丹炉耐久度
                },
                currentCraft: null, // 当前炼制的丹药
                materials: {}, // 材料库存
               丹药: [] // 炼制的丹药
            };
        }
    }

    /**
     * 获取丹炉信息
     * @returns {Object} 丹炉信息
     */
    getFurnaceInfo() {
        return this.state.data.alchemy.furnace;
    }

    /**
     * 计算炼丹成功率
     * @param {Object} recipe - 丹药配方
     * @returns {number} 成功率（0-1）
     */
    calculateSuccessRate(recipe) {
        const baseRate = 0.1; // 基础成功率10%
        const furnaceBonus = this.state.data.alchemy.furnace.bonus;
        
        // 使用功法系统的calculateTotalBonus获取炼丹成功率加成
        let skillBonus = 0;
        if (this.engine && this.engine.skillSystem) {
            const totalBonus = this.engine.skillSystem.calculateTotalBonus();
            skillBonus = (totalBonus.alchemySuccess || 0) / 100;
        }

        // 计算总成功率，上限95%
        const totalRate = Math.min(baseRate + furnaceBonus + skillBonus, 0.95);
        return totalRate;
    }

    /**
     * 计算炼丹时间（秒）
     * @param {number} tier - 丹药阶数
     * @returns {number} 炼制时间（秒）
     */
    calculateCraftTime(tier) {
        // 基础时间：2秒/颗（一阶），每升一阶时间翻倍
        return 2 * Math.pow(2, tier - 1);
    }

    /**
     * 检查材料是否足够
     * @param {Object} recipe - 丹药配方
     * @param {number} quantity - 炼制数量
     * @returns {boolean} 是否足够
     */
    checkMaterials(recipe, quantity) {
        if (!recipe.materials) return false;

        // 材料名称到物品ID的映射
        const materialMap = {
            '草药': 'herb',
            '矿石': 'ore'
        };

        for (const [material, amount] of Object.entries(recipe.materials)) {
            const requiredAmount = amount * quantity;
            const itemId = materialMap[material];
            if (!itemId) return false;

            // 从背包中获取材料数量
            const availableAmount = this.getMaterialCountFromBackpack(itemId);
            if (availableAmount < requiredAmount) {
                return false;
            }
        }
        return true;
    }

    /**
     * 从背包获取材料数量
     * @param {string} itemId - 物品ID
     * @returns {number} 数量
     */
    getMaterialCountFromBackpack(itemId) {
        if (!this.state.data.backpack || !this.state.data.backpack.items) {
            return 0;
        }
        const item = this.state.data.backpack.items.find(i => i.id === itemId);
        return item ? (item.count || item.quantity || 0) : 0;
    }

    /**
     * 消耗材料
     * @param {Object} recipe - 丹药配方
     * @param {number} quantity - 炼制数量
     */
    consumeMaterials(recipe, quantity) {
        if (!recipe.materials) return;

        // 材料名称到物品ID的映射
        const materialMap = {
            '草药': 'herb',
            '矿石': 'ore'
        };

        for (const [material, amount] of Object.entries(recipe.materials)) {
            const requiredAmount = amount * quantity;
            const itemId = materialMap[material];
            if (!itemId) continue;

            // 从背包中消耗材料
            this.consumeMaterialFromBackpack(itemId, requiredAmount);
        }
    }

    /**
     * 从背包消耗材料
     * @param {string} itemId - 物品ID
     * @param {number} amount - 消耗数量
     */
    consumeMaterialFromBackpack(itemId, amount) {
        if (!this.state.data.backpack || !this.state.data.backpack.items) {
            return;
        }

        const itemIndex = this.state.data.backpack.items.findIndex(i => i.id === itemId);
        if (itemIndex === -1) return;

        const item = this.state.data.backpack.items[itemIndex];
        const currentCount = item.count || item.quantity || 0;
        const newCount = currentCount - amount;

        if (newCount <= 0) {
            // 数量为0，移除物品
            this.state.data.backpack.items.splice(itemIndex, 1);
        } else {
            // 更新数量
            item.count = newCount;
            item.quantity = newCount;
        }
    }

    /**
     * 开始炼制丹药
     * @param {Object} recipe - 丹药配方
     * @param {number} quantity - 炼制数量
     * @returns {Object} 结果
     */
    startCrafting(recipe, quantity) {
        // 检查是否正在炼制
        if (this.state.data.alchemy.currentCraft) {
            return { success: false, message: '丹炉正在炼制中' };
        }

        // 检查材料是否足够
        if (!this.checkMaterials(recipe, quantity)) {
            return { success: false, message: '材料不足' };
        }

        // 计算成功率
        const successRate = this.calculateSuccessRate(recipe);
        
        // 计算炼制时间
        const craftTime = this.calculateCraftTime(recipe.tier) * quantity;

        // 消耗材料
        this.consumeMaterials(recipe, quantity);

        // 设置当前炼制状态
        this.state.data.alchemy.currentCraft = {
            recipe: recipe,
            quantity: quantity,
            successRate: successRate,
            startTime: Date.now(),
            totalTime: craftTime * 1000, // 转换为毫秒
            progress: 0
        };

        this.state.save();
        return {
            success: true,
            message: `开始炼制${quantity}颗${recipe.name}`,
            successRate: successRate,
            craftTime: craftTime
        };
    }

    /**
     * 停止炼制
     * @returns {Object} 结果
     */
    stopCrafting() {
        if (!this.state.data.alchemy.currentCraft) {
            return { success: false, message: '当前没有正在炼制的丹药' };
        }

        this.state.data.alchemy.currentCraft = null;
        this.state.save();
        return { success: true, message: '停止炼制' };
    }

    /**
     * 更新炼制进度
     * @returns {Object|null} 当前炼制状态
     */
    updateCraftingProgress() {
        const currentCraft = this.state.data.alchemy.currentCraft;
        if (!currentCraft) return null;

        const now = Date.now();
        const elapsed = now - currentCraft.startTime;
        const progress = Math.min(elapsed / currentCraft.totalTime, 1);

        currentCraft.progress = progress;

        // 检查是否完成
        if (progress >= 1) {
            this.finishCrafting();
            return null;
        }

        return currentCraft;
    }

    /**
     * 完成炼制
     */
    finishCrafting() {
        const currentCraft = this.state.data.alchemy.currentCraft;
        if (!currentCraft) return;

        const { recipe, quantity, successRate } = currentCraft;

        // 计算成功数量
        let successCount = 0;
        for (let i = 0; i < quantity; i++) {
            if (Math.random() < successRate) {
                successCount++;
            }
        }

        // 添加丹药到背包系统
        if (successCount > 0) {
            // 确保背包系统已初始化
            if (!this.state.data.backpack) {
                this.state.data.backpack = { items: [] };
            }
            if (!this.state.data.backpack.items) {
                this.state.data.backpack.items = [];
            }

            // 查找背包中是否已有相同丹药
            const existingItem = this.state.data.backpack.items.find(
                item => item.id === recipe.id && item.type === 'pill'
            );

            if (existingItem) {
                // 增加数量
                existingItem.count = (existingItem.count || 0) + successCount;
                existingItem.quantity = existingItem.count;
            } else {
                // 添加新丹药到背包
                this.state.data.backpack.items.push({
                    id: recipe.id,
                    name: recipe.name,
                    type: 'pill',
                    tier: recipe.tier,
                    icon: recipe.icon,
                    count: successCount,
                    quantity: successCount,
                    effect: recipe.effect,
                    createdAt: Date.now()
                });
            }
        }

        // 清理当前炼制状态
        this.state.data.alchemy.currentCraft = null;
        
        // 更新每日任务进度
        if (this.engine && this.engine.dailyTaskSystem) {
            this.engine.dailyTaskSystem.updateTaskProgress('alchemy', successCount);
        }
        
        this.state.save();
    }

    /**
     * 获取材料列表
     * @returns {Object} 材料列表
     */
    getMaterials() {
        return this.state.data.alchemy.materials;
    }

    /**
     * 获取丹药列表
     * @returns {Array} 丹药列表
     */
    get丹药() {
        return this.state.data.alchemy.丹药;
    }

    /**
     * 添加材料
     * @param {string} material - 材料名称
     * @param {number} amount - 数量
     */
    addMaterial(material, amount) {
        this.state.data.alchemy.materials[material] = 
            (this.state.data.alchemy.materials[material] || 0) + amount;
        this.state.save();
    }

    /**
     * 使用丹药
     * @param {string} 丹药Id - 丹药ID
     * @returns {Object} 结果
     */
    use丹药(丹药Id) {
        const 丹药Index = this.state.data.alchemy.丹药.findIndex(d => d.id === 丹药Id);
        if (丹药Index === -1) {
            return { success: false, message: '丹药不存在' };
        }

        const 丹药 = this.state.data.alchemy.丹药[丹药Index];
        
        // 应用丹药效果
        if (丹药.effect) {
            // 这里可以根据丹药效果进行不同的处理
            // 例如增加修为、恢复体力等
            console.log('使用丹药:', 丹药.name, '效果:', 丹药.effect);
        }

        // 减少丹药数量
        丹药.quantity--;
        if (丹药.quantity <= 0) {
            this.state.data.alchemy.丹药.splice(丹药Index, 1);
        }

        this.state.save();
        return { success: true, message: `使用了${丹药.name}` };
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AlchemySystem;
}