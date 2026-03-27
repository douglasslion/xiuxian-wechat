/**
 * 封神榜系统
 * 负责封神榜的排名、更新、奖励发放等功能
 * @version 1.0.0
 */

class GodListSystem {
    /**
     * 构造函数
     * @param {GameEngine} gameEngine - 游戏引擎实例
     */
    constructor(gameEngine) {
        this.engine = gameEngine;
        this.config = GameConfig.GOD_LIST;
        this.init();
        this.startUpdateInterval();
    }

    /**
     * 初始化封神榜系统
     */
    init() {
        if (!this.engine.state.data.godList) {
            this.engine.state.data.godList = {
                players: [],           // 上榜玩家列表
                lastUpdateTime: null,  // 最后更新时间
                lastRewardTime: null   // 最后奖励发放时间
            };
        }
        
        // 初始化预设的365名正神
        if (this.engine.state.data.godList.players.length === 0) {
            this.initPresetGods();
        }
        
        this.updateGodList();
    }

    /**
     * 初始化预设的365名正神
     */
    initPresetGods() {
        const presetGods = this.getPresetGods();
        this.engine.state.data.godList.players = presetGods;
    }

    /**
     * 获取预设的365名正神
     * @returns {Array} 预设的正神列表
     */
    getPresetGods() {
        const gods = [];
        let rank = 1;
        
        // 三清
        gods.push(...this.createGods([
            { name: '元始天尊', realm: '圣人', bodyLevel: '混元大罗金仙' },
            { name: '灵宝天尊', realm: '圣人', bodyLevel: '混元大罗金仙' },
            { name: '道德天尊', realm: '圣人', bodyLevel: '混元大罗金仙' }
        ], rank, 1000));
        rank += 3;
        
        // 四御
        gods.push(...this.createGods([
            { name: '玉皇大帝', realm: '准圣', bodyLevel: '大罗金仙' },
            { name: '紫微大帝', realm: '准圣', bodyLevel: '大罗金仙' },
            { name: '勾陈大帝', realm: '准圣', bodyLevel: '大罗金仙' },
            { name: '后土娘娘', realm: '准圣', bodyLevel: '大罗金仙' }
        ], rank, 950));
        rank += 4;
        
        // 五老
        gods.push(...this.createGods([
            { name: '东方青帝', realm: '大罗金仙', bodyLevel: '太乙金仙' },
            { name: '南方赤帝', realm: '大罗金仙', bodyLevel: '太乙金仙' },
            { name: '中央黄帝', realm: '大罗金仙', bodyLevel: '太乙金仙' },
            { name: '西方白帝', realm: '大罗金仙', bodyLevel: '太乙金仙' },
            { name: '北方黑帝', realm: '大罗金仙', bodyLevel: '太乙金仙' }
        ], rank, 900));
        rank += 5;
        
        // 六司
        gods.push(...this.createGods([
            { name: '司命星君', realm: '太乙金仙', bodyLevel: '金仙' },
            { name: '司禄星君', realm: '太乙金仙', bodyLevel: '金仙' },
            { name: '司危星君', realm: '太乙金仙', bodyLevel: '金仙' },
            { name: '司非星君', realm: '太乙金仙', bodyLevel: '金仙' },
            { name: '司中星君', realm: '太乙金仙', bodyLevel: '金仙' },
            { name: '司过星君', realm: '太乙金仙', bodyLevel: '金仙' }
        ], rank, 850));
        rank += 6;
        
        // 七元（北斗七星君）
        gods.push(...this.createGods([
            { name: '天枢星君', realm: '太乙金仙', bodyLevel: '金仙' },
            { name: '天璇星君', realm: '太乙金仙', bodyLevel: '金仙' },
            { name: '天玑星君', realm: '太乙金仙', bodyLevel: '金仙' },
            { name: '天权星君', realm: '太乙金仙', bodyLevel: '金仙' },
            { name: '玉衡星君', realm: '太乙金仙', bodyLevel: '金仙' },
            { name: '开阳星君', realm: '太乙金仙', bodyLevel: '金仙' },
            { name: '摇光星君', realm: '太乙金仙', bodyLevel: '金仙' }
        ], rank, 800));
        rank += 7;
        
        // 八极（八方护法神）
        gods.push(...this.createGods([
            { name: '东方护法神', realm: '金仙', bodyLevel: '天仙' },
            { name: '南方护法神', realm: '金仙', bodyLevel: '天仙' },
            { name: '西方护法神', realm: '金仙', bodyLevel: '天仙' },
            { name: '北方护法神', realm: '金仙', bodyLevel: '天仙' },
            { name: '东南护法神', realm: '金仙', bodyLevel: '天仙' },
            { name: '西南护法神', realm: '金仙', bodyLevel: '天仙' },
            { name: '东北护法神', realm: '金仙', bodyLevel: '天仙' },
            { name: '西北护法神', realm: '金仙', bodyLevel: '天仙' }
        ], rank, 750));
        rank += 8;
        
        // 九曜（九曜星君）
        gods.push(...this.createGods([
            { name: '太阳星君', realm: '金仙', bodyLevel: '天仙' },
            { name: '太阴星君', realm: '金仙', bodyLevel: '天仙' },
            { name: '金星星君', realm: '金仙', bodyLevel: '天仙' },
            { name: '木星星君', realm: '金仙', bodyLevel: '天仙' },
            { name: '水星星君', realm: '金仙', bodyLevel: '天仙' },
            { name: '火星星君', realm: '金仙', bodyLevel: '天仙' },
            { name: '土星星君', realm: '金仙', bodyLevel: '天仙' },
            { name: '罗睺星君', realm: '金仙', bodyLevel: '天仙' },
            { name: '计都星君', realm: '金仙', bodyLevel: '天仙' }
        ], rank, 700));
        rank += 9;
        
        // 十都（十殿阎王）
        gods.push(...this.createGods([
            { name: '秦广王', realm: '金仙', bodyLevel: '天仙' },
            { name: '楚江王', realm: '金仙', bodyLevel: '天仙' },
            { name: '宋帝王', realm: '金仙', bodyLevel: '天仙' },
            { name: '五官王', realm: '金仙', bodyLevel: '天仙' },
            { name: '阎罗王', realm: '金仙', bodyLevel: '天仙' },
            { name: '卞城王', realm: '金仙', bodyLevel: '天仙' },
            { name: '泰山王', realm: '金仙', bodyLevel: '天仙' },
            { name: '都市王', realm: '金仙', bodyLevel: '天仙' },
            { name: '平等王', realm: '金仙', bodyLevel: '天仙' },
            { name: '转轮王', realm: '金仙', bodyLevel: '天仙' }
        ], rank, 650));
        rank += 10;
        
        // 二十八宿
        const twentyEightStars = [
            '角木蛟', '亢金龙', '氐土貉', '房日兔', '心月狐', '尾火虎', '箕水豹',
            '斗木獬', '牛金牛', '女土蝠', '虚日鼠', '危月燕', '室火猪', '壁水貐',
            '奎木狼', '娄金狗', '胃土雉', '昴日鸡', '毕月乌', '觜火猴', '参水猿',
            '井木犴', '鬼金羊', '柳土獐', '星日马', '张月鹿', '翼火蛇', '轸水蚓'
        ];
        const twentyEightGods = twentyEightStars.map(name => ({ name, realm: '天仙', bodyLevel: '地仙' }));
        gods.push(...this.createGods(twentyEightGods, rank, 600));
        rank += 28;
        
        // 三十六天罡
        const thirtySixTianGang = [
            '天魁星', '天罡星', '天机星', '天闲星', '天勇星', '天雄星', '天猛星', '天威星',
            '天英星', '天贵星', '天富星', '天满星', '天孤星', '天伤星', '天玄星', '天健星',
            '天暗星', '天佑星', '天空星', '天速星', '天异星', '天杀星', '天微星', '天究星',
            '天退星', '天寿星', '天剑星', '天平星', '天罪星', '天损星', '天败星', '天牢星',
            '天慧星', '天暴星', '天哭星', '天巧星'
        ];
        const thirtySixGods = thirtySixTianGang.map(name => ({ name, realm: '天仙', bodyLevel: '地仙' }));
        gods.push(...this.createGods(thirtySixGods, rank, 550));
        rank += 36;
        
        // 七十二地煞
        const seventyTwoDiSha = [
            '地魁星', '地煞星', '地勇星', '地杰星', '地雄星', '地威星', '地英星', '地奇星',
            '地猛星', '地文星', '地正星', '地辟星', '地阖星', '地强星', '地暗星', '地轴星',
            '地会星', '地佐星', '地佑星', '地灵星', '地兽星', '地微星', '地慧星', '地暴星',
            '地默星', '地猖星', '地狂星', '地飞星', '地走星', '地巧星', '地明星', '地进星',
            '地退星', '地满星', '地遂星', '地周星', '地隐星', '地异星', '地理星', '地俊星',
            '地乐星', '地捷星', '地速星', '地镇星', '地羁星', '地魔星', '地妖星', '地幽星',
            '地伏星', '地僻星', '地空星', '地孤星', '地全星', '地短星', '地角星', '地囚星',
            '地藏星', '地平星', '地损星', '地奴星', '地察星', '地恶星', '地丑星', '地数星',
            '地阴星', '地刑星', '地壮星', '地劣星', '地健星', '地耗星', '地贼星', '地狗星'
        ];
        const seventyTwoGods = seventyTwoDiSha.map(name => ({ name, realm: '地仙', bodyLevel: '人仙' }));
        gods.push(...this.createGods(seventyTwoGods, rank, 500));
        rank += 72;
        
        // 其他正神（补足365名）
        const remainingCount = 365 - gods.length;
        for (let i = 0; i < remainingCount; i++) {
            gods.push({
                id: `god_${rank}`,
                name: `正神${rank}`,
                realm: '人仙',
                bodyLevel: '凡人',
                cultivationLevel: 400 - Math.floor(i / 10),
                lastOnlineTime: new Date().toISOString()
            });
            rank++;
        }
        
        return gods;
    }

    /**
     * 创建一组正神
     * @param {Array} godInfos - 正神信息数组
     * @param {number} startRank - 起始排名
     * @param {number} baseLevel - 基础修为等级
     * @returns {Array} 创建的正神列表
     */
    createGods(godInfos, startRank, baseLevel) {
        const gods = [];
        godInfos.forEach((info, index) => {
            gods.push({
                id: `god_${startRank + index}`,
                name: info.name,
                realm: info.realm,
                bodyLevel: info.bodyLevel,
                cultivationLevel: baseLevel - index,
                lastOnlineTime: new Date().toISOString()
            });
        });
        return gods;
    }

    /**
     * 开始更新间隔
     */
    startUpdateInterval() {
        // 每小时更新一次榜单
        setInterval(() => {
            this.updateGodList();
        }, this.config.updateInterval);

        // 每天凌晨3:05发放奖励
        setInterval(() => {
            const now = new Date();
            if (now.getHours() === this.config.rewardTime.hour && 
                now.getMinutes() === this.config.rewardTime.minute) {
                this.grantRewards();
            }
        }, 60000); // 每分钟检查一次
    }

    /**
     * 更新封神榜
     */
    updateGodList() {
        // 检查离线用户
        this.checkOfflinePlayers();

        // 获取当前玩家信息
        const currentPlayer = this.getCurrentPlayerInfo();
        if (currentPlayer) {
            // 检查当前玩家是否在上榜列表中
            const existingIndex = this.engine.state.data.godList.players.findIndex(
                p => p.id === currentPlayer.id
            );

            if (existingIndex >= 0) {
                // 更新现有玩家信息
                this.engine.state.data.godList.players[existingIndex] = currentPlayer;
            } else {
                // 添加新玩家到榜单
                this.engine.state.data.godList.players.push(currentPlayer);
            }
        }

        // 排序玩家列表
        this.sortPlayers();

        // 限制榜单人数
        this.engine.state.data.godList.players = this.engine.state.data.godList.players.slice(0, this.config.maxSlots);

        // 更新最后更新时间
        this.engine.state.data.godList.lastUpdateTime = new Date().toISOString();

        // 保存状态
        this.engine.state.save();
    }

    /**
     * 检查离线用户
     */
    checkOfflinePlayers() {
        const now = new Date().getTime();
        this.engine.state.data.godList.players = this.engine.state.data.godList.players.filter(
            player => {
                const lastOnlineTime = new Date(player.lastOnlineTime).getTime();
                return (now - lastOnlineTime) < this.config.offlineThreshold;
            }
        );
    }

    /**
     * 获取当前玩家信息
     * @returns {Object} 玩家信息
     */
    getCurrentPlayerInfo() {
        if (!this.engine.state.data.player) return null;

        const realmConfig = this.engine.state.getCurrentRealmConfig();
        const bodyLevel = this.engine.state.data.bodyTraining ? this.engine.state.data.bodyTraining.level : 0;

        return {
            id: this.engine.state.data.player.id || 'player_' + Date.now(),
            name: this.engine.state.data.player.name,
            realm: realmConfig ? realmConfig.name : '炼气期',
            bodyLevel: bodyLevel,
            cultivationLevel: this.engine.state.data.realm.currentRealm * 100 + this.engine.state.data.realm.currentLayer * 10,
            lastOnlineTime: new Date().toISOString()
        };
    }

    /**
     * 排序玩家列表
     */
    sortPlayers() {
        this.engine.state.data.godList.players.sort((a, b) => {
            // 首先按修为境界排序
            if (a.cultivationLevel !== b.cultivationLevel) {
                return b.cultivationLevel - a.cultivationLevel;
            }
            // 修为境界相同时，按最后上线时间倒序排序
            return new Date(b.lastOnlineTime).getTime() - new Date(a.lastOnlineTime).getTime();
        });
    }

    /**
     * 发放奖励
     */
    grantRewards() {
        const now = new Date();
        const today = now.toDateString();
        const lastRewardDate = this.engine.state.data.godList.lastRewardTime ? 
            new Date(this.engine.state.data.godList.lastRewardTime).toDateString() : '';

        // 避免重复发放奖励
        if (today === lastRewardDate) return;

        // 为每个上榜玩家发放奖励
        this.engine.state.data.godList.players.forEach((player, index) => {
            const rank = index + 1;
            const tier = this.getRewardTier(rank);

            if (tier) {
                // 这里应该给玩家发放奖励
                // 由于是单机游戏，我们只记录奖励信息
                console.log(`给排名 ${rank} 的玩家 ${player.name} 发放奖励:`, tier.rewards);
            }
        });

        // 更新最后奖励发放时间
        this.engine.state.data.godList.lastRewardTime = now.toISOString();
        this.engine.state.save();
    }

    /**
     * 获取奖励档次
     * @param {number} rank - 排名
     * @returns {Object} 奖励档次
     */
    getRewardTier(rank) {
        return this.config.rewardTiers.find(tier => 
            rank >= tier.minRank && rank <= tier.maxRank
        );
    }

    /**
     * 获取封神榜信息
     * @returns {Object} 封神榜信息
     */
    getGodListInfo() {
        // 确保榜单是最新的
        this.updateGodList();

        return {
            players: this.engine.state.data.godList.players.map((player, index) => ({
                rank: index + 1,
                name: player.name,
                realm: player.realm,
                bodyLevel: player.bodyLevel,
                cultivationLevel: player.cultivationLevel
            })),
            lastUpdateTime: this.engine.state.data.godList.lastUpdateTime,
            maxSlots: this.config.maxSlots
        };
    }

    /**
     * 获取当前玩家在封神榜中的排名
     * @returns {number} 排名，0表示未上榜
     */
    getPlayerRank() {
        const currentPlayerId = this.engine.state.data.player?.id || 'player_' + Date.now();
        const index = this.engine.state.data.godList.players.findIndex(
            p => p.id === currentPlayerId
        );
        return index >= 0 ? index + 1 : 0;
    }

    /**
     * 用户上线时更新信息
     */
    onPlayerOnline() {
        this.updateGodList();
    }
}

// 兼容模块导出和全局变量
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GodListSystem;
}
if (typeof global !== 'undefined') {
    global.GodListSystem = GodListSystem;
} else if (typeof window !== 'undefined') {
    window.GodListSystem = GodListSystem;
}
