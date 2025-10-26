/**
 * API Service Class
 * Handles communication with backend API
 */
class APIService {
    constructor(baseURL = '') {
        this.baseURL = baseURL;
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
    }
    
    /**
     * Send HTTP request
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Request options
     * @returns {Promise<Object>} API response
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            method: 'GET',
            headers: { ...this.defaultHeaders },
            ...options
        };
        
        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }
        
        try {
            console.log(`API Request: ${config.method} ${url}`, config.body ? JSON.parse(config.body) : null);
            
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
            }
            
            console.log(`API Response: ${config.method} ${url}`, data);
            return data;
            
        } catch (error) {
            console.error(`API Error: ${config.method} ${url}`, error);
            throw error;
        }
    }
    
    /**
     * GET request
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url);
    }
    
    /**
     * POST request
     */
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: data
        });
    }
    
    /**
     * PUT request
     */
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: data
        });
    }
    
    /**
     * DELETE request
     */
    async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
    
    // AI related APIs
    
    /**
     * Generate diary content
     * @param {string} userInput - User input
     * @returns {Promise<Object>} Diary data
     */
    async generateDiary(userInput) {
        return this.post('/api/ai/diary', { userInput });
    }
    
    /**
     * Extract todo items
     * @param {string} userInput - User input
     * @returns {Promise<Object>} Todo data
     */
    async extractTodos(userInput) {
        return this.post('/api/ai/todos', { userInput });
    }
    
    /**
     * Improve text
     * @param {string} userInput - User input
     * @returns {Promise<Object>} Improved text
     */
    async improveText(userInput) {
        return this.post('/api/ai/improve', { userInput });
    }
    
    /**
     * Analyze user input comprehensively
     * @param {string} userInput - User input
     * @returns {Promise<Object>} Analysis results
     */
    async analyzeInput(userInput) {
        return this.post('/api/ai/analyze', { userInput });
    }
    
    /**
     * Complete processing workflow
     * @param {string} userInput - User input
     * @returns {Promise<Object>} Processing results
     */
    async processInput(userInput) {
        return this.post('/api/process', { userInput });
    }
    
    /**
     * Confirm and save data
     * @param {Object} diaryData - Diary data
     * @param {Object} todoData - Todo data
     * @param {boolean} confirmed - Whether confirmed
     * @returns {Promise<Object>} Save results
     */
    async confirmData(diaryData, todoData, confirmed = true) {
        return this.post('/api/confirm', { diaryData, todoData, confirmed });
    }
    
    // Diary related APIs
    
    /**
     * Create diary entry
     * @param {Object} diaryData - Diary data
     * @returns {Promise<Object>} Creation result
     */
    async createDiary(diaryData) {
        return this.post('/api/diary', diaryData);
    }
    
    /**
     * Get diary list
     * @param {number} limit - Limit quantity
     * @param {number} offset - Offset
     * @returns {Promise<Object>} Diary list
     */
    async getDiaries(limit = 50, offset = 0) {
        return this.get('/api/diary', { limit, offset });
    }
    
    /**
     * Get specific diary
     * @param {number} id - Diary ID
     * @returns {Promise<Object>} Diary data
     */
    async getDiary(id) {
        return this.get(`/api/diary/${id}`);
    }
    
    // Todo related APIs
    
    /**
     * Create todo item
     * @param {Object} todoData - Todo data
     * @returns {Promise<Object>} Creation result
     */
    async createTodo(todoData) {
        return this.post('/api/todos', todoData);
    }
    
    /**
     * Batch create todo items
     * @param {Array} todos - Todo array
     * @param {number} diaryEntryId - Associated diary ID
     * @returns {Promise<Object>} Creation result
     */
    async createTodosBatch(todos, diaryEntryId = null) {
        return this.post('/api/todos/batch', { todos, diary_entry_id: diaryEntryId });
    }
    
    /**
     * Get todo list
     * @param {boolean} completed - Whether completed
     * @param {number} limit - Limit quantity
     * @returns {Promise<Object>} Todo list
     */
    async getTodos(completed = false, limit = 100) {
        return this.get('/api/todos', { completed, limit });
    }
    
    /**
     * Complete todo item
     * @param {number} id - Todo ID
     * @returns {Promise<Object>} Completion result
     */
    async completeTodo(id) {
        return this.put(`/api/todos/${id}/complete`);
    }
    
    // Reminder related APIs
    
    /**
     * Get reminder service status
     * @returns {Promise<Object>} Service status
     */
    async getReminderStatus() {
        return this.get('/api/reminders/status');
    }
    
    /**
     * Start reminder service
     * @returns {Promise<Object>} Operation result
     */
    async startReminderService() {
        return this.post('/api/reminders/start');
    }
    
    /**
     * Stop reminder service
     * @returns {Promise<Object>} Operation result
     */
    async stopReminderService() {
        return this.post('/api/reminders/stop');
    }
    
    /**
     * Send test reminder
     * @returns {Promise<Object>} Operation result
     */
    async sendTestReminder() {
        return this.post('/api/reminders/test');
    }
    
    /**
     * Create custom reminder
     * @param {string} title - Reminder title
     * @param {string} message - Reminder message
     * @param {string} scheduledTime - Scheduled time
     * @returns {Promise<Object>} Creation result
     */
    async createCustomReminder(title, message, scheduledTime) {
        return this.post('/api/reminders/custom', { title, message, scheduledTime });
    }
    
    /**
     * Get pending reminders
     * @returns {Promise<Object>} Pending reminders list
     */
    async getPendingReminders() {
        return this.get('/api/reminders/pending');
    }
    
    /**
     * Batch set reminders
     * @param {Array} todoIds - Todo IDs array
     * @param {number} offsetMinutes - Advance minutes
     * @returns {Promise<Object>} Setting result
     */
    async batchSetReminders(todoIds, offsetMinutes = 15) {
        return this.post('/api/reminders/batch-set', { todoIds, offsetMinutes });
    }
    
    // Health check API
    
    /**
     * Get application health status
     * @returns {Promise<Object>} Health status
     */
    async getHealth() {
        return this.get('/api/health');
    }
}

/**
 * API Error Handling Wrapper
 * Provides unified error handling and loading state management for API calls
 */
class APIWrapper {
    constructor(apiService) {
        this.api = apiService;
    }
    
    /**
     * Wrap API calls with error handling and loading state
     * @param {Function} apiCall - API call function
     * @param {Object} options - Options
     * @returns {Promise<any>} API result
     */
    async execute(apiCall, options = {}) {
        const { 
            showLoading = true,
            loadingMessage = 'AI is processing...',
            errorMessage = 'Operation failed',
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
            console.error('API call failed:', error);
            
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
    
    // Wrap common API methods
    
    async analyzeInput(userInput) {
        return this.execute(
            () => this.api.analyzeInput(userInput),
            {
                loadingMessage: 'AI is analyzing your content...',
                errorMessage: 'Analysis failed, please try again'
            }
        );
    }
    
    async processInput(userInput) {
        return this.execute(
            () => this.api.processInput(userInput),
            {
                loadingMessage: 'AI is generating diary and extracting todos...',
                errorMessage: 'Processing failed, please try again'
            }
        );
    }
    
    async confirmData(diaryData, todoData, confirmed = true) {
        return this.execute(
            () => this.api.confirmData(diaryData, todoData, confirmed),
            {
                loadingMessage: 'Saving data...',
                successMessage: 'Data saved successfully!',
                errorMessage: 'Save failed, please try again'
            }
        );
    }
    
    async getDiaries(limit, offset) {
        return this.execute(
            () => this.api.getDiaries(limit, offset),
            {
                showLoading: false,
                errorMessage: 'Failed to get diary list'
            }
        );
    }
    
    async getTodos(completed, limit) {
        return this.execute(
            () => this.api.getTodos(completed, limit),
            {
                showLoading: false,
                errorMessage: 'Failed to get todos'
            }
        );
    }
    
    async completeTodo(id) {
        return this.execute(
            () => this.api.completeTodo(id),
            {
                showLoading: false,
                successMessage: 'Todo completed!',
                errorMessage: 'Operation failed, please try again'
            }
        );
    }
    
    async sendTestReminder() {
        return this.execute(
            () => this.api.sendTestReminder(),
            {
                showLoading: false,
                successMessage: window.i18n.t('test_reminder_sent'),
                errorMessage: window.i18n.t('test_reminder_failed')
            }
        );
    }
    
    async getHealth() {
        return this.execute(
            () => this.api.getHealth(),
            {
                showLoading: false,
                errorMessage: 'Failed to get application status'
            }
        );
    }
}

// Create global API instances
window.apiService = new APIService();
window.api = new APIWrapper(window.apiService);