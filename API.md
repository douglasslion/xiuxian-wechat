# 修仙游戏后端API文档

## 项目简介

修仙游戏后端服务提供了用户认证、角色管理、游戏状态管理等功能的API接口。

## 基础信息

- API基础URL: `http://xiuxian-test.richsh.cn`
- 响应格式: JSON
- 错误处理: 统一返回错误状态码和错误信息

## 响应格式

### 成功响应

```json
{
  "status": "success",
  "message": "操作成功",
  "data": {
    // 响应数据
  }
}
```

### 错误响应

```json
{
  "status": "error",
  "message": "错误信息"
}
```

## API接口列表

### 1. 用户相关API

#### 1.1 用户注册

- **请求方式**: POST
- **接口路径**: `/api/users/register`
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  |-------|------|------|------|
  | username | string | 是 | 用户名 |
  | password | string | 是 | 密码 |

- **响应示例**:

```json
{
  "status": "success",
  "message": "注册成功",
  "data": {
    "user": {
      "id": "5f9a1b2c3d4e5f6g7h8i9j0k",
      "username": "testuser"
    },
    "player": null,
    "needCreateCharacter": true
  }
}
```

#### 1.2 用户登录

- **请求方式**: POST
- **接口路径**: `/api/users/login`
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  |-------|------|------|------|
  | username | string | 是 | 用户名 |
  | password | string | 是 | 密码 |

- **响应示例**:

**成功响应**

```json
{
  "status": "success",
  "message": "登录成功",
  "data": {
    "user": {
      "id": "5f9a1b2c3d4e5f6g7h8i9j0k",
      "username": "testuser"
    },
    "player": {
      "id": "861117",
      "name": "修仙者",
      "avatar": "http://xiuxian-test.richsh.cn:8002/avatars/861117_1620000000000.jpg"
    },
    "needCreateCharacter": false
  }
}
```

**错误响应 - 账号未注册**

```json
{
  "status": "error",
  "message": "该账号尚未注册，请注册后再登录。"
}
```

**错误响应 - 密码错误**

```json
{
  "status": "error",
  "message": "密码错误"
}
```

#### 1.3 获取用户信息

- **请求方式**: GET
- **接口路径**: `/api/users/profile`
- **响应示例**:

```json
{
  "status": "success",
  "data": {
    "_id": "5f9a1b2c3d4e5f6g7h8i9j0k",
    "username": "testuser",
    "playerId": "861117",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### 1.4 更新用户信息

- **请求方式**: PUT
- **接口路径**: `/api/users/profile`
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  |-------|------|------|------|
  | username | string | 否 | 用户名 |

- **响应示例**:

```json
{
  "status": "success",
  "message": "更新成功",
  "data": {
    "_id": "5f9a1b2c3d4e5f6g7h8i9j0k",
    "username": "newname",
    "playerId": "861117",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-02T00:00:00.000Z"
  }
}
```

#### 1.5 创建角色

- **请求方式**: POST
- **接口路径**: `/api/users/character`
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  |-------|------|------|------|
  | userId | string | 是 | 用户ID |
  | name | string | 是 | 角色名称 |
  | avatar | string | 否 | 头像URL |

- **响应示例**:

```json
{
  "status": "success",
  "message": "角色创建成功",
  "data": {
    "player": {
      "id": "861117",
      "name": "修仙者",
      "avatar": ""
    }
  }
}
```

### 2. 游戏相关API

#### 2.1 获取游戏状态

- **请求方式**: GET
- **接口路径**: `/api/game/state`
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  |-------|------|------|------|
  | userId | string | 是 | 用户ID |

- **响应示例**:

```json
{
  "status": "success",
  "data": {
    "_id": "5f9a1b2c3d4e5f6g7h8i9j0k",
    "userId": "5f9a1b2c3d4e5f6g7h8i9j0k",
    "state": {
      "level": 1,
      "exp": 0,
      "gold": 100
    },
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z",
    "lastSaveTime": "2023-01-01T00:00:00.000Z"
  }
}
```

#### 2.2 保存游戏状态

- **请求方式**: POST
- **接口路径**: `/api/game/state`
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  |-------|------|------|------|
  | userId | string | 是 | 用户ID |
  | state | object | 是 | 游戏状态 |

- **响应示例**:

```json
{
  "status": "success",
  "message": "保存成功",
  "data": {
    "_id": "5f9a1b2c3d4e5f6g7h8i9j0k",
    "userId": "5f9a1b2c3d4e5f6g7h8i9j0k",
    "state": {
      "level": 2,
      "exp": 50,
      "gold": 200
    },
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-02T00:00:00.000Z",
    "lastSaveTime": "2023-01-02T00:00:00.000Z"
  }
}
```

#### 2.3 获取游戏配置

- **请求方式**: GET
- **接口路径**: `/api/game/config`
- **响应示例**:

```json
{
  "status": "success",
  "data": {
    "version": "1.0.0",
    "realms": [],
    "skills": [],
    "equipment": []
  }
}
```

#### 2.4 获取排行榜

- **请求方式**: GET
- **接口路径**: `/api/game/ranking`
- **响应示例**:

```json
{
  "status": "success",
  "data": [
    {
      "_id": "5f9a1b2c3d4e5f6g7h8i9j0k",
      "userId": "5f9a1b2c3d4e5f6g7h8i9j0k",
      "username": "testuser",
      "score": 1000,
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

#### 2.5 提交分数

- **请求方式**: POST
- **接口路径**: `/api/game/score`
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  |-------|------|------|------|
  | userId | string | 是 | 用户ID |
  | username | string | 是 | 用户名 |
  | score | number | 是 | 分数 |

- **响应示例**:

```json
{
  "status": "success",
  "message": "提交成功",
  "data": {
    "_id": "5f9a1b2c3d4e5f6g7h8i9j0k",
    "userId": "5f9a1b2c3d4e5f6g7h8i9j0k",
    "username": "testuser",
    "score": 1000,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### 3. 玩家相关API

#### 3.1 获取新玩家ID

- **请求方式**: GET
- **接口路径**: `/api/player/new-id`
- **响应示例**:

```json
{
  "status": "success",
  "data": {
    "playerId": "861117"
  }
}
```

#### 3.2 获取玩家游戏状态

- **请求方式**: GET
- **接口路径**: `/api/player/:playerId`
- **路径参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  |-------|------|------|------|
  | playerId | string | 是 | 玩家ID |

- **响应示例**:

```json
{
  "status": "success",
  "data": {
    "gameState": {
      "level": 1,
      "exp": 0,
      "gold": 100
    },
    "playerId": "861117"
  }
}
```

#### 3.3 保存玩家游戏状态

- **请求方式**: POST
- **接口路径**: `/api/player/:playerId`
- **路径参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  |-------|------|------|------|
  | playerId | string | 是 | 玩家ID |

- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  |-------|------|------|------|
  | gameState | object | 是 | 游戏状态 |
  | lastSaveTime | string | 否 | 最后保存时间 |

- **响应示例**:

```json
{
  "status": "success",
  "message": "保存成功",
  "data": {
    "playerId": "861117",
    "lastSaveTime": "2023-01-01T00:00:00.000Z"
  }
}
```

#### 3.4 获取玩家信息

- **请求方式**: GET
- **接口路径**: `/api/player/info`
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  |-------|------|------|------|
  | id | string | 是 | 玩家ID |

- **响应示例**:

```json
{
  "status": "success",
  "data": {
    "id": "861117",
    "name": "修仙者",
    "avatar": "http://xiuxian-test.richsh.cn:8002/avatars/861117_1620000000000.jpg"
  }
}
```

#### 3.5 上传玩家头像

- **请求方式**: POST
- **接口路径**: `/api/player/avatar`
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  |-------|------|------|------|
  | playerId | string | 是 | 玩家ID |
  | avatar | file | 是 | 头像文件 |

- **响应示例**:

```json
{
  "status": "success",
  "message": "头像上传成功",
  "data": {
    "playerId": "861117",
    "avatar": "http://xiuxian-test.richsh.cn:8002/avatars/861117_1620000000000.jpg"
  }
}
```

#### 3.6 获取角色完整信息

- **请求方式**: GET
- **接口路径**: `/api/player/character-info`
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  |-------|------|------|------|
  | id | string | 是 | 玩家ID |

- **响应示例**:

```json
{
  "status": "success",
  "data": {
    "player": {
      "id": "861117",
      "name": "修仙者",
      "avatar": "http://xiuxian-test.richsh.cn:8002/avatars/861117_1620000000000.jpg"
    },
    "attributes": {
      "base": {
        "constitution": 5,
        "agility": 5,
        "luck": 5,
        "wisdom": 5,
        "freePoints": 20
      },
      "root": {
        "name": "肉体凡胎",
        "bonus": 0.15
      },
      "derived": {
        "health": 58,
        "mana": 29,
        "spirit": 23,
        "attack": 17,
        "defense": 12,
        "speed": 8.625,
        "dodge": 4.6,
        "criticalRate": 2.875
      }
    },
    "equipment": [
      {
        "type": "weapon",
        "name": "木剑",
        "quality": 1,
        "level": 0,
        "attributes": {}
      }
    ],
    "cultivation": {
      "isCultivating": false,
      "efficiency": 1,
      "baseCultivation": 10,
      "rootBonus": 1,
      "skillBonus": 1,
      "realTimeEfficiency": 20
    },
    "realm": {
      "realmName": "凡人",
      "realmLevel": 1,
      "cultivationProgress": 0,
      "cultivationCap": 100,
      "progressPercentage": 0
    }
  }
}
```

#### 3.7 开始修炼

- **请求方式**: POST
- **接口路径**: `/api/player/cultivation/start`
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  |-------|------|------|------|
  | playerId | string | 是 | 玩家ID |

- **响应示例**:

```json
{
  "status": "success",
  "message": "开始修炼成功",
  "data": {
    "isCultivating": true,
    "startTime": "2026-03-25T12:00:00.000Z",
    "realTimeEfficiency": 20
  }
}
```

#### 3.8 停止修炼

- **请求方式**: POST
- **接口路径**: `/api/player/cultivation/stop`
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  |-------|------|------|------|
  | playerId | string | 是 | 玩家ID |

- **响应示例**:

```json
{
  "status": "success",
  "message": "停止修炼成功",
  "data": {
    "isCultivating": false,
    "endTime": "2026-03-25T12:30:00.000Z"
  }
}
```

#### 3.9 分配属性点

- **请求方式**: POST
- **接口路径**: `/api/player/attributes/allocate`
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  |-------|------|------|------|
  | playerId | string | 是 | 玩家ID |
  | constitution | number | 否 | 分配到根骨的点数 |
  | agility | number | 否 | 分配到身法的点数 |
  | luck | number | 否 | 分配到机缘的点数 |
  | wisdom | number | 否 | 分配到悟性的点数 |

- **响应示例**:

```json
{
  "status": "success",
  "message": "属性点分配成功",
  "data": {
    "base": {
      "constitution": 7,
      "agility": 5,
      "luck": 5,
      "wisdom": 5,
      "freePoints": 18
    },
    "derived": {
      "health": 80,
      "mana": 29,
      "spirit": 23,
      "attack": 24,
      "defense": 17,
      "speed": 8.625,
      "dodge": 4.6,
      "criticalRate": 2.875
    }
  }
}
```

#### 3.10 刷新跟脚

- **请求方式**: POST
- **接口路径**: `/api/player/attributes/refresh-root`
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  |-------|------|------|------|
  | playerId | string | 是 | 玩家ID |

- **响应示例**:

```json
{
  "status": "success",
  "message": "跟脚刷新成功",
  "data": {
    "root": {
      "name": "后天精怪",
      "bonus": 0.45
    },
    "derived": {
      "health": 73,
      "mana": 36,
      "spirit": 29,
      "attack": 22,
      "defense": 15,
      "speed": 10.875,
      "dodge": 5.8,
      "criticalRate": 3.625
    }
  }
}
```

#### 3.11 学习功法

- **请求方式**: POST
- **接口路径**: `/api/player/skills/learn`
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  |-------|------|------|------|
  | playerId | string | 是 | 玩家ID |
  | skillId | string | 是 | 功法ID |

- **响应示例**:

```json
{
  "status": "success",
  "message": "学习功法成功",
  "data": {
    "skillId": "skill_001",
    "name": "基础拳法",
    "rank": "凡阶",
    "proficiency": 1,
    "proficiencyName": "入门"
  }
}
```

#### 3.12 提升功法熟练度

- **请求方式**: POST
- **接口路径**: `/api/player/skills/upgrade`
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  |-------|------|------|------|
  | playerId | string | 是 | 玩家ID |
  | skillId | string | 是 | 功法ID |

- **响应示例**:

```json
{
  "status": "success",
  "message": "提升功法熟练度成功",
  "data": {
    "skillId": "skill_001",
    "name": "基础拳法",
    "proficiency": 2,
    "proficiencyName": "生疏",
    "proficiencyMultiplier": 3
  }
}
```

#### 3.13 获取玩家功法列表

- **请求方式**: GET
- **接口路径**: `/api/player/skills`
- **请求参数**:
  | 参数名 | 类型 | 必填 | 描述 |
  |-------|------|------|------|
  | playerId | string | 是 | 玩家ID |

- **响应示例**:

```json
{
  "status": "success",
  "data": {
    "skills": [
      {
        "skillId": "skill_001",
        "name": "基础拳法",
        "rank": "凡阶",
        "description": "最基础的拳法，适合初学者练习",
        "obtainMethod": "初始功法",
        "proficiency": 1,
        "proficiencyName": "入门",
        "proficiencyMultiplier": 1,
        "attributes": {
          "attack": 5,
          "defense": 2
        }
      }
    ]
  }
}
```

### 4. 其他API

#### 4.1 健康检查

- **请求方式**: GET
- **接口路径**: `/api/health`
- **响应示例**:

```json
{
  "status": "ok",
  "message": "修仙游戏后端服务运行正常"
}
```

#### 4.2 默认路由

- **请求方式**: GET
- **接口路径**: `/`
- **响应示例**:

```json
{
  "status": "ok",
  "message": "欢迎访问修仙游戏后端服务"
}
```

## 测试工具

项目提供了API测试页面，可以通过以下地址访问：

```
http://xiuxian-test.richsh.cn:8002/api-test.html
```

该页面包含了所有API接口的测试功能，可以方便地测试各个接口的功能。

## 后续维护

每当新增API接口时，请按照以下格式添加到本文档中：

1. 在对应的分类下添加API接口说明
2. 包含请求方式、接口路径、请求参数、响应示例等信息
3. 确保文档与实际代码保持一致

## 注意事项

- 所有API接口都返回JSON格式的数据
- 错误处理统一返回错误状态码和错误信息
- 头像文件存储在 `uploads/avatars` 目录中，通过 `/avatars/文件名` 访问
- 玩家ID从861117开始递增