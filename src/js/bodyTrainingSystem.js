/**
 * 炼体系统模块
 * 处理炼体境界提升、属性加成
 * @version 1.0.0
 */

class BodyTrainingSystem {
    constructor(gameState, gameEngine) {
        this.state = gameState;
        this.engine = gameEngine;
        this.initBodyTraining();
    }

    /**
     * 初始化炼体系统
     */
    initBodyTraining() {
        // 检查bodyTraining是否存在且是正确的结构
        if (!this.state.data.bodyTraining) {
            this.state.data.bodyTraining = {
                level: 0, // 炼体境界等级
                exp: 0, // 炼体经验
                nextLevelExp: 100, // 下一级所需经验
                attributes: {
                    bodyStrength: 0, // 肉体强度
                    defense: 0, // 防御
                    hp: 0 // 生命值
                },
                equippedSkills: [] // 装备的炼体功法
            };
        }
    }

    /**
     * 获取当前炼体境界
     * @returns {Object} 炼体境界信息
     */
    getCurrentBodyLevel() {
        const level = this.state.data.bodyTraining.level;
        return {
            level: level,
            name: this.getBodyLevelName(level),
            exp: this.state.data.bodyTraining.exp,
            nextLevelExp: this.state.data.bodyTraining.nextLevelExp
        };
    }

    /**
     * 获取炼体境界名称
     * @param {number} level - 炼体境界等级
     * @returns {string} 炼体境界名称
     */
    getBodyLevelName(level) {
        const levelNames = [
            '凡人之躯', '铜皮铁骨', '钢筋铁骨', '金刚不坏',
            '天人合一', '力拔山河', '移山填海', '翻天覆地',
            '破碎虚空', '不朽金身'
        ];
        return levelNames[level] || `炼体${level}重`;
    }

    /**
     * 获取炼体属性
     * @returns {Object} 炼体属性
     */
    getBodyAttributes() {
        return this.state.data.bodyTraining.attributes;
    }

    /**
     * 计算炼体修炼效率
     * @returns {number} 每秒修炼点数
     */
    calculateTrainingEfficiency() {
        const baseEfficiency = 1 / 30; // 基础修炼：1点/30秒
        let skillBonus = 0;

        // 计算功法加成
        const equippedSkills = this.state.data.bodyTraining.equippedSkills;
        const allSkills = this.state.data.skills ? this.state.data.skills.list : [];

        equippedSkills.forEach(skillId => {
            const skill = allSkills.find(s => s.id === skillId);
            if (skill && skill.obtained && skill.proficiency > 0) {
                // 功法加成 = 品阶 * 熟练度等级
                skillBonus += skill.rank * (skill.proficiency + 1);
            }
        });

        return baseEfficiency + (skillBonus / 30); // 转换为每秒点数
    }

    /**
     * 获得炼体经验
     * @param {number} exp - 获得的经验
     * @returns {Object} 结果
     */
    gainBodyExp(exp) {
        this.state.data.bodyTraining.exp += exp;
        let leveledUp = false;

        // 检查是否升级
        while (this.state.data.bodyTraining.exp >= this.state.data.bodyTraining.nextLevelExp) {
            this.state.data.bodyTraining.exp -= this.state.data.bodyTraining.nextLevelExp;
            this.state.data.bodyTraining.level++;
            this.state.data.bodyTraining.nextLevelExp = Math.floor(this.state.data.bodyTraining.nextLevelExp * 1.5);
            
            // 提升属性
            this.improveAttributes();
            leveledUp = true;
        }

        return {
            success: true,
            leveledUp: leveledUp,
            newLevel: this.state.data.bodyTraining.level,
            remainingExp: this.state.data.bodyTraining.exp
        };
    }

    /**
     * 提升炼体属性
     */
    improveAttributes() {
        const level = this.state.data.bodyTraining.level;
        const attributes = this.state.data.bodyTraining.attributes;
        
        // 每提升一级，属性增加
        attributes.bodyStrength += level * 2;
        attributes.defense += level * 1.5;
        attributes.hp += level * 10;
    }

    /**
     * 装备炼体功法
     * @param {string} skillId - 功法ID
     * @returns {Object} 结果
     */
    equipBodySkill(skillId) {
        const equippedSkills = this.state.data.bodyTraining.equippedSkills;
        const allSkills = this.state.data.skills ? this.state.data.skills.list : [];
        const skill = allSkills.find(s => s.id === skillId);

        if (!skill || !skill.obtained) {
            return { success: false, message: '功法不存在或未获得' };
        }

        if (equippedSkills.includes(skillId)) {
            return { success: false, message: '功法已装备' };
        }

        equippedSkills.push(skillId);
        return { success: true, message: '装备成功' };
    }

    /**
     * 卸下炼体功法
     * @param {string} skillId - 功法ID
     * @returns {Object} 结果
     */
    unequipBodySkill(skillId) {
        const equippedSkills = this.state.data.bodyTraining.equippedSkills;
        const index = equippedSkills.indexOf(skillId);

        if (index === -1) {
            return { success: false, message: '功法未装备' };
        }

        equippedSkills.splice(index, 1);
        return { success: true, message: '卸下成功' };
    }

    /**
     * 获取已装备的炼体功法
     * @returns {Array} 已装备的功法列表
     */
    getEquippedBodySkills() {
        const equippedSkills = this.state.data.bodyTraining.equippedSkills;
        const allSkills = this.state.data.skills ? this.state.data.skills.list : [];
        return allSkills.filter(skill => equippedSkills.includes(skill.id) && skill.obtained);
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BodyTrainingSystem;
}