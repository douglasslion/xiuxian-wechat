/**
 * 游戏核心配置数据
 * 包含境界、灵根、功法、装备等所有游戏数值设定
 * @version 1.0.0
 */

// ==================== 统一物品表 ====================
const ITEMS_CONFIG = {
    // 资源类物品（直接添加到资源）
    resources: {
        spirit_stone: {
            id: 'spirit_stone',
            name: '灵石',
            type: 'resource',
            description: '修仙界的基础货币，可用于购买物品和强化装备',
            icon: '💎',
            stackable: true,
            maxStack: 999999999
        },
        immortal_stone: {
            id: 'immortal_stone',
            name: '仙晶',
            type: 'resource',
            description: '高级货币，可用于购买珍稀物品',
            icon: '✨',
            stackable: true,
            maxStack: 999999999
        },
        contribution: {
            id: 'contribution',
            name: '贡献点',
            type: 'resource',
            description: '宗门贡献点，可在宗门商店购买物品',
            icon: '🏆',
            stackable: true,
            maxStack: 999999999
        }
    },
    
    // 消耗品类物品（添加到背包）
    consumables: {
        healing_pill: {
            id: 'healing_pill',
            name: '疗伤丹',
            type: 'consumable',
            subType: 'pill',
            description: '恢复生命力的丹药',
            icon: '💊',
            stackable: true,
            maxStack: 999,
            effect: {
                type: 'heal',
                value: 100
            }
        },
        exp_pill: {
            id: 'exp_pill',
            name: '经验丹',
            type: 'consumable',
            subType: 'pill',
            description: '增加修炼经验的丹药',
            icon: '🌟',
            stackable: true,
            maxStack: 999,
            effect: {
                type: 'exp',
                value: 1000
            }
        },
        enhance_stone: {
            id: 'enhance_stone',
            name: '强化石',
            type: 'consumable',
            subType: 'material',
            description: '用于强化装备的材料',
            icon: '🔧',
            stackable: true,
            maxStack: 999,
            effect: {
                type: 'enhance',
                value: 1
            }
        },
        refine_stone: {
            id: 'refine_stone',
            name: '洗炼石',
            type: 'consumable',
            subType: 'material',
            description: '用于洗炼装备属性的材料',
            icon: '🔮',
            stackable: true,
            maxStack: 999,
            effect: {
                type: 'refine',
                value: 1
            }
        },
        breakthrough_pill: {
            id: 'breakthrough_pill',
            name: '突破丹',
            type: 'consumable',
            subType: 'pill',
            description: '增加突破成功率的丹药',
            icon: '🎯',
            stackable: true,
            maxStack: 999,
            effect: {
                type: 'breakthrough',
                value: 0.01
            }
        }
    },
    
    // 特殊物品
    special: {
        special_item: {
            id: 'special_item',
            name: '特殊物品',
            type: 'special',
            description: '特殊用途的物品',
            icon: '🎁',
            stackable: true,
            maxStack: 99
        }
    },
    
    /**
     * 根据物品ID获取物品配置
     * @param {string} itemId - 物品ID
     * @returns {Object|null} 物品配置
     */
    getItem: function(itemId) {
        // 检查资源类
        if (this.resources[itemId]) {
            return this.resources[itemId];
        }
        // 检查消耗品类
        if (this.consumables[itemId]) {
            return this.consumables[itemId];
        }
        // 检查特殊物品
        if (this.special[itemId]) {
            return this.special[itemId];
        }
        return null;
    },
    
    /**
     * 获取所有物品列表
     * @returns {Array} 所有物品列表
     */
    getAllItems: function() {
        const allItems = [];
        // 添加资源类物品
        for (const key in this.resources) {
            allItems.push(this.resources[key]);
        }
        // 添加消耗品类物品
        for (const key in this.consumables) {
            allItems.push(this.consumables[key]);
        }
        // 添加特殊物品
        for (const key in this.special) {
            allItems.push(this.special[key]);
        }
        return allItems;
    }
};

// ==================== 境界配置 ====================
const REALM_CONFIG = {
    realms: [
        { id: 'mortal', name: '凡人', layers: 10, baseExp: 100, expMultiplier: 1.2, unlockLevel: 1 },
        { id: 'postnatal', name: '后天', layers: 10, baseExp: 500, expMultiplier: 1.3, unlockLevel: 11 },
        { id: 'innate', name: '先天', layers: 10, baseExp: 1000, expMultiplier: 1.4, unlockLevel: 21 },
        { id: 'lianqi', name: '炼气', layers: 10, baseExp: 5000, expMultiplier: 1.5, unlockLevel: 31 },
        { id: 'zhuji', name: '筑基', layers: 10, baseExp: 100000, expMultiplier: 2.0, unlockLevel: 41 },
        { id: 'jindan', name: '金丹', layers: 10, baseExp: 500000, expMultiplier: 2.5, unlockLevel: 51 },
        { id: 'yuanying', name: '元婴', layers: 10, baseExp: 2000000, expMultiplier: 3.0, unlockLevel: 61 },
        { id: 'huashen', name: '化神', layers: 10, baseExp: 10000000, expMultiplier: 4.0, unlockLevel: 71 },
        { id: 'lianxu', name: '炼虚', layers: 10, baseExp: 50000000, expMultiplier: 5.0, unlockLevel: 81 },
        { id: 'heti', name: '合体', layers: 10, baseExp: 200000000, expMultiplier: 6.0, unlockLevel: 91 },
        { id: 'dacheng', name: '大乘', layers: 10, baseExp: 1000000000, expMultiplier: 8.0, unlockLevel: 101 },
        { id: 'earth_immortal', name: '地仙', layers: 10, baseExp: 5000000000, expMultiplier: 10.0, unlockLevel: 111 },
        { id: 'heaven_immortal', name: '天仙', layers: 10, baseExp: 10000000000, expMultiplier: 12.0, unlockLevel: 121 },
        { id: 'golden_immortal', name: '金仙', layers: 10, baseExp: 50000000000, expMultiplier: 15.0, unlockLevel: 131 },
        { id: 'taiyi_immortal', name: '太乙金仙', layers: 10, baseExp: 100000000000, expMultiplier: 20.0, unlockLevel: 141 },
        { id: 'daluo_immortal', name: '大罗金仙', layers: 10, baseExp: 500000000000, expMultiplier: 25.0, unlockLevel: 151 },
        { id: 'quasi_saint', name: '准圣', layers: 10, baseExp: 1000000000000, expMultiplier: 30.0, unlockLevel: 161 },
        { id: 'saint', name: '圣人', layers: 10, baseExp: 9999999999999, expMultiplier: 1.0, unlockLevel: 171 }
    ],

    // 突破成功率基础值（最高80%）
    baseBreakthroughRate: 0.8,

    // 大境界突破成功率递减（每提升一个大境界减少5%）
    breakthroughRateDecay: 0.05,

    // 突破丹增加成功率（每个+1%）
    breakthroughPillBonus: 0.01,

    // 小境界突破获得属性点
    layerBreakthroughPoints: 3,

    // 大境界突破获得属性点
    realmBreakthroughPoints: 10,

    // 每个大境界解锁的功能
    unlocks: {
        'zhuji': ['autoTraining'],
        'jindan': ['sect'],
        'yuanying': ['secretRealm'],
        'huashen': ['pvp']
    }
};



// ==================== 功法配置 ====================
const SKILL_CONFIG = {
    categories: [
        { id: 'resource', name: '资源类', description: '提升资源获取效率' },
        { id: 'attack', name: '攻击类', description: '提升攻击属性' },
        { id: 'defense', name: '防御类', description: '提升防御属性' },
        { id: 'special', name: '特殊类', description: '特殊效果加成' }
    ],

    qualities: [
        { id: 'common', name: '凡品', maxLevel: 10, multiplier: 1.0 },
        { id: 'good', name: '良品', maxLevel: 20, multiplier: 1.5 },
        { id: 'fine', name: '精品', maxLevel: 30, multiplier: 2.0 },
        { id: 'exquisite', name: '绝品', maxLevel: 50, multiplier: 3.0 },
        { id: 'divine', name: '神品', maxLevel: 100, multiplier: 5.0 }
    ],

    // 功法列表
    skills: [
        // 资源类
        { id: 'lingqi_gathering', name: '灵气汇聚', category: 'resource', quality: 'common', effect: { spiritRate: 0.1 } },
        { id: 'xiulian_acceleration', name: '修炼加速', category: 'resource', quality: 'good', effect: { expRate: 0.15 } },
        { id: 'caifeng_shu', name: '采风术', category: 'resource', quality: 'fine', effect: { materialRate: 0.2 } },
        { id: 'tianyuan_mijing', name: '天元秘境', category: 'resource', quality: 'exquisite', effect: { spiritRate: 0.3, expRate: 0.2 } },

        // 攻击类
        { id: 'jianqi_jue', name: '剑气诀', category: 'attack', quality: 'common', effect: { attack: 10 } },
        { id: 'pomo_zhi', name: '破魔指', category: 'attack', quality: 'good', effect: { attack: 25, crit: 0.05 } },
        { id: 'tianlei_yin', name: '天雷引', category: 'attack', quality: 'fine', effect: { attack: 50, crit: 0.1 } },
        { id: 'wanjian_gui', name: '万剑归宗', category: 'attack', quality: 'divine', effect: { attack: 200, crit: 0.2, critDamage: 0.3 } },

        // 防御类
        { id: 'tiejia_shu', name: '铁甲术', category: 'defense', quality: 'common', effect: { defense: 10 } },
        { id: 'jin_gang', name: '金刚不坏', category: 'defense', quality: 'good', effect: { defense: 25, hp: 50 } },
        { id: 'wuxing_dun', name: '五行盾', category: 'defense', quality: 'fine', effect: { defense: 50, resist: 0.1 } },

        // 特殊类
        { id: 'qiyun_shu', name: '气运术', category: 'special', quality: 'good', effect: { luck: 0.1 } },
        { id: 'shenshi_huifu', name: '神识恢复', category: 'special', quality: 'fine', effect: { spiritRecovery: 0.2 } }
    ]
};

// ==================== 装备配置 ====================
const EQUIPMENT_CONFIG = {
    slots: [
        { id: 'weapon', name: '武器', attribute: 'attack' },
        { id: 'armor', name: '衣服', attribute: 'defense' },
        { id: 'belt', name: '腰带', attribute: 'hp' },
        { id: 'boots', name: '鞋子', attribute: 'speed' },
        { id: 'necklace', name: '项链', attribute: 'hp' },
        { id: 'ring', name: '戒指', attribute: 'attack' },
        { id: 'jade', name: '玉佩', attribute: 'defense' },
        { id: 'talisman', name: '法宝', attribute: 'critical' }
    ],

    qualities: [
        { id: 'common', name: '凡品', baseStats: 10, color: '#9e9e9e' },
        { id: 'good', name: '良品', baseStats: 25, color: '#4caf50' },
        { id: 'fine', name: '精品', baseStats: 50, color: '#2196f3' },
        { id: 'exquisite', name: '绝品', baseStats: 100, color: '#b39ddb' },
        { id: 'divine', name: '神器', baseStats: 250, color: '#ff9800' }
    ],

    maxEnhanceLevel: 20,
    enhanceCostMultiplier: 1.2,

    // 装备数据 - 每个类型3个装备
    equipmentData: {
        weapon: [
            {
                id: 'weapon_001',
                name: '青钢剑',
                description: '精钢千锤百炼而成，刀身蕴有微弱灵气，劈砍力度远超凡铁，筑基修士标配。',
                quality: 'good',
                level: 3,
                stats: { attack: 800, hp: 800, critical: 5 }
            },
            {
                id: 'weapon_002',
                name: '玄铁重剑',
                description: '以玄铁锻造的重剑，挥舞间带有破空之声，攻击力惊人。',
                quality: 'fine',
                level: 5,
                stats: { attack: 1500, hp: 500, critical: 8 }
            },
            {
                id: 'weapon_003',
                name: '紫电青霜',
                description: '蕴含雷电之力的神兵，剑出如电，威力无穷。',
                quality: 'exquisite',
                level: 8,
                stats: { attack: 3000, hp: 1000, critical: 15, speed: 50 }
            }
        ],
        armor: [
            {
                id: 'armor_001',
                name: '铁布衫',
                description: '以精铁丝线编织而成的护甲，防御力不俗，适合初学者。',
                quality: 'good',
                level: 2,
                stats: { defense: 600, hp: 1200 }
            },
            {
                id: 'armor_002',
                name: '金丝软甲',
                description: '以金丝编织的软甲，轻便灵活，防御力极佳。',
                quality: 'fine',
                level: 4,
                stats: { defense: 1000, hp: 2000, resist: 5 }
            },
            {
                id: 'armor_003',
                name: '玄天战甲',
                description: '上古战甲，蕴含玄天之力，刀枪不入。',
                quality: 'exquisite',
                level: 7,
                stats: { defense: 2500, hp: 5000, resist: 10, defense: 500 }
            }
        ],
        boots: [
            {
                id: 'boots_001',
                name: '疾风靴',
                description: '以疾风兽皮制成的靴子，穿上后身轻如燕。',
                quality: 'good',
                level: 2,
                stats: { speed: 100, hp: 300 }
            },
            {
                id: 'boots_002',
                name: '踏云履',
                description: '传说可踏云而行的仙靴，速度极快。',
                quality: 'fine',
                level: 5,
                stats: { speed: 200, hp: 500, dodge: 5 }
            },
            {
                id: 'boots_003',
                name: '追风逐电',
                description: '神级靴子，穿上后如风似电，难以捉摸。',
                quality: 'exquisite',
                level: 8,
                stats: { speed: 400, hp: 800, dodge: 10, critical: 5 }
            }
        ],
        belt: [
            {
                id: 'belt_001',
                name: '牛皮腰带',
                description: '坚韧的牛皮制成的腰带，可稳固丹田。',
                quality: 'good',
                level: 2,
                stats: { hp: 500, defense: 100 }
            },
            {
                id: 'belt_002',
                name: '金丝腰带',
                description: '以金丝编织的腰带，华丽且实用。',
                quality: 'fine',
                level: 4,
                stats: { hp: 1000, defense: 200, spiritRate: 5 }
            },
            {
                id: 'belt_003',
                name: '乾坤腰带',
                description: '蕴含乾坤之力的神级腰带，可储存大量物品。',
                quality: 'exquisite',
                level: 7,
                stats: { hp: 2500, defense: 500, spiritRate: 15 }
            }
        ],
        necklace: [
            {
                id: 'necklace_001',
                name: '银项链',
                description: '普通的银质项链，可护佑心脉。',
                quality: 'good',
                level: 2,
                stats: { hp: 800, spiritRate: 3 }
            },
            {
                id: 'necklace_002',
                name: '灵珠项链',
                description: '以灵珠串成的项链，灵气充沛。',
                quality: 'fine',
                level: 5,
                stats: { hp: 1500, spiritRate: 8, defense: 100 }
            },
            {
                id: 'necklace_003',
                name: '九转玲珑',
                description: '传说中的神物，佩戴后灵气源源不断。',
                quality: 'exquisite',
                level: 8,
                stats: { hp: 3000, spiritRate: 20, defense: 300, hpRecovery: 50 }
            }
        ],
        ring: [
            {
                id: 'ring_001',
                name: '铁指环',
                description: '普通的铁指环，可略微增强攻击力。',
                quality: 'good',
                level: 2,
                stats: { attack: 300, critical: 2 }
            },
            {
                id: 'ring_002',
                name: '储物戒',
                description: '内含储物空间的戒指，方便携带物品。',
                quality: 'fine',
                level: 4,
                stats: { attack: 600, critical: 4, hp: 400 }
            },
            {
                id: 'ring_003',
                name: '龙纹戒',
                description: '刻有龙纹的神级戒指，蕴含龙族之力。',
                quality: 'exquisite',
                level: 7,
                stats: { attack: 1500, critical: 10, hp: 1000, attackSpeed: 10 }
            }
        ],
        jade: [
            {
                id: 'jade_001',
                name: '和田玉',
                description: '温润的和田玉，可静心凝神。',
                quality: 'good',
                level: 3,
                stats: { defense: 200, hp: 400, resist: 3 }
            },
            {
                id: 'jade_002',
                name: '通灵宝玉',
                description: '可通灵的宝玉，能增强神识。',
                quality: 'fine',
                level: 5,
                stats: { defense: 400, hp: 800, resist: 6, spiritRate: 5 }
            },
            {
                id: 'jade_003',
                name: '女娲石',
                description: '传说中的女娲补天石，蕴含无穷神力。',
                quality: 'exquisite',
                level: 9,
                stats: { defense: 1000, hp: 2000, resist: 15, spiritRate: 15, hpRecovery: 100 }
            }
        ],
        talisman: [
            {
                id: 'talisman_001',
                name: '护身符',
                description: '普通的护身符，可抵挡一次致命伤害。',
                quality: 'good',
                level: 3,
                stats: { hp: 600, defense: 150, critical: 3 }
            },
            {
                id: 'talisman_002',
                name: '五行符',
                description: '蕴含五行之力的符箓，攻防兼备。',
                quality: 'fine',
                level: 5,
                stats: { hp: 1200, defense: 300, critical: 6, attack: 200 }
            },
            {
                id: 'talisman_003',
                name: '盘古幡',
                description: '开天辟地时的神器，威力无穷。',
                quality: 'exquisite',
                level: 10,
                stats: { hp: 3000, defense: 800, critical: 15, attack: 800, spiritRate: 20 }
            }
        ]
    }
};

// ==================== 挂机配置 ====================
const TRAINING_CONFIG = {
    // 洞府修炼
    cave: {
        maxDuration: 24 * 60 * 60 * 1000, // 24小时（毫秒）
        spiritRecoveryRate: 1, // 神识恢复速度（点/分钟）
        maxSpirit: 1440, // 神识上限（24小时）
        baseSpiritRate: 100 // 基础灵气产出（每小时）
    },

    // 自动历练
    training: {
        unlockRealm: 'zhuji',
        maxDuration: 8 * 60 * 60 * 1000, // 8小时
        costPerHour: 100 // 每小时消耗灵石
    },

    // 修为修炼
    cultivation: {
        baseInterval: 30, // 基础修炼间隔（秒）
        acceleratedInterval: 15, // 加速后修炼间隔（秒）
        baseExpGain: 10000000000, // 基础修为获取
        // 加速选项
        speedOptions: {
            hour1: {
                id: 'hour1',
                name: '加速1小时',
                cost: 1000,
                costType: 'spiritStone',
                duration: 60 * 60 * 1000, // 1小时
                description: '消耗1000灵石，修炼效率翻倍'
            },
            hour24: {
                id: 'hour24',
                name: '加速24小时',
                cost: 0,
                costType: 'ad',
                duration: 24 * 60 * 60 * 1000, // 24小时
                description: '观看广告，获得24小时加速'
            },
            permanent: {
                id: 'permanent',
                name: '永久加速',
                cost: 0,
                costType: 'vip',
                requiredVip: 1,
                duration: -1, // 永久
                description: 'VIP1解锁，永久双倍修炼效率'
            }
        }
    }
};



// ==================== 宗门配置 ====================
const SECT_CONFIG = {
    unlockRealm: 'jindan',
    
    // 宗门列表
    sects: [
        { 
            id: 'tianji', 
            name: '天机门', 
            description: '擅长推演天机，掌握各种预言和占卜之术',
            uniqueSkills: [
                { id: 'tianji_suan', name: '天机算', description: '提升悟性和修炼速度' },
                { id: 'yinyang_zhi', name: '阴阳指', description: '强大的攻击技能' }
            ]
        },
        { 
            id: 'leijie', 
            name: '雷劫谷', 
            description: '专修雷属性功法，掌控雷电之力',
            uniqueSkills: [
                { id: 'tianlei_yin', name: '天雷引', description: '召唤天雷攻击敌人' },
                { id: 'leidian_shen', name: '雷帝身', description: '提升防御和速度' }
            ]
        },
        { 
            id: 'zifu', 
            name: '紫府仙宗', 
            description: '注重心境修炼，追求仙道极致',
            uniqueSkills: [
                { id: 'zifu_jue', name: '紫府诀', description: '提升灵力恢复速度' },
                { id: 'xianyuan_gong', name: '仙元功', description: '增强所有属性' }
            ]
        },
        { 
            id: 'xuanwu', 
            name: '玄武宗', 
            description: '以防御著称，修炼龟息之法',
            uniqueSkills: [
                { id: 'xuanwu_shield', name: '玄武盾', description: '强大的防御技能' },
                { id: 'guixi_fa', name: '龟息法', description: '提升生命值和恢复速度' }
            ]
        },
        { 
            id: 'qingyun', 
            name: '青云剑宗', 
            description: '以剑为尊，追求剑道极致',
            uniqueSkills: [
                { id: 'qingyun_jian', name: '青云剑', description: '强大的剑法技能' },
                { id: 'jianxin_zhu', name: '剑心烛', description: '提升攻击和暴击' }
            ]
        }
    ],
    
    // 宗门成员等级
    memberLevels: [
        { id: 'servant', name: '杂役', minContribution: 0, maxTasks: 2, shopDiscount: 0 },
        { id: 'outer', name: '外门弟子', minContribution: 100, maxTasks: 3, shopDiscount: 0.05 },
        { id: 'inner', name: '内门弟子', minContribution: 500, maxTasks: 4, shopDiscount: 0.1 },
        { id: 'true', name: '真传弟子', minContribution: 2000, maxTasks: 5, shopDiscount: 0.15 },
        { id: 'personal', name: '亲传弟子', minContribution: 10000, maxTasks: 6, shopDiscount: 0.2 },
        { id: 'elder', name: '长老', minContribution: 10000, maxTasks: 7, shopDiscount: 0.25 },
        { id: 'protector', name: '护法', minContribution: 10000, maxTasks: 8, shopDiscount: 0.3 },
        { id: 'vice_master', name: '副宗主', minContribution: 10000, maxTasks: 9, shopDiscount: 0.35 },
        { id: 'master', name: '宗主', minContribution: 10000, maxTasks: 10, shopDiscount: 0.4 }
    ],
    
    // 宗门机构
    buildings: [
        { 
            id: 'task_hall', 
            name: '任务殿', 
            description: '发布宗门任务的地方，完成任务获得贡献点',
            maxTasksPerDay: 10,
            refreshCost: 100 // 刷新任务品质的贡献点消耗
        },
        { 
            id: 'scripture_hall', 
            name: '藏经阁', 
            description: '购买宗门秘籍的地方，根据身份购买不同功法',
            skillTypes: ['attack', 'defense', 'resource', 'special']
        },
        { 
            id: 'treasure_hall', 
            name: '珍宝阁', 
            description: '购买宗门商品的地方，消耗贡献点购买物品',
            refreshTime: 24 * 60 * 60 * 1000, // 24小时刷新
            maxItems: 10 // 物品数量上限
        },
        { 
            id: 'spirit_array', 
            name: '聚灵阵', 
            description: '提升修炼效率的地方，捐献灵石提升等级',
            maxLevel: 10,
            baseEfficiency: 1.0,
            efficiencyPerLevel: 0.1,
            upgradeCost: [1000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000]
        },
        { 
            id: 'alchemy_hall', 
            name: '丹器阁', 
            description: '提升炼丹成功率的地方，捐献灵石提升等级',
            maxLevel: 10,
            baseSuccessRate: 0.5,
            successRatePerLevel: 0.05,
            upgradeCost: [1000, 5000, 10000, 20000, 50000, 100000, 200000, 500000, 1000000, 2000000]
        }
    ],
    
    // 贡献点获取配置
    contribution: {
        task: {
            low: 10,
            medium: 25,
            high: 50,
            excellent: 100
        },
        donation: {
            spiritStone: 1, // 每捐献100灵石获得1贡献点
            immortalStone: 10 // 每捐献1仙晶获得10贡献点
        }
    },
    
    // 每日排名分配名额
    dailyRanking: {
        master: 1,
        vice_master: 2,
        protector: 4,
        elder: 8,
        personal: 36,
        true: 72
    }
};





// ==================== 礼包配置 ====================
const GIFT_CONFIG = {
    // 礼包类型
    types: [
        { id: 'free', name: '免费礼包' },
        { id: 'spiritStone', name: '灵石礼包' },
        { id: 'immortalStone', name: '仙晶礼包' },
        { id: 'rmb', name: '人民币礼包' }
    ],
    
    // 礼包列表
    gifts: [
        {
            id: 'gift_001',
            name: '新手礼包',
            type: 'free',
            items: [
                { id: 'healing_pill', name: '疗伤丹', quantity: 10 },
                { id: 'spirit_stone', name: '灵石', quantity: 1000 },
                { id: 'exp_pill', name: '经验丹', quantity: 5 }
            ],
            startTime: '2024-01-01 00:00:00',
            endTime: '2027-12-31 23:59:59',
            limit: {
                daily: 1,  // 每天可购买1次
                total: 1   // 总共可购买1次
            }
        },
        {
            id: 'gift_002',
            name: '灵石礼包',
            type: 'spiritStone',
            price: 5000,
            items: [
                { id: 'spirit_stone', name: '灵石', quantity: 10000 },
                { id: 'enhance_stone', name: '强化石', quantity: 50 },
                { id: 'refine_stone', name: '洗炼石', quantity: 30 }
            ],
            startTime: '2024-01-01 00:00:00',
            endTime: '2027-12-31 23:59:59',
            limit: {
                daily: 3,  // 每天可购买3次
                total: 999   // 总共可购买999次
            }
        },
        {
            id: 'gift_003',
            name: '仙晶礼包',
            type: 'immortalStone',
            price: 100,
            items: [
                { id: 'immortal_stone', name: '仙晶', quantity: 200 },
                { id: 'spirit_stone', name: '灵石', quantity: 50000 },
                { id: 'exp_pill', name: '经验丹', quantity: 20 },
                { id: 'healing_pill', name: '疗伤丹', quantity: 50 }
            ],
            startTime: '2024-01-01 00:00:00',
            endTime: '2027-12-31 23:59:59',
            limit: {
                daily: 2,  // 每天可购买2次
                total: 999   // 总共可购买999次
            }
        },
        {
            id: 'gift_004',
            name: '豪华礼包',
            type: 'rmb',
            price: 648,
            items: [
                { id: 'immortal_stone', name: '仙晶', quantity: 10000 },
                { id: 'spirit_stone', name: '灵石', quantity: 1000000 },
                { id: 'enhance_stone', name: '强化石', quantity: 1000 },
                { id: 'refine_stone', name: '洗炼石', quantity: 500 },
                { id: 'special_item', name: '特殊物品', quantity: 1 }
            ],
            startTime: '2024-01-01 00:00:00',
            endTime: '2027-12-31 23:59:59',
            limit: {
                daily: 1,  // 每天可购买1次
                total: 999   // 总共可购买999次
            }
        }
    ]
};

// ==================== 签到配置 ====================
const CHECKIN_CONFIG = {
    // 新手签到（7天）
    newbie: [
        {
            day: 1,
            items: [
                { id: 'spirit_stone', name: '灵石', quantity: 1000 },
                { id: 'healing_pill', name: '疗伤丹', quantity: 5 }
            ]
        },
        {
            day: 2,
            items: [
                { id: 'spirit_stone', name: '灵石', quantity: 2000 },
                { id: 'exp_pill', name: '经验丹', quantity: 3 }
            ]
        },
        {
            day: 3,
            items: [
                { id: 'spirit_stone', name: '灵石', quantity: 3000 },
                { id: 'enhance_stone', name: '强化石', quantity: 10 }
            ]
        },
        {
            day: 4,
            items: [
                { id: 'spirit_stone', name: '灵石', quantity: 4000 },
                { id: 'refine_stone', name: '洗炼石', quantity: 10 }
            ]
        },
        {
            day: 5,
            items: [
                { id: 'spirit_stone', name: '灵石', quantity: 5000 },
                { id: 'exp_pill', name: '经验丹', quantity: 5 },
                { id: 'healing_pill', name: '疗伤丹', quantity: 10 }
            ]
        },
        {
            day: 6,
            items: [
                { id: 'spirit_stone', name: '灵石', quantity: 6000 },
                { id: 'enhance_stone', name: '强化石', quantity: 20 },
                { id: 'refine_stone', name: '洗炼石', quantity: 20 }
            ]
        },
        {
            day: 7,
            items: [
                { id: 'immortal_stone', name: '仙晶', quantity: 100 },
                { id: 'spirit_stone', name: '灵石', quantity: 10000 },
                { id: 'exp_pill', name: '经验丹', quantity: 10 },
                { id: 'healing_pill', name: '疗伤丹', quantity: 20 }
            ]
        }
    ],
    // 日常签到（7天）
    daily: [
        {
            day: 1,
            items: [
                { id: 'spirit_stone', name: '灵石', quantity: 500 },
                { id: 'healing_pill', name: '疗伤丹', quantity: 2 }
            ]
        },
        {
            day: 2,
            items: [
                { id: 'spirit_stone', name: '灵石', quantity: 800 },
                { id: 'exp_pill', name: '经验丹', quantity: 1 }
            ]
        },
        {
            day: 3,
            items: [
                { id: 'spirit_stone', name: '灵石', quantity: 1000 },
                { id: 'enhance_stone', name: '强化石', quantity: 5 }
            ]
        },
        {
            day: 4,
            items: [
                { id: 'spirit_stone', name: '灵石', quantity: 1200 },
                { id: 'refine_stone', name: '洗炼石', quantity: 5 }
            ]
        },
        {
            day: 5,
            items: [
                { id: 'spirit_stone', name: '灵石', quantity: 1500 },
                { id: 'exp_pill', name: '经验丹', quantity: 2 },
                { id: 'healing_pill', name: '疗伤丹', quantity: 5 }
            ]
        },
        {
            day: 6,
            items: [
                { id: 'spirit_stone', name: '灵石', quantity: 2000 },
                { id: 'enhance_stone', name: '强化石', quantity: 10 },
                { id: 'refine_stone', name: '洗炼石', quantity: 10 }
            ]
        },
        {
            day: 7,
            items: [
                { id: 'immortal_stone', name: '仙晶', quantity: 50 },
                { id: 'spirit_stone', name: '灵石', quantity: 3000 },
                { id: 'exp_pill', name: '经验丹', quantity: 5 },
                { id: 'healing_pill', name: '疗伤丹', quantity: 10 }
            ]
        }
    ]
};

// ==================== 成就配置 ====================
const ACHIEVEMENT_CONFIG = {
    // 成就类型
    types: [
        { id: 'realm', name: '境界成就' },
        { id: 'immortalStone', name: '仙晶成就' },
        { id: 'monster', name: '怪物击杀成就' },
        { id: 'equipment', name: '装备成就' },
        { id: 'alchemy', name: '炼丹成就' },
        { id: 'stamina', name: '体力消耗成就' },
        { id: 'enhance', name: '强化石消耗成就' },
        { id: 'refine', name: '洗练石消耗成就' },
        { id: 'skill', name: '功法成就' }
    ],
    
    // 成就列表
    achievements: [
        // 境界成就
        {
            id: 'realm_001',
            type: 'realm',
            name: '初入修真',
            description: '达成炼气期',
            condition: { realm: 3 }, // 炼气期（索引3）
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 1000 },
                { id: 'healing_pill', name: '疗伤丹', quantity: 10 }
            ],
            order: 1
        },
        {
            id: 'realm_002',
            type: 'realm',
            name: '道途初现',
            description: '达成筑基期',
            condition: { realm: 4 }, // 筑基期（索引4）
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 5000 },
                { id: 'exp_pill', name: '经验丹', quantity: 5 },
                { id: 'enhance_stone', name: '强化石', quantity: 20 }
            ],
            order: 2
        },
        {
            id: 'realm_003',
            type: 'realm',
            name: '金丹大道',
            description: '达成金丹期',
            condition: { realm: 5 }, // 金丹期（索引5）
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 10000 },
                { id: 'immortal_stone', name: '仙晶', quantity: 50 },
                { id: 'exp_pill', name: '经验丹', quantity: 10 },
                { id: 'refine_stone', name: '洗炼石', quantity: 30 }
            ],
            order: 3
        },
        {
            id: 'realm_004',
            type: 'realm',
            name: '元婴出窍',
            description: '达成元婴期',
            condition: { realm: 6 }, // 元婴期（索引6）
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 50000 },
                { id: 'immortal_stone', name: '仙晶', quantity: 100 },
                { id: 'exp_pill', name: '经验丹', quantity: 20 },
                { id: 'enhance_stone', name: '强化石', quantity: 50 }
            ],
            order: 4
        },
        {
            id: 'realm_005',
            type: 'realm',
            name: '化神飞升',
            description: '达成化神期',
            condition: { realm: 7 }, // 化神期（索引7）
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 100000 },
                { id: 'immortal_stone', name: '仙晶', quantity: 200 },
                { id: 'exp_pill', name: '经验丹', quantity: 30 },
                { id: 'refine_stone', name: '洗炼石', quantity: 50 }
            ],
            order: 5
        },
        
        // 仙晶成就
        {
            id: 'immortalStone_001',
            type: 'immortalStone',
            name: '仙晶初得',
            description: '累计获得100仙晶',
            condition: { amount: 100 },
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 2000 },
                { id: 'healing_pill', name: '疗伤丹', quantity: 15 }
            ],
            order: 1
        },
        {
            id: 'immortalStone_002',
            type: 'immortalStone',
            name: '仙晶积累',
            description: '累计获得500仙晶',
            condition: { amount: 500 },
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 5000 },
                { id: 'exp_pill', name: '经验丹', quantity: 10 },
                { id: 'enhance_stone', name: '强化石', quantity: 25 }
            ],
            order: 2
        },
        
        // 怪物击杀成就
        {
            id: 'monster_001',
            type: 'monster',
            name: '初露锋芒',
            description: '累计击杀100只怪物',
            condition: { amount: 100 },
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 1500 },
                { id: 'healing_pill', name: '疗伤丹', quantity: 10 }
            ],
            order: 1
        },
        {
            id: 'monster_002',
            type: 'monster',
            name: '斩妖除魔',
            description: '累计击杀500只怪物',
            condition: { amount: 500 },
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 3000 },
                { id: 'exp_pill', name: '经验丹', quantity: 8 },
                { id: 'enhance_stone', name: '强化石', quantity: 20 }
            ],
            order: 2
        },
        
        // 装备成就
        {
            id: 'equipment_001',
            type: 'equipment',
            name: '装备收集',
            description: '累计获得5件绝品品质装备',
            condition: { amount: 5, quality: 'exquisite' },
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 2500 },
                { id: 'enhance_stone', name: '强化石', quantity: 30 }
            ],
            order: 1
        },
        {
            id: 'equipment_002',
            type: 'equipment',
            name: '装备大师',
            description: '累计获得10件绝品品质装备',
            condition: { amount: 10, quality: 'exquisite' },
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 5000 },
                { id: 'immortal_stone', name: '仙晶', quantity: 30 },
                { id: 'refine_stone', name: '洗炼石', quantity: 40 }
            ],
            order: 2
        },
        
        // 炼丹成就
        {
            id: 'alchemy_001',
            type: 'alchemy',
            name: '炼丹入门',
            description: '累计炼制10颗一阶丹药',
            condition: { amount: 10, level: 1 },
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 2000 },
                { id: 'healing_pill', name: '疗伤丹', quantity: 20 }
            ],
            order: 1
        },
        {
            id: 'alchemy_002',
            type: 'alchemy',
            name: '炼丹大师',
            description: '累计炼制50颗一阶丹药',
            condition: { amount: 50, level: 1 },
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 4000 },
                { id: 'exp_pill', name: '经验丹', quantity: 12 },
                { id: 'immortal_stone', name: '仙晶', quantity: 20 }
            ],
            order: 2
        },
        
        // 体力消耗成就
        {
            id: 'stamina_001',
            type: 'stamina',
            name: '体力消耗',
            description: '累计消耗1000体力',
            condition: { amount: 1000 },
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 1500 },
                { id: 'healing_pill', name: '疗伤丹', quantity: 15 }
            ],
            order: 1
        },
        {
            id: 'stamina_002',
            type: 'stamina',
            name: '体力大师',
            description: '累计消耗5000体力',
            condition: { amount: 5000 },
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 3000 },
                { id: 'exp_pill', name: '经验丹', quantity: 10 },
                { id: 'enhance_stone', name: '强化石', quantity: 25 }
            ],
            order: 2
        },
        
        // 强化石消耗成就
        {
            id: 'enhance_001',
            type: 'enhance',
            name: '强化入门',
            description: '累计消耗100强化石',
            condition: { amount: 100 },
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 2000 },
                { id: 'enhance_stone', name: '强化石', quantity: 20 }
            ],
            order: 1
        },
        {
            id: 'enhance_002',
            type: 'enhance',
            name: '强化大师',
            description: '累计消耗500强化石',
            condition: { amount: 500 },
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 4000 },
                { id: 'enhance_stone', name: '强化石', quantity: 50 },
                { id: 'refine_stone', name: '洗炼石', quantity: 30 }
            ],
            order: 2
        },
        
        // 洗练石消耗成就
        {
            id: 'refine_001',
            type: 'refine',
            name: '洗练入门',
            description: '累计消耗100洗练石',
            condition: { amount: 100 },
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 2000 },
                { id: 'refine_stone', name: '洗炼石', quantity: 20 }
            ],
            order: 1
        },
        {
            id: 'refine_002',
            type: 'refine',
            name: '洗练大师',
            description: '累计消耗500洗练石',
            condition: { amount: 500 },
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 4000 },
                { id: 'refine_stone', name: '洗炼石', quantity: 50 },
                { id: 'enhance_stone', name: '强化石', quantity: 30 }
            ],
            order: 2
        },
        
        // 功法成就
        {
            id: 'skill_001',
            type: 'skill',
            name: '功法入门',
            description: '累计获得3本熟练度达到熟练的功法',
            condition: { amount: 3, proficiency: 2 }, // 熟练度2 = 熟练
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 2500 },
                { id: 'exp_pill', name: '经验丹', quantity: 8 }
            ],
            order: 1
        },
        {
            id: 'skill_002',
            type: 'skill',
            name: '功法大师',
            description: '累计获得5本熟练度达到精通的功法',
            condition: { amount: 5, proficiency: 3 }, // 熟练度3 = 精通
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 5000 },
                { id: 'immortal_stone', name: '仙晶', quantity: 40 },
                { id: 'exp_pill', name: '经验丹', quantity: 15 }
            ],
            order: 2
        },
        {
            id: 'skill_003',
            type: 'skill',
            name: '功法圆满',
            description: '累计获得3本熟练度达到圆满的功法',
            condition: { amount: 3, proficiency: 6 }, // 熟练度6 = 圆满
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 20000 },
                { id: 'immortal_stone', name: '仙晶', quantity: 100 },
                { id: 'exp_pill', name: '经验丹', quantity: 30 }
            ],
            order: 3
        }
    ]
};

// ==================== 坊市配置 ====================
const MARKET_CONFIG = {
    // 商铺配置
    shop: {
        items: [
            {
                id: 'shop_001',
                name: '疗伤丹',
                type: 'consumable',
                price: 100,
                currency: 'spirit_stone',
                stock: -1, // -1表示无限库存
                description: '恢复少量生命值'
            },
            {
                id: 'shop_002',
                name: '经验丹',
                type: 'consumable',
                price: 200,
                currency: 'spirit_stone',
                stock: -1,
                description: '增加少量经验'
            },
            {
                id: 'shop_003',
                name: '强化石',
                type: 'material',
                price: 500,
                currency: 'spirit_stone',
                stock: -1,
                description: '用于装备强化'
            },
            {
                id: 'shop_004',
                name: '洗炼石',
                type: 'material',
                price: 800,
                currency: 'spirit_stone',
                stock: -1,
                description: '用于装备洗炼'
            },
            {
                id: 'shop_005',
                name: '仙晶',
                type: 'currency',
                price: 10000,
                currency: 'spirit_stone',
                stock: -1,
                description: '珍贵的货币'
            }
        ]
    },
    
    // 交易行配置
    auction: {
        feeRate: 0.1, // 手续费率
        expireTime: 72 * 60 * 60 * 1000, // 72小时
        maxItemsPerUser: 10 // 每个用户最多寄售10件物品
    },
    
    // 黑市配置
    blackMarket: {
        refreshTime: 12 * 60 * 60 * 1000, // 12小时
        baseItems: 6, // 基础刷新数量
        vipBonus: 2, // VIP额外数量
        adRefreshCost: 0 // 看广告刷新成本
    }
};

// ==================== 万妖塔配置 ====================
const TOWER_CONFIG = {
    // 第一层怪物基础属性
    baseMonster: {
        name: '妖兽',
        level: 1,
        hp: 500,
        attack: 50,
        defense: 20,
        speed: 10
    },
    
    // 属性提升规则
    attributeGrowth: {
        normal: 1.2,      // 普通关卡提升20%
        milestone: 1.5    // 10的倍数关卡提升50%
    },
    
    // 首次通关奖励池
    firstClearRewards: [
        { id: 'spirit_stone', name: '灵石', minQuantity: 1000, maxQuantity: 5000, weight: 30 },
        { id: 'immortal_stone', name: '仙晶', minQuantity: 10, maxQuantity: 50, weight: 20 },
        { id: 'exp_pill', name: '经验丹', minQuantity: 5, maxQuantity: 20, weight: 25 },
        { id: 'enhance_stone', name: '强化石', minQuantity: 10, maxQuantity: 30, weight: 15 },
        { id: 'refine_stone', name: '洗炼石', minQuantity: 5, maxQuantity: 15, weight: 10 }
    ],
    
    // 扫荡奖励池
    sweepRewards: [
        { id: 'spirit_stone', name: '灵石', minQuantity: 100, maxQuantity: 500, weight: 40 },
        { id: 'exp_pill', name: '经验丹', minQuantity: 1, maxQuantity: 5, weight: 30 },
        { id: 'enhance_stone', name: '强化石', minQuantity: 1, maxQuantity: 5, weight: 20 },
        { id: 'refine_stone', name: '洗炼石', minQuantity: 1, maxQuantity: 3, weight: 10 }
    ],
    
    // 体力消耗
    staminaCost: {
        challenge: 1,     // 挑战消耗1点体力
        sweepAd: 0        // 扫荡看广告，不消耗体力
    },
    
    // 怪物名称列表
    monsterNames: [
        '妖兽', '妖狼', '妖虎', '妖蛇', '妖熊',
        '妖狐', '妖鹰', '妖龟', '妖龙', '妖凤',
        '妖王', '妖皇', '妖帝', '妖圣', '妖神'
    ],
    
    // 每10层怪物名称变化
    monsterNameLevels: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150]
};

// ==================== 封神榜配置 ====================
const GOD_LIST_CONFIG = {
    // 上榜名额
    maxSlots: 365,
    
    // 更新间隔（毫秒）
    updateInterval: 60 * 60 * 1000, // 1小时
    
    // 奖励发放时间（小时:分钟）
    rewardTime: {
        hour: 3,
        minute: 5
    },
    
    // 离线时间阈值（毫秒）
    offlineThreshold: 7 * 24 * 60 * 60 * 1000, // 7天
    
    // 奖励档次
    rewardTiers: [
        {
            name: '第一名',
            minRank: 1,
            maxRank: 1,
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 100000 },
                { id: 'immortal_stone', name: '仙晶', quantity: 1000 },
                { id: 'exp_pill', name: '经验丹', quantity: 100 },
                { id: 'enhance_stone', name: '强化石', quantity: 50 }
            ]
        },
        {
            name: '第二名',
            minRank: 2,
            maxRank: 2,
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 80000 },
                { id: 'immortal_stone', name: '仙晶', quantity: 800 },
                { id: 'exp_pill', name: '经验丹', quantity: 80 },
                { id: 'enhance_stone', name: '强化石', quantity: 40 }
            ]
        },
        {
            name: '第三名',
            minRank: 3,
            maxRank: 3,
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 60000 },
                { id: 'immortal_stone', name: '仙晶', quantity: 600 },
                { id: 'exp_pill', name: '经验丹', quantity: 60 },
                { id: 'enhance_stone', name: '强化石', quantity: 30 }
            ]
        },
        {
            name: '第4名到10名',
            minRank: 4,
            maxRank: 10,
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 40000 },
                { id: 'immortal_stone', name: '仙晶', quantity: 400 },
                { id: 'exp_pill', name: '经验丹', quantity: 40 },
                { id: 'enhance_stone', name: '强化石', quantity: 20 }
            ]
        },
        {
            name: '第11名到20名',
            minRank: 11,
            maxRank: 20,
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 30000 },
                { id: 'immortal_stone', name: '仙晶', quantity: 300 },
                { id: 'exp_pill', name: '经验丹', quantity: 30 },
                { id: 'enhance_stone', name: '强化石', quantity: 15 }
            ]
        },
        {
            name: '第21名到50名',
            minRank: 21,
            maxRank: 50,
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 20000 },
                { id: 'immortal_stone', name: '仙晶', quantity: 200 },
                { id: 'exp_pill', name: '经验丹', quantity: 20 },
                { id: 'enhance_stone', name: '强化石', quantity: 10 }
            ]
        },
        {
            name: '第51名到100名',
            minRank: 51,
            maxRank: 100,
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 15000 },
                { id: 'immortal_stone', name: '仙晶', quantity: 150 },
                { id: 'exp_pill', name: '经验丹', quantity: 15 },
                { id: 'enhance_stone', name: '强化石', quantity: 8 }
            ]
        },
        {
            name: '第101名到200名',
            minRank: 101,
            maxRank: 200,
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 10000 },
                { id: 'immortal_stone', name: '仙晶', quantity: 100 },
                { id: 'exp_pill', name: '经验丹', quantity: 10 },
                { id: 'enhance_stone', name: '强化石', quantity: 5 }
            ]
        },
        {
            name: '第201名到365名',
            minRank: 201,
            maxRank: 365,
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 5000 },
                { id: 'immortal_stone', name: '仙晶', quantity: 50 },
                { id: 'exp_pill', name: '经验丹', quantity: 5 },
                { id: 'enhance_stone', name: '强化石', quantity: 3 }
            ]
        }
    ]
};

// ==================== 仙武台配置 ====================
const MARTIAL_STAGE_CONFIG = {
    // 解锁境界
    unlockRealm: 'innate', // 先天境
    
    // 每日挑战次数
    dailyChallengeLimit: 10,
    
    // 积分规则
    points: {
        win: {
            higher: 3, // 战胜高于自身境界的对手
            lowerOrEqual: 1 // 战胜低于或等于自身境界的对手
        },
        lose: {
            higher: 1, // 败给高于自身境界的对手
            lowerOrEqual: 3 // 败给低于或等于自身境界的对手
        }
    },
    
    // 排行榜配置
    ranking: {
        maxSlots: 100, // 排行榜最多显示100名
        offlineThreshold: 3 * 24 * 60 * 60 * 1000 // 3天未登录移除
    },
    
    // 奖励发放时间（小时:分钟）
    rewardTime: {
        hour: 4,
        minute: 5
    },
    
    // 奖励配置（前10名）
    rewards: [
        {
            rank: 1,
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 200000 },
                { id: 'immortal_stone', name: '仙晶', quantity: 2000 },
                { id: 'exp_pill', name: '经验丹', quantity: 200 },
                { id: 'enhance_stone', name: '强化石', quantity: 100 }
            ]
        },
        {
            rank: 2,
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 150000 },
                { id: 'immortal_stone', name: '仙晶', quantity: 1500 },
                { id: 'exp_pill', name: '经验丹', quantity: 150 },
                { id: 'enhance_stone', name: '强化石', quantity: 80 }
            ]
        },
        {
            rank: 3,
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 100000 },
                { id: 'immortal_stone', name: '仙晶', quantity: 1000 },
                { id: 'exp_pill', name: '经验丹', quantity: 100 },
                { id: 'enhance_stone', name: '强化石', quantity: 60 }
            ]
        },
        {
            rank: 4,
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 80000 },
                { id: 'immortal_stone', name: '仙晶', quantity: 800 },
                { id: 'exp_pill', name: '经验丹', quantity: 80 },
                { id: 'enhance_stone', name: '强化石', quantity: 40 }
            ]
        },
        {
            rank: 5,
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 60000 },
                { id: 'immortal_stone', name: '仙晶', quantity: 600 },
                { id: 'exp_pill', name: '经验丹', quantity: 60 },
                { id: 'enhance_stone', name: '强化石', quantity: 30 }
            ]
        },
        {
            rank: 6,
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 50000 },
                { id: 'immortal_stone', name: '仙晶', quantity: 500 },
                { id: 'exp_pill', name: '经验丹', quantity: 50 },
                { id: 'enhance_stone', name: '强化石', quantity: 25 }
            ]
        },
        {
            rank: 7,
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 40000 },
                { id: 'immortal_stone', name: '仙晶', quantity: 400 },
                { id: 'exp_pill', name: '经验丹', quantity: 40 },
                { id: 'enhance_stone', name: '强化石', quantity: 20 }
            ]
        },
        {
            rank: 8,
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 30000 },
                { id: 'immortal_stone', name: '仙晶', quantity: 300 },
                { id: 'exp_pill', name: '经验丹', quantity: 30 },
                { id: 'enhance_stone', name: '强化石', quantity: 15 }
            ]
        },
        {
            rank: 9,
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 20000 },
                { id: 'immortal_stone', name: '仙晶', quantity: 200 },
                { id: 'exp_pill', name: '经验丹', quantity: 20 },
                { id: 'enhance_stone', name: '强化石', quantity: 10 }
            ]
        },
        {
            rank: 10,
            rewards: [
                { id: 'spirit_stone', name: '灵石', quantity: 10000 },
                { id: 'immortal_stone', name: '仙晶', quantity: 100 },
                { id: 'exp_pill', name: '经验丹', quantity: 10 },
                { id: 'enhance_stone', name: '强化石', quantity: 5 }
            ]
        }
    ]
};

// ==================== 导出配置 ====================
var GameConfig = {
    ITEMS: ITEMS_CONFIG,
    REALM: REALM_CONFIG,
    SKILL: SKILL_CONFIG,
    EQUIPMENT: EQUIPMENT_CONFIG,
    TRAINING: TRAINING_CONFIG,
    SECT: SECT_CONFIG,
    GIFT: GIFT_CONFIG,
    CHECKIN: CHECKIN_CONFIG,
    ACHIEVEMENT: ACHIEVEMENT_CONFIG,
    MARKET: MARKET_CONFIG,
    TOWER: TOWER_CONFIG,
    GOD_LIST: GOD_LIST_CONFIG,
    MARTIAL_STAGE: MARTIAL_STAGE_CONFIG
};

// 兼容模块导出和全局变量
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameConfig;
} else if (typeof global !== 'undefined') {
    global.GameConfig = GameConfig;
} else if (typeof window !== 'undefined') {
    window.GameConfig = GameConfig;
}
