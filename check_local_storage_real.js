/**
 * 检查真实本地存储中的游戏状态
 */

// 检查本地存储
const gameState = localStorage.getItem('xiuxian_game_state');

if (gameState) {
    console.log('本地存储中存在游戏状态');
    try {
        const parsed = JSON.parse(gameState);
        console.log('玩家名称:', parsed.player ? parsed.player.name : '未知');
        console.log('装备系统:', parsed.equipment ? '存在' : '不存在');
        if (parsed.equipment) {
            console.log('装备背包长度:', parsed.equipment.inventory ? parsed.equipment.inventory.length : 0);
            if (parsed.equipment.inventory) {
                console.log('武器数量:', parsed.equipment.inventory.filter(item => item.slot === 'weapon').length);
                console.log('衣服数量:', parsed.equipment.inventory.filter(item => item.slot === 'armor').length);
                console.log('鞋子数量:', parsed.equipment.inventory.filter(item => item.slot === 'boots').length);
                console.log('前3个装备:', parsed.equipment.inventory.slice(0, 3));
            }
        }
    } catch (error) {
        console.error('解析游戏状态失败:', error);
    }
} else {
    console.log('本地存储中不存在游戏状态');
}

// 清除本地存储
if (confirm('是否清除本地存储？')) {
    localStorage.removeItem('xiuxian_game_state');
    console.log('本地存储已清除');
}