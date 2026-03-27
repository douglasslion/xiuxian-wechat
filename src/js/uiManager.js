/**
 * UI管理模块
 * 处理界面渲染、事件绑定和页面切换
 * @version 1.0.0
 */

class UIManager {
    constructor(gameEngine) {
        this.engine = gameEngine;
        this.currentPage = 'home';
        this.notificationQueue = [];
        this.init();
    }

    /**
     * 初始化UI
     */
    init() {
        this.bindGlobalEvents();
        this.renderHomePage();
        this.startUpdateLoop();
    }

    /**
     * 绑定全局事件
     */
    bindGlobalEvents() {
        // 返回首页按钮
        document.addEventListener('click', (e) => {
            if (e.target.matches('.btn-back-home')) {
                // 记录来源页面，用于容错处理
                this.previousPage = this.currentPage;
                // 延迟执行，确保DOM操作完成
                setTimeout(() => {
                    this.switchPage('home');
                }, 0);
            }
        });
    }

    /**
     * 切换页面
     * @param {string} page - 页面名称
     * @param {Object} params - 页面参数
     */
    switchPage(page, params = {}) {
        console.log('switchPage - start, page:', page);
        this.currentPage = page;

        // 装备信息页面特殊处理
        if (page === 'equipment-info') {
            const selectedSlot = params.slot || 'weapon';
            
            const mainContainer = document.getElementById('main-container');
            if (mainContainer) {
                mainContainer.innerHTML = this.getEquipmentInfoPageHTML(selectedSlot);
                this.bindEquipmentInfoEvents();
            }
            return;
        }

        const mainContainer = document.getElementById('main-container');
        console.log('switchPage - mainContainer:', mainContainer);
        
        if (!mainContainer) {
            console.error('Main container not found, retrying...');
            // 容错处理：延迟重试
            setTimeout(() => {
                const retryContainer = document.getElementById('main-container');
                if (retryContainer) {
                    console.log('Main container found on retry');
                    this.switchPage(page, params);
                } else {
                    console.error('Main container still not found, rendering home page');
                    // 如果仍然找不到，尝试渲染主界面
                    this.renderHomePage();
                }
            }, 100);
            return;
        }

        switch (page) {
            case 'home':
                console.log('switchPage - home');
                // 切换到主界面时，先计算最新的修炼收益
                if (this.engine && this.engine.trainingSystem) {
                    this.engine.trainingSystem.calculateCultivationGains();
                    this.engine.state.save();
                }
                mainContainer.innerHTML = this.getHomePageHTML();
                this.bindHomeEvents();
                // 刷新修炼进度
                setTimeout(() => {
                    this.refreshCultivationProgress();
                }, 100);
                break;
            case 'story':
                console.log('switchPage - story');
                mainContainer.innerHTML = this.getStoryPageHTML();
                this.bindStoryEvents();
                break;
            case 'expedition':
                console.log('switchPage - expedition');
                mainContainer.innerHTML = this.getExpeditionPageHTML();
                this.bindExpeditionEvents();
                break;
            case 'cultivation':
                console.log('switchPage - cultivation');
                mainContainer.innerHTML = this.getCultivationPageHTML();
                this.bindCultivationEvents();
                break;

            case 'character':
                console.log('switchPage - character');
                mainContainer.innerHTML = this.getCharacterPageHTML();
                this.bindCharacterEvents();
                break;
            case 'inventory':
                console.log('switchPage - inventory');
                mainContainer.innerHTML = this.getInventoryPageHTML();
                this.bindInventoryEvents();
                break;
            case 'skills':
                console.log('switchPage - skills');
                mainContainer.innerHTML = this.getSkillsPageHTML();
                this.bindSkillsEvents();
                break;
            case 'secret-realm':
                console.log('switchPage - secret-realm');
                mainContainer.innerHTML = this.getSecretRealmPageHTML();
                this.bindSecretRealmEvents();
                break;
            case 'sect':
                console.log('switchPage - sect');
                mainContainer.innerHTML = this.getSectPageHTML();
                this.bindSectEvents();
                break;
            case 'pvp':
                console.log('switchPage - pvp');
                mainContainer.innerHTML = this.getPvpPageHTML();
                this.bindPvpEvents();
                break;
                
                case 'speed-up':
                console.log('switchPage - speed-up');
                mainContainer.innerHTML = this.getSpeedUpPageHTML();
                this.bindSpeedUpPageEvents();
                break;
            case 'body-training':
                console.log('switchPage - body-training');
                mainContainer.innerHTML = this.getBodyTrainingPageHTML();
                this.bindBodyTrainingEvents();
                break;
                
                case 'alchemy':
                console.log('switchPage - alchemy');
                mainContainer.innerHTML = this.getAlchemyPageHTML();
                this.bindAlchemyEvents();
                break;
                
                case 'pet':
                console.log('switchPage - pet');
                mainContainer.innerHTML = this.getPetPageHTML();
                this.bindPetEvents();
                break;
                
                case 'field':
                console.log('switchPage - field');
                mainContainer.innerHTML = this.getFieldPageHTML();
                this.bindFieldEvents();
                break;
            case 'dailyTask':
            case 'daily':
                console.log('switchPage - dailyTask');
                mainContainer.innerHTML = this.getDailyTaskPageHTML();
                this.bindDailyTaskEvents();
                break;
            case 'gift':
                console.log('switchPage - gift');
                mainContainer.innerHTML = this.getGiftPageHTML();
                this.bindGiftEvents();
                break;
            case 'checkin':
                console.log('switchPage - checkin');
                mainContainer.innerHTML = this.getCheckinPageHTML();
                this.bindCheckinEvents();
                break;
            case 'achievement':
                console.log('switchPage - achievement');
                mainContainer.innerHTML = this.getAchievementPageHTML();
                this.bindAchievementEvents();
                break;
            case 'market':
                console.log('switchPage - market');
                mainContainer.innerHTML = this.getMarketPageHTML();
                this.bindMarketEvents();
                break;
            case 'tower':
                console.log('switchPage - tower');
                mainContainer.innerHTML = this.getTowerPageHTML();
                this.bindTowerEvents();
                break;
            case 'godList':
                console.log('switchPage - godList');
                mainContainer.innerHTML = this.getGodListPageHTML();
                this.bindGodListEvents();
                break;
            case 'martialStage':
                console.log('switchPage - martialStage');
                mainContainer.innerHTML = this.getMartialStagePageHTML();
                this.bindMartialStageEvents();
                break;
        }

        this.updateResourceDisplay();
        console.log('switchPage - end');
    }

    // ==================== 首页 ====================

    /**
     * 渲染首页
     */
    renderHomePage() {
        const mainContainer = document.getElementById('main-container');
        if (mainContainer) {
            // 检查是否需要创建角色
            if (!this.engine.state.data.player.name) {
                mainContainer.innerHTML = this.getCharacterCreationHTML();
                this.bindCharacterCreationEvents();
            } else {
                mainContainer.innerHTML = this.getHomePageHTML();
                this.bindHomeEvents();
                // 应用装备品质样式
                this.refreshHomePageEquipment();
            }
        }
    }

    /**
     * 获取角色创建页面HTML
     * @returns {string} HTML字符串
     */
    getCharacterCreationHTML() {
        const identities = GameConfig.IDENTITY;

        return `
            <div class="page character-creation-page">
                <div class="creation-header">
                    <h1>踏入仙途</h1>
                    <p>选择你的出身，开始修仙之旅</p>
                </div>

                <div class="name-input-section">
                    <label for="player-name">道号</label>
                    <input type="text" id="player-name" placeholder="请输入道号" maxlength="8">
                </div>

                <div class="identity-selection">
                    <h3>选择出身</h3>
                    <div class="identity-list">
                        ${identities.map(id => `
                            <div class="identity-card" data-identity="${id.id}">
                                <span class="identity-name">${id.name}</span>
                                <span class="identity-desc">${id.description}</span>
                                <span class="identity-bonus">${this.getIdentityBonusText(id.bonus)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <button class="btn btn-primary btn-create-character" id="btn-create-character" disabled>
                    开始修仙
                </button>
            </div>
        `;
    }

    /**
     * 获取身份加成文本
     * @param {Object} bonus - 加成对象
     * @returns {string} 文本
     */
    getIdentityBonusText(bonus) {
        const texts = [];
        if (bonus.expRate) texts.push(`修为+${Math.floor(bonus.expRate * 100)}%`);
        if (bonus.spiritRate) texts.push(`灵气+${Math.floor(bonus.spiritRate * 100)}%`);
        if (bonus.spiritStoneRate) texts.push(`灵石+${Math.floor(bonus.spiritStoneRate * 100)}%`);
        if (bonus.attack) texts.push(`攻击+${Math.floor(bonus.attack * 100)}%`);
        if (bonus.hp) texts.push(`生命+${Math.floor(bonus.hp * 100)}%`);
        if (bonus.luck) texts.push(`气运+${Math.floor(bonus.luck * 100)}%`);
        return texts.join(' ');
    }

    /**
     * 绑定角色创建事件
     */
    bindCharacterCreationEvents() {
        const nameInput = document.getElementById('player-name');
        const createBtn = document.getElementById('btn-create-character');
        let selectedIdentity = null;

        // 身份选择
        document.querySelectorAll('.identity-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.identity-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
                selectedIdentity = card.dataset.identity;
                this.updateCreateButtonState();
            });
        });

        // 名称输入
        if (nameInput) {
            nameInput.addEventListener('input', () => {
                this.updateCreateButtonState();
            });
        }

        // 创建角色
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                const name = nameInput.value.trim();
                if (name && selectedIdentity) {
                    const result = this.engine.createCharacter(name, selectedIdentity);
                    if (result.success) {
                        this.showNotification('角色创建成功！', 'success');
                        this.switchPage('home');
                    }
                }
            });
        }

        this.updateCreateButtonState = () => {
            const name = nameInput ? nameInput.value.trim() : '';
            createBtn.disabled = !(name && selectedIdentity);
        };
    }

    /**
     * 获取首页HTML
     * @returns {string} HTML字符串
     */
    getHomePageHTML() {
        const state = this.engine.state.data;
        const realmConfig = this.engine.state.getCurrentRealmConfig();
        const progress = this.engine.realmSystem.getProgress();
        const power = this.engine.state.getPower();
        const equipment = this.engine.equipmentSystem.getAllEquipment();

        return `
            <div class="page home-page">
                <!-- 顶部用户信息 -->
                <div class="user-header">
                    <div class="avatar-section">
                        <div class="avatar">头像</div>
                        <div class="user-info">
                            <div class="username">${state.player.name || '修仙者'}</div>
                            <div class="user-id">ID: ${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')} <span class="vip-badge ${state.player?.vipLevel >= 1 ? 'vip-active' : 'vip-inactive'}">VIP ${state.player?.vipLevel || 0}</span></div>
                        </div>
                    </div>
                </div>

                <!-- 资源栏 -->
                <div class="top-resources">
                    <div class="top-resource-item">
                        <span class="res-label">体力</span>
                        <span class="res-value">${state.training.cave.spiritPoints}</span>
                        <button class="res-add-btn">+</button>
                    </div>
                    <div class="top-resource-item">
                        <span class="res-label">仙晶</span>
                        <span class="res-value">${this.formatNumber(state.resources.immortalStone)}</span>
                        <button class="res-add-btn">+</button>
                    </div>
                    <div class="top-resource-item">
                        <span class="res-label">灵石</span>
                        <span class="res-value">${this.formatNumber(state.resources.spiritStone)}</span>
                        <button class="res-add-btn">+</button>
                    </div>
                </div>

                <!-- 主体区域：左侧内容 + 右侧菜单 -->
                <div class="main-content">
                    <!-- 左侧内容区域 -->
                    <div class="left-content">
                        <!-- 装备和角色区域 -->
                        <div class="equipment-character-section">
                            <!-- 左侧装备栏 -->
                            <div class="left-equipment">
                                <div class="equip-slot" data-slot="weapon">
                                    <span class="equip-name">武器</span>
                                    ${equipment.equipped.weapon ? `<span class="equip-item">${equipment.equipped.weapon.name}</span>` : '<span class="equip-plus">+</span>'}
                                </div>
                                <div class="equip-slot" data-slot="armor">
                                    <span class="equip-name">衣服</span>
                                    ${equipment.equipped.armor ? `<span class="equip-item">${equipment.equipped.armor.name}</span>` : '<span class="equip-plus">+</span>'}
                                </div>
                                <div class="equip-slot" data-slot="belt">
                                    <span class="equip-name">腰带</span>
                                    ${equipment.equipped.belt ? `<span class="equip-item">${equipment.equipped.belt.name}</span>` : '<span class="equip-plus">+</span>'}
                                </div>
                                <div class="equip-slot" data-slot="boots">
                                    <span class="equip-name">鞋子</span>
                                    ${equipment.equipped.boots ? `<span class="equip-item">${equipment.equipped.boots.name}</span>` : '<span class="equip-plus">+</span>'}
                                </div>
                            </div>

                            <!-- 中间角色区域 -->
                            <div class="character-section">
                                <div class="realm-display">${realmConfig.name}·${this.getLayerName(state.realm.currentLayer)}</div>
                                <div class="character-avatar">
                                    <img src="image/role.png" alt="修仙者" class="role-image">
                                </div>
                            </div>

                            <!-- 右侧装备栏 -->
                            <div class="right-equipment">
                                <div class="equip-slot" data-slot="necklace">
                                    <span class="equip-name">项链</span>
                                    ${equipment.equipped.necklace ? `<span class="equip-item">${equipment.equipped.necklace.name}</span>` : '<span class="equip-plus">+</span>'}
                                </div>
                                <div class="equip-slot" data-slot="ring">
                                    <span class="equip-name">戒指</span>
                                    ${equipment.equipped.ring ? `<span class="equip-item">${equipment.equipped.ring.name}</span>` : '<span class="equip-plus">+</span>'}
                                </div>
                                <div class="equip-slot" data-slot="jade">
                                    <span class="equip-name">玉佩</span>
                                    ${equipment.equipped.jade ? `<span class="equip-item">${equipment.equipped.jade.name}</span>` : '<span class="equip-plus">+</span>'}
                                </div>
                                <div class="equip-slot" data-slot="talisman">
                                    <span class="equip-name">法宝</span>
                                    ${equipment.equipped.talisman ? `<span class="equip-item">${equipment.equipped.talisman.name}</span>` : '<span class="equip-plus">+</span>'}
                                </div>
                            </div>
                        </div>

                        <!-- 修炼进度条 -->
                        <div class="cultivation-bar">
                            <div class="cultivation-progress">
                                <div class="progress-fill" style="width: ${progress.progress}%"></div>
                                <span class="progress-text">${state.training.cultivation?.active ? '修炼中...' : '修炼停止'} ${this.formatNumber(state.realm.exp)}/${this.formatNumber(progress.requiredExp)} (${progress.progress.toFixed(1)}%)</span>
                            </div>
                        </div>

                        <!-- 修炼控制按钮 -->
                        <div class="cultivation-controls">
                            <button class="btn ${state.training.cultivation?.active ? 'btn-secondary' : 'btn-yellow-highlight'} btn-speed" id="btn-speed">
                                ${state.training.cultivation?.active ? 
                                    `${this.engine.trainingSystem.getCultivationStatus()}` : 
                                    '开始修炼'
                                }
                            </button>
                            <button class="btn btn-secondary btn-breakthrough" id="btn-breakthrough-home">突破</button>
                        </div>

                        <!-- 底部功能按钮 -->
                        <div class="bottom-features">
                            <button class="feature-btn" data-page="story">
                                <span class="feature-icon">📜</span>
                                <span class="feature-text">剧情</span>
                            </button>
                            <button class="feature-btn" data-page="inventory">
                                <span class="feature-icon">🎒</span>
                                <span class="feature-text">背包</span>
                            </button>
                            <button class="feature-btn" data-page="skills">
                                <span class="feature-icon">📖</span>
                                <span class="feature-text">功法</span>
                            </button>
                            <button class="feature-btn" data-page="expedition">
                                <span class="feature-icon">🗺️</span>
                                <span class="feature-text">历练</span>
                            </button>
                            <button class="feature-btn" data-page="alchemy">
                                <span class="feature-icon">⚗️</span>
                                <span class="feature-text">丹炉</span>
                            </button>
                            <button class="feature-btn" data-page="pet">
                                <span class="feature-icon">🐉</span>
                                <span class="feature-text">灵宠</span>
                            </button>
                            <button class="feature-btn" data-page="field">
                                <span class="feature-icon">🌾</span>
                                <span class="feature-text">灵田</span>
                            </button>
                            <button class="feature-btn" data-page="body-training">
                                <span class="feature-icon">💪</span>
                                <span class="feature-text">炼体</span>
                            </button>
                        </div>
                    </div>

                    <!-- 右侧功能菜单 -->
                    <div class="right-menu">
                        <button class="menu-item" data-page="daily">
                            <span class="menu-icon">📋</span>
                            <span class="menu-text">每日任务</span>
                        </button>
                        <button class="menu-item" data-page="gift">
                            <span class="menu-icon">🎁</span>
                            <span class="menu-text">礼包</span>
                            ${this.engine.giftSystem.hasAvailableGifts() ? '<span class="notification-dot"></span>' : ''}
                        </button>
                        <button class="menu-item" data-page="checkin">
                            <span class="menu-icon">📅</span>
                            <span class="menu-text">签到</span>
                            ${this.engine.checkinSystem.hasAvailableCheckin() ? '<span class="notification-dot"></span>' : ''}
                        </button>
                        <button class="menu-item" data-page="achievement">
                            <span class="menu-icon">🏆</span>
                            <span class="menu-text">成就</span>
                            ${this.engine.achievementSystem.hasClaimableAchievements() ? '<span class="notification-dot"></span>' : ''}
                        </button>
                        <button class="menu-item" data-page="godList">
                            <span class="menu-icon">📜</span>
                            <span class="menu-text">封神榜</span>
                        </button>
                        <button class="menu-item" data-page="market">
                            <span class="menu-icon">🏪</span>
                            <span class="menu-text">坊市</span>
                        </button>
                        <button class="menu-item" data-page="sect">
                            <span class="menu-icon">⛩️</span>
                            <span class="menu-text">宗门</span>
                        </button>
                        <button class="menu-item" data-page="tower">
                            <span class="menu-icon">🗼</span>
                            <span class="menu-text">万妖塔</span>
                        </button>
                        <button class="menu-item" data-page="martialStage">
                            <span class="menu-icon">⚔️</span>
                            <span class="menu-text">仙武台</span>
                        </button>
                        <button class="menu-item" data-page="settings">
                            <span class="menu-icon">⚙️</span>
                            <span class="menu-text">设置</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 获取装备信息页面HTML
     * @param {string} selectedSlot - 选中的装备槽
     * @returns {string} HTML字符串
     */
    getEquipmentInfoPageHTML(selectedSlot) {
        const equipment = this.engine.equipmentSystem.getAllEquipment();
        const slots = GameConfig.EQUIPMENT.slots;
        const selectedEquipment = equipment.equipped[selectedSlot];
        const slotEquipmentList = this.getSlotEquipmentList(selectedSlot);

        return `
            <div class="page equipment-page">
                <div class="page-header">
                    <button class="btn-back-home">← 返回</button>
                    <h2>装备信息</h2>
                </div>
                
                <div class="equipment-page-content">
                    <div class="equipment-sidebar">
                        ${slots.map(slot => `
                            <div class="equipment-sidebar-item ${slot.id === selectedSlot ? 'active' : ''}" data-slot="${slot.id}">
                                ${slot.name}
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="equipment-list-panel">
                            <div class="equipment-list">
                                ${slotEquipmentList.length > 0 ? slotEquipmentList.map(item => `
                                    <div class="equipment-list-card ${item.equipped ? 'equipped' : ''}" data-equipment-id="${item.id}">
                                        <div class="equipment-list-header">
                                            <span class="equipment-list-name" style="color: ${item.qualityColor || this.getQualityColor(item.quality)}">${item.name}<span class="equipment-list-level">+${item.level}</span></span>
                                            ${item.equipped ? '<span class="equipment-equipped-tag">已穿戴</span>' : ''}
                                        </div>
                                        <div class="equipment-list-stats">
                                            ${Object.entries(item.stats).map(([stat, value]) => `
                                                <span class="equipment-list-stat">${this.getStatName(stat)} +${value}</span>
                                            `).join('')}
                                        </div>
                                        <div class="equipment-list-actions">
                                            <button class="btn btn-secondary btn-refine">洗炼</button>
                                            <button class="btn btn-secondary btn-enhance">强化</button>
                                            ${item.equipped ? `
                                                <button class="btn btn-secondary btn-unequip">卸下</button>
                                            ` : `
                                                <button class="btn btn-secondary btn-equip">穿戴</button>
                                            `}
                                        </div>
                                    </div>
                                `).join('') : `
                                    <div class="empty-inventory">
                                        <p>背包中没有${this.getSlotName(selectedSlot)}</p>
                                    </div>
                                `}
                            </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 获取指定装备槽的装备列表
     * @param {string} slotId - 装备槽ID
     * @returns {Array} 装备列表
     */
    getSlotEquipmentList(slotId) {
        // 直接从状态获取数据，避免重复计算
        const equipped = this.engine.state.data.equipment.equipped[slotId];
        const inventory = this.engine.state.data.equipment.inventory;
        
        // 合并已穿戴和未穿戴的装备
        const allItems = [];
        
        // 添加已穿戴的装备
        if (equipped) {
            allItems.push({
                ...equipped,
                equipped: true
            });
        }
        
        // 添加未穿戴的装备（只过滤一次）
        inventory.forEach(item => {
            if ((item.type === 'equipment' || item.type === undefined) && item.slot === slotId) {
                allItems.push({
                    ...item,
                    type: item.type || 'equipment',
                    equipped: false
                });
            }
        });
        
        return allItems;
    }

    /**
     * 获取装备槽名称
     * @param {string} slotId - 装备槽ID
     * @returns {string} 装备槽名称
     */
    getSlotName(slotId) {
        const slot = GameConfig.EQUIPMENT.slots.find(s => s.id === slotId);
        return slot ? slot.name : '';
    }

    /**
     * 获取属性名称
     * @param {string} stat - 属性ID
     * @returns {string} 属性名称
     */
    getStatName(stat) {
        const statMap = {
            attack: '攻击',
            hp: '生命',
            defense: '防御',
            critical: '暴击',
            criticalDamage: '暴击伤害',
            speed: '速度'
        };
        return statMap[stat] || stat;
    }

    /**
     * 获取品质颜色
     * @param {string} quality - 品质ID
     * @returns {string} 颜色值
     */
    getQualityColor(quality) {
        if (this.engine && this.engine.colorManager) {
            return this.engine.colorManager.getQualityColor(quality);
        }
        // 备用颜色映射
        const colorMap = {
            // 装备系统品质ID
            common: '#9e9e9e',    // 凡品 - 灰色
            good: '#4caf50',      // 良品 - 绿色
            fine: '#2196f3',      // 精品 - 蓝色
            exquisite: '#b39ddb',  // 绝品 - 紫色
            divine: '#ff9800',     // 神器 - 橙色
            // 其他系统品质ID
            uncommon: '#4caf50',  // 优秀 - 绿色
            rare: '#2196f3',      // 稀有 - 蓝色
            epic: '#b39ddb',      // 史诗 - 紫色
            legendary: '#ff9800', // 传说 - 橙色
            mythic: '#f44336'     // 神话 - 红色
        };
        return colorMap[quality] || '#9e9e9e';
    }

    /**
     * 显示强化操作界面
     * @param {string} equipmentId - 装备ID
     */
    showEnhancePage(equipmentId) {
        const mainContainer = document.getElementById('main-container');
        const equipment = this.getEquipmentById(equipmentId);
        
        if (!equipment) {
            this.showNotification('装备不存在', 'error');
            return;
        }
        
        const enhanceCost = this.engine.equipmentSystem.getEnhanceCost(equipment.level);
        const maxLevel = GameConfig.EQUIPMENT.maxEnhanceLevel;
        
        // 计算强化成功率
        let successRate = 100;
        const currentLevel = equipment.level;
        if (currentLevel >= 1) {
            if (currentLevel < 5) {
                // 2~5级每加1级成功率降低5%
                successRate = 100 - (currentLevel - 1) * 5;
            } else if (currentLevel < 11) {
                // 6~11级每加1级降低10%
                successRate = 100 - 4 * 5 - (currentLevel - 5) * 10;
            } else if (currentLevel < 15) {
                // 11~15级每加1级降低2%
                successRate = 100 - 4 * 5 - 6 * 10 - (currentLevel - 11) * 2;
            }
        }
        // 确保成功率不低于0
        successRate = Math.max(0, successRate);
        
        // 计算下一级属性
        const nextLevelStats = this.engine.equipmentSystem.calculateNextLevelStats(equipment);
        
        // 确定强化等级颜色
        let levelColorClass = '';
        if (equipment.level >= 15) levelColorClass = 'enhance-level-maxed';
        else if (equipment.level >= 12) levelColorClass = 'enhance-level-orange';
        else if (equipment.level >= 9) levelColorClass = 'enhance-level-purple';
        else if (equipment.level >= 6) levelColorClass = 'enhance-level-blue';
        else if (equipment.level >= 3) levelColorClass = 'enhance-level-green';
        else levelColorClass = 'enhance-level-white';
        
        // 确定下一级强化等级颜色
        let nextLevelColorClass = '';
        const nextLevel = equipment.level + 1;
        if (nextLevel >= 15) nextLevelColorClass = 'enhance-level-maxed';
        else if (nextLevel >= 12) nextLevelColorClass = 'enhance-level-orange';
        else if (nextLevel >= 9) nextLevelColorClass = 'enhance-level-purple';
        else if (nextLevel >= 6) nextLevelColorClass = 'enhance-level-blue';
        else if (nextLevel >= 3) nextLevelColorClass = 'enhance-level-green';
        else nextLevelColorClass = 'enhance-level-white';
        
        const isMaxLevel = equipment.level >= 15;
        
        // 日志：输出装备信息以便调试颜色问题
        console.log('强化界面 - 装备信息:', {
            name: equipment.name,
            quality: equipment.quality,
            qualityColor: equipment.qualityColor,
            level: equipment.level
        });
        
        mainContainer.innerHTML = `
            <div class="equipment-enhance-modal">
                <div class="equipment-modal-overlay">
                    <div class="equipment-info-container">
                        <div class="equipment-info-header">
                            <h2>装备强化</h2>
                            <button class="btn-close-equipment" id="btn-close-enhance">×</button>
                        </div>
                        
                        <div class="equipment-enhance-content">
                            <div class="enhance-equipment-info">
                                <h3 class="quality-${equipment.quality}">${equipment.name}</h3>
                                
                                <div class="enhance-levels-container">
                                    <div class="enhance-level-card">
                                        <div class="enhance-level-header ${levelColorClass}">
                                            当前等级 +${equipment.level}
                                        </div>
                                        <div class="enhance-stats">
                                            ${Object.entries(equipment.stats).map(([stat, value]) => `
                                                <div class="enhance-stat-item">
                                                    <span class="enhance-stat-label">${this.getStatName(stat)}</span>
                                                    <span class="enhance-stat-value">${value}</span>
                                                </div>
                                            `).join('')}
                                        </div>
                                    </div>
                                    
                                    <div class="enhance-level-card">
                                        ${!isMaxLevel ? `
                                            <div class="enhance-level-header ${nextLevelColorClass}">
                                                下一级 +${equipment.level + 1}
                                            </div>
                                            <div class="enhance-stats">
                                                ${Object.entries(nextLevelStats).map(([stat, value]) => {
                                                    const currentValue = equipment.stats[stat] || 0;
                                                    const isIncreased = value > currentValue;
                                                    return `
                                                        <div class="enhance-stat-item">
                                                            <span class="enhance-stat-label">${this.getStatName(stat)}</span>
                                                            <span class="enhance-stat-value ${isIncreased ? 'enhance-stat-increased' : ''}">${value}</span>
                                                        </div>
                                                    `;
                                                }).join('')}
                                            </div>
                                        ` : `
                                            <div class="enhance-level-header enhance-level-maxed">
                                                已满级
                                            </div>
                                            <div class="enhance-maxed-info">
                                                <p>装备强化等级已达到上限</p>
                                            </div>
                                        `}
                                    </div>
                                </div>
                            </div>
                            
                            <div class="enhance-cost-section">
                                <h4>消耗</h4>
                                <div class="cost-item">强化石: ${enhanceCost.stone}，灵石: ${enhanceCost.spiritStone}</div>
                                <div class="enhance-success-rate">强化成功率: ${successRate}%</div>
                            </div>
                            
                            <div class="enhance-actions">
                                <button class="btn btn-primary btn-enhance-confirm" id="btn-enhance-confirm" ${isMaxLevel ? 'disabled' : ''}>
                                    ${isMaxLevel ? '已满级' : '确认强化'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 绑定强化界面事件
        this.bindEnhanceEvents(equipmentId);
    }

    /**
     * 计算属性品质等级
     * @param {number} value - 当前属性值
     * @param {number} maxValue - 最大值
     * @returns {string} 品质等级
     */
    calculateStatQuality(value, maxValue) {
        const percentage = (value / maxValue) * 100;
        if (percentage >= 100) return 'red';
        if (percentage >= 90) return 'orange';
        if (percentage >= 80) return 'purple';
        if (percentage >= 70) return 'blue';
        if (percentage >= 60) return 'green';
        if (percentage >= 50) return 'white';
        return 'gray';
    }

    /**
     * 显示洗炼操作界面
     * @param {string} equipmentId - 装备ID
     * @param {string} slot - 装备槽位ID
     */
    showRefinePage(equipmentId, slot) {
        const mainContainer = document.getElementById('main-container');
        const equipment = this.getEquipmentById(equipmentId);
        
        if (!equipment) {
            this.showNotification('装备不存在', 'error');
            return;
        }
        
        // 模拟最大属性值（实际应该从配置中获取）
        const maxStats = {
            attack: 5000,
            hp: 20000,
            defense: 2000,
            speed: 200,
            critical: 100
        };
        
        mainContainer.innerHTML = `
            <div class="equipment-refine-modal">
                <div class="equipment-modal-overlay">
                    <div class="equipment-info-container">
                        <div class="equipment-info-header">
                            <h2>装备洗炼</h2>
                            <button class="btn-close-equipment" id="btn-close-refine">×</button>
                        </div>
                        
                        <div class="equipment-refine-content">
                            <div class="refine-equipment-info">
                                <h3 class="quality-${equipment.quality}">${equipment.name}</h3>
                                <div class="refine-stats-container">
                                    ${Object.entries(equipment.stats).map(([stat, value]) => {
                                        const maxValue = maxStats[stat] || 1000;
                                        const percentage = (value / maxValue) * 100;
                                        const isMaxed = percentage >= 100;
                                        let barColor = '';
                                        if (percentage >= 100) barColor = 'refine-bar-maxed';
                                        else if (percentage >= 90) barColor = 'refine-bar-red';
                                        else if (percentage >= 80) barColor = 'refine-bar-orange';
                                        else if (percentage >= 70) barColor = 'refine-bar-purple';
                                        else if (percentage >= 60) barColor = 'refine-bar-blue';
                                        else if (percentage >= 50) barColor = 'refine-bar-green';
                                        else barColor = 'refine-bar-gray';
                                        
                                        return `
                                            <div class="refine-stat-item">
                                                <div class="refine-stat-label">${this.getStatName(stat)}</div>
                                                <div class="refine-stat-bar-container">
                                                    <div class="refine-stat-bar ${barColor}" style="width: ${Math.min(percentage, 100)}%"></div>
                                                    <div class="refine-stat-value">${value}</div>
                                                    ${isMaxed ? '<div class="refine-stat-maxed">已满级</div>' : ''}
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                            
                            <div class="refine-cost-section">
                                <h4>消耗</h4>
                                <div class="cost-item">洗炼石: 10，灵石: 500</div>
                            </div>
                            
                            <div class="refine-actions">
                                <button class="btn btn-primary btn-refine-confirm" id="btn-refine-confirm">确认洗炼</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 绑定洗炼界面事件
        this.bindRefineEvents(equipmentId, slot);
    }

    /**
     * 根据装备ID获取装备信息
     * @param {string} equipmentId - 装备ID
     * @returns {Object|null} 装备信息
     */
    getEquipmentById(equipmentId) {
        const equipment = this.engine.state.data.equipment;
        
        // 检查已穿戴装备
        for (const [slot, item] of Object.entries(equipment.equipped)) {
            if (item && item.id === equipmentId) {
                return item;
            }
        }
        
        // 检查背包装备
        const inventoryItem = equipment.inventory.find(item => item.id === equipmentId);
        if (inventoryItem) {
            return inventoryItem;
        }
        
        return null;
    }

    /**
     * 绑定强化界面事件
     * @param {string} equipmentId - 装备ID
     */
    bindEnhanceEvents(equipmentId) {
        // 关闭按钮
        const btnClose = document.getElementById('btn-close-enhance');
        if (btnClose) {
            // 移除可能存在的事件监听器
            btnClose.onclick = null;
            btnClose.addEventListener('click', () => {
                const modal = document.querySelector('.equipment-enhance-modal');
                if (modal) {
                    modal.remove();
                }
                // 回到装备信息页面
                // 获取当前装备槽位
                const equipment = this.engine.state.data.equipment.equipped;
                let slot = null;
                for (const [key, value] of Object.entries(equipment)) {
                    if (value && value.id === equipmentId) {
                        slot = key;
                        break;
                    }
                }
                if (slot) {
                    this.switchPage('equipment-info', { slot: slot });
                } else {
                    // 如果没有槽位信息，回到主界面
                    this.switchPage('home');
                }
            });
        }
        
        // 确认强化按钮
        const btnConfirm = document.getElementById('btn-enhance-confirm');
        if (btnConfirm) {
            // 移除可能存在的事件监听器
            btnConfirm.onclick = null;
            btnConfirm.addEventListener('click', () => {
                // 检查装备是否已穿戴
                const equipment = this.engine.state.data.equipment.equipped;
                let slot = null;
                let equippedEquipment = null;
                for (const [key, value] of Object.entries(equipment)) {
                    if (value && value.id === equipmentId) {
                        slot = key;
                        equippedEquipment = value;
                        break;
                    }
                }
                
                if (slot && equippedEquipment) {
                    // 计算强化成功率
                    let successRate = 100;
                    const currentLevel = equippedEquipment.level;
                    if (currentLevel >= 1) {
                        if (currentLevel < 5) {
                            // 2~5级每加1级成功率降低5%
                            successRate = 100 - (currentLevel - 1) * 5;
                        } else if (currentLevel < 11) {
                            // 6~11级每加1级降低10%
                            successRate = 100 - 4 * 5 - (currentLevel - 5) * 10;
                        } else if (currentLevel < 15) {
                            // 11~15级每加1级降低2%
                            successRate = 100 - 4 * 5 - 6 * 10 - (currentLevel - 11) * 2;
                        }
                    }
                    // 确保成功率不低于0
                    successRate = Math.max(0, successRate);
                    
                    console.log('强化 - 当前等级:', currentLevel, '成功率:', successRate + '%');
                    
                    const result = this.engine.equipmentSystem.enhance(slot, successRate);
                    this.showNotification(result.message, result.success ? (result.isSuccess ? 'success' : 'warning') : 'error');
                    
                    // 无论强化是否成功，都刷新强化页面
                    setTimeout(() => {
                        this.showEnhancePage(equipmentId);
                    }, 500);
                } else {
                    // 未穿戴的装备强化逻辑
                    this.showNotification('未穿戴装备不支持强化', 'info');
                }
            });
        }
    }

    /**
     * 绑定洗炼界面事件
     * @param {string} equipmentId - 装备ID
     * @param {string} slot - 装备槽位ID
     */
    bindRefineEvents(equipmentId, slot) {
        // 关闭按钮
        const btnClose = document.getElementById('btn-close-refine');
        if (btnClose) {
            btnClose.addEventListener('click', () => {
                const modal = document.querySelector('.equipment-refine-modal');
                if (modal) {
                    modal.remove();
                }
                // 重新显示装备信息页面
                if (slot) {
                    this.switchPage('equipment-info', { slot: slot });
                } else {
                    // 如果没有槽位信息，回到主界面
                    this.switchPage('home');
                }
            });
        }
        
        // 取消按钮
        const btnCancel = document.getElementById('btn-refine-cancel');
        if (btnCancel) {
            btnCancel.addEventListener('click', () => {
                const modal = document.querySelector('.equipment-refine-modal');
                if (modal) {
                    modal.remove();
                }
                // 重新显示装备信息页面
                if (slot) {
                    this.switchPage('equipment-info', { slot: slot });
                } else {
                    // 如果没有槽位信息，回到主界面
                    this.switchPage('home');
                }
            });
        }
        
        // 确认洗炼按钮
        const btnConfirm = document.getElementById('btn-refine-confirm');
        if (btnConfirm) {
            btnConfirm.addEventListener('click', () => {
                // 模拟洗炼逻辑
                const equipment = this.getEquipmentById(equipmentId);
                if (equipment) {
                    const maxStats = {
                        attack: 5000,
                        hp: 20000,
                        defense: 2000,
                        speed: 200,
                        critical: 100
                    };
                    
                    // 复制当前属性
                    const newStats = { ...equipment.stats };
                    let hasChanges = false;
                    
                    // 只洗炼未满级的属性
                    Object.entries(newStats).forEach(([stat, value]) => {
                        const maxValue = maxStats[stat] || 1000;
                        const percentage = (value / maxValue) * 100;
                        
                        // 未满级的属性才洗炼
                        if (percentage < 100) {
                            // 模拟洗炼效果：随机增加或减少属性
                            const change = Math.floor(Math.random() * 200) - 50; // -50 到 150
                            const newValue = Math.max(0, Math.min(maxValue, value + change));
                            
                            if (newValue !== value) {
                                newStats[stat] = newValue;
                                hasChanges = true;
                            }
                        }
                    });
                    
                    if (hasChanges) {
                        // 检查洗练石数量
                        const refineStoneIndex = this.engine.state.data.backpack.items.findIndex(item => item.id === 'refine_stone');
                        const refineStoneItem = refineStoneIndex !== -1 ? this.engine.state.data.backpack.items[refineStoneIndex] : null;
                        const refineStoneCount = refineStoneItem ? (refineStoneItem.quantity || refineStoneItem.count || 0) : 0;
                        
                        if (refineStoneCount < 10) {
                            this.showNotification('洗炼石不足，需要10个洗炼石', 'error');
                            return;
                        }
                        
                        // 消耗洗练石
                        if (refineStoneItem.count !== undefined) {
                            refineStoneItem.count -= 10;
                            // 同时更新 quantity 属性，确保两者保持一致
                            refineStoneItem.quantity = refineStoneItem.count;
                            if (refineStoneItem.count <= 0) {
                                this.engine.state.data.backpack.items.splice(refineStoneIndex, 1);
                            }
                        } else if (refineStoneItem.quantity !== undefined) {
                            refineStoneItem.quantity -= 10;
                            // 同时更新 count 属性，确保两者保持一致
                            refineStoneItem.count = refineStoneItem.quantity;
                            if (refineStoneItem.quantity <= 0) {
                                this.engine.state.data.backpack.items.splice(refineStoneIndex, 1);
                            }
                        }
                        
                        // 更新洗练石消耗统计
                        this.engine.achievementSystem.updateStats('refineStoneUsed', 10);
                        
                        // 更新每日任务进度
                        if (this.engine.dailyTaskSystem) {
                            this.engine.dailyTaskSystem.updateTaskProgress('consumeItem', 10, '洗炼符');
                        }
                        
                        // 更新装备属性
                        equipment.stats = newStats;
                        this.engine.state.save();
                        this.showNotification('洗炼成功', 'success');
                        // 重新显示洗炼界面以更新进度条
                        this.showRefinePage(equipmentId, slot);
                    } else {
                        this.showNotification('所有属性已满级，无法洗炼', 'info');
                    }
                }
            });
        }
    }

    /**
     * 刷新装备页面中的装备列表（不刷新整个页面）
     * @param {string} slot - 装备槽ID
     */
    refreshEquipmentList(slot) {
        const equipmentListContainer = document.querySelector('.equipment-list');
        if (!equipmentListContainer) return;

        const slotEquipmentList = this.getSlotEquipmentList(slot);

        if (slotEquipmentList.length > 0) {
            equipmentListContainer.innerHTML = slotEquipmentList.map(item => `
                <div class="equipment-list-card ${item.equipped ? 'equipped' : ''}" data-equipment-id="${item.id}">
                    <div class="equipment-list-header">
                        <span class="equipment-list-name" style="color: ${item.qualityColor || this.getQualityColor(item.quality)}">${item.name}<span class="equipment-list-level">+${item.level}</span></span>
                        ${item.equipped ? '<span class="equipment-equipped-tag">已穿戴</span>' : ''}
                    </div>
                    <div class="equipment-list-stats">
                        ${Object.entries(item.stats).map(([stat, value]) => `
                            <span class="equipment-list-stat">${this.getStatName(stat)} +${value}</span>
                        `).join('')}
                    </div>
                    <div class="equipment-list-actions">
                        <button class="btn btn-secondary btn-refine">洗炼</button>
                        <button class="btn btn-secondary btn-enhance">强化</button>
                        ${item.equipped ? `
                            <button class="btn btn-secondary btn-unequip">卸下</button>
                        ` : `
                            <button class="btn btn-secondary btn-equip">穿戴</button>
                        `}
                    </div>
                </div>
            `).join('');
        } else {
            equipmentListContainer.innerHTML = `
                <div class="empty-inventory">
                    <p>背包中没有${this.getSlotName(slot)}</p>
                </div>
            `;
        }

        // 只绑定装备卡片相关的事件，不重新绑定侧边栏事件
        this.bindEquipmentCardEvents();
    }

    /**
     * 绑定装备卡片事件（用于刷新装备列表时）
     */
    bindEquipmentCardEvents() {
        // 穿戴按钮
        document.querySelectorAll('.btn-equip').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.equipment-list-card');
                const equipmentId = card.dataset.equipmentId;
                const result = this.engine.equipmentSystem.equip(equipmentId);
                this.showNotification(result.message, result.success ? 'success' : 'error');
                // 只刷新装备列表，不刷新整个弹窗
                const currentSlot = document.querySelector('.equipment-sidebar-item.active').dataset.slot;
                this.refreshEquipmentList(currentSlot);
                // 刷新主界面装备显示
                this.refreshHomePageEquipment();
            });
        });

        // 卸下按钮
        document.querySelectorAll('.btn-unequip').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.equipment-list-card');
                const equipmentId = card.dataset.equipmentId;
                // 找到装备对应的槽位
                const equipment = this.engine.state.data.equipment.equipped;
                let slot = null;
                for (const [key, value] of Object.entries(equipment)) {
                    if (value && value.id === equipmentId) {
                        slot = key;
                        break;
                    }
                }
                if (slot) {
                    const result = this.engine.equipmentSystem.unequip(slot);
                    this.showNotification(result.message, result.success ? 'success' : 'error');
                    // 只刷新装备列表，不刷新整个弹窗
                    const currentSlot = document.querySelector('.equipment-sidebar-item.active').dataset.slot;
                    this.refreshEquipmentList(currentSlot);
                    // 刷新主界面装备显示
                    this.refreshHomePageEquipment();
                }
            });
        });

        // 强化按钮
        document.querySelectorAll('.btn-enhance').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.equipment-list-card');
                const equipmentId = card.dataset.equipmentId;
                
                // 进入强化操作界面
                this.showEnhancePage(equipmentId);
            });
        });

        // 洗炼按钮
        document.querySelectorAll('.btn-refine').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.equipment-list-card');
                const equipmentId = card.dataset.equipmentId;
                // 获取当前装备槽位
                const currentSlot = document.querySelector('.equipment-sidebar-item.active').dataset.slot;
                
                // 进入洗炼操作界面
                this.showRefinePage(equipmentId, currentSlot);
            });
        });
    }

    /**
     * 刷新装备页面内容
     * @param {string} slot - 装备槽ID
     */
    refreshEquipmentPage(slot) {
        // 只更新侧边栏选中状态和装备列表，不刷新整个页面
        this.refreshEquipmentSidebar(slot);
        this.refreshEquipmentList(slot);
    }

    /**
     * 刷新装备侧边栏选中状态
     * @param {string} slot - 装备槽ID
     */
    refreshEquipmentSidebar(slot) {
        document.querySelectorAll('.equipment-sidebar-item').forEach(item => {
            item.classList.toggle('active', item.dataset.slot === slot);
        });
    }

    /**
     * 刷新主界面装备显示
     */
    refreshHomePageEquipment() {
        // 即使当前页面不是home，也要刷新主界面装备显示
        // 因为装备弹窗打开时currentPage会变成'equipment-info'

        const equipment = this.engine.equipmentSystem.getAllEquipment();
        const slots = ['weapon', 'armor', 'belt', 'boots', 'necklace', 'ring', 'jade', 'talisman'];

        slots.forEach(slot => {
            // 查找所有匹配的装备槽（主界面有左右两个装备栏）
            const equipSlots = document.querySelectorAll(`.equip-slot[data-slot="${slot}"]`);
            equipSlots.forEach(equipSlot => {
                if (equipSlot) {
                    const equip = equipment.equipped[slot];
                    if (equip) {
                        // 输出装备信息日志
                        console.log(`装备槽 ${slot} 装备信息:`, {
                            name: equip.name,
                            quality: equip.quality,
                            qualityColor: equip.qualityColor,
                            level: equip.level
                        });
                        
                        // 更新装备显示
                        const equipItem = equipSlot.querySelector('.equip-item');
                        const equipPlus = equipSlot.querySelector('.equip-plus');
                        
                        if (equipPlus) {
                            equipPlus.remove();
                        }
                        
                        // 获取品质配置
                        const qualityConfig = GameConfig.EQUIPMENT.qualities.find(q => q.id === equip.quality);
                        // 使用装备的 qualityColor 或品质配置中的颜色
                        const itemColor = equip.qualityColor || (qualityConfig ? qualityConfig.color : '#9e9e9e');
                        
                        if (!equipItem) {
                            const itemSpan = document.createElement('span');
                            itemSpan.className = 'equip-item';
                            itemSpan.textContent = equip.name + (equip.level > 0 ? ` +${equip.level}` : '');
                            itemSpan.style.color = itemColor;
                            equipSlot.appendChild(itemSpan);
                        } else {
                            equipItem.textContent = equip.name + (equip.level > 0 ? ` +${equip.level}` : '');
                            equipItem.style.color = itemColor;
                        }
                        
                        // 根据品质添加样式
                        this.applyEquipmentQualityStyle(equipSlot, equip.quality, itemColor);
                    } else {
                        // 移除装备显示，显示加号
                        const equipItem = equipSlot.querySelector('.equip-item');
                        if (equipItem) {
                            equipItem.remove();
                        }
                        
                        if (!equipSlot.querySelector('.equip-plus')) {
                            const plusSpan = document.createElement('span');
                            plusSpan.className = 'equip-plus';
                            plusSpan.textContent = '+';
                            equipSlot.appendChild(plusSpan);
                        }
                        
                        // 移除品质样式
                        this.removeEquipmentQualityStyle(equipSlot);
                    }
                }
            });
        });
    }

    /**
     * 应用装备品质样式
     * @param {HTMLElement} equipSlot - 装备槽元素
     * @param {string} quality - 装备品质
     * @param {string} qualityColor - 装备品质颜色
     */
    applyEquipmentQualityStyle(equipSlot, quality, qualityColor) {
        const qualityConfig = GameConfig.EQUIPMENT.qualities.find(q => q.id === quality);
        if (!qualityConfig) return;

        // 输出装备品质样式日志
        console.log(`应用装备品质样式:`, {
            quality: quality,
            qualityColor: qualityColor,
            qualityConfigColor: qualityConfig.color,
            slot: equipSlot.dataset.slot
        });

        // 移除之前的品质样式
        this.removeEquipmentQualityStyle(equipSlot);

        // 添加品质类名
        equipSlot.classList.add(`quality-${quality}`);

        // 使用传入的品质颜色或配置中的颜色
        const color = qualityColor || qualityConfig.color;
        console.log(`最终使用的颜色:`, color);
        
        // 添加渐变背景和光晕效果
        equipSlot.style.background = `linear-gradient(135deg, ${color}20, ${color}40)`;
        equipSlot.style.boxShadow = `0 0 10px ${color}40, inset 0 0 5px ${color}20`;
        equipSlot.style.border = `1px solid ${color}60`;

        // 橙色及以上品质添加滚动边框效果
        if (quality === 'divine') {
            equipSlot.classList.add('high-quality-glow');
            // 添加旋转边框特效
            // 生成基于品质颜色的旋转边框动画
            // 动态生成动画样式
            const style = document.createElement('style');
            style.textContent = `
                @keyframes borderRotate-${quality} {
                    0% {
                        box-shadow: 0 0 10px ${color}40, inset 0 0 5px ${color}20, 0 0 20px ${color}60 0deg;
                    }
                    25% {
                        box-shadow: 0 0 10px ${color}40, inset 0 0 5px ${color}20, 0 0 20px ${color}60 90deg;
                    }
                    50% {
                        box-shadow: 0 0 10px ${color}40, inset 0 0 5px ${color}20, 0 0 20px ${color}60 180deg;
                    }
                    75% {
                        box-shadow: 0 0 10px ${color}40, inset 0 0 5px ${color}20, 0 0 20px ${color}60 270deg;
                    }
                    100% {
                        box-shadow: 0 0 10px ${color}40, inset 0 0 5px ${color}20, 0 0 20px ${color}60 360deg;
                    }
                }
            `;
            document.head.appendChild(style);
            // 应用动画
            equipSlot.style.animation = `borderRotate-${quality} 2s linear infinite`;
        }
    }

    /**
     * 移除装备品质样式
     * @param {HTMLElement} equipSlot - 装备槽元素
     */
    removeEquipmentQualityStyle(equipSlot) {
        // 移除品质类名
        equipSlot.classList.remove('quality-common', 'quality-good', 'quality-fine', 'quality-exquisite', 'quality-divine', 'high-quality-glow');
        
        // 移除内联样式
        equipSlot.style.background = '';
        equipSlot.style.boxShadow = '';
        equipSlot.style.border = '';
        // 移除旋转边框特效
        equipSlot.style.animation = '';
    }

    /**
     * 绑定装备信息页面事件
     */
    bindEquipmentInfoEvents() {
        // 装备槽切换
        document.querySelectorAll('.equipment-sidebar-item').forEach(item => {
            item.addEventListener('click', () => {
                const slot = item.dataset.slot;
                this.refreshEquipmentPage(slot);
            });
        });

        // 穿戴按钮
        document.querySelectorAll('.btn-equip').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.equipment-list-card');
                const equipmentId = card.dataset.equipmentId;
                const result = this.engine.equipmentSystem.equip(equipmentId);
                this.showNotification(result.message, result.success ? 'success' : 'error');
                // 只刷新装备列表，不刷新整个弹窗
                const currentSlot = document.querySelector('.equipment-sidebar-item.active').dataset.slot;
                this.refreshEquipmentList(currentSlot);
                // 刷新主界面装备显示
                this.refreshHomePageEquipment();
            });
        });

        // 卸下按钮
        document.querySelectorAll('.btn-unequip').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.equipment-list-card');
                const equipmentId = card.dataset.equipmentId;
                // 找到装备对应的槽位
                const equipment = this.engine.state.data.equipment.equipped;
                let slot = null;
                for (const [key, value] of Object.entries(equipment)) {
                    if (value && value.id === equipmentId) {
                        slot = key;
                        break;
                    }
                }
                if (slot) {
                    const result = this.engine.equipmentSystem.unequip(slot);
                    this.showNotification(result.message, result.success ? 'success' : 'error');
                    // 只刷新装备列表，不刷新整个弹窗
                    const currentSlot = document.querySelector('.equipment-sidebar-item.active').dataset.slot;
                    this.refreshEquipmentList(currentSlot);
                    // 刷新主界面装备显示
                    this.refreshHomePageEquipment();
                }
            });
        });

        // 强化按钮
        document.querySelectorAll('.btn-enhance').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.equipment-list-card');
                const equipmentId = card.dataset.equipmentId;
                
                // 进入强化操作界面
                this.showEnhancePage(equipmentId);
            });
        });

        // 洗炼按钮
        document.querySelectorAll('.btn-refine').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const card = e.target.closest('.equipment-list-card');
                const equipmentId = card.dataset.equipmentId;
                // 获取当前装备槽位
                const currentSlot = document.querySelector('.equipment-sidebar-item.active').dataset.slot;
                
                // 进入洗炼操作界面
                this.showRefinePage(equipmentId, currentSlot);
            });
        });
    }

    /**
     * 绑定首页事件
     */
    bindHomeEvents() {
        // 头像点击事件
        const avatar = document.querySelector('.avatar');
        if (avatar) {
            avatar.addEventListener('click', () => {
                this.switchPage('character');
            });
        }

        // 开始/停止修炼
        const btnCultivate = document.getElementById('btn-cultivate');
        if (btnCultivate) {
            btnCultivate.addEventListener('click', () => {
                const state = this.engine.state.data.training.cultivation;
                if (state.active) {
                    const result = this.engine.trainingSystem.stopCultivation();
                    this.showNotification(result.message);
                } else {
                    const result = this.engine.trainingSystem.startCultivation();
                    if (result.success) {
                        this.showNotification(result.message, 'success');
                    } else {
                        this.showNotification(result.message, 'warning');
                    }
                }
                // 更新修炼按钮状态和进度条
                this.updateCultivationButtonState();
                this.refreshCultivationProgress();
            });
        }

        // 加速按钮
        const btnSpeed = document.getElementById('btn-speed');
        if (btnSpeed) {
            btnSpeed.addEventListener('click', () => {
                const cultivation = this.engine.state.data.training.cultivation;
                if (!cultivation.active) {
                    // 未修炼时，开始修炼
                    const result = this.engine.trainingSystem.startCultivation();
                    this.showNotification(result.message, result.success ? 'success' : 'error');
                    if (result.success) {
                        // 更新按钮状态
                        this.updateCultivationButtonState();
                        // 刷新页面
                        this.switchPage('home');
                    }
                } else {
                    // 已修炼时，进入加速修炼页面
                    this.showSpeedUpModal();
                }
            });
        }

        // 突破按钮
        const btnBreakthrough = document.getElementById('btn-breakthrough-home');
        if (btnBreakthrough) {
            // 初始化突破按钮状态
            const progress = this.engine.realmSystem.getProgress();
            const isBreakthroughAvailable = progress.progress >= 100;
            btnBreakthrough.disabled = !isBreakthroughAvailable;
            
            btnBreakthrough.addEventListener('click', () => {
                const result = this.engine.realmSystem.breakthrough();
                if (result.breakthroughSuccess) {
                    this.showNotification(`🎉 ${result.message}`, 'success');
                } else if (result.success) {
                    this.showNotification(result.message, 'warning');
                } else {
                    this.showNotification(result.message, 'error');
                }
                // 只更新境界显示，不刷新整个页面
                this.updateRealmDisplay();
            });
        }

        // 右侧菜单
        document.querySelectorAll('.menu-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = btn.dataset.page;
                console.log('Menu item clicked:', page);
                this.switchPage(page);
            });
        });

        // 底部功能按钮
        document.querySelectorAll('.feature-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = btn.dataset.page;
                if (page === 'cultivation') {
                    this.switchPage('cultivation');
                } else if (page === 'skills') {
                    this.switchPage('skills');
                } else if (page === 'genjiao') {
                    this.switchPage('genjiao');
                } else if (page === 'story') {
                    this.switchPage('story');
                } else if (page === 'expedition') {
                    this.switchPage('expedition');
                } else if (page === 'inventory') {
                    this.switchPage('inventory');
                } else if (page === 'body-training') {
                    this.switchPage('body-training');
                } else if (page === 'alchemy') {
                    this.switchPage('alchemy');
                } else if (page === 'pet') {
                    this.switchPage('pet');
                } else if (page === 'field') {
                    this.switchPage('field');
                } else {
                    this.showNotification('功能开发中...', 'info');
                }
            });
        });

        // 装备槽点击
        document.querySelectorAll('.equip-slot').forEach(slot => {
            slot.addEventListener('click', () => {
                const slotId = slot.dataset.slot;
                this.switchPage('equipment-info', { slot: slotId });
            });
        });

        // 刷新装备槽品质动效
        this.refreshHomePageEquipment();

        // 刷新修炼进度条
        this.refreshCultivationProgress();
    }

    /**
     * 刷新修炼状态
     */
    updateCultivationButtonState() {
        const btnCultivate = document.getElementById('btn-cultivate');
        if (btnCultivate) {
            const statusText = this.engine.trainingSystem.getCultivationStatus();
            this.addTypingAnimation(btnCultivate, statusText);
            btnCultivate.classList.toggle('active', this.engine.state.data.training.cultivation.active);
        }
    }

    /**
     * 刷新修为进度条
     */
    refreshCultivationProgress() {
        const cultivationBar = document.querySelector('.cultivation-bar');
        if (!cultivationBar) return;

        const state = this.engine.state.data;
        const progress = this.engine.realmSystem.getProgress();
        const efficiency = this.engine.trainingSystem.getCultivationEfficiency();

        const progressFill = cultivationBar.querySelector('.progress-fill');
        const progressText = cultivationBar.querySelector('.progress-text');

        if (progressFill) {
            progressFill.style.width = `${progress.progress}%`;
        }

        if (progressText) {
            const cultivationStatus = state.training.cultivation.active ? 
                (efficiency.isAccelerated ? '加速修炼中.' : '修炼中.') : 
                '修炼停止';
            const text = `${cultivationStatus} ${this.formatNumber(state.realm.exp)}/${this.formatNumber(progress.requiredExp)} (${progress.progress.toFixed(1)}%)`;
            this.addTypingAnimation(progressText, text);
        }
    }

    /**
     * 更新境界显示
     */
    updateRealmDisplay() {
        const realmDisplay = document.querySelector('.realm-display');
        if (realmDisplay) {
            const state = this.engine.state.data;
            const realmConfig = this.engine.state.getCurrentRealmConfig();
            realmDisplay.textContent = `${realmConfig.name}·${this.getLayerName(state.realm.currentLayer)}`;
        }
        this.refreshCultivationProgress();
    }

    // ==================== 养成页 ====================

    /**
     * 获取养成页HTML
     * @returns {string} HTML字符串
     */
    getCultivationPageHTML() {
        const state = this.engine.state.data;
        const realmConfig = this.engine.state.getCurrentRealmConfig();
        const progress = this.engine.realmSystem.getProgress();
        const spiritRoot = this.engine.spiritRootSystem.getCurrentSpiritRoot();
        const canBreakthrough = this.engine.realmSystem.canBreakthrough();

        return `
            <div class="page cultivation-page">
                <div class="page-header">
                    <button class="btn-back-home">← 返回</button>
                    <h2>修仙养成</h2>
                </div>

                <div class="cultivation-tabs">
                    <button class="tab-btn active" data-tab="realm">境界</button>
                    <button class="tab-btn" data-tab="spirit-root">灵根</button>
                    <button class="tab-btn" data-tab="skills">功法</button>
                    <button class="tab-btn" data-tab="equipment">装备</button>
                </div>

                <div class="tab-content active" id="tab-realm">
                    <div class="realm-panel">
                        <div class="current-realm">
                            <span class="realm-title">${realmConfig.name}</span>
                            <span class="realm-layer">${state.realm.currentLayer > 1 ? '第' + state.realm.currentLayer + '层' : ''}</span>
                        </div>
                        <div class="realm-progress-bar">
                            <div class="progress-fill" style="width: ${progress.progress}%"></div>
                            <span class="progress-text">${this.formatNumber(state.realm.exp)} / ${this.formatNumber(progress.requiredExp)}</span>
                        </div>
                        <div class="breakthrough-section">
                            ${canBreakthrough.canBreakthrough ? `
                                <button class="btn btn-primary btn-breakthrough" id="btn-breakthrough">
                                    突破境界 (${Math.floor(canBreakthrough.successRate * 100)}%成功率)
                                </button>
                            ` : `
                                <button class="btn btn-disabled" disabled>
                                    ${canBreakthrough.reason} (缺${this.formatNumber(canBreakthrough.missing)})
                                </button>
                            `}
                        </div>
                    </div>
                </div>

                <div class="tab-content" id="tab-spirit-root">
                    <div class="spirit-root-panel">
                        <div class="current-root">
                            <div class="root-type" style="color: ${spiritRoot.qualityColor}">
                                ${spiritRoot.variant ? '变异' : ''}${spiritRoot.typeName}灵根
                            </div>
                            <div class="root-quality" style="color: ${spiritRoot.qualityColor}">
                                ${spiritRoot.qualityName}
                            </div>
                            <div class="root-bonus">
                                修炼速度 +${Math.floor(spiritRoot.totalBonus * 100)}%
                            </div>
                        </div>
                        <div class="wash-section">
                            <button class="btn btn-primary btn-wash-root" id="btn-wash-root">
                                洗练灵根 (100灵石)
                            </button>
                            <button class="btn btn-secondary btn-wash-batch" id="btn-wash-batch">
                                批量洗练 (1000灵石)
                            </button>
                        </div>
                    </div>
                </div>

                <div class="tab-content" id="tab-skills">
                    <div class="skills-panel">
                        <div class="skills-list" id="skills-list">
                            ${this.getSkillsHTML()}
                        </div>
                    </div>
                </div>

                <div class="tab-content" id="tab-equipment">
                    <div class="equipment-panel">
                        <div class="equipped-section">
                            <h3>已穿戴</h3>
                            <div class="equipped-list" id="equipped-list">
                                ${this.getEquippedHTML()}
                            </div>
                        </div>
                        <div class="enhance-section">
                            <button class="btn btn-primary btn-enhance-batch" id="btn-enhance-batch">
                                一键强化
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 绑定养成页事件
     */
    bindCultivationEvents() {
        // Tab切换
        document.querySelectorAll('.cultivation-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.cultivation-tabs .tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

                btn.classList.add('active');
                const tabId = `tab-${btn.dataset.tab}`;
                const tabContent = document.getElementById(tabId);
                if (tabContent) {
                    tabContent.classList.add('active');
                }
            });
        });

        // 突破
        const btnBreakthrough = document.getElementById('btn-breakthrough');
        if (btnBreakthrough) {
            btnBreakthrough.addEventListener('click', () => {
                const result = this.engine.realmSystem.breakthrough();
                if (result.breakthroughSuccess) {
                    this.showNotification(`🎉 ${result.message}`, 'success');
                } else if (result.success) {
                    this.showNotification(result.message, 'warning');
                } else {
                    this.showNotification(result.message, 'error');
                }
                this.switchPage('cultivation');
            });
        }

        // 洗练灵根
        const btnWashRoot = document.getElementById('btn-wash-root');
        if (btnWashRoot) {
            btnWashRoot.addEventListener('click', () => {
                const result = this.engine.spiritRootSystem.washSpiritRoot(false);
                this.showNotification(result.message, result.improved ? 'success' : 'info');
                this.switchPage('cultivation');
            });
        }

        // 批量洗练
        const btnWashBatch = document.getElementById('btn-wash-batch');
        if (btnWashBatch) {
            btnWashBatch.addEventListener('click', () => {
                const result = this.engine.spiritRootSystem.washSpiritRoot(true, 10);
                this.showNotification(result.message, result.improved ? 'success' : 'info');
                this.switchPage('cultivation');
            });
        }

        // 一键强化
        const btnEnhanceBatch = document.getElementById('btn-enhance-batch');
        if (btnEnhanceBatch) {
            btnEnhanceBatch.addEventListener('click', () => {
                const result = this.engine.equipmentSystem.batchEnhance();
                this.showNotification(result.message);
                this.switchPage('cultivation');
            });
        }
    }

    /**
     * 获取功法列表HTML
     * @returns {string} HTML字符串
     */
    getSkillsHTML() {
        const skills = this.engine.skillSystem.getLearnedSkills();
        if (skills.length === 0) {
            return '<div class="empty-tip">尚未学习任何功法</div>';
        }

        return skills.map(skill => `
            <div class="skill-item">
                <div class="skill-info">
                    <span class="skill-name">${skill.name}</span>
                    <span class="skill-level">Lv.${skill.level}</span>
                    <span class="skill-quality ${skill.quality}">${skill.qualityName}</span>
                </div>
                <button class="btn btn-small btn-upgrade-skill" data-skill="${skill.id}" ${!skill.canUpgrade ? 'disabled' : ''}>
                    ${skill.canUpgrade ? '升级' : '已满'}
                </button>
            </div>
        `).join('');
    }

    /**
     * 获取已穿戴装备HTML
     * @returns {string} HTML字符串
     */
    getEquippedHTML() {
        const equipment = this.engine.equipmentSystem.getAllEquipment();
        const slots = GameConfig.EQUIPMENT.slots;

        return slots.map(slot => {
            const equip = equipment.equipped[slot.id];
            return `
                <div class="equip-slot">
                    <span class="slot-name">${slot.name}</span>
                    ${equip ? `
                        <div class="equip-item" style="color: ${equip.qualityColor}">
                            <span class="equip-name">${equip.name} +${equip.level}</span>
                            <button class="btn btn-small btn-enhance" data-slot="${slot.id}">强化</button>
                        </div>
                    ` : '<span class="empty-slot">未装备</span>'}
                </div>
            `;
        }).join('');
    }

    // ==================== 角色信息页 ====================

    /**
     * 获取背包页面HTML
     * @returns {string} HTML字符串
     */
    getInventoryPageHTML() {
        const state = this.engine.state.data;
        const backpackItems = state.backpack.items || [];
        const backpack = state.backpack || {
            totalSlots: 40,
            unlockedSlots: 10,
            nextUnlockSlot: 11,
            unlockStartTime: Date.now(),
            unlockRequiredTime: 300000,
            lastOnlineTime: Date.now()
        };

        // 计算已解锁和未解锁的格子
        const unlockedSlots = backpack.unlockedSlots || 10;
        const totalSlots = backpack.totalSlots || 40;
        
        // 计算解锁倒计时
        let unlockTimeLeft = 0;
        if (unlockedSlots < totalSlots) {
            const currentTime = Date.now();
            const elapsedTime = currentTime - (backpack.unlockStartTime || currentTime);
            unlockTimeLeft = Math.max(0, (backpack.unlockRequiredTime || 300000) - elapsedTime);
        }

        // 格式化倒计时
        const formatTime = (milliseconds) => {
            const minutes = Math.floor(milliseconds / 60000);
            const seconds = Math.floor((milliseconds % 60000) / 1000);
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };

        // 生成背包格子
        let slotsHTML = '';
        for (let i = 0; i < totalSlots; i++) {
            const slotIndex = i + 1;
            const isUnlocked = slotIndex <= unlockedSlots;
            const isNextToUnlock = slotIndex === unlockedSlots + 1;
            
            let slotContent = '';
            if (isUnlocked) {
                // 查找当前格子的物品
                const item = backpackItems[i];
                if (item) {
                    // 根据物品品质获取边框颜色
                    const qualityColor = this.getItemQualityColor(item);
                    slotContent = `
                        <div class="inventory-slot-wrapper">
                            <div class="item-slot filled" style="border-color: ${qualityColor}; background-color: rgba(${this.hexToRgb(qualityColor)}, 0.2);">
                                <div class="item-icon">${item.icon || this.getItemIcon(item.id)}</div>
                                <div class="item-count-overlay">x${item.quantity || item.count || 1}</div>
                            </div>
                            <div class="item-details">
                                <div class="item-name">${item.name}</div>
                            </div>
                        </div>
                    `;
                } else {
                    slotContent = `
                        <div class="inventory-slot-wrapper">
                            <div class="item-slot empty">
                                <div class="empty-slot"></div>
                            </div>
                        </div>
                    `;
                }
            } else if (isNextToUnlock) {
                slotContent = `
                    <div class="inventory-slot-wrapper">
                        <div class="item-slot locked unlocking">
                            <div class="lock-info">
                                <div class="countdown">${formatTime(unlockTimeLeft)}</div>
                            </div>
                        </div>
                        <div class="item-details">
                            <div class="item-name">解锁中</div>
                        </div>
                    </div>
                `;
            } else {
                slotContent = `
                    <div class="inventory-slot-wrapper">
                        <div class="item-slot locked">
                            <div class="lock-info">
                                <div class="lock-text">未解锁</div>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            slotsHTML += slotContent;
        }

        return `
            <div class="page inventory-page">
                <div class="page-header">
                    <button class="btn-back-home">← 返回</button>
                    <h2>背包</h2>
                </div>

                <div class="inventory-content">
                    <div class="inventory-grid">
                        ${slotsHTML}
                    </div>
                </div>

                <!-- 物品详情弹窗 -->
                <div class="item-detail-modal" id="itemDetailModal" style="display: none;">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>物品详情</h3>
                            <button class="close-modal">×</button>
                        </div>
                        <div class="modal-body">
                            <div class="item-info">
                                <div class="item-icon-large" id="modalItemIcon"></div>
                                <h4 id="modalItemName"></h4>
                                <p id="modalItemDesc"></p>
                                <p class="item-count">数量: <span id="modalItemCount"></span></p>
                                <p class="item-price">出售价格: <span id="modalItemPrice"></span> 灵石</p>
                            </div>
                            <div class="modal-actions">
                                <button class="btn-sell" id="btnSellItem">出售</button>
                                <button class="btn-use" id="btnUseItem">使用</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // 根据物品获取品质颜色
    getItemQualityColor(item) {
        // 如果物品有明确的品质属性，使用品质颜色
        const quality = item.quality;
        if (quality) {
            if (this.engine && this.engine.colorManager) {
                return this.engine.colorManager.getQualityColor(quality);
            }
            // 备用颜色映射
            switch (quality) {
                case 'epic':
                    return '#9933ff'; // 史诗
                case 'rare':
                    return '#3366ff'; // 稀有
                case 'uncommon':
                    return '#33cc33'; // 优秀
                case 'common':
                default:
                    return '#999999'; // 普通
            }
        }
        
        // 根据物品类型设置颜色
        if (item.type === 'consumable') {
            // 消耗品类物品根据子类型设置颜色
            switch (item.subType) {
                case 'pill':
                    return '#ff9900'; // 丹药类 - 橙色
                case 'material':
                    return '#00ccff'; // 材料类 - 蓝色
                default:
                    return '#66cc66'; // 其他消耗品 - 绿色
            }
        } else if (item.type === 'special') {
            return '#ff66ff'; // 特殊物品 - 紫色
        } else if (item.type === 'resource') {
            return '#ffcc00'; // 资源类 - 金色
        }
        
        // 默认颜色
        return '#999999';
    }

    // 将十六进制颜色转换为RGB
    hexToRgb(hex) {
        // 移除#号
        hex = hex.replace('#', '');
        
        // 转换为RGB
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        
        return `${r}, ${g}, ${b}`;
    }

    // 获取层次名称，统一显示格式
    getLayerName(layer) {
        if (layer === 1) {
            return '1层';
        } else {
            return `${layer}层`;
        }
    }

    // 显示物品详情弹窗
    showItemDetail(item) {
        const modal = document.getElementById('itemDetailModal');
        const itemIcon = document.getElementById('modalItemIcon');
        const itemName = document.getElementById('modalItemName');
        const itemDesc = document.getElementById('modalItemDesc');
        const itemCount = document.getElementById('modalItemCount');
        const itemPrice = document.getElementById('modalItemPrice');
        
        // 设置弹窗内容
        itemIcon.innerHTML = this.getItemIcon(item.id);
        itemName.textContent = item.name;
        itemDesc.textContent = item.description || '无描述';
        itemCount.textContent = item.quantity || item.count || 1;
        
        // 计算出售价格（这里简化处理，实际应该根据物品类型和品质计算）
        const sellPrice = this.calculateSellPrice(item);
        itemPrice.textContent = sellPrice;
        
        // 显示弹窗
        modal.style.display = 'flex';
        
        // 绑定按钮事件
        document.querySelector('.close-modal').onclick = () => {
            modal.style.display = 'none';
        };
        
        document.getElementById('btnSellItem').onclick = () => {
            this.sellItem(item, sellPrice);
            modal.style.display = 'none';
        };
        
        document.getElementById('btnUseItem').onclick = () => {
            this.useItem(item);
            modal.style.display = 'none';
        };
    }

    // 计算物品出售价格
    calculateSellPrice(item) {
        // 这里可以根据物品类型、品质等因素计算出售价格
        // 暂时返回一个基础价格
        switch (item.type) {
            case 'material':
                return 10;
            case 'pill':
                return 50;
            case 'equipment':
                return 100;
            default:
                return 5;
        }
    }

    // 出售物品
    sellItem(item, price) {
        const state = this.engine.state.data;
        const backpackItems = state.backpack.items || [];
        const index = backpackItems.findIndex(i => i.id === item.id);
        
        if (index !== -1) {
            // 确保currency对象存在
            if (!state.currency) {
                state.currency = {
                    spiritStone: 0
                };
            }
            // 增加灵石
            state.currency.spiritStone = (state.currency.spiritStone || 0) + price;
            // 减少物品数量
            const currentItem = backpackItems[index];
            if (currentItem.quantity > 1) {
                currentItem.quantity--;
            } else {
                backpackItems.splice(index, 1);
            }
            // 保存状态
            this.engine.state.save();
            // 刷新界面
            this.switchPage('inventory');
            // 显示通知
            this.showNotification(`出售 ${item.name} 获得 ${price} 灵石`, 'success');
        }
    }

    // 使用物品
    useItem(item) {
        // 确保背包数据结构存在
        if (!this.engine.state.data.backpack || !this.engine.state.data.backpack.items) {
            this.showNotification('背包系统未初始化', 'error');
            return;
        }
        
        // 找到背包中该物品的索引
        const itemIndex = this.engine.state.data.backpack.items.findIndex(i => i.id === item.id);
        if (itemIndex === -1) {
            this.showNotification('物品不存在于背包中', 'error');
            return;
        }
        
        // 减少物品数量
        const currentItem = this.engine.state.data.backpack.items[itemIndex];
        if (currentItem.count !== undefined) {
            currentItem.count--;
            // 同时更新 quantity 属性，确保两者保持一致
            currentItem.quantity = currentItem.count;
            if (currentItem.count <= 0) {
                this.engine.state.data.backpack.items.splice(itemIndex, 1);
            }
        } else if (currentItem.quantity !== undefined) {
            currentItem.quantity--;
            // 同时更新 count 属性，确保两者保持一致
            currentItem.count = currentItem.quantity;
            if (currentItem.quantity <= 0) {
                this.engine.state.data.backpack.items.splice(itemIndex, 1);
            }
        }
        
        // 保存游戏状态
        this.engine.state.save();
        
        // 根据物品类型跳转到对应的功能界面
        switch (item.type) {
            case 'material':
                if (item.name.includes('强化石')) {
                    // 跳转到装备强化界面
                    this.switchPage('equipment');
                } else {
                    this.showNotification(`使用了 ${item.name}`, 'info');
                }
                break;
            case 'pill':
                // 使用丹药，增加修为或其他属性
                this.showNotification(`使用了 ${item.name}`, 'info');
                break;
            default:
                this.showNotification(`使用了 ${item.name}`, 'info');
        }
        
        // 刷新背包页面
        this.switchPage('inventory');
    }

    /**
     * 获取物品图标
     * @param {string} itemId - 物品ID
     * @returns {string} 图标字符串
     */
    getItemIcon(itemId) {
        const iconMap = {
            // 货币类 - 中文
            '铜币': '🪙',
            '银币': '🥈',
            '金币': '🥇',
            '仙玉': '💎',
            '神石': '🌟',
            '混沌石': '🔮',
            // 货币类 - 英文ID
            '铜币': '🪙',
            '银币': '🥈',
            '金币': '🥇',
            '仙玉': '💎',
            '神石': '🌟',
            '混沌石': '🔮',
            
            // 材料类 - 中文
            '草药': '🌿',
            '灵草': '🌱',
            '仙草': '🌸',
            '圣药': '🏵️',
            '海鲜': '🦐',
            '兽皮': '🐺',
            '山珍': '🍄',
            '虾壳': '🦞',
            '虎皮': '🐅',
            '虎骨': '🦴',
            '龙鳞': '🐉',
            '海珠': '🔵',
            '妖丹': '💊',
            '生命之种': '🌰',
            '木之精华': '🌲',
            '灵木': '🪵',
            '森林之心': '❤️',
            '木材': '🪵',
            // 材料类 - 英文ID
            '草药': '🌿',
            '灵草': '🌱',
            '仙草': '🌸',
            '圣药': '🏵️',
            '海鲜': '🦐',
            '兽皮': '🐺',
            '山珍': '🍄',
            '虾壳': '🦞',
            '虎皮': '🐅',
            '虎骨': '🦴',
            '龙鳞': '🐉',
            '海珠': '🔵',
            '妖丹': '💊',
            '生命之种': '🌰',
            '木之精华': '🌲',
            '灵木': '🪵',
            '森林之心': '❤️',
            '木材': '🪵',
            
            // 装备类 - 中文
            '灵器': '⚔️',
            '法宝': '🔮',
            '仙器': '✨',
            '神器': '🌟',
            '高级法宝': '💫',
            '高级仙器': '🔥',
            '高级神器': '⚡',
            '极品仙器': '💥',
            '极品神器': '🌠',
            '神兵': '🗡️',
            '宝剑': '⚔️',
            '古代兵器': '🛡️',
            '远古神器': '🏆',
            // 装备类 - 英文ID
            '灵器': '⚔️',
            '法宝': '🔮',
            '仙器': '✨',
            '神器': '🌟',
            '高级法宝': '💫',
            '高级仙器': '🔥',
            '高级神器': '⚡',
            '极品仙器': '💥',
            '极品神器': '🌠',
            '神兵': '🗡️',
            '宝剑': '⚔️',
            '古代兵器': '🛡️',
            '远古神器': '🏆',
            
            // 丹药类 - 中文
            '丹药': '💊',
            '高级丹药': '💎',
            // 丹药类 - 英文ID
            '丹药': '💊',
            '高级丹药': '💎',
            
            // 材料类 - 中文
            '材料': '📦',
            '高级材料': '🎁',
            // 材料类 - 英文ID
            '材料': '📦',
            '高级材料': '🎁',
            
            // 佛学类 - 中文
            '佛经': '📿',
            '高级佛经': '🪷',
            '佛经秘录': '📖',
            '佛骨舍利': '🔔',
            '罗汉珠': '📿',
            '舍利': '🔔',
            // 佛学类 - 英文ID
            '佛经': '📿',
            '高级佛经': '🪷',
            '佛经秘录': '📖',
            '佛骨舍利': '🔔',
            '罗汉珠': '📿',
            '舍利': '🔔',
            
            // 武学类 - 中文
            '武学秘籍': '📚',
            '高级武学': '📖',
            '武学圣典': '📜',
            // 武学类 - 英文ID
            '武学秘籍': '📚',
            '高级武学': '📖',
            '武学圣典': '📜',
            
            // 传承类 - 中文
            '传承': '📜',
            '高级传承': '🏆',
            // 传承类 - 英文ID
            '传承': '📜',
            '高级传承': '🏆',
            
            // 古宝类 - 中文
            '古宝': '🏺',
            // 古宝类 - 英文ID
            '古宝': '🏺',
            
            // 灵根类 - 中文
            '灵根': '🌱',
            '高级灵根': '🌿',
            '极品灵根': '🌸',
            // 灵根类 - 英文ID
            '灵根': '🌱',
            '高级灵根': '🌿',
            '极品灵根': '🌸',
            
            // 道果类 - 中文
            '道果': '🍎',
            '高级道果': '🍇',
            '极品道果': '🍒',
            // 道果类 - 英文ID
            '道果': '🍎',
            '高级道果': '🍇',
            '极品道果': '🍒',
            
            // 仙晶类 - 中文
            '仙晶': '💠',
            '高级仙晶': '🔷',
            '极品仙晶': '🔶',
            // 仙晶类 - 英文ID
            '仙晶': '💠',
            '高级仙晶': '🔷',
            '极品仙晶': '🔶',
            
            // 仙位类 - 中文
            '仙位': '👑',
            '高级仙位': '🎭',
            '极品仙位': '🏅',
            // 仙位类 - 英文ID
            '仙位': '👑',
            '高级仙位': '🎭',
            '极品仙位': '🏅',
            
            // 法则类 - 中文
            '法则碎片': '🔮',
            '高级法则碎片': '💎',
            '极品法则碎片': '✨',
            // 法则类 - 英文ID
            '法则碎片': '🔮',
            '高级法则碎片': '💎',
            '极品法则碎片': '✨',
            
            // 混沌类 - 中文
            '混沌灵宝': '🌌',
            '高级混沌灵宝': '🌠',
            '极品混沌灵宝': '💫',
            // 混沌类 - 英文ID
            '混沌灵宝': '🌌',
            '高级混沌灵宝': '🌠',
            '极品混沌灵宝': '💫',
            
            // 大道类 - 中文
            '大道碎片': '🔮',
            '高级大道碎片': '💎',
            '极品大道碎片': '✨',
            // 大道类 - 英文ID
            '大道碎片': '🔮',
            '高级大道碎片': '💎',
            '极品大道碎片': '✨',
            
            // 创世类 - 中文
            '创世之力': '⚡',
            '高级创世之力': '🌟',
            '极品创世之力': '💥',
            // 创世类 - 英文ID
            '创世之力': '⚡',
            '高级创世之力': '🌟',
            '极品创世之力': '💥',
            
            // 默认图标
            'herb': '🌿',
            'coin': '💰',
            'spirit_stone': '💎',
            'immortal_stone': '✨',
            'breakthrough_pill': '💊',
            'recovery_pill': '🟢',
            'strength_pill': '🔴'
        };
        return iconMap[itemId] || '📦';
    }

    /**
     * 绑定背包页面事件
     */
    bindInventoryEvents() {
        // 绑定返回按钮事件
        document.querySelector('.btn-back-home').addEventListener('click', () => {
            this.switchPage('home');
        });
        
        // 绑定物品点击事件
        const itemSlots = document.querySelectorAll('.item-slot.filled');
        const backpackItems = this.engine.state.data.backpack.items || [];
        let itemIndex = 0;
        
        itemSlots.forEach((slot) => {
            // 获取该格子对应的物品索引（跳过空格子）
            while (itemIndex < backpackItems.length && !backpackItems[itemIndex]) {
                itemIndex++;
            }
            
            if (itemIndex < backpackItems.length) {
                const item = backpackItems[itemIndex];
                slot.addEventListener('click', () => {
                    this.showItemDetail(item);
                });
                itemIndex++;
            }
        });
        
        // 启动倒计时定时器
        this.startBackpackCountdown();
    }

    // 启动背包格子解锁倒计时
    startBackpackCountdown() {
        const updateCountdown = () => {
            const state = this.engine.state.data;
            const backpack = state.backpack || {
                totalSlots: 40,
                unlockedSlots: 10,
                nextUnlockSlot: 11,
                unlockStartTime: Date.now(),
                unlockRequiredTime: 300000,
                lastOnlineTime: Date.now()
            };
            
            const unlockedSlots = backpack.unlockedSlots || 10;
            const totalSlots = backpack.totalSlots || 40;
            
            if (unlockedSlots < totalSlots) {
                const currentTime = Date.now();
                const elapsedTime = currentTime - (backpack.unlockStartTime || currentTime);
                const unlockTimeLeft = Math.max(0, (backpack.unlockRequiredTime || 300000) - elapsedTime);
                
                if (unlockTimeLeft <= 0) {
                    // 解锁新格子
                    backpack.unlockedSlots = unlockedSlots + 1;
                    backpack.nextUnlockSlot = unlockedSlots + 2;
                    backpack.unlockStartTime = currentTime;
                    // 下一格解锁时间增加50%
                    backpack.unlockRequiredTime = Math.floor((backpack.unlockRequiredTime || 300000) * 1.5);
                    this.engine.state.save();
                    
                    // 只有当当前页面是背包页面时才刷新界面
                    if (this.currentPage === 'inventory') {
                        this.switchPage('inventory');
                    }
                    
                    this.showNotification(`解锁了第 ${backpack.unlockedSlots} 个背包格子！`, 'success');
                } else {
                    // 实时更新倒计时显示
                    const countdownElements = document.querySelectorAll('.item-slot.unlocking .countdown');
                    countdownElements.forEach(element => {
                        const minutes = Math.floor(unlockTimeLeft / 60000);
                        const seconds = Math.floor((unlockTimeLeft % 60000) / 1000);
                        element.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                    });
                }
            }
        };
        
        // 每秒更新一次倒计时
        setInterval(updateCountdown, 1000);
        
        // 立即执行一次，确保初始状态正确
        updateCountdown();
    }

    /**
     * 获取角色信息页面HTML
     * @returns {string} HTML字符串
     */
    getCharacterPageHTML() {
        console.log('getCharacterPageHTML - start');
        console.log('getCharacterPageHTML - this.engine:', this.engine);
        console.log('getCharacterPageHTML - this.engine.state:', this.engine.state);
        
        const state = this.engine.state.data || {};
        console.log('getCharacterPageHTML - state:', state);
        
        const character = state.character || {
            attributes: {
                rootBone: 10,
                comprehension: 10,
                luck: 10,
                agility: 10
            },
            freePoints: 0
        };
        console.log('getCharacterPageHTML - character:', character);

        // 计算衍生属性
        const derivedAttributes = this.calculateDerivedAttributes(character.attributes);
        console.log('getCharacterPageHTML - derivedAttributes:', derivedAttributes);

        // 获取跟脚信息
        console.log('getCharacterPageHTML - this.engine.genJiaoSystem:', this.engine.genJiaoSystem);
        const genJiao = this.engine.genJiaoSystem.getCurrentGenJiao();
        console.log('getCharacterPageHTML - genJiao:', genJiao);
        // 按修炼效率从高到低排序跟脚品质
        const sortedQualities = [...GameConfig.GENJIAO.qualities].sort((a, b) => b.efficiency - a.efficiency);

        const html = `
            <div class="page character-page">
                <div class="page-header">
                    <button class="btn-back-home">← 返回</button>
                    <h2>角色信息</h2>
                </div>

                <!-- 标签切换 -->
                <div class="character-tabs">
                    <button class="tab-btn active" data-tab="info">角色</button>
                    <button class="tab-btn" data-tab="genjiao">跟脚</button>
                </div>

                <!-- 标签内容 -->
                <div class="tab-content active">
                    <!-- 个人信息标签 -->
                    <div class="tab-pane active" id="tab-info">
                        <div class="character-content">
                            <!-- 用户信息 -->
                            <div class="user-info-section">
                                <div class="username-row">
                                    <span class="username-display">${state.player?.name || '修仙者'}</span>
                                    <button class="btn btn-secondary btn-rename">改名</button>
                                </div>
                                <div class="id-vip-row">
                                    <span class="user-id-display">ID: ${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}</span>
                                    <div class="vip-section">
                                        <span class="vip-badge ${state.player?.vipLevel >= 1 ? 'vip-active' : 'vip-inactive'}">VIP ${state.player?.vipLevel || 0}</span>
                                        <span class="vip-upgrade-link">升级</span>
                                    </div>
                                </div>
                            </div>

                            <!-- 属性信息 -->
                            <div class="attributes-section">
                                    <div class="attribute-row">
                                        <div class="attribute-cell">
                                            <span class="attr-label">生命力：</span>
                                            <span class="attr-value" data-attr="hp">${Math.floor(derivedAttributes.hp)}</span>
                                        </div>
                                        <div class="attribute-cell">
                                            <span class="attr-label">法力：</span>
                                            <span class="attr-value" data-attr="mp">${Math.floor(derivedAttributes.mp)}</span>
                                        </div>
                                    </div>
                                    <div class="attribute-row">
                                        <div class="attribute-cell">
                                            <span class="attr-label">攻击：</span>
                                            <span class="attr-value" data-attr="attack">${Math.floor(derivedAttributes.attack)}</span>
                                        </div>
                                        <div class="attribute-cell">
                                            <span class="attr-label">防御：</span>
                                            <span class="attr-value" data-attr="defense">${Math.floor(derivedAttributes.defense)}</span>
                                        </div>
                                    </div>
                                    <div class="attribute-row">
                                        <div class="attribute-cell">
                                            <span class="attr-label">神识：</span>
                                            <span class="attr-value" data-attr="spirit">${Math.floor(derivedAttributes.spirit)}</span>
                                        </div>
                                        <div class="attribute-cell">
                                            <span class="attr-label">暴击率：</span>
                                            <span class="attr-value" data-attr="critRate">${derivedAttributes.critRate.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                    <div class="attribute-row">
                                        <div class="attribute-cell">
                                            <span class="attr-label">闪避率：</span>
                                            <span class="attr-value" data-attr="dodgeRate">${derivedAttributes.dodgeRate.toFixed(1)}%</span>
                                        </div>
                                        <div class="attribute-cell">
                                            <span class="attr-label">伤害减免：</span>
                                            <span class="attr-value" data-attr="damageReduction">${derivedAttributes.damageReduction.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                    <div class="attribute-row">
                                        <div class="attribute-cell">
                                            <span class="attr-label">破防：</span>
                                            <span class="attr-value" data-attr="armorPenetration">${Math.floor(derivedAttributes.armorPenetration)}</span>
                                        </div>
                                        <div class="attribute-cell">
                                            <span class="attr-label">雷劫抗性：</span>
                                            <span class="attr-value" data-attr="thunderResistance">${Math.floor(derivedAttributes.thunderResistance)}</span>
                                        </div>
                                    </div>
                            </div>

                            <!-- 属性分配 -->
                            <div class="attribute-allocation-section">
                                <div class="allocation-header">
                                    <h3>属性分配</h3>
                                    <div class="free-points">
                                        <span class="free-points-label">可分配属性：</span>
                                        <span class="free-points-value">${character.freePoints}</span>
                                    </div>
                                </div>
                                <div class="allocation-grid">
                                    <div class="allocation-item" data-attr="rootBone">
                                        <span class="allocation-label">根骨：</span>
                                        <div class="allocation-controls">
                                            <button class="btn btn-minus" data-attr="rootBone">-</button>
                                            <span class="allocation-value">${character.attributes.rootBone}</span>
                                            <button class="btn btn-plus" data-attr="rootBone">+</button>
                                        </div>
                                    </div>
                                    <div class="allocation-item" data-attr="comprehension">
                                        <span class="allocation-label">悟性：</span>
                                        <div class="allocation-controls">
                                            <button class="btn btn-minus" data-attr="comprehension">-</button>
                                            <span class="allocation-value">${character.attributes.comprehension}</span>
                                            <button class="btn btn-plus" data-attr="comprehension">+</button>
                                        </div>
                                    </div>
                                    <div class="allocation-item" data-attr="luck">
                                        <span class="allocation-label">气运：</span>
                                        <div class="allocation-controls">
                                            <button class="btn btn-minus" data-attr="luck">-</button>
                                            <span class="allocation-value">${character.attributes.luck}</span>
                                            <button class="btn btn-plus" data-attr="luck">+</button>
                                        </div>
                                    </div>
                                    <div class="allocation-item" data-attr="agility">
                                        <span class="allocation-label">身法：</span>
                                        <div class="allocation-controls">
                                            <button class="btn btn-minus" data-attr="agility">-</button>
                                            <span class="allocation-value">${character.attributes.agility}</span>
                                            <button class="btn btn-plus" data-attr="agility">+</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 跟脚标签 -->
                    <div class="tab-pane" id="tab-genjiao">
                        <div class="genjiao-content">
                            <div class="current-genjiao">
                                <div class="genjiao-name" style="color: ${genJiao.color}">
                                    ${genJiao.name}
                                </div>
                                <div class="genjiao-stats">
                                    <div class="stat-item">
                                        <span class="stat-label">修炼效率：</span>
                                        <span class="stat-value">${(genJiao.efficiency * 100).toFixed(0)}%</span>
                                    </div>
                                    <div class="stat-item">
                                        <span class="stat-label">突破加成：</span>
                                        <span class="stat-value">${(genJiao.breakthroughBonus * 100).toFixed(0)}%</span>
                                    </div>
                                </div>
                                <div class="genjiao-cost-section">
                                    <div class="cost-item">消耗：灵石 ${GameConfig.GENJIAO.refresh.normal.cost}</div>
                                </div>
                                <button class="btn btn-primary btn-refresh-genjiao">刷新跟脚</button>
                            </div>
                            <!-- 跟脚排名 -->
                            <div class="genjiao-ranking">
                                <div class="ranking-title">跟脚排名：跟脚越好，加成效果越高。</div>
                                <div class="ranking-list">
                                    ${sortedQualities.map(q => `
                                        <div class="ranking-item" style="background-color: ${q.color}">
                                            ${q.name}
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        console.log('getCharacterPageHTML - generated HTML length:', html.length);
        return html;
    }

    /**
     * 绑定角色信息页面事件
     */
    bindCharacterEvents() {
        console.log('bindCharacterEvents - start');
        
        // 标签切换事件
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                console.log('bindCharacterEvents - tab clicked:', tab);
                
                // 移除所有标签的active类
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
                
                // 添加当前标签的active类
                e.target.classList.add('active');
                const targetPane = document.getElementById(`tab-${tab}`);
                console.log('bindCharacterEvents - targetPane:', targetPane);
                if (targetPane) {
                    targetPane.classList.add('active');
                }
            });
        });

        // 加减按钮事件
        document.querySelectorAll('.btn-minus, .btn-plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const attr = e.target.dataset.attr;
                const isPlus = e.target.classList.contains('btn-plus');
                const result = this.engine.updateCharacterAttribute(attr, isPlus);
                
                if (result.success) {
                    // 只更新相关内容，不刷新整个页面
                    const character = this.engine.state.data.character;
                    
                    // 更新自由点数
                    const freePointsElement = document.querySelector('.free-points-value');
                    if (freePointsElement) {
                        freePointsElement.textContent = character.freePoints;
                    }
                    
                    // 更新属性值
                    const attributeValueElement = document.querySelector(`.allocation-item[data-attr="${attr}"] .allocation-value`);
                    if (attributeValueElement) {
                        attributeValueElement.textContent = character.attributes[attr];
                    }
                    
                    // 更新衍生属性显示
                    const derivedAttributes = this.calculateDerivedAttributes(character.attributes);
                    const derivedElements = document.querySelectorAll('.attr-value');
                    derivedElements.forEach(element => {
                        const attrName = element.dataset.attr;
                        if (derivedAttributes[attrName] !== undefined) {
                            // 保留原有的格式，如百分比
                            const originalText = element.textContent;
                            if (originalText.includes('%')) {
                                element.textContent = `${derivedAttributes[attrName].toFixed(1)}%`;
                            } else {
                                element.textContent = Math.floor(derivedAttributes[attrName]);
                            }
                        }
                    });
                } else {
                    this.showNotification(result.message, 'error');
                }
            });
        });

        // 改名按钮
        const btnRename = document.querySelector('.btn-rename');
        if (btnRename) {
            btnRename.addEventListener('click', () => {
                const newName = prompt('请输入新昵称（最长8字）：');
                if (newName && newName.length <= 8) {
                    const result = this.engine.updatePlayerName(newName);
                    if (result.success) {
                        this.showNotification('改名成功！', 'success');
                        this.switchPage('character');
                    } else {
                        this.showNotification(result.message, 'error');
                    }
                } else if (newName && newName.length > 8) {
                    this.showNotification('昵称长度不能超过8字！', 'error');
                }
            });
        }

        // VIP升级按钮
        const vipUpgradeLink = document.querySelector('.vip-upgrade-link');
        if (vipUpgradeLink) {
            vipUpgradeLink.addEventListener('click', () => {
                this.showNotification('VIP系统暂未开放', 'info');
            });
        }

        // 刷新跟脚按钮
        const btnRefreshGenjiao = document.querySelector('.btn-refresh-genjiao');
        if (btnRefreshGenjiao) {
            btnRefreshGenjiao.addEventListener('click', () => {
                // 默认使用普通刷新
                const result = this.engine.genJiaoSystem.refreshGenJiao('normal');
                
                if (result.success) {
                    this.showNotification(result.message, result.improved ? 'success' : 'info');
                    // 只刷新跟脚信息，不离开当前标签
                    const genJiao = this.engine.genJiaoSystem.getCurrentGenJiao();
                    const qualities = GameConfig.GENJIAO.qualities;
                    const sortedQualities = [...qualities].sort((a, b) => b.efficiency - a.efficiency);
                    
                    // 更新跟脚信息
                    const currentGenjiaoElement = document.querySelector('.current-genjiao');
                    if (currentGenjiaoElement) {
                        currentGenjiaoElement.innerHTML = `
                            <div class="genjiao-name" style="color: ${genJiao.color}">
                                ${genJiao.name}
                            </div>
                            <div class="genjiao-stats">
                                <div class="stat-item">
                                    <span class="stat-label">修炼效率：</span>
                                    <span class="stat-value">${(genJiao.efficiency * 100).toFixed(0)}%</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">突破加成：</span>
                                    <span class="stat-value">${(genJiao.breakthroughBonus * 100).toFixed(0)}%</span>
                                </div>
                            </div>
                            <div class="genjiao-cost-section">
                                <div class="cost-item">消耗：灵石 ${GameConfig.GENJIAO.refresh.normal.cost}</div>
                            </div>
                            <button class="btn btn-primary btn-refresh-genjiao">刷新跟脚</button>
                        `;
                        
                        // 重新绑定刷新按钮事件
                        this.bindCharacterEvents();
                    }
                } else {
                    this.showNotification(result.message, 'error');
                }
            });
        }
        
        console.log('bindCharacterEvents - end');
    }

    /**
     * 计算衍生属性
     * @param {Object} attributes - 基础属性
     * @returns {Object} 衍生属性
     */
    calculateDerivedAttributes(attributes) {
        const { rootBone, comprehension, luck, agility } = attributes;
        
        // 获取功法加成
        const skillBonus = this.engine.skillSystem.calculateTotalBonus();
        
        // 获取装备加成
        const equipmentBonus = this.engine.equipmentSystem.calculateTotalBonus();
        
        // 获取灵宠加成
        const petBonus = this.engine.petSystem ? this.engine.petSystem.calculateTotalAttributes() : { attack: 0, defense: 0, hp: 0, speed: 0 };
        
        // 应用所有加成
        const finalRootBone = rootBone + (skillBonus.rootBone || 0) + (equipmentBonus.rootBone || 0);
        const finalAgility = agility + (skillBonus.agility || 0) + (equipmentBonus.agility || 0) + (petBonus.speed || 0);
        const finalComprehension = comprehension + (skillBonus.comprehension || 0) + (equipmentBonus.comprehension || 0);
        const finalAttack = (rootBone * 5 + agility * 3) + (skillBonus.attack || 0) + (equipmentBonus.attack || 0) + (petBonus.attack || 0);
        const finalDefense = (rootBone * 4) + (skillBonus.defense || 0) + (equipmentBonus.defense || 0) + (petBonus.defense || 0);
        const finalSpirit = (comprehension * 10) + (skillBonus.spirit || 0);
        const finalHp = finalRootBone * 100 + (equipmentBonus.hp || 0) + (petBonus.hp || 0);

        return {
            // 生命力 = 根骨 * 100 + 装备加成 + 灵宠加成
            hp: finalHp,
            // 法力 = 根骨 * 100
            mp: finalRootBone * 100,
            // 攻击 = 根骨 * 5 + 身法 * 3 + 功法加成 + 装备加成 + 灵宠加成
            attack: finalAttack,
            // 防御 = 根骨 * 4 + 功法加成 + 装备加成 + 灵宠加成
            defense: finalDefense,
            // 神识 = 悟性 * 10 + 功法加成
            spirit: finalSpirit,
            // 暴击率 = 身法 * 0.5%
            critRate: finalAgility * 0.5,
            // 闪避率 = 身法 * 0.3%
            dodgeRate: finalAgility * 0.3,
            // 伤害减免 = 根骨 * 0.2%
            damageReduction: finalRootBone * 0.2,
            // 破防 = 攻击 * 0.5
            armorPenetration: finalAttack * 0.5,
            // 雷劫抗性 = 根骨 * 2 + 悟性 * 1
            thunderResistance: finalRootBone * 2 + finalComprehension * 1
        };
    }

    // ==================== 功法页 ====================

    /**
     * 获取功法页面HTML
     * @returns {string} HTML字符串
     */
    getSkillsPageHTML() {
        // 安全获取状态数据
        const state = this.engine && this.engine.state && this.engine.state.data || {};
        const skills = state.skills || {
            current: null,
            list: []
        };

        const currentSkill = skills.current;
        const obtainedSkills = this.engine.skillSystem.getLearnedSkills();
        const unobtainedSkills = skills.list && skills.list.filter ? skills.list.filter(skill => !skill.obtained) : [];

        return `
            <div class="page skills-page">
                <div class="page-header">
                    <button class="btn-back-home">← 返回</button>
                    <h2>功法系统</h2>
                </div>

                <div class="skills-content">
                    <!-- 当前参悟的功法 -->
                    <div class="current-skill-section">
                        <h3>当前参悟</h3>
                        ${currentSkill ? `
                            <div class="current-skill-card">
                                <div class="skill-header">
                                    <h4 class="skill-name">${currentSkill.name}</h4>
                                    <span class="skill-rank ${this.getSkillRankClass(currentSkill.rank)}">${this.getSkillRankName(currentSkill.rank)}</span>
                                </div>
                                <div class="skill-proficiency">
                                    <span>熟练度：${this.getSkillProficiencyName(currentSkill.proficiency)}</span>
                                </div>
                                <div class="skill-progress cultivation-progress">
                                    <div class="progress-fill" style="width: ${currentSkill.progress}%"></div>
                                    <span class="progress-text">${currentSkill.proficiency >= 6 ? '已满级' : `经验：${currentSkill.exp}/${currentSkill.nextLevelExp} (${currentSkill.progress.toFixed(1)}%)`}</span>
                                </div>
                                <div class="skill-effects">
                                    <h5>属性加成</h5>
                                    ${this.getSkillEffectsHTML(currentSkill)}
                                </div>
                                <div class="cultivation-countdown" id="skillCultivationCountdown">
                                    参悟倒计时：30s
                                </div>
                                <button class="btn btn-secondary btn-stop-cultivate">停止参悟</button>
                            </div>
                        ` : `
                            <div class="no-skill-message">
                                <p>未选择参悟功法</p>
                                <p>从下方选择一本功法开始参悟</p>
                            </div>
                        `}
                    </div>

                    <!-- 功法列表 -->
                    <div class="skills-list-section">
                        <div class="skills-tabs">
                            <button class="tab-btn active" data-tab="obtained">已获得</button>
                            <button class="tab-btn" data-tab="unobtained">未获得</button>
                        </div>

                        <div class="tab-content active" id="obtained-tab">
                            ${obtainedSkills.length > 0 ? `
                                <div class="skills-grid">
                                    ${obtainedSkills.map(skill => this.getSkillCardHTML(skill, skills.current)).join('')}
                                </div>
                            ` : `
                                <div class="empty-message">
                                    <p>暂无已获得的功法</p>
                                </div>
                            `}
                        </div>

                        <div class="tab-content" id="unobtained-tab">
                            ${unobtainedSkills.length > 0 ? `
                                <div class="skills-grid">
                                    ${unobtainedSkills.map(skill => this.getSkillCardHTML(skill, skills.current)).join('')}
                                </div>
                            ` : `
                                <div class="empty-message">
                                    <p>暂无未获得的功法</p>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 获取功法卡片HTML
     * @param {Object} skill - 功法对象
     * @param {Object} currentSkill - 当前正在参悟的功法
     * @returns {string} HTML字符串
     */
    getSkillCardHTML(skill, currentSkill) {
        const isCurrent = currentSkill && currentSkill.id === skill.id;
        const canCultivate = this.engine.skillSystem.canCultivateSkill(skill);

        return `
            <div class="skill-card ${skill.obtained ? 'obtained' : 'unobtained'} ${isCurrent ? 'current' : ''}">
                <div class="skill-card-header">
                    <h4 class="skill-card-name">${skill.name}</h4>
                    <span class="skill-card-rank ${this.getSkillRankClass(skill.rank)}">${this.getSkillRankName(skill.rank)}</span>
                </div>
                ${skill.obtained ? `
                    <div class="skill-card-proficiency">
                        <span>熟练度：${this.getSkillProficiencyName(skill.proficiency)}</span>
                    </div>
                    <div class="skill-card-effects">
                        ${this.getSkillEffectsHTML(skill)}
                    </div>
                ` : `
                    <div class="skill-card-requirement">
                        <span>需求境界：${this.getRealmNameByLevel(skill.requiredRealm)}</span>
                    </div>
                `}
                <div class="skill-card-actions">
                    ${skill.obtained ? (
                        skill.proficiency >= 6 ? `
                            <span class="skill-maxed-badge">已圆满</span>
                        ` : (
                            isCurrent ? `
                                <button class="btn btn-secondary btn-stop-cultivate" data-skill-id="${skill.id}">停止参悟</button>
                            ` : `
                                <button class="btn btn-primary btn-start-cultivate" data-skill-id="${skill.id}">开始参悟</button>
                            `
                        )
                    ) : (
                        canCultivate ? `
                            <button class="btn btn-primary btn-obtain-skill" data-skill-id="${skill.id}">获取</button>
                        ` : `
                            <button class="btn btn-secondary disabled" disabled>境界不足</button>
                        `
                    )}
                </div>
            </div>
        `;
    }

    /**
     * 获取功法效果HTML
     * @param {Object} skill - 功法对象
     * @returns {string} HTML字符串
     */
    getSkillEffectsHTML(skill) {
        const effects = skill.effects || {};
        const effectItems = [];

        if (effects.rootBone) effectItems.push(`根骨 +${effects.rootBone}`);
        if (effects.agility) effectItems.push(`身法 +${effects.agility}`);
        if (effects.comprehension) effectItems.push(`悟性 +${effects.comprehension}`);
        if (effects.attack) effectItems.push(`攻击 +${effects.attack}`);
        if (effects.defense) effectItems.push(`防御 +${effects.defense}`);
        if (effects.spirit) effectItems.push(`神识 +${effects.spirit}`);
        if (effects.cultivationSpeed) effectItems.push(`修炼速度 +${effects.cultivationSpeed}%`);
        if (effects.alchemySuccess) effectItems.push(`炼丹成功率 +${effects.alchemySuccess}%`);
        if (effects.smithingSuccess) effectItems.push(`炼器成功率 +${effects.smithingSuccess}%`);

        return effectItems.length > 0 ? `
            <div class="effects-list">
                ${effectItems.map(effect => `<span class="effect-item">${effect}</span>`).join('')}
            </div>
        ` : `<p>无属性加成</p>`;
    }

    /**
     * 获取功法品阶类名
     * @param {number} rank - 品阶等级
     * @returns {string} 类名
     */
    getSkillRankClass(rank) {
        const classes = ['rank-none', 'rank-normal', 'rank-yellow', 'rank-mystic', 'rank-earth', 'rank-heaven', 'rank-chaos'];
        return classes[Math.min(rank, classes.length - 1)];
    }

    /**
     * 获取功法品阶名称
     * @param {number} rank - 品阶等级
     * @returns {string} 品阶名称
     */
    getSkillRankName(rank) {
        const names = ['不入流', '凡级', '黄级', '玄级', '地级', '天级', '混沌级'];
        return names[Math.min(rank, names.length - 1)];
    }

    /**
     * 获取功法熟练度名称
     * @param {number} proficiency - 熟练度等级
     * @returns {string} 熟练度名称
     */
    getSkillProficiencyName(proficiency) {
        const names = ['入门', '生疏', '熟练', '精通', '小成', '大成', '圆满'];
        return names[Math.min(proficiency, names.length - 1)];
    }

    /**
     * 根据境界等级获取境界名称
     * @param {number} level - 境界等级
     * @returns {string} 境界名称
     */
    getRealmNameByLevel(level) {
        const realmConfig = GameConfig.REALM.realms[level];
        return realmConfig ? realmConfig.name : '未知';
    }

    /**
     * 绑定功法页面事件
     */
    bindSkillsEvents() {
        // 标签切换
        document.querySelectorAll('.skills-tabs .tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                
                // 更新标签状态
                document.querySelectorAll('.skills-tabs .tab-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                
                // 更新内容显示
                document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
                document.getElementById(`${tab}-tab`).classList.add('active');
            });
        });

        // 开始参悟
        document.querySelectorAll('.btn-start-cultivate').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const skillId = e.target.dataset.skillId;
                const result = this.engine.skillSystem.startCultivateSkill(skillId);
                
                if (result.success) {
                    this.showNotification(result.message, 'success');
                    // 刷新页面
                    this.switchPage('skills');
                } else {
                    this.showNotification(result.message, 'error');
                }
            });
        });

        // 停止参悟
        document.querySelectorAll('.btn-stop-cultivate').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const skillId = e.target.dataset.skillId;
                const result = this.engine.skillSystem.stopCultivateSkill();
                
                if (result.success) {
                    this.showNotification(result.message, 'success');
                    // 刷新页面
                    this.switchPage('skills');
                } else {
                    this.showNotification(result.message, 'error');
                }
            });
        });

        // 获取功法
        document.querySelectorAll('.btn-obtain-skill').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const skillId = e.target.dataset.skillId;
                const result = this.engine.skillSystem.obtainSkill(skillId);
                
                if (result.success) {
                    this.showNotification(result.message, 'success');
                    // 刷新页面
                    this.switchPage('skills');
                } else {
                    this.showNotification(result.message, 'error');
                }
            });
        });
    }

    // ==================== 秘境页 ====================

    getSecretRealmPageHTML() {
        const state = this.engine.state.data;
        const config = GameConfig.SECRET_REALM_CONFIG;
        const remaining = config.dailyLimit - state.secretRealm.dailyExplores;

        return `
            <div class="page secret-realm-page">
                <div class="page-header">
                    <button class="btn-back-home">← 返回</button>
                    <h2>秘境探索</h2>
                </div>

                <div class="realm-info-panel">
                    <div class="current-layer">
                        <span class="layer-label">当前层数</span>
                        <span class="layer-value">${state.secretRealm.currentLayer}</span>
                    </div>
                    <div class="explore-count">
                        <span class="count-label">今日剩余次数</span>
                        <span class="count-value">${remaining}/${config.dailyLimit}</span>
                    </div>
                </div>

                <div class="explore-actions">
                    <button class="btn btn-primary btn-explore" id="btn-explore" ${remaining <= 0 ? 'disabled' : ''}>
                        探索一次 (${config.costPerExplore}灵石)
                    </button>
                    <button class="btn btn-secondary btn-explore-batch" id="btn-explore-batch" ${remaining <= 0 ? 'disabled' : ''}>
                        探索十次
                    </button>
                </div>

                <div class="explore-log" id="explore-log">
                    <div class="log-item">点击探索开始秘境之旅...</div>
                </div>
            </div>
        `;
    }

    bindSecretRealmEvents() {
        const btnExplore = document.getElementById('btn-explore');
        if (btnExplore) {
            btnExplore.addEventListener('click', () => {
                const result = this.engine.exploreSecretRealm();
                this.addExploreLog(result.message);
                this.updateResourceDisplay();
            });
        }
    }

    addExploreLog(message) {
        const logContainer = document.getElementById('explore-log');
        if (logContainer) {
            const logItem = document.createElement('div');
            logItem.className = 'log-item';
            logItem.textContent = message;
            logContainer.insertBefore(logItem, logContainer.firstChild);
        }
    }

    // ==================== 宗门页 ====================

    getSectPageHTML() {
        const currentSect = this.engine.sectSystem.getCurrentSect();
        const memberLevel = this.engine.sectSystem.getCurrentMemberLevel();
        const contribution = this.engine.state.data.sect.contribution;
        
        if (!currentSect) {
            const sects = this.engine.sectSystem.getSects();
            return `
                <div class="page sect-page">
                    <div class="page-header">
                        <button class="btn-back-home">← 返回</button>
                        <h2>宗门</h2>
                    </div>
                    <div class="sect-content">
                        <h3>选择宗门</h3>
                        <p>达到金丹期后可以加入宗门，选择一个适合你的宗门吧！</p>
                        <div class="sect-list">
                            ${sects.map(sect => `
                                <div class="sect-card">
                                    <h4>${sect.name}</h4>
                                    <p>${sect.description}</p>
                                    <div class="sect-skills">
                                        <h5>宗门秘籍:</h5>
                                        <ul>
                                            ${sect.uniqueSkills.map(skill => `<li>${skill.name}: ${skill.description}</li>`).join('')}
                                        </ul>
                                    </div>
                                    <button class="btn btn-primary join-sect-btn" data-sect-id="${sect.id}">加入</button>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }
        
        return `
            <div class="page sect-page">
                <div class="page-header">
                    <button class="btn-back-home">← 返回</button>
                    <h2>${currentSect.name}</h2>
                </div>
                <div class="sect-content">
                    <div class="sect-info">
                        <div class="info-item">
                            <span class="info-label">身份:</span>
                            <span class="info-value">${memberLevel.name}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">贡献点:</span>
                            <span class="info-value">${contribution}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">今日任务:</span>
                            <span class="info-value">${this.engine.state.data.sect.dailyTasksCompleted}/${memberLevel.maxTasks}</span>
                        </div>
                    </div>
                    
                    <div class="sect-buildings">
                        <div class="building-tabs">
                            <button class="building-tab active" data-tab="task_hall">任务殿</button>
                            <button class="building-tab" data-tab="scripture_hall">藏经阁</button>
                            <button class="building-tab" data-tab="treasure_hall">珍宝阁</button>
                            <button class="building-tab" data-tab="spirit_array">聚灵阵</button>
                            <button class="building-tab" data-tab="alchemy_hall">丹器阁</button>
                        </div>
                        
                        <div class="building-content active" id="task_hall-content">
                            ${this.getTaskHallHTML()}
                        </div>
                        <div class="building-content" id="scripture_hall-content">
                            ${this.getScriptureHallHTML()}
                        </div>
                        <div class="building-content" id="treasure_hall-content">
                            ${this.getTreasureHallHTML()}
                        </div>
                        <div class="building-content" id="spirit_array-content">
                            ${this.getSpiritArrayHTML()}
                        </div>
                        <div class="building-content" id="alchemy_hall-content">
                            ${this.getAlchemyHallHTML()}
                        </div>
                    </div>
                    
                    <div class="sect-actions">
                        <button class="btn btn-danger leave-sect-btn">离开宗门</button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 获取任务殿HTML
     * @returns {string} HTML字符串
     */
    getTaskHallHTML() {
        const tasks = this.engine.sectSystem.getTasks();
        return `
            <div class="task-hall">
                <h3>任务殿</h3>
                <p>完成任务获得宗门贡献点</p>
                <div class="task-list">
                    ${tasks.map(task => `
                        <div class="task-card">
                            <h4>${task.name}</h4>
                            <p>${task.description}</p>
                            <div class="task-info">
                                <span class="task-difficulty">难度: ${task.difficulty === 'low' ? '低' : task.difficulty === 'medium' ? '中' : task.difficulty === 'high' ? '高' : '极高'}</span>
                                <span class="task-reward">奖励: ${task.reward}贡献点</span>
                            </div>
                            <button class="btn btn-primary complete-task-btn" data-task-id="${task.id}">完成</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 获取藏经阁HTML
     * @returns {string} HTML字符串
     */
    getScriptureHallHTML() {
        const skills = this.engine.sectSystem.getScriptureHallSkills();
        return `
            <div class="scripture-hall">
                <h3>藏经阁</h3>
                <p>消耗贡献点学习功法</p>
                <div class="skill-list">
                    ${skills.map(skill => `
                        <div class="skill-card">
                            <h4>${skill.name}</h4>
                            <p>${skill.description}</p>
                            <div class="skill-price">价格: ${skill.price}贡献点</div>
                            <button class="btn btn-primary buy-skill-btn" data-skill-id="${skill.id}">购买</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 获取珍宝阁HTML
     * @returns {string} HTML字符串
     */
    getTreasureHallHTML() {
        const items = this.engine.sectSystem.getTreasureHallItems();
        return `
            <div class="treasure-hall">
                <h3>珍宝阁</h3>
                <p>消耗贡献点购买物品</p>
                <div class="item-list">
                    ${items.map(item => `
                        <div class="item-card">
                            <h4>${item.name}</h4>
                            <p>${item.description}</p>
                            <div class="item-info">
                                <span class="item-price">价格: ${item.price}贡献点</span>
                                <span class="item-stock">库存: ${item.stock}</span>
                            </div>
                            <button class="btn btn-primary buy-item-btn" data-item-id="${item.id}">购买</button>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 获取聚灵阵HTML
     * @returns {string} HTML字符串
     */
    getSpiritArrayHTML() {
        const building = this.engine.sectSystem.getBuildingInfo('spirit_array');
        const nextLevelCost = building.level < building.maxLevel ? building.upgradeCost[building.level - 1] : 0;
        return `
            <div class="spirit-array">
                <h3>聚灵阵</h3>
                <p>提升修炼效率，捐献灵石提升等级</p>
                <div class="building-info">
                    <div class="info-item">
                        <span class="info-label">当前等级:</span>
                        <span class="info-value">${building.level}/${building.maxLevel}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">修炼效率:</span>
                        <span class="info-value">${(building.baseEfficiency + building.efficiencyPerLevel * (building.level - 1)).toFixed(1)}x</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">总捐献:</span>
                        <span class="info-value">${building.totalDonation}灵石</span>
                    </div>
                    ${building.level < building.maxLevel ? `
                        <div class="info-item">
                            <span class="info-label">升级所需:</span>
                            <span class="info-value">${nextLevelCost}灵石</span>
                        </div>
                    ` : ''}
                </div>
                <div class="donation-form">
                    <h4>捐献</h4>
                    <div class="input-group">
                        <label>灵石数量:</label>
                        <input type="number" id="spirit-stone-amount" min="100" value="100">
                    </div>
                    <button class="btn btn-primary donate-spirit-stone-btn">捐献灵石</button>
                    <div class="input-group">
                        <label>仙晶数量:</label>
                        <input type="number" id="immortal-stone-amount" min="1" value="1">
                    </div>
                    <button class="btn btn-primary donate-immortal-stone-btn">捐献仙晶</button>
                </div>
            </div>
        `;
    }

    /**
     * 获取丹器阁HTML
     * @returns {string} HTML字符串
     */
    getAlchemyHallHTML() {
        const building = this.engine.sectSystem.getBuildingInfo('alchemy_hall');
        const nextLevelCost = building.level < building.maxLevel ? building.upgradeCost[building.level - 1] : 0;
        return `
            <div class="alchemy-hall">
                <h3>丹器阁</h3>
                <p>提升炼丹成功率，捐献灵石提升等级</p>
                <div class="building-info">
                    <div class="info-item">
                        <span class="info-label">当前等级:</span>
                        <span class="info-value">${building.level}/${building.maxLevel}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">炼丹成功率:</span>
                        <span class="info-value">${Math.floor((building.baseSuccessRate + building.successRatePerLevel * (building.level - 1)) * 100)}%</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">总捐献:</span>
                        <span class="info-value">${building.totalDonation}灵石</span>
                    </div>
                    ${building.level < building.maxLevel ? `
                        <div class="info-item">
                            <span class="info-label">升级所需:</span>
                            <span class="info-value">${nextLevelCost}灵石</span>
                        </div>
                    ` : ''}
                </div>
                <div class="donation-form">
                    <h4>捐献</h4>
                    <div class="input-group">
                        <label>灵石数量:</label>
                        <input type="number" id="alchemy-spirit-stone-amount" min="100" value="100">
                    </div>
                    <button class="btn btn-primary alchemy-donate-spirit-stone-btn">捐献灵石</button>
                    <div class="input-group">
                        <label>仙晶数量:</label>
                        <input type="number" id="alchemy-immortal-stone-amount" min="1" value="1">
                    </div>
                    <button class="btn btn-primary alchemy-donate-immortal-stone-btn">捐献仙晶</button>
                </div>
            </div>
        `;
    }

    bindSectEvents() {
        // 加入宗门
        const joinSectBtns = document.querySelectorAll('.join-sect-btn');
        joinSectBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const sectId = btn.dataset.sectId;
                const result = this.engine.sectSystem.joinSect(sectId);
                this.showNotification(result.message, result.success ? 'success' : 'error');
                if (result.success) {
                    this.switchPage('sect');
                }
            });
        });
        
        // 离开宗门
        const leaveSectBtn = document.querySelector('.leave-sect-btn');
        if (leaveSectBtn) {
            leaveSectBtn.addEventListener('click', () => {
                const result = this.engine.sectSystem.leaveSect();
                this.showNotification(result.message, result.success ? 'success' : 'error');
                if (result.success) {
                    this.switchPage('sect');
                }
            });
        }
        
        // 建筑标签切换
        const buildingTabs = document.querySelectorAll('.building-tab');
        buildingTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // 移除所有标签的active类
                document.querySelectorAll('.building-tab').forEach(t => t.classList.remove('active'));
                // 添加当前标签的active类
                tab.classList.add('active');
                
                // 隐藏所有内容
                document.querySelectorAll('.building-content').forEach(content => content.classList.remove('active'));
                // 显示当前标签的内容
                const tabId = tab.dataset.tab;
                document.getElementById(`${tabId}-content`).classList.add('active');
            });
        });
        
        // 完成任务
        const completeTaskBtns = document.querySelectorAll('.complete-task-btn');
        completeTaskBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const taskId = btn.dataset.taskId;
                const result = this.engine.sectSystem.completeTask(taskId);
                this.showNotification(result.message, result.success ? 'success' : 'error');
                if (result.success) {
                    // 刷新任务殿内容
                    document.getElementById('task_hall-content').innerHTML = this.getTaskHallHTML();
                    // 重新绑定事件
                    this.bindSectEvents();
                }
            });
        });
        
        // 购买功法
        const buySkillBtns = document.querySelectorAll('.buy-skill-btn');
        buySkillBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const skillId = btn.dataset.skillId;
                const result = this.engine.sectSystem.buyScriptureHallSkill(skillId);
                this.showNotification(result.message, result.success ? 'success' : 'error');
            });
        });
        
        // 购买物品
        const buyItemBtns = document.querySelectorAll('.buy-item-btn');
        buyItemBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const itemId = btn.dataset.itemId;
                const result = this.engine.sectSystem.buyTreasureHallItem(itemId);
                this.showNotification(result.message, result.success ? 'success' : 'error');
                if (result.success) {
                    // 刷新珍宝阁内容
                    document.getElementById('treasure_hall-content').innerHTML = this.getTreasureHallHTML();
                    // 重新绑定事件
                    this.bindSectEvents();
                }
            });
        });
        
        // 捐献灵石到聚灵阵
        const donateSpiritStoneBtn = document.querySelector('.donate-spirit-stone-btn');
        if (donateSpiritStoneBtn) {
            donateSpiritStoneBtn.addEventListener('click', () => {
                const amount = parseInt(document.getElementById('spirit-stone-amount').value);
                const result = this.engine.sectSystem.donateToBuilding('spirit_array', 'spirit_stone', amount);
                this.showNotification(result.message, result.success ? 'success' : 'error');
                if (result.success) {
                    // 刷新聚灵阵内容
                    document.getElementById('spirit_array-content').innerHTML = this.getSpiritArrayHTML();
                    // 重新绑定事件
                    this.bindSectEvents();
                }
            });
        }
        
        // 捐献仙晶到聚灵阵
        const donateImmortalStoneBtn = document.querySelector('.donate-immortal-stone-btn');
        if (donateImmortalStoneBtn) {
            donateImmortalStoneBtn.addEventListener('click', () => {
                const amount = parseInt(document.getElementById('immortal-stone-amount').value);
                const result = this.engine.sectSystem.donateToBuilding('spirit_array', 'immortal_stone', amount);
                this.showNotification(result.message, result.success ? 'success' : 'error');
                if (result.success) {
                    // 刷新聚灵阵内容
                    document.getElementById('spirit_array-content').innerHTML = this.getSpiritArrayHTML();
                    // 重新绑定事件
                    this.bindSectEvents();
                }
            });
        }
        
        // 捐献灵石到丹器阁
        const alchemyDonateSpiritStoneBtn = document.querySelector('.alchemy-donate-spirit-stone-btn');
        if (alchemyDonateSpiritStoneBtn) {
            alchemyDonateSpiritStoneBtn.addEventListener('click', () => {
                const amount = parseInt(document.getElementById('alchemy-spirit-stone-amount').value);
                const result = this.engine.sectSystem.donateToBuilding('alchemy_hall', 'spirit_stone', amount);
                this.showNotification(result.message, result.success ? 'success' : 'error');
                if (result.success) {
                    // 刷新丹器阁内容
                    document.getElementById('alchemy_hall-content').innerHTML = this.getAlchemyHallHTML();
                    // 重新绑定事件
                    this.bindSectEvents();
                }
            });
        }
        
        // 捐献仙晶到丹器阁
        const alchemyDonateImmortalStoneBtn = document.querySelector('.alchemy-donate-immortal-stone-btn');
        if (alchemyDonateImmortalStoneBtn) {
            alchemyDonateImmortalStoneBtn.addEventListener('click', () => {
                const amount = parseInt(document.getElementById('alchemy-immortal-stone-amount').value);
                const result = this.engine.sectSystem.donateToBuilding('alchemy_hall', 'immortal_stone', amount);
                this.showNotification(result.message, result.success ? 'success' : 'error');
                if (result.success) {
                    // 刷新丹器阁内容
                    document.getElementById('alchemy_hall-content').innerHTML = this.getAlchemyHallHTML();
                    // 重新绑定事件
                    this.bindSectEvents();
                }
            });
        }
    }

    // ==================== 炼体页 ====================

    /**
     * 获取炼体页面HTML
     * @returns {string} HTML字符串
     */
    getBodyTrainingPageHTML() {
        const bodyTraining = this.engine.bodyTrainingSystem.getCurrentBodyLevel();
        const attributes = this.engine.bodyTrainingSystem.getBodyAttributes();
        const equippedSkills = this.engine.bodyTrainingSystem.getEquippedBodySkills();
        const efficiency = this.engine.bodyTrainingSystem.calculateTrainingEfficiency();
        const allSkills = this.engine.state.data.skills ? this.engine.state.data.skills.list : [];
        const availableSkills = allSkills.filter(skill => skill.obtained);

        return `
            <div class="page body-training-page">
                <div class="page-header">
                    <button class="btn-back-home">← 返回</button>
                    <h2>炼体</h2>
                </div>
                
                <div class="body-training-content">
                    <!-- 人物肉体形象 -->
                    <div class="body-image-container">
                        <div class="body-image">
                            <div class="body-icon">💪</div>
                        </div>
                        <div class="body-level">${bodyTraining.name}</div>
                    </div>
                    
                    <!-- 炼体进度条 -->
                    <div class="body-progress-bar">
                        <div class="progress-container">
                            <div class="progress-fill" style="width: ${(bodyTraining.exp / bodyTraining.nextLevelExp) * 100}%"></div>
                            <span class="progress-text">${bodyTraining.exp}/${bodyTraining.nextLevelExp} (${((bodyTraining.exp / bodyTraining.nextLevelExp) * 100).toFixed(1)}%)</span>
                        </div>
                        <div class="body-training-controls">
                            <button class="btn btn-primary btn-body-training" id="btn-body-training">${this.engine.trainingSystem.getBodyTrainingStatus()}</button>
                        </div>
                    </div>
                    
                    <!-- 炼体属性信息 -->
                    <div class="body-attributes">
                        <h3>炼体属性</h3>
                        <div class="attributes-grid">
                            <div class="attribute-item">
                                <span class="attribute-name">肉体强度</span>
                                <span class="attribute-value">${attributes.bodyStrength}</span>
                            </div>
                            <div class="attribute-item">
                                <span class="attribute-name">防御</span>
                                <span class="attribute-value">${attributes.defense}</span>
                            </div>
                            <div class="attribute-item">
                                <span class="attribute-name">生命值</span>
                                <span class="attribute-value">${attributes.hp}</span>
                            </div>
                            <div class="attribute-item">
                                <span class="attribute-name">修炼效率</span>
                                <span class="attribute-value">${(efficiency * 30).toFixed(1)}/30秒</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 炼体功法格子 -->
                    <div class="body-skills">
                        <h3>炼体功法</h3>
                        <div class="skills-grid">
                            ${availableSkills.map(skill => `
                                <div class="skill-slot ${equippedSkills.some(s => s.id === skill.id) ? 'equipped' : ''}" data-skill-id="${skill.id}">
                                    <div class="skill-name">${skill.name}</div>
                                    <div class="skill-info">
                                        <span class="skill-rank">${this.getSkillRankName(skill.rank)}</span>
                                        <span class="skill-proficiency">${this.getProficiencyName(skill.proficiency)}</span>
                                    </div>
                                    ${equippedSkills.some(s => s.id === skill.id) ? 
                                        '<button class="btn btn-secondary btn-unequip-skill">卸下</button>' : 
                                        '<button class="btn btn-secondary btn-equip-skill">装备</button>'
                                    }
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 绑定炼体页面事件
     */
    bindBodyTrainingEvents() {
        // 开始/停止炼体
        const btnBodyTraining = document.getElementById('btn-body-training');
        if (btnBodyTraining) {
            btnBodyTraining.addEventListener('click', () => {
                const bodyTraining = this.engine.state.data.training.bodyTraining || {};
                if (bodyTraining.active) {
                    const result = this.engine.trainingSystem.stopBodyTraining();
                    this.showNotification(result.message);
                } else {
                    const result = this.engine.trainingSystem.startBodyTraining();
                    if (result.success) {
                        this.showNotification(result.message, 'success');
                    } else {
                        this.showNotification(result.message, 'error');
                    }
                }
                // 刷新页面
                this.refreshBodyTrainingPage();
            });
        }

        // 装备功法
        document.querySelectorAll('.btn-equip-skill').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const slot = e.target.closest('.skill-slot');
                const skillId = slot.dataset.skillId;
                const result = this.engine.bodyTrainingSystem.equipBodySkill(skillId);
                this.showNotification(result.message, result.success ? 'success' : 'error');
                // 刷新页面
                this.refreshBodyTrainingPage();
            });
        });

        // 卸下功法
        document.querySelectorAll('.btn-unequip-skill').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const slot = e.target.closest('.skill-slot');
                const skillId = slot.dataset.skillId;
                const result = this.engine.bodyTrainingSystem.unequipBodySkill(skillId);
                this.showNotification(result.message, result.success ? 'success' : 'error');
                // 刷新页面
                this.refreshBodyTrainingPage();
            });
        });
    }

    /**
     * 刷新炼体页面
     */
    refreshBodyTrainingPage() {
        const mainContainer = document.getElementById('main-container');
        if (mainContainer) {
            mainContainer.innerHTML = this.getBodyTrainingPageHTML();
            this.bindBodyTrainingEvents();
        }
    }

    /**
     * 获取功法品阶名称
     * @param {number} rank - 品阶等级
     * @returns {string} 品阶名称
     */
    getSkillRankName(rank) {
        const rankNames = ['不入流', '凡级', '黄级', '玄级', '地级', '天级', '混沌级'];
        return rankNames[rank] || `品阶${rank}`;
    }

    /**
     * 获取熟练度名称
     * @param {number} proficiency - 熟练度等级
     * @returns {string} 熟练度名称
     */
    getProficiencyName(proficiency) {
        const proficiencyNames = ['入门', '生疏', '熟练', '精通', '小成', '大成', '圆满'];
        return proficiencyNames[proficiency] || `熟练度${proficiency}`;
    }

    // ==================== 灵田页 ====================

    /**
     * 获取灵田页面HTML
     * @returns {string} HTML字符串
     */
    getFieldPageHTML() {
        const fieldInfo = this.engine.fieldSystem.getFieldInfo();
        const fields = this.engine.fieldSystem.getAllFields();
        const seeds = this.engine.fieldSystem.getSeeds();
        
        // 更新灵田状态
        this.engine.fieldSystem.updateFields();

        return `
            <div class="page field-page">
                <div class="page-header">
                    <button class="btn-back-home">← 返回</button>
                    <h2>灵田</h2>
                </div>
                
                <div class="field-content">
                    <!-- 灵田基础信息 -->
                    <div class="field-info">
                        <div class="field-level-info">
                            <h3>灵田等级: ${fieldInfo.level}</h3>
                            <div class="field-灵气">
                                <span>灵气: ${fieldInfo.灵气}/${fieldInfo.max灵气}</span>
                                <div class="灵气-bar">
                                    <div class="灵气-fill" style="width: ${(fieldInfo.灵气 / fieldInfo.max灵气) * 100}%"></div>
                                </div>
                            </div>
                            <div class="field-actions">
                                <button class="btn btn-primary btn-inject-灵气">注入灵气</button>
                                <button class="btn btn-secondary btn-upgrade-field">提升等级</button>
                            </div>
                        </div>
                        <div class="field-count">
                            <h3>灵田数量: ${fieldInfo.count}/12</h3>
                            <p>灵田等级提升后可以解锁新的格子</p>
                        </div>
                    </div>
                    
                    <!-- 灵田格子 -->
                    <div class="field-grid">
                        ${fields.map(field => `
                            <div class="field-item ${field.status}">
                                <div class="field-icon">
                                    ${field.status === 'locked' ? '🔒' : 
                                      field.status === 'empty' ? '🌱' : 
                                      field.status === 'growing' ? `${field.seed.icon}` : 
                                      '🎁'}
                                </div>
                                <div class="field-status">
                                    ${field.status === 'locked' ? '未解锁' : 
                                      field.status === 'empty' ? '空闲' : 
                                      field.status === 'growing' ? `生长中 ${Math.round(field.progress * 100)}%` : 
                                      '成熟'}
                                </div>
                                ${field.status === 'empty' ? `
                                    <div class="field-seed-selector">
                                        <select class="seed-select" data-field-id="${field.id}">
                                            <option value="">选择灵种</option>
                                            ${seeds.map(seed => `
                                                <option value="${seed.id}">${seed.icon} ${seed.name} (${Math.round(seed.matureTime / 60)}分钟)</option>
                                            `).join('')}
                                        </select>
                                        <button class="btn btn-primary btn-plant-seed" data-field-id="${field.id}">播种</button>
                                    </div>
                                ` : field.status === 'mature' ? `
                                    <button class="btn btn-primary btn-harvest" data-field-id="${field.id}">收获</button>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                    
                    <!-- 灵种信息 -->
                    <div class="seed-info">
                        <h3>灵种信息</h3>
                        <div class="seed-list">
                            ${seeds.map(seed => `
                                <div class="seed-item">
                                    <span class="seed-icon">${seed.icon}</span>
                                    <span class="seed-name">${seed.name}</span>
                                    <span class="seed-time">成熟时间: ${Math.round(seed.matureTime / 60)}分钟</span>
                                    <span class="seed-value">价值: ${seed.value}灵石</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 获取每日任务页面HTML
     * @returns {string} HTML字符串
     */
    getDailyTaskPageHTML() {
        try {
            const tasks = this.engine.getAllDailyTasks() || [];
            const taskStatus = this.engine.getDailyTaskStatus() || { completed: 0, total: 0 };

            // 生成任务卡片HTML
            let tasksHTML = '';
            if (tasks.length > 0) {
                tasksHTML = tasks.map((task, index) => {
                    // 确保任务对象的所有必要属性都存在
                    const taskId = task.id || '';
                    const taskTitle = task.title || '任务';
                    const taskQuality = task.quality || 'common';
                    const taskDescription = task.description || '';
                    const taskCurrent = task.current || 0;
                    const taskTarget = task.target || 1;
                    const taskCompleted = task.completed || false;
                    const taskRewards = task.rewards || { spiritStone: 0, immortalStone: 0, exp: 0 };
                    
                    return `
                        <div class="task-card ${taskCompleted ? 'completed' : ''}" data-task-id="${taskId}">
                            <div class="task-header">
                                <h3 class="task-title" style="color: ${this.engine.dailyTaskSystem.getQualityColor(taskQuality)}">${taskTitle}</h3>
                                ${!taskCompleted ? '<button class="btn btn-secondary btn-refresh-quality">看广告刷新品质</button>' : ''}
                            </div>
                            <div class="task-description">${taskDescription}</div>
                            <div class="task-progress">
                                <div class="progress-info">
                                    <span class="progress-text">${taskCurrent}/${taskTarget}</span>
                                </div>
                            </div>
                            <div class="task-rewards">
                                <span class="reward-text">奖励: </span>
                                <span class="reward-item">灵石 ${taskRewards.spiritStone}</span>
                                <span class="reward-item">仙晶 ${taskRewards.immortalStone}</span>
                                <span class="reward-item">修为 ${taskRewards.exp}</span>
                            </div>
                            ${!taskCompleted && taskCurrent >= taskTarget ? '<button class="btn btn-primary btn-complete-task">完成任务</button>' : ''}
                        </div>
                    `;
                }).join('');
            } else {
                tasksHTML = `
                    <div class="empty-tasks">
                        <p>暂无每日任务</p>
                        <button class="btn btn-primary btn-refresh-tasks">刷新任务</button>
                    </div>
                `;
            }

            const html = `
                <div class="page daily-task-page">
                    <div class="page-header">
                        <button class="btn-back-home">← 返回</button>
                        <h2>每日任务</h2>
                    </div>

                    <div class="daily-task-content">
                        <div class="task-status">
                            <span class="status-text">已完成: ${taskStatus.completed}/${taskStatus.total}</span>
                            <button class="btn btn-primary btn-add-task">消耗体力添加任务</button>
                        </div>

                        <div class="task-list">
                            ${tasksHTML}
                        </div>
                    </div>
                </div>
            `;
            
            return html;
        } catch (error) {
            console.error('Error generating daily task page:', error);
            return `
                <div class="page daily-task-page">
                    <div class="page-header">
                        <button class="btn-back-home">← 返回</button>
                        <h2>每日任务</h2>
                    </div>
                    <div class="daily-task-content">
                        <div class="task-status">
                            <span class="status-text">已完成: 0/0</span>
                            <button class="btn btn-primary btn-add-task">消耗体力添加任务</button>
                        </div>
                        <div class="task-list">
                            <div class="empty-tasks">
                                <p>加载任务失败，请刷新重试</p>
                                <button class="btn btn-primary btn-refresh-tasks">刷新任务</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    /**
     * 绑定灵田页面事件
     */
    bindFieldEvents() {
        // 注入灵气
        const btnInject灵气 = document.querySelector('.btn-inject-灵气');
        if (btnInject灵气) {
            btnInject灵气.addEventListener('click', () => {
                // 这里简化处理，实际应该让用户输入注入数量
                const result = this.engine.fieldSystem.inject灵气(100);
                this.showNotification(result.message, result.success ? 'success' : 'error');
                // 刷新页面
                this.refreshFieldPage();
            });
        }

        // 提升灵田等级
        const btnUpgradeField = document.querySelector('.btn-upgrade-field');
        if (btnUpgradeField) {
            btnUpgradeField.addEventListener('click', () => {
                const result = this.engine.fieldSystem.upgradeFieldLevel();
                this.showNotification(result.message, result.success ? 'success' : 'error');
                // 刷新页面
                this.refreshFieldPage();
            });
        }

        // 播种灵种
        document.querySelectorAll('.btn-plant-seed').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const fieldId = e.target.dataset.fieldId;
                const select = document.querySelector(`.seed-select[data-field-id="${fieldId}"]`);
                const seedId = select.value;
                
                if (!seedId) {
                    this.showNotification('请选择灵种', 'error');
                    return;
                }

                // 找到对应的灵种
                const seeds = this.engine.fieldSystem.getSeeds();
                const seed = seeds.find(s => s.id === seedId);
                
                if (seed) {
                    const result = this.engine.fieldSystem.plantSeed(fieldId, seed);
                    this.showNotification(result.message, result.success ? 'success' : 'error');
                    // 刷新页面
                    this.refreshFieldPage();
                }
            });
        });

        // 收获灵物
        document.querySelectorAll('.btn-harvest').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const fieldId = e.target.dataset.fieldId;
                const result = this.engine.fieldSystem.harvestField(fieldId);
                this.showNotification(result.message, result.success ? 'success' : 'error');
                // 刷新页面
                this.refreshFieldPage();
            });
        });
    }

    /**
     * 刷新灵田页面
     */
    refreshFieldPage() {
        const mainContainer = document.getElementById('main-container');
        if (mainContainer) {
            mainContainer.innerHTML = this.getFieldPageHTML();
            this.bindFieldEvents();
        }
    }

    /**
     * 绑定每日任务页面事件
     */
    bindDailyTaskEvents() {
        // 返回按钮
        const btnBackHome = document.querySelector('.btn-back-home');
        if (btnBackHome) {
            btnBackHome.addEventListener('click', () => {
                this.switchPage('home');
            });
        }

        // 添加任务
        const btnAddTask = document.querySelector('.btn-add-task');
        if (btnAddTask) {
            btnAddTask.addEventListener('click', () => {
                const result = this.engine.addDailyTask();
                this.showNotification(result.message, result.success ? 'success' : 'error');
                if (result.success) {
                    // 刷新页面
                    this.refreshDailyTaskPage();
                }
            });
        }

        // 完成任务
        document.querySelectorAll('.btn-complete-task').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskCard = e.target.closest('.task-card');
                const taskId = taskCard.dataset.taskId;
                const result = this.engine.completeDailyTask(taskId);
                if (result.success) {
                    this.showNotification(`任务完成！获得: 灵石 ${result.rewards.spiritStone}, 仙晶 ${result.rewards.immortalStone}, 修为 ${result.rewards.exp}`, 'success');
                    // 移除已完成的任务并刷新页面
                    this.engine.dailyTaskSystem.removeCompletedTasks();
                    this.refreshDailyTaskPage();
                } else {
                    this.showNotification(result.message, 'error');
                }
            });
        });

        // 刷新任务品质
        document.querySelectorAll('.btn-refresh-quality').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskCard = e.target.closest('.task-card');
                const taskId = taskCard.dataset.taskId;
                const result = this.engine.refreshTaskQuality(taskId);
                this.showNotification(result.message, result.success ? 'success' : 'error');
                if (result.success) {
                    // 刷新页面
                    this.refreshDailyTaskPage();
                }
            });
        });

        // 刷新任务
        const btnRefreshTasks = document.querySelector('.btn-refresh-tasks');
        if (btnRefreshTasks) {
            btnRefreshTasks.addEventListener('click', () => {
                this.engine.dailyTaskSystem.refreshTasks();
                this.showNotification('任务已刷新', 'success');
                // 刷新页面
                this.refreshDailyTaskPage();
            });
        }
    }

    /**
     * 刷新每日任务页面
     */
    refreshDailyTaskPage() {
        const mainContainer = document.getElementById('main-container');
        if (mainContainer) {
            mainContainer.innerHTML = this.getDailyTaskPageHTML();
            this.bindDailyTaskEvents();
        }
    }

    // ==================== 灵宠页 ====================

    /**
     * 获取灵宠页面HTML
     * @returns {string} HTML字符串
     */
    getPetPageHTML() {
        const pets = this.engine.petSystem.getAllPets();
        const activePet = this.engine.petSystem.getActivePet();
        const totalAttributes = this.engine.petSystem.calculateTotalAttributes();

        return `
            <div class="page pet-page">
                <div class="page-header">
                    <button class="btn-back-home">← 返回</button>
                    <h2>灵宠</h2>
                </div>
                
                <div class="pet-content">
                    <!-- 灵宠加成属性总览 -->
                    <div class="pet-attributes-overview">
                        <h3>灵宠加成属性总览</h3>
                        <div class="attributes-grid">
                            <div class="attribute-item">
                                <span class="attribute-name">攻击</span>
                                <span class="attribute-value">${totalAttributes.attack}</span>
                            </div>
                            <div class="attribute-item">
                                <span class="attribute-name">防御</span>
                                <span class="attribute-value">${totalAttributes.defense}</span>
                            </div>
                            <div class="attribute-item">
                                <span class="attribute-name">生命值</span>
                                <span class="attribute-value">${totalAttributes.hp}</span>
                            </div>
                            <div class="attribute-item">
                                <span class="attribute-name">速度</span>
                                <span class="attribute-value">${totalAttributes.speed}</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- 灵宠列表 -->
                    <div class="pet-list-section">
                        <h3>灵宠列表</h3>
                        <div class="pet-list">
                            ${pets.map(pet => `
                                <div class="pet-item ${pet.id === activePet?.id ? 'active' : ''} ${pet.obtained ? '' : 'unobtained'}">
                                    <div class="pet-icon">${pet.icon}</div>
                                    <div class="pet-info">
                                        <div class="pet-name">${pet.name} ${pet.obtained ? `(等级 ${pet.level})` : '(未获得)'}</div>
                                        <div class="pet-rarity" style="color: ${this.getQualityColor(pet.rarity)}">${pet.rarity}</div>
                                        <div class="pet-description">${pet.description}</div>
                                        ${pet.obtained ? `
                                            <div class="pet-attributes">
                                                <div class="pet-attribute">攻击: ${pet.attributes.attack}</div>
                                                <div class="pet-attribute">防御: ${pet.attributes.defense}</div>
                                                <div class="pet-attribute">生命值: ${pet.attributes.hp}</div>
                                                <div class="pet-attribute">速度: ${pet.attributes.speed}</div>
                                            </div>
                                            <div class="pet-actions">
                                                ${pet.id !== activePet?.id ? `
                                                    <button class="btn btn-secondary btn-activate-pet" data-pet-id="${pet.id}">出战</button>
                                                ` : ''}
                                                <div class="train-section">
                                                    <span class="train-cost">💎 ${pet.level * 100}</span>
                                                    <button class="btn btn-primary btn-train-pet" data-pet-id="${pet.id}">培养</button>
                                                </div>
                                            </div>
                                        ` : ''}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 绑定灵宠页面事件
     */
    bindPetEvents() {
        // 激活灵宠
        document.querySelectorAll('.btn-activate-pet').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const petId = e.target.dataset.petId;
                const result = this.engine.petSystem.activatePet(petId);
                this.showNotification(result.message, result.success ? 'success' : 'error');
                // 刷新页面
                this.refreshPetPage();
            });
        });

        // 培养灵宠
        document.querySelectorAll('.btn-train-pet').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const petId = e.target.dataset.petId;
                const result = this.engine.petSystem.trainPet(petId);
                this.showNotification(result.message, result.success ? 'success' : 'error');
                // 刷新页面
                this.refreshPetPage();
            });
        });
    }

    /**
     * 刷新灵宠页面
     */
    refreshPetPage() {
        const mainContainer = document.getElementById('main-container');
        if (mainContainer) {
            mainContainer.innerHTML = this.getPetPageHTML();
            this.bindPetEvents();
        }
    }

    // ==================== 丹炉页 ====================

    /**
     * 获取丹炉页面HTML
     * @returns {string} HTML字符串
     */
    getAlchemyPageHTML() {
        const furnace = this.engine.alchemySystem.getFurnaceInfo();
        const currentCraft = this.engine.alchemySystem.updateCraftingProgress();
        
        // 从背包中获取材料数量
        const getMaterialCount = (materialName) => {
            if (!this.engine.state.data.backpack || !this.engine.state.data.backpack.items) {
                return 0;
            }
            // 根据材料名称查找背包中的物品
            const materialMap = {
                '草药': 'herb',
                '矿石': 'ore'
            };
            const itemId = materialMap[materialName];
            if (!itemId) return 0;
            
            const item = this.engine.state.data.backpack.items.find(i => i.id === itemId);
            return item ? (item.count || item.quantity || 0) : 0;
        };

        // 丹药配方列表
        const recipes = [
            {
                id: 'healing_pill',
                name: ' healing_pill',
                tier: 1,
                icon: '💊',
                materials: {
                    '草药': 2,
                    '矿石': 1
                },
                effect: '恢复生命值'
            },
            {
                id: 'spirit_pill',
                name: '灵气丹',
                tier: 2,
                icon: '✨',
                materials: {
                    '草药': 4,
                    '矿石': 2
                },
                effect: '增加灵气'
            },
            {
                id: 'exp_pill',
                name: '经验丹',
                tier: 3,
                icon: '📈',
                materials: {
                    '草药': 8,
                    '矿石': 4
                },
                effect: '增加经验'
            }
        ];

        return `
            <div class="page alchemy-page">
                <div class="page-header">
                    <button class="btn-back-home">← 返回</button>
                    <h2>丹炉</h2>
                </div>
                
                <div class="alchemy-content">
                    <!-- 丹炉信息 -->
                    <div class="furnace-section">
                        <div class="furnace-left">
                            <div class="furnace-image">
                                <div class="furnace-icon">⚗️</div>
                            </div>
                            <div class="furnace-bonus">
                                丹炉加成: ${(furnace.bonus * 100).toFixed(1)}%
                            </div>
                        </div>
                        <div class="furnace-right">
                            <h3>${furnace.name} (等级 ${furnace.level})</h3>
                            <div class="furnace-status">
                                耐久度: ${furnace.durability}/100
                            </div>
                        </div>
                    </div>
                    
                    <!-- 炼制区域 -->
                    <div class="crafting-section">
                        <h3>炼制丹药</h3>
                        ${currentCraft ? `
                            <div class="current-craft">
                                <div class="craft-info">
                                    <span class="craft-icon">${currentCraft.recipe.icon}</span>
                                    <span class="craft-name">${currentCraft.recipe.name}</span>
                                    <span class="craft-quantity">x${currentCraft.quantity}</span>
                                </div>
                                <div class="craft-stats">
                                    <span>成功率: ${(currentCraft.successRate * 100).toFixed(1)}%</span>
                                </div>
                                <div class="craft-progress">
                                    <div class="progress-container">
                                        <div class="progress-fill" style="width: ${currentCraft.progress * 100}%"></div>
                                        <span class="progress-text">${(currentCraft.progress * 100).toFixed(1)}%</span>
                                    </div>
                                </div>
                                <button class="btn btn-secondary btn-stop-craft">停止炼制</button>
                            </div>
                        ` : `
                            <div class="recipe-selection">
                                <h4>选择丹药</h4>
                                <div class="recipe-list">
                                    ${recipes.map(recipe => {
                                        const successRate = this.engine.alchemySystem.calculateSuccessRate(recipe);
                                        const canCraft = this.engine.alchemySystem.checkMaterials(recipe, 1);
                                        return `
                                            <div class="recipe-item ${canCraft ? 'can-craft' : 'cannot-craft'}" data-recipe-id="${recipe.id}">
                                                <span class="recipe-icon">${recipe.icon}</span>
                                                <div class="recipe-info">
                                                    <div class="recipe-name">${recipe.name}</div>
                                                    <div class="recipe-tier">${recipe.tier}阶</div>
                                                    <div class="recipe-success">成功率: ${(successRate * 100).toFixed(1)}%</div>
                                                </div>
                                                <div class="recipe-materials">
                                                    ${Object.entries(recipe.materials).map(([material, amount]) => {
                                                        const availableCount = getMaterialCount(material);
                                                        const hasEnough = availableCount >= amount;
                                                        return `
                                                            <div class="material-item ${hasEnough ? 'sufficient' : 'insufficient'}">
                                                                ${material}: ${availableCount}/${amount}
                                                            </div>
                                                        `;
                                                    }).join('')}
                                                </div>
                                                ${canCraft ? `
                                                    <div class="craft-controls">
                                                        <div class="quantity-control">
                                                            <label>数量:</label>
                                                            <input type="range" min="1" max="10" value="1" class="quantity-slider" data-recipe-id="${recipe.id}">
                                                            <span class="quantity-value">1</span>
                                                        </div>
                                                        <button class="btn btn-primary btn-start-craft" data-recipe-id="${recipe.id}">炼制</button>
                                                    </div>
                                                ` : '<div class="craft-controls"><span class="material-insufficient">材料不足</span></div>'}
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            </div>
                        `}
                    </div>
                    

                </div>
            </div>
        `;
    }

    /**
     * 绑定丹炉页面事件
     */
    bindAlchemyEvents() {
        // 开始炼制
        document.querySelectorAll('.btn-start-craft').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const recipeId = e.target.dataset.recipeId;
                const slider = document.querySelector(`.quantity-slider[data-recipe-id="${recipeId}"]`);
                const quantity = parseInt(slider.value);

                // 找到对应的配方
                const recipes = [
                    {
                        id: 'healing_pill',
                        name: 'healing_pill',
                        tier: 1,
                        icon: '💊',
                        materials: {
                            '草药': 2,
                            '矿石': 1
                        },
                        effect: '恢复生命值'
                    },
                    {
                        id: 'spirit_pill',
                        name: '灵气丹',
                        tier: 2,
                        icon: '✨',
                        materials: {
                            '草药': 4,
                            '矿石': 2
                        },
                        effect: '增加灵气'
                    },
                    {
                        id: 'exp_pill',
                        name: '经验丹',
                        tier: 3,
                        icon: '📈',
                        materials: {
                            '草药': 8,
                            '矿石': 4
                        },
                        effect: '增加经验'
                    }
                ];

                const recipe = recipes.find(r => r.id === recipeId);
                if (recipe) {
                    const result = this.engine.alchemySystem.startCrafting(recipe, quantity);
                    this.showNotification(result.message, result.success ? 'success' : 'error');
                    if (result.success) {
                        // 启动进度更新
                        this.startAlchemyProgressUpdate();
                    }
                    // 刷新页面
                    this.refreshAlchemyPage();
                }
            });
        });

        // 停止炼制
        const btnStopCraft = document.querySelector('.btn-stop-craft');
        if (btnStopCraft) {
            btnStopCraft.addEventListener('click', () => {
                const result = this.engine.alchemySystem.stopCrafting();
                this.showNotification(result.message, result.success ? 'success' : 'error');
                // 刷新页面
                this.refreshAlchemyPage();
            });
        }

        // 数量滑块
        document.querySelectorAll('.quantity-slider').forEach(slider => {
            slider.addEventListener('input', (e) => {
                const value = e.target.value;
                const valueSpan = e.target.nextElementSibling;
                valueSpan.textContent = value;
            });
        });
    }

    /**
     * 刷新丹炉页面
     */
    refreshAlchemyPage() {
        const mainContainer = document.getElementById('main-container');
        if (mainContainer) {
            mainContainer.innerHTML = this.getAlchemyPageHTML();
            this.bindAlchemyEvents();
        }
    }

    /**
     * 启动丹炉进度更新
     */
    startAlchemyProgressUpdate() {
        // 清除之前的定时器
        if (this.alchemyProgressInterval) {
            clearInterval(this.alchemyProgressInterval);
        }

        // 每1秒更新一次进度
        this.alchemyProgressInterval = setInterval(() => {
            const currentCraft = this.engine.alchemySystem.updateCraftingProgress();
            if (!currentCraft) {
                // 炼制完成，清除定时器
                clearInterval(this.alchemyProgressInterval);
                this.alchemyProgressInterval = null;
                // 刷新页面
                this.refreshAlchemyPage();
                this.showNotification('丹药炼制完成', 'success');
            } else {
                // 更新进度条
                const progressFill = document.querySelector('.progress-fill');
                const progressText = document.querySelector('.progress-text');
                if (progressFill && progressText) {
                    progressFill.style.width = `${currentCraft.progress * 100}%`;
                    progressText.textContent = `${(currentCraft.progress * 100).toFixed(1)}%`;
                }
            }
        }, 1000);
    }

    // ==================== PVP页 ====================

    getPvpPageHTML() {
        const state = this.engine.state.data;

        return `
            <div class="page pvp-page">
                <div class="page-header">
                    <button class="btn-back-home">← 返回</button>
                    <h2>仙榜竞技</h2>
                </div>

                <div class="pvp-content">
                    <div class="rank-info">
                        <span class="rank-label">当前排名</span>
                        <span class="rank-value">${state.pvp.rank}</span>
                    </div>

                    <div class="pvp-actions">
                        <button class="btn btn-primary" id="btn-worship">膜拜 (领奖励)</button>
                        <button class="btn btn-secondary" id="btn-match">机缘对决</button>
                    </div>
                </div>
            </div>
        `;
    }

    bindPvpEvents() {
        // PVP事件绑定
    }

    // ==================== 通用方法 ====================

    /**
     * 显示加速弹窗
     */
    showSpeedUpModal() {
        this.switchPage('speed-up');
    }

    /**
     * 获取修炼加速页面HTML
     */
    getSpeedUpPageHTML() {
        const efficiency = this.engine.trainingSystem.getCultivationEfficiency();
        const options = this.engine.trainingSystem.getSpeedOptions();
        const isCultivating = this.engine.state.data.training.cultivation.active;

        return `
            <div class="page speed-up-page">
                <div class="page-header">
                    <button class="btn-back-home" id="btn-back-speed">← 返回</button>
                    <h2>修炼加速</h2>
                </div>
                <div class="speed-up-content">
                    <div class="cultivation-control">
                        ${isCultivating ? `
                            <a href="#" class="stop-cultivation-link" id="btn-stop-cultivation">停止修炼</a>
                        ` : `
                            <a href="#" class="start-cultivation-link" id="btn-start-cultivation">开始修炼</a>
                        `}
                    </div>
                    <div class="efficiency-info">
                        <div class="current-efficiency">
                            <span class="label">当前修炼效率：</span>
                            <span class="value">${efficiency.expGain}点/${efficiency.currentInterval}秒</span>
                        </div>
                        <div class="base-efficiency">
                            <span class="label">基础修炼效率：</span>
                            <span class="value">${efficiency.baseEfficiency}点/${efficiency.baseInterval}秒</span>
                        </div>
                        <div class="bonus-info">
                            <span class="label">加成效率：</span>
                            <span class="value">跟脚+${(efficiency.genJiaoAddition * 100).toFixed(0)}%, 功法+${(efficiency.skillAddition * 100).toFixed(0)}%</span>
                        </div>
                        ${efficiency.isAccelerated ? `
                            <div class="accelerated-info">
                                <span class="label">翻倍加速：</span>
                                <span class="value">已激活 (${efficiency.efficiency.toFixed(1)}倍效率)</span>
                            </div>
                            <div class="expire-time">
                                <span class="label">加速到期时间：</span>
                                <span class="value">${this.getAccelerateEndTime()}</span>
                            </div>
                        ` : `
                            <div class="normal-info">
                                <span class="label">加速效果：</span>
                                <span class="value">未激活</span>
                            </div>
                            <div class="expire-time">
                                <span class="label">加速到期时间：</span>
                                <span class="value">无</span>
                            </div>
                        `}
                    </div>
                    <div class="speed-options">
                        ${options.map(option => `
                            <div class="speed-option" data-option="${option.id}">
                                <div class="option-description">${option.description}</div>
                                ${!option.canUse ? `<div class="option-reason">${option.reason}</div>` : ''}
                                <button class="btn btn-primary btn-speed-option" ${option.canUse ? '' : 'disabled'}>
                                    ${option.name}
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 绑定加速弹窗事件
     */
    bindSpeedUpModalEvents() {
        const modal = document.querySelector('.speed-up-modal');
        if (!modal) return;

        // 关闭按钮
        const btnClose = document.getElementById('btn-close-speed');
        if (btnClose) {
            btnClose.addEventListener('click', () => {
                modal.remove();
            });
        }

        // 点击遮罩关闭
        modal.addEventListener('click', (e) => {
            if (e.target === modal.querySelector('.modal-overlay')) {
                modal.remove();
            }
        });

        // 加速选项按钮
        document.querySelectorAll('.btn-speed-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const optionDiv = e.target.closest('.speed-option');
                const optionId = optionDiv.dataset.option;

                const result = this.engine.trainingSystem.useSpeedUp(optionId);
                this.showNotification(result.message, result.success ? 'success' : 'error');

                if (result.success) {
                    // 更新修炼按钮状态
                    this.updateCultivationButtonState();
                    // 重新显示弹窗以更新状态
                    modal.remove();
                    this.showSpeedUpModal();
                }
            });
        });

        // 开始/停止修炼按钮
        const btnCultivate = document.getElementById('btn-cultivate-modal');
        if (btnCultivate) {
            btnCultivate.addEventListener('click', () => {
                const result = this.engine.trainingSystem.toggleCultivation();
                this.showNotification(result.message, result.success ? 'success' : 'error');
                // 更新按钮状态
                this.updateCultivationButtonState();
                // 重新显示弹窗以更新状态
                modal.remove();
                this.showSpeedUpModal();
            });
        }
    }

    /**
     * 绑定修炼加速页面事件
     */
    bindSpeedUpPageEvents() {
        // 返回按钮
        const btnBack = document.getElementById('btn-back-speed');
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                this.switchPage('home');
            });
        }

        // 停止修炼链接
        const btnStopCultivation = document.getElementById('btn-stop-cultivation');
        if (btnStopCultivation) {
            btnStopCultivation.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('停止修炼按钮被点击');
                const result = this.engine.trainingSystem.stopCultivation();
                console.log('停止修炼结果:', result);
                this.showNotification(result.message, result.success ? 'success' : 'error');
                if (result.success) {
                    console.log('停止修炼成功，更新按钮状态');
                    // 更新修炼按钮状态
                    this.updateCultivationButtonState();
                    console.log('按钮状态更新完成，重新加载页面');
                    // 重新加载页面以更新状态
                    this.switchPage('speed-up');
                }
            });
        }

        // 开始修炼链接
        const btnStartCultivation = document.getElementById('btn-start-cultivation');
        if (btnStartCultivation) {
            btnStartCultivation.addEventListener('click', (e) => {
                e.preventDefault();
                const result = this.engine.trainingSystem.startCultivation();
                this.showNotification(result.message, result.success ? 'success' : 'error');
                if (result.success) {
                    // 更新修炼按钮状态
                    this.updateCultivationButtonState();
                    // 重新加载页面以更新状态
                    this.switchPage('speed-up');
                }
            });
        }

        // 加速选项按钮
        document.querySelectorAll('.btn-speed-option').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const optionDiv = e.target.closest('.speed-option');
                const optionId = optionDiv.dataset.option;

                const result = this.engine.trainingSystem.useSpeedUp(optionId);
                this.showNotification(result.message, result.success ? 'success' : 'error');

                if (result.success) {
                    // 更新修炼按钮状态
                    this.updateCultivationButtonState();
                    // 重新加载页面以更新状态
                    this.switchPage('speed-up');
                }
            });
        });
    }

    /**
     * 获取加速到期时间
     * @returns {string} 到期时间字符串
     */
    getAccelerateEndTime() {
        const cultivation = this.engine.state.data.training.cultivation;
        if (!cultivation.accelerated || !cultivation.accelerateEndTime) {
            return '无';
        }
        
        if (cultivation.accelerateEndTime === -1) {
            return '永久';
        }
        
        const endTime = new Date(cultivation.accelerateEndTime);
        return endTime.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    /**
     * 更新修炼按钮状态
     */
    updateCultivationButtonState() {
        // 更新主界面按钮（如果存在）
        const btnCultivate = document.getElementById('btn-cultivate');
        if (btnCultivate) {
            btnCultivate.textContent = this.engine.trainingSystem.getCultivationStatus();
            const state = this.engine.state.data.training.cultivation;
            btnCultivate.classList.toggle('active', state.active);
        }
        
        // 更新主界面的修炼效率按钮
        const btnSpeed = document.getElementById('btn-speed');
        if (btnSpeed) {
            const state = this.engine.state.data.training.cultivation;
            if (state.active) {
                btnSpeed.textContent = this.engine.trainingSystem.getCultivationStatus();
                btnSpeed.className = 'btn btn-secondary btn-speed';
            } else {
                btnSpeed.textContent = '开始修炼';
                btnSpeed.className = 'btn btn-yellow-highlight btn-speed';
            }
        }
        
        // 更新弹窗中的按钮
        const btnCultivateModal = document.getElementById('btn-cultivate-modal');
        if (btnCultivateModal) {
            btnCultivateModal.textContent = this.engine.trainingSystem.getCultivationStatus();
            const state = this.engine.state.data.training.cultivation;
            btnCultivateModal.classList.toggle('active', state.active);
        }
        
        // 更新修炼进度条
        this.updateCultivationProgress();
    }

    /**
     * 更新修炼进度条
     */
    updateCultivationProgress() {
        const progressFill = document.querySelector('.cultivation-progress .progress-fill');
        const progressText = document.querySelector('.cultivation-progress .progress-text');
        if (progressFill && progressText) {
            const state = this.engine.state.data;
            const progress = this.engine.realmSystem.getProgress();
            const efficiency = this.engine.trainingSystem.getCultivationEfficiency();
            progressFill.style.width = `${progress.progress}%`;
            
            const cultivationStatus = state.training.cultivation?.active ? 
                (efficiency.isAccelerated ? '加速修炼中...' : '修炼中...') : 
                '修炼停止';
            const text = `${cultivationStatus} ${this.formatNumber(state.realm.exp)}/${this.formatNumber(progress.requiredExp)} (${progress.progress.toFixed(1)}%)`;
            this.addTypingAnimation(progressText, text);
        }
    }

    /**
     * 更新境界显示
     */
    updateRealmDisplay() {
        const realmDisplay = document.querySelector('.realm-display');
        if (realmDisplay) {
            const state = this.engine.state.data;
            const realmConfig = this.engine.state.getCurrentRealmConfig();
            realmDisplay.textContent = `${realmConfig.name}·${this.getLayerName(state.realm.currentLayer)}`;
        }
        
        // 更新突破按钮状态
        const btnBreakthrough = document.getElementById('btn-breakthrough-home');
        if (btnBreakthrough) {
            const progress = this.engine.realmSystem.getProgress();
            const isBreakthroughAvailable = progress.progress >= 100;
            btnBreakthrough.disabled = !isBreakthroughAvailable;
        }
        
        // 更新修炼进度条
        this.updateCultivationProgress();
    }

    /**
     * 更新资源显示
     */
    updateResourceDisplay() {
        // 更新顶部资源栏
        const spiritPointsEl = document.querySelector('.top-resource-item:nth-child(1) .res-value');
        const immortalStoneEl = document.querySelector('.top-resource-item:nth-child(2) .res-value');
        const spiritStoneEl = document.querySelector('.top-resource-item:nth-child(3) .res-value');

        if (spiritPointsEl) {
            spiritPointsEl.textContent = this.engine.state.data.training.cave.spiritPoints;
        }
        if (immortalStoneEl) {
            immortalStoneEl.textContent = this.formatNumber(this.engine.state.data.resources.immortalStone);
        }
        if (spiritStoneEl) {
            spiritStoneEl.textContent = this.formatNumber(this.engine.state.data.resources.spiritStone);
        }
    }

    /**
     * 显示通知
     * @param {string} message - 消息内容
     * @param {string} type - 类型 (success, warning, error, info)
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // 设置高z-index确保显示在最上层
        notification.style.zIndex = '9999';

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
        }, 10);

        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    /**
     * 格式化数字
     * @param {number} num - 数字
     * @returns {string} 格式化后的字符串
     */
    formatNumber(num) {
        if (num >= 100000000) {
            return (num / 100000000).toFixed(1) + '亿';
        }
        if (num >= 10000) {
            return (num / 10000).toFixed(1) + '万';
        }
        return num.toLocaleString();
    }

    /**
     * 添加打字动画效果到元素
     * @param {HTMLElement} element - 目标元素
     * @param {string} text - 完整文本
     * @param {number} speed - 打字速度（毫秒）
     */
    addTypingAnimation(element, text, speed = 100) {
        if (!element) return;
        
        // 清除之前的动画
        if (element.typingTimeout) {
            clearTimeout(element.typingTimeout);
        }
        
        // 检查是否包含"加速修炼中"或"修炼中"
        if (text.includes('加速修炼中') || text.includes('修炼中')) {
            // 提取状态部分和数据部分
            const statusPart = text.includes('加速修炼中') ? '加速修炼中' : '修炼中';
            const dataPart = text.split(statusPart)[1] || '';
            
            // 启动点的动画
            let dots = 0;
            element.typingTimeout = setInterval(() => {
                dots = (dots + 1) % 4;
                const dotStr = '.'.repeat(dots);
                element.textContent = statusPart + dotStr + dataPart;
            }, 500);
        } else {
            // 普通文本直接显示
            element.textContent = text;
        }
    }

    /**
     * 启动更新循环
     */
    startUpdateLoop() {
        setInterval(() => {
            if (this.currentPage === 'home') {
                this.updateHomeStatus();
            }
        }, 1000);
    }

    /**
     * 更新首页状态
     */
    updateHomeStatus() {
        // 更新修炼状态显示
        const caveAccumulated = document.querySelector('.cave-status .accumulated');
        const autoAccumulated = document.querySelector('.auto-status .accumulated');

        if (caveAccumulated) {
            caveAccumulated.textContent = '+' + this.formatNumber(this.engine.state.data.training.cave.accumulatedSpirit);
        }
        if (autoAccumulated) {
            autoAccumulated.textContent = '+' + this.formatNumber(this.engine.state.data.training.auto.accumulatedExp);
        }
    }

    // ==================== 剧情页 ====================

    /**
     * 剧情数据配置
     */
    getStoryData() {
        return {
            chapters: {
                1: {
                    id: 1,
                    title: '第一章：初入修真',
                    scenes: [
                        {
                            id: 0,
                            speaker: '旁白',
                            text: '在一个偏远的小村庄里，你过着平凡的生活。直到有一天，你在后山的山洞中发现了一本泛黄的古籍...',
                            background: 'mountain',
                            choices: null
                        },
                        {
                            id: 1,
                            speaker: '你',
                            text: '这是什么书？上面写着《太乙金章》四个大字，字迹古朴，透着一股神秘气息。',
                            background: 'book',
                            choices: null
                        },
                        {
                            id: 2,
                            speaker: '旁白',
                            text: '当你翻开书页的那一刻，一股暖流涌入体内，你感觉身体发生了奇妙的变化...',
                            background: 'light',
                            choices: null
                        },
                        {
                            id: 3,
                            speaker: '神秘声音',
                            text: '有缘人，你既得此书，便是踏上了修真之路。从此，你将经历千难万险，只为求得长生大道。',
                            background: 'voice',
                            choices: [
                                { text: '我愿意踏上修真之路', nextScene: 4, reward: { exp: 500, spiritStone: 100 } },
                                { text: '这太危险了，我想要平凡的生活', nextScene: 5, reward: { spiritStone: 50 } }
                            ]
                        },
                        {
                            id: 4,
                            speaker: '旁白',
                            text: '你的眼中闪烁着坚定的光芒，从此，你开始了艰苦的修真之路。每天清晨，你都会在后山打坐修炼...',
                            background: 'cultivation',
                            choices: null,
                            rewards: { exp: 1000, spiritStone: 500, message: '获得修为1000，灵石500' }
                        },
                        {
                            id: 5,
                            speaker: '旁白',
                            text: '你犹豫了许久，最终还是放下了古籍，选择了平凡的生活。但修真的种子已经在心中种下...',
                            background: 'village',
                            choices: null,
                            rewards: { spiritStone: 100, message: '获得灵石100' }
                        }
                    ],
                    rewards: {
                        exp: 2000,
                        spiritStone: 1000,
                        items: []
                    }
                }
            }
        };
    }

    /**
     * 获取剧情页面HTML
     * @returns {string} HTML字符串
     */
    getStoryPageHTML() {
        const storyData = this.getStoryData();
        const state = this.engine.state.data.story;
        const currentChapter = storyData.chapters[state.currentChapter];
        const isCompleted = state.completedChapters.includes(state.currentChapter);

        return `
            <div class="page story-page">
                <div class="page-header">
                    <button class="btn-back-home">← 返回</button>
                    <h2>剧情系统</h2>
                </div>
                
                <div class="story-content">
                    <div class="story-intro">
                        <h2>修真之路</h2>
                        <p>你是一名普通的凡人，机缘巧合之下踏上了修真之路。</p>
                        <p>在这个充满机遇与挑战的世界里，你将经历各种奇遇，结识不同的人物，逐步成长为一名强大的修士。</p>
                    </div>
                    
                    <div class="story-chapters">
                        <h3>当前章节</h3>
                        <div class="chapter-card ${isCompleted ? 'completed' : ''}">
                            <h4>${currentChapter.title}</h4>
                            <p>你在一个小村庄中长大，偶然发现了一本古老的修真典籍...</p>
                            ${isCompleted ? `
                                <button class="btn btn-secondary btn-replay-story">重新体验</button>
                            ` : `
                                <button class="btn btn-primary btn-start-story">开始剧情</button>
                            `}
                        </div>
                        
                        ${state.completedChapters.length > 0 ? `
                            <div class="completed-chapters">
                                <h3>已完成章节</h3>
                                ${state.completedChapters.map(chapterId => {
                                    const chapter = storyData.chapters[chapterId];
                                    return chapter ? `
                                        <div class="chapter-item completed">
                                            <span class="chapter-title">${chapter.title}</span>
                                            <span class="chapter-status">已完成</span>
                                        </div>
                                    ` : '';
                                }).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 获取剧情对话框HTML
     * @param {number} chapterId - 章节ID
     * @param {number} sceneId - 场景ID
     * @returns {string} HTML字符串
     */
    getStoryDialogHTML(chapterId, sceneId) {
        const storyData = this.getStoryData();
        const chapter = storyData.chapters[chapterId];
        const scene = chapter.scenes[sceneId];

        if (!scene) {
            return `
                <div class="story-dialog-container">
                    <div class="story-dialog">
                        <div class="dialog-content">
                            <h3>剧情结束</h3>
                            <p>恭喜你完成了${chapter.title}！</p>
                            <button class="btn btn-primary btn-finish-chapter">完成章节</button>
                        </div>
                    </div>
                </div>
            `;
        }

        let choicesHTML = '';
        if (scene.choices && scene.choices.length > 0) {
            choicesHTML = `
                <div class="dialog-choices">
                    ${scene.choices.map((choice, index) => `
                        <button class="btn btn-secondary dialog-choice" data-choice-index="${index}">
                            ${choice.text}
                        </button>
                    `).join('')}
                </div>
            `;
        } else {
            choicesHTML = `
                <div class="dialog-actions">
                    <button class="btn btn-primary btn-next-scene">继续</button>
                </div>
            `;
        }

        return `
            <div class="story-dialog-container">
                <div class="story-dialog">
                    <div class="dialog-header">
                        <span class="dialog-speaker">${scene.speaker}</span>
                        <button class="btn-close-dialog">✕</button>
                    </div>
                    <div class="dialog-content">
                        <p class="dialog-text">${scene.text}</p>
                        ${choicesHTML}
                    </div>
                    <div class="dialog-progress">
                        场景 ${sceneId + 1} / ${chapter.scenes.length}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 开始剧情
     */
    startStory() {
        const state = this.engine.state.data.story;
        const storyData = this.getStoryData();
        const currentChapter = storyData.chapters[state.currentChapter];

        if (!currentChapter) {
            this.showNotification('所有章节已完成！', 'success');
            return;
        }

        // 重置当前章节的场景进度
        state.currentScene = 0;
        this.engine.state.save();

        // 显示剧情对话框
        this.showStoryDialog(state.currentChapter, state.currentScene);
    }

    /**
     * 显示剧情对话框
     * @param {number} chapterId - 章节ID
     * @param {number} sceneId - 场景ID
     */
    showStoryDialog(chapterId, sceneId) {
        const mainContainer = document.getElementById('main-container');
        if (!mainContainer) return;

        const dialogHTML = this.getStoryDialogHTML(chapterId, sceneId);
        mainContainer.insertAdjacentHTML('beforeend', dialogHTML);

        this.bindStoryDialogEvents(chapterId, sceneId);
    }

    /**
     * 绑定剧情对话框事件
     * @param {number} chapterId - 章节ID
     * @param {number} sceneId - 场景ID
     */
    bindStoryDialogEvents(chapterId, sceneId) {
        const storyData = this.getStoryData();
        const chapter = storyData.chapters[chapterId];
        const scene = chapter.scenes[sceneId];

        // 关闭按钮
        const btnClose = document.querySelector('.btn-close-dialog');
        if (btnClose) {
            btnClose.addEventListener('click', () => {
                this.closeStoryDialog();
            });
        }

        // 继续按钮
        const btnNext = document.querySelector('.btn-next-scene');
        if (btnNext) {
            btnNext.addEventListener('click', () => {
                this.nextScene(chapterId, sceneId);
            });
        }

        // 选择按钮
        const choiceBtns = document.querySelectorAll('.dialog-choice');
        choiceBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const choiceIndex = parseInt(btn.dataset.choiceIndex);
                this.makeChoice(chapterId, sceneId, choiceIndex);
            });
        });

        // 完成章节按钮
        const btnFinish = document.querySelector('.btn-finish-chapter');
        if (btnFinish) {
            btnFinish.addEventListener('click', () => {
                this.finishChapter(chapterId);
            });
        }
    }

    /**
     * 下一个场景
     * @param {number} chapterId - 章节ID
     * @param {number} sceneId - 当前场景ID
     */
    nextScene(chapterId, sceneId) {
        const storyData = this.getStoryData();
        const chapter = storyData.chapters[chapterId];

        // 检查当前场景是否有奖励
        const currentScene = chapter.scenes[sceneId];
        if (currentScene.rewards) {
            this.giveStoryRewards(currentScene.rewards);
        }

        // 移除当前对话框
        this.closeStoryDialog();

        // 进入下一个场景
        const nextSceneId = sceneId + 1;
        if (nextSceneId < chapter.scenes.length) {
            this.engine.state.data.story.currentScene = nextSceneId;
            this.engine.state.save();
            this.showStoryDialog(chapterId, nextSceneId);
        } else {
            // 章节完成
            this.showStoryDialog(chapterId, nextSceneId);
        }
    }

    /**
     * 做出选择
     * @param {number} chapterId - 章节ID
     * @param {number} sceneId - 场景ID
     * @param {number} choiceIndex - 选择索引
     */
    makeChoice(chapterId, sceneId, choiceIndex) {
        const storyData = this.getStoryData();
        const chapter = storyData.chapters[chapterId];
        const scene = chapter.scenes[sceneId];
        const choice = scene.choices[choiceIndex];

        // 给予选择奖励
        if (choice.reward) {
            this.giveStoryRewards(choice.reward);
        }

        // 移除当前对话框
        this.closeStoryDialog();

        // 跳转到指定场景
        if (choice.nextScene !== undefined) {
            this.engine.state.data.story.currentScene = choice.nextScene;
            this.engine.state.save();
            this.showStoryDialog(chapterId, choice.nextScene);
        }
    }

    /**
     * 给予剧情奖励
     * @param {Object} rewards - 奖励对象
     */
    giveStoryRewards(rewards) {
        const state = this.engine.state.data;

        if (rewards.exp !== undefined && rewards.exp !== null) {
            state.realm.exp += rewards.exp;
            this.showNotification(`获得修为 ${rewards.exp}`, 'success');
        }

        if (rewards.spiritStone !== undefined && rewards.spiritStone !== null) {
            state.resources.spiritStone += rewards.spiritStone;
            this.showNotification(`获得灵石 ${rewards.spiritStone}`, 'success');
        }

        if (rewards.message) {
            this.showNotification(rewards.message, 'success');
        }

        this.engine.state.save();
    }

    /**
     * 完成章节
     * @param {number} chapterId - 章节ID
     */
    finishChapter(chapterId) {
        const state = this.engine.state.data.story;
        const storyData = this.getStoryData();
        const chapter = storyData.chapters[chapterId];

        // 标记章节完成
        if (!state.completedChapters.includes(chapterId)) {
            state.completedChapters.push(chapterId);
        }

        // 给予章节完成奖励
        if (chapter.rewards) {
            this.giveStoryRewards(chapter.rewards);
        }

        this.engine.state.save();
        this.closeStoryDialog();

        // 返回剧情页面
        this.switchPage('story');
        this.showNotification(`恭喜完成${chapter.title}！`, 'success');
    }

    /**
     * 关闭剧情对话框
     */
    closeStoryDialog() {
        const dialogContainer = document.querySelector('.story-dialog-container');
        if (dialogContainer) {
            dialogContainer.remove();
        }
    }

    // ==================== 历练页 ====================

    /**
     * 获取历练页面HTML
     * @returns {string} HTML字符串
     */
    getExpeditionPageHTML() {
        const maps = [
            { id: 'east_sea', name: '东海之滨', level: 1, realm: '凡人', description: '东海沿岸的渔村，是修真者的起点', drops: ['铜币', '草药', '海鲜'] },
            { id: 'ten_thousand_mountains', name: '十万大山', level: 10, realm: '后天', description: '连绵不断的山脉，妖兽众多', drops: ['银币', '兽皮', '山珍'] },
            { id: 'ancient_forest', name: '蛮荒古林', level: 20, realm: '先天', description: '古老的森林，充满神秘气息', drops: ['银币', '灵草', '木材'] },
            { id: 'east_continent', name: '东胜神洲', level: 30, realm: '炼气', description: '四大部洲之一，修真文明繁荣', drops: ['金币', '灵器', '丹药'] },
            { id: 'south_continent', name: '南瞻部洲', level: 40, realm: '筑基', description: '四大部洲之一，商业发达', drops: ['金币', '法宝', '材料'] },
            { id: 'west_continent', name: '西牛贺洲', level: 50, realm: '金丹', description: '四大部洲之一，佛法昌盛', drops: ['仙玉', '佛经', '舍利'] },
            { id: 'north_continent', name: '北俱芦洲', level: 60, realm: '元婴', description: '四大部洲之一，武学圣地', drops: ['仙玉', '武学秘籍', '神兵'] },
            { id: 'central_domain', name: '中州仙域', level: 70, realm: '化神', description: '仙界中心，强者云集', drops: ['神石', '仙器', '仙药'] },
            { id: 'ancient_battlefield', name: '上古战场', level: 80, realm: '炼虚', description: '远古大战的战场，遗迹众多', drops: ['神石', '古宝', '传承'] },
            { id: '不周_foot', name: '不周山脚', level: 90, realm: '合体', description: '不周山脚下，灵气浓郁', drops: ['混沌石', '灵根', '圣药'] },
            { id: '不周_mid', name: '不周山腰', level: 100, realm: '大乘', description: '不周山中部，云雾缭绕', drops: ['混沌石', '道果', '仙器'] },
            { id: '不周_top', name: '不周山巅', level: 110, realm: '地仙', description: '不周山山顶，接近天庭', drops: ['混沌石', '仙晶', '神器'] },
            { id: 'thirty_three_heavens', name: '三十三天外', level: 120, realm: '天仙', description: '天庭所在，神圣不可侵犯', drops: ['先天灵宝', '仙位', '法则碎片'] },
            { id: 'chaos_void', name: '混沌虚空', level: 130, realm: '金仙', description: '宇宙起源之地，混沌之力弥漫', drops: ['混沌灵宝', '大道碎片', '创世之力'] }
        ];
        
        return `
            <div class="page expedition-page">
                <div class="page-header">
                    <button class="btn-back-home">← 返回</button>
                    <h2>历练系统</h2>
                </div>
                
                <div class="expedition-content">
                    <div class="map-list">
                        <h2>选择地图</h2>
                        ${maps.map(map => `
                            <div class="map-card">
                                <h3>${map.name}</h3>
                                <p>推荐等级：${map.level}</p>
                                <p>适合境界：${map.realm}</p>
                                <p>${map.description}</p>
                                <p>掉落物品：${map.drops.join('、')}</p>
                                <button class="btn btn-primary map-enter-btn" data-map-id="${map.id}">进入</button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 开始历练
     * @param {string} mapId - 地图ID
     * @param {number} level - 当前关卡
     */
    startExpedition(mapId, level = 1) {
        // 生成战斗画面
        const battleHTML = this.getBattlePageHTML(mapId, level);
        const mainContainer = document.getElementById('main-container');
        if (mainContainer) {
            mainContainer.innerHTML = battleHTML;
            this.bindBattleEvents(mapId, level);
        } else {
            console.error('Main container not found');
        }
    }

    /**
     * 获取战斗页面HTML
     * @param {string} mapId - 地图ID
     * @param {number} level - 当前关卡
     * @returns {string} HTML字符串
     */
    getBattlePageHTML(mapId, level = 1) {
        // 随机生成怪物
        const monsters = this.generateMonsters(mapId);
        
        // 获取玩家属性
        const character = this.engine.state.data.character || { attributes: { rootBone: 10, agility: 10, comprehension: 10, luck: 10 } };
        const derivedAttributes = this.calculateDerivedAttributes(character.attributes);
        
        // 获取出战宠物
        const activePet = this.engine.petSystem ? this.engine.petSystem.getActivePet() : null;
        
        // 地图名称映射
        const mapNames = {
            east_sea: '东海',
            ten_thousand_mountains: '十万大山',
            ancient_forest: '远古森林',
            east_continent: '东胜神州',
            south_continent: '南赡部洲',
            west_continent: '西牛贺洲'
        };
        
        const mapName = mapNames[mapId] || '未知地图';
        
        return `
            <div class="page battle-page">
                <div class="page-header">
                    <button class="btn-back-home">← 返回</button>
                    <h2>${mapName} 第${level}关</h2>
                </div>
                
                <div class="battle-content">
                    <div class="battle-info-container">
                        <div class="battle-player-info">
                            <div class="battle-entity">
                                <h3>玩家名称</h3>
                                <div class="battle-stats">
                                    <div class="battle-stat hp">
                                            <div class="battle-stat-bar">
                                                <div class="battle-stat-fill hp-fill" style="width: 100%"></div>
                                                <span class="battle-stat-value">${derivedAttributes.hp}/${derivedAttributes.hp}</span>
                                            </div>
                                        </div>
                                        <div class="battle-stat mp">
                                            <div class="battle-stat-bar">
                                                <div class="battle-stat-fill mp-fill" style="width: 100%"></div>
                                                <span class="battle-stat-value">${derivedAttributes.mp}/${derivedAttributes.mp}</span>
                                            </div>
                                        </div>
                                </div>
                            </div>
                            
                            ${activePet ? `
                                <div class="battle-pet-info">
                                    <div class="battle-entity pet-entity">
                                        <h3>${activePet.icon} ${activePet.name} (Lv.${activePet.level})</h3>
                                        <div class="battle-stats">
                                            <div class="battle-stat hp">
                                                <div class="battle-stat-bar">
                                                    <div class="battle-stat-fill hp-fill" style="width: 100%"></div>
                                                    <span class="battle-stat-value">${activePet.attributes.hp}/${activePet.attributes.hp}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ` : ''}
                            
                            <div class="battle-monsters-container">
                                ${monsters.map((monster, index) => `
                                    <div class="battle-entity monster" data-monster-id="${index}">
                                        <h3>怪物${index + 1} ${monster.name}</h3>
                                        <div class="battle-stats">
                                            <div class="battle-stat hp">
                                                <div class="battle-stat-bar">
                                                    <div class="battle-stat-fill hp-fill" style="width: 100%"></div>
                                                    <span class="battle-stat-value">${monster.hp}/${monster.hp}</span>
                                                </div>
                                            </div>
                                            <div class="battle-stat mp">
                                                <div class="battle-stat-bar">
                                                    <div class="battle-stat-fill mp-fill" style="width: 100%"></div>
                                                    <span class="battle-stat-value">${monster.mp || 100}/${monster.mp || 100}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    
                    <div class="battle-options">
                        <div class="battle-option-item">
                            <input type="checkbox" id="battle-acceleration" ${this.engine.state.data.settings?.battle?.acceleration ? 'checked' : ''}>
                            <label for="battle-acceleration">战斗加速</label>
                        </div>
                        <div class="battle-option-item">
                            <input type="checkbox" id="skip-battle" ${this.engine.state.data.settings?.battle?.skip ? 'checked' : ''}>
                            <label for="skip-battle">跳过战斗</label>
                        </div>
                    </div>
                    
                    <div class="battle-log">
                        <h3>战斗日志</h3>
                        <div id="battle-log-content" class="battle-log-content">
                            <p>【第一回合】</p>
                            <p>战斗开始！</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 生成怪物
     * @param {string} mapId - 地图ID
     * @returns {Array} 怪物数组
     */
    generateMonsters(mapId) {
        const monsterTypes = {
            east_sea: [
                { name: '海妖', level: 1, hp: 50, attack: 10, type: '小怪', drops: ['铜币', '草药', '海鲜'] },
                { name: '虾兵', level: 3, hp: 100, attack: 20, type: '精英', drops: ['银币', '虾壳', '海鲜'] },
                { name: '龙王太子', level: 5, hp: 300, attack: 50, type: 'BOSS', drops: ['金币', '龙鳞', '海珠'] }
            ],
            ten_thousand_mountains: [
                { name: '山狼', level: 10, hp: 300, attack: 50, type: '小怪', drops: ['银币', '兽皮', '山珍'] },
                { name: '虎妖', level: 15, hp: 500, attack: 80, type: '精英', drops: ['金币', '虎皮', '虎骨'] },
                { name: '山大王', level: 20, hp: 1000, attack: 150, type: 'BOSS', drops: ['金币', '妖丹', '神兵'] }
            ],
            ancient_forest: [
                { name: '树精', level: 20, hp: 400, attack: 70, type: '小怪', drops: ['银币', '灵草', '木材'] },
                { name: '森林守卫', level: 25, hp: 600, attack: 100, type: '精英', drops: ['金币', '灵木', '森林之心'] },
                { name: '树妖女王', level: 30, hp: 1200, attack: 180, type: 'BOSS', drops: ['金币', '生命之种', '木之精华'] }
            ],
            east_continent: [
                { name: '修真者', level: 30, hp: 500, attack: 100, type: '小怪', drops: ['金币', '灵器', '丹药'] },
                { name: '门派弟子', level: 35, hp: 700, attack: 130, type: '精英', drops: ['金币', '法宝', '武学秘籍'] },
                { name: '门派长老', level: 40, hp: 1500, attack: 200, type: 'BOSS', drops: ['仙玉', '高级法宝', '传承'] }
            ],
            south_continent: [
                { name: '商人', level: 40, hp: 600, attack: 120, type: '小怪', drops: ['金币', '法宝', '材料'] },
                { name: '商会护卫', level: 45, hp: 800, attack: 150, type: '精英', drops: ['仙玉', '高级材料', '商业凭证'] },
                { name: '商会会长', level: 50, hp: 1800, attack: 220, type: 'BOSS', drops: ['仙玉', '极品法宝', '商业秘籍'] }
            ],
            west_continent: [
                { name: '和尚', level: 50, hp: 700, attack: 140, type: '小怪', drops: ['仙玉', '佛经', '舍利'] },
                { name: '罗汉', level: 55, hp: 900, attack: 170, type: '精英', drops: ['仙玉', '高级佛经', '罗汉珠'] },
                { name: '佛陀', level: 60, hp: 2000, attack: 250, type: 'BOSS', drops: ['神石', '佛经秘录', '佛骨舍利'] }
            ],
            north_continent: [
                { name: '武师', level: 60, hp: 800, attack: 160, type: '小怪', drops: ['仙玉', '武学秘籍', '神兵'] },
                { name: '武圣', level: 65, hp: 1000, attack: 190, type: '精英', drops: ['神石', '高级武学', '宝剑'] },
                { name: '武神', level: 70, hp: 2200, attack: 280, type: 'BOSS', drops: ['神石', '武学圣典', '神器'] }
            ],
            central_domain: [
                { name: '仙人', level: 70, hp: 900, attack: 180, type: '小怪', drops: ['神石', '仙器', '仙药'] },
                { name: '仙将', level: 75, hp: 1100, attack: 210, type: '精英', drops: ['神石', '高级仙器', '仙果'] },
                { name: '仙帝', level: 80, hp: 2500, attack: 300, type: 'BOSS', drops: ['混沌石', '极品仙器', '仙帝传承'] }
            ],
            ancient_battlefield: [
                { name: '战魂', level: 80, hp: 1000, attack: 200, type: '小怪', drops: ['神石', '古宝', '传承'] },
                { name: '将领', level: 85, hp: 1200, attack: 230, type: '精英', drops: ['混沌石', '古代兵器', '战魂'] },
                { name: '战神', level: 90, hp: 2800, attack: 330, type: 'BOSS', drops: ['混沌石', '远古神器', '战神传承'] }
            ],
           不周_foot: [
                { name: '山脚守卫', level: 90, hp: 1100, attack: 220, type: '小怪', drops: ['混沌石', '灵根', '圣药'] },
                { name: '山神', level: 95, hp: 1300, attack: 250, type: '精英', drops: ['混沌石', '高级灵根', '仙草'] },
                { name: '山君', level: 100, hp: 3000, attack: 350, type: 'BOSS', drops: ['混沌石', '极品灵根', '圣药'] }
            ],
           不周_mid: [
                { name: '云雾妖', level: 100, hp: 1200, attack: 240, type: '小怪', drops: ['混沌石', '道果', '仙器'] },
                { name: '云神', level: 105, hp: 1400, attack: 270, type: '精英', drops: ['混沌石', '高级道果', '高级仙器'] },
                { name: '云帝', level: 110, hp: 3200, attack: 370, type: 'BOSS', drops: ['混沌石', '极品道果', '极品仙器'] }
            ],
           不周_top: [
                { name: '天庭守卫', level: 110, hp: 1300, attack: 260, type: '小怪', drops: ['混沌石', '仙晶', '神器'] },
                { name: '天将', level: 115, hp: 1500, attack: 290, type: '精英', drops: ['混沌石', '高级仙晶', '高级神器'] },
                { name: '天王', level: 120, hp: 3500, attack: 400, type: 'BOSS', drops: ['混沌石', '极品仙晶', '极品神器'] }
            ],
            thirty_three_heavens: [
                { name: '天神', level: 120, hp: 1400, attack: 280, type: '小怪', drops: ['先天灵宝', '仙位', '法则碎片'] },
                { name: '天尊', level: 125, hp: 1600, attack: 310, type: '精英', drops: ['先天灵宝', '高级仙位', '高级法则碎片'] },
                { name: '天帝', level: 130, hp: 3800, attack: 430, type: 'BOSS', drops: ['先天灵宝', '极品仙位', '极品法则碎片'] }
            ],
            chaos_void: [
                { name: '混沌兽', level: 130, hp: 1500, attack: 300, type: '小怪', drops: ['混沌灵宝', '大道碎片', '创世之力'] },
                { name: '混沌守卫', level: 135, hp: 1700, attack: 330, type: '精英', drops: ['混沌灵宝', '高级大道碎片', '高级创世之力'] },
                { name: '混沌主宰', level: 140, hp: 4000, attack: 450, type: 'BOSS', drops: ['混沌灵宝', '极品大道碎片', '极品创世之力'] }
            ]
        };
        
        const availableMonsters = monsterTypes[mapId] || monsterTypes.east_sea;
        const monsterCount = Math.floor(Math.random() * 5) + 1; // 1-5个怪物
        const monsters = [];
        
        for (let i = 0; i < monsterCount; i++) {
            // 随机选择怪物类型，有一定概率出现精英和BOSS
            let monsterType;
            const rand = Math.random();
            if (rand < 0.7) {
                // 70%概率出现小怪
                monsterType = availableMonsters[0];
            } else if (rand < 0.9) {
                // 20%概率出现精英
                monsterType = availableMonsters[1];
            } else {
                // 10%概率出现BOSS
                monsterType = availableMonsters[2];
            }
            
            monsters.push({
                name: monsterType.name,
                level: monsterType.level,
                hp: monsterType.hp,
                maxHp: monsterType.hp,
                mp: monsterType.mp || 100,
                maxMp: monsterType.mp || 100,
                attack: monsterType.attack,
                type: monsterType.type,
                drops: monsterType.drops
            });
        }
        
        return monsters;
    }

    /**
     * 绑定战斗事件
     */

    /**
     * 绑定剧情事件
     */
    bindStoryEvents() {
        const btnBack = document.querySelector('.btn-back-home');
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                this.switchPage('home');
            });
        }
        
        // 绑定开始剧情按钮
        const btnStartStory = document.querySelector('.btn-start-story');
        if (btnStartStory) {
            btnStartStory.addEventListener('click', () => {
                this.startStory();
            });
        }
        
        // 绑定重新体验按钮
        const btnReplayStory = document.querySelector('.btn-replay-story');
        if (btnReplayStory) {
            btnReplayStory.addEventListener('click', () => {
                this.startStory();
            });
        }
    }

    bindExpeditionEvents() {
        const btnBack = document.querySelector('.btn-back-home');
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                this.switchPage('home');
            });
        }
        
        const mapEnterBtns = document.querySelectorAll('.map-enter-btn');
        mapEnterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const mapId = btn.dataset.mapId;
                this.startExpedition(mapId);
            });
        });
    }

    bindBattleEvents(mapId, level = 1) {
        const btnBack = document.querySelector('.btn-back-home');
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                this.switchPage('expedition');
            });
        }
        
        // 绑定战斗加速和跳过战斗按钮的事件
        const battleAccelerationCheckbox = document.getElementById('battle-acceleration');
        const skipBattleCheckbox = document.getElementById('skip-battle');
        
        if (battleAccelerationCheckbox) {
            battleAccelerationCheckbox.addEventListener('change', () => {
                if (!this.engine.state.data.settings) {
                    this.engine.state.data.settings = {};
                }
                if (!this.engine.state.data.settings.battle) {
                    this.engine.state.data.settings.battle = {};
                }
                this.engine.state.data.settings.battle.acceleration = battleAccelerationCheckbox.checked;
                this.engine.state.save();
            });
        }
        
        if (skipBattleCheckbox) {
            skipBattleCheckbox.addEventListener('change', () => {
                if (!this.engine.state.data.settings) {
                    this.engine.state.data.settings = {};
                }
                if (!this.engine.state.data.settings.battle) {
                    this.engine.state.data.settings.battle = {};
                }
                this.engine.state.data.settings.battle.skip = skipBattleCheckbox.checked;
                this.engine.state.save();
            });
        }
        
        // 战斗状态
        let battleState = {
            player: {
                hp: this.engine.state.data.character?.attributes?.rootBone * 100 || 1000,
                maxHp: this.engine.state.data.character?.attributes?.rootBone * 100 || 1000,
                mp: this.engine.state.data.character?.attributes?.comprehension * 50 || 500,
                maxMp: this.engine.state.data.character?.attributes?.comprehension * 50 || 500,
                attack: this.calculateDerivedAttributes(this.engine.state.data.character?.attributes || { rootBone: 10, agility: 10, comprehension: 10, luck: 10 }).attack
            },
            monsters: [],
            currentMonsterIndex: 0
        };
        
        // 初始化怪物状态
        const monsters = this.generateMonsters(mapId);
        const monsterEntities = document.querySelectorAll('.battle-entity.monster');
        monsterEntities.forEach((entity, index) => {
            const name = entity.querySelector('h3').textContent;
            const hpValue = entity.querySelector('.battle-stat.hp .battle-stat-value').textContent;
            const mpValue = entity.querySelector('.battle-stat.mp .battle-stat-value').textContent;
            const hp = parseInt(hpValue.split('/')[0]);
            const mp = parseInt(mpValue.split('/')[0]);
            const attack = 50; // 简化处理，实际应该从怪物数据中获取
            
            // 获取怪物的掉落物品
            const monsterData = monsters[index];
            const drops = monsterData ? monsterData.drops : [];
            
            battleState.monsters.push({
                name,
                hp,
                maxHp: hp,
                mp,
                maxMp: mp,
                attack,
                drops
            });
        });
        
        // 更新战斗日志
        function updateBattleLog(message) {
            const logContent = document.getElementById('battle-log-content');
            if (logContent) {
                const p = document.createElement('p');
                p.textContent = message;
                logContent.appendChild(p);
                logContent.scrollTop = logContent.scrollHeight;
            }
        }
        
        // 更新怪物生命值和法力值
        function updateMonsterStats(index, hp, mp) {
            const monsterEntity = document.querySelector(`.battle-entity.monster[data-monster-id="${index}"]`);
            if (monsterEntity) {
                // 更新生命值
                const hpElement = monsterEntity.querySelector('.battle-stat.hp .battle-stat-value');
                const hpBar = monsterEntity.querySelector('.battle-stat.hp .battle-stat-fill');
                if (hpElement && hpBar) {
                    const maxHp = battleState.monsters[index].maxHp;
                    hpElement.textContent = `${hp}/${maxHp}`;
                    hpBar.style.width = `${(hp / maxHp) * 100}%`;
                }
                
                // 更新法力值
                const mpElement = monsterEntity.querySelector('.battle-stat.mp .battle-stat-value');
                const mpBar = monsterEntity.querySelector('.battle-stat.mp .battle-stat-fill');
                if (mpElement && mpBar) {
                    const maxMp = battleState.monsters[index].maxMp;
                    mpElement.textContent = `${mp}/${maxMp}`;
                    mpBar.style.width = `${(mp / maxMp) * 100}%`;
                }
            }
        }
        
        // 更新玩家生命值和法力值
        function updatePlayerStats(hp, mp) {
            const playerEntity = document.querySelector('.battle-entity:not(.monster)');
            if (playerEntity) {
                // 更新生命值
                const hpElement = playerEntity.querySelector('.battle-stat.hp .battle-stat-value');
                const hpBar = playerEntity.querySelector('.battle-stat.hp .battle-stat-fill');
                if (hpElement && hpBar) {
                    const maxHp = battleState.player.maxHp;
                    hpElement.textContent = `${hp}/${maxHp}`;
                    hpBar.style.width = `${(hp / maxHp) * 100}%`;
                }
                
                // 更新法力值
                const mpElement = playerEntity.querySelector('.battle-stat.mp .battle-stat-value');
                const mpBar = playerEntity.querySelector('.battle-stat.mp .battle-stat-fill');
                if (mpElement && mpBar) {
                    const maxMp = battleState.player.maxMp;
                    mpElement.textContent = `${mp}/${maxMp}`;
                    mpBar.style.width = `${(mp / maxMp) * 100}%`;
                }
            }
        }
        
        // 显示战斗失败提示
        function showDefeatDialog() {
            const dialog = document.createElement('div');
            dialog.className = 'battle-defeat-dialog';
            dialog.innerHTML = `
                <div class="dialog-content">
                    <h3>战斗失败</h3>
                    <p>你在战斗中失败了！</p>
                    <div class="dialog-buttons">
                        <button class="btn btn-primary" id="btn-improve-skills">提升功法</button>
                        <button class="btn btn-secondary" id="btn-enhance-equipment">强化装备</button>
                        <button class="btn btn-secondary" id="btn-train-body">锤炼肉身</button>
                    </div>
                </div>
            `;
            document.body.appendChild(dialog);
            
            // 保存 uiManager 实例的引用
            const uiManager = this;
            
            // 绑定按钮事件
            document.getElementById('btn-improve-skills').addEventListener('click', function() {
                uiManager.switchPage('skills');
                dialog.remove();
            });
            
            document.getElementById('btn-enhance-equipment').addEventListener('click', function() {
                uiManager.switchPage('equipment');
                dialog.remove();
            });
            
            document.getElementById('btn-train-body').addEventListener('click', function() {
                uiManager.switchPage('body');
                dialog.remove();
            });
        }
        
        // 显示战斗停止提示
        function showBattleStopDialog(reason) {
            const dialog = document.createElement('div');
            dialog.className = 'battle-stop-dialog';
            dialog.innerHTML = `
                <div class="dialog-content">
                    <h3>战斗停止</h3>
                    <p>${reason}</p>
                    <div class="dialog-buttons">
                        <button class="btn btn-primary" id="btn-back-expedition">返回历练</button>
                    </div>
                </div>
            `;
            document.body.appendChild(dialog);
            
            // 保存 uiManager 实例的引用
            const uiManager = this;
            
            // 绑定按钮事件
            document.getElementById('btn-back-expedition').addEventListener('click', function() {
                uiManager.switchPage('expedition');
                dialog.remove();
            });
        }
        
        // 检查挑战下一关的消耗物品
        function checkNextLevelCost(level) {
            // 这里可以根据关卡级别设置不同的消耗物品
            const costItems = {
                5: { id: '灵石', count: 1000 },
                10: { id: '仙玉', count: 100 },
                15: { id: '神石', count: 10 }
            };
            
            const cost = costItems[level];
            if (cost) {
                const inventory = this.engine.state.data.inventory || [];
                const item = inventory.find(item => item.id === cost.id);
                if (!item || item.count < cost.count) {
                    return { canProceed: false, reason: `挑战第${level}关需要${cost.count}${cost.id}，当前数量不足！` };
                }
                // 消耗物品
                item.count -= cost.count;
                return { canProceed: true, reason: '' };
            }
            return { canProceed: true, reason: '' };
        }
        
        // 战斗逻辑
        function battle() {
            const skipBattle = this.engine.state.data.settings?.battle?.skip || false;
            const battleAcceleration = this.engine.state.data.settings?.battle?.acceleration || false;
            
            // 循环攻击所有怪物
            for (let i = 0; i < battleState.monsters.length; i++) {
                let monster = battleState.monsters[i];
                
                while (monster.hp > 0 && battleState.player.hp > 0) {
                    // 玩家攻击
                    const playerDamage = battleState.player.attack;
                    monster.hp -= playerDamage;
                    if (monster.hp < 0) monster.hp = 0;
                    
                    // 玩家消耗法力
                    const mpCost = 10;
                    battleState.player.mp -= mpCost;
                    if (battleState.player.mp < 0) battleState.player.mp = 0;
                    
                    if (!skipBattle) {
                        updateMonsterStats(i, monster.hp, monster.mp);
                        updatePlayerStats(battleState.player.hp, battleState.player.mp);
                        updateBattleLog(`你对${monster.name}造成了${playerDamage}点伤害！`);
                    }
                    
                    // 检查怪物是否死亡
                    if (monster.hp <= 0) {
                        if (!skipBattle) {
                            updateBattleLog(`${monster.name}被击败了！`);
                        }
                        break;
                    }
                    
                    // 怪物攻击
                    const monsterDamage = monster.attack;
                    battleState.player.hp -= monsterDamage;
                    if (battleState.player.hp < 0) battleState.player.hp = 0;
                    
                    // 怪物消耗法力
                    const monsterMpCost = 5;
                    monster.mp -= monsterMpCost;
                    if (monster.mp < 0) monster.mp = 0;
                    
                    if (!skipBattle) {
                        updatePlayerStats(battleState.player.hp, battleState.player.mp);
                        updateMonsterStats(i, monster.hp, monster.mp);
                        updateBattleLog(`${monster.name}对你造成了${monsterDamage}点伤害！`);
                    }
                    
                    // 检查玩家是否死亡
                    if (battleState.player.hp <= 0) {
                        if (!skipBattle) {
                            updateBattleLog('你被击败了！');
                        }
                        showDefeatDialog.call(this);
                        return;
                    }
                    
                    // 战斗加速
                    if (!battleAcceleration && !skipBattle) {
                        // 正常速度战斗，添加延迟
                        return new Promise(resolve => {
                            setTimeout(() => {
                                resolve();
                            }, 500);
                        });
                    }
                }
                
                // 检查玩家是否死亡
                if (battleState.player.hp <= 0) {
                    return;
                }
            }
            
            // 战斗胜利
            if (!skipBattle) {
                updateBattleLog('战斗胜利！');
            }
            this.showNotification('战斗胜利！', 'success');
            
            // 更新怪物击杀统计
            if (this.engine.achievementSystem) {
                this.engine.achievementSystem.updateStats('monsterKilled', battleState.monsters.length);
            }
            
            // 更新每日任务进度
            if (this.engine.dailyTaskSystem) {
                this.engine.dailyTaskSystem.updateTaskProgress('killMonster', battleState.monsters.length);
            }
            
            // 处理掉落物品
            battleState.monsters.forEach(monster => {
                if (monster.drops && monster.drops.length > 0) {
                    // 随机掉落1-2个物品，100%掉落概率
                    const dropCount = Math.floor(Math.random() * 2) + 1;
                    const droppedItems = [];
                    
                    for (let i = 0; i < dropCount; i++) {
                        if (monster.drops.length > 0) {
                            const randomIndex = Math.floor(Math.random() * monster.drops.length);
                            const itemName = monster.drops[randomIndex];
                            droppedItems.push(itemName);
                            
                            // 创建物品对象并添加到背包
                            const item = {
                                id: itemName,  // 使用中文名称作为ID，便于图标映射
                                name: itemName,
                                type: 'material',
                                count: 1
                            };
                            this.engine.addToInventory(item);
                        }
                    }
                    
                    // 显示获得物品的通知
                    if (droppedItems.length > 0) {
                        this.showNotification(`获得物品：${droppedItems.join('、')}`, 'success');
                    }
                }
            });
            
            // 检查是否可以挑战下一关
            const nextLevel = level + 1;
            const costCheck = checkNextLevelCost.call(this, nextLevel);
            
            if (costCheck.canProceed) {
                // 自动挑战下一关
                setTimeout(() => {
                    this.startExpedition(mapId, nextLevel);
                }, 1000);
            } else {
                // 显示战斗停止提示
                showBattleStopDialog.call(this, costCheck.reason);
            }
        }
        
        // 自动开始战斗
        battle.call(this);
    }
    
    /**
     * 生成掉落物品
     * @param {Object} monster - 怪物对象
     * @returns {Array} 掉落物品数组
     */
    generateDrops(monster) {
        // 简单的掉落逻辑
        const drops = [];
        const dropChance = 1; // 70%的概率掉落物品
        
        if (Math.random() < dropChance) {
            // 根据怪物等级和类型生成掉落
            if (monster.level < 10) {
                drops.push('铜币');
                if (Math.random() < 0.5) drops.push('草药');
            } else if (monster.level < 30) {
                drops.push('银币');
                if (Math.random() < 0.4) drops.push('兽皮');
            } else if (monster.level < 60) {
                drops.push('金币');
                if (Math.random() < 0.3) drops.push('灵器');
            } else {
                drops.push('仙玉');
                if (Math.random() < 0.2) drops.push('仙器');
            }
        }
        
        return drops;
    }

    // ==================== 礼包页面 ====================

    /**
     * 获取礼包页面HTML
     * @returns {string} HTML字符串
     */
    getGiftPageHTML() {
        const gifts = this.engine.giftSystem.getAvailableGifts();

        return `
            <div class="page gift-page">
                <div class="page-header">
                    <button class="btn-back-home">← 返回</button>
                    <h2>礼包中心</h2>
                </div>
                
                <div class="gift-page-content">
                    ${gifts.length > 0 ? gifts.map(gift => `
                        <div class="gift-card">
                            <div class="gift-header">
                                <h3>${gift.name}</h3>
                                <span class="gift-type">${GameConfig.GIFT.types.find(t => t.id === gift.type).name}</span>
                            </div>
                            <div class="gift-items">
                                ${gift.items.map(item => `
                                    <div class="gift-item">
                                        <span class="item-name">${item.name}</span>
                                        <span class="item-quantity">x${item.quantity}</span>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="gift-footer">
                                ${gift.type !== 'free' ? `
                                    <div class="gift-price">
                                        ${gift.price}
                                        ${gift.type === 'spiritStone' ? '灵石' : gift.type === 'immortalStone' ? '仙晶' : '元'}
                                    </div>
                                ` : '<div class="gift-price"></div>'}
                                <button class="btn ${gift.canPurchase ? 'btn-primary' : 'btn-disabled'}" 
                                        data-gift-id="${gift.id}" 
                                        ${!gift.canPurchase ? 'disabled' : ''}>
                                    ${gift.canPurchase ? '领取' : '已上限'}
                                </button>
                            </div>
                        </div>
                    `).join('') : `
                        <div class="empty-gifts">
                            <p>当前没有可领取的礼包</p>
                        </div>
                    `}
                </div>
            </div>
        `;
    }

    /**
     * 绑定礼包页面事件
     */
    bindGiftEvents() {
        // 领取礼包按钮
        document.querySelectorAll('.gift-card button[data-gift-id]').forEach(button => {
            button.addEventListener('click', () => {
                const giftId = button.dataset.giftId;
                const result = this.engine.giftSystem.purchaseGift(giftId);
                this.showNotification(result.message, result.success ? 'success' : 'error');
                if (result.success) {
                    // 刷新礼包页面
                    this.switchPage('gift');
                }
            });
        });
    }

    // ==================== 签到页面 ====================

    /**
     * 获取签到页面HTML
     * @returns {string} HTML字符串
     */
    getCheckinPageHTML() {
        const checkinInfo = this.engine.checkinSystem.getCheckinInfo();
        const checkinConfig = GameConfig.CHECKIN[checkinInfo.type];
        
        return `
            <div class="page checkin-page">
                <div class="page-header">
                    <button class="btn-back-home">← 返回</button>
                    <h2>签到中心</h2>
                </div>
                
                <div class="checkin-page-content">
                    <div class="checkin-info">
                        <h3>${checkinInfo.type === 'newbie' ? '新手签到' : '日常签到'}</h3>
                        <p>${checkinInfo.type === 'newbie' ? '连续签到7天，领取丰厚奖励！' : '每日签到，领取奖励！'}</p>
                        <div class="checkin-history">
                            <h4>签到记录</h4>
                            <p>当前连续签到：${checkinInfo.currentDay - 1}天</p>
                            ${checkinInfo.lastCheckinDate ? `<p>上次签到：${checkinInfo.lastCheckinDate}</p>` : ''}
                        </div>
                    </div>
                    
                    <div class="checkin-button">
                        <button class="btn ${checkinInfo.canCheckin ? 'btn-primary' : 'btn-disabled'}" 
                                ${!checkinInfo.canCheckin ? 'disabled' : ''}>
                            ${checkinInfo.canCheckin ? '立即签到' : '今日已签到'}
                        </button>
                    </div>
                    
                    <div class="checkin-calendar">
                        <h4>签到日历</h4>
                        <div class="checkin-days">
                            ${checkinConfig.map((day, index) => {
                                const dayNumber = index + 1;
                                let status = 'future';
                                if (dayNumber < checkinInfo.currentDay) {
                                    status = 'completed';
                                } else if (dayNumber === checkinInfo.currentDay) {
                                    status = checkinInfo.canCheckin ? 'current' : 'future';
                                }
                                return `
                                    <div class="checkin-day ${status}">
                                        <div class="day-number">第${dayNumber}天</div>
                                        <div class="day-rewards">
                                            ${day.items.map(item => `
                                                <div class="reward-item">
                                                    <span class="item-name">${item.name}</span>
                                                    <span class="item-quantity">x${item.quantity}</span>
                                                </div>
                                            `).join('')}
                                        </div>
                                        <div class="day-status">
                                            ${status === 'completed' ? '已领取' : status === 'current' ? '可领取' : '未到'}
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 绑定签到页面事件
     */
    bindCheckinEvents() {
        // 签到按钮
        const checkinButton = document.querySelector('.checkin-button button');
        if (checkinButton) {
            checkinButton.addEventListener('click', () => {
                const result = this.engine.checkinSystem.checkin();
                this.showNotification(result.message, result.success ? 'success' : 'error');
                if (result.success) {
                    // 刷新签到页面
                    this.switchPage('checkin');
                    // 刷新首页的红点提示
                    this.renderHomePage();
                }
            });
        }
    }

    // ==================== 成就页面 ====================

    /**
     * 获取成就进度
     * @param {Object} achievement - 成就信息
     * @returns {Object} 进度信息
     */
    getAchievementProgress(achievement) {
        const stats = this.engine.state.data.achievements?.stats || {};
        const progressTypes = ['monster', 'equipment', 'stamina', 'enhance', 'alchemy'];
        
        if (!progressTypes.includes(achievement.type)) {
            return { showProgress: false };
        }
        
        let current = 0;
        let target = achievement.condition.amount;
        
        switch (achievement.type) {
            case 'monster':
                current = stats.monsterKilled || 0;
                break;
            case 'equipment':
                const quality = achievement.condition.quality || 'normal';
                current = stats.equipmentObtained?.[quality] || 0;
                break;
            case 'stamina':
                current = stats.staminaUsed || 0;
                break;
            case 'enhance':
                current = stats.enhanceStoneUsed || 0;
                break;
            case 'alchemy':
                const level = achievement.condition.level || 1;
                current = stats.pillsCrafted?.[level] || 0;
                break;
        }
        
        const percentage = Math.min(100, Math.floor((current / target) * 100));
        
        return {
            showProgress: true,
            current: current,
            target: target,
            percentage: percentage
        };
    }

    /**
     * 获取成就页面HTML
     * @returns {string} HTML字符串
     */
    getAchievementPageHTML() {
        const achievements = this.engine.achievementSystem.getAllAchievements();
        const achievementTypes = GameConfig.ACHIEVEMENT.types;
        
        // 收集所有未领取的成就
        const visibleAchievements = [];
        
        achievementTypes.forEach(type => {
            const typeAchievements = achievements[type.id] || [];
            for (const achievement of typeAchievements) {
                // 已经领取过奖励的成就不再显示
                if (achievement.claimed) {
                    continue;
                }
                
                // 只显示第一个未领取的成就
                visibleAchievements.push(achievement);
                break;
            }
        });
        
        return `
            <div class="page achievement-page">
                <div class="page-header">
                    <button class="btn-back-home">← 返回</button>
                    <h2>成就中心</h2>
                </div>
                
                <div class="achievement-page-content">
                    <div class="achievement-list">
                        ${visibleAchievements.map(achievement => {
                            // 获取成就进度
                            const progress = this.getAchievementProgress(achievement);
                            
                            return `
                                <div class="achievement-item ${achievement.completed ? 'completed' : ''}">
                                    <div class="achievement-info">
                                        <div class="achievement-title-row">
                                            <h4>${achievement.name}</h4>
                                            ${progress.showProgress ? `
                                                <span class="achievement-progress-text">${progress.current}/${progress.target}</span>
                                            ` : ''}
                                        </div>
                                        <p>${achievement.description}</p>
                                    </div>
                                    <div class="achievement-rewards">
                                        ${achievement.rewards.map(reward => `
                                            <div class="reward-item">
                                                <span class="item-name">${reward.name}</span>
                                                <span class="item-quantity">x${reward.quantity}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                    <div class="achievement-status">
                                        ${achievement.completed ? 
                                            `<button class="btn btn-primary claim-btn" data-achievement-id="${achievement.id}">领取</button>` : 
                                            '<span class="status-uncompleted">未完成</span>'
                                        }
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 绑定成就页面事件
     */
    bindAchievementEvents() {
        // 领取成就奖励按钮
        document.querySelectorAll('.claim-btn').forEach(button => {
            button.addEventListener('click', () => {
                const achievementId = button.dataset.achievementId;
                const result = this.engine.achievementSystem.claimAchievement(achievementId);
                this.showNotification(result.message, result.success ? 'success' : 'error');
                if (result.success) {
                    // 刷新成就页面
                    const mainContainer = document.getElementById('main-container');
                    if (mainContainer) {
                        mainContainer.innerHTML = this.getAchievementPageHTML();
                        this.bindAchievementEvents();
                    }
                    this.updateResourceDisplay();
                }
            });
        });
    }

    // ==================== 坊市页面 ====================

    /**
     * 获取坊市页面HTML
     * @returns {string} HTML字符串
     */
    getMarketPageHTML() {
        return `
            <div class="page market-page">
                <div class="page-header">
                    <button class="btn-back-home">← 返回</button>
                    <h2>坊市</h2>
                </div>
                
                <div class="market-tabs">
                    <button class="market-tab active" data-tab="shop">商铺</button>
                    <button class="market-tab" data-tab="auction">交易行</button>
                    <button class="market-tab" data-tab="blackMarket">黑市</button>
                </div>
                
                <div class="market-content">
                    <!-- 商铺内容 -->
                    <div class="market-tab-content active" id="shop-content">
                        ${this.getShopContentHTML()}
                    </div>
                    
                    <!-- 交易行内容 -->
                    <div class="market-tab-content" id="auction-content">
                        ${this.getAuctionContentHTML()}
                    </div>
                    
                    <!-- 黑市内容 -->
                    <div class="market-tab-content" id="blackMarket-content">
                        ${this.getBlackMarketContentHTML()}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 获取商铺内容HTML
     * @returns {string} HTML字符串
     */
    getShopContentHTML() {
        const shopItems = this.engine.marketSystem.getShopItems();
        
        return `
            <div class="shop-content">
                <h3>NPC商铺</h3>
                <div class="shop-items">
                    ${shopItems.map(item => `
                        <div class="shop-item">
                            <div class="item-info">
                                <h4>${item.name}</h4>
                                <p>${item.description}</p>
                            </div>
                            <div class="item-price">
                                ${item.price} ${this.getCurrencyName(item.currency)}
                            </div>
                            <div class="item-actions">
                                <div class="buy-controls">
                                    <select class="quantity-select" data-item-id="${item.id}">
                                        <option value="1">1</option>
                                        <option value="10">10</option>
                                        <option value="50">50</option>
                                    </select>
                                    <button class="btn btn-primary buy-shop-item" data-item-id="${item.id}">购买</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 获取交易行内容HTML
     * @returns {string} HTML字符串
     */
    getAuctionContentHTML() {
        return `
            <div class="auction-content">
                <h3>交易行</h3>
                <div class="auction-tabs">
                    <button class="auction-tab active" data-tab="hall">交易大厅</button>
                    <button class="auction-tab" data-tab="my">我的寄售</button>
                </div>
                <div class="auction-tab-content active" id="auction-hall-content">
                    ${this.getAuctionHallHTML()}
                </div>
                <div class="auction-tab-content" id="auction-my-content">
                    ${this.getMyAuctionHTML()}
                </div>
            </div>
        `;
    }

    /**
     * 获取交易大厅HTML
     * @returns {string} HTML字符串
     */
    getAuctionHallHTML() {
        let auctionItems = this.engine.marketSystem.getAuctionItems();
        // 按到期时间倒序排序
        auctionItems.sort((a, b) => b.endTime - a.endTime);
        
        return `
            <div class="auction-hall">
                <div class="auction-actions">
                    <button class="btn btn-primary" id="auction-item-btn">寄售物品</button>
                </div>
                <div class="auction-items">
                    ${auctionItems.length > 0 ? auctionItems.map(item => `
                        <div class="auction-item">
                            <div class="item-info">
                                <h4>${item.item.name} (${item.item.quantity || 1}个)</h4>
                                <p>卖家: ${item.seller}</p>
                                <p>剩余时间: ${this.formatTime(Math.max(0, Math.floor((item.endTime - Date.now()) / 1000)))}</p>
                            </div>
                            <div class="item-prices">
                                <p>当前价格: ${item.currentPrice} ${this.getCurrencyName(item.startingCurrency || item.currency)}</p>
                                ${item.buyoutPrice ? `<p>一口价: ${item.buyoutPrice} ${this.getCurrencyName(item.buyoutCurrency || item.currency)}</p>` : ''}
                            </div>
                            <div class="item-actions">
                                <button class="btn btn-secondary bid-btn" data-auction-id="${item.id}">出价</button>
                                ${item.buyoutPrice ? `<button class="btn btn-primary buyout-btn" data-auction-id="${item.id}">一口价</button>` : ''}
                            </div>
                        </div>
                    `).join('') : '<p class="no-items">当前没有寄售物品</p>'}
                </div>
            </div>
        `;
    }

    /**
     * 获取我的寄售HTML
     * @returns {string} HTML字符串
     */
    getMyAuctionHTML() {
        const auctionItems = this.engine.state.data.market.auction.items || [];
        const userAuctions = this.engine.state.data.market.auction.userAuctions || [];
        const now = Date.now();
        
        // 过滤出用户自己的寄售物品
        const myAuctions = auctionItems.filter(item => userAuctions.includes(item.id));
        
        // 分类：已售出、流拍、正在寄售
        const soldAuctions = []; // 已售出的物品
        const expiredAuctions = []; // 流拍的物品
        const activeAuctions = []; // 正在寄售的物品
        
        for (const item of myAuctions) {
            if (item.endTime < now) {
                if (item.currentBidder) {
                    // 已售出
                    soldAuctions.push(item);
                } else {
                    // 流拍
                    expiredAuctions.push(item);
                }
            } else {
                // 正在寄售
                activeAuctions.push(item);
            }
        }
        
        return `
            <div class="my-auction">
                <h4>已售出</h4>
                <div class="auction-items">
                    ${soldAuctions.length > 0 ? soldAuctions.map(item => {
                        const feeRate = GameConfig.MARKET.auction.feeRate;
                        const sellerAmount = Math.floor(item.currentPrice * (1 - feeRate));
                        return `
                            <div class="auction-item sold">
                                <div class="item-info">
                                    <h4>${item.item.name} (${item.item.quantity || 1}个)</h4>
                                    <p>买家: ${item.currentBidder}</p>
                                    <p>成交价格: ${item.currentPrice} ${this.getCurrencyName(item.startingCurrency || item.currency)}</p>
                                    <p>实得: ${sellerAmount} ${this.getCurrencyName(item.startingCurrency || item.currency)} (扣除10%手续费)</p>
                                </div>
                                <div class="item-actions">
                                    <button class="btn btn-primary collect-btn" data-auction-id="${item.id}">领取</button>
                                </div>
                            </div>
                        `;
                    }).join('') : '<p class="no-items">暂无已售出物品</p>'}
                </div>
                
                <h4>流拍</h4>
                <div class="auction-items">
                    ${expiredAuctions.length > 0 ? expiredAuctions.map(item => `
                        <div class="auction-item expired">
                            <div class="item-info">
                                    <h4>${item.item.name} (${item.item.quantity || 1}个)</h4>
                                    <p>起拍价: ${item.startingPrice} ${this.getCurrencyName(item.startingCurrency || item.currency)}</p>
                                    <p>状态: 流拍</p>
                                </div>
                            <div class="item-actions">
                                <button class="btn btn-secondary retrieve-btn" data-auction-id="${item.id}">取回</button>
                            </div>
                        </div>
                    `).join('') : '<p class="no-items">暂无流拍物品</p>'}
                </div>
                
                <h4>正在寄售</h4>
                <div class="auction-items">
                    ${activeAuctions.length > 0 ? activeAuctions.map(item => `
                        <div class="auction-item active">
                            <div class="item-info">
                                <h4>${item.item.name} (${item.item.quantity || 1}个)</h4>
                                <p>当前价格: ${item.currentPrice} ${this.getCurrencyName(item.startingCurrency || item.currency)}</p>
                                ${item.buyoutPrice ? `<p>一口价: ${item.buyoutPrice} ${this.getCurrencyName(item.buyoutCurrency || item.currency)}</p>` : ''}
                                <p>剩余时间: ${this.formatTime(Math.max(0, Math.floor((item.endTime - Date.now()) / 1000)))}</p>
                            </div>
                            <div class="item-actions">
                                <button class="btn btn-secondary cancel-btn" data-auction-id="${item.id}">取消</button>
                            </div>
                        </div>
                    `).join('') : '<p class="no-items">暂无正在寄售的物品</p>'}
                </div>
            </div>
        `;
    }

    /**
     * 获取黑市内容HTML
     * @returns {string} HTML字符串
     */
    getBlackMarketContentHTML() {
        const blackMarketItems = this.engine.marketSystem.getBlackMarketItems();
        const lastRefresh = this.engine.state.data.market.blackMarket.lastRefresh;
        const nextRefresh = lastRefresh + GameConfig.MARKET.blackMarket.refreshTime;
        const timeLeft = Math.max(0, Math.floor((nextRefresh - Date.now()) / 1000));
        
        return `
            <div class="blackMarket-content">
                <h3>黑市</h3>
                <div class="blackMarket-info">
                    <p>下次刷新: ${this.formatTime(timeLeft)}</p>
                    <button class="btn btn-secondary ad-refresh-btn">看广告刷新</button>
                </div>
                <div class="blackMarket-items">
                    ${blackMarketItems.map(item => `
                        <div class="blackMarket-item">
                            <div class="item-info">
                                <h4>${item.name}</h4>
                                <p>${item.description}</p>
                            </div>
                            <div class="item-price">
                                ${item.price} ${this.getCurrencyName(item.currency)}
                            </div>
                            <div class="item-actions">
                                <button class="btn btn-primary buy-blackMarket-item" data-item-id="${item.id}">购买</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * 绑定坊市页面事件
     */
    bindMarketEvents() {
        // 标签切换
        document.querySelectorAll('.market-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                // 移除所有标签的active类
                document.querySelectorAll('.market-tab').forEach(t => t.classList.remove('active'));
                // 添加当前标签的active类
                tab.classList.add('active');
                
                // 隐藏所有内容
                document.querySelectorAll('.market-tab-content').forEach(content => content.classList.remove('active'));
                // 显示当前标签的内容
                const tabId = tab.dataset.tab;
                document.getElementById(`${tabId}-content`).classList.add('active');
            });
        });
        
        // 购买商铺物品
        document.querySelectorAll('.buy-shop-item').forEach(button => {
            button.addEventListener('click', () => {
                const itemId = button.dataset.itemId;
                const selectElement = document.querySelector(`.quantity-select[data-item-id="${itemId}"]`);
                const quantity = parseInt(selectElement.value) || 1;
                const result = this.engine.marketSystem.buyShopItem(itemId, quantity);
                this.showNotification(result.message, result.success ? 'success' : 'error');
                if (result.success) {
                    // 刷新商铺内容
                    document.getElementById('shop-content').innerHTML = this.getShopContentHTML();
                    // 重新绑定事件
                    this.bindMarketEvents();
                    // 刷新资源显示
                    this.updateResourceDisplay();
                }
            });
        });
        
        // 购买黑市物品
        document.querySelectorAll('.buy-blackMarket-item').forEach(button => {
            button.addEventListener('click', () => {
                const itemId = button.dataset.itemId;
                const result = this.engine.marketSystem.buyBlackMarketItem(itemId);
                this.showNotification(result.message, result.success ? 'success' : 'error');
                if (result.success) {
                    // 刷新黑市内容
                    document.getElementById('blackMarket-content').innerHTML = this.getBlackMarketContentHTML();
                    // 重新绑定事件
                    this.bindMarketEvents();
                    // 刷新资源显示
                    this.updateResourceDisplay();
                }
            });
        });
        
        // 看广告刷新黑市
        const adRefreshBtn = document.querySelector('.ad-refresh-btn');
        if (adRefreshBtn) {
            adRefreshBtn.addEventListener('click', () => {
                const result = this.engine.marketSystem.adRefreshBlackMarket();
                this.showNotification(result.message, result.success ? 'success' : 'error');
                if (result.success) {
                    // 刷新黑市内容
                    document.getElementById('blackMarket-content').innerHTML = this.getBlackMarketContentHTML();
                    // 重新绑定事件
                    this.bindMarketEvents();
                }
            });
        }
        
        // 出价
        document.querySelectorAll('.bid-btn').forEach(button => {
            button.addEventListener('click', () => {
                const auctionId = button.dataset.auctionId;
                const bidPrice = prompt('请输入出价:');
                if (bidPrice && !isNaN(bidPrice)) {
                    const result = this.engine.marketSystem.bidItem(auctionId, parseFloat(bidPrice));
                    this.showNotification(result.message, result.success ? 'success' : 'error');
                    if (result.success) {
                        // 刷新交易行内容
                        document.getElementById('auction-content').innerHTML = this.getAuctionContentHTML();
                        // 重新绑定事件
                        this.bindMarketEvents();
                        // 刷新资源显示
                        this.updateResourceDisplay();
                    }
                }
            });
        });
        
        // 一口价购买
        document.querySelectorAll('.buyout-btn').forEach(button => {
            button.addEventListener('click', () => {
                const auctionId = button.dataset.auctionId;
                const result = this.engine.marketSystem.buyoutItem(auctionId);
                this.showNotification(result.message, result.success ? 'success' : 'error');
                if (result.success) {
                    // 刷新交易行内容
                    document.getElementById('auction-content').innerHTML = this.getAuctionContentHTML();
                    // 重新绑定事件
                    this.bindMarketEvents();
                    // 刷新资源显示
                    this.updateResourceDisplay();
                }
            });
        });
        
        // 寄售物品
        const auctionItemBtn = document.getElementById('auction-item-btn');
        if (auctionItemBtn) {
            auctionItemBtn.addEventListener('click', () => {
                this.showAuctionItemDialog();
            });
        }
        
        // 交易行标签切换
        document.querySelectorAll('.auction-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                // 移除所有标签的active类
                document.querySelectorAll('.auction-tab').forEach(t => t.classList.remove('active'));
                // 添加当前标签的active类
                tab.classList.add('active');
                
                // 隐藏所有内容
                document.querySelectorAll('.auction-tab-content').forEach(content => content.classList.remove('active'));
                // 显示当前标签的内容
                const tabId = tab.dataset.tab;
                document.getElementById(`auction-${tabId}-content`).classList.add('active');
            });
        });
        
        // 领取已售出物品的货币
        document.querySelectorAll('.collect-btn').forEach(button => {
            button.addEventListener('click', () => {
                const auctionId = button.dataset.auctionId;
                const result = this.engine.marketSystem.collectAuctionMoney(auctionId);
                this.showNotification(result.message, result.success ? 'success' : 'error');
                if (result.success) {
                    // 刷新我的寄售内容
                    document.getElementById('auction-my-content').innerHTML = this.getMyAuctionHTML();
                    // 重新绑定事件
                    this.bindMarketEvents();
                    // 刷新资源显示
                    this.updateResourceDisplay();
                }
            });
        });
        
        // 取回流拍物品
        document.querySelectorAll('.retrieve-btn').forEach(button => {
            button.addEventListener('click', () => {
                const auctionId = button.dataset.auctionId;
                const result = this.engine.marketSystem.retrieveExpiredItem(auctionId);
                this.showNotification(result.message, result.success ? 'success' : 'error');
                if (result.success) {
                    // 刷新我的寄售内容
                    document.getElementById('auction-my-content').innerHTML = this.getMyAuctionHTML();
                    // 重新绑定事件
                    this.bindMarketEvents();
                    // 刷新资源显示
                    this.updateResourceDisplay();
                }
            });
        });
        
        // 取消寄售
        document.querySelectorAll('.cancel-btn').forEach(button => {
            button.addEventListener('click', () => {
                const auctionId = button.dataset.auctionId;
                const result = this.engine.marketSystem.cancelAuction(auctionId);
                this.showNotification(result.message, result.success ? 'success' : 'error');
                if (result.success) {
                    // 刷新我的寄售内容
                    document.getElementById('auction-my-content').innerHTML = this.getMyAuctionHTML();
                    // 重新绑定事件
                    this.bindMarketEvents();
                    // 刷新资源显示
                    this.updateResourceDisplay();
                }
            });
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
     * 格式化时间
     * @param {number} seconds - 秒数
     * @returns {string} 格式化后的时间
     */
    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours}小时${minutes}分钟${secs}秒`;
    }

    /**
     * 显示寄售物品对话框
     */
    showAuctionItemDialog() {
        const inventory = this.engine.state.data.inventory || [];
        
        // 过滤出可以寄售的物品
        const sellableItems = inventory.filter(item => item.quantity > 0);
        
        if (sellableItems.length === 0) {
            this.showNotification('背包中没有可寄售的物品', 'error');
            return;
        }
        
        // 创建对话框HTML
        const dialogHTML = `
            <div class="dialog-overlay">
                <div class="dialog auction-dialog">
                    <div class="dialog-header">
                        <h3>寄售物品</h3>
                        <button class="dialog-close">×</button>
                    </div>
                    <div class="dialog-content">
                        <div class="auction-dialog-content">
                            <div class="item-selection">
                                <h4>选择物品</h4>
                                <select id="auction-item-select">
                                    ${sellableItems.map(item => `
                                        <option value="${item.id}">${item.name} (${item.quantity}个)</option>
                                    `).join('')}
                                </select>
                                <div class="input-group">
                                    <label>数量:</label>
                                    <input type="number" id="item-quantity" min="1" value="1">
                                </div>
                            </div>
                            <div class="price-inputs">
                                <h4>设置价格</h4>
                                <div class="input-group">
                                    <label>起拍价:</label>
                                    <input type="number" id="starting-price" min="100" value="100">
                                </div>
                                <div class="input-group">
                                    <label>起拍价货币:</label>
                                    <select id="starting-currency">
                                        <option value="spirit_stone">灵石</option>
                                        <option value="immortal_stone">仙晶</option>
                                    </select>
                                </div>
                                <div class="input-group">
                                    <label>一口价:</label>
                                    <input type="number" id="buyout-price" min="100" value="200">
                                </div>
                                <div class="input-group">
                                    <label>一口价货币:</label>
                                    <select id="buyout-currency">
                                        <option value="spirit_stone">灵石</option>
                                        <option value="immortal_stone">仙晶</option>
                                    </select>
                                </div>
                            </div>
                            <div class="auction-tip">
                                <p>物品寄售${Math.floor(GameConfig.MARKET.auction.expireTime / (1000 * 60 * 60))}小时内无人出价则自动流拍，不扣手续费。</p>
                            </div>
                        </div>
                    </div>
                    <div class="dialog-footer">
                        <button class="btn btn-secondary cancel-btn">取消</button>
                        <button class="btn btn-primary confirm-btn">确认寄售</button>
                    </div>
                </div>
            </div>
        `;
        
        // 添加对话框到页面
        document.body.insertAdjacentHTML('beforeend', dialogHTML);
        
        // 绑定事件
        const dialog = document.querySelector('.auction-dialog');
        const closeBtn = dialog.querySelector('.dialog-close');
        const cancelBtn = dialog.querySelector('.cancel-btn');
        const confirmBtn = dialog.querySelector('.confirm-btn');
        
        // 关闭对话框
        function closeDialog() {
            dialog.parentElement.remove();
        }
        
        closeBtn.addEventListener('click', closeDialog);
        cancelBtn.addEventListener('click', closeDialog);
        
        // 确认寄售
        const self = this;
        confirmBtn.addEventListener('click', function() {
            const itemSelect = document.getElementById('auction-item-select');
            const itemQuantityInput = document.getElementById('item-quantity');
            const startingPriceInput = document.getElementById('starting-price');
            const startingCurrencySelect = document.getElementById('starting-currency');
            const buyoutPriceInput = document.getElementById('buyout-price');
            const buyoutCurrencySelect = document.getElementById('buyout-currency');
            
            const itemId = itemSelect.value;
            const quantity = parseInt(itemQuantityInput.value);
            const startingPrice = parseFloat(startingPriceInput.value);
            const startingCurrency = startingCurrencySelect.value;
            const buyoutPrice = parseFloat(buyoutPriceInput.value);
            const buyoutCurrency = buyoutCurrencySelect.value;
            
            // 验证输入
            if (isNaN(quantity) || quantity < 1) {
                self.showNotification('数量必须大于0', 'error');
                return;
            }
            
            if (isNaN(startingPrice) || startingPrice < 100) {
                self.showNotification('起拍价必须大于或等于100', 'error');
                return;
            }
            
            if (isNaN(buyoutPrice) || buyoutPrice < 100) {
                self.showNotification('一口价必须大于或等于100', 'error');
                return;
            }
            
            if (buyoutPrice < startingPrice) {
                self.showNotification('一口价必须大于或等于起拍价', 'error');
                return;
            }
            
            // 获取物品信息
            const selectedItem = inventory.find(item => item.id === itemId);
            if (!selectedItem) {
                self.showNotification('物品不存在', 'error');
                closeDialog();
                return;
            }
            
            // 检查物品数量
            if (selectedItem.quantity < quantity) {
                self.showNotification('物品数量不足', 'error');
                return;
            }
            
            // 调用寄售方法
            const result = self.engine.marketSystem.auctionItem(selectedItem, quantity, startingPrice, startingCurrency, buyoutPrice, buyoutCurrency);
            self.showNotification(result.message, result.success ? 'success' : 'error');
            
            if (result.success) {
                // 刷新交易行内容
                document.getElementById('auction-content').innerHTML = self.getAuctionContentHTML();
                // 重新绑定事件
                self.bindMarketEvents();
                // 刷新资源显示
                self.updateResourceDisplay();
            }
            
            closeDialog();
        });
    }

    // ==================== 万妖塔页面 ====================

    /**
     * 获取万妖塔页面HTML
     * @returns {string} HTML字符串
     */
    getTowerPageHTML() {
        const towerInfo = this.engine.towerSystem.getTowerInfo();
        const stamina = this.engine.state.data.resources.stamina;
        
        return `
            <div class="page tower-page">
                <div class="page-header">
                    <button class="btn-back-home">← 返回</button>
                    <h2>万妖塔</h2>
                </div>
                
                <div class="tower-content">
                    <div class="tower-info">
                        <div class="info-item">
                            <span class="info-label">当前层数:</span>
                            <span class="info-value">${towerInfo.currentFloor}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">最高层数:</span>
                            <span class="info-value">${towerInfo.highestFloor}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">今日挑战:</span>
                            <span class="info-value">${towerInfo.dailyChallengeCount}次</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">体力:</span>
                            <span class="info-value">${stamina}</span>
                        </div>
                    </div>
                    
                    <div class="tower-monster">
                        <h3>第${towerInfo.currentFloor}层 - ${towerInfo.currentMonster.name}</h3>
                        <div class="monster-stats">
                            <div class="stat-item">
                                <span class="stat-label">等级:</span>
                                <span class="stat-value">${towerInfo.currentMonster.level}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">生命:</span>
                                <span class="stat-value">${towerInfo.currentMonster.hp}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">攻击:</span>
                                <span class="stat-value">${towerInfo.currentMonster.attack}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">防御:</span>
                                <span class="stat-value">${towerInfo.currentMonster.defense}</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">速度:</span>
                                <span class="stat-value">${towerInfo.currentMonster.speed}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="tower-actions">
                        <button class="btn btn-primary challenge-btn" id="challenge-btn">
                            挑战 (消耗1体力)
                        </button>
                        <button class="btn btn-secondary sweep-btn" id="sweep-btn">
                            扫荡 (看广告)
                        </button>
                        <button class="btn btn-danger reset-btn" id="reset-btn">
                            重置
                        </button>
                    </div>
                    
                    <div class="tower-rewards">
                        <h3>奖励说明</h3>
                        <div class="reward-info">
                            <p><strong>首次通关奖励:</strong></p>
                            <ul>
                                <li>灵石: 1000-5000</li>
                                <li>仙晶: 10-50</li>
                                <li>经验丹: 5-20</li>
                                <li>强化石: 10-30</li>
                                <li>洗炼石: 5-15</li>
                            </ul>
                        </div>
                        <div class="reward-info">
                            <p><strong>扫荡奖励:</strong></p>
                            <ul>
                                <li>灵石: 100-500</li>
                                <li>经验丹: 1-5</li>
                                <li>强化石: 1-5</li>
                                <li>洗炼石: 1-3</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 绑定万妖塔页面事件
     */
    bindTowerEvents() {
        const self = this;
        
        // 返回按钮
        const btnBack = document.querySelector('.btn-back-home');
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                this.switchPage('home');
            });
        }
        
        // 挑战按钮
        const challengeBtn = document.getElementById('challenge-btn');
        if (challengeBtn) {
            challengeBtn.addEventListener('click', () => {
                const towerInfo = self.engine.towerSystem.getTowerInfo();
                const result = self.engine.towerSystem.challenge(towerInfo.currentFloor);
                
                if (result.success) {
                    if (result.victory) {
                        let message = result.message;
                        if (result.isFirstClear) {
                            message += '\n首次通关奖励: ' + result.rewards.name + ' x' + result.rewards.quantity;
                        }
                        self.showNotification(message, 'success');
                    } else {
                        self.showNotification(result.message, 'error');
                    }
                    
                    // 刷新页面
                    self.switchPage('tower');
                } else {
                    self.showNotification(result.message, 'error');
                }
            });
        }
        
        // 扫荡按钮
        const sweepBtn = document.getElementById('sweep-btn');
        if (sweepBtn) {
            sweepBtn.addEventListener('click', () => {
                const towerInfo = self.engine.towerSystem.getTowerInfo();
                const maxSweepFloor = towerInfo.highestFloor - 1;
                
                if (maxSweepFloor <= 0) {
                    self.showNotification('没有可扫荡的楼层', 'error');
                    return;
                }
                
                // 显示扫荡对话框
                const sweepFloors = prompt(`请输入扫荡层数 (最多${maxSweepFloor}层):`, '1');
                if (sweepFloors === null) return;
                
                const floors = parseInt(sweepFloors);
                if (isNaN(floors) || floors <= 0) {
                    self.showNotification('请输入有效的扫荡层数', 'error');
                    return;
                }
                
                // 这里应该调用看广告的逻辑，暂时直接扫荡
                const result = self.engine.towerSystem.sweep(floors);
                
                if (result.success) {
                    let message = result.message + '\n';
                    result.rewards.forEach(reward => {
                        message += reward.name + ' x' + reward.quantity + '\n';
                    });
                    self.showNotification(message, 'success');
                    
                    // 刷新页面
                    self.switchPage('tower');
                } else {
                    self.showNotification(result.message, 'error');
                }
            });
        }
        
        // 重置按钮
        const resetBtn = document.getElementById('reset-btn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('确定要重置万妖塔吗？')) {
                    const result = self.engine.towerSystem.reset();
                    self.showNotification(result.message, 'success');
                    
                    // 刷新页面
                    self.switchPage('tower');
                }
            });
        }
    }

    // ==================== 封神榜页面 ====================

    /**
     * 获取封神榜页面HTML
     * @returns {string} HTML字符串
     */
    getGodListPageHTML() {
        const godListInfo = this.engine.godListSystem.getGodListInfo();
        const playerRank = this.engine.godListSystem.getPlayerRank();
        
        return `
            <div class="page godlist-page">
                <div class="page-header">
                    <button class="btn-back-home">← 返回</button>
                    <h2>封神榜</h2>
                </div>
                
                <div class="godlist-content">
                    <div class="godlist-info">
                        <div class="info-item">
                            <span class="info-label">上榜名额:</span>
                            <span class="info-value">${godListInfo.maxSlots}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">最后更新:</span>
                            <span class="info-value">${this.formatTime(godListInfo.lastUpdateTime)}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">当前排名:</span>
                            <span class="info-value">${playerRank > 0 ? playerRank : '未上榜'}</span>
                        </div>
                    </div>
                    
                    <div class="godlist-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>名次</th>
                                    <th>昵称</th>
                                    <th>修为境界</th>
                                    <th>炼体境界</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${godListInfo.players.map(player => `
                                    <tr>
                                        <td class="rank-cell">${player.rank}</td>
                                        <td class="name-cell">${player.name}</td>
                                        <td class="realm-cell">${player.realm}</td>
                                        <td class="body-cell">${player.bodyLevel}</td>
                                    </tr>
                                `).join('')}
                                ${godListInfo.players.length === 0 ? `
                                    <tr>
                                        <td colspan="4" class="empty-message">暂无上榜玩家</td>
                                    </tr>
                                ` : ''}
                            </tbody>
                        </table>
                    </div>
                    
                    <div class="godlist-rewards">
                        <h3>奖励说明</h3>
                        <div class="reward-tiers">
                            ${GameConfig.GOD_LIST.rewardTiers.map(tier => `
                                <div class="reward-tier">
                                    <h4>${tier.name}</h4>
                                    <ul>
                                        ${tier.rewards.map(reward => `
                                            <li>${reward.name}: ${reward.quantity}</li>
                                        `).join('')}
                                    </ul>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 绑定封神榜页面事件
     */
    bindGodListEvents() {
        // 返回按钮
        const btnBack = document.querySelector('.btn-back-home');
        if (btnBack) {
            btnBack.addEventListener('click', () => {
                this.switchPage('home');
            });
        }
    }

    /**
     * 格式化时间
     * @param {string} timeString - 时间字符串
     * @returns {string} 格式化后的时间
     */
    formatTime(timeString) {
        if (!timeString) return '未知';
        const date = new Date(timeString);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * 获取仙武台页面HTML
     * @returns {string} 仙武台页面HTML
     */
    getMartialStagePageHTML() {
        const martialStageInfo = this.engine.martialStageSystem.getMartialStageInfo();
        const isUnlocked = martialStageInfo.isUnlocked;
        const remainingChallenges = martialStageInfo.remainingChallenges;
        const playerPoints = martialStageInfo.playerPoints;
        const ranking = martialStageInfo.ranking;
        const playerRank = martialStageInfo.playerRank;
        
        let html = `
            <div class="martial-stage-page">
                <h2>仙武台</h2>
                <div class="martial-stage-info">
                    <div class="info-item">
                        <span class="label">剩余挑战次数：</span>
                        <span class="value">${remainingChallenges}/${GameConfig.MARTIAL_STAGE.dailyChallengeLimit}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">当前积分：</span>
                        <span class="value">${playerPoints}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">当前排名：</span>
                        <span class="value">${playerRank > 0 ? playerRank : '未上榜'}</span>
                    </div>
                </div>
        `;
        
        if (!isUnlocked) {
            html += `
                <div class="unlock-condition">
                    <p>仙武台需要达到先天境才能解锁</p>
                </div>
            `;
        } else {
            html += `
                <div class="martial-stage-actions">
                    <button id="challenge-btn" class="btn btn-primary">挑战</button>
                </div>
                <div class="martial-stage-rewards">
                    <h3>排行榜奖励</h3>
                    <div class="rewards-list">
            `;
            
            // 显示前10名奖励
            GameConfig.MARTIAL_STAGE.rewards.forEach(reward => {
                html += `
                    <div class="reward-item">
                        <div class="reward-rank">第${reward.rank}名</div>
                        <div class="reward-content">
                            ${reward.rewards.map(item => `${item.name} x${item.quantity}`).join(', ')}
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        }
        
        html += `
                <div class="martial-stage-ranking">
                    <h3>排行榜</h3>
                    <div class="ranking-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>排名</th>
                                    <th>昵称</th>
                                    <th>修为境界</th>
                                    <th>炼体境界</th>
                                    <th>积分</th>
                                </tr>
                            </thead>
                            <tbody>
            `;
        
        // 显示排行榜
        if (ranking.length > 0) {
            ranking.forEach((user, index) => {
                html += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${user.name}</td>
                        <td>${this.getRealmName(user.realm)}</td>
                        <td>${user.bodyLevel}</td>
                        <td>${user.points}</td>
                    </tr>
                `;
            });
        } else {
            html += `
                    <tr>
                        <td colspan="5" class="empty">暂无数据</td>
                    </tr>
                `;
        }
        
        html += `
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="action-buttons">
                    <button id="back-btn" class="btn btn-secondary">返回</button>
                </div>
            </div>
        `;
        
        return html;
    }

    /**
     * 绑定仙武台事件
     */
    bindMartialStageEvents() {
        // 返回按钮
        document.getElementById('back-btn').addEventListener('click', () => {
            this.switchPage('home');
        });
        
        // 挑战按钮
        const challengeBtn = document.getElementById('challenge-btn');
        if (challengeBtn) {
            challengeBtn.addEventListener('click', () => {
                this.handleChallenge();
            });
        }
    }

    /**
     * 处理挑战
     */
    handleChallenge() {
        const martialStageInfo = this.engine.martialStageSystem.getMartialStageInfo();
        
        if (!martialStageInfo.isUnlocked) {
            this.showMessage('未达到先天境，无法挑战仙武台');
            return;
        }
        
        if (martialStageInfo.remainingChallenges <= 0) {
            this.showMessage('今日挑战次数已用完');
            return;
        }
        
        // 获取对手
        const opponent = this.engine.martialStageSystem.getOpponent();
        
        // 显示挑战确认
        if (confirm(`是否挑战 ${opponent.name}（${this.getRealmName(opponent.realm)}）？`)) {
            // 执行挑战
            const result = this.engine.martialStageSystem.challenge(opponent);
            
            if (result.success) {
                let message = result.isWin ? '挑战成功！' : '挑战失败！';
                message += ` 积分变化：${result.pointsChange > 0 ? '+' : ''}${result.pointsChange}`;
                this.showMessage(message);
                
                // 重新渲染页面
                this.renderMartialStagePage();
            } else {
                this.showMessage(result.message);
            }
        }
    }

    /**
     * 渲染仙武台页面
     */
    renderMartialStagePage() {
        const content = this.getMartialStagePageHTML();
        this.renderContent(content);
        this.bindMartialStageEvents();
    }

    /**
     * 获取境界名称
     * @param {string} realm - 境界ID
     * @returns {string} 境界名称
     */
    getRealmName(realm) {
        const realmConfig = GameConfig.REALM.find(r => r.id === realm);
        return realmConfig ? realmConfig.name : realm;
    }
}

// 暴露UIManager为全局变量
if (typeof window !== 'undefined') {
    window.UIManager = UIManager;
}
