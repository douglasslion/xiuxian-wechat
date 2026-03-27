/**
 * 每日任务系统模块
 * 处理每日任务的生成、刷新、完成等核心逻辑
 * @version 1.0.0
 */

class DailyTaskSystem {
    constructor(gameState, gameEngine) {
        this.state = gameState;
        this.engine = gameEngine;
        this.initDailyTasks();
    }

    /**
     * 初始化每日任务系统
     */
    initDailyTasks() {
        if (!this.state.data.dailyTasks) {
            this.state.data.dailyTasks = {
                tasks: [],
                lastRefreshTime: 0,
                completedTasks: 0,
                maxTasks: 5
            };
        }
        this.checkRefreshTasks();
    }

    /**
     * 检查是否需要刷新任务
     */
    checkRefreshTasks() {
        const now = Date.now();
        const lastRefresh = this.state.data.dailyTasks.lastRefreshTime;
        const nextRefresh = this.getNextRefreshTime(lastRefresh);

        if (now >= nextRefresh) {
            this.refreshTasks();
        }
    }

    /**
     * 获取下一次刷新时间（每天凌晨5点）
     * @param {number} lastRefresh - 上次刷新时间
     * @returns {number} 下一次刷新时间
     */
    getNextRefreshTime(lastRefresh) {
        const date = new Date(lastRefresh || Date.now());
        date.setHours(5, 0, 0, 0);
        if (date.getTime() <= Date.now()) {
            date.setDate(date.getDate() + 1);
        }
        return date.getTime();
    }

    /**
     * 刷新每日任务
     */
    refreshTasks() {
        this.state.data.dailyTasks.tasks = this.generateTasks();
        this.state.data.dailyTasks.lastRefreshTime = Date.now();
        this.state.data.dailyTasks.completedTasks = 0;
        this.state.save();
    }

    /**
     * 生成每日任务
     * @returns {Array} 任务列表
     */
    generateTasks() {
        const tasks = [];
        const taskTypes = ['alchemy', 'killMonster', 'dialog', 'consumeStamina', 'consumeItem'];
        
        for (let i = 0; i < this.state.data.dailyTasks.maxTasks; i++) {
            const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
            const quality = this.getRandomQuality();
            const task = this.generateTaskByType(taskType, quality);
            tasks.push(task);
        }
        
        return tasks;
    }

    /**
     * 获取随机任务品质
     * @returns {string} 品质等级
     */
    getRandomQuality() {
        const qualities = ['common', 'yellow', 'black', 'earth', 'heaven'];
        const weights = [0.4, 0.3, 0.15, 0.1, 0.05]; // 品质权重
        
        let totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < qualities.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return qualities[i];
            }
        }
        
        return 'common';
    }

    /**
     * 根据类型生成任务
     * @param {string} type - 任务类型
     * @param {string} quality - 任务品质
     * @returns {Object} 任务对象
     */
    generateTaskByType(type, quality) {
        const baseDifficulty = this.getQualityDifficulty(quality);
        
        switch (type) {
            case 'alchemy':
                return {
                    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    type: 'alchemy',
                    quality: quality,
                    title: this.getTaskTitle('alchemy', quality),
                    description: `炼制 ${Math.floor(baseDifficulty * 2)} 颗丹药`,
                    target: Math.floor(baseDifficulty * 2),
                    current: 0,
                    rewards: this.getTaskRewards(quality),
                    completed: false
                };
            
            case 'killMonster':
                return {
                    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    type: 'killMonster',
                    quality: quality,
                    title: this.getTaskTitle('killMonster', quality),
                    description: `击杀 ${Math.floor(baseDifficulty * 3)} 只怪物`,
                    target: Math.floor(baseDifficulty * 3),
                    current: 0,
                    rewards: this.getTaskRewards(quality),
                    completed: false
                };
            
            case 'dialog':
                return {
                    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    type: 'dialog',
                    quality: quality,
                    title: this.getTaskTitle('dialog', quality),
                    description: '完成一段对话剧情',
                    target: 1,
                    current: 0,
                    rewards: this.getTaskRewards(quality),
                    completed: false
                };
            
            case 'consumeStamina':
                return {
                    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    type: 'consumeStamina',
                    quality: quality,
                    title: this.getTaskTitle('consumeStamina', quality),
                    description: `消耗 ${Math.floor(baseDifficulty * 50)} 点体力`,
                    target: Math.floor(baseDifficulty * 50),
                    current: 0,
                    rewards: this.getTaskRewards(quality),
                    completed: false
                };
            
            case 'consumeItem':
                const items = ['强化石', '洗炼符'];
                const item = items[Math.floor(Math.random() * items.length)];
                return {
                    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    type: 'consumeItem',
                    quality: quality,
                    title: this.getTaskTitle('consumeItem', quality),
                    description: `消耗 ${Math.floor(baseDifficulty * 2)} 个${item}`,
                    target: Math.floor(baseDifficulty * 2),
                    current: 0,
                    item: item,
                    rewards: this.getTaskRewards(quality),
                    completed: false
                };
            
            default:
                return {
                    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    type: 'dialog',
                    quality: quality,
                    title: '日常对话',
                    description: '完成一段对话剧情',
                    target: 1,
                    current: 0,
                    rewards: this.getTaskRewards(quality),
                    completed: false
                };
        }
    }

    /**
     * 根据品质获取任务难度系数
     * @param {string} quality - 任务品质
     * @returns {number} 难度系数
     */
    getQualityDifficulty(quality) {
        const difficultyMap = {
            'common': 1,
            'yellow': 2,
            'black': 3,
            'earth': 4,
            'heaven': 5
        };
        return difficultyMap[quality] || 1;
    }

    /**
     * 获取任务标题
     * @param {string} type - 任务类型
     * @param {string} quality - 任务品质
     * @returns {string} 任务标题
     */
    getTaskTitle(type, quality) {
        const qualityNames = {
            'common': '凡品',
            'yellow': '黄品',
            'black': '玄品',
            'earth': '地品',
            'heaven': '天品'
        };
        
        const typeNames = {
            'alchemy': '炼丹',
            'killMonster': '除妖',
            'dialog': '交流',
            'consumeStamina': '修行',
            'consumeItem': '炼器'
        };
        
        return `${qualityNames[quality]}${typeNames[type]}任务`;
    }

    /**
     * 获取任务奖励
     * @param {string} quality - 任务品质
     * @returns {Object} 奖励对象
     */
    getTaskRewards(quality) {
        const baseReward = this.getQualityDifficulty(quality);
        return {
            spiritStone: Math.floor(baseReward * 100),
            immortalStone: Math.floor(baseReward * 10),
            exp: Math.floor(baseReward * 500)
        };
    }

    /**
     * 获取任务品质颜色
     * @param {string} quality - 任务品质
     * @returns {string} 颜色值
     */
    getQualityColor(quality) {
        const colorMap = {
            'common': '#999999',
            'yellow': '#FFD700',
            'black': '#333333',
            'earth': '#8B4513',
            'heaven': '#4169E1'
        };
        return colorMap[quality] || '#999999';
    }

    /**
     * 完成任务
     * @param {string} taskId - 任务ID
     * @returns {Object} 结果对象
     */
    completeTask(taskId) {
        const taskIndex = this.state.data.dailyTasks.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) {
            return { success: false, message: '任务不存在' };
        }
        
        const task = this.state.data.dailyTasks.tasks[taskIndex];
        if (task.completed) {
            return { success: false, message: '任务已完成' };
        }
        
        if (task.current < task.target) {
            return { success: false, message: '任务未完成' };
        }
        
        // 标记任务为完成
        task.completed = true;
        this.state.data.dailyTasks.completedTasks++;
        
        // 发放奖励
        const rewards = task.rewards;
        this.state.data.resources.spiritStone += rewards.spiritStone;
        this.state.data.resources.immortalStone += rewards.immortalStone;
        this.state.data.realm.exp += rewards.exp;
        
        // 保存状态
        this.state.save();
        
        return {
            success: true,
            message: '任务完成',
            rewards: rewards
        };
    }

    /**
     * 移除已完成的任务
     */
    removeCompletedTasks() {
        this.state.data.dailyTasks.tasks = this.state.data.dailyTasks.tasks.filter(task => !task.completed);
        this.state.save();
    }

    /**
     * 添加新任务
     * @returns {Object} 结果对象
     */
    addTask() {
        // 检查是否达到最大任务数量
        if (this.state.data.dailyTasks.tasks.length >= this.state.data.dailyTasks.maxTasks) {
            return { success: false, message: '任务数量已达上限' };
        }
        
        // 检查体力是否足够
        const requiredStamina = 50;
        if (this.state.data.training.cave.spiritPoints < requiredStamina) {
            return { success: false, message: '体力不足' };
        }
        
        // 消耗体力
        this.state.data.training.cave.spiritPoints -= requiredStamina;
        
        // 更新体力消耗统计
        if (this.engine && this.engine.achievementSystem) {
            this.engine.achievementSystem.updateStats('staminaUsed', requiredStamina);
        }
        
        // 生成新任务
        const taskTypes = ['alchemy', 'killMonster', 'dialog', 'consumeStamina', 'consumeItem'];
        const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
        const quality = this.getRandomQuality();
        const newTask = this.generateTaskByType(taskType, quality);
        
        // 添加任务
        this.state.data.dailyTasks.tasks.push(newTask);
        this.state.save();
        
        return {
            success: true,
            message: '添加任务成功',
            task: newTask
        };
    }

    /**
     * 刷新任务品质
     * @param {string} taskId - 任务ID
     * @returns {Object} 结果对象
     */
    refreshTaskQuality(taskId) {
        const taskIndex = this.state.data.dailyTasks.tasks.findIndex(task => task.id === taskId);
        if (taskIndex === -1) {
            return { success: false, message: '任务不存在' };
        }
        
        const task = this.state.data.dailyTasks.tasks[taskIndex];
        if (task.completed) {
            return { success: false, message: '任务已完成' };
        }
        
        // 刷新品质（这里模拟看广告的逻辑）
        const newQuality = this.getRandomQuality();
        task.quality = newQuality;
        task.title = this.getTaskTitle(task.type, newQuality);
        task.rewards = this.getTaskRewards(newQuality);
        
        // 保存状态
        this.state.save();
        
        return {
            success: true,
            message: '任务品质刷新成功',
            newQuality: newQuality
        };
    }

    /**
     * 更新任务进度
     * @param {string} type - 任务类型
     * @param {number} amount - 数量
     * @param {string} item - 物品名称（可选）
     */
    updateTaskProgress(type, amount = 1, item = null) {
        this.state.data.dailyTasks.tasks.forEach(task => {
            if (!task.completed && task.type === type) {
                if (type === 'consumeItem' && task.item !== item) {
                    return;
                }
                task.current = Math.min(task.current + amount, task.target);
            }
        });
        this.state.save();
    }

    /**
     * 获取所有每日任务
     * @returns {Array} 任务列表
     */
    getAllTasks() {
        this.checkRefreshTasks();
        return this.state.data.dailyTasks.tasks;
    }

    /**
     * 获取任务完成情况
     * @returns {Object} 完成情况
     */
    getTaskStatus() {
        const tasks = this.getAllTasks();
        const completed = tasks.filter(task => task.completed).length;
        const total = tasks.length;
        
        return {
            total: total,
            completed: completed,
            remaining: total - completed
        };
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DailyTaskSystem;
}