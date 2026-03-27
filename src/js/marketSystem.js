/**
 * 坊市系统模块
 * 处理坊市的核心逻辑，包括商铺购买、交易行寄售和购买、黑市刷新等功能
 * @version 1.0.0
 */

class MarketSystem {
    constructor(gameEngine) {
        this.engine = gameEngine;
        this.init();
    }

    /**
     * 初始化坊市系统
     */
    init() {
        // 确保游戏状态中有坊市相关的数据
        if (!this.engine.state.data.market) {
            this.engine.state.data.market = {
                shop: {
                    lastRestock: Date.now()
                },
                auction: {
                    items: [], // 寄售物品
                    bidLogs: [], // 竞拍日志
                    userAuctions: [] // 用户寄售的物品
                },
                blackMarket: {
                    items: [], // 黑市物品
                    lastRefresh: Date.now()
                }
            };
        }

        // 初始化黑市物品
        this.refreshBlackMarket();
    }

    /**
     * 获取商铺物品列表
     * @returns {Array} 商铺物品列表
     */
    getShopItems() {
        return GameConfig.MARKET.shop.items;
    }

    /**
     * 购买商铺物品
     * @param {string} itemId - 物品ID
     * @param {number} quantity - 购买数量
     * @returns {Object} 购买结果
     */
    buyShopItem(itemId, quantity = 1) {
        const item = GameConfig.MARKET.shop.items.find(i => i.id === itemId);
        if (!item) {
            return { success: false, message: '物品不存在' };
        }

        // 检查库存
        if (item.stock !== -1 && item.stock < quantity) {
            return { success: false, message: '库存不足' };
        }

        // 检查货币
        const totalPrice = item.price * quantity;
        if (!this.hasEnoughCurrency(item.currency, totalPrice)) {
            return { success: false, message: '货币不足' };
        }

        // 扣除货币
        this.deductCurrency(item.currency, totalPrice);

        // 添加物品到背包
        this.addItemToInventory(item, quantity);

        // 减少库存
        if (item.stock !== -1) {
            item.stock -= quantity;
        }

        this.engine.state.save();
        return { success: true, message: '购买成功' };
    }

    /**
     * 获取交易行物品列表
     * @returns {Array} 交易行物品列表
     */
    getAuctionItems() {
        const items = this.engine.state.data.market.auction.items;
        // 过滤掉已过期的物品
        const now = Date.now();
        return items.filter(item => item.endTime > now);
    }

    /**
     * 寄售物品到交易行
     * @param {Object} item - 物品信息
     * @param {number} quantity - 物品数量
     * @param {number} startingPrice - 起拍价
     * @param {string} startingCurrency - 起拍价货币类型
     * @param {number} buyoutPrice - 一口价
     * @param {string} buyoutCurrency - 一口价货币类型
     * @returns {Object} 寄售结果
     */
    auctionItem(item, quantity, startingPrice, startingCurrency, buyoutPrice, buyoutCurrency) {
        const auctionConfig = GameConfig.MARKET.auction;
        const userAuctions = this.engine.state.data.market.auction.userAuctions;

        // 检查用户寄售物品数量
        if (userAuctions.length >= auctionConfig.maxItemsPerUser) {
            return { success: false, message: '寄售物品数量达到上限' };
        }

        // 检查物品是否存在
        const inventory = this.engine.state.data.inventory || [];
        const inventoryItem = inventory.find(i => i.id === item.id);
        if (!inventoryItem || inventoryItem.quantity < quantity) {
            return { success: false, message: '背包中物品数量不足' };
        }

        // 从背包中移除物品
        this.removeItemFromInventory(item.id, quantity);

        // 创建寄售物品
        const auctionItem = {
            id: `auction_${Date.now()}`,
            item: {
                ...item,
                quantity: quantity // 保存寄售的物品数量
            },
            seller: this.engine.state.data.player.name,
            startingPrice: startingPrice,
            buyoutPrice: buyoutPrice,
            currentPrice: startingPrice,
            currentBidder: null,
            startingCurrency: startingCurrency,
            buyoutCurrency: buyoutCurrency,
            currency: startingCurrency, // 默认为起拍价货币类型
            startTime: Date.now(),
            endTime: Date.now() + auctionConfig.expireTime
        };

        // 添加到交易行
        this.engine.state.data.market.auction.items.push(auctionItem);
        userAuctions.push(auctionItem.id);

        this.engine.state.save();
        return { success: true, message: '寄售成功' };
    }

    /**
     * 竞拍物品
     * @param {string} auctionId - 拍卖ID
     * @param {number} bidPrice - 出价
     * @returns {Object} 竞拍结果
     */
    bidItem(auctionId, bidPrice) {
        const auctionItems = this.engine.state.data.market.auction.items;
        const auctionItem = auctionItems.find(item => item.id === auctionId);

        if (!auctionItem) {
            return { success: false, message: '拍卖物品不存在' };
        }

        // 检查是否已过期
        if (auctionItem.endTime < Date.now()) {
            return { success: false, message: '拍卖已结束' };
        }

        // 检查出价是否高于当前价格
        if (bidPrice <= auctionItem.currentPrice) {
            return { success: false, message: '出价必须高于当前价格' };
        }

        // 检查货币
        if (!this.hasEnoughCurrency(auctionItem.currency, bidPrice)) {
            return { success: false, message: '货币不足' };
        }

        // 处理之前的出价
        if (auctionItem.currentBidder) {
            // 退回之前出价者的货币
            this.addCurrency(auctionItem.currency, auctionItem.currentPrice);
            // 添加竞拍日志
            this.addBidLog(auctionItem.id, `${auctionItem.currentBidder}的出价被超越`);
        }

        // 冻结当前出价者的货币
        this.deductCurrency(auctionItem.currency, bidPrice);

        // 更新拍卖信息
        auctionItem.currentPrice = bidPrice;
        auctionItem.currentBidder = this.engine.state.data.player.name;

        // 添加竞拍日志
        this.addBidLog(auctionItem.id, `${this.engine.state.data.player.name}出价${bidPrice}${this.getCurrencyName(auctionItem.currency)}`);

        this.engine.state.save();
        return { success: true, message: '出价成功' };
    }

    /**
     * 一口价购买物品
     * @param {string} auctionId - 拍卖ID
     * @returns {Object} 购买结果
     */
    buyoutItem(auctionId) {
        const auctionItems = this.engine.state.data.market.auction.items;
        const auctionItem = auctionItems.find(item => item.id === auctionId);

        if (!auctionItem) {
            return { success: false, message: '拍卖物品不存在' };
        }

        // 检查是否已过期
        if (auctionItem.endTime < Date.now()) {
            return { success: false, message: '拍卖已结束' };
        }

        // 检查是否有一口价
        if (!auctionItem.buyoutPrice) {
            return { success: false, message: '该物品没有设置一口价' };
        }

        // 检查货币
        if (!this.hasEnoughCurrency(auctionItem.currency, auctionItem.buyoutPrice)) {
            return { success: false, message: '货币不足' };
        }

        // 处理之前的出价
        if (auctionItem.currentBidder) {
            // 退回之前出价者的货币
            this.addCurrency(auctionItem.currency, auctionItem.currentPrice);
            // 添加竞拍日志
            this.addBidLog(auctionItem.id, `${auctionItem.currentBidder}的出价被超越`);
        }

        // 扣除货币
        this.deductCurrency(auctionItem.currency, auctionItem.buyoutPrice);

        // 计算卖家获得的货币（扣除手续费）
        const feeRate = GameConfig.MARKET.auction.feeRate;
        const sellerAmount = Math.floor(auctionItem.buyoutPrice * (1 - feeRate));

        // 卖家获得货币（这里简化处理，实际应该发送到卖家账户）
        // 由于是单机游戏，这里暂时不处理卖家获得货币的逻辑

        // 添加物品到背包
        this.addItemToInventory(auctionItem.item, 1);

        // 从交易行移除物品
        const index = auctionItems.indexOf(auctionItem);
        if (index > -1) {
            auctionItems.splice(index, 1);
        }

        // 从用户寄售列表中移除
        const userAuctions = this.engine.state.data.market.auction.userAuctions;
        const userIndex = userAuctions.indexOf(auctionId);
        if (userIndex > -1) {
            userAuctions.splice(userIndex, 1);
        }

        // 添加竞拍日志
        this.addBidLog(auctionId, `${this.engine.state.data.player.name}一口价购买成功`);

        this.engine.state.save();
        return { success: true, message: '购买成功' };
    }

    /**
     * 处理过期的拍卖物品
     */
    processExpiredAuctions() {
        const auctionItems = this.engine.state.data.market.auction.items;
        const now = Date.now();
        const expiredItems = auctionItems.filter(item => item.endTime < now);

        for (const item of expiredItems) {
            if (item.currentBidder) {
                // 有最高出价者，完成交易
                const feeRate = GameConfig.MARKET.auction.feeRate;
                const sellerAmount = Math.floor(item.currentPrice * (1 - feeRate));

                // 卖家获得货币（简化处理）
                // 买家获得物品
                this.addItemToInventory(item.item, 1);

                // 添加竞拍日志
                this.addBidLog(item.id, `拍卖结束，${item.currentBidder}以${item.currentPrice}${this.getCurrencyName(item.currency)}拍得`);
            } else {
                // 没有出价者，物品返回给卖家
                // 这里简化处理，实际应该返回给卖家

                // 添加竞拍日志
                this.addBidLog(item.id, '拍卖结束，无人出价，物品返回给卖家');
            }

            // 从交易行移除物品
            const index = auctionItems.indexOf(item);
            if (index > -1) {
                auctionItems.splice(index, 1);
            }

            // 从用户寄售列表中移除
            const userAuctions = this.engine.state.data.market.auction.userAuctions;
            const userIndex = userAuctions.indexOf(item.id);
            if (userIndex > -1) {
                userAuctions.splice(userIndex, 1);
            }
        }

        this.engine.state.save();
    }

    /**
     * 获取黑市物品列表
     * @returns {Array} 黑市物品列表
     */
    getBlackMarketItems() {
        // 检查是否需要刷新
        const blackMarket = this.engine.state.data.market.blackMarket;
        const now = Date.now();
        const refreshTime = GameConfig.MARKET.blackMarket.refreshTime;

        if (now - blackMarket.lastRefresh >= refreshTime) {
            this.refreshBlackMarket();
        }

        return blackMarket.items;
    }

    /**
     * 刷新黑市物品
     * @param {boolean} force - 是否强制刷新
     * @returns {Object} 刷新结果
     */
    refreshBlackMarket(force = false) {
        const blackMarket = this.engine.state.data.market.blackMarket;
        const now = Date.now();
        const refreshTime = GameConfig.MARKET.blackMarket.refreshTime;

        if (!force && now - blackMarket.lastRefresh < refreshTime) {
            return { success: false, message: '刷新时间未到' };
        }

        // 计算刷新数量
        const baseItems = GameConfig.MARKET.blackMarket.baseItems;
        const vipBonus = this.engine.state.data.player.vip ? GameConfig.MARKET.blackMarket.vipBonus : 0;
        const totalItems = baseItems + vipBonus;

        // 生成黑市物品（这里简化处理，实际应该根据玩家等级、境界等生成不同的物品）
        const blackMarketItems = [];
        for (let i = 0; i < totalItems; i++) {
            // 随机生成物品
            const randomItem = this.generateRandomItem();
            blackMarketItems.push(randomItem);
        }

        // 更新黑市数据
        blackMarket.items = blackMarketItems;
        blackMarket.lastRefresh = now;

        this.engine.state.save();
        return { success: true, message: '刷新成功' };
    }

    /**
     * 看广告刷新黑市
     * @returns {Object} 刷新结果
     */
    adRefreshBlackMarket() {
        // 这里简化处理，实际应该显示广告
        return this.refreshBlackMarket(true);
    }

    /**
     * 购买黑市物品
     * @param {string} itemId - 物品ID
     * @returns {Object} 购买结果
     */
    buyBlackMarketItem(itemId) {
        const blackMarketItems = this.engine.state.data.market.blackMarket.items;
        const item = blackMarketItems.find(i => i.id === itemId);

        if (!item) {
            return { success: false, message: '物品不存在' };
        }

        // 检查货币
        if (!this.hasEnoughCurrency(item.currency, item.price)) {
            return { success: false, message: '货币不足' };
        }

        // 扣除货币
        this.deductCurrency(item.currency, item.price);

        // 添加物品到背包
        this.addItemToInventory(item, 1);

        // 从黑市移除物品
        const index = blackMarketItems.indexOf(item);
        if (index > -1) {
            blackMarketItems.splice(index, 1);
        }

        this.engine.state.save();
        return { success: true, message: '购买成功' };
    }

    // ==================== 辅助方法 ====================

    /**
     * 检查是否有足够的货币
     * @param {string} currency - 货币类型
     * @param {number} amount - 数量
     * @returns {boolean} 是否有足够的货币
     */
    hasEnoughCurrency(currency, amount) {
        switch (currency) {
            case 'spirit_stone':
                return this.engine.state.data.resources.spiritStone >= amount;
            case 'immortal_stone':
                return this.engine.state.data.resources.immortalStone >= amount;
            default:
                return false;
        }
    }

    /**
     * 扣除货币
     * @param {string} currency - 货币类型
     * @param {number} amount - 数量
     */
    deductCurrency(currency, amount) {
        switch (currency) {
            case 'spirit_stone':
                this.engine.state.data.resources.spiritStone -= amount;
                break;
            case 'immortal_stone':
                this.engine.state.data.resources.immortalStone -= amount;
                break;
        }
    }

    /**
     * 添加货币
     * @param {string} currency - 货币类型
     * @param {number} amount - 数量
     */
    addCurrency(currency, amount) {
        switch (currency) {
            case 'spirit_stone':
                this.engine.state.data.resources.spiritStone += amount;
                break;
            case 'immortal_stone':
                this.engine.state.data.resources.immortalStone += amount;
                // 更新仙晶统计数据
                if (this.engine.achievementSystem) {
                    this.engine.achievementSystem.updateStats('immortalStone', amount);
                }
                break;
        }
    }

    /**
     * 添加物品到背包
     * @param {Object} item - 物品信息
     * @param {number} quantity - 数量
     */
    addItemToInventory(item, quantity) {
        // 确保背包数据存在
        if (!this.engine.state.data.backpack) {
            this.engine.state.data.backpack = {
                items: [],
                capacity: 20,
                unlockedSlots: 10
            };
        }

        // 处理特殊物品ID映射
        let itemId = item.id;
        if (item.name === '强化石') {
            itemId = 'enhance_stone';
        } else if (item.name === '洗炼石') {
            itemId = 'refine_stone';
        }
        
        const existingItem = this.engine.state.data.backpack.items.find(i => i.id === itemId);
        if (existingItem) {
            existingItem.quantity = (existingItem.quantity || 0) + quantity;
            existingItem.count = existingItem.quantity; // 同步 count 属性
        } else {
            this.engine.state.data.backpack.items.push({
                id: itemId,
                name: item.name,
                quantity: quantity,
                count: quantity, // 添加 count 属性
                type: item.type,
                description: item.description
            });
        }
    }

    /**
     * 从背包移除物品
     * @param {string} itemId - 物品ID
     * @param {number} quantity - 数量
     */
    removeItemFromInventory(itemId, quantity) {
        const inventory = this.engine.state.data.backpack?.items || [];
        const item = inventory.find(i => i.id === itemId);
        if (item) {
            item.quantity = (item.quantity || 0) - quantity;
            item.count = item.quantity; // 同步 count 属性
            if (item.quantity <= 0) {
                const index = inventory.indexOf(item);
                if (index > -1) {
                    inventory.splice(index, 1);
                }
            }
        }
    }

    /**
     * 添加竞拍日志
     * @param {string} auctionId - 拍卖ID
     * @param {string} message - 日志内容
     */
    addBidLog(auctionId, message) {
        const bidLogs = this.engine.state.data.market.auction.bidLogs;
        bidLogs.push({
            auctionId: auctionId,
            message: message,
            time: Date.now()
        });
    }

    /**
     * 获取货币名称
     * @param {string} currency - 货币类型
     * @returns {string} 货币名称
     */
    getCurrencyName(currency) {
        switch (currency) {
            case 'spirit_stone':
                return '灵石';
            case 'immortal_stone':
                return '仙晶';
            default:
                return '';
        }
    }

    /**
     * 生成随机物品
     * @returns {Object} 随机物品
     */
    generateRandomItem() {
        // 这里简化处理，实际应该根据游戏配置生成不同的物品
        const itemTypes = ['consumable', 'material', 'equipment'];
        const currencies = ['spirit_stone', 'immortal_stone'];
        
        const itemType = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        const currency = currencies[Math.floor(Math.random() * currencies.length)];
        
        return {
            id: `blackmarket_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            name: `${itemType === 'consumable' ? '高级' : itemType === 'material' ? '稀有' : '极品'}${itemType === 'consumable' ? '丹药' : itemType === 'material' ? '材料' : '装备'}`,
            type: itemType,
            price: Math.floor(Math.random() * 10000) + 1000,
            currency: currency,
            description: `黑市随机${itemType === 'consumable' ? '丹药' : itemType === 'material' ? '材料' : '装备'}`
        };
    }

    /**
     * 领取已售出物品的货币
     * @param {string} auctionId - 拍卖ID
     * @returns {Object} 领取结果
     */
    collectAuctionMoney(auctionId) {
        const auctionItems = this.engine.state.data.market.auction.items;
        const userAuctions = this.engine.state.data.market.auction.userAuctions;
        const auctionItem = auctionItems.find(item => item.id === auctionId);

        if (!auctionItem) {
            return { success: false, message: '拍卖物品不存在' };
        }

        // 检查是否是用户自己的寄售物品
        if (!userAuctions.includes(auctionId)) {
            return { success: false, message: '不是您的寄售物品' };
        }

        // 检查是否已售出
        if (!auctionItem.currentBidder) {
            return { success: false, message: '物品未售出' };
        }

        // 检查是否已领取
        if (auctionItem.collected) {
            return { success: false, message: '货币已领取' };
        }

        // 计算卖家获得的货币（扣除手续费）
        const feeRate = GameConfig.MARKET.auction.feeRate;
        const sellerAmount = Math.floor(auctionItem.currentPrice * (1 - feeRate));

        // 给卖家添加货币
        this.addCurrency(auctionItem.currency, sellerAmount);

        // 标记为已领取
        auctionItem.collected = true;

        this.engine.state.save();
        return { success: true, message: `领取成功，获得${sellerAmount}${this.getCurrencyName(auctionItem.currency)}` };
    }

    /**
     * 取回流拍物品
     * @param {string} auctionId - 拍卖ID
     * @returns {Object} 取回结果
     */
    retrieveExpiredItem(auctionId) {
        const auctionItems = this.engine.state.data.market.auction.items;
        const userAuctions = this.engine.state.data.market.auction.userAuctions;
        const auctionItem = auctionItems.find(item => item.id === auctionId);

        if (!auctionItem) {
            return { success: false, message: '拍卖物品不存在' };
        }

        // 检查是否是用户自己的寄售物品
        if (!userAuctions.includes(auctionId)) {
            return { success: false, message: '不是您的寄售物品' };
        }

        // 检查是否已过期
        if (auctionItem.endTime > Date.now()) {
            return { success: false, message: '物品尚未过期' };
        }

        // 检查是否流拍
        if (auctionItem.currentBidder) {
            return { success: false, message: '物品已售出，无法取回' };
        }

        // 检查是否已取回
        if (auctionItem.retrieved) {
            return { success: false, message: '物品已取回' };
        }

        // 将物品添加回背包
        this.addItemToInventory(auctionItem.item, 1);

        // 标记为已取回
        auctionItem.retrieved = true;

        this.engine.state.save();
        return { success: true, message: '取回成功' };
    }

    /**
     * 取消寄售
     * @param {string} auctionId - 拍卖ID
     * @returns {Object} 取消结果
     */
    cancelAuction(auctionId) {
        const auctionItems = this.engine.state.data.market.auction.items;
        const userAuctions = this.engine.state.data.market.auction.userAuctions;
        const auctionItem = auctionItems.find(item => item.id === auctionId);

        if (!auctionItem) {
            return { success: false, message: '拍卖物品不存在' };
        }

        // 检查是否是用户自己的寄售物品
        if (!userAuctions.includes(auctionId)) {
            return { success: false, message: '不是您的寄售物品' };
        }

        // 检查是否已过期
        if (auctionItem.endTime < Date.now()) {
            return { success: false, message: '物品已过期，无法取消' };
        }

        // 检查是否有人出价
        if (auctionItem.currentBidder) {
            // 有人出价，需要退回出价
            this.addCurrency(auctionItem.currency, auctionItem.currentPrice);
        }

        // 将物品添加回背包
        this.addItemToInventory(auctionItem.item, 1);

        // 从交易行移除物品
        const index = auctionItems.indexOf(auctionItem);
        if (index > -1) {
            auctionItems.splice(index, 1);
        }

        // 从用户寄售列表中移除
        const userIndex = userAuctions.indexOf(auctionId);
        if (userIndex > -1) {
            userAuctions.splice(userIndex, 1);
        }

        this.engine.state.save();
        return { success: true, message: '取消寄售成功' };
    }
}

// 兼容模块导出和全局变量
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MarketSystem;
} else if (typeof window !== 'undefined') {
    window.MarketSystem = MarketSystem;
}
