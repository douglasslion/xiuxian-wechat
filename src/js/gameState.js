/**
 * 游戏状态管理模块（微信小游戏适配版）
 * 负责玩家数据的存储、加载和更新
 * 支持微信小游戏环境和后端服务器存储
 * @version 2.0.0
 */

class GameState {
    constructor(gameEngine = null) {
        this.gameEngine = gameEngine;
        this.data = null; // 延迟初始化，等待GameConfig加载
        this.lastSaveTime = Date.now();
        this.isWeChat = typeof wx !== 'undefined';
        // 后端服务器地址
        this.serverUrl = 'https://xiuxian-test.richsh.cn';
    }

    /**
     * 初始化游戏状态
     */
    async init() {
        try {
            // 先尝试加载保存的数据
            const hasSavedData = await this.tryLoadSaved();

            if (!hasSavedData) {
                // 如果没有保存的数据,使用本地生成的ID
                console.log('没有保存的游戏数据,使用本地生成的ID');

                // 生成默认状态
                const defaultState = this.getDefaultState();
                this.data = defaultState;
            }

            console.log('游戏状态初始化完成, player ID:', this.data.player.id);
        } catch (error) {
            console.error('游戏状态初始化失败:', error);
            // 如果加载失败，使用默认数据
            if (!this.data) {
                this.data = this.getDefaultState();
            }
        }
    }

    /**
     * 尝试加载保存的数据
     * @returns {Promise<boolean>} 是否成功加载到保存的数据
     */
    async tryLoadSaved() {
        try {
            const saved = this.isWeChat ?
                await this.getLocalStorage('xiuxian_game_state') :
                localStorage.getItem('xiuxian_game_state');

            if (saved) {
                const parsed = typeof saved === 'string' ? JSON.parse(saved) : saved;
                console.log('找到保存的游戏数据:', parsed.player.id);

                // 如果保存的ID带有player_前缀，说明是旧数据，需要重新从服务器获取ID
                if (parsed.player.id && parsed.player.id.startsWith('player_')) {
                    console.log('检测到旧格式的ID(带player_前缀),需要从服务器重新获取');
                    return false; // 返回false,让init()重新获取ID
                }

                // 生成默认状态作为基础(不包含ID)
                const defaultState = this.getDefaultState();

                // 移除默认状态中的ID
                delete defaultState.player.id;

                // 合并保存的状态（保留服务器分配的纯数字ID）
                this.data = this.mergeState(defaultState, parsed);

                console.log('合并后的 player ID:', this.data.player.id);

                // 只计算离线收益,不调用save()
                this.calculateOfflineProgress();
                return true;
            }

            return false;
        } catch (error) {
            console.error('尝试加载保存数据失败:', error);
            return false;
        }
    }

    /**
     * 生成初始装备
     * @returns {Array} 初始装备列表
     */
    generateInitialEquipment() {
        const equipmentList = [];
        const GameConfigClass = typeof global !== 'undefined' && global.GameConfig ? global.GameConfig : null;

        if (!GameConfigClass || !GameConfigClass.EQUIPMENT || !GameConfigClass.EQUIPMENT.equipmentData) {
            console.warn('GameConfig未加载，使用空装备列表');
            return equipmentList;
        }

        const equipmentData = GameConfigClass.EQUIPMENT.equipmentData;

        console.log('generateInitialEquipment - equipmentData:', equipmentData);

        // 为每个装备槽添加3个装备
        const slotIds = ['weapon', 'armor', 'boots', 'belt', 'necklace', 'ring', 'jade', 'talisman'];
        console.log('generateInitialEquipment - slotIds:', slotIds);

        slotIds.forEach(slotId => {
            if (equipmentData[slotId]) {
                console.log('generateInitialEquipment - processing slot:', slotId, 'with', equipmentData[slotId].length, 'items');
                equipmentData[slotId].forEach(item => {
                    const equipment = {
                        ...item,
                        type: 'equipment',
                        slot: slotId,
                        equipped: false
                    };
                    console.log('generateInitialEquipment - adding equipment:', equipment);
                    equipmentList.push(equipment);
                });
            } else {
                console.log('generateInitialEquipment - slot not found:', slotId);
            }
        });

        console.log('generateInitialEquipment - final equipmentList length:', equipmentList.length);
        return equipmentList;
    }

    /**
     * 获取默认游戏状态
     * @returns {Object} 默认状态对象
     */
    getDefaultState() {
        const initialEquipment = this.generateInitialEquipment();
        console.log('getDefaultState - initialEquipment length:', initialEquipment.length);
        
        // 获取用户信息（微信小游戏环境）
        let userName = '';
        if (this.isWeChat && window.wechatAdapter) {
            const userInfo = window.wechatAdapter.getUserInfo();
            userName = userInfo.nickName || '修仙者';
        }
        
        return {
            // 基础信息
            player: {
                id: 'player_' + Date.now(), // 玩家唯一ID
                name: userName,
                createdAt: Date.now(),
                lastLoginAt: Date.now()
            },

            // 境界系统
            realm: {
                currentRealm: 0, // 当前境界索引 (0=炼气期)
                currentLayer: 1, // 当前层数
                exp: 0, // 当前修为
                breakthroughAttempts: 0 // 突破尝试次数
            },

            // 资源
            resources: {
                spirit: 0, // 灵气
                spiritStone: 1000, // 灵石（初始1000）
                immortalStone: 0, // 仙石
                contribution: 0 // 宗门贡献
            },



            // 角色系统
            character: {
                attributes: {
                    rootBone: 10,
                    comprehension: 10,
                    luck: 10,
                    agility: 10
                },
                freePoints: 0
            },

            // 功法系统
            skills: [],

            // 装备系统
            equipment: {
                equipped: {
                    weapon: null,
                    armor: null,
                    belt: null,
                    boots: null,
                    necklace: null,
                    ring: null,
                    jade: null,
                    talisman: null
                },
                inventory: initialEquipment
            },

            // 挂机系统
            training: {
                cave: {
                    active: false,
                    startTime: null,
                    spiritPoints: 1440, // 神识点数
                    accumulatedSpirit: 0 // 累计灵气
                },
                auto: {
                    active: false,
                    startTime: null,
                    location: null,
                    accumulatedExp: 0,
                    accumulatedMaterials: []
                },
                cultivation: {
                    active: false,
                    lastGainTime: null,
                    totalExpGained: 0,
                    accelerated: false,
                    accelerateEndTime: null
                }
            },

            // 宗门系统
            sect: {
                joined: false,
                name: '',
                disciples: [],
                tasksCompleted: 0,
                lastTaskReset: Date.now()
            },



            // PVP系统
            pvp: {
                rank: 9999,
                dailyMatches: 0,
                lastMatchReset: Date.now(),
                wins: 0,
                total: 0
            },

            // 剧情系统
            story: {
                currentChapter: 1,
                currentScene: 0,
                completedChapters: [],
                storyProgress: {}
            },

            // 每日任务系统
            dailyTasks: {
                tasks: [],
                lastRefreshTime: 0,
                completedTasks: 0,
                maxTasks: 5
            },

            // 统计数据
            stats: {
                totalSpiritGained: 0,
                totalExpGained: 0,
                breakthroughSuccess: 0,
                breakthroughFail: 0,
                playTime: 0
            },

            // 炼体系统
            bodyTraining: {
                level: 0, // 炼体境界等级
                exp: 0, // 炼体经验
                nextLevelExp: 100, // 下一级所需经验
                attributes: {
                    bodyStrength: 0, // 肉体强度
                    defense: 0, // 防御
                    hp: 0 // 生命值
                },
                equippedSkills: [] // 装备的炼体功法
            },

            // 丹炉系统
            alchemy: {
                furnace: {
                    level: 1, // 丹炉等级
                    name: '基础丹炉', // 丹炉名称
                    bonus: 0.1, // 丹炉加成（10%）
                    durability: 100 // 丹炉耐久度
                },
                currentCraft: null, // 当前炼制的丹药
                materials: {
                    '草药': 10, // 初始材料
                    '矿石': 5
                }, // 材料库存
                丹药: [] // 炼制的丹药
            },

            // 灵宠系统
            pets: {
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
            },

            // 灵田系统
            fields: {
                level: 1, // 灵田等级
                count: 1, // 灵田数量
                灵气: 0, // 灵田灵气
                max灵气: 100, // 灵田最大灵气
                fields: [
                    {
                        id: 'field1',
                        status: 'empty', // empty, growing, mature
                        seed: null,
                        startTime: null,
                        matureTime: null,
                        progress: 0
                    },
                    {
                        id: 'field2',
                        status: 'locked',
                        seed: null,
                        startTime: null,
                        matureTime: null,
                        progress: 0
                    },
                    {
                        id: 'field3',
                        status: 'locked',
                        seed: null,
                        startTime: null,
                        matureTime: null,
                        progress: 0
                    },
                    {
                        id: 'field4',
                        status: 'locked',
                        seed: null,
                        startTime: null,
                        matureTime: null,
                        progress: 0
                    },
                    {
                        id: 'field5',
                        status: 'locked',
                        seed: null,
                        startTime: null,
                        matureTime: null,
                        progress: 0
                    },
                    {
                        id: 'field6',
                        status: 'locked',
                        seed: null,
                        startTime: null,
                        matureTime: null,
                        progress: 0
                    },
                    {
                        id: 'field7',
                        status: 'locked',
                        seed: null,
                        startTime: null,
                        matureTime: null,
                        progress: 0
                    },
                    {
                        id: 'field8',
                        status: 'locked',
                        seed: null,
                        startTime: null,
                        matureTime: null,
                        progress: 0
                    },
                    {
                        id: 'field9',
                        status: 'locked',
                        seed: null,
                        startTime: null,
                        matureTime: null,
                        progress: 0
                    },
                    {
                        id: 'field10',
                        status: 'locked',
                        seed: null,
                        startTime: null,
                        matureTime: null,
                        progress: 0
                    },
                    {
                        id: 'field11',
                        status: 'locked',
                        seed: null,
                        startTime: null,
                        matureTime: null,
                        progress: 0
                    },
                    {
                        id: 'field12',
                        status: 'locked',
                        seed: null,
                        startTime: null,
                        matureTime: null,
                        progress: 0
                    }
                ]
            },

            // 背包系统
            backpack: {
                totalSlots: 40,
                unlockedSlots: 10,
                nextUnlockSlot: 11,
                unlockStartTime: Date.now(),
                unlockRequiredTime: 300000, // 第11格需要5分钟（300000毫秒）
                lastOnlineTime: Date.now(),
                items: [] // 背包物品列表
            },

            // 万妖塔系统
            tower: {
                currentFloor: 1,           // 当前层数
                highestFloor: 1,           // 最高通关层数
                clearedFloors: [],         // 已通关的楼层
                dailyChallengeCount: 0,    // 今日挑战次数
                lastChallengeDate: null    // 上次挑战日期
            },

            // 封神榜系统
            godList: {
                players: [],
                lastUpdateTime: Date.now()
            },

            // 仙武台系统
            martialStage: {
                ranking: [],
                lastRewardTime: null,
                dailyChallenges: {},
                playerPoints: 0
            },

            // 设置
            settings: {
                autoSave: true,
                notifications: true,
                sound: false,
                battle: {
                    acceleration: false,
                    skip: false
                }
            }
        };
    }

    /**
     * 从本地存储或服务器加载游戏状态
     * 注意: init() 中已经调用过 tryLoadSaved(), 这里不再重复加载
     */
    async load() {
        // 此方法保留用于手动调用加载,但 init() 中已经处理了加载逻辑
        console.log('load() called - data already initialized by init()');
    }

    /**
     * 确保所有装备类型都有预设装备
     */
    ensureAllEquipmentTypes() {
        // 这个方法暂时注释掉，因为它会导致出售的物品重新出现
        // 后续可以根据需要重新实现，确保只在初始加载时添加预设装备
        /*
        const equipmentData = GameConfig.EQUIPMENT.equipmentData;
        console.log('ensureAllEquipmentTypes - equipmentData:', equipmentData);
        
        // 确保equipment.inventory存在
        if (!this.data.equipment) {
            console.log('ensureAllEquipmentTypes - creating equipment structure');
            this.data.equipment = {
                equipped: {
                    weapon: null,
                    armor: null,
                    belt: null,
                    boots: null,
                    necklace: null,
                    ring: null,
                    jade: null,
                    talisman: null
                },
                inventory: []
            };
        }
        
        if (!this.data.equipment.inventory) {
            console.log('ensureAllEquipmentTypes - creating inventory');
            this.data.equipment.inventory = [];
        }
        
        console.log('ensureAllEquipmentTypes - before - inventory length:', this.data.equipment.inventory.length);
        console.log('ensureAllEquipmentTypes - before - inventory:', this.data.equipment.inventory);
        
        // 检查每个装备类型
        const existingEquipments = new Set(this.data.equipment.inventory.map(item => item.id));
        console.log('ensureAllEquipmentTypes - existingEquipments:', existingEquipments);
        
        let addedCount = 0;
        
        // 确保所有装备槽都有装备
        const slotIds = ['weapon', 'armor', 'boots', 'belt', 'necklace', 'ring', 'jade', 'talisman'];
        console.log('ensureAllEquipmentTypes - slotIds:', slotIds);
        
        slotIds.forEach(slotId => {
            if (equipmentData[slotId]) {
                console.log('ensureAllEquipmentTypes - processing slot:', slotId);
                equipmentData[slotId].forEach(item => {
                    // 如果装备不存在，添加到背包
                    if (!existingEquipments.has(item.id)) {
                        const newEquipment = {
                            ...item,
                            type: 'equipment',
                            slot: slotId,
                            equipped: false
                        };
                        console.log('ensureAllEquipmentTypes - adding equipment:', newEquipment);
                        this.data.equipment.inventory.push(newEquipment);
                        addedCount++;
                    } else {
                        console.log('ensureAllEquipmentTypes - equipment already exists:', item.id);
                    }
                });
            } else {
                console.log('ensureAllEquipmentTypes - slot not found:', slotId);
            }
        });
        
        console.log('ensureAllEquipmentTypes - after - inventory length:', this.data.equipment.inventory.length);
        console.log('ensureAllEquipmentTypes - after - inventory:', this.data.equipment.inventory);
        
        if (addedCount > 0) {
            console.log('Added', addedCount, 'preset equipment items');
            this.save();
        }
        */
    }

    /**
     * 合并状态（保留默认值中新增字段）
     * @param {Object} defaultState - 默认状态
     * @param {Object} savedState - 保存的状态
     * @returns {Object} 合并后的状态
     */
    mergeState(defaultState, savedState) {
        const result = { ...defaultState };
        for (const key in savedState) {
            if (savedState.hasOwnProperty(key)) {
                if (typeof savedState[key] === 'object' && savedState[key] !== null && !Array.isArray(savedState[key])) {
                    result[key] = this.mergeState(defaultState[key] || {}, savedState[key]);
                } else {
                    result[key] = savedState[key];
                }
            }
        }
        return result;
    }

    /**
     * 保存游戏状态到本地存储和服务器
     */
    async save() {
        try {
            this.data.player.lastLoginAt = Date.now();

            // 先保存到本地存储
            if (this.isWeChat) {
                await this.setLocalStorage('xiuxian_game_state', this.data);
            } else {
                localStorage.setItem('xiuxian_game_state', JSON.stringify(this.data));
            }

            // 开发环境暂时禁用服务器保存
            const useServer = false;
            // 尝试保存到服务器（异步，不阻塞）
            if (this.isWeChat && useServer) {
                this.saveToServer().catch(error => {
                    console.warn('服务器保存失败，已使用本地存储:', error.message);
                });
            }

            this.lastSaveTime = Date.now();
            console.log('游戏状态保存成功');
            return true;
        } catch (error) {
            console.error('保存游戏状态失败:', error);
            return false;
        }
    }

    /**
     * 计算离线进度
     */
    calculateOfflineProgress() {
        const now = Date.now();
        const offlineTime = now - this.data.player.lastLoginAt;

        if (offlineTime > 60000 && this.data.training.cave.active) { // 离线超过1分钟
            const maxOfflineTime = Math.min(offlineTime, 24 * 60 * 60 * 1000); // 最多24小时
            this.processOfflineTraining(maxOfflineTime);
        }
    }

    /**
     * 处理离线挂机收益
     * @param {number} duration - 离线时长（毫秒）
     */
    processOfflineTraining(duration) {
        const hours = duration / (60 * 60 * 1000);

        // 洞府修炼收益
        if (this.data.training.cave.active) {
            const spiritRate = this.getSpiritRate();
            const spiritGained = Math.floor(spiritRate * hours);
            this.data.training.cave.accumulatedSpirit += spiritGained;
            this.data.stats.totalSpiritGained += spiritGained;
        }

        // 自动历练收益
        if (this.data.training.auto.active) {
            const expRate = this.getExpRate();
            const expGained = Math.floor(expRate * hours);
            this.data.training.auto.accumulatedExp += expGained;
            this.data.stats.totalExpGained += expGained;
        }
    }

    /**
     * 获取当前灵气产出速率
     * @returns {number} 每小时灵气产出
     */
    getSpiritRate() {
        const GameConfigClass = typeof global !== 'undefined' && global.GameConfig ? global.GameConfig : null;
        let rate = GameConfigClass && GameConfigClass.TRAINING && GameConfigClass.TRAINING.cave ?
            GameConfigClass.TRAINING.cave.baseSpiritRate : 100;

        // 境界加成
        const realmBonus = 1 + (this.data.realm.currentRealm * 0.2);
        rate *= realmBonus;

        // 功法加成
        if (this.data.skills && this.data.skills.list) {
            this.data.skills.list.forEach(skill => {
                if (skill.obtained && skill.effects && skill.effects.cultivationSpeed) {
                    rate *= (1 + skill.effects.cultivationSpeed * 0.1);
                }
            });
        }

        return Math.floor(rate);
    }

    /**
     * 获取当前修为产出速率
     * @returns {number} 每小时修为产出
     */
    getExpRate() {
        let rate = 50; // 基础修为产出

        // 境界加成
        const realmBonus = 1 + (this.data.realm.currentRealm * 0.15);
        rate *= realmBonus;

        // 功法加成
        if (this.data.skills && this.data.skills.list) {
            this.data.skills.list.forEach(skill => {
                if (skill.obtained && skill.effects && skill.effects.cultivationSpeed) {
                    rate *= (1 + skill.effects.cultivationSpeed * 0.1);
                }
            });
        }

        return Math.floor(rate);
    }

    /**
     * 获取当前境界配置
     * @returns {Object} 境界配置
     */
    getCurrentRealmConfig() {
        const GameConfigClass = typeof global !== 'undefined' && global.GameConfig ? global.GameConfig : null;
        if (!GameConfigClass || !GameConfigClass.REALM || !GameConfigClass.REALM.realms) {
            return { name: '炼气期', baseExp: 100, expMultiplier: 1.2 };
        }
        return GameConfigClass.REALM.realms[this.data.realm.currentRealm];
    }

    /**
     * 获取下一境界所需修为
     * @returns {number} 所需修为
     */
    getNextRealmExp() {
        const realm = this.getCurrentRealmConfig();
        // 所有境界都使用层级计算
        return Math.floor(realm.baseExp * Math.pow(realm.expMultiplier, this.data.realm.currentLayer - 1));
    }

    /**
     * 获取总战力
     * @returns {number} 战力值
     */
    getPower() {
        let power = 100; // 基础战力

        // 境界战力
        power += this.data.realm.currentRealm * 1000;
        power += this.data.realm.currentLayer * 100;

        // 装备战力
        Object.values(this.data.equipment.equipped).forEach(equip => {
            if (equip) {
                power += equip.power || 0;
            }
        });

        // 功法战力
        if (this.data.skills && this.data.skills.list) {
            this.data.skills.list.forEach(skill => {
                if (skill.obtained) {
                    // 基础战力加成
                    power += skill.rank * 50 + skill.proficiency * 20;
                }
            });
        }

        return Math.floor(power);
    }

    /**
     * 重置游戏（用于测试）
     */
    reset() {
        this.data = this.getDefaultState();
        this.save();
    }

    /**
     * 从服务器获取新玩家ID
     * @returns {Promise<string>} 新玩家ID
     */
    async requestNewPlayerId() {
        try {
            const url = `${this.serverUrl}/api/player/new-id`;

            console.log('从服务器请求新玩家ID:', url);

            const response = await this.makeRequest('GET', url);

            console.log('服务器返回的完整响应:', response);

            if (response && response.status === 'success' && response.data && response.data.playerId) {
                console.log('获取到新玩家ID:', response.data.playerId);
                return response.data.playerId;
            } else {
                console.error('服务器返回格式错误, response:', response);
                throw new Error('服务器返回格式错误: ' + JSON.stringify(response));
            }
        } catch (error) {
            console.error('请求新玩家ID失败:', error);
            throw error;
        }
    }


    /**
     * 从本地存储获取数据
     * @param {string} key - 存储键
     * @returns {Promise<any>} 存储的数据
     */
    async getLocalStorage(key) {
        try {
            if (this.isWeChat) {
                return new Promise((resolve, reject) => {
                    wx.getStorage({
                        key: key,
                        success: (res) => {
                            resolve(res.data);
                        },
                        fail: (err) => {
                            console.log('获取本地存储失败:', err);
                            resolve(null);
                        }
                    });
                });
            } else {
                const value = localStorage.getItem(key);
                return value ? JSON.parse(value) : null;
            }
        } catch (error) {
            console.error('获取本地存储失败:', error);
            return null;
        }
    }

    /**
     * 保存数据到本地存储
     * @param {string} key - 存储键
     * @param {any} value - 存储的值
     * @returns {Promise<boolean>} 是否保存成功
     */
    async setLocalStorage(key, value) {
        try {
            if (this.isWeChat) {
                return new Promise((resolve, reject) => {
                    wx.setStorage({
                        key: key,
                        data: value,
                        success: () => {
                            resolve(true);
                        },
                        fail: (err) => {
                            console.error('保存本地存储失败:', err);
                            resolve(false);
                        }
                    });
                });
            } else {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            }
        } catch (error) {
            console.error('保存本地存储失败:', error);
            return false;
        }
    }

    /**
     * 从服务器加载游戏状态
     * @returns {Promise<Object|null>} 游戏状态数据
     */
    async loadFromServer() {
        try {
            const playerId = this.data.player.id;
            const url = `${this.serverUrl}/api/player/${playerId}`;

            console.log('从服务器加载游戏状态:', url);

            const response = await this.makeRequest('GET', url);

            if (response && response.status === 'success' && response.data) {
                console.log('服务器游戏状态加载成功:', response.data);
                return response.data.gameState;
            } else {
                console.log('服务器没有找到游戏状态，使用本地状态');
                return null;
            }
        } catch (error) {
            console.error('从服务器加载游戏状态失败:', error);
            return null;
        }
    }

    /**
     * 保存游戏状态到服务器
     * @returns {Promise<boolean>} 是否保存成功
     */
    async saveToServer() {
        try {
            const playerId = this.data.player.id;
            const url = `${this.serverUrl}/api/player/${playerId}`;

            console.log('保存游戏状态到服务器:', url);

            const data = {
                playerId: playerId,
                gameState: this.data,
                lastSaveTime: Date.now()
            };

            const response = await this.makeRequest('POST', url, data);

            if (response && response.status === 'success') {
                console.log('游戏状态保存到服务器成功');
                return true;
            } else {
                console.log('游戏状态保存到服务器失败');
                return false;
            }
        } catch (error) {
            console.error('保存游戏状态到服务器失败:', error);
            return false;
        }
    }

    /**
     * 发起HTTP请求
     * @param {string} method - 请求方法
     * @param {string} url - 请求URL
     * @param {Object} data - 请求数据
     * @returns {Promise<Object>} 响应数据
     */
    async makeRequest(method, url, data = null) {
        try {
            if (this.isWeChat) {
                return await this.makeWeChatRequest(method, url, data);
            } else {
                return await this.makeBrowserRequest(method, url, data);
            }
        } catch (error) {
            console.error('HTTP请求失败:', error);
            throw error;
        }
    }

    /**
     * 微信小游戏环境HTTP请求
     * @param {string} method - 请求方法
     * @param {string} url - 请求URL
     * @param {Object} data - 请求数据
     * @returns {Promise<Object>} 响应数据
     */
    async makeWeChatRequest(method, url, data = null) {
        console.log('发起微信小游戏HTTP请求:', method, url);

        return new Promise((resolve, reject) => {
            wx.request({
                url: url,
                method: method,
                data: data,
                header: {
                    'content-type': 'application/json'
                },
                timeout: 10000,
                success: (res) => {
                    console.log('微信请求成功,状态码:', res.statusCode, '响应:', res.data);
                    if (res.statusCode === 200) {
                        resolve(res.data);
                    } else {
                        reject(new Error(`请求失败: ${res.statusCode}`));
                    }
                },
                fail: (err) => {
                    console.error('微信请求失败:', err);
                    reject(new Error(`网络请求失败: ${err.errMsg}`));
                }
            });
        });
    }

    /**
     * 浏览器环境HTTP请求
     * @param {string} method - 请求方法
     * @param {string} url - 请求URL
     * @param {Object} data - 请求数据
     * @returns {Promise<Object>} 响应数据
     */
    async makeBrowserRequest(method, url, data = null) {
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`请求失败: ${response.status}`);
        }

        return await response.json();
    }
}

// 兼容模块导出和全局变量
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameState;
}
if (typeof global !== 'undefined') {
    global.GameState = GameState;
}
if (typeof window !== 'undefined') {
    window.GameState = GameState;
}
