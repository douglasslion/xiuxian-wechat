/**
 * 灵田系统模块
 * 处理灵田管理、种植等功能
 * @version 1.0.0
 */

class FieldSystem {
    constructor(gameState, gameEngine) {
        this.state = gameState;
        this.engine = gameEngine;
        this.initFields();
    }

    /**
     * 初始化灵田系统
     */
    initFields() {
        if (!this.state.data.fields) {
            this.state.data.fields = {
                level: 1, // 灵田等级
                count: 1, // 灵田数量
               灵气: 0, // 灵田灵气
                max灵气: 100, // 灵田最大灵气
                fields: [
                    {
                        id: 'field1',
                        status: 'empty', // empty, growing, mature
                        seed: null,
                        startTime: null,
                        matureTime: null,
                        progress: 0
                    },
                    {
                        id: 'field2',
                        status: 'locked',
                        seed: null,
                        startTime: null,
                        matureTime: null,
                        progress: 0
                    },
                    {
                        id: 'field3',
                        status: 'locked',
                        seed: null,
                        startTime: null,
                        matureTime: null,
                        progress: 0
                    },
                    {
                        id: 'field4',
                        status: 'locked',
                        seed: null,
                        startTime: null,
                        matureTime: null,
                        progress: 0
                    },
                    {
                        id: 'field5',
                        status: 'locked',
                        seed: null,
                        startTime: null,
                        matureTime: null,
                        progress: 0
                    },
                    {
                        id: 'field6',
                        status: 'locked',
                        seed: null,
                        startTime: null,
                        matureTime: null,
                        progress: 0
                    },
                    {
                        id: 'field7',
                        status: 'locked',
                        seed: null,
                        startTime: null,
                        matureTime: null,
                        progress: 0
                    },
                    {
                        id: 'field8',
                        status: 'locked',
                        seed: null,
                        startTime: null,
                        matureTime: null,
                        progress: 0
                    },
                    {
                        id: 'field9',
                        status: 'locked',
                        seed: null,
                        startTime: null,
                        matureTime: null,
                        progress: 0
                    },
                    {
                        id: 'field10',
                        status: 'locked',
                        seed: null,
                        startTime: null,
                        matureTime: null,
                        progress: 0
                    },
                    {
                        id: 'field11',
                        status: 'locked',
                        seed: null,
                        startTime: null,
                        matureTime: null,
                        progress: 0
                    },
                    {
                        id: 'field12',
                        status: 'locked',
                        seed: null,
                        startTime: null,
                        matureTime: null,
                        progress: 0
                    }
                ]
            };
        }
    }

    /**
     * 获取灵田信息
     * @returns {Object} 灵田信息
     */
    getFieldInfo() {
        return {
            level: this.state.data.fields.level,
            count: this.state.data.fields.count,
            灵气: this.state.data.fields.灵气,
            max灵气: this.state.data.fields.max灵气
        };
    }

    /**
     * 获取所有灵田
     * @returns {Array} 灵田列表
     */
    getAllFields() {
        return this.state.data.fields.fields;
    }

    /**
     * 注入灵气
     * @param {number} amount - 注入灵气数量
     * @returns {Object} 结果
     */
    inject灵气(amount) {
        const current灵气 = this.state.data.fields.灵气;
        const max灵气 = this.state.data.fields.max灵气;
        const new灵气 = Math.min(current灵气 + amount, max灵气);
        this.state.data.fields.灵气 = new灵气;
        this.state.save();
        return { success: true, message: `注入了 ${amount} 点灵气` };
    }

    /**
     * 提升灵田等级
     * @returns {Object} 结果
     */
    upgradeFieldLevel() {
        const currentLevel = this.state.data.fields.level;
        const required灵气 = currentLevel * 500;
        
        if (this.state.data.fields.灵气 < required灵气) {
            return { success: false, message: '灵气不足' };
        }

        // 消耗灵气
        this.state.data.fields.灵气 -= required灵气;
        
        // 提升等级
        this.state.data.fields.level++;
        
        // 增加最大灵气
        this.state.data.fields.max灵气 += 50;
        
        // 解锁新灵田
        const newFieldCount = Math.min(currentLevel + 1, 12);
        this.state.data.fields.count = newFieldCount;
        
        // 解锁灵田
        for (let i = currentLevel; i < newFieldCount; i++) {
            if (this.state.data.fields.fields[i]) {
                this.state.data.fields.fields[i].status = 'empty';
            }
        }

        this.state.save();
        return { success: true, message: `灵田等级提升到 ${currentLevel + 1}` };
    }

    /**
     * 播种灵种
     * @param {string} fieldId - 灵田ID
     * @param {Object} seed - 灵种信息
     * @returns {Object} 结果
     */
    plantSeed(fieldId, seed) {
        const field = this.state.data.fields.fields.find(f => f.id === fieldId);
        if (!field) {
            return { success: false, message: '灵田不存在' };
        }
        if (field.status !== 'empty') {
            return { success: false, message: '灵田不可播种' };
        }

        // 计算成熟时间（基础时间 - 灵气加成）
        const baseTime = seed.matureTime * 1000; // 转换为毫秒
        const 灵气加成 = Math.min(this.state.data.fields.灵气 / this.state.data.fields.max灵气, 0.5); // 最大减少50%
        const matureTime = baseTime * (1 - 灵气加成);

        field.status = 'growing';
        field.seed = seed;
        field.startTime = Date.now();
        field.matureTime = matureTime;
        field.progress = 0;

        this.state.save();
        return { success: true, message: `播种成功，预计 ${Math.round(matureTime / 1000 / 60)} 分钟后成熟` };
    }

    /**
     * 收获灵物
     * @param {string} fieldId - 灵田ID
     * @returns {Object} 结果
     */
    harvestField(fieldId) {
        const field = this.state.data.fields.fields.find(f => f.id === fieldId);
        if (!field) {
            return { success: false, message: '灵田不存在' };
        }
        if (field.status !== 'mature') {
            return { success: false, message: '灵物尚未成熟' };
        }

        const seed = field.seed;
        
        // 重置灵田状态
        field.status = 'empty';
        field.seed = null;
        field.startTime = null;
        field.matureTime = null;
        field.progress = 0;

        this.state.save();
        return { success: true, message: `收获了 ${seed.name}`, seed: seed };
    }

    /**
     * 更新灵田状态
     */
    updateFields() {
        const now = Date.now();
        this.state.data.fields.fields.forEach(field => {
            if (field.status === 'growing' && field.startTime && field.matureTime) {
                const elapsed = now - field.startTime;
                field.progress = Math.min(elapsed / field.matureTime, 1);
                if (field.progress >= 1) {
                    field.status = 'mature';
                }
            }
        });
        this.state.save();
    }

    /**
     * 获取灵种列表
     * @returns {Array} 灵种列表
     */
    getSeeds() {
        return [
            {
                id: 'seed1',
                name: '灵草',
                icon: '🌿',
                matureTime: 600, // 10分钟
                yield: 10,
                value: 100
            },
            {
                id: 'seed2',
                name: '灵芝',
                icon: '🍄',
                matureTime: 1200, // 20分钟
                yield: 5,
                value: 200
            },
            {
                id: 'seed3',
                name: '人参',
                icon: '🥕',
                matureTime: 1800, // 30分钟
                yield: 3,
                value: 300
            }
        ];
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FieldSystem;
}