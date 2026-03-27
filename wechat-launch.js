/**
 * 微信小游戏启动脚本
 * 整合所有模块并启动游戏
 * @version 1.0.0
 */

// 游戏配置
const CONFIG = {
    SERVER_URL: 'http://xiuxian-test.richsh.cn:8002',
    API_TIMEOUT: 10000
};

// 游戏主类
class XiuxianWeChatGame {
    constructor() {
        this.gameEngine = null;
        this.userInfo = null;
        this.isGameReady = false;
        this.isInitialized = false;
        
        this.init();
    }

    /**
     * 初始化游戏
     */
    async init() {
        try {
            console.log('修仙挂机微信小游戏开始初始化');
            
            // 初始化微信小游戏环境
            await this.initWeChatEnvironment();
            
            // 获取用户信息
            await this.getUserInfo();
            
            // 加载游戏配置
            await this.loadGameConfig();
            
            // 初始化游戏引擎
            await this.initGameEngine();
            
            // 游戏准备完成
            this.isGameReady = true;
            this.isInitialized = true;
            
            console.log('修仙挂机微信小游戏初始化完成');
            
            // 开始游戏
            this.start();
            
        } catch (error) {
            console.error('游戏初始化失败:', error);
            this.showError('游戏初始化失败，请重试');
        }
    }

    /**
     * 初始化微信小游戏环境
     */
    async initWeChatEnvironment() {
        // 检查微信小游戏API是否可用
        if (typeof wx === 'undefined') {
            throw new Error('微信小游戏环境未检测到');
        }
        
        // 设置屏幕适配
        wx.onWindowResize(() => {
            this.handleResize();
        });
        
        // 监听网络状态变化
        wx.onNetworkStatusChange((res) => {
            this.handleNetworkChange(res);
        });
        
        console.log('微信小游戏环境初始化完成');
    }

    /**
     * 获取用户信息
     * 注意: wx.getUserInfo 已废弃，不再直接调用
     * 使用默认用户信息，用户信息通过游戏内登录系统获取
     * 修复标识: FIX_ACCESS_TOKEN_20240326
     */
    async getUserInfo() {
        // 不再调用已废弃的 wx.getUserInfo API
        // 直接使用默认用户信息，避免 access_token missing 错误
        console.log('使用默认用户信息，避免 wx.getUserInfo 废弃API调用');
        this.userInfo = {
            nickName: '修仙者',
            avatarUrl: ''
        };
        return this.userInfo;
    }

    /**
     * 加载游戏配置
     */
    async loadGameConfig() {
        try {
            // 尝试从服务器加载配置
            const config = await this.apiRequest('/game/config');
            
            if (config.status === 'success' && config.data) {
                // 将配置存储到全局变量
                window.GameConfig = config.data;
                console.log('游戏配置从服务器加载完成');
            } else {
                throw new Error('服务器配置加载失败');
            }
            
        } catch (error) {
            console.warn('游戏配置加载失败，使用本地配置:', error);
            // 使用本地配置作为备用
            await this.loadLocalConfig();
        }
    }

    /**
     * 加载本地配置
     */
    async loadLocalConfig() {
        try {
            // 这里可以加载本地的CSV配置数据
            // 由于微信小游戏环境限制，需要将CSV数据转换为JS对象
            
            // 临时使用默认配置
            window.GameConfig = {
                version: '1.0.0',
                realms: [],
                skills: [],
                equipment: []
            };
            
            console.log('使用本地默认配置');
        } catch (error) {
            console.error('本地配置加载失败:', error);
            throw error;
        }
    }

    /**
     * 初始化游戏引擎
     */
    async initGameEngine() {
        // 创建游戏引擎实例
        this.gameEngine = new GameEngine();
        
        // 等待游戏引擎初始化完成
        await new Promise((resolve) => {
            this.gameEngine.onInitComplete = resolve;
        });
        
        console.log('游戏引擎初始化完成');
    }

    /**
     * 开始游戏
     */
    start() {
        if (!this.isGameReady || !this.gameEngine) {
            console.error('游戏尚未准备完成');
            return;
        }
        
        console.log('修仙挂机游戏开始运行');
        
        // 显示欢迎信息
        this.showToast(`欢迎 ${this.userInfo.nickName} 进入修仙世界！`);
        
        // 启动游戏主循环
        this.gameLoop();
    }

    /**
     * 游戏主循环
     */
    gameLoop() {
        if (!this.isGameReady || !this.gameEngine) return;
        
        try {
            // 执行游戏逻辑更新
            if (this.gameEngine.update) {
                this.gameEngine.update();
            }
            
            // 请求下一帧
            requestAnimationFrame(() => this.gameLoop());
            
        } catch (error) {
            console.error('游戏主循环错误:', error);
            // 错误恢复：重新启动游戏循环
            setTimeout(() => this.gameLoop(), 1000);
        }
    }

    /**
     * API请求封装
     */
    async apiRequest(url, data = null, method = 'GET') {
        return new Promise((resolve, reject) => {
            wx.request({
                url: CONFIG.SERVER_URL + url,
                method: method,
                data: data,
                timeout: CONFIG.API_TIMEOUT,
                success: (res) => {
                    if (res.statusCode === 200) {
                        resolve(res.data);
                    } else {
                        reject(new Error(`API请求失败: ${res.statusCode}`));
                    }
                },
                fail: (err) => {
                    reject(new Error(`网络请求失败: ${err.errMsg}`));
                }
            });
        });
    }

    /**
     * 处理屏幕尺寸变化
     */
    handleResize() {
        if (this.gameEngine && this.gameEngine.uiManager) {
            this.gameEngine.uiManager.handleResize();
        }
    }

    /**
     * 处理网络状态变化
     */
    handleNetworkChange(res) {
        console.log('网络状态变化:', res);
        
        if (!res.isConnected) {
            this.showToast('网络连接已断开');
        } else {
            this.showToast('网络连接已恢复');
        }
    }

    /**
     * 显示错误信息
     */
    showError(message) {
        wx.showModal({
            title: '错误',
            content: message,
            showCancel: false
        });
    }

    /**
     * 显示提示信息
     */
    showToast(message) {
        wx.showToast({
            title: message,
            icon: 'none',
            duration: 2000
        });
    }

    /**
     * 获取游戏状态
     */
    getGameState() {
        return this.gameEngine ? this.gameEngine.state.data : null;
    }

    /**
     * 保存游戏状态
     */
    async saveGame() {
        if (this.gameEngine && this.gameEngine.state) {
            await this.gameEngine.state.save();
        }
    }

    /**
     * 重新开始游戏
     */
    restart() {
        if (this.gameEngine && this.gameEngine.state) {
            this.gameEngine.state.reset();
            this.showToast('游戏已重新开始');
        }
    }
}

// 微信小游戏入口
wx.onLaunch(() => {
    console.log('修仙挂机微信小游戏启动');
    
    // 创建游戏实例
    window.xiuxianGame = new XiuxianWeChatGame();
});

// 页面显示时恢复游戏
wx.onShow(() => {
    if (window.xiuxianGame && window.xiuxianGame.isInitialized) {
        console.log('游戏恢复运行');
        window.xiuxianGame.start();
    }
});

// 页面隐藏时暂停游戏
wx.onHide(() => {
    if (window.xiuxianGame) {
        console.log('游戏暂停');
        // 自动保存已在游戏引擎中处理
    }
});

// 导出游戏类供其他模块使用
window.XiuxianWeChatGame = XiuxianWeChatGame;