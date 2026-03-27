// 检查localStorage中的游戏状态
const fs = require('fs');
const path = require('path');

// 模拟localStorage
const localStorage = {
  data: {},
  getItem(key) {
    return this.data[key];
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  clear() {
    this.data = {};
  }
};

// 模拟window对象
global.window = {
  localStorage
};

// 加载游戏配置
const GameConfig = require('./src/data/gameConfig.js');

// 加载游戏状态
const GameState = require('./src/js/gameState.js');
const gameState = new GameState();

console.log('游戏状态中的gifts数据:', gameState.data.gifts);

// 加载GiftSystem
const GiftSystem = require('./src/js/giftSystem.js');

// 模拟GameEngine
const mockEngine = {
  state: gameState
};

// 创建GiftSystem实例
const giftSystem = new GiftSystem(mockEngine);

// 检查可领取的礼包
c// 检查localStorage中的游戏状态
const fs = require('fs');
const path = require('path');

/p(const fs = require('fs');
conschconst path = require('path.l
// 模拟localStorage
const localSt'", giftSystem.hasAvai data: {},