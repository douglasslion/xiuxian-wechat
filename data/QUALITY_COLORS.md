# 品质颜色配置说明

## 概述

本文档说明游戏中品质颜色的统一配置方案，确保不同类型物品（装备、功法、灵宠等）的同一品质使用相同的颜色。

## 配置文件

### quality_colors.csv

**文件路径**：`data/csv/quality_colors.csv`

**配置结构**：

| 字段 | 类型 | 说明 |
|------|------|------|
| quality_id | number | 品质ID（1-7） |
| color | string | 颜色代码（HEX格式） |

**配置示例**：

```csv
quality_id,color
1,#9e9e9e
2,#4caf50
3,#2196f3
4,#b39ddb
5,#ff9800
6,#ff5722
7,#9c27b0
```

## 品质等级对应表

| 品质ID | 颜色 | 对应关系 |
|--------|------|----------|
| 1 | #9e9e9e（灰色） | 凡品 |
| 2 | #4caf50（绿色） | 良品 |
| 3 | #2196f3（蓝色） | 精品 |
| 4 | #D62CF3（亮紫色） | 绝品 |
| 5 | #ff9800（橙色） | 神器 |
| 6 | #A89913（暗金色） | 传说 |
| 7 | #FF3B30（深红色） | 神话 |

## 使用方法

### 1. 加载品质颜色配置

```javascript
// 加载品质颜色配置
async function loadQualityColors() {
    const csvLoader = new CSVLoader();
    const colors = await csvLoader.loadCSV('quality_colors.csv');
    return colors.reduce((map, item) => {
        map[item.quality_id] = item.color;
        return map;
    }, {});
}

// 示例：获取品质颜色
const qualityColors = await loadQualityColors();
const color = qualityColors[3]; // 获取品质ID为3的颜色（蓝色）
```

### 2. 在游戏系统中应用

#### 装备系统

```javascript
// 装备品质到颜色的映射
function getEquipmentColor(quality) {
    // 品质映射：common=1, good=2, fine=3, exquisite=4, divine=5
    const qualityMap = {
        'common': 1,
        'good': 2,
        'fine': 3,
        'exquisite': 4,
        'divine': 5
    };
    return qualityColors[qualityMap[quality]] || '#9e9e9e';
}

// 使用示例
const equipmentColor = getEquipmentColor('fine'); // 返回精品装备的颜色
```

#### 功法系统

```javascript
// 功法品质到颜色的映射
function getSkillColor(quality) {
    // 品质映射：common=1, good=2, fine=3, exquisite=4, divine=5
    const qualityMap = {
        'common': 1,
        'good': 2,
        'fine': 3,
        'exquisite': 4,
        'divine': 5
    };
    return qualityColors[qualityMap[quality]] || '#9e9e9e';
}
```

#### 灵宠系统

```javascript
// 灵宠稀有度到颜色的映射
function getPetColor(rarity) {
    // 稀有度映射：普通=1, 稀有=2, 史诗=3, 传说=6, 神话=7
    const rarityMap = {
        '普通': 1,
        '稀有': 2,
        '史诗': 3,
        '传说': 6,
        '神话': 7
    };
    return qualityColors[rarityMap[rarity]] || '#9e9e9e';
}
```

### 3. 统一颜色管理

创建一个专门的颜色管理模块：

```javascript
// colorManager.js
class ColorManager {
    constructor() {
        this.qualityColors = {};
    }

    async init() {
        const csvLoader = new CSVLoader();
        const colors = await csvLoader.loadCSV('quality_colors.csv');
        this.qualityColors = colors.reduce((map, item) => {
            map[item.quality_id] = item.color;
            return map;
        }, {});
    }

    // 获取品质颜色
    getQualityColor(qualityId) {
        return this.qualityColors[qualityId] || '#9e9e9e';
    }

    // 装备颜色
    getEquipmentColor(quality) {
        const map = {
            'common': 1,
            'good': 2,
            'fine': 3,
            'exquisite': 4,
            'divine': 5
        };
        return this.getQualityColor(map[quality]);
    }

    // 功法颜色
    getSkillColor(quality) {
        const map = {
            'common': 1,
            'good': 2,
            'fine': 3,
            'exquisite': 4,
            'divine': 5
        };
        return this.getQualityColor(map[quality]);
    }

    // 灵宠颜色
    getPetColor(rarity) {
        const map = {
            '普通': 1,
            '稀有': 2,
            '史诗': 3,
            '传说': 6,
            '神话': 7
        };
        return this.getQualityColor(map[rarity]);
    }
}

// 全局实例
const colorManager = new ColorManager();
```

## 扩展建议

### 1. 支持不同主题

可以扩展配置文件，支持不同主题的颜色方案：

```csv
quality_id,color,light_theme,dark_theme
1,#9e9e9e,#757575,#bdbdbd
2,#4caf50,#43a047,#66bb6a
```

### 2. 动态颜色调整

可以根据玩家等级或游戏进度，动态调整颜色饱和度：

```javascript
function adjustColorSaturation(color, saturation) {
    // 实现颜色饱和度调整逻辑
    return adjustedColor;
}
```

### 3. 品质特效

根据品质等级添加不同的视觉特效：

| 品质ID | 特效 |
|--------|------|
| 1-3 | 无特效 |
| 4 | 轻微发光 |
| 5 | 明显发光 |
| 6 | 脉动光效 |
| 7 | 彩虹光效 |

## 注意事项

1. **保持一致性**：确保所有系统使用相同的品质颜色配置
2. **向后兼容**：在修改颜色配置时，确保现有数据不受影响
3. **性能优化**：缓存颜色配置，避免频繁读取文件
4. **国际化**：品质名称可以根据语言进行本地化，颜色保持不变

通过这种统一的品质颜色配置方案，可以确保游戏中所有物品的品质显示保持一致，提升玩家体验。