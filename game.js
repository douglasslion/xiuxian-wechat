/**
 * 微信小游戏主入口文件
 * 实现游戏前端与后端打通
 */

console.log('正经修仙微信小游戏启动');

// 游戏全局变量
var canvas = null;
var ctx = null;
var screenWidth = 0;
var screenHeight = 0;
var gameEngine = null;

// 全局模块变量
var CSVLoader = null;
var ColorManager = null;
var GameConfig = null;
var GameState = null;
var GameEngine = null;

// 游戏系统类变量
var TrainingSystem = null;
var RealmSystem = null;
var SkillSystem = null;
var EquipmentSystem = null;
var BodyTrainingSystem = null;
var AlchemySystem = null;
var PetSystem = null;
var DailyTaskSystem = null;
var GiftSystem = null;
var CheckinSystem = null;
var AchievementSystem = null;
var MarketSystem = null;
var SectSystem = null;
var TowerSystem = null;
var GodListSystem = null;
var MartialStageSystem = null;
var UIManager = null;

// 游戏配置
var CONFIG = {
    SERVER_URL: 'https://xiuxian-test.richsh.cn',
    API_TIMEOUT: 10000
};

// 玩家信息缓存
var playerInfo = {
    id: null,
    name: null,
    avatar: null
};

// 登录状态
var isLoggedIn = false;

// 当前显示的面板（login或register）
var currentPanel = 'login';

// 输入状态
// 移除输入相关变量，使用wx.showModal替代

// 获取启动参数
var launchOptions = wx.getLaunchOptionsSync();
console.log('启动参数:', launchOptions);

// 页面显示
wx.onShow(function() {
    console.log('游戏页面显示');

    // 恢复游戏状态
    if (gameEngine && gameEngine.state) {
        gameEngine.state.calculateOfflineProgress();
    }

    // 重新加载玩家信息
    if (gameEngine && gameEngine.state && gameEngine.state.data) {
        loadPlayerInfo();
    }
});

// 页面隐藏
wx.onHide(function() {
    console.log('游戏页面隐藏');
    
    // 保存游戏状态
    if (gameEngine) {
        gameEngine.state.save();
    }
});

// 初始化游戏
function initGame() {
    console.log('游戏初始化开始');
    
    // 获取屏幕尺寸
    var systemInfo = wx.getSystemInfoSync();
    screenWidth = systemInfo.windowWidth;
    screenHeight = systemInfo.windowHeight;
    
    console.log('屏幕尺寸:', screenWidth, screenHeight);
    
    // 创建Canvas
    canvas = wx.createCanvas();
    ctx = canvas.getContext('2d');
    
    // 设置Canvas尺寸
    canvas.width = screenWidth;
    canvas.height = screenHeight;
    
    console.log('Canvas创建完成');
    
    // 显示加载界面
    wx.showLoading({
        title: '正经修仙加载中...',
        mask: true
    });
    
    // 按照正确的顺序加载模块
    loadModules();
}

/**
 * 检查登录状态
 */
function checkLoginStatus() {
    return new Promise((resolve, reject) => {
        wx.getStorage({
            key: 'login_token',
            success: (res) => {
                isLoggedIn = !!res.data;
                resolve(isLoggedIn);
            },
            fail: (err) => {
                isLoggedIn = false;
                resolve(false);
            }
        });
    });
}

/**
 * 显示登录/注册页面
 */
function showLoginRegisterPage() {
    // 清空Canvas
    ctx.clearRect(0, 0, screenWidth, screenHeight);
    
    // 绘制登录/注册页面
    drawLoginRegisterPage(ctx, screenWidth, screenHeight);
    
    // 移除旧的触摸事件监听器（如果存在）
    canvas.removeEventListener('touchstart', handleTouchStart, false);
    
    // 添加新的触摸事件监听
    canvas.addEventListener('touchstart', handleTouchStart, false);
    
    console.log('登录/注册页面显示，触摸事件监听器已添加');
}

/**
 * 处理触摸事件
 */
function handleTouchStart(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;
    
    // 计算登录/注册页面的坐标
    const panelWidth = screenWidth * 0.8;
    const panelHeight = screenHeight * 0.6;
    const panelX = (screenWidth - panelWidth) / 2;
    const panelY = (screenHeight - panelHeight) / 2;
    
    // 检查是否点击了登录标签
    if (x >= panelX + 20 && x <= panelX + 20 + (panelWidth - 50) / 2 && y >= panelY + 100 && y <= panelY + 140) {
        console.log('点击了登录标签');
        if (currentPanel !== 'login') {
            currentPanel = 'login';
            drawLoginRegisterPage(ctx, screenWidth, screenHeight);
        }
    }
    
    // 检查是否点击了注册标签
    if (x >= panelX + 20 + (panelWidth - 50) / 2 + 10 && x <= panelX + 20 + panelWidth - 50 && y >= panelY + 100 && y <= panelY + 140) {
        console.log('点击了注册标签');
        if (currentPanel !== 'register') {
            currentPanel = 'register';
            drawLoginRegisterPage(ctx, screenWidth, screenHeight);
        }
    }
    
    // 根据当前面板状态检查按钮点击
    if (currentPanel === 'login') {
        // 检查是否点击了登录按钮
        if (x >= panelX + 20 && x <= panelX + 20 + panelWidth - 40 && y >= panelY + 260 && y <= panelY + 300) {
            console.log('点击了登录按钮');
            handleLogin();
        }
    } else {
        // 检查是否点击了注册按钮
        if (x >= panelX + 20 && x <= panelX + 20 + panelWidth - 40 && y >= panelY + 310 && y <= panelY + 350) {
            console.log('点击了注册按钮');
            handleRegister();
        }
    }
}

/**
 * 登录API调用
 */
function login(username, password) {
    return new Promise((resolve, reject) => {
        const url = CONFIG.SERVER_URL + '/api/users/login';
        
        wx.request({
            url: url,
            method: 'POST',
            data: {
                username: username,
                password: password
            },
            header: {
                'Content-Type': 'application/json'
            },
            timeout: CONFIG.API_TIMEOUT,
            success: function(res) {
                console.log('登录响应:', res);
                
                if (res.data && res.data.status === 'success') {
                    const data = res.data.data;
                    // 保存登录令牌
                    wx.setStorage({
                        key: 'login_token',
                        data: data.token
                    });
                    isLoggedIn = true;
                    resolve(data);
                } else {
                    // 直接使用后端返回的错误信息
                    let errorMessage = '登录失败';
                    if (res.data) {
                        if (res.data.message) {
                            errorMessage = res.data.message;
                        } else if (res.data.error) {
                            errorMessage = res.data.error;
                        } else if (res.data.msg) {
                            errorMessage = res.data.msg;
                        }
                    }
                    console.log('错误信息:', errorMessage);
                    reject(new Error(errorMessage));
                }
            },
            fail: function(err) {
                console.error('登录请求失败:', err);
                reject(new Error('网络请求失败'));
            }
        });
    });
}

/**
 * 注册API调用
 */
function register(username, password) {
    return new Promise((resolve, reject) => {
        const url = CONFIG.SERVER_URL + '/api/users/register';
        
        wx.request({
            url: url,
            method: 'POST',
            data: {
                username: username,
                password: password
            },
            header: {
                'Content-Type': 'application/json'
            },
            timeout: CONFIG.API_TIMEOUT,
            success: function(res) {
                console.log('注册响应:', res);
                
                if (res.data && res.data.status === 'success') {
                    const data = res.data.data;
                    // 保存登录令牌
                    wx.setStorage({
                        key: 'login_token',
                        data: data.token
                    });
                    isLoggedIn = true;
                    resolve(data);
                } else {
                    // 直接使用后端返回的错误信息
                    let errorMessage = '注册失败';
                    if (res.data) {
                        if (res.data.message) {
                            errorMessage = res.data.message;
                        } else if (res.data.error) {
                            errorMessage = res.data.error;
                        } else if (res.data.msg) {
                            errorMessage = res.data.msg;
                        }
                    }
                    console.log('错误信息:', errorMessage);
                    reject(new Error(errorMessage));
                }
            },
            fail: function(err) {
                console.error('注册请求失败:', err);
                reject(new Error('网络请求失败'));
            }
        });
    });
}

/**
 * 显示输入对话框（使用wx.showModal）
 */
function showInputModal(title, placeholder, callback) {
    wx.showModal({
        title: title,
        content: '',
        editable: true,
       // placeholderText: placeholder,
        success: function(res) {
            if (res.confirm && res.content) {
                callback(res.content.trim());
            } else {
                callback('');
            }
        },
        fail: function() {
            callback('');
        }
    });
}

/**
 * 处理登录/注册后的数据，设置player ID
 * @param {Object} data - 登录/注册返回的数据
 * @returns {Promise<Object>} 处理结果，包含是否需要创建角色
 * 修复标识: FIX_PLAYER_ID_20240326
 * 修复标识: FIX_CREATE_CHARACTER_20260326
 */
async function handleAuthResponse(data) {
    console.log('处理登录/注册响应数据:', data);

    // 检查是否有后端返回的player信息
    if (data && data.player && data.player.id) {
        const backendPlayerId = data.player.id;
        console.log('后端返回的player ID:', backendPlayerId);

        // 设置到全局playerInfo
        playerInfo.id = backendPlayerId;
        playerInfo.name = data.player.name || '修仙者';
        playerInfo.avatar = data.player.avatar || '';

        // 设置到gameEngine.state.data.player.id
        if (gameEngine && gameEngine.state && gameEngine.state.data && gameEngine.state.data.player) {
            gameEngine.state.data.player.id = backendPlayerId;
            gameEngine.state.data.player.name = data.player.name || '修仙者';
            gameEngine.state.data.player.avatar = data.player.avatar || '';
            console.log('已设置gameEngine.state.data.player.id:', backendPlayerId);
        } else {
            console.warn('gameEngine.state.data.player不存在，无法设置player ID');
        }

        // 保存用户ID到本地存储
        wx.setStorage({
            key: 'user_id',
            data: data.user ? data.user.id : null
        });

        return {
            hasPlayer: true,
            needCreateCharacter: data.needCreateCharacter || false,
            userId: data.user ? data.user.id : null
        };
    } else {
        console.warn('后端返回数据中没有player.id，需要创建角色');
        return {
            hasPlayer: false,
            needCreateCharacter: true,
            userId: data.user ? data.user.id : null
        };
    }
}

/**
 * 创建角色API调用
 * @param {string} userId - 用户ID
 * @param {string} name - 角色名称
 * @returns {Promise<Object>} 创建结果
 * 修复标识: FIX_PLAYER_ID_20240326
 */
function createCharacter(userId, name) {
    return new Promise((resolve, reject) => {
        const url = CONFIG.SERVER_URL + '/api/users/character';

        wx.request({
            url: url,
            method: 'POST',
            data: {
                userId: userId,
                name: name
            },
            header: {
                'Content-Type': 'application/json'
            },
            timeout: CONFIG.API_TIMEOUT,
            success: function(res) {
                console.log('创建角色响应:', res);

                if (res.data && res.data.status === 'success') {
                    resolve(res.data.data);
                } else {
                    let errorMessage = '创建角色失败';
                    if (res.data && res.data.message) {
                        errorMessage = res.data.message;
                    }
                    reject(new Error(errorMessage));
                }
            },
            fail: function(err) {
                console.error('创建角色请求失败:', err);
                reject(new Error('网络请求失败'));
            }
        });
    });
}

/**
 * 处理登录按钮点击
 * 修复标识: FIX_PLAYER_ID_20240326
 */
function handleLogin() {
    // 第一步：获取账号
    showInputModal('登录', '请输入账号', function(username) {
        if (!username) {
            wx.showModal({ title: '错误', content: '请输入账号' });
            return;
        }
        // 第二步：获取密码
        showInputModal('登录', '请输入密码', function(password) {
            if (!password) {
                wx.showModal({ title: '错误', content: '请输入密码' });
                return;
            }
            wx.showLoading({ title: '登录中...' });
            login(username, password)
                .then(async data => {
                    wx.hideLoading();

                    // 处理登录响应数据
                    const authResult = await handleAuthResponse(data);

                    // 检查是否需要创建角色
                    if (authResult.needCreateCharacter) {
                        console.log('需要创建角色，显示创建角色对话框');
                        showCreateCharacterDialog(authResult.userId);
                        return;
                    }

                    wx.showToast({ title: '登录成功' });
                    // 开始游戏
                    loadPlayerInfo();
                    startGame();
                })
                .catch(error => {
                    wx.hideLoading();
                    wx.showModal({ title: '登录失败', content: error.message });
                });
        });
    });
}

/**
 * 生成随机用户名
 * @returns {string} 随机用户名
 * 修复标识: FIX_CREATE_CHARACTER_20260326
 */
function generateRandomUsername() {
    const prefixes = ['修仙', '修真', '炼气', '筑基', '金丹', '元婴', '化神', '大乘'];
    const suffixes = ['真人', '上人', '仙人', '道友', '居士', '散人', '修士', '仙人'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    const randomNumber = Math.floor(Math.random() * 9999);
    return randomPrefix + randomSuffix + randomNumber;
}

/**
 * 绘制创建角色界面
 * 修复标识: FIX_CREATE_CHARACTER_20260326
 */
function drawCreateCharacterPage(ctx, width, height, characterData) {
    // 清空画布
    ctx.fillStyle = '#2d2d2d';
    ctx.fillRect(0, 0, width, height);
    
    // 绘制创建角色页面
    const panelWidth = width * 0.8;
    const panelHeight = height * 0.7;
    const panelX = (width - panelWidth) / 2;
    const panelY = (height - panelHeight) / 2;
    
    // 绘制面板背景
    ctx.fillStyle = '#4a4a4a';
    ctx.beginPath();
    ctx.roundRect(panelX, panelY, panelWidth, panelHeight, [10, 10, 10, 10]);
    ctx.fill();
    
    // 绘制标题
    ctx.fillStyle = '#d4a853';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('创建角色', width / 2, panelY + 40);
    
    // 头像区域
    const avatarSize = 80;
    const avatarX = panelX + panelWidth / 2 - avatarSize / 2;
    const avatarY = panelY + 80;
    
    // 绘制头像边框
    ctx.fillStyle = '#5a5a5a';
    ctx.beginPath();
    ctx.roundRect(avatarX, avatarY, avatarSize, avatarSize, [4, 4, 4, 4]);
    ctx.fill();
    
    // 显示头像
    if (characterData.avatar) {
        try {
            const avatarImage = wx.createImage();
            avatarImage.src = characterData.avatar;
            ctx.drawImage(avatarImage, avatarX, avatarY, avatarSize, avatarSize);
        } catch (e) {
            ctx.fillStyle = '#999999';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('头像', avatarX + avatarSize / 2, avatarY + avatarSize / 2 + 7);
        }
    } else {
        ctx.fillStyle = '#999999';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('头像', avatarX + avatarSize / 2, avatarY + avatarSize / 2 + 7);
    }
    
    // 用户名输入区域
    const inputWidth = panelWidth - 40;
    const inputHeight = 40;
    const inputX = panelX + 20;
    const inputY = avatarY + avatarSize + 30;
    
    // 绘制输入框背景
    ctx.fillStyle = '#5a5a5a';
    ctx.beginPath();
    ctx.roundRect(inputX, inputY, inputWidth, inputHeight, [4, 4, 4, 4]);
    ctx.fill();
    
    // 绘制用户名
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(characterData.username, inputX + 15, inputY + 25);
    
    // 绘制"随机"按钮
    const randomBtnWidth = 60;
    const randomBtnX = inputX + inputWidth - randomBtnWidth - 10;
    const randomBtnY = inputY;
    
    ctx.fillStyle = '#d4a853';
    ctx.beginPath();
    ctx.roundRect(randomBtnX, randomBtnY, randomBtnWidth, inputHeight, [4, 4, 4, 4]);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('随机', randomBtnX + randomBtnWidth / 2, randomBtnY + 25);
    
    // 绘制"确定"按钮
    const confirmBtnWidth = panelWidth - 40;
    const confirmBtnHeight = 40;
    const confirmBtnX = panelX + 20;
    const confirmBtnY = inputY + inputHeight + 30;
    
    ctx.fillStyle = '#d4a853';
    ctx.beginPath();
    ctx.roundRect(confirmBtnX, confirmBtnY, confirmBtnWidth, confirmBtnHeight, [4, 4, 4, 4]);
    ctx.fill();
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('确定', confirmBtnX + confirmBtnWidth / 2, confirmBtnY + 25);
}

/**
 * 处理创建角色界面的触摸事件
 * @param {Object} e - 触摸事件
 * @param {Object} characterData - 角色数据
 * @param {Function} onConfirm - 确定回调
 * @param {Function} onRandom - 随机用户名回调
 * 修复标识: FIX_CREATE_CHARACTER_20260326
 */
function handleCreateCharacterTouch(e, characterData, onConfirm, onRandom) {
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;
    
    // 计算面板坐标
    const panelWidth = screenWidth * 0.8;
    const panelHeight = screenHeight * 0.7;
    const panelX = (screenWidth - panelWidth) / 2;
    const panelY = (screenHeight - panelHeight) / 2;
    
    // 计算随机按钮坐标
    const inputWidth = panelWidth - 40;
    const inputHeight = 40;
    const inputX = panelX + 20;
    const inputY = panelY + 190; // 头像Y + 头像大小 + 30
    const randomBtnWidth = 60;
    const randomBtnX = inputX + inputWidth - randomBtnWidth - 10;
    const randomBtnY = inputY;
    
    // 计算确定按钮坐标
    const confirmBtnWidth = panelWidth - 40;
    const confirmBtnHeight = 40;
    const confirmBtnX = panelX + 20;
    const confirmBtnY = inputY + inputHeight + 30;
    
    // 检查是否点击了随机按钮
    if (x >= randomBtnX && x <= randomBtnX + randomBtnWidth && y >= randomBtnY && y <= randomBtnY + inputHeight) {
        console.log('点击了随机按钮');
        if (onRandom) {
            onRandom();
        }
        return;
    }
    
    // 检查是否点击了确定按钮
    if (x >= confirmBtnX && x <= confirmBtnX + confirmBtnWidth && y >= confirmBtnY && y <= confirmBtnY + confirmBtnHeight) {
        console.log('点击了确定按钮');
        if (onConfirm) {
            onConfirm();
        }
        return;
    }
    
    // 检查是否点击了输入框（用户名编辑）
    if (x >= inputX && x <= inputX + inputWidth - 80 && y >= inputY && y <= inputY + inputHeight) {
        console.log('点击了输入框');
        showInputModal('修改用户名', '请输入新的角色名称', function(newUsername) {
            if (newUsername) {
                characterData.username = newUsername;
                drawCreateCharacterPage(ctx, screenWidth, screenHeight, characterData);
            }
        });
        return;
    }
}

/**
 * 开始修炼API调用
 * @returns {Promise<Object>} 开始修炼结果
 * 修复标识: FIX_CULTIVATION_20260327
 */
function startCultivation() {
    return new Promise((resolve, reject) => {
        if (!gameEngine || !gameEngine.state || !gameEngine.state.data || !gameEngine.state.data.player || !gameEngine.state.data.player.id) {
            const error = new Error('玩家信息不存在');
            console.error('开始修炼失败:', error);
            reject(error);
            return;
        }
        
        const playerId = gameEngine.state.data.player.id;
        const url = CONFIG.SERVER_URL + '/api/player/cultivation/start';
        
        console.log('开始修炼请求:', url, { playerId });
        
        wx.showLoading({ title: '开始修炼中...' });
        
        wx.request({
            url: url,
            method: 'POST',
            data: {
                playerId: playerId
            },
            header: {
                'Content-Type': 'application/json'
            },
            timeout: CONFIG.API_TIMEOUT,
            success: function(res) {
                wx.hideLoading();
                console.log('开始修炼响应:', res);
                
                if (res.data && res.data.status === 'success') {
                    const data = res.data.data;
                    
                    // 更新游戏状态
                    if (gameEngine && gameEngine.state && gameEngine.state.data) {
                        gameEngine.state.data.training.cultivation.active = true;
                        gameEngine.state.data.training.cultivation.startTime = data.startTime;
                        gameEngine.state.data.training.cultivation.realTimeEfficiency = data.realTimeEfficiency;
                        console.log('修炼状态已更新:', data);
                    }
                    
                    wx.showToast({ title: '开始修炼成功' });
                    resolve(data);
                } else {
                    let errorMessage = '开始修炼失败';
                    if (res.data && res.data.message) {
                        errorMessage = res.data.message;
                    }
                    wx.showModal({ title: '错误', content: errorMessage });
                    reject(new Error(errorMessage));
                }
            },
            fail: function(err) {
                wx.hideLoading();
                console.error('开始修炼请求失败:', err);
                wx.showModal({ title: '错误', content: '网络请求失败' });
                reject(new Error('网络请求失败'));
            }
        });
    });
}

/**
 * 停止修炼API调用
 * @returns {Promise<Object>} 停止修炼结果
 * 修复标识: FIX_CULTIVATION_20260327
 */
function stopCultivation() {
    return new Promise((resolve, reject) => {
        if (!gameEngine || !gameEngine.state || !gameEngine.state.data || !gameEngine.state.data.player || !gameEngine.state.data.player.id) {
            const error = new Error('玩家信息不存在');
            console.error('停止修炼失败:', error);
            reject(error);
            return;
        }
        
        const playerId = gameEngine.state.data.player.id;
        const url = CONFIG.SERVER_URL + '/api/player/cultivation/stop';
        
        console.log('停止修炼请求:', url, { playerId });
        
        wx.showLoading({ title: '停止修炼中...' });
        
        wx.request({
            url: url,
            method: 'POST',
            data: {
                playerId: playerId
            },
            header: {
                'Content-Type': 'application/json'
            },
            timeout: CONFIG.API_TIMEOUT,
            success: function(res) {
                wx.hideLoading();
                console.log('停止修炼响应:', res);
                
                if (res.data && res.data.status === 'success') {
                    const data = res.data.data;
                    
                    // 更新游戏状态
                    if (gameEngine && gameEngine.state && gameEngine.state.data) {
                        gameEngine.state.data.training.cultivation.active = false;
                        gameEngine.state.data.training.cultivation.endTime = data.endTime;
                        console.log('修炼状态已更新:', data);
                    }
                    
                    wx.showToast({ title: '停止修炼成功' });
                    resolve(data);
                } else {
                    let errorMessage = '停止修炼失败';
                    if (res.data && res.data.message) {
                        errorMessage = res.data.message;
                    }
                    wx.showModal({ title: '错误', content: errorMessage });
                    reject(new Error(errorMessage));
                }
            },
            fail: function(err) {
                wx.hideLoading();
                console.error('停止修炼请求失败:', err);
                wx.showModal({ title: '错误', content: '网络请求失败' });
                reject(new Error('网络请求失败'));
            }
        });
    });
}

/**
 * 显示创建角色对话框
 * @param {string} userId - 用户ID
 * 修复标识: FIX_PLAYER_ID_20240326
 * 修复标识: FIX_CREATE_CHARACTER_20260326
 */
function showCreateCharacterDialog(userId) {
    // 生成初始角色数据
    const characterData = {
        username: generateRandomUsername(),
        avatar: '' // 暂时使用空头像
    };
    
    // 显示创建角色界面
    drawCreateCharacterPage(ctx, screenWidth, screenHeight, characterData);
    
    // 移除旧的触摸事件监听器
    canvas.removeEventListener('touchstart', handleTouchStart, false);
    
    // 添加创建角色界面的触摸事件监听器
    const handleCreateCharacterTouchWrapper = function(e) {
        handleCreateCharacterTouch(e, characterData, 
            function() {
                // 确定按钮回调
                const characterName = characterData.username;
                if (!characterName) {
                    wx.showModal({
                        title: '错误',
                        content: '请输入角色名称',
                        success: function() {
                            drawCreateCharacterPage(ctx, screenWidth, screenHeight, characterData);
                        }
                    });
                    return;
                }
                
                wx.showLoading({ title: '创建角色中...' });
                createCharacter(userId, characterName)
                    .then(data => {
                        wx.hideLoading();
                        wx.showToast({ title: '角色创建成功' });
                        
                        // 移除触摸事件监听器
                        canvas.removeEventListener('touchstart', handleCreateCharacterTouchWrapper, false);
                        
                        // 更新player信息
                        if (data && data.player) {
                            handleAuthResponse({
                                player: data.player,
                                user: { id: userId }
                            });
                        }
                        
                        // 开始游戏
                        loadPlayerInfo();
                        startGame();
                    })
                    .catch(error => {
                        wx.hideLoading();
                        wx.showModal({
                            title: '创建角色失败',
                            content: error.message,
                            success: function() {
                                drawCreateCharacterPage(ctx, screenWidth, screenHeight, characterData);
                            }
                        });
                    });
            },
            function() {
                // 随机按钮回调
                characterData.username = generateRandomUsername();
                drawCreateCharacterPage(ctx, screenWidth, screenHeight, characterData);
            }
        );
    };
    
    canvas.addEventListener('touchstart', handleCreateCharacterTouchWrapper, false);
    console.log('创建角色界面显示，触摸事件监听器已添加');
}

/**
 * 处理注册按钮点击
 * 修复标识: FIX_PLAYER_ID_20240326
 */
function handleRegister() {
    // 第一步：获取账号
    showInputModal('注册', '请输入账号', function(username) {
        if (!username) {
            wx.showModal({ title: '错误', content: '请输入账号' });
            return;
        }
        // 第二步：获取密码
        showInputModal('注册', '请输入密码', function(password) {
            if (!password) {
                wx.showModal({ title: '错误', content: '请输入密码' });
                return;
            }
            // 第三步：确认密码
            showInputModal('注册', '请确认密码', function(confirmPassword) {
                if (!confirmPassword) {
                    wx.showModal({ title: '错误', content: '请输入确认密码' });
                    return;
                }
                if (password !== confirmPassword) {
                    wx.showModal({ title: '错误', content: '两次输入的密码不一致' });
                    return;
                }
                wx.showLoading({ title: '注册中...' });
                register(username, password)
                    .then(async data => {
                        wx.hideLoading();

                        // 处理注册响应数据
                        const authResult = await handleAuthResponse(data);

                        // 检查是否需要创建角色
                        if (authResult.needCreateCharacter) {
                            console.log('需要创建角色，显示创建角色对话框');
                            showCreateCharacterDialog(authResult.userId);
                            return;
                        }

                        wx.showToast({ title: '注册成功' });
                        // 开始游戏
                        loadPlayerInfo();
                        startGame();
                    })
                    .catch(error => {
                        wx.hideLoading();
                        wx.showModal({ title: '注册失败', content: error.message });
                    });
            });
        });
    });
}

/**
 * 绘制登录/注册页面
 */
function drawLoginRegisterPage(ctx, width, height) {
    // 清空画布
    ctx.fillStyle = '#2d2d2d';
    ctx.fillRect(0, 0, width, height);
    
    // 绘制登录/注册页面
    const panelWidth = width * 0.8;
    const panelHeight = height * 0.6;
    const panelX = (width - panelWidth) / 2;
    const panelY = (height - panelHeight) / 2;
    
    // 绘制面板背景
    ctx.fillStyle = '#4a4a4a';
    ctx.beginPath();
    // 使用数组形式的radius参数，兼容微信小游戏的Canvas实现
    ctx.roundRect(panelX, panelY, panelWidth, panelHeight, [10, 10, 10, 10]);
    ctx.fill();
    
    // 绘制标题
    ctx.fillStyle = '#d4a853';
    ctx.font = '24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('修仙之路', width / 2, panelY + 40);
    
    // 绘制提示文本
    ctx.fillStyle = '#ffffff';
    ctx.font = '14px sans-serif';
    ctx.fillText('请登录或注册账号', width / 2, panelY + 70);
    
    // 绘制登录标签
    if (currentPanel === 'login') {
        ctx.fillStyle = '#d4a853';
    } else {
        ctx.fillStyle = '#5a5a5a';
    }
    ctx.fillRect(panelX + 20, panelY + 100, (panelWidth - 50) / 2, 40);
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px sans-serif';
    ctx.fillText('登录', panelX + 20 + (panelWidth - 50) / 4, panelY + 125);
    
    // 绘制注册标签
    if (currentPanel === 'register') {
        ctx.fillStyle = '#d4a853';
    } else {
        ctx.fillStyle = '#5a5a5a';
    }
    ctx.fillRect(panelX + 20 + (panelWidth - 50) / 2 + 10, panelY + 100, (panelWidth - 50) / 2, 40);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('注册', panelX + 20 + (panelWidth - 50) / 2 + 10 + (panelWidth - 50) / 4, panelY + 125);
    
    if (currentPanel === 'login') {
        // 绘制登录表单
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(panelX + 20, panelY + 160, panelWidth - 40, 40);
        ctx.fillStyle = '#999999';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('账号', panelX + 30, panelY + 185);
        
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(panelX + 20, panelY + 210, panelWidth - 40, 40);
        ctx.fillStyle = '#999999';
        ctx.fillText('密码', panelX + 30, panelY + 235);
        
        // 绘制登录按钮
        ctx.fillStyle = '#d4a853';
        ctx.fillRect(panelX + 20, panelY + 260, panelWidth - 40, 40);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('登录', width / 2, panelY + 285);
    } else {
        // 绘制注册表单
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(panelX + 20, panelY + 160, panelWidth - 40, 40);
        ctx.fillStyle = '#999999';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('账号', panelX + 30, panelY + 185);
        
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(panelX + 20, panelY + 210, panelWidth - 40, 40);
        ctx.fillStyle = '#999999';
        ctx.fillText('密码', panelX + 30, panelY + 235);
        
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(panelX + 20, panelY + 260, panelWidth - 40, 40);
        ctx.fillStyle = '#999999';
        ctx.fillText('确认密码', panelX + 30, panelY + 285);
        
        // 绘制注册按钮
        ctx.fillStyle = '#d4a853';
        ctx.fillRect(panelX + 20, panelY + 310, panelWidth - 40, 40);
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.fillText('注册', width / 2, panelY + 335);
    }
    
    // 移除旧的点击事件监听（如果存在）
    if (canvas.onclick) {
        canvas.onclick = null;
    }
}

/**
 * 从后端获取玩家信息
 */
function loadPlayerInfo() {
    if (!gameEngine || !gameEngine.state || !gameEngine.state.data) {
        return;
    }

    var playerId = gameEngine.state.data.player.id;
    if (!playerId) {
        return;
    }

    // 检查是否是本地生成的ID（带player_前缀），如果是则不请求后端
    if (playerId.startsWith('player_')) {
        console.log('使用本地生成的ID，跳过后端玩家信息请求');
        return;
    }

    var url = CONFIG.SERVER_URL + '/api/player/info?id=' + playerId;

    console.log('从后端请求玩家信息:', url);

    wx.request({
        url: url,
        method: 'GET',
        timeout: CONFIG.API_TIMEOUT,
        success: function(res) {
            console.log('后端响应:', res);

            if (res.statusCode === 200 && res.data && res.data.status === 'success' && res.data.data) {
                var info = res.data.data;
                
                // 更新全局玩家信息缓存
                playerInfo.id = info.id || playerInfo.id;
                playerInfo.name = info.name || playerInfo.name;
                playerInfo.avatar = info.avatar || playerInfo.avatar;

                console.log('成功获取并更新玩家信息:', playerInfo);
                
                // 强制触发界面更新
                drawHomePage();
            } else {
                console.warn('后端返回数据格式错误:', res);
            }
        },
        fail: function(err) {
            console.warn('请求后端失败:', err);
            // 接口调用失败不影响游戏正常运行
        }
    });
}

/**
 * 按照正确的顺序加载模块
 */
function loadModules() {
    try {
        console.log('开始加载模块');
        
        // 1. 先加载工具模块
        console.log('加载CSVLoader模块');
        var CSVLoader = require('./src/js/csvLoader.js');
        if (typeof global !== 'undefined') {
            global.CSVLoader = CSVLoader;
        }
        
        console.log('加载ColorManager模块');
        var ColorManager = require('./src/js/colorManager.js');
        if (typeof global !== 'undefined') {
            global.ColorManager = ColorManager;
        }
        
        // 2. 加载游戏配置
        console.log('加载游戏配置模块');
        var GameConfig = require('./src/data/gameConfig.js');
        if (typeof global !== 'undefined') {
            global.GameConfig = GameConfig;
        }
        
        console.log('游戏配置加载完成');
        
        // 3. 加载游戏状态管理模块
        console.log('加载GameState模块');
        GameState = require('./src/js/gameState.js');
        if (typeof global !== 'undefined') {
            global.GameState = GameState;
        }
        
        // 4. 加载所有游戏系统模块
        console.log('加载游戏系统模块');
        TrainingSystem = require('./src/js/trainingSystem.js');
        if (typeof global !== 'undefined') {
            global.TrainingSystem = TrainingSystem;
        }
        RealmSystem = require('./src/js/realmSystem.js');
        if (typeof global !== 'undefined') {
            global.RealmSystem = RealmSystem;
        }
        SkillSystem = require('./src/js/skillSystem.js');
        if (typeof global !== 'undefined') {
            global.SkillSystem = SkillSystem;
        }
        EquipmentSystem = require('./src/js/equipmentSystem.js');
        if (typeof global !== 'undefined') {
            global.EquipmentSystem = EquipmentSystem;
        }
        BodyTrainingSystem = require('./src/js/bodyTrainingSystem.js');
        if (typeof global !== 'undefined') {
            global.BodyTrainingSystem = BodyTrainingSystem;
        }
        AlchemySystem = require('./src/js/alchemySystem.js');
        if (typeof global !== 'undefined') {
            global.AlchemySystem = AlchemySystem;
        }
        PetSystem = require('./src/js/petSystem.js');
        if (typeof global !== 'undefined') {
            global.PetSystem = PetSystem;
        }
        DailyTaskSystem = require('./src/js/dailyTaskSystem.js');
        if (typeof global !== 'undefined') {
            global.DailyTaskSystem = DailyTaskSystem;
        }
        GiftSystem = require('./src/js/giftSystem.js');
        if (typeof global !== 'undefined') {
            global.GiftSystem = GiftSystem;
        }
        CheckinSystem = require('./src/js/checkinSystem.js');
        if (typeof global !== 'undefined') {
            global.CheckinSystem = CheckinSystem;
        }
        AchievementSystem = require('./src/js/achievementSystem.js');
        if (typeof global !== 'undefined') {
            global.AchievementSystem = AchievementSystem;
        }
        MarketSystem = require('./src/js/marketSystem.js');
        if (typeof global !== 'undefined') {
            global.MarketSystem = MarketSystem;
        }
        SectSystem = require('./src/js/sectSystem.js');
        if (typeof global !== 'undefined') {
            global.SectSystem = SectSystem;
        }
        TowerSystem = require('./src/js/towerSystem.js');
        if (typeof global !== 'undefined') {
            global.TowerSystem = TowerSystem;
        }
        GodListSystem = require('./src/js/godListSystem.js');
        if (typeof global !== 'undefined') {
            global.GodListSystem = GodListSystem;
        }
        MartialStageSystem = require('./src/js/martialStageSystem.js');
        if (typeof global !== 'undefined') {
            global.MartialStageSystem = MartialStageSystem;
        }
        UIManager = require('./src/js/uiManager.js');
        if (typeof global !== 'undefined') {
            global.UIManager = UIManager;
        }
        
        // 5. 加载游戏引擎模块
        console.log('加载GameEngine模块');
        GameEngine = require('./src/js/gameEngine.js');
        
        console.log('所有模块加载完成');
        
        // 初始化游戏引擎
        initGameEngine();
        
    } catch (error) {
        console.error('模块加载失败:', error);
        
        wx.hideLoading();
        wx.showModal({
            title: '错误',
            content: '模块加载失败: ' + error.message,
            showCancel: false
        });
    }
}

/**
 * 初始化游戏引擎
 */
function initGameEngine() {
    try {
        console.log('开始初始化游戏引擎');

        // 先创建并初始化GameState
        var GameStateClass = typeof global !== 'undefined' ? global.GameState : GameState;
        var gameState = new GameStateClass();

        // 等待GameState初始化完成
            gameState.init().then(function() {
                console.log('游戏状态初始化完成');

                // 创建游戏引擎实例，传入已初始化的GameState
                var GameEngineClass = typeof global !== 'undefined' ? global.GameEngine : GameEngine;
                gameEngine = new GameEngineClass(gameState);

                // 初始化游戏引擎
                return gameEngine.init();
            }).then(function() {
                console.log('游戏引擎初始化完成');

                // 隐藏加载界面
                wx.hideLoading();

                // 检查登录状态
                return checkLoginStatus();
            }).then(function(loggedIn) {
                console.log('登录状态检查完成:', loggedIn);
                
                if (loggedIn) {
                    // 已登录，加载玩家信息并开始游戏
                    loadPlayerInfo();
                    startGame();
                } else {
                    // 未登录，显示登录/注册页面
                    console.log('未登录，显示登录/注册页面');
                    showLoginRegisterPage();
                }

            }).catch(function(error) {
                console.error('游戏初始化失败:', error);

                wx.hideLoading();
                wx.showModal({
                    title: '错误',
                    content: '游戏初始化失败: ' + error.message,
                    showCancel: false
                });
            });

    } catch (error) {
        console.error('游戏引擎初始化失败:', error);

        wx.hideLoading();
        wx.showModal({
            title: '错误',
            content: '游戏初始化失败: ' + error.message,
            showCancel: false
        });
    }
}

/**
 * 处理游戏主界面的触摸事件
 * 修复标识: FIX_CULTIVATION_20260327
 */
function handleGameTouch(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;
    
    if (!gameEngine || !gameEngine.state || !gameEngine.state.data) {
        return;
    }
    
    const state = gameEngine.state.data;
    
    // 计算修炼控制按钮坐标
    const mainY = 130; // 主内容区域Y坐标
    const equipCharHeight = 200; // 装备和角色区域高度
    const progressY = mainY + equipCharHeight + 10; // 修炼进度条Y坐标
    const buttonY = progressY + 46; // 按钮Y坐标
    const buttonWidth = (screenWidth - 30) / 2; // 按钮宽度
    
    // 检查是否点击了开始/停止修炼按钮
    if (x >= 10 && x <= 10 + buttonWidth && y >= buttonY && y <= buttonY + 40) {
        console.log('点击了修炼按钮');
        if (state.training.cultivation.active) {
            stopCultivation();
        } else {
            startCultivation();
        }
        return;
    }
    
    // 检查是否点击了突破按钮
    if (x >= buttonWidth + 20 && x <= buttonWidth + 20 + buttonWidth && y >= buttonY && y <= buttonY + 40) {
        console.log('点击了突破按钮');
        // 突破功能可以后续实现
        wx.showToast({
            title: '突破功能开发中',
            icon: 'none'
        });
        return;
    }
}

// 开始游戏
function startGame() {
    console.log('游戏开始');

    // 移除触摸事件监听器
    canvas.removeEventListener('touchstart', handleTouchStart, false);
    
    // 添加游戏界面的触摸事件监听器
    canvas.addEventListener('touchstart', handleGameTouch, false);

    // 显示欢迎提示
    wx.showToast({
        title: '欢迎来到正经修仙',
        icon: 'none',
        duration: 2000
    });

    // 开始游戏循环
    gameLoop();
}

// 游戏主循环
function gameLoop() {
    // 清空画布
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(0, 0, screenWidth, screenHeight);

    // 绘制游戏界面
    drawGameInterface();

    // 请求下一帧
    requestAnimationFrame(gameLoop);
}

/**
 * 绘制游戏界面
 */
function drawGameInterface() {
    // 绘制网页版风格的主页
    drawHomePage();
}

// ==================== 绘制辅助函数 ====================

/**
 * 绘制圆角矩形
 */
function drawRoundRect(x, y, width, height, radius, fillColor, strokeColor = null, lineWidth = 1) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    if (fillColor) {
        ctx.fillStyle = fillColor;
        ctx.fill();
    }

    if (strokeColor) {
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    }
}

/**
 * 绘制文本
 */
function drawText(text, x, y, fontSize = 14, color = '#ffffff', align = 'left') {
    ctx.font = fontSize + 'px sans-serif';
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = 'top';
    ctx.fillText(text, x, y);
}

/**
 * 绘制按钮
 */
function drawButton(x, y, width, height, text, bgColor = '#4a4a4a', textColor = '#ffffff', fontSize = 14) {
    drawRoundRect(x, y, width, height, 6, bgColor);
    drawText(text, x + width / 2, y + (height - fontSize) / 2, fontSize, textColor, 'center');
}

/**
 * 绘制进度条
 */
function drawProgressBar(x, y, width, height, progress, fillColor = '#4caf50', bgColor = '#5a5a5a') {
    drawRoundRect(x, y, width, height, 4, bgColor);
    drawRoundRect(x, y, width * progress, height, 4, fillColor);
}

// ==================== 主页绘制 ====================

/**
 * 绘制主页（网页版风格）
 */
function drawHomePage() {
    if (!gameEngine || !gameEngine.state || !gameEngine.state.data) {
        drawLoadingScreen();
        return;
    }

    const state = gameEngine.state.data;
    const equipment = state.equipment;
    const resources = state.resources;
    const player = state.player;
    const realm = state.realm;

    // 获取境界配置
    const GameConfigClass = typeof global !== 'undefined' && global.GameConfig ? global.GameConfig : null;
    let realmConfig = { name: '炼气期', baseExp: 100, expMultiplier: 1.2 };
    if (GameConfigClass && GameConfigClass.REALM && GameConfigClass.REALM.realms) {
        realmConfig = GameConfigClass.REALM.realms[realm.currentRealm] || realmConfig;
    }

    // 计算修炼进度
    const requiredExp = Math.floor(realmConfig.baseExp * Math.pow(realmConfig.expMultiplier, realm.currentLayer - 1));
    let progress = realm.exp / requiredExp;
    
    // 如果正在修炼，根据修炼时间和效率计算实时进度
    if (state.training.cultivation.active && state.training.cultivation.startTime && state.training.cultivation.realTimeEfficiency) {
        const startTime = new Date(state.training.cultivation.startTime).getTime();
        const currentTime = Date.now();
        const elapsedSeconds = (currentTime - startTime) / 1000;
        const efficiency = state.training.cultivation.realTimeEfficiency;
        const additionalExp = elapsedSeconds * efficiency;
        const totalExp = realm.exp + additionalExp;
        progress = totalExp / requiredExp;
        // 确保进度不超过100%
        if (progress > 1) progress = 1;
    }

    // ==================== 顶部用户信息 ====================
    // 微信小游戏刘海屏适配,顶部留出安全区域
    const safeAreaTop = 50; // 刘海屏安全区域高度
    const headerY = safeAreaTop + 10;

    // 使用从后端获取的玩家信息，如果没有则使用本地数据
    const displayPlayer = {
        name: playerInfo.name || (player && player.name) || '正经修仙者',
        id: playerInfo.id || (player && player.id) || '000000',
        avatar: playerInfo.avatar || null
    };

    // 头像区域（移除背景）
    if (displayPlayer.avatar) {
        // 如果有头像URL，显示头像
        try {
            const avatarImage = wx.createImage();
            avatarImage.src = displayPlayer.avatar;
            ctx.drawImage(avatarImage, 20, headerY, 40, 40);
        } catch (e) {
            drawText('头像', 40, headerY + 20, 12, '#999999', 'center');
        }
    } else {
        drawText('头像', 40, headerY + 20, 12, '#999999', 'center');
    }

    // 用户名
    drawText(displayPlayer.name, 70, headerY + 15, 16, '#ffffff');

    // 用户ID - 直接显示服务器返回的数字ID
    drawText('ID: ' + displayPlayer.id, 70, headerY + 35, 12, '#999999');

    // ==================== 资源栏 ====================
    const resourceHeight = 40;
    const resourceY = headerY + 60; // 在用户信息下方
    const resourceWidth = (screenWidth - 40) / 3;

    // 体力
    drawRoundRect(10, resourceY, resourceWidth - 8, resourceHeight, 4, '#4a4a4a');
    drawText('体力', 18, resourceY + 8, 12, '#999999');
    drawText(state.training.cave.spiritPoints.toString(), 18, resourceY + 24, 14, '#ffffff');

    // 仙晶
    drawRoundRect(resourceWidth + 2, resourceY, resourceWidth - 8, resourceHeight, 4, '#4a4a4a');
    drawText('仙晶', resourceWidth + 10, resourceY + 8, 12, '#999999');
    drawText(formatNumber(resources.immortalStone), resourceWidth + 10, resourceY + 24, 14, '#d4a853');

    // 灵石
    drawRoundRect(resourceWidth * 2 - 6, resourceY, resourceWidth - 8, resourceHeight, 4, '#4a4a4a');
    drawText('灵石', resourceWidth * 2 + 2, resourceY + 8, 12, '#999999');
    drawText(formatNumber(resources.spiritStone), resourceWidth * 2 + 2, resourceY + 24, 14, '#ffd700');

    // ==================== 主内容区域 ====================
    const mainY = resourceY + resourceHeight + 10;

    // 装备和角色区域高度
    const equipCharHeight = 200;
    const equipWidth = 80;
    const characterWidth = 120;
    const equipX = 10;

    // 绘制左侧装备栏
    drawRoundRect(equipX, mainY, equipWidth, equipCharHeight, 6, '#4a4a4a');
    drawText('装备', equipX + equipWidth / 2, mainY + 8, 12, '#999999', 'center');

    // 装备槽
    const equipSlots = [
        { slot: 'weapon', name: '武器' },
        { slot: 'armor', name: '衣服' },
        { slot: 'belt', name: '腰带' },
        { slot: 'boots', name: '鞋子' }
    ];

    equipSlots.forEach((equip, index) => {
        const slotY = mainY + 30 + index * 40;
        drawRoundRect(equipX + 8, slotY, equipWidth - 16, 36, 4, '#5a5a5a');
        drawText(equip.name, equipX + 10, slotY + 4, 10, '#cccccc');

        const equippedItem = equipment.equipped[equip.slot];
        if (equippedItem) {
            drawText(equippedItem.name, equipX + 10, slotY + 18, 10, '#ffffff');
        } else {
            drawText('+', equipX + equipWidth / 2, slotY + 18, 12, '#999999', 'center');
        }
    });

    // 绘制中间角色区域
    const characterX = equipX + equipWidth + 10;
    drawRoundRect(characterX, mainY, characterWidth, equipCharHeight, 6, '#4a4a4a');

    // 境界显示
    drawText(realmConfig.name, characterX + characterWidth / 2, mainY + 10, 14, '#d4a853', 'center');
    drawText(state.realm.currentLayer + '层', characterX + characterWidth / 2, mainY + 28, 12, '#999999', 'center');

    // 角色头像区域
    drawRoundRect(characterX + 10, mainY + 50, characterWidth - 20, 130, 4, '#5a5a5a');
    drawText('正经修仙者', characterX + characterWidth / 2, mainY + 105, 12, '#999999', 'center');

    // 绘制右侧装备栏
    const rightEquipX = characterX + characterWidth + 10;
    drawRoundRect(rightEquipX, mainY, equipWidth, equipCharHeight, 6, '#4a4a4a');
    drawText('饰品', rightEquipX + equipWidth / 2, mainY + 8, 12, '#999999', 'center');

    const accessorySlots = [
        { slot: 'necklace', name: '项链' },
        { slot: 'ring', name: '戒指' },
        { slot: 'jade', name: '玉佩' },
        { slot: 'talisman', name: '法宝' }
    ];

    accessorySlots.forEach((equip, index) => {
        const slotY = mainY + 30 + index * 40;
        drawRoundRect(rightEquipX + 8, slotY, equipWidth - 16, 36, 4, '#5a5a5a');
        drawText(equip.name, rightEquipX + 10, slotY + 4, 10, '#cccccc');

        const equippedItem = equipment.equipped[equip.slot];
        if (equippedItem) {
            drawText(equippedItem.name, rightEquipX + 10, slotY + 18, 10, '#ffffff');
        } else {
            drawText('+', rightEquipX + equipWidth / 2, slotY + 18, 12, '#999999', 'center');
        }
    });

    // ==================== 修炼进度条 ====================
    const progressY = mainY + equipCharHeight + 10;
    const progressWidth = screenWidth - 20;
    drawRoundRect(10, progressY, progressWidth, 36, 4, '#4a4a4a');

    drawText('修炼进度', 18, progressY + 8, 12, '#999999');
    drawText(
        state.training.cultivation.active ? '修炼中...' : '修炼停止',
        18,
        progressY + 20,
        10,
        state.training.cultivation.active ? '#4caf50' : '#ff5722'
    );

    const progressText = `${formatNumber(realm.exp)}/${formatNumber(requiredExp)} (${(progress * 100).toFixed(1)}%)`;
    drawText(progressText, screenWidth - 10, progressY + 20, 10, '#ffffff', 'right');

    // 进度条
    drawProgressBar(18, progressY + 4, progressWidth - 16, 4, progress, '#4caf50', '#5a5a5a');

    // ==================== 修炼控制按钮 ====================
    const buttonY = progressY + 46;
    const buttonWidth = (progressWidth - 10) / 2;

    let speedBtnText;
    if (state.training.cultivation.active) {
        // 修炼中显示修炼效率
        const efficiency = state.training.cultivation.realTimeEfficiency || 0;
        speedBtnText = `效率: ${efficiency}/秒`;
    } else {
        // 未修炼时显示开始修炼
        speedBtnText = '开始修炼';
    }
    drawButton(10, buttonY, buttonWidth, 40, speedBtnText, state.training.cultivation.active ? '#4a4a4a' : '#d4a853');
    drawButton(buttonWidth + 10, buttonY, buttonWidth, 40, '突破', '#4a4a4a');

    // ==================== 底部功能按钮 ====================
    const featureY = buttonY + 50;
    const features = [
        { icon: '📜', name: '剧情' },
        { icon: '🎒', name: '背包' },
        { icon: '📖', name: '功法' },
        { icon: '🗺️', name: '历练' },
        { icon: '⚗️', name: '丹炉' },
        { icon: '🐉', name: '灵宠' },
        { icon: '🌾', name: '灵田' },
        { icon: '💪', name: '炼体' }
    ];

    const featureWidth = (screenWidth - 20) / 4;
    features.forEach((feature, index) => {
        const row = Math.floor(index / 4);
        const col = index % 4;
        const featureX = 10 + col * (featureWidth + 2);
        const featureRowY = featureY + row * (featureWidth + 2);

        drawRoundRect(featureX, featureRowY, featureWidth, featureWidth, 6, '#4a4a4a');
        drawText(feature.icon, featureX + featureWidth / 2, featureRowY + 8, 24, '#ffffff', 'center');
        drawText(feature.name, featureX + featureWidth / 2, featureRowY + 38, 10, '#999999', 'center');
    });
}

/**
 * 格式化数字
 */
function formatNumber(num) {
    if (num >= 100000000) {
        return (num / 100000000).toFixed(2) + '亿';
    } else if (num >= 10000) {
        return (num / 10000).toFixed(2) + '万';
    }
    return num.toString();
}

/**
 * 绘制加载界面
 */
function drawLoadingScreen() {
    // 绘制背景
    drawRoundRect(0, 0, screenWidth, screenHeight, 0, '#2d2d2d');

    // 绘制游戏图标
    const iconSize = 100;
    const iconX = (screenWidth - iconSize) / 2;
    const iconY = (screenHeight - iconSize) / 2 - 50;

    // 尝试加载并绘制icon
    try {
        const iconImage = wx.createImage();
        iconImage.src = 'icon.png';

        if (iconImage.width > 0 && iconImage.height > 0) {
            ctx.drawImage(iconImage, iconX, iconY, iconSize, iconSize);
        } else {
            // 如果图片未加载，绘制占位符
            drawRoundRect(iconX, iconY, iconSize, iconSize, 10, '#4a4a4a');
            drawText('正经修仙', iconX + iconSize / 2, iconY + iconSize / 2, 24, '#d4a853', 'center');
        }
    } catch (e) {
        // 绘制占位符
        drawRoundRect(iconX, iconY, iconSize, iconSize, 10, '#4a4a4a');
        drawText('正经修仙', iconX + iconSize / 2, iconY + iconSize / 2, 24, '#d4a853', 'center');
    }

    // 绘制游戏名称
    drawText('正经修仙', screenWidth / 2, iconY + iconSize + 30, 28, '#d4a853', 'center');

    // 绘制加载提示
    drawText('游戏初始化中...', screenWidth / 2, iconY + iconSize + 80, 16, '#ffffff', 'center');

    // 绘制加载动画
    const time = Date.now() / 500;
    const dotCount = 3;
    let loadingText = '加载中';
    for (let i = 0; i < dotCount; i++) {
        const alpha = Math.sin(time - i) * 0.5 + 0.5;
        loadingText += (Math.sin(time - i) > 0 ? '.' : ' ');
    }
    drawText(loadingText, screenWidth / 2, iconY + iconSize + 110, 14, '#999999', 'center');
}

// 立即初始化游戏
initGame();