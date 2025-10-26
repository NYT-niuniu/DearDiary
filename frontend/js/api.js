/**
 * API服务类
 * 负责与后端API进行通信
 */
class APIService {
    constructor(baseURL = '') {
        this.baseURL = baseURL;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
    }
    
    /**
     * 发送HTTP请求
     * @param {string} endpoint - API端点
     * @param {Object} options - 请求选项
     * @returns {Promise<Object>} API响应
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            method: 'GET',
            headers: { ...this.defaultHeaders },
            ...options
        };
        
        // 如果有数据且不是GET请求，转换为JSON
        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }
        
        try {
            console.log(`API请求: ${config.method} ${url}`, config.body ? JSON.parse(config.body) : null);
            
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            console.log(`API响应: ${config.method} ${url}`, data);
            return data;
            
        } catch (error) {
            console.error(`API错误: ${config.method} ${url}`, error);
            throw error;
        }
    }
    
    /**
     * GET请求
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url);
    }
    
    /**
     * POST请求
     */
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: data
        });
    }
    
    /**
     * PUT请求
     */
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: data
        });
    }
    
    /**
     * DELETE请求
     */
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
    
    // AI相关API
    
    /**
     * 生成日记内容
     * @param {string} userInput - 用户输入
     * @returns {Promise<Object>} 日记数据
     */
    async generateDiary(userInput) {
        return this.post('/api/ai/diary', { userInput });
    }
    
    /**
     * 提取待办事项
     * @param {string} userInput - 用户输入
     * @returns {Promise<Object>} 待办事项数据
     */
    async extractTodos(userInput) {
        return this.post('/api/ai/todos', { userInput });
    }
    
    /**
     * 优化文本
     * @param {string} userInput - 用户输入
     * @returns {Promise<Object>} 优化后的文本
     */
    async improveText(userInput) {
        return this.post('/api/ai/improve', { userInput });
    }
    
    /**
     * 综合分析用户输入
     * @param {string} userInput - 用户输入
     * @returns {Promise<Object>} 分析结果
     */
    async analyzeInput(userInput) {
        return this.post('/api/ai/analyze', { userInput });
    }
    
    /**
     * 完整处理流程
     * @param {string} userInput - 用户输入
     * @returns {Promise<Object>} 处理结果
     */
    async processInput(userInput) {
        return this.post('/api/process', { userInput });
    }
    
    /**
     * 确认并保存数据
     * @param {Object} diaryData - 日记数据
     * @param {Object} todoData - 待办事项数据
     * @param {boolean} confirmed - 是否确认
     * @returns {Promise<Object>} 保存结果
     */
    async confirmData(diaryData, todoData, confirmed = true) {
        return this.post('/api/confirm', { diaryData, todoData, confirmed });
    }
    
    // 日记相关API
    
    /**
     * 创建日记条目
     * @param {Object} diaryData - 日记数据
     * @returns {Promise<Object>} 创建结果
     */
    async createDiary(diaryData) {
        return this.post('/api/diary', diaryData);
    }
    
    /**
     * 获取日记列表
     * @param {number} limit - 限制数量
     * @param {number} offset - 偏移量
     * @returns {Promise<Object>} 日记列表
     */
    async getDiaries(limit = 50, offset = 0) {
        return this.get('/api/diary', { limit, offset });
    }
    
    /**
     * 获取指定日记
     * @param {number} id - 日记ID
     * @returns {Promise<Object>} 日记数据
     */
    async getDiary(id) {
        return this.get(`/api/diary/${id}`);
    }
    
    // 待办事项相关API
    
    /**
     * 创建待办事项
     * @param {Object} todoData - 待办事项数据
     * @returns {Promise<Object>} 创建结果
     */
    async createTodo(todoData) {
        return this.post('/api/todos', todoData);
    }
    
    /**
     * 批量创建待办事项
     * @param {Array} todos - 待办事项数组
     * @param {number} diaryEntryId - 关联的日记ID
     * @returns {Promise<Object>} 创建结果
     */
    async createTodosBatch(todos, diaryEntryId = null) {
        return this.post('/api/todos/batch', { todos, diary_entry_id: diaryEntryId });
    }
    
    /**
     * 获取待办事项列表
     * @param {boolean} completed - 是否已完成
     * @param {number} limit - 限制数量
     * @returns {Promise<Object>} 待办事项列表
     */
    async getTodos(completed = false, limit = 100) {
        return this.get('/api/todos', { completed, limit });
    }
    
    /**
     * 完成待办事项
     * @param {number} id - 待办事项ID
     * @returns {Promise<Object>} 完成结果
     */
    async completeTodo(id) {
        return this.put(`/api/todos/${id}/complete`);
    }
    
    // 提醒相关API
    
    /**
     * 获取提醒服务状态
     * @returns {Promise<Object>} 服务状态
     */
    async getReminderStatus() {
        return this.get('/api/reminders/status');
    }
    
    /**
     * 启动提醒服务
     * @returns {Promise<Object>} 操作结果
     */
    async startReminderService() {
        return this.post('/api/reminders/start');
    }
    
    /**
     * 停止提醒服务
     * @returns {Promise<Object>} 操作结果
     */
    async stopReminderService() {
        return this.post('/api/reminders/stop');
    }
    
    /**
     * 发送测试提醒
     * @returns {Promise<Object>} 操作结果
     */
    async sendTestReminder() {
        return this.post('/api/reminders/test');
    }
    
    /**
     * 创建自定义提醒
     * @param {string} title - 提醒标题
     * @param {string} message - 提醒消息
     * @param {string} scheduledTime - 计划时间
     * @returns {Promise<Object>} 创建结果
     */
    async createCustomReminder(title, message, scheduledTime) {
        return this.post('/api/reminders/custom', { title, message, scheduledTime });
    }
    
    /**
     * 获取待提醒的事项
     * @returns {Promise<Object>} 待提醒事项列表
     */
    async getPendingReminders() {
        return this.get('/api/reminders/pending');
    }
    
    /**
     * 批量设置提醒
     * @param {Array} todoIds - 待办事项ID数组
     * @param {number} offsetMinutes - 提前分钟数
     * @returns {Promise<Object>} 设置结果
     */
    async batchSetReminders(todoIds, offsetMinutes = 15) {
        return this.post('/api/reminders/batch-set', { todoIds, offsetMinutes });
    }
    
    // 健康检查API
    
    /**
     * 获取应用健康状态
     * @returns {Promise<Object>} 健康状态
     */
    async getHealth() {
        return this.get('/api/health');
    }
}

/**
 * API错误处理包装器
 * 为API调用提供统一的错误处理和加载状态管理
 */
class APIWrapper {
    constructor(apiService) {
        this.api = apiService;
    }
    
    /**
     * 包装API调用，提供错误处理和加载状态
     * @param {Function} apiCall - API调用函数
     * @param {Object} options - 选项
     * @returns {Promise<any>} API结果
     */
    async execute(apiCall, options = {}) {
        const { 
            showLoading = true,
            loadingMessage = 'AI正在处理...',
            errorMessage = '操作失败',
            successMessage = null,
            onSuccess = null,
            onError = null
        } = options;
        
        try {
            if (showLoading) {
                Loading.show(loadingMessage);
            }
            
            const result = await apiCall();
            
            if (successMessage) {
                Notification.success(successMessage);
            }
            
            if (onSuccess) {
                onSuccess(result);
            }
            
            return result;
            
        } catch (error) {
            console.error('API调用失败:', error);
            
            const message = error.message || errorMessage;
            Notification.error(message);
            
            if (onError) {
                onError(error);
            }
            
            throw error;
            
        } finally {
            if (showLoading) {
                Loading.hide();
            }
        }
    }
    
    // 包装常用的API方法
    
    async analyzeInput(userInput) {
        return this.execute(
            () => this.api.analyzeInput(userInput),
            {
                loadingMessage: 'AI正在分析你的内容...',
                errorMessage: '分析失败，请重试'
            }
        );
    }
    
    async processInput(userInput) {
        return this.execute(
            () => this.api.processInput(userInput),
            {
                loadingMessage: 'AI正在生成日记和提取待办事项...',
                errorMessage: '处理失败，请重试'
            }
        );
    }
    
    async confirmData(diaryData, todoData, confirmed = true) {
        return this.execute(
            () => this.api.confirmData(diaryData, todoData, confirmed),
            {
                loadingMessage: '正在保存数据...',
                successMessage: '数据保存成功！',
                errorMessage: '保存失败，请重试'
            }
        );
    }
    
    async getDiaries(limit, offset) {
        return this.execute(
            () => this.api.getDiaries(limit, offset),
            {
                showLoading: false,
                errorMessage: '获取日记列表失败'
            }
        );
    }
    
    async getTodos(completed, limit) {
        return this.execute(
            () => this.api.getTodos(completed, limit),
            {
                showLoading: false,
                errorMessage: '获取待办事项失败'
            }
        );
    }
    
    async completeTodo(id) {
        return this.execute(
            () => this.api.completeTodo(id),
            {
                showLoading: false,
                successMessage: '待办事项已完成！',
                errorMessage: '操作失败，请重试'
            }
        );
    }
    
    async sendTestReminder() {
        return this.execute(
            () => this.api.sendTestReminder(),
            {
                showLoading: false,
                successMessage: '测试提醒已发送！',
                errorMessage: '发送测试提醒失败'
            }
        );
    }
    
    async getHealth() {
        return this.execute(
            () => this.api.getHealth(),
            {
                showLoading: false,
                errorMessage: '获取应用状态失败'
            }
        );
    }
}

// 创建全局API实例
window.apiService = new APIService();
window.api = new APIWrapper(window.apiService);