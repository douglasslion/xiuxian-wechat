# 游戏数据表说明文档

## 概述

本文档介绍游戏的本地数据表结构，数据以CSV格式存储，便于游戏配置的管理和修改。

## 数据表目录结构

```
data/
└── csv/
    ├── realms.csv              # 境界配置表
    ├── items.csv               # 物品配置表
    ├── equipment_slots.csv     # 装备部位配置表
    ├── equipment_qualities.csv # 装备品质配置表
    ├── skill_categories.csv    # 功法分类配置表
    ├── skills.csv              # 功法配置表
    ├── pets.csv                # 灵宠配置表
    ├── daily_tasks.csv         # 每日任务配置表
    ├── spirit_roots.csv        # 灵根配置表
    ├── identities.csv          # 身份配置表
    └── pills.csv               # 丹药配方配置表
```

## 数据表详细说明

### 1. realms.csv - 境界配置表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 境界唯一标识符 |
| name | string | 境界名称 |
| layers | number | 境界层数 |
| base_exp | number | 基础经验需求 |
| exp_multiplier | number | 经验倍数 |
| unlock_level | number | 解锁等级 |
| attribute_bonus | number | 属性加成 |

### 2. items.csv - 物品配置表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 物品唯一标识符 |
| name | string | 物品名称 |
| type | string | 物品类型（resource/consumable/special） |
| sub_type | string | 子类型 |
| description | string | 物品描述 |
| icon | string | 图标 |
| stackable | boolean | 是否可堆叠 |
| max_stack | number | 最大堆叠数量 |
| effect_type | string | 效果类型 |
| effect_value | number | 效果值 |

### 3. equipment_slots.csv - 装备部位配置表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 部位唯一标识符 |
| name | string | 部位名称 |
| category | string | 类别 |
| attribute | string | 主属性 |
| base_stats | number | 基础属性值 |
| color | string | 颜色代码 |
| max_enhance_level | number | 最大强化等级 |

### 4. equipment_qualities.csv - 装备品质配置表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 品质唯一标识符 |
| name | string | 品质名称 |
| base_stats | number | 基础属性值 |
| color | string | 颜色代码 |

### 5. skills.csv - 功法配置表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 功法唯一标识符 |
| name | string | 功法名称 |
| category_id | string | 功法分类ID |
| quality_id | string | 功法品质ID |
| effect_type | string | 效果类型 |
| effect_value | number | 效果值 |
| description | string | 功法描述 |

### 6. pets.csv - 灵宠配置表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 灵宠唯一标识符 |
| name | string | 灵宠名称 |
| rarity | string | 稀有度 |
| base_attack | number | 基础攻击力 |
| base_defense | number | 基础防御力 |
| base_hp | number | 基础生命值 |
| base_speed | number | 基础速度 |
| cultivation_bonus | number | 修炼加成 |
| description | string | 灵宠描述 |
| icon | string | 图标 |

### 7. daily_tasks.csv - 每日任务配置表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 任务唯一标识符 |
| name | string | 任务名称 |
| type | string | 任务类型 |
| target | number | 目标数量 |
| reward_type | string | 奖励类型 |
| reward_value | number | 奖励值 |
| quality | string | 任务品质 |
| description | string | 任务描述 |

### 8. spirit_roots.csv - 灵根配置表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 灵根唯一标识符 |
| name | string | 灵根名称 |
| attribute | string | 主属性 |
| bonus | number | 加成值 |

### 9. identities.csv - 身份配置表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 身份唯一标识符 |
| name | string | 身份名称 |
| description | string | 身份描述 |
| exp_rate | number | 经验加成 |
| spirit_rate | number | 灵气加成 |
| spirit_stone_rate | number | 灵石加成 |

### 10. pills.csv - 丹药配方配置表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | string | 丹药唯一标识符 |
| name | string | 丹药名称 |
| tier | number | 丹药阶数 |
| material_1 | string | 材料1名称 |
| material_1_count | number | 材料1数量 |
| material_2 | string | 材料2名称 |
| material_2_count | number | 材料2数量 |
| effect_type | string | 效果类型 |
| effect_value | number | 效果值 |
| icon | string | 图标 |

## 使用方法

### 1. 引入CSV加载器

在HTML文件中引入CSV加载器：

```html
<script src="src/js/csvLoader.js"></script>
```

### 2. 初始化并加载数据

```javascript
const csvLoader = new CSVLoader();

// 加载所有配置数据
async function initGameData() {
    await csvLoader.loadAllData();
    console.log('数据加载完成:', csvLoader.getAllData());
}

initGameData();
```

### 3. 获取数据

```javascript
// 根据ID获取境界数据
const realm = csvLoader.getById('realms', 'lianqi');

// 获取所有物品
const items = csvLoader.getAllData().items;

// 获取所有灵宠
const pets = csvLoader.getAllData().pets;
```

## 数据加载器API

### 方法列表

| 方法 | 说明 |
|------|------|
| parseCSV(csvText) | 解析CSV文本为数组 |
| loadCSV(filename) | 加载单个CSV文件 |
| loadAllData() | 加载所有配置数据 |
| getById(tableName, id) | 根据ID获取数据项 |
| getAllData() | 获取所有数据 |

## 扩展建议

### 添加新的数据表

1. 在 `data/csv/` 目录下创建新的CSV文件
2. 在 `csvLoader.js` 的 `loadAllData` 方法中添加新的加载任务

### 数据验证

可以在CSVLoader中添加数据验证逻辑：

```javascript
validateData(data, schema) {
    // 验证数据格式
}
```

### 缓存机制

可以添加数据缓存机制，提高加载性能：

```javascript
loadCSVWithCache(filename) {
    if (this.cache[filename]) {
        return Promise.resolve(this.cache[filename]);
    }
    // 加载并缓存
}
```
