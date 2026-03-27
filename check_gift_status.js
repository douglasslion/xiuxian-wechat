// 检查礼包状态
const GameConfig = require('./src/data/gameConfig.js');

console.log('当前日期:', new Date().toISOString());
console.log('礼包配置:', GameConfig.GIFT.gifts.map(g => ({ id: g.id, name: g.name, startTime: g.startTime, endTime: g.endTime })));

// 模拟游戏状态
const mockState = {
  data: {
    resources: {
      spiritStone: 1000,
      immortalStone: 0
    },
    gifts: {
      purchased: {},
      lastResetTime: new Date().toDateString()
    }
  }
};

// 模拟GameEngine
const mockEngine = {
  state: mockState
};

// 模拟GiftSystem
class MockGiftSystem {
  constructor(engine) {
    this.engine = engine;
  }

  getAvailableGifts() {
    const now = new Date();
    const gifts = GameConfig.GIFT.gifts;
    const availableGifts = [];

    for (const gift of gifts) {
      const startTime = new Date(gift.startTime);
      const endTime = new Date(gift.endTime);
      
      if (now >= startTime && now <= endTime) {
        const purchaseInfo = this.getPurchaseInfo(gift.id);
        const canPurchase = this.canPurchaseGift(gift, purchaseInfo);
        
        availableGifts.push({
          ...gift,
          canPurchase,
          purchaseInfo
        });
      }
    }

    return availableGifts;
  }

  getPurchaseInfo(giftId) {
    const purchased = this.engine.state.data.gifts.purchased;
    if (!purchased[giftId]) {
      purchased[giftId] = {
        dailyCount: 0,
        totalCount: 0
      };
    }
    return purchased[giftId];
  }

  canPurchaseGift(gift, purchaseInfo) {
    if (gift.limit.daily > 0 && purchaseInfo.dailyCount >= gift.limit.daily) {
      return false;
    }

    if (gift.limit.total > 0 && purchaseInfo.totalCount >= gift.limit.total) {
      return false;
    }

    if (gift.type === 'spiritStone' && this.engine.state.data.resources.spiritStone < gift.price) {
      return false;
    }

    if (gift.type === 'immortalStone' && this.engine.state.data.resources.immortalStone < gift.price) {
      return false;
    }

    return true;
  }

  hasAvailableGifts() {
    const availableGifts = this.getAvailableGifts();
    return availableGifts.some(gift => gift.canPurchase);
  }
}

const giftSystem = new MockGiftSystem(mockEngine);
const availableGifts = giftSystem.getAvailableGifts();
console.log('可领取的礼包:', availableGifts.map(g => ({ id: g.id, name: g.name, canPurchase: g.canPurchase })));
console.log('是否有可领取的礼包:', giftSystem.hasAvailableGifts());
