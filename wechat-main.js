/**
 * 微信小游戏主入口文件
 * 简化版本，用于微信小游戏环境
 * @version 1.0.0
 */

// 微信小游戏入口
wx.onLaunch(() => {
    console.log('修仙挂机微信小游戏启动');
    
    // 显示加载界面
    wx.showLoading({
        title: '游戏加载中...',
        mask: true
    });
    
    // 初始化游戏
    initGame();
});

/**
 * 初始化游戏
 */
async function initGame() {
    try {
        // 加载微信小游戏适配层
        await loadScript('src/js/wechatAdapter.js');
        
        // 加载游戏配置
        await loadScript('src/data/gameConfig.js');
        
        // 加载核心模块
        await loadScript('src/js/gameState.js');
        await loadScript('src/js/gameEngine.js');
        
        // 加载系统模块
        await loadScript('src/js/trainingSystem.js');
        await loadScript('src/js/realmSystem.js');
        await loadScript('src/js/skillSystem.js');
        await loadScript('src/js/equipmentSystem.js');
        await loadScript('src/js/bodyTrainingSystem.js');
        await loadScript('src/js/alchemySystem.js');
        await loadScript('src/js/petSystem.js');
        await loadScript('src/js/dailyTaskSystem.js');
        await loadScript('src/js/giftSystem.js');
        await loadScript('src/js/checkinSystem.js');
        await loadScript('src/js/achievementSystem.js');
        await loadScript('src/js/marketSystem.js');
        await loadScript('src/js/sectSystem.js');
        await loadScript('src/js/towerSystem.js');
        await loadScript('src/js/godListSystem.js');
        await loadScript('src/js/martialStageSystem.js');
        
        // 加载UI管理器
        await loadScript('src/js/uiManager.js');
        
        // 加载工具模块
        await loadScript('src/js/csvLoader.js');
        await loadScript('src/js/colorManager.js');
        
        // 创建游戏实例
        const game = new GameEngine();
        
        // 等待游戏初始化完成
        await new Promise((resolve) => {
            if (game.onInitComplete) {
                game.onInitComplete = resolve;
            } else {
                // 如果没有回调机制，等待一段时间
                setTimeout(resolve, 2000);
            }
        });
        
        // 隐藏加载界面
        wx.hideLoading();
        
        // 显示欢迎信息
        wx.showToast({
            title: '游戏加载完成！',
            icon: 'success',
            duration: 2000
        });
        
        console.log('修仙挂机微信小游戏初始化完成');
        
        // 存储游戏实例
        window.xiuxianGame = game;
        
    } catch (error) {
        console.error('游戏初始化失败:', error);
        
        wx.hideLoading();
        wx.showModal({
            title: '错误',
            content: '游戏初始化失败，请重试',
            showCancel: false
        });
    }
}

/**
 * 动态加载脚本
 */
function loadScript(src) {
    return new Promise((resolve, reject) => {
        // 微信小游戏环境使用require加载
        if (typeof require !== 'undefined') {
            try {
                require(src);
                resolve();
            } catch (error) {
                reject(error);
            }
        } else {
            // 浏览器环境使用script标签加载
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        }
    });
}

// 页面显示时恢复游戏
wx.onShow(() => {
    if (window.xiuxianGame) {
        console.log('游戏恢复运行');
        
        // 检查离线收益
        if (window.xiuxianGame.state && window.xiuxianGame.state.calculateOfflineProgress) {
            window.xiuxianGame.state.calculateOfflineProgress();
        }
    }
});

// 页面隐藏时保存游戏
wx.onHide(() => {
    if (window.xiuxianGame && window.xiuxianGame.state) {
        console.log('页面隐藏，保存游戏状态');
        window.xiuxianGame.state.save();
    }
});

// 网络状态变化处理
wx.onNetworkStatusChange((res) => {
    console.log('网络状态变化:', res);
    
    if (!res.isConnected) {
        wx.showToast({
            title: '网络连接已断开',
            icon: 'none',
            duration: 2000
        });
    }
});