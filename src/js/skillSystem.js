/**
 * 功法系统模块
 * 处理功法参悟、熟练度提升、属性加成
 * @version 2.0.0
 */

class SkillSystem {
    constructor(gameState, gameEngine) {
        this.state = gameState;
        this.engine = gameEngine;
        this.cultivationInterval = null;
        this.initSkills();
    }

    /**
     * 初始化功法系统
     */
    initSkills() {
        // 检查skills是否存在且是正确的结构
        if (!this.state.data.skills || !this.state.data.skills.list) {
            this.state.data.skills = {
                current: null,
                list: this.generateSkillList()
            };
        }
    }

    /**
     * 生成功法列表
     * @returns {Array} 功法列表
     */
    generateSkillList() {
        const skills = [];
        
        // 每种类型的功法预设3本
        const skillTypes = ['攻击', '防御', '辅助', '炼体'];
        const ranks = [0, 1, 2, 3, 4, 5, 6]; // 0: 不入流, 1: 凡级, 2: 黄级, 3: 玄级, 4: 地级, 5: 天级, 6: 混沌级
        
        skillTypes.forEach(type => {
            ranks.forEach((rank, index) => {
                skills.push({
                    id: `${type}_${rank}`,
                    name: `${this.getRankName(rank)}${type}功法`,
                    type: type,
                    rank: rank,
                    requiredRealm: Math.floor(rank * 2), // 每个品阶需要对应的境界
                    obtained: rank <= 1, // 初始获得凡级及以下品阶
                    proficiency: 0, // 0: 入门, 1: 生疏, 2: 熟练, 3: 精通, 4: 小成, 5: 大成, 6: 圆满
                    exp: 0,
                    nextLevelExp: 100,
                    progress: 0,
                    effects: this.calculateSkillEffects(type, rank, 0)
                });
            });
        });
        
        return skills;
    }

    /**
     * 获取品阶名称
     * @param {number} rank - 品阶等级
     * @returns {string} 品阶名称
     */
    getRankName(rank) {
        const names = ['不入流', '凡级', '黄级', '玄级', '地级', '天级', '混沌级'];
        return names[Math.min(rank, names.length - 1)];
    }

    /**
     * 计算功法效果
     * @param {string} type - 功法类型
     * @param {number} rank - 品阶
     * @param {number} proficiency - 熟练度
     * @returns {Object} 功法效果
     */
    calculateSkillEffects(type, rank, proficiency) {
        const baseEffect = rank * 2;
        const proficiencyBonus = proficiency * 0.5;
        const totalEffect = baseEffect + proficiencyBonus;
        
        switch (type) {
            case '攻击':
                return {
                    attack: totalEffect * 2,
                    rootBone: totalEffect * 0.5,
                    cultivationSpeed: totalEffect * 0.5
                };
            case '防御':
                return {
                    defense: totalEffect * 2,
                    rootBone: totalEffect,
                    spirit: totalEffect * 0.5
                };
            case '辅助':
                return {
                    comprehension: totalEffect,
                    agility: totalEffect * 0.5,
                    alchemySuccess: totalEffect,
                    smithingSuccess: totalEffect
                };
            case '炼体':
                return {
                    bodyStrength: totalEffect * 2,
                    defense: totalEffect * 1.5,
                    hp: totalEffect * 5,
                    bodyTrainingSpeed: totalEffect
                };
            default:
                return {};
        }
    }

    /**
     * 开始参悟功法
     * @param {string} skillId - 功法ID
     * @returns {Object} 结果
     */
    startCultivateSkill(skillId) {
        const skill = this.state.data.skills.list.find(s => s.id === skillId);
        
        if (!skill) {
            return { success: false, message: '功法不存在' };
        }
        
        if (!skill.obtained) {
            return { success: false, message: '未获得该功法' };
        }
        
        // 检查是否已经在参悟其他功法
        if (this.state.data.skills.current) {
            return { success: false, message: '正在参悟其他功法' };
        }
        
        // 检查境界是否足够
        if (!this.canCultivateSkill(skill)) {
            return { success: false, message: '境界不足' };
        }
        
        // 设置当前参悟的功法
        this.state.data.skills.current = skill;
        this.state.save();
        
        // 开始参悟定时器
        this.startCultivationInterval();
        
        return { success: true, message: `开始参悟《${skill.name}》` };
    }

    /**
     * 停止参悟功法
     * @returns {Object} 结果
     */
    stopCultivateSkill() {
        if (!this.state.data.skills.current) {
            return { success: false, message: '未在参悟功法' };
        }
        
        const skillName = this.state.data.skills.current.name;
        this.state.data.skills.current = null;
        
        // 清除定时器
        if (this.cultivationInterval) {
            clearInterval(this.cultivationInterval);
            this.cultivationInterval = null;
        }
        
        this.state.save();
        return { success: true, message: `停止参悟《${skillName}》` };
    }

    /**
     * 开始参悟定时器
     */
    startCultivationInterval() {
        if (this.cultivationInterval) {
            clearInterval(this.cultivationInterval);
        }
        
        let countdown = 30; // 30秒倒计时
        
        // 每秒更新一次倒计时
        this.cultivationInterval = setInterval(() => {
            countdown--;
            
            // 更新倒计时显示
            const countdownElement = document.getElementById('skillCultivationCountdown');
            if (countdownElement) {
                countdownElement.textContent = `参悟倒计时：${countdown}s`;
            }
            
            if (countdown <= 0) {
                // 获得参悟经验
                this.gainCultivationExp();
                // 重置倒计时
                countdown = 30;
            }
        }, 1000);
    }

    /**
     * 获得参悟经验
     */
    gainCultivationExp() {
        if (!this.state.data.skills.current) {
            return;
        }
        
        const skill = this.state.data.skills.current;
        
        // 检查是否已经达到圆满
        if (skill.proficiency >= 6) {
            return; // 已满级，不再获得经验
        }
        
        const expGain = 1000 + skill.rank * 2; // 品阶越高，获得经验越多
        
        skill.exp += expGain;
        
        // 检查是否升级
        while (skill.proficiency < 6 && skill.exp >= skill.nextLevelExp) {
            this.levelUpSkill(skill);
        }
        
        // 更新进度
        if (skill.proficiency < 6) {
            skill.progress = Math.min(100, (skill.exp / skill.nextLevelExp) * 100);
        } else {
            skill.progress = 100; // 圆满时进度为100%
        }
        
        this.state.save();
        
        // 显示获得经验的tips
        if (this.engine && this.engine.uiManager) {
            this.engine.uiManager.showNotification(`获得 ${expGain} 参悟经验`, 'info');
        }
    }

    /**
     * 功法升级
     * @param {Object} skill - 功法对象
     */
    levelUpSkill(skill) {
        // 提升熟练度
        if (skill.proficiency < 6) { // 最高圆满
            // 重置经验
            skill.exp -= skill.nextLevelExp;
            skill.proficiency++;
            
            // 增加下一级所需经验
            skill.nextLevelExp = Math.floor(skill.nextLevelExp * 1.5);
            
            // 更新功法效果
            skill.effects = this.calculateSkillEffects(skill.type, skill.rank, skill.proficiency);
            
            // 显示升级提示
            if (this.engine && this.engine.uiManager) {
                const proficiencyNames = ['入门', '生疏', '熟练', '精通', '小成', '大成', '圆满'];
                this.engine.uiManager.showNotification(`《${skill.name}》熟练度提升至 ${proficiencyNames[skill.proficiency]}`, 'success');
            }
        }
        
        // 更新进度
        if (skill.proficiency < 6) {
            skill.progress = Math.min(100, (skill.exp / skill.nextLevelExp) * 100);
        } else {
            skill.progress = 100; // 圆满时进度为100%
            skill.exp = 0; // 圆满时重置经验
            
            // 显示圆满提示
            if (this.engine && this.engine.uiManager) {
                this.engine.uiManager.showNotification(`《${skill.name}》熟练度达到圆满！`, 'success');
            }
        }
    }

    /**
     * 获取功法
     * @param {string} skillId - 功法ID
     * @returns {Object} 结果
     */
    obtainSkill(skillId) {
        const skill = this.state.data.skills.list.find(s => s.id === skillId);
        
        if (!skill) {
            return { success: false, message: '功法不存在' };
        }
        
        if (skill.obtained) {
            return { success: false, message: '已获得该功法' };
        }
        
        // 检查境界是否足够
        if (!this.canCultivateSkill(skill)) {
            return { success: false, message: '境界不足' };
        }
        
        // 标记为已获得
        skill.obtained = true;
        skill.proficiency = 0;
        skill.exp = 0;
        skill.nextLevelExp = 100;
        skill.progress = 0;
        skill.effects = this.calculateSkillEffects(skill.type, skill.rank, 0);
        
        this.state.save();
        return { success: true, message: `获得功法《${skill.name}》` };
    }

    /**
     * 检查是否可以参悟该功法
     * @param {Object} skill - 功法对象
     * @returns {boolean} 是否可以参悟
     */
    canCultivateSkill(skill) {
        const currentRealm = this.state.data.realm.currentRealm;
        return currentRealm >= skill.requiredRealm;
    }

    /**
     * 计算所有功法的总属性加成
     * @returns {Object} 总属性加成
     */
    calculateTotalBonus() {
        const bonus = {
            rootBone: 0,
            agility: 0,
            comprehension: 0,
            attack: 0,
            defense: 0,
            spirit: 0,
            cultivationSpeed: 0,
            alchemySuccess: 0,
            smithingSuccess: 0
        };
        
        if (!this.state.data.skills || !this.state.data.skills.list) {
            return bonus;
        }
        
        this.state.data.skills.list.forEach(skill => {
            if (skill.obtained) {
                const effects = skill.effects;
                for (const [key, value] of Object.entries(effects)) {
                    if (bonus.hasOwnProperty(key)) {
                        bonus[key] += value;
                    }
                }
            }
        });
        
        return bonus;
    }

    /**
     * 获取已获得的功法
     * @returns {Array} 已获得的功法列表
     */
    getLearnedSkills() {
        if (!this.state.data.skills || !this.state.data.skills.list) {
            return [];
        }
        
        const skills = this.state.data.skills.list
            .filter(skill => skill.obtained)
            .map(skill => {
                // 从游戏引擎获取颜色管理器
                let qualityColor = '#9e9e9e'; // 默认灰色
                if (window.gameEngine && window.gameEngine.colorManager) {
                    // 将rank映射到品质ID
                    const qualityMap = {
                        0: 1, // 不入流
                        1: 1, // 凡级
                        2: 2, // 黄级
                        3: 3, // 玄级
                        4: 4, // 地级
                        5: 5, // 天级
                        6: 7  // 混沌级
                    };
                    qualityColor = window.gameEngine.colorManager.getQualityColor(qualityMap[skill.rank]);
                }
                
                return {
                    ...skill, // 保留原始技能对象的所有属性
                    level: skill.proficiency + 1, // 熟练度0对应1级
                    quality: this.getRankName(skill.rank),
                    qualityName: this.getRankName(skill.rank),
                    qualityColor: qualityColor,
                    canUpgrade: skill.proficiency < 6, // 圆满是最高等级
                };
            });
        
        console.log('排序前的技能列表:', skills);
        
        const sortedSkills = skills.sort((a, b) => {
            // 首先按是否可以升级排序（未圆满在前，圆满在后）- 最高优先级
            if (a.canUpgrade && !b.canUpgrade) return -1;
            if (!a.canUpgrade && b.canUpgrade) return 1;
            
            // 然后按品阶排序（高品阶在前）
            if (a.rank !== b.rank) return b.rank - a.rank;
            
            // 最后按熟练度排序（高熟练度在前）
            return b.proficiency - a.proficiency;
        });
        
        console.log('排序后的技能列表:', sortedSkills);
        
        return sortedSkills;
    }

    /**
     * 清理资源
     */
    destroy() {
        if (this.cultivationInterval) {
            clearInterval(this.cultivationInterval);
            this.cultivationInterval = null;
        }
    }
}

if (typeof window !== 'undefined') {
    window.SkillSystem = SkillSystem;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkillSystem;
}