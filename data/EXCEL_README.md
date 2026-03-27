# Excel数据表说明

## 概述

除了CSV格式外，游戏也支持使用Excel格式来管理数据配置。Excel格式更适合非技术人员使用，界面更友好。

## Excel文件结构

```
设定/
├── 境界与属性.xlsx      # 境界配置
├── items.xlsx           # 物品配置
├── equip.xlsx           # 装备配置
└── 基础设定.xlsx        # 其他基础配置
```

## Excel文件字段说明

### 1. 境界与属性.xlsx

包含以下工作表：

#### 境界配置 (Realms)
| 列名 | 说明 | 示例 |
|------|------|------|
| ID | 境界ID | lianqi |
| 名称 | 境界名称 | 炼气期 |
| 层数 | 境界层数 | 10 |
| 基础经验 | 升一级所需经验 | 5000 |
| 经验倍数 | 经验递增倍数 | 1.5 |
| 解锁等级 | 解锁所需等级 | 31 |
| 属性加成 | 属性加成值 | 0.3 |
| 解锁功能 | 解锁的功能 | autoTraining |

#### 灵根配置 (SpiritRoots)
| 列名 | 说明 | 示例 |
|------|------|------|
| ID | 灵根ID | metal |
| 名称 | 灵根名称 | 金 |
| 主属性 | 对应属性 | attack |
| 加成 | 加成值 | 0.05 |

### 2. items.xlsx

包含以下工作表：

#### 物品配置 (Items)
| 列名 | 说明 | 示例 |
|------|------|------|
| ID | 物品ID | healing_pill |
| 名称 | 物品名称 | 疗伤丹 |
| 类型 | 物品类型 | consumable |
| 子类型 | 物品子类型 | pill |
| 描述 | 物品描述 | 恢复生命力 |
| 图标 | 显示图标 | 💊 |
| 可堆叠 | 是否可堆叠 | TRUE |
| 最大堆叠 | 最大数量 | 999 |
| 效果类型 | 效果类型 | heal |
| 效果值 | 效果数值 | 100 |

#### 丹药配方 (Pills)
| 列名 | 说明 | 示例 |
|------|------|------|
| ID | 丹药ID | healing_pill |
| 名称 | 丹药名称 | 疗伤丹 |
| 阶数 | 丹药阶数 | 1 |
| 材料1 | 所需材料 | 草药 |
| 材料1数量 | 材料数量 | 2 |
| 材料2 | 所需材料 | 矿石 |
| 材料2数量 | 材料数量 | 1 |
| 效果类型 | 效果类型 | hp |
| 效果值 | 效果数值 | 100 |
| 图标 | 显示图标 | 💊 |

### 3. equip.xlsx

包含以下工作表：

#### 装备部位 (EquipmentSlots)
| 列名 | 说明 | 示例 |
|------|------|------|
| ID | 部位ID | weapon |
| 名称 | 部位名称 | 武器 |
| 主属性 | 对应属性 | attack |
| 基础属性 | 基础属性值 | 10 |
| 颜色 | 显示颜色 | #9e9e9e |
| 最大强化 | 最大强化等级 | 20 |

#### 装备品质 (EquipmentQualities)
| 列名 | 说明 | 示例 |
|------|------|------|
| ID | 品质ID | common |
| 名称 | 品质名称 | 凡品 |
| 基础属性 | 基础属性值 | 10 |
| 颜色 | 显示颜色 | #9e9e9e |

#### 装备数据 (EquipmentData)
| 列名 | 说明 | 示例 |
|------|------|------|
| ID | 装备ID | weapon_001 |
| 名称 | 装备名称 | 青钢剑 |
| 描述 | 装备描述 | 精钢千锤百炼 |
| 品质 | 装备品质 | good |
| 等级 | 需求等级 | 3 |
| 攻击力 | 攻击属性 | 800 |
| 防御力 | 防御属性 | 800 |
| 生命值 | 生命属性 | 800 |
| 速度 | 速度属性 | 0 |
| 暴击率 | 暴击属性 | 5 |

### 4. 基础设定.xlsx

包含以下工作表：

#### 身份配置 (Identities)
| 列名 | 说明 | 示例 |
|------|------|------|
| ID | 身份ID | mortal |
| 名称 | 身份名称 | 凡人 |
| 描述 | 身份描述 | 普通凡人 |
| 经验加成 | 经验获取加成 | 0 |
| 灵气加成 | 灵气获取加成 | 0 |
| 灵石加成 | 灵石获取加成 | 0 |

#### 功法配置 (Skills)
| 列名 | 说明 | 示例 |
|------|------|------|
| ID | 功法ID | jianqi_jue |
| 名称 | 功法名称 | 剑气诀 |
| 分类 | 功法分类 | attack |
| 品质 | 功法品质 | common |
| 效果类型 | 效果类型 | attack |
| 效果值 | 效果数值 | 10 |
| 描述 | 功法描述 | 基础攻击功法 |

#### 灵宠配置 (Pets)
| 列名 | 说明 | 示例 |
|------|------|------|
| ID | 灵宠ID | pet1 |
| 名称 | 灵宠名称 | 小火龙 |
| 稀有度 | 稀有度 | 普通 |
| 基础攻击 | 基础攻击力 | 10 |
| 基础防御 | 基础防御力 | 5 |
| 基础生命 | 基础生命值 | 50 |
| 基础速度 | 基础速度 | 8 |
| 修炼加成 | 修炼加成 | 0.05 |
| 描述 | 灵宠描述 | 可爱的小火龙 |
| 图标 | 显示图标 | 🐉 |

#### 每日任务 (DailyTasks)
| 列名 | 说明 | 示例 |
|------|------|------|
| ID | 任务ID | task_alchemy_1 |
| 名称 | 任务名称 | 炼丹任务1 |
| 类型 | 任务类型 | alchemy |
| 目标 | 目标数量 | 5 |
| 奖励类型 | 奖励类型 | spirit_stone |
| 奖励值 | 奖励数值 | 100 |
| 品质 | 任务品质 | normal |
| 描述 | 任务描述 | 炼制5颗丹药 |

## Excel数据读取方法

### 使用SheetJS库

可以使用SheetJS库来读取Excel文件：

```javascript
// 引入SheetJS库
<script src="https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js"></script>

// 读取Excel文件
function readExcelFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            resolve(workbook);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// 获取工作表数据
function getSheetData(workbook, sheetName) {
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet);
}
```

### 使用PapaParse库读取CSV

如果使用CSV格式，可以直接使用PapaParse库：

```javascript
// 引入PapaParse库
<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js"></script>

// 读取CSV文件
function readCSVFile(file) {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            complete: (results) => {
                resolve(results.data);
            },
            error: reject
        });
    });
}
```

## 数据导出建议

1. **定期备份**：定期将Excel数据导出为CSV格式进行备份
2. **版本控制**：使用Git等版本控制系统管理数据文件的修改
3. **数据验证**：在加载数据时进行格式验证，确保数据正确性
4. **热更新**：可以实现游戏内数据热更新，无需重新发布游戏

## 注意事项

1. Excel文件中的中文字段名需要在代码中进行映射
2. 数据类型需要保持一致，特别是数字类型
3. 避免在Excel中使用合并单元格，这会增加解析难度
4. 建议在Excel中添加数据验证，防止输入错误数据
