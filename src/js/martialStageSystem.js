/**
 * 仙武台系统
 * 负责仙武台的挑战、积分计算、排行榜更新、奖励发放等功能
 * @version 1.0.0
 */

class MartialStageSystem {
    /**
     * 构造函数
     * @param {GameEngine} gameEngine - 游戏引擎实例
     */
    constructor(gameEngine) {
        this.engine = gameEngine;
        this.config = GameConfig.MARTIAL_STAGE;
        this.init();
        this.startUpdateInterval();
    }

    /**
     * 初始化仙武台系统
     */
    init() {
        if (!this.engine.state.data.martialStage) {
            this.engine.state.data.martialStage = {
                ranking: [],           // 排行榜
                lastRewardTime: null,  // 最后奖励发放时间
                dailyChallenges: {}    // 每日挑战次数
            };
        }
    }

    /**
     * 开始更新间隔
     */
    startUpdateInterval() {
        // 每天凌晨4:05发放奖励
        setInterval(() => {
            const now = new Date();
            if (now.getHours() === this.config.rewardTime.hour && 
                now.getMinutes() === this.config.rewardTime.minute) {
                this.grantRewards();
            }
        }, 60000); // 每分钟检查一次

        // 清理未登录用户
        setInterval(() => {
            this.cleanupInactiveUsers();
        }, 60 * 60 * 1000); // 每小时检查一次
    }

    /**
     * 检查是否解锁仙武台
     * @returns {boolean} 是否解锁
     */
    isUnlocked() {
        const playerRealm = this.engine.state.data.realm.currentRealm;
        // 先天境对应的境界索引是1（假设0是炼气期，1是先天境）
        return playerRealm >= 1;
    }

    /**
     * 获取每日挑战次数
     * @returns {number} 剩余挑战次数
     */
    getRemainingChallenges() {
        const today = new Date().toDateString();
        if (!this.engine.state.data.martialStage.dailyChallenges[today]) {
            this.engine.state.data.martialStage.dailyChallenges[today] = 0;
        }
        return this.config.dailyChallengeLimit - this.engine.state.data.martialStage.dailyChallenges[today];
    }

    /**
     * 增加挑战次数
     */
    incrementChallengeCount() {
        const today = new Date().toDateString();
        if (!this.engine.state.data.martialStage.dailyChallenges[today]) {
            this.engine.state.data.martialStage.dailyChallenges[today] = 0;
        }
        this.engine.state.data.martialStage.dailyChallenges[today]++;
    }

    /**
     * 获取挑战对手
     * @returns {Object} 对手信息
     */
    getOpponent() {
        // 优先从玩家中选择对手
        const players = this.getEligiblePlayers();
        if (players.length > 0) {
            const randomIndex = Math.floor(Math.random() * players.length);
            return players[randomIndex];
        }
        
        // 如果没有玩家，从封神榜的机器人数据中选择
        return this.getRobotOpponent();
    }

    /**
     * 获取符合条件的玩家
     * @returns {Array} 玩家列表
     */
    getEligiblePlayers() {
        // 这里简化处理，实际应该从服务器获取其他玩家数据
        // 这里返回空数组，模拟没有其他玩家的情况
        return [];
    }

    /**
     * 获取机器人对手
     * @returns {Object} 机器人对手信息
     */
    getRobotOpponent() {
        // 从封神榜的机器人数据中选择
        const godList = this.engine.state.data.godList.players;
        if (godList && godList.length > 0) {
            // 随机选择一个机器人
            const randomIndex = Math.floor(Math.random() * godList.length);
            const robot = godList[randomIndex];
            
            // 转换为仙武台对手格式
            return {
                id: robot.id,
                name: robot.name,
                realm: robot.realm,
                bodyLevel: robot.bodyLevel,
                cultivationLevel: robot.cultivationLevel
            };
        }
        
        // 如果没有机器人数据，返回默认对手
        return {
            id: 'default_opponent',
            name: '修仙者',
            realm: 'innate',
            bodyLevel: '凡人',
            cultivationLevel: 100
        };
    }

    /**
     * 挑战对手
     * @param {Object} opponent - 对手信息
     * @returns {Object} 挑战结果
     */
    challenge(opponent) {
        // 检查是否解锁仙武台
        if (!this.isUnlocked()) {
            return { success: false, message: '未达到先天境，无法挑战仙武台' };
        }
        
        // 检查挑战次数
        if (this.getRemainingChallenges() <= 0) {
            return { success: false, message: '今日挑战次数已用完' };
        }
        
        // 计算战斗结果
        const playerPower = this.getPlayerPower();
        const opponentPower = this.getOpponentPower(opponent);
        
        // 战斗结果（50%基础胜率，根据实力差距调整）
        const baseWinRate = 0.5;
        const powerRatio = playerPower / opponentPower;
        const winRate = Math.min(0.95, Math.max(0.05, baseWinRate * powerRatio));
        const isWin = Math.random() < winRate;
        
        // 计算积分变化
        const pointsChange = this.calculatePointsChange(isWin, opponent);
        
        // 更新玩家积分
        this.updatePlayerPoints(pointsChange);
        
        // 增加挑战次数
        this.incrementChallengeCount();
        
        // 更新排行榜
        this.updateRanking();
        
        return {
            success: true,
            isWin,
            pointsChange,
            opponent
        };
    }

    /**
     * 获取玩家实力
     * @returns {number} 实力值
     */
    getPlayerPower() {
        const player = this.engine.state.data;
        const cultivationLevel = player.realm.currentRealm * 100 + player.realm.currentLayer * 10;
        const bodyLevel = player.bodyTraining ? player.bodyTraining.level : 0;
        return cultivationLevel + bodyLevel * 0.5;
    }

    /**
     * 获取对手实力
     * @param {Object} opponent - 对手信息
     * @returns {number} 实力值
     */
    getOpponentPower(opponent) {
        return opponent.cultivationLevel || 100;
    }

    /**
     * 计算积分变化
     * @param {boolean} isWin - 是否胜利
     * @param {string} opponentRealm - 对手境界
     * @returns {number} 积分变化
     */
    calculatePointsChange(isWin, opponent) {
        const playerRealm = this.engine.state.data.realm.currentRealm;
        const playerCultivationLevel = playerRealm * 100 + this.engine.state.data.realm.currentLayer * 10;
        const opponentCultivationLevel = opponent.cultivationLevel || 0;
        
        if (isWin) {
            if (opponentCultivationLevel > playerCultivationLevel) {
                return this.config.points.win.higher;
            } else {
                return this.config.points.win.lowerOrEqual;
            }
        } else {
            if (opponentCultivationLevel > playerCultivationLevel) {
                return -this.config.points.lose.higher;
            } else {
                return -this.config.points.lose.lowerOrEqual;
            }
        }
    }

    /**
     * 更新玩家积分
     * @param {number} pointsChange - 积分变化
     */
    updatePlayerPoints(pointsChange) {
        if (!this.engine.state.data.martialStage.playerPoints) {
            this.engine.state.data.martialStage.playerPoints = 0;
        }
        this.engine.state.data.martialStage.playerPoints += pointsChange;
        // 确保积分不为负
        if (this.engine.state.data.martialStage.playerPoints < 0) {
            this.engine.state.data.martialStage.playerPoints = 0;
        }
    }

    /**
     * 更新排行榜
     */
    updateRanking() {
        const ranking = this.engine.state.data.martialStage.ranking;
        const playerName = this.engine.state.data.player.name || 'player';
        const playerPoints = this.engine.state.data.martialStage.playerPoints || 0;
        const playerRealm = this.engine.state.data.realm.currentRealm;
        const playerBodyLevel = this.engine.state.data.bodyTraining ? this.engine.state.data.bodyTraining.level : 0;
        
        // 查找玩家在排行榜中的位置
        const playerIndex = ranking.findIndex(item => item.id === playerName);
        
        if (playerIndex !== -1) {
            // 更新玩家信息
            ranking[playerIndex] = {
                id: playerName,
                name: playerName,
                realm: playerRealm,
                bodyLevel: playerBodyLevel,
                points: playerPoints,
                lastOnlineTime: new Date().toISOString()
            };
        } else {
            // 添加新玩家
            ranking.push({
                id: playerName,
                name: playerName,
                realm: playerRealm,
                bodyLevel: playerBodyLevel,
                points: playerPoints,
                lastOnlineTime: new Date().toISOString()
            });
        }
        
        // 按积分排序
        ranking.sort((a, b) => b.points - a.points);
        
        // 限制排行榜数量
        if (ranking.length > this.config.ranking.maxSlots) {
            ranking.splice(this.config.ranking.maxSlots);
        }
    }

    /**
     * 清理未登录用户
     */
    cleanupInactiveUsers() {
        const ranking = this.engine.state.data.martialStage.ranking;
        const now = new Date();
        
        this.engine.state.data.martialStage.ranking = ranking.filter(user => {
            const lastOnline = new Date(user.lastOnlineTime);
            return (now - lastOnline) < this.config.ranking.offlineThreshold;
        });
    }

    /**
     * 发放奖励
     */
    grantRewards() {
        const ranking = this.engine.state.data.martialStage.ranking;
        const lastRewardTime = this.engine.state.data.martialStage.lastRewardTime;
        const today = new Date().toDateString();
        
        // 检查是否已经发放过今日奖励
        if (lastRewardTime && new Date(lastRewardTime).toDateString() === today) {
            return;
        }
        
        // 发放前10名奖励
        for (let i = 0; i < Math.min(10, ranking.length); i++) {
            const user = ranking[i];
            const reward = this.config.rewards.find(r => r.rank === i + 1);
            
            if (reward) {
                // 这里简化处理，实际应该给对应玩家发放奖励
                console.log(`给${user.name}（第${i + 1}名）发放奖励:`, reward.rewards);
            }
        }
        
        // 更新最后奖励发放时间
        this.engine.state.data.martialStage.lastRewardTime = new Date().toISOString();
    }

    /**
     * 获取仙武台信息
     * @returns {Object} 仙武台信息
     */
    getMartialStageInfo() {
        return {
            isUnlocked: this.isUnlocked(),
            remainingChallenges: this.getRemainingChallenges(),
            playerPoints: this.engine.state.data.martialStage.playerPoints || 0,
            ranking: this.engine.state.data.martialStage.ranking,
            playerRank: this.getPlayerRank()
        };
    }

    /**
     * 获取玩家排名
     * @returns {number} 排名
     */
    getPlayerRank() {
        const ranking = this.engine.state.data.martialStage.ranking;
        const playerName = this.engine.state.data.player.name || 'player';
        const playerIndex = ranking.findIndex(item => item.id === playerName);
        return playerIndex !== -1 ? playerIndex + 1 : 0;
    }
}

// 兼容模块导出和全局变量
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MartialStageSystem;
}
if (typeof global !== 'undefined') {
    global.MartialStageSystem = MartialStageSystem;
} else if (typeof window !== 'undefined') {
    window.MartialStageSystem = MartialStageSystem;
}
