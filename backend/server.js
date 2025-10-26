const express = require('express');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
require('dotenv').config();

// Import services and models
const GoogleAIService = require('./services/googleAI');
const DatabaseManager = require('./models/database');
const ReminderService = require('./services/reminder');

// Import routes
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
            this.db = new DatabaseManager();
            await this.setupDatabase();
            
            try {
                this.reminderService = new ReminderService(this.db);
                console.log('Reminder service initialized successfully');
            } catch (error) {
                console.error('Reminder service initialization failed:', error);
                this.reminderService = null;
            }
            
            this.setupMiddleware();
            
            this.setupRoutes();
            
            if (this.reminderService) {
                try {
                    this.reminderService.start();
                    console.log('Reminder service started successfully');
                } catch (error) {
                    console.error('Reminder service start failed:', error);
                }
            }
            
            console.log('Server initialization completed');
            
        } catch (error) {
            console.error('Server initialization failed:', error);
            process.exit(1);
        }
    }
    
    async setupDatabase() {
        return new Promise((resolve) => {
            const checkDatabase = () => {
                if (this.db.db) {
                    console.log('Database connection successful');
                    resolve();
                } else {
                    setTimeout(checkDatabase, 100);
                }
            };
            checkDatabase();
        });
    }
    
    setupMiddleware() {
        this.app.use(cors({
            origin: process.env.NODE_ENV === 'production' ? false : true,
            credentials: true
        }));
        
        this.app.use(bodyParser.json({ limit: '10mb' }));
        this.app.use(bodyParser.urlencoded({ extended: true }));
        
        this.app.use(express.static(path.join(__dirname, '../frontend')));
        
        this.app.use((req, res, next) => {
            req.db = this.db;
            req.reminderService = this.reminderService;
            next();
        });
        
        this.app.use((req, res, next) => {
            console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
            next();
        });
    }
    
    setupRoutes() {
        this.app.use('/api/ai', aiRoutes);
        this.app.use('/api/diary', diaryRoutes);
        this.app.use('/api/todos', todosRoutes);
        this.app.use('/api/reminders', remindersRoutes);
        
        // Health check endpoint
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
        
        // Complete processing pipeline
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
        
        // Confirm and save data
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
                
                if (diaryData) {
                    try {
                        results.diary = await this.db.saveDiaryEntry(diaryData);
                    } catch (error) {
                        results.errors.push(`Failed to save diary: ${error.message}`);
                    }
                }
                
                if (todoData && todoData.todos && Array.isArray(todoData.todos)) {
                    for (const todo of todoData.todos) {
                        try {
                            const savedTodo = await this.db.saveTodoItem(todo, results.diary?.id);
                            results.todos.push(savedTodo);
                        } catch (error) {
                            results.errors.push(`Failed to save todo: ${error.message}`);
                        }
                    }
                }
                
                res.json({
                    success: results.errors.length === 0,
                    data: results,
                    message: results.errors.length === 0 ? 'Data saved successfully' : 'Some data failed to save'
                });
                
            } catch (error) {
                console.error('Confirm error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        });
        
        // Home route
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../frontend/index.html'));
        });
        
        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                error: 'Route not found'
            });
        });
        
        // Error handling middleware
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
🚀 Dear Diary Server Started Successfully!

📍 Access URL: http://localhost:${this.port}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
🗄️  Database: ${this.db ? this.db.dbPath : 'Not connected'}
⏰ Reminder Service: ${this.reminderService && this.reminderService.isRunning ? 'Running' : 'Stopped'}

💡 Usage Instructions:
1. Open browser and visit http://localhost:${this.port}
2. Enter your daily experiences (text or voice)
3. AI will automatically generate diary entries and extract todos
4. Set reminder times and save

🛑 Stop Server: Press Ctrl+C
            `);
        });
    }
    
    async stop() {
        console.log('Shutting down server...');
        
        if (this.reminderService) {
            this.reminderService.stop();
        }
        
        if (this.db) {
            this.db.close();
        }
        
        console.log('Server shut down');
        process.exit(0);
    }
}

// Create and start server
const server = new Server();

// Graceful shutdown
process.on('SIGINT', () => {
    server.stop();
});

process.on('SIGTERM', () => {
    server.stop();
});

// Start server
server.start();

module.exports = Server;