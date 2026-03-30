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

    // 只有已登录时才执行相关操作
    if (isLoggedIn && gameEngine && gameEngine.state) {
        // 恢复游戏状态
        gameEngine.state.calculateOfflineProgress();

        // 重新加载玩家信息
        if (gameEngine.state.data) {
            loadPlayerInfo();
        }
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
                    // 开始游戏 - 等待loadPlayerInfo完成后再开始
                    loadPlayerInfo().then(() => {
                        startGame();
                    }).catch((error) => {
                        console.error('加载玩家信息失败:', error);
                        startGame(); // 即使加载失败也继续游戏
                    });
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
 * 修复标识: FIX_SAVE_CULTIVATION_20260327
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
                    
                    // 重新从服务器获取最新的角色信息（包括修炼值）
                    console.log('重新获取最新角色信息...');
                    loadPlayerInfo();
                    
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

// ==================== 页面状态管理 ====================

/**
 * 当前显示的页面
 * 修复标识: FIX_PLAYER_PAGE_20260327
 */
var currentPage = 'home'; // 'home', 'attributes', 'skills', etc.

/**
 * 切换到指定页面
 * @param {string} page - 页面名称
 */
function switchToPage(page) {
    currentPage = page;
    console.log('切换到页面:', page);
}

/**
 * 返回主页
 */
function goBackToHome() {
    currentPage = 'home';
    console.log('返回主页');
}

/**
 * 显示用户属性页面（页面形式，非弹窗）
 * 修复标识: FIX_PLAYER_PAGE_20260327
 */
function showPlayerAttributesPage() {
    switchToPage('attributes');
}

/**
 * 绘制角色属性页面
 * 修复标识: FIX_PLAYER_PAGE_20260327
 */
function drawAttributesPage() {
    if (!gameEngine || !gameEngine.state || !gameEngine.state.data) {
        return;
    }

    const state = gameEngine.state.data;
    const player = state.player || {};
    const realm = state.realm || {};
    const root = player.root || {};
    const baseAttributes = player.baseAttributes || {};
    const attributes = player.attributes || {};

    // 页面背景
    ctx.fillStyle = '#3a3a3a';
    ctx.fillRect(0, 0, screenWidth, screenHeight);

    // 顶部导航栏
    const navHeight = 50;
    const safeAreaTop = 50;
    
    // 返回按钮
    drawRoundRect(15, safeAreaTop + 10, 60, 30, 15, '#4a4a4a');
    drawText('< 返回', 45, safeAreaTop + 16, 14, '#ffffff', 'center');
    
    // 页面标题
    drawText('角色属性', screenWidth / 2, safeAreaTop + 16, 18, '#d4a853', 'center');

    // 内容区域起始Y坐标
    const contentY = safeAreaTop + navHeight + 20;
    const contentX = 15;
    const contentWidth = screenWidth - 30;

    // ==================== 基本信息区域 ====================
    const infoHeight = 100;
    drawRoundRect(contentX, contentY, contentWidth, infoHeight, 8, '#4a4a4a');
    
    // 头像
    const avatarSize = 60;
    const avatarX = contentX + 15;
    const avatarY = contentY + 20;
    
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI * 2);
    ctx.fillStyle = '#5a5a5a';
    ctx.fill();
    
    if (player.avatar || playerInfo.avatar) {
        try {
            const avatarImage = wx.createImage();
            avatarImage.src = player.avatar || playerInfo.avatar;
            ctx.save();
            ctx.beginPath();
            ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2 - 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(avatarImage, avatarX, avatarY, avatarSize, avatarSize);
            ctx.restore();
        } catch (e) {
            drawText('头像', avatarX + avatarSize/2, avatarY + avatarSize/2 - 6, 14, '#999999', 'center');
        }
    } else {
        drawText('头像', avatarX + avatarSize/2, avatarY + avatarSize/2 - 6, 14, '#999999', 'center');
    }
    
    // 姓名和ID
    drawText(player.name || playerInfo.name || '修仙者', avatarX + avatarSize + 15, avatarY + 5, 16, '#ffffff');
    drawText('ID: ' + (player.id || playerInfo.id || '000000'), avatarX + avatarSize + 15, avatarY + 30, 12, '#999999');
    
    // 境界
    const realmText = (realm.name || '凡人境') + ' · ' + (realm.currentLayer || 1) + '层';
    drawText(realmText, avatarX + avatarSize + 15, avatarY + 50, 14, '#d4a853');

    // ==================== 跟脚信息区域 ====================
    const rootY = contentY + infoHeight + 15;
    const rootHeight = 80;
    drawRoundRect(contentX, rootY, contentWidth, rootHeight, 8, '#4a4a4a');
    
    drawText('跟脚', contentX + 15, rootY + 12, 14, '#d4a853');
    
    let spiritRootInfo = '未知';
    if (root.name) {
        spiritRootInfo = root.name;
        if (root.bonus) {
            spiritRootInfo += ' (修炼加成: ' + (root.bonus * 100).toFixed(0) + '%)';
        }
    }
    drawText(spiritRootInfo, contentX + 15, rootY + 40, 14, '#ffffff');
    
    if (root.description) {
        drawText(root.description, contentX + 15, rootY + 60, 11, '#999999');
    }
    
    // 刷新跟脚按钮
    const refreshBtnWidth = 80;
    const refreshBtnHeight = 30;
    const refreshBtnX = contentX + contentWidth - refreshBtnWidth - 15;
    const refreshBtnY = rootY + 25;
    drawRoundRect(refreshBtnX, refreshBtnY, refreshBtnWidth, refreshBtnHeight, 15, '#d4a853');
    drawText('刷新跟脚', refreshBtnX + refreshBtnWidth/2, refreshBtnY + 8, 12, '#ffffff', 'center');

    // ==================== 基础属性区域 ====================
    const baseAttrY = rootY + rootHeight + 15;
    const baseAttrHeight = 120;
    drawRoundRect(contentX, baseAttrY, contentWidth, baseAttrHeight, 8, '#4a4a4a');
    
    drawText('基础属性', contentX + 15, baseAttrY + 12, 14, '#d4a853');
    
    // 两行显示基础属性
    const baseAttrs = [
        { name: '根骨', value: baseAttributes.constitution || 0, desc: '影响生命值' },
        { name: '身法', value: baseAttributes.agility || 0, desc: '影响速度' },
        { name: '机缘', value: baseAttributes.luck || 0, desc: '影响暴击' },
        { name: '悟性', value: baseAttributes.wisdom || 0, desc: '影响修炼效率' }
    ];
    
    const attrItemWidth = contentWidth / 2;
    baseAttrs.forEach((attr, index) => {
        const row = Math.floor(index / 2);
        const col = index % 2;
        const x = contentX + col * attrItemWidth + 15;
        const y = baseAttrY + 40 + row * 35;
        
        drawText(attr.name + ': ' + attr.value, x, y, 13, '#ffffff');
        drawText(attr.desc, x + 60, y, 10, '#999999');
    });
    
    // 自由点数
    const freePoints = baseAttributes.freePoints || 0;
    if (freePoints > 0) {
        drawText('自由点数: ' + freePoints, contentX + contentWidth - 100, baseAttrY + 12, 12, '#4caf50');
    }

    // ==================== 战斗属性区域 ====================
    const combatY = baseAttrY + baseAttrHeight + 15;
    const combatHeight = 180;
    drawRoundRect(contentX, combatY, contentWidth, combatHeight, 8, '#4a4a4a');
    
    drawText('战斗属性', contentX + 15, combatY + 12, 14, '#d4a853');
    
    // 战斗属性列表
    const combatAttrs = [
        { name: '生命值', value: Math.floor(attributes.health || 0), color: '#ff6b6b' },
        { name: '法力值', value: Math.floor(attributes.mana || 0), color: '#4dabf7' },
        { name: '灵气', value: Math.floor(attributes.spirit || 0), color: '#69db7c' },
        { name: '攻击力', value: Math.floor(attributes.attack || 0), color: '#ffa94d' },
        { name: '防御力', value: Math.floor(attributes.defense || 0), color: '#74c0fc' },
        { name: '速度', value: (attributes.speed || 0).toFixed(2), color: '#e599f7' },
        { name: '闪避', value: (attributes.dodge || 0).toFixed(2) + '%', color: '#63e6be' },
        { name: '暴击率', value: (attributes.criticalRate || 0).toFixed(2) + '%', color: '#ff8787' }
    ];
    
    combatAttrs.forEach((attr, index) => {
        const row = Math.floor(index / 2);
        const col = index % 2;
        const x = contentX + col * attrItemWidth + 15;
        const y = combatY + 40 + row * 32;
        
        drawText(attr.name + ': ', x, y, 12, '#cccccc');
        drawText(attr.value.toString(), x + 50, y, 13, attr.color);
    });
}

/**
 * 刷新跟脚
 * @returns {Promise<Object>} 刷新结果
 * 修复标识: FIX_REFRESH_ROOT_20260327
 */
function refreshRoot() {
    return new Promise((resolve, reject) => {
        if (!gameEngine || !gameEngine.state || !gameEngine.state.data || !gameEngine.state.data.player || !gameEngine.state.data.player.id) {
            const error = new Error('玩家信息不存在');
            console.error('刷新跟脚失败:', error);
            reject(error);
            return;
        }
        
        const playerId = gameEngine.state.data.player.id;
        const url = CONFIG.SERVER_URL + '/api/player/attributes/refresh-root';
        
        console.log('刷新跟脚请求:', url, { playerId });
        
        wx.showLoading({ title: '刷新跟脚中...' });
        
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
                console.log('刷新跟脚响应:', res);
                
                if (res.data && res.data.status === 'success') {
                    const data = res.data.data;
                    const newRoot = data.root;
                    const currentRoot = gameEngine.state.data.player.root || {};
                    
                    // 比较跟脚等级（bonus）
                    const currentBonus = currentRoot.bonus || 0;
                    const newBonus = newRoot.bonus || 0;
                    
                    if (newBonus > currentBonus) {
                        // 新跟脚等级更高，保存
                        console.log('新跟脚等级更高，保存:', newRoot);
                        
                        // 保存到服务端
                        saveRoot(playerId, newRoot).then(() => {
                            // 重新加载角色信息，确保所有属性都从服务器获取
                            loadPlayerInfo();
                            
                            // 更新游戏状态中的跟脚信息（基础属性和衍生属性由loadPlayerInfo更新）
                            if (gameEngine && gameEngine.state && gameEngine.state.data) {
                                if (!gameEngine.state.data.player) {
                                    gameEngine.state.data.player = {};
                                }
                                gameEngine.state.data.player.root = newRoot;
                            }
                            
                            showPopup({
                                title: '刷新结果',
                                content: '跟脚刷新成功！\n\n新跟脚: ' + newRoot.name + '\n修炼加成: ' + (newBonus * 100).toFixed(0) + '%',
                                buttons: [
                                    {
                                        text: '确定',
                                        value: 'ok',
                                        isPrimary: true
                                    }
                                ],
                                callback: function() {
                                    resolve(data);
                                }
                            });
                        }).catch((error) => {
                            console.error('保存跟脚失败:', error);
                            showPopup({
                                title: '错误',
                                content: '保存跟脚失败',
                                buttons: [
                                    {
                                        text: '确定',
                                        value: 'ok',
                                        isPrimary: true
                                    }
                                ],
                                callback: function() {
                                    reject(error);
                                }
                            });
                        });
                    } else {
                        // 新跟脚等级不高于当前，不保存
                        console.log('新跟脚等级不高于当前，不保存');
                        showPopup({
                            title: '刷新结果',
                            content: '新跟脚: ' + newRoot.name + ' (加成: ' + (newBonus * 100).toFixed(0) + '%)\n' +
                                     '当前跟脚: ' + (currentRoot.name || '未知') + ' (加成: ' + (currentBonus * 100).toFixed(0) + '%)\n\n' +
                                     '新跟脚等级不高于当前，是否保留新跟脚？',
                            buttons: [
                                {
                                    text: '放弃',
                                    value: 'cancel'
                                },
                                {
                                    text: '保留',
                                    value: 'confirm',
                                    isPrimary: true
                                }
                            ],
                            callback: function(value) {
                                if (value === 'confirm') {
                                    // 用户选择保留新跟脚
                                    console.log('用户选择保留新跟脚');
                                    
                                    // 保存到服务端
                                    saveRoot(playerId, newRoot).then(() => {
                                        // 重新加载角色信息，确保所有属性都从服务器获取
                                        loadPlayerInfo();
                                        
                                        // 更新游戏状态中的跟脚信息（基础属性和衍生属性由loadPlayerInfo更新）
                                        if (gameEngine && gameEngine.state && gameEngine.state.data) {
                                            if (!gameEngine.state.data.player) {
                                                gameEngine.state.data.player = {};
                                            }
                                            gameEngine.state.data.player.root = newRoot;
                                        }
                                        
                                        resolve(data);
                                    }).catch((error) => {
                                        console.error('保存跟脚失败:', error);
                                        showPopup({
                                            title: '错误',
                                            content: '保存跟脚失败',
                                            buttons: [
                                                {
                                                    text: '确定',
                                                    value: 'ok',
                                                    isPrimary: true
                                                }
                                            ],
                                            callback: function() {
                                                reject(error);
                                            }
                                        });
                                    });
                                } else {
                                    // 用户选择放弃新跟脚
                                    console.log('用户选择放弃新跟脚');
                                    resolve(null);
                                }
                            }
                        });
                    }
                } else {
                    let errorMessage = '刷新跟脚失败';
                    if (res.data && res.data.message) {
                        errorMessage = res.data.message;
                    }
                    showPopup({
                        title: '错误',
                        content: errorMessage,
                        buttons: [
                            {
                                text: '确定',
                                value: 'ok',
                                isPrimary: true
                            }
                        ],
                        callback: function() {
                            reject(new Error(errorMessage));
                        }
                    });
                }
            },
            fail: function(err) {
                wx.hideLoading();
                console.error('刷新跟脚请求失败:', err);
                showPopup({
                    title: '错误',
                    content: '网络请求失败',
                    buttons: [
                        {
                            text: '确定',
                            value: 'ok',
                            isPrimary: true
                        }
                    ],
                    callback: function() {
                        reject(new Error('网络请求失败'));
                    }
                });
            }
        });
    });
}

/**
 * 保存跟脚到服务端
 * @param {string} playerId - 玩家ID
 * @param {Object} root - 跟脚信息
 * @returns {Promise} - 保存结果
 * 修复标识: FIX_SAVE_ROOT_20260327
 */
function saveRoot(playerId, root) {
    return new Promise((resolve, reject) => {
        if (!playerId || !root) {
            const error = new Error('参数错误');
            console.error('保存跟脚失败:', error);
            reject(error);
            return;
        }
        
        // 使用保存玩家游戏状态接口
        const url = CONFIG.SERVER_URL + `/api/player/${playerId}`;
        
        const requestData = {
            playerId: playerId,
            gameState: {
                root: root
            },
            lastSaveTime: new Date().toISOString()
        };
        
        console.log('保存跟脚请求:', url, requestData);
        
        wx.request({
            url: url,
            method: 'POST',
            data: requestData,
            header: {
                'Content-Type': 'application/json'
            },
            timeout: CONFIG.API_TIMEOUT,
            success: function(res) {
                console.log('保存跟脚响应:', res);
                
                if (res.data && res.data.status === 'success') {
                    resolve(res.data);
                } else {
                    let errorMessage = '保存跟脚失败';
                    if (res.data && res.data.message) {
                        errorMessage = res.data.message;
                    }
                    reject(new Error(errorMessage));
                }
            },
            fail: function(err) {
                console.error('保存跟脚请求失败:', err);
                reject(new Error('网络请求失败'));
            }
        });
    });
}

/**
 * 处理属性页面的触摸事件
 * @param {number} x - 触摸X坐标
 * @param {number} y - 触摸Y坐标
 * @returns {boolean} - 是否处理了事件
 * 修复标识: FIX_PLAYER_PAGE_20260327
 * 修复标识: FIX_REFRESH_ROOT_20260327
 */
function handleAttributesPageTouch(x, y) {
    const safeAreaTop = 50;
    
    // 检查返回按钮
    if (x >= 15 && x <= 75 && y >= safeAreaTop + 10 && y <= safeAreaTop + 40) {
        goBackToHome();
        return true;
    }
    
    // 检查刷新跟脚按钮
    const contentY = safeAreaTop + 50 + 20;
    const infoHeight = 100;
    const rootY = contentY + infoHeight + 15;
    const contentX = 15;
    const contentWidth = screenWidth - 30;
    const refreshBtnWidth = 80;
    const refreshBtnHeight = 30;
    const refreshBtnX = contentX + contentWidth - refreshBtnWidth - 15;
    const refreshBtnY = rootY + 25;
    
    if (x >= refreshBtnX && x <= refreshBtnX + refreshBtnWidth && 
        y >= refreshBtnY && y <= refreshBtnY + refreshBtnHeight) {
        console.log('点击了刷新跟脚按钮');
        refreshRoot();
        return true;
    }
    
    return false;
}

/**
 * 显示用户跟脚与属性信息对话框（已废弃，使用页面形式）
 * 修复标识: FIX_PLAYER_INFO_20260327
 * 修复标识: FIX_SERVER_DATA_20260327
 * 修复标识: FIX_PLAYER_PAGE_20260327
 */
function showPlayerInfoDialog() {
    // 改用页面形式显示
    showPlayerAttributesPage();
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
    ctx.fillText('正经修仙', width / 2, panelY + 40);
    
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
 * @returns {Promise} - 加载结果
 */
function loadPlayerInfo() {
    return new Promise((resolve, reject) => {
        if (!gameEngine || !gameEngine.state || !gameEngine.state.data) {
            resolve();
            return;
        }

        var playerId = gameEngine.state.data.player.id;
        if (!playerId) {
            resolve();
            return;
        }

        // 检查是否是本地生成的ID（带player_前缀），如果是则不请求后端
        if (playerId.startsWith('player_')) {
            console.log('使用本地生成的ID，跳过后端玩家信息请求');
            resolve();
            return;
        }

        // 使用character-info接口获取完整角色信息
        var url = CONFIG.SERVER_URL + '/api/player/character-info?id=' + playerId;

        console.log('从后端请求完整角色信息:', url);

        wx.request({
            url: url,
            method: 'GET',
            timeout: CONFIG.API_TIMEOUT,
            success: function(res) {
                console.log('后端响应:', res);

                if (res.statusCode === 200 && res.data && res.data.status === 'success' && res.data.data) {
                    var data = res.data.data;
                    
                    // 更新玩家基础信息 - 使用更安全的方式
                    if (data.player) {
                        playerInfo.id = data.player.id || playerInfo.id;
                        playerInfo.name = data.player.name || playerInfo.name;
                        playerInfo.avatar = data.player.avatar || playerInfo.avatar;
                        
                        // 确保player对象存在
                        if (!gameEngine.state.data.player) {
                            gameEngine.state.data.player = {};
                        }
                        // 更新游戏状态中的玩家信息
                        gameEngine.state.data.player.id = data.player.id || gameEngine.state.data.player.id;
                        gameEngine.state.data.player.name = data.player.name || gameEngine.state.data.player.name;
                        gameEngine.state.data.player.avatar = data.player.avatar || gameEngine.state.data.player.avatar;
                    }
                    
                    // 更新属性信息 - 使用更安全的方式
                    if (data.attributes) {
                        if (!gameEngine.state.data.player) {
                            gameEngine.state.data.player = {};
                        }
                        gameEngine.state.data.player.attributes = data.attributes.derived || gameEngine.state.data.player.attributes || {};
                        gameEngine.state.data.player.baseAttributes = data.attributes.base || gameEngine.state.data.player.baseAttributes || {};
                        gameEngine.state.data.player.root = data.attributes.root || gameEngine.state.data.player.root || {};
                    }
                    
                    // 更新境界信息 - 使用更安全的方式
                    if (data.realm) {
                        if (!gameEngine.state.data.realm) {
                            gameEngine.state.data.realm = {};
                        }
                        gameEngine.state.data.realm.name = data.realm.realmName || gameEngine.state.data.realm.name;
                        gameEngine.state.data.realm.currentRealm = data.realm.realmLevel !== undefined ? data.realm.realmLevel : gameEngine.state.data.realm.currentRealm;
                        gameEngine.state.data.realm.currentLayer = data.realm.realmLevel !== undefined ? data.realm.realmLevel : gameEngine.state.data.realm.currentLayer;
                        gameEngine.state.data.realm.exp = data.realm.cultivationProgress !== undefined ? data.realm.cultivationProgress : gameEngine.state.data.realm.exp;
                    }
                    
                    // 更新修炼信息 - 使用更安全的方式
                    if (data.cultivation) {
                        if (!gameEngine.state.data.training) {
                            gameEngine.state.data.training = {};
                        }
                        if (!gameEngine.state.data.training.cultivation) {
                            gameEngine.state.data.training.cultivation = {};
                        }
                        gameEngine.state.data.training.cultivation.active = data.cultivation.isCultivating !== undefined ? data.cultivation.isCultivating : gameEngine.state.data.training.cultivation.active;
                        gameEngine.state.data.training.cultivation.realTimeEfficiency = data.cultivation.realTimeEfficiency !== undefined ? data.cultivation.realTimeEfficiency : gameEngine.state.data.training.cultivation.realTimeEfficiency;
                    }
                    
                    // 更新装备信息 - 使用更安全的方式
                    if (data.equipment && Array.isArray(data.equipment)) {
                        // 确保equipment对象存在
                        if (!gameEngine.state.data.equipment) {
                            gameEngine.state.data.equipment = { equipped: {}, inventory: [] };
                        }
                        if (!gameEngine.state.data.equipment.equipped) {
                            gameEngine.state.data.equipment.equipped = {};
                        }
                        
                        // 更新装备数据
                        data.equipment.forEach(function(item) {
                            if (item && item.type) {
                                gameEngine.state.data.equipment.equipped[item.type] = item;
                            }
                        });
                    }

                    console.log('成功获取并更新完整角色信息:', playerInfo);
                    
                    // 强制触发界面更新 - 使用requestAnimationFrame确保在下一帧绘制
                    requestAnimationFrame(function() {
                        drawHomePage();
                    });
                    
                    resolve();
                } else {
                    console.warn('后端返回数据格式错误:', res);
                    resolve();
                }
            },
            fail: function(err) {
                console.warn('请求后端失败:', err);
                // 接口调用失败不影响游戏正常运行
                resolve();
            }
        });
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
 * 修复标识: FIX_PLAYER_PAGE_20260327
 */
function handleGameTouch(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.touches[0].clientX - rect.left;
    const y = e.touches[0].clientY - rect.top;
    
    // 先处理弹窗触摸事件
    if (handlePopupTouch(x, y)) {
        return;
    }
    
    // 根据当前页面分发触摸事件
    if (currentPage === 'attributes') {
        // 属性页面触摸事件
        if (handleAttributesPageTouch(x, y)) {
            return;
        }
    }
    
    if (!gameEngine || !gameEngine.state || !gameEngine.state.data) {
        return;
    }
    
    const state = gameEngine.state.data;
    
    // 计算修炼控制按钮坐标（新样式）
    const safeAreaTop = 50;
    const headerY = safeAreaTop + 10;
    const avatarSize = 50;
    const resourceY = headerY + avatarSize + 15;
    const resourceHeight = 45;
    const mainY = resourceY + resourceHeight + 15;
    const equipCharHeight = 280;
    const progressY = mainY + equipCharHeight + 20;
    const progressWidth = screenWidth - 30;
    const buttonY = progressY + 40;
    const buttonHeight = 40;
    const smallBtnWidth = 70;
    const mainBtnWidth = progressWidth - smallBtnWidth * 2 - 20;
    
    // 检查是否点击了加速按钮
    if (x >= 15 && x <= 15 + smallBtnWidth && y >= buttonY && y <= buttonY + buttonHeight) {
        console.log('点击了加速按钮');
        wx.showToast({
            title: '加速功能开发中',
            icon: 'none'
        });
        return;
    }
    
    // 检查是否点击了开始/停止修炼按钮
    if (x >= 15 + smallBtnWidth + 10 && x <= 15 + smallBtnWidth + 10 + mainBtnWidth && 
        y >= buttonY && y <= buttonY + buttonHeight) {
        console.log('点击了修炼按钮');
        if (state.training && state.training.cultivation && state.training.cultivation.active) {
            stopCultivation();
        } else {
            startCultivation();
        }
        return;
    }
    
    // 检查是否点击了突破按钮
    if (x >= 15 + smallBtnWidth + 10 + mainBtnWidth + 10 && x <= 15 + smallBtnWidth + 10 + mainBtnWidth + 10 + smallBtnWidth && 
        y >= buttonY && y <= buttonY + buttonHeight) {
        console.log('点击了突破按钮');
        wx.showToast({
            title: '突破功能开发中',
            icon: 'none'
        });
        return;
    }
    
    // 检查是否点击了头像区域（新样式）
    const avatarX = 15;
    const avatarY = headerY;
    if (x >= avatarX && x <= avatarX + avatarSize && y >= avatarY && y <= avatarY + avatarSize) {
        console.log('点击了头像');
        showPlayerInfoDialog();
        return;
    }
    
    // 检查是否点击了底部功能按钮
    const featureY = buttonY + buttonHeight + 20;
    const featureBtnWidth = (screenWidth - 50) / 3;
    const featureBtnHeight = 45;
    
    // 第一行按钮
    const row1Features = [
        { name: '跟脚', key: 'root' },
        { name: '功法', key: 'skills' },
        { name: '炼体', key: 'body' }
    ];
    
    row1Features.forEach((feature, index) => {
        const btnX = 15 + index * (featureBtnWidth + 10);
        if (x >= btnX && x <= btnX + featureBtnWidth && 
            y >= featureY && y <= featureY + featureBtnHeight) {
            console.log('点击了功能按钮:', feature.name);
            if (feature.key === 'root') {
                showPlayerAttributesPage();
            } else {
                wx.showToast({
                    title: feature.name + '功能开发中',
                    icon: 'none'
                });
            }
        }
    });
    
    // 第二行按钮
    const row2Features = [
        { name: '丹炉', key: 'alchemy' },
        { name: '灵宠', key: 'pet' },
        { name: '灵田', key: 'field' }
    ];
    
    row2Features.forEach((feature, index) => {
        const btnX = 15 + index * (featureBtnWidth + 10);
        const btnY = featureY + featureBtnHeight + 10;
        if (x >= btnX && x <= btnX + featureBtnWidth && 
            y >= btnY && y <= btnY + featureBtnHeight) {
            console.log('点击了功能按钮:', feature.name);
            wx.showToast({
                title: feature.name + '功能开发中',
                icon: 'none'
            });
        }
    });
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
 * 修复标识: FIX_PLAYER_PAGE_20260327
 */
function drawGameInterface() {
    // 根据当前页面绘制不同内容
    switch (currentPage) {
        case 'attributes':
            drawAttributesPage();
            break;
        case 'home':
        default:
            drawHomePage();
            break;
    }
    
    // 绘制弹窗
    drawPopup();
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
 * 绘制主页（新样式）
 * 修复标识: FIX_UI_STYLE_20260327
 */
function drawHomePage() {
    if (!gameEngine || !gameEngine.state || !gameEngine.state.data) {
        drawLoadingScreen();
        return;
    }

    const state = gameEngine.state.data;
    const equipment = state.equipment || { equipped: {} };
    const resources = state.resources || { spiritStone: 0, immortalStone: 0 };
    const player = state.player || {};
    const realm = state.realm || { currentRealm: 0, currentLayer: 1, exp: 0 };

    // 获取境界配置
    const GameConfigClass = typeof global !== 'undefined' && global.GameConfig ? global.GameConfig : null;
    let realmConfig = { name: '凡人境', baseExp: 100, expMultiplier: 1.2 };
    if (GameConfigClass && GameConfigClass.REALM && GameConfigClass.REALM.realms) {
        realmConfig = GameConfigClass.REALM.realms[realm.currentRealm] || realmConfig;
    }

    // 计算修炼进度
    const requiredExp = Math.floor(realmConfig.baseExp * Math.pow(realmConfig.expMultiplier, realm.currentLayer - 1));
    
    // 计算当前实际修为值（包括修炼中获得的额外修为）
    let currentExp = realm.exp;
    if (state.training && state.training.cultivation && state.training.cultivation.active && 
        state.training.cultivation.startTime && state.training.cultivation.realTimeEfficiency) {
        const startTime = new Date(state.training.cultivation.startTime).getTime();
        const currentTime = Date.now();
        const elapsedSeconds = (currentTime - startTime) / 1000;
        const efficiency = state.training.cultivation.realTimeEfficiency;
        const updateInterval = 20;
        const completedIntervals = Math.floor(elapsedSeconds / updateInterval);
        const additionalExp = completedIntervals * updateInterval * efficiency;
        currentExp = realm.exp + additionalExp;
    }
    
    let progress = currentExp / requiredExp;
    if (progress > 1) progress = 1;

    // ==================== 顶部用户信息 ====================
    const safeAreaTop = 50;
    const headerY = safeAreaTop + 10;
    const avatarSize = 50;
    const avatarX = 15;

    // 使用从后端获取的玩家信息
    const displayPlayer = {
        name: playerInfo.name || player.name || '修仙者',
        id: playerInfo.id || player.id || '000000',
        avatar: playerInfo.avatar || player.avatar || null
    };

    // 绘制头像背景圆形
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize/2, headerY + avatarSize/2, avatarSize/2, 0, Math.PI * 2);
    ctx.fillStyle = '#5a5a5a';
    ctx.fill();

    // 头像区域
    if (displayPlayer.avatar) {
        try {
            const avatarImage = wx.createImage();
            avatarImage.src = displayPlayer.avatar;
            ctx.save();
            ctx.beginPath();
            ctx.arc(avatarX + avatarSize/2, headerY + avatarSize/2, avatarSize/2 - 2, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(avatarImage, avatarX, headerY, avatarSize, avatarSize);
            ctx.restore();
        } catch (e) {
            drawText('头像', avatarX + avatarSize/2, headerY + avatarSize/2 - 6, 14, '#999999', 'center');
        }
    } else {
        drawText('头像', avatarX + avatarSize/2, headerY + avatarSize/2 - 6, 14, '#999999', 'center');
    }

    // 用户名和ID
    drawText(displayPlayer.name, avatarX + avatarSize + 10, headerY + 5, 16, '#ffffff');
    drawText('ID : ' + displayPlayer.id, avatarX + avatarSize + 10, headerY + 28, 12, '#999999');
    
    // VIP标识
    drawRoundRect(avatarX + avatarSize + 10 + 80, headerY + 26, 40, 16, 3, '#666666');
    drawText('VIP 0', avatarX + avatarSize + 10 + 100, headerY + 28, 10, '#d4a853', 'center');

    // ==================== 资源栏（新样式）====================
    const resourceY = headerY + avatarSize + 15;
    const resourceHeight = 45;
    const resourceItemWidth = (screenWidth - 30) / 3;

    // 资源栏背景
    drawRoundRect(10, resourceY, screenWidth - 20, resourceHeight, 8, '#4a4a4a');

    // 体力
    drawText('体力', 25, resourceY + 8, 12, '#999999');
    drawText((state.training && state.training.cave ? state.training.cave.spiritPoints : 0).toString(), 25, resourceY + 24, 16, '#ffffff');
    // 加号按钮
    drawRoundRect(25 + 35, resourceY + 22, 18, 18, 9, '#666666');
    drawText('+', 25 + 35 + 9, resourceY + 24, 14, '#d4a853', 'center');

    // 仙晶
    drawText('仙晶', 25 + resourceItemWidth, resourceY + 8, 12, '#999999');
    drawText(formatNumber(resources.immortalStone || 0), 25 + resourceItemWidth, resourceY + 24, 16, '#d4a853');
    drawRoundRect(25 + resourceItemWidth + 50, resourceY + 22, 18, 18, 9, '#666666');
    drawText('+', 25 + resourceItemWidth + 50 + 9, resourceY + 24, 14, '#d4a853', 'center');

    // 灵石
    drawText('灵石', 25 + resourceItemWidth * 2, resourceY + 8, 12, '#999999');
    drawText(formatNumber(resources.spiritStone || 0), 25 + resourceItemWidth * 2, resourceY + 24, 16, '#ffd700');
    drawRoundRect(25 + resourceItemWidth * 2 + 50, resourceY + 22, 18, 18, 9, '#666666');
    drawText('+', 25 + resourceItemWidth * 2 + 50 + 9, resourceY + 24, 14, '#d4a853', 'center');

    // ==================== 主内容区域（装备和角色）====================
    const mainY = resourceY + resourceHeight + 15;
    const equipCharHeight = 280;
    const equipWidth = 80;
    const characterWidth = screenWidth - equipWidth * 2 - 40;
    const equipX = 15;

    // 左侧装备栏
    const leftEquipSlots = [
        { slot: 'weapon', name: '武器' },
        { slot: 'armor', name: '衣服' },
        { slot: 'belt', name: '腰带' },
        { slot: 'boots', name: '鞋子' }
    ];

    leftEquipSlots.forEach((equip, index) => {
        const slotY = mainY + index * 65;
        drawRoundRect(equipX, slotY, equipWidth, 55, 6, '#4a4a4a');
        drawText(equip.name, equipX + equipWidth/2, slotY + 8, 11, '#cccccc', 'center');
        
        const equippedItem = equipment.equipped[equip.slot];
        if (equippedItem) {
            drawText(equippedItem.name, equipX + equipWidth/2, slotY + 28, 10, '#ffffff', 'center');
        } else {
            drawText('+', equipX + equipWidth/2, slotY + 28, 20, '#999999', 'center');
        }
    });

    // 中间角色区域
    const characterX = equipX + equipWidth + 10;
    
    // 境界显示（顶部居中）
    const realmText = (realmConfig.name || '凡人境') + ' · ' + (realm.currentLayer || 1) + '层';
    drawText(realmText, characterX + characterWidth/2, mainY - 5, 16, '#d4a853', 'center');

    // 角色形象 - 使用role.png并添加呼吸效果
    const characterCenterX = characterX + characterWidth / 2;
    const characterCenterY = mainY + equipCharHeight / 2 + 10;
    
    const time = Date.now() / 1000;
    const scale = 0.85 + Math.sin(time * 1.5) * 0.15;
    const alpha = 0.85 + Math.sin(time * 1.5) * 0.15;
    
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(characterCenterX, characterCenterY);
    ctx.scale(scale, scale);
    
    try {
        const roleImage = wx.createImage();
        roleImage.src = 'image/role.png';
        const roleSize = 140;
        ctx.drawImage(roleImage, -roleSize/2, -roleSize/2, roleSize, roleSize);
    } catch (e) {
        ctx.fillStyle = '#5a5a5a';
        ctx.beginPath();
        ctx.arc(0, 0, 60, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#999999';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('角色形象', 0, 0);
    }
    
    ctx.restore();

    // 右侧装备栏
    const rightEquipX = characterX + characterWidth + 10;
    const rightEquipSlots = [
        { slot: 'necklace', name: '项链' },
        { slot: 'ring', name: '戒指' },
        { slot: 'jade', name: '玉佩' },
        { slot: 'talisman', name: '法宝' }
    ];

    rightEquipSlots.forEach((equip, index) => {
        const slotY = mainY + index * 65;
        drawRoundRect(rightEquipX, slotY, equipWidth, 55, 6, '#4a4a4a');
        drawText(equip.name, rightEquipX + equipWidth/2, slotY + 8, 11, '#cccccc', 'center');
        
        const equippedItem = equipment.equipped[equip.slot];
        if (equippedItem) {
            drawText(equippedItem.name, rightEquipX + equipWidth/2, slotY + 28, 10, '#ffffff', 'center');
        } else {
            drawText('+', rightEquipX + equipWidth/2, slotY + 28, 20, '#999999', 'center');
        }
    });

    // ==================== 修炼进度条 ====================
    const progressY = mainY + equipCharHeight + 20;
    const progressWidth = screenWidth - 30;

    // 进度条背景
    drawRoundRect(15, progressY, progressWidth, 30, 4, '#3a3a3a');
    
    // 进度条填充
    const fillWidth = progressWidth * progress;
    if (fillWidth > 0) {
        drawRoundRect(15, progressY, fillWidth, 30, 4, '#4caf50');
    }
    
    // 进度文字
    const progressStatusText = state.training && state.training.cultivation && state.training.cultivation.active ? '修炼中...' : '修炼停止';
    drawText(progressStatusText, 25, progressY + 8, 11, '#ffffff');
    const progressValueText = `${Math.floor(currentExp)}/${requiredExp} (${(progress * 100).toFixed(2)}%)`;
    drawText(progressValueText, screenWidth - 20, progressY + 8, 11, '#ffffff', 'right');

    // ==================== 修炼控制按钮 ====================
    const buttonY = progressY + 40;
    const buttonHeight = 40;
    const smallBtnWidth = 70;
    const mainBtnWidth = progressWidth - smallBtnWidth * 2 - 20;

    // 加速按钮
    drawRoundRect(15, buttonY, smallBtnWidth, buttonHeight, 20, '#5a5a5a');
    drawText('加速', 15 + smallBtnWidth/2, buttonY + 12, 13, '#ffffff', 'center');

    // 开始/停止修炼按钮
    let mainBtnText = '开始修炼';
    let mainBtnColor = '#d4a853';
    if (state.training && state.training.cultivation && state.training.cultivation.active) {
        const efficiency = state.training.cultivation.realTimeEfficiency || 0;
        mainBtnText = `效率: ${Math.floor(efficiency * 30)}/30秒`;
        mainBtnColor = '#5a5a5a';
    }
    drawRoundRect(15 + smallBtnWidth + 10, buttonY, mainBtnWidth, buttonHeight, 4, mainBtnColor);
    drawText(mainBtnText, 15 + smallBtnWidth + 10 + mainBtnWidth/2, buttonY + 12, 13, '#ffffff', 'center');

    // 突破按钮
    drawRoundRect(15 + smallBtnWidth + 10 + mainBtnWidth + 10, buttonY, smallBtnWidth, buttonHeight, 20, '#5a5a5a');
    drawText('突破', 15 + smallBtnWidth + 10 + mainBtnWidth + 10 + smallBtnWidth/2, buttonY + 12, 13, '#ffffff', 'center');

    // ==================== 底部功能按钮 ====================
    const featureY = buttonY + buttonHeight + 20;
    const featureBtnWidth = (screenWidth - 50) / 3;
    const featureBtnHeight = 45;

    // 第一行
    const row1Features = [
        { name: '跟脚', key: 'root' },
        { name: '功法', key: 'skills' },
        { name: '炼体', key: 'body' }
    ];

    row1Features.forEach((feature, index) => {
        const x = 15 + index * (featureBtnWidth + 10);
        drawRoundRect(x, featureY, featureBtnWidth, featureBtnHeight, 6, '#4a4a4a');
        drawText(feature.name, x + featureBtnWidth/2, featureY + 14, 14, '#ffffff', 'center');
    });

    // 第二行
    const row2Features = [
        { name: '丹炉', key: 'alchemy' },
        { name: '灵宠', key: 'pet' },
        { name: '灵田', key: 'field' }
    ];

    row2Features.forEach((feature, index) => {
        const x = 15 + index * (featureBtnWidth + 10);
        const y = featureY + featureBtnHeight + 10;
        drawRoundRect(x, y, featureBtnWidth, featureBtnHeight, 6, '#4a4a4a');
        drawText(feature.name, x + featureBtnWidth/2, y + 14, 14, '#ffffff', 'center');
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

// ==================== 弹窗系统 ====================

/**
 * 弹窗数据
 */
var currentPopup = null;

/**
 * 显示统一样式的弹窗
 * @param {Object} options - 弹窗配置
 * @param {string} options.title - 弹窗标题
 * @param {string} options.content - 弹窗内容
 * @param {Array} options.buttons - 按钮配置
 * @param {Function} options.callback - 回调函数
 * 修复标识: FIX_POPUP_STYLE_20260327
 */
function showPopup(options) {
    currentPopup = options;
    // 强制重绘
    drawGameInterface();
}

/**
 * 关闭弹窗
 * 修复标识: FIX_POPUP_STYLE_20260327
 */
function closePopup() {
    currentPopup = null;
    // 强制重绘
    drawGameInterface();
}

/**
 * 处理弹窗按钮点击
 * @param {number} x - 触摸X坐标
 * @param {number} y - 触摸Y坐标
 * @returns {boolean} - 是否处理了事件
 * 修复标识: FIX_POPUP_STYLE_20260327
 */
function handlePopupTouch(x, y) {
    if (!currentPopup) return false;
    
    const popupWidth = screenWidth * 0.8;
    const popupHeight = 200;
    const popupX = (screenWidth - popupWidth) / 2;
    const popupY = (screenHeight - popupHeight) / 2;
    const buttonHeight = 40;
    const buttonY = popupY + popupHeight - buttonHeight - 15;
    const buttonWidth = (popupWidth - 20) / (currentPopup.buttons.length || 1);
    
    // 检查按钮点击
    currentPopup.buttons.forEach((button, index) => {
        const buttonX = popupX + 10 + index * buttonWidth;
        if (x >= buttonX && x <= buttonX + buttonWidth && 
            y >= buttonY && y <= buttonY + buttonHeight) {
            if (currentPopup.callback) {
                currentPopup.callback(button.value);
            }
            closePopup();
            return true;
        }
    });
    
    return false;
}

/**
 * 绘制弹窗
 * 修复标识: FIX_POPUP_STYLE_20260327
 */
function drawPopup() {
    if (!currentPopup) return;
    
    // 绘制半透明背景
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, screenWidth, screenHeight);
    
    // 弹窗配置
    const popupWidth = screenWidth * 0.8;
    const popupHeight = 200;
    const popupX = (screenWidth - popupWidth) / 2;
    const popupY = (screenHeight - popupHeight) / 2;
    
    // 绘制弹窗背景
    drawRoundRect(popupX, popupY, popupWidth, popupHeight, 12, '#4a4a4a');
    
    // 绘制标题
    drawText(currentPopup.title || '提示', popupX + popupWidth / 2, popupY + 20, 18, '#d4a853', 'center');
    
    // 绘制内容
    ctx.font = '14px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // 文本换行
    const lines = currentPopup.content.split('\n');
    lines.forEach((line, index) => {
        ctx.fillText(line, popupX + popupWidth / 2, popupY + 50 + index * 20);
    });
    
    // 绘制按钮
    const buttonHeight = 40;
    const buttonY = popupY + popupHeight - buttonHeight - 15;
    const buttonWidth = (popupWidth - 20) / (currentPopup.buttons.length || 1);
    
    currentPopup.buttons.forEach((button, index) => {
        const buttonX = popupX + 10 + index * buttonWidth;
        const bgColor = button.isPrimary ? '#d4a453' : '#5a5a5a';
        drawRoundRect(buttonX, buttonY, buttonWidth, buttonHeight, 8, bgColor);
        drawText(button.text, buttonX + buttonWidth / 2, buttonY + 12, 14, '#ffffff', 'center');
    });
}

// 立即初始化游戏
initGame();