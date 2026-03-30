/**
 * 游戏引擎核心模块（微信小游戏适配版）
 * 整合所有系统，提供统一的游戏接口
 * 支持微信小游戏环境和后端服务器连接
 * @version 2.0.0
 */

class GameEngine {
    constructor(gameState = null) {
        // 支持传入自定义游戏状态实例
        if (gameState !== null && gameState !== undefined) {
            this.state = gameState;
        } else {
            // 延迟获取全局类，确保全局变量已经设置
            var GameStateClass = typeof global !== 'undefined' && global.GameState ? global.GameState : null;
            if (GameStateClass) {
                this.state = new GameStateClass(this);
                // 立即初始化，确保data被设置
                if (!this.state.data) {
                    this.state.data = this.state.getDefaultState();
                }
            } else {
                console.error('GameState类未找到，无法初始化游戏状态');
                this.state = null;
            }
        }
        
        // 延迟获取全局类，确保全局变量已经设置
        var CSVLoaderClass = typeof global !== 'undefined' && global.CSVLoader ? global.CSVLoader : null;
        var ColorManagerClass = typeof global !== 'undefined' && global.ColorManager ? global.ColorManager : null;
        var TrainingSystemClass = typeof global !== 'undefined' && global.TrainingSystem ? global.TrainingSystem : null;
        var RealmSystemClass = typeof global !== 'undefined' && global.RealmSystem ? global.RealmSystem : null;
        var SkillSystemClass = typeof global !== 'undefined' && global.SkillSystem ? global.SkillSystem : null;
        var EquipmentSystemClass = typeof global !== 'undefined' && global.EquipmentSystem ? global.EquipmentSystem : null;
        var BodyTrainingSystemClass = typeof global !== 'undefined' && global.BodyTrainingSystem ? global.BodyTrainingSystem : null;
        var AlchemySystemClass = typeof global !== 'undefined' && global.AlchemySystem ? global.AlchemySystem : null;
        var PetSystemClass = typeof global !== 'undefined' && global.PetSystem ? global.PetSystem : null;
        var DailyTaskSystemClass = typeof global !== 'undefined' && global.DailyTaskSystem ? global.DailyTaskSystem : null;
        var GiftSystemClass = typeof global !== 'undefined' && global.GiftSystem ? global.GiftSystem : null;
        var CheckinSystemClass = typeof global !== 'undefined' && global.CheckinSystem ? global.CheckinSystem : null;
        var AchievementSystemClass = typeof global !== 'undefined' && global.AchievementSystem ? global.AchievementSystem : null;
        var MarketSystemClass = typeof global !== 'undefined' && global.MarketSystem ? global.MarketSystem : null;
        var SectSystemClass = typeof global !== 'undefined' && global.SectSystem ? global.SectSystem : null;
        var TowerSystemClass = typeof global !== 'undefined' && global.TowerSystem ? global.TowerSystem : null;
        var GodListSystemClass = typeof global !== 'undefined' && global.GodListSystem ? global.GodListSystem : null;
        var MartialStageSystemClass = typeof global !== 'undefined' && global.MartialStageSystem ? global.MartialStageSystem : null;
        var UIManagerClass = typeof global !== 'undefined' && global.UIManager ? global.UIManager : null;
        
        this.csvLoader = CSVLoaderClass ? new CSVLoaderClass() : null;
        this.colorManager = ColorManagerClass ? new ColorManagerClass() : null;
        this.trainingSystem = TrainingSystemClass ? new TrainingSystemClass(this.state, this) : null;
        this.realmSystem = RealmSystemClass ? new RealmSystemClass(this.state, this) : null;
        this.skillSystem = SkillSystemClass ? new SkillSystemClass(this.state, this) : null;
        this.equipmentSystem = EquipmentSystemClass ? new EquipmentSystemClass(this.state) : null;
        this.bodyTrainingSystem = BodyTrainingSystemClass ? new BodyTrainingSystemClass(this.state, this) : null;
        this.alchemySystem = AlchemySystemClass ? new AlchemySystemClass(this.state, this) : null;
        this.petSystem = PetSystemClass ? new PetSystemClass(this.state, this) : null;
        this.dailyTaskSystem = DailyTaskSystemClass ? new DailyTaskSystemClass(this.state, this) : null;
        this.giftSystem = GiftSystemClass ? new GiftSystemClass(this) : null;
        this.checkinSystem = CheckinSystemClass ? new CheckinSystemClass(this) : null;
        this.achievementSystem = AchievementSystemClass ? new AchievementSystemClass(this) : null;
        this.marketSystem = MarketSystemClass ? new MarketSystemClass(this) : null;
        this.sectSystem = SectSystemClass ? new SectSystemClass(this) : null;
        this.towerSystem = TowerSystemClass ? new TowerSystemClass(this) : null;
        this.godListSystem = GodListSystemClass ? new GodListSystemClass(this) : null;
        this.martialStageSystem = MartialStageSystemClass ? new MartialStageSystemClass(this) : null;
        this.uiManager = null;
        
        this.isWeChat = typeof wx !== 'undefined';
        this.autoSaveInterval = null;

        // 微信小游戏环境延迟初始化
        if (this.isWeChat) {
            // 在微信环境中，初始化将在wx.onLaunch中调用
            console.log('微信小游戏环境检测到，等待初始化');
        } else {
            this.init();
        }
    }

    /**
     * 初始化游戏引擎
     */
    async init() {
        try {
            // 微信小游戏环境检查
            if (this.isWeChat) {
                console.log('微信小游戏环境初始化开始');

                // 等待微信小游戏环境准备完成
                await this.waitForWeChatReady();
            }

            // 检查state是否为null
            if (!this.state) {
                console.error('游戏状态未初始化，尝试创建');
                var GameStateClass = typeof global !== 'undefined' && global.GameState ? global.GameState : null;
                if (!GameStateClass) {
                    throw new Error('GameState类未找到，无法初始化游戏状态');
                }
                this.state = new GameStateClass(this);
            }

            // 加载配置数据（如果csvLoader存在）
            if (this.csvLoader) {
                await this.csvLoader.loadAllData();
            }

            // 初始化颜色管理器（如果colorManager存在）
            if (this.colorManager && this.csvLoader) {
                await this.colorManager.init(this.csvLoader);
            }

            // 恢复神识
            if (this.trainingSystem) {
                this.trainingSystem.recoverSpirit();
            }

            // 确保所有装备类型都有预设装备
            if (this.state && this.state.ensureAllEquipmentTypes) {
                this.state.ensureAllEquipmentTypes();
            }

            // 检查每日重置
            this.checkDailyReset();

            // 检查成就达成状态
            if (this.achievementSystem) {
                this.achievementSystem.checkAchievements();
            }

            // 启动自动保存
            this.startAutoSave();

            // 初始化UI（如果UIManager存在）
            var UIManagerClass = typeof global !== 'undefined' && global.UIManager ? global.UIManager : null;
            if (UIManagerClass) {
                this.uiManager = new UIManagerClass(this);
            }

            console.log('游戏引擎初始化完成');

            // 触发初始化完成事件
            if (this.isWeChat && this.onInitComplete) {
                this.onInitComplete();
            }

        } catch (error) {
            console.error('游戏引擎初始化失败:', error);

            // 微信小游戏环境显示错误提示
            if (this.isWeChat && typeof window !== 'undefined' && window.wechatAdapter) {
                window.wechatAdapter.showError('游戏初始化失败，请重试');
            }
        }
    }

    /**
     * 等待微信小游戏环境准备完成
     */
    async waitForWeChatReady() {
        return new Promise((resolve) => {
            const checkReady = () => {
                if (typeof wx !== 'undefined' && wx.getSystemInfo) {
                    resolve();
                } else {
                    setTimeout(checkReady, 100);
                }
            };
            checkReady();
        });
    }

    /**
     * 检查每日重置
     */
    checkDailyReset() {
        const now = new Date();
        const lastReset = new Date(this.state.data.pvp.lastMatchReset || Date.now());

        // 检查是否跨天
        if (now.getDate() !== lastReset.getDate() ||
            now.getMonth() !== lastReset.getMonth() ||
            now.getFullYear() !== lastReset.getFullYear()) {

            // 重置PVP次数
            this.state.data.pvp.dailyMatches = 0;
            this.state.data.pvp.lastMatchReset = now.getTime();

            // 重置宗门任务
            this.state.data.sect.tasksCompleted = 0;
            this.state.data.sect.lastTaskReset = now.getTime();

            // 重置每日任务
            if (this.dailyTaskSystem) {
                this.dailyTaskSystem.refreshTasks();
            }

            this.state.save();
            console.log('每日数据已重置');
        }
    }

    /**
     * 完成每日任务
     * @param {string} taskId - 任务ID
     * @returns {Object} 结果对象
     */
    completeDailyTask(taskId) {
        return this.dailyTaskSystem.completeTask(taskId);
    }

    /**
     * 添加每日任务
     * @returns {Object} 结果对象
     */
    addDailyTask() {
        return this.dailyTaskSystem.addTask();
    }

    /**
     * 刷新任务品质
     * @param {string} taskId - 任务ID
     * @returns {Object} 结果对象
     */
    refreshTaskQuality(taskId) {
        return this.dailyTaskSystem.refreshTaskQuality(taskId);
    }

    /**
     * 更新任务进度
     * @param {string} type - 任务类型
     * @param {number} amount - 数量
     * @param {string} item - 物品名称（可选）
     */
    updateTaskProgress(type, amount, item) {
        this.dailyTaskSystem.updateTaskProgress(type, amount, item);
    }

    /**
     * 获取所有每日任务
     * @returns {Array} 任务列表
     */
    getAllDailyTasks() {
        return this.dailyTaskSystem.getAllTasks();
    }

    /**
     * 获取任务完成情况
     * @returns {Object} 完成情况
     */
    getDailyTaskStatus() {
        return this.dailyTaskSystem.getTaskStatus();
    }

    /**
     * 启动自动保存
     */
    startAutoSave() {
        // 清除之前的定时器
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
        
        // 每30秒自动保存一次
        this.autoSaveInterval = setInterval(() => {
            if (this.state.data.settings.autoSave) {
                this.state.save();
            }
        }, 30000);
        
        // 微信小游戏环境：监听页面隐藏事件进行保存
        if (this.isWeChat) {
            wx.onHide(() => {
                console.log('页面隐藏，保存游戏状态');
                this.state.save();
            });
            
            wx.onShow(() => {
                console.log('页面显示');
                // 只有已登录时才检查离线收益
                const isLoggedIn = typeof wx !== 'undefined' && wx.getStorageSync && wx.getStorageSync('login_token');
                if (isLoggedIn) {
                    console.log('检查离线收益');
                    this.checkOfflineProgress();
                }
            });
        }
    }

    /**
     * 检查离线收益
     */
    checkOfflineProgress() {
        if (this.state && typeof this.state.calculateOfflineProgress === 'function') {
            this.state.calculateOfflineProgress();
        }
    }

    /**
     * 停止自动保存
     */
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }



    /**
     * 加入宗门
     * @returns {Object} 结果
     */
    joinSect() {
        const sectNames = ['青云宗', '玄天宗', '灵剑派', '万佛寺', '魔罗殿', '天机阁'];
        const state = this.state.data;

        state.sect.joined = true;
        state.sect.name = sectNames[Math.floor(Math.random() * sectNames.length)];
        state.sect.disciples = [];
        state.sect.tasksCompleted = 0;
        state.sect.lastTaskReset = Date.now();

        this.state.save();

        return {
            success: true,
            message: `成功加入${state.sect.name}`
        };
    }

    /**
     * 分配弟子
     * @returns {Object} 结果
     */
    assignDisciples() {
        const state = this.state.data;

        if (!state.sect.joined) {
            return { success: false, message: '未加入宗门' };
        }

        // 生成弟子
        const discipleTypes = GameConfig.SECT.discipleTypes;
        const discipleNames = ['张三', '李四', '王五', '赵六', '钱七', '孙八', '周九', '吴十'];

        state.sect.disciples = [];
        const count = Math.min(5, GameConfig.SECT.maxDisciples);

        for (let i = 0; i < count; i++) {
            const type = discipleTypes[Math.floor(Math.random() * discipleTypes.length)];
            const name = discipleNames[Math.floor(Math.random() * discipleNames.length)];

            state.sect.disciples.push({
                name: name,
                type: type.id,
                job: type.name,
                output: type.output,
                rate: type.rate
            });
        }

        this.state.save();

        return {
            success: true,
            message: `成功分配 ${state.sect.disciples.length} 名弟子`,
            disciples: state.sect.disciples
        };
    }

    /**
     * 完成宗门任务
     * @returns {Object} 结果
     */
    completeSectTasks() {
        const state = this.state.data;

        if (!state.sect.joined) {
            return { success: false, message: '未加入宗门' };
        }

        const maxTasks = 3;
        const remaining = maxTasks - state.sect.tasksCompleted;

        if (remaining <= 0) {
            return { success: false, message: '今日任务已完成' };
        }

        const contribution = remaining * 50;
        state.resources.contribution += contribution;
        state.sect.tasksCompleted = maxTasks;

        this.state.save();

        return {
            success: true,
            message: `完成 ${remaining} 个任务，获得 ${contribution} 贡献`,
            contribution: contribution
        };
    }

    /**
     * PVP匹配
     * @returns {Object} 结果
     */
    pvpMatch() {
        const state = this.state.data;
        const maxMatches = 5;

        if (state.pvp.dailyMatches >= maxMatches) {
            return { success: false, message: '今日对决次数已用完' };
        }

        // 模拟战斗
        const playerPower = this.state.getPower();
        const opponentPower = Math.floor(playerPower * (0.8 + Math.random() * 0.4));

        const win = playerPower >= opponentPower;
        state.pvp.dailyMatches++;

        if (win) {
            state.pvp.wins++;
            // 提升排名
            state.pvp.rank = Math.max(1, state.pvp.rank - Math.floor(Math.random() * 10) - 1);

            // 奖励
            const reward = {
                spiritStone: 100,
                contribution: 20
            };
            state.resources.spiritStone += reward.spiritStone;
            state.resources.contribution += reward.contribution;

            this.state.save();

            return {
                success: true,
                win: true,
                message: `胜利！排名提升至 ${state.pvp.rank}`,
                rewards: reward
            };
        } else {
            this.state.save();

            return {
                success: true,
                win: false,
                message: '惜败，继续提升战力',
                opponentPower: opponentPower
            };
        }
    }

    /**
     * 膜拜领取奖励
     * @returns {Object} 结果
     */
    worship() {
        const state = this.state.data;

        // 每日可膜拜3次
        const reward = {
            enhanceStone: 5
        };

        this.equipmentSystem.addEnhanceStone(reward.enhanceStone);
        this.state.save();

        return {
            success: true,
            message: `膜拜成功，获得 ${reward.enhanceStone} 强化石`,
            rewards: reward
        };
    }

    /**
     * 添加物品到背包
     * @param {Object} item - 物品
     */
    addToInventory(item) {
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
        
        // 检查是否已经存在相同的物品
        const existing = this.state.data.backpack.items.find(i => i.id === item.id);
        if (existing) {
            existing.count = (existing.count || 1) + (item.count || 1);
        } else {
            this.state.data.backpack.items.push({ ...item, count: item.count || 1 });
        }
        
        // 如果是装备，更新统计数据
        if (item.type === 'equipment' && item.quality && this.achievementSystem) {
            this.achievementSystem.updateStats('equipmentObtained', 1, { quality: item.quality });
        }
        
        this.state.save();
    }

    /**
     * 创建新角色
     * @param {string} name - 角色名
     * @returns {Object} 结果
     */
    createCharacter(name) {
        if (!this.state.data.player.id) {
            this.state.data.player.id = 'player_' + Date.now(); // 确保玩家有唯一ID
        }
        this.state.data.player.name = name;
        this.state.data.player.createdAt = Date.now();

        // 初始化角色属性
        this.state.data.character = {
            attributes: {
                rootBone: 10,
                comprehension: 10,
                luck: 10,
                agility: 10
            },
            freePoints: 0
        };

        this.state.save();

        return {
            success: true,
            message: '角色创建成功'
        };
    }

    /**
     * 更新角色属性
     * @param {string} attribute - 属性名
     * @param {boolean} isIncrease - 是否增加
     * @returns {Object} 结果
     */
    updateCharacterAttribute(attribute, isIncrease) {
        const character = this.state.data.character || {
            attributes: {
                rootBone: 10,
                comprehension: 10,
                luck: 10,
                agility: 10
            },
            freePoints: 0
        };

        if (isIncrease) {
            if (character.freePoints > 0) {
                character.attributes[attribute]++;
                character.freePoints--;
                this.state.save();
                return {
                    success: true,
                    message: '属性增加成功'
                };
            } else {
                return {
                    success: false,
                    message: '可分配属性点不足'
                };
            }
        } else {
            // 确保属性不会低于初始值
            if (character.attributes[attribute] > 10) {
                character.attributes[attribute]--;
                character.freePoints++;
                this.state.save();
                return {
                    success: true,
                    message: '属性减少成功'
                };
            } else {
                return {
                    success: false,
                    message: '属性已达到最低值'
                };
            }
        }
    }

    /**
     * 更新玩家名字
     * @param {string} name - 新名字
     * @returns {Object} 结果
     */
    updatePlayerName(name) {
        this.state.data.player.name = name;
        this.state.save();
        return {
            success: true,
            message: '名字更新成功'
        };
    }

    /**
     * 增加自由属性点
     * @param {number} points - 增加的点数
     */
    addFreePoints(points) {
        if (!this.state.data.character) {
            this.state.data.character = {
                attributes: {
                    rootBone: 10,
                    comprehension: 10,
                    luck: 10,
                    agility: 10
                },
                freePoints: 0
            };
        }
        this.state.data.character.freePoints += points;
        this.state.save();
    }

    /**
     * 清理资源
     */
    destroy() {
        if (this.trainingSystem) {
            this.trainingSystem.destroy();
        }
        this.state.save();
    }
}

// 兼容模块导出和全局变量
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEngine;
}
if (typeof global !== 'undefined') {
    global.GameEngine = GameEngine;
    
    // 全局游戏引擎实例
    global.gameEngine = null;
    
    /**
     * 启动游戏
     */
    global.startGame = async function() {
        global.gameEngine = new GameEngine();
        await global.gameEngine.init();
    };
    
    /**
     * 获取游戏引擎实例
     * @returns {GameEngine} 游戏引擎
     */
    global.getGameEngine = function() {
        return global.gameEngine;
    };
} else if (typeof window !== 'undefined') {
    window.GameEngine = GameEngine;
    
    // 全局游戏引擎实例
    window.gameEngine = null;
    
    /**
     * 启动游戏
     */
    window.startGame = async function() {
        window.gameEngine = new GameEngine();
        await window.gameEngine.init();
    };
    
    /**
     * 获取游戏引擎实例
     * @returns {GameEngine} 游戏引擎
     */
    window.getGameEngine = function() {
        return window.gameEngine;
    };
}
