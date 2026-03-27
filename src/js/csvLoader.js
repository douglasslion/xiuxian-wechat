/**
 * CSV数据加载器模块
 * 用于从CSV文件中加载游戏配置数据
 * @version 1.0.0
 */

class CSVLoader {
    constructor() {
        this.data = {};
    }

    /**
     * 解析CSV文本为数组
     * @param {string} csvText - CSV文本内容
     * @returns {Array} 解析后的数据数组
     */
    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        if (lines.length < 2) {
            console.log('CSV文件行数不足，至少需要2行（1行标题 + 1行数据）');
            return [];
        }

        const headers = lines[0].split(',').map(h => h.trim());
        console.log(`CSV文件标题行: ${headers.join(', ')}`);
        console.log(`CSV文件标题数量: ${headers.length}`);
        
        const result = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const values = line.split(',').map(v => v.trim());
            console.log(`第${i}行数据: ${values.join(', ')}`);
            console.log(`第${i}行字段数量: ${values.length}`);
            
            if (values.length !== headers.length) {
                console.warn(`第${i}行字段数量与标题不匹配，跳过该行`);
                continue;
            }

            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = values[index];
            });
            result.push(obj);
        }

        console.log(`CSV文件解析完成，成功解析 ${result.length} 行数据`);
        return result;
    }

    /**
     * 加载CSV文件
     * @param {string} filename - 文件名
     * @returns {Promise<Array>} 解析后的数据
     */
    async loadCSV(filename) {
        try {
            console.log(`开始加载CSV文件: ${filename}`);
            // 使用相对路径，这样当通过本地服务器访问时会自动使用HTTP协议
            const response = await fetch(`data/csv/${filename}`);
            
            if (!response.ok) {
                console.error(`HTTP错误: ${response.status} ${response.statusText} - ${filename}`);
                return [];
            }
            
            const text = await response.text();
            console.log(`成功加载CSV文件: ${filename}，内容长度: ${text.length}`);
            
            const result = this.parseCSV(text);
            console.log(`解析CSV文件: ${filename}，解析结果数量: ${result.length}`);
            return result;
        } catch (error) {
            console.error(`加载CSV文件失败: ${filename}`, error);
            return [];
        }
    }

    /**
     * 加载所有配置数据
     * @returns {Promise<Object>} 所有配置数据
     */
    async loadAllData() {
        const promises = [
            this.loadCSV('realms.csv').then(data => this.data.realms = data),
            this.loadCSV('items.csv').then(data => this.data.items = data),
            this.loadCSV('equipment_slots.csv').then(data => this.data.equipmentSlots = data),
            this.loadCSV('equipment_qualities.csv').then(data => this.data.equipmentQualities = data),
            this.loadCSV('skills.csv').then(data => this.data.skills = data),
            this.loadCSV('pets.csv').then(data => this.data.pets = data),
            this.loadCSV('daily_tasks.csv').then(data => this.data.dailyTasks = data),
            this.loadCSV('spirit_roots.csv').then(data => this.data.spiritRoots = data),
            this.loadCSV('identities.csv').then(data => this.data.identities = data),
            this.loadCSV('pills.csv').then(data => this.data.pills = data),
            this.loadCSV('quality_colors.csv').then(data => this.data.qualityColors = data)
        ];

        await Promise.all(promises);
        return this.data;
    }

    /**
     * 根据ID获取数据项
     * @param {string} tableName - 表名
     * @param {string} id - 数据ID
     * @returns {Object|null} 数据项
     */
    getById(tableName, id) {
        const table = this.data[tableName];
        if (!table) return null;
        return table.find(item => item.id === id) || null;
    }

    /**
     * 获取所有数据
     * @returns {Object} 所有数据
     */
    getAllData() {
        return this.data;
    }
}

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CSVLoader;
}
