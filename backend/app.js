const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

// 导入服务和模型
const GoogleAIService = require('./services/googleAI');
const DatabaseManager = require('./models/database');
const ReminderService = require('./services/reminder');

// 导入路由
const aiRoutes = require('./routes/ai');
const diaryRoutes = require('./routes/diary');
const todosRoutes = require('./routes/todos');
const remindersRoutes = require('./routes/reminders');

class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 3000;
        this.db = null;
        this.reminderService = null;
        
        this.init();
    }
    
    async init() {
        try {
            // 初始化数据库
            this.db = new DatabaseManager();
            await this.setupDatabase();
            
            // 初始化提醒服务
            this.reminderService = new ReminderService(this.db);
            
            // 配置中间件
            this.setupMiddleware();
            
            // 配置路由
            this.setupRoutes();
            
            // 启动提醒服务
            this.reminderService.start();
            
            console.log('服务器初始化完成');
            
        } catch (error) {
            console.error('服务器初始化失败:', error);
            process.exit(1);
        }
    }
    
    async setupDatabase() {
        // 等待数据库初始化完成
        return new Promise((resolve) => {
            const checkDatabase = () => {
                if (this.db.db) {
                    console.log('数据库连接成功');
                    resolve();
                } else {
                    setTimeout(checkDatabase, 100);
                }
            };
            checkDatabase();
        });
    }
    
    setupMiddleware() {
        // CORS配置
        this.app.use(cors({
            origin: process.env.NODE_ENV === 'production' ? false : true,
            credentials: true
        }));
        
        // 解析JSON请求体
        this.app.use(bodyParser.json({ limit: '10mb' }));
        this.app.use(bodyParser.urlencoded({ extended: true }));
        
        // 静态文件服务
        this.app.use(express.static(path.join(__dirname, '../frontend')));
        
        // 添加数据库和提醒服务到请求对象
        this.app.use((req, res, next) => {
            req.db = this.db;
            req.reminderService = this.reminderService;
            next();
        });
        
        // 请求日志
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }
    
    setupRoutes() {
        // API路由
        this.app.use('/api/ai', aiRoutes);
        this.app.use('/api/diary', diaryRoutes);
        this.app.use('/api/todos', todosRoutes);
        this.app.use('/api/reminders', remindersRoutes);
        
        // 健康检查
        this.app.get('/api/health', async (req, res) => {
            try {
                const stats = await this.db.getStatistics();
                const reminderStatus = this.reminderService.getStatus();
                
                res.json({
                    success: true,
                    timestamp: new Date().toISOString(),
                    status: 'healthy',
                    version: '1.0.0',
                    database: {
                        connected: !!this.db.db,
                        statistics: stats
                    },
                    reminders: reminderStatus,
                    environment: process.env.NODE_ENV || 'development'
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    error: error.message
                });
            }
        });
        
        // 完整处理流程
        this.app.post('/api/process', async (req, res) => {
            try {
                const { userInput } = req.body;
                
                if (!userInput) {
                    return res.status(400).json({
                        success: false,
                        error: 'User input is required'
                    });
                }
                
                const googleAI = new GoogleAIService();
                
                // 并行分析
                const [diaryResult, todoResult] = await Promise.all([
                    googleAI.generateDiaryEntry(userInput),
                    googleAI.extractTodoItems(userInput)
                ]);
                
                res.json({
                    success: true,
                    data: {
                        diary: diaryResult.success ? diaryResult.data : null,
                        todos: todoResult.success ? todoResult.data : null,
                        errors: {
                            diary: diaryResult.success ? null : diaryResult.error,
                            todos: todoResult.success ? null : todoResult.error
                        }
                    }
                });
                
            } catch (error) {
                console.error('Processing error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        });
        
        // 确认保存数据
        this.app.post('/api/confirm', async (req, res) => {
            try {
                const { diaryData, todoData, confirmed } = req.body;
                
                if (!confirmed) {
                    return res.json({
                        success: true,
                        message: 'Data discarded'
                    });
                }
                
                const results = {
                    diary: null,
                    todos: [],
                    errors: []
                };
                
                // 保存日记
                if (diaryData) {
                    try {
                        results.diary = await this.db.saveDiaryEntry(diaryData);
                    } catch (error) {
                        results.errors.push(`保存日记失败: ${error.message}`);
                    }
                }
                
                // 保存待办事项
                if (todoData && todoData.todos && Array.isArray(todoData.todos)) {
                    for (const todo of todoData.todos) {
                        try {
                            const savedTodo = await this.db.saveTodoItem(todo, results.diary?.id);
                            results.todos.push(savedTodo);
                        } catch (error) {
                            results.errors.push(`保存待办事项失败: ${error.message}`);
                        }
                    }
                }
                
                res.json({
                    success: results.errors.length === 0,
                    data: results,
                    message: results.errors.length === 0 ? '数据保存成功' : '部分数据保存失败'
                });
                
            } catch (error) {
                console.error('Confirm error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        });
        
        // 主页路由
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../frontend/index.html'));
        });
        
        // 404处理
        this.app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                error: 'Route not found'
            });
        });
        
        // 错误处理中间件
        this.app.use((error, req, res, next) => {
            console.error('Server error:', error);
            res.status(500).json({
                success: false,
                error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message
            });
        });
    }
    
    start() {
        this.app.listen(this.port, () => {
            console.log(`
🚀 Dear Diary 服务器启动成功！

📍 访问地址: http://localhost:${this.port}
🌍 环境模式: ${process.env.NODE_ENV || 'development'}
🗄️  数据库: ${this.db.dbPath}
⏰ 提醒服务: ${this.reminderService.isRunning ? '运行中' : '已停止'}

💡 使用说明:
1. 打开浏览器访问 http://localhost:${this.port}
2. 输入你的一天经历（文字或语音）
3. AI 会自动生成日记并提取待办事项
4. 设置提醒时间并保存

🛑 停止服务器: 按 Ctrl+C
            `);
        });
    }
    
    async stop() {
        console.log('正在关闭服务器...');
        
        if (this.reminderService) {
            this.reminderService.stop();
        }
        
        if (this.db) {
            this.db.close();
        }
        
        console.log('服务器已关闭');
        process.exit(0);
    }
}

// 创建并启动服务器
const server = new Server();

// 优雅关闭
process.on('SIGINT', () => {
    server.stop();
});

process.on('SIGTERM', () => {
    server.stop();
});

// 启动服务器
server.start();

module.exports = Server;