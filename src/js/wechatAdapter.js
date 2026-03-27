/**
 * 微信小游戏适配层
 * 将浏览器API转换为微信小游戏API
 * @version 1.0.0
 */

class WeChatAdapter {
    constructor() {
        this.isWeChat = typeof wx !== 'undefined';
        this.init();
    }

    /**
     * 初始化适配器
     */
    init() {
        if (this.isWeChat) {
            this.setupWeChatAPIs();
        }
    }

    /**
     * 设置微信API适配
     */
    setupWeChatAPIs() {
        // 替换localStorage
        this.setupStorage();
        
        // 替换网络请求
        this.setupNetwork();
        
        // 替换定时器
        this.setupTimers();
        
        // 替换事件监听
        this.setupEvents();
        
        console.log('微信小游戏适配层初始化完成');
    }

    /**
     * 设置存储适配
     */
    setupStorage() {
        if (!this.isWeChat) return;

        // 替换localStorage
        const originalStorage = window.localStorage;
        
        window.localStorage = {
            getItem: (key) => {
                return new Promise((resolve) => {
                    wx.getStorage({
                        key: key,
                        success: (res) => resolve(res.data),
                        fail: () => resolve(null)
                    });
                });
            },
            
            setItem: (key, value) => {
                return new Promise((resolve, reject) => {
                    wx.setStorage({
                        key: key,
                        data: value,
                        success: resolve,
                        fail: reject
                    });
                });
            },
            
            removeItem: (key) => {
                return new Promise((resolve, reject) => {
                    wx.removeStorage({
                        key: key,
                        success: resolve,
                        fail: reject
                    });
                });
            },
            
            clear: () => {
                return new Promise((resolve, reject) => {
                    wx.clearStorage({
                        success: resolve,
                        fail: reject
                    });
                });
            }
        };

        // 同步版本（兼容原有代码）
        window.localStorageSync = {
            getItem: (key) => {
                try {
                    return wx.getStorageSync(key);
                } catch (e) {
                    return null;
                }
            },
            
            setItem: (key, value) => {
                try {
                    wx.setStorageSync(key, value);
                    return true;
                } catch (e) {
                    return false;
                }
            },
            
            removeItem: (key) => {
                try {
                    wx.removeStorageSync(key);
                    return true;
                } catch (e) {
                    return false;
                }
            },
            
            clear: () => {
                try {
                    wx.clearStorageSync();
                    return true;
                } catch (e) {
                    return false;
                }
            }
        };
    }

    /**
     * 设置网络适配
     */
    setupNetwork() {
        if (!this.isWeChat) return;

        // 替换fetch API
        window.fetch = (url, options = {}) => {
            return new Promise((resolve, reject) => {
                wx.request({
                    url: url,
                    method: options.method || 'GET',
                    data: options.body || {},
                    header: options.headers || {},
                    success: (res) => {
                        resolve({
                            ok: res.statusCode >= 200 && res.statusCode < 300,
                            status: res.statusCode,
                            json: () => Promise.resolve(res.data),
                            text: () => Promise.resolve(JSON.stringify(res.data))
                        });
                    },
                    fail: reject
                });
            });
        };

        // 替换XMLHttpRequest
        window.XMLHttpRequest = class WeChatXMLHttpRequest {
            constructor() {
                this.readyState = 0;
                this.status = 0;
                this.responseText = '';
                this.onreadystatechange = null;
                this.onload = null;
                this.onerror = null;
            }

            open(method, url, async = true) {
                this.method = method;
                this.url = url;
                this.async = async;
                this.readyState = 1;
                this._triggerStateChange();
            }

            send(data = null) {
                wx.request({
                    url: this.url,
                    method: this.method,
                    data: data,
                    success: (res) => {
                        this.status = res.statusCode;
                        this.responseText = JSON.stringify(res.data);
                        this.readyState = 4;
                        this._triggerStateChange();
                        if (this.onload) this.onload();
                    },
                    fail: (err) => {
                        this.status = 0;
                        this.readyState = 4;
                        this._triggerStateChange();
                        if (this.onerror) this.onerror(err);
                    }
                });
            }

            _triggerStateChange() {
                if (this.onreadystatechange) {
                    this.onreadystatechange();
                }
            }

            setRequestHeader() {
                // 微信小游戏header设置已在request中处理
            }
        };
    }

    /**
     * 设置定时器适配
     */
    setupTimers() {
        if (!this.isWeChat) return;

        // 替换setTimeout和setInterval
        const originalSetTimeout = window.setTimeout;
        const originalSetInterval = window.setInterval;
        const originalClearTimeout = window.clearTimeout;
        const originalClearInterval = window.clearInterval;

        // 微信小游戏环境使用微信的定时器
        if (this.isWeChat) {
            window.setTimeout = (fn, delay) => {
                return setTimeout(fn, delay);
            };

            window.setInterval = (fn, delay) => {
                return setInterval(fn, delay);
            };

            window.clearTimeout = (id) => {
                clearTimeout(id);
            };

            window.clearInterval = (id) => {
                clearInterval(id);
            };
        }
    }

    /**
     * 设置事件适配
     */
    setupEvents() {
        if (!this.isWeChat) return;

        // 替换addEventListener和removeEventListener
        const originalAddEventListener = window.addEventListener;
        const originalRemoveEventListener = window.removeEventListener;

        // 微信小游戏事件处理
        window.addEventListener = (event, handler) => {
            if (event === 'beforeunload') {
                // 页面关闭前保存
                wx.onHide(() => {
                    handler();
                });
            } else if (event === 'DOMContentLoaded') {
                // 页面加载完成
                wx.onLaunch(() => {
                    handler();
                });
            } else {
                originalAddEventListener.call(window, event, handler);
            }
        };

        window.removeEventListener = (event, handler) => {
            originalRemoveEventListener.call(window, event, handler);
        };
    }

    /**
     * 获取微信用户信息
     * 注意: wx.getUserInfo 已废弃，不再直接调用
     * 使用默认用户信息，用户信息通过游戏内登录系统获取
     * 修复标识: FIX_ACCESS_TOKEN_20240326
     */
    async getUserInfo() {
        if (!this.isWeChat) {
            return {
                nickName: '测试用户',
                avatarUrl: '',
                openId: 'test_openid'
            };
        }

        // 不再调用已废弃的 wx.getUserInfo API
        // 直接返回默认用户信息，避免 access_token missing 错误
        console.log('使用默认用户信息，避免 wx.getUserInfo 废弃API调用');
        return {
            nickName: '修仙者',
            avatarUrl: '',
            openId: 'default_openid'
        };
    }

    /**
     * 显示提示信息
     */
    showToast(message, duration = 2000) {
        if (this.isWeChat) {
            wx.showToast({
                title: message,
                icon: 'none',
                duration: duration
            });
        } else {
            console.log('Toast:', message);
        }
    }

    /**
     * 显示确认对话框
     */
    showConfirm(title, content) {
        if (this.isWeChat) {
            return new Promise((resolve) => {
                wx.showModal({
                    title: title,
                    content: content,
                    success: (res) => {
                        resolve(res.confirm);
                    }
                });
            });
        } else {
            return Promise.resolve(confirm(`${title}\n${content}`));
        }
    }

    /**
     * 获取系统信息
     */
    getSystemInfo() {
        if (this.isWeChat) {
            return new Promise((resolve) => {
                wx.getSystemInfo({
                    success: (res) => {
                        resolve(res);
                    }
                });
            });
        } else {
            return Promise.resolve({
                screenWidth: window.screen.width,
                screenHeight: window.screen.height,
                windowWidth: window.innerWidth,
                windowHeight: window.innerHeight
            });
        }
    }
}

// 创建全局适配器实例
window.wechatAdapter = new WeChatAdapter();

// 导出适配器
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WeChatAdapter;
}