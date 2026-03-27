/**
 * 灵宠系统模块
 * 处理灵宠管理、培养等功能
 * @version 1.0.0
 */

class PetSystem {
    constructor(gameState, gameEngine) {
        this.state = gameState;
        this.engine = gameEngine;
        this.initPets();
    }

    /**
     * 初始化灵宠系统
     */
    initPets() {
        if (!this.state.data.pets) {
            this.state.data.pets = {
                list: [
                    {
                        id: 'pet1',
                        name: '小火龙',
                        icon: '🐉',
                        level: 1,
                        rarity: '普通',
                        attributes: {
                            attack: 10,
                            defense: 5,
                            hp: 50,
                            speed: 8
                        },
                        description: '一只可爱的小火龙，能够喷出火焰攻击敌人。',
                        obtained: true
                    },
                    {
                        id: 'pet2',
                        name: '小凤凰',
                        icon: '🔥',
                        level: 1,
                        rarity: '稀有',
                        attributes: {
                            attack: 15,
                            defense: 8,
                            hp: 60,
                            speed: 10
                        },
                        description: '传说中的凤凰，拥有涅槃重生的能力。',
                        obtained: true
                    },
                    {
                        id: 'pet3',
                        name: '小麒麟',
                        icon: '✨',
                        level: 1,
                        rarity: '史诗',
                        attributes: {
                            attack: 20,
                            defense: 12,
                            hp: 80,
                            speed: 12
                        },
                        description: '祥瑞之兽麒麟，能够为主人带来好运。',
                        obtained: false
                    }
                ],
                activePet: 'pet1' // 当前激活的灵宠
            };
        }
    }

    /**
     * 获取所有灵宠
     * @returns {Array} 灵宠列表
     */
    getAllPets() {
        return this.state.data.pets.list;
    }

    /**
     * 获取已获得的灵宠
     * @returns {Array} 已获得的灵宠列表
     */
    getObtainedPets() {
        return this.state.data.pets.list.filter(pet => pet.obtained);
    }

    /**
     * 获取当前激活的灵宠
     * @returns {Object|null} 当前激活的灵宠
     */
    getActivePet() {
        const petId = this.state.data.pets.activePet;
        return this.state.data.pets.list.find(pet => pet.id === petId) || null;
    }

    /**
     * 激活灵宠
     * @param {string} petId - 灵宠ID
     * @returns {Object} 结果
     */
    activatePet(petId) {
        const pet = this.state.data.pets.list.find(p => p.id === petId);
        if (!pet) {
            return { success: false, message: '灵宠不存在' };
        }
        if (!pet.obtained) {
            return { success: false, message: '灵宠未获得' };
        }
        this.state.data.pets.activePet = petId;
        this.state.save();
        return { success: true, message: `已激活灵宠 ${pet.name}` };
    }

    /**
     * 培养灵宠
     * @param {string} petId - 灵宠ID
     * @returns {Object} 结果
     */
    trainPet(petId) {
        const pet = this.state.data.pets.list.find(p => p.id === petId);
        if (!pet) {
            return { success: false, message: '灵宠不存在' };
        }
        if (!pet.obtained) {
            return { success: false, message: '灵宠未获得' };
        }

        // 培养消耗（这里简化处理，实际应该根据灵宠等级和稀有度计算）
        const cost = {
            spiritStone: pet.level * 100
        };

        // 检查资源是否足够
        if (this.state.data.resources.spiritStone < cost.spiritStone) {
            return { success: false, message: '灵石不足' };
        }

        // 消耗资源
        this.state.data.resources.spiritStone -= cost.spiritStone;

        // 提升灵宠等级
        pet.level++;

        // 提升属性
        pet.attributes.attack += Math.floor(Math.random() * 5) + 1;
        pet.attributes.defense += Math.floor(Math.random() * 3) + 1;
        pet.attributes.hp += Math.floor(Math.random() * 10) + 5;
        pet.attributes.speed += Math.floor(Math.random() * 2) + 1;

        this.state.save();
        return { 
            success: true, 
            message: `灵宠 ${pet.name} 培养成功，等级提升到 ${pet.level}`,
            cost: cost
        };
    }

    /**
     * 计算灵宠总属性加成
     * @returns {Object} 总属性加成
     */
    calculateTotalAttributes() {
        const activePet = this.getActivePet();
        if (!activePet) {
            return {
                attack: 0,
                defense: 0,
                hp: 0,
                speed: 0
            };
        }
        return activePet.attributes;
    }

    /**
     * 获取灵宠信息
     * @param {string} petId - 灵宠ID
     * @returns {Object|null} 灵宠信息
     */
    getPetInfo(petId) {
        return this.state.data.pets.list.find(pet => pet.id === petId) || null;
    }

    /**
     * 添加灵宠
     * @param {Object} pet - 灵宠信息
     */
    addPet(pet) {
        this.state.data.pets.list.push(pet);
        this.state.save();
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PetSystem;
}