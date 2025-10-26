const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs-extra');

class DatabaseManager {
    constructor() {
        this.dbPath = path.resolve(process.env.DB_PATH || './data/diary.db');
        this.db = null;
        this.init();
    }

    async init() {
        try {
            await fs.ensureDir(path.dirname(this.dbPath));
            
            this.db = new sqlite3.Database(this.dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err);
                } else {
                    console.log('Connected to SQLite database');
                    this.createTables();
                }
            });
        } catch (error) {
            console.error('Database initialization error:', error);
        }
    }

    createTables() {
        const createDiaryTable = `
            CREATE TABLE IF NOT EXISTS diary_entries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                weather TEXT,
                mood TEXT,
                content TEXT NOT NULL,
                reflection TEXT,
                raw_input TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT
            )
        `;

        const createTodoTable = `
            CREATE TABLE IF NOT EXISTS todo_items (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                priority TEXT DEFAULT 'medium',
                due_time TEXT,
                category TEXT DEFAULT 'general',
                reminder_time TEXT,
                completed BOOLEAN DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT,
                diary_entry_id INTEGER,
                FOREIGN KEY (diary_entry_id) REFERENCES diary_entries (id)
            )
        `;

        const createReminderTable = `
            CREATE TABLE IF NOT EXISTS reminders_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                todo_id INTEGER NOT NULL,
                reminder_time TEXT NOT NULL,
                sent_at TEXT NOT NULL,
                status TEXT DEFAULT 'sent',
                FOREIGN KEY (todo_id) REFERENCES todo_items (id)
            )
        `;

        this.db.serialize(() => {
            this.db.run(createDiaryTable);
            this.db.run(createTodoTable);
            this.db.run(createReminderTable);
        });
    }

    /**
     * Save diary entry
     */
    async saveDiaryEntry(diaryData) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO diary_entries (date, weather, mood, content, reflection, raw_input, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `;
            
            const now = new Date().toISOString();
            const params = [
                diaryData.date,
                diaryData.weather,
                diaryData.mood,
                diaryData.content,
                diaryData.reflection,
                diaryData.raw_input,
                now
            ];

            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        id: this.lastID,
                        created_at: now,
                        ...diaryData
                    });
                }
            });
        });
    }

    /**
     * Save todo item
     */
    async saveTodoItem(todoData, diaryEntryId = null) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO todo_items (
                    title, description, priority, due_time, category, 
                    reminder_time, created_at, diary_entry_id
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `;
            
            const now = new Date().toISOString();
            const params = [
                todoData.title,
                todoData.description,
                todoData.priority || 'medium',
                todoData.due_time,
                todoData.category || 'general',
                todoData.reminder_time,
                now,
                diaryEntryId
            ];

            this.db.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({
                        id: this.lastID,
                        created_at: now,
                        completed: false,
                        ...todoData
                    });
                }
            });
        });
    }

    /**
     * Get diary entries
     */
    async getDiaryEntries(limit = 50, offset = 0) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM diary_entries 
                ORDER BY created_at DESC 
                LIMIT ? OFFSET ?
            `;

            this.db.all(sql, [limit, offset], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * Get todo items
     */
    async getTodoItems(completed = false, limit = 100) {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT * FROM todo_items 
                WHERE completed = ? 
                ORDER BY 
                    CASE priority 
                        WHEN 'high' THEN 1 
                        WHEN 'medium' THEN 2 
                        WHEN 'low' THEN 3 
                    END,
                    due_time ASC,
                    created_at DESC
                LIMIT ?
            `;

            this.db.all(sql, [completed ? 1 : 0, limit], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * Get todos for reminder
     */
    async getTodosForReminder() {
        return new Promise((resolve, reject) => {
            const now = new Date().toISOString();
            const sql = `
                SELECT t.*, d.date as diary_date
                FROM todo_items t
                LEFT JOIN diary_entries d ON t.diary_entry_id = d.id
                WHERE t.completed = 0 
                AND t.reminder_time IS NOT NULL 
                AND t.reminder_time <= ?
                AND NOT EXISTS (
                    SELECT 1 FROM reminders_history r 
                    WHERE r.todo_id = t.id 
                    AND r.reminder_time = t.reminder_time
                )
                ORDER BY t.reminder_time ASC
            `;

            this.db.all(sql, [now], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /**
     * Mark todo as completed
     */
    async completeTodoItem(todoId) {
        return new Promise((resolve, reject) => {
            const sql = `
                UPDATE todo_items 
                SET completed = 1, updated_at = ? 
                WHERE id = ?
            `;

            this.db.run(sql, [new Date().toISOString(), todoId], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: todoId, completed: true, changes: this.changes });
                }
            });
        });
    }

    /**
     * Record reminder sent
     */
    async recordReminderSent(todoId, reminderTime) {
        return new Promise((resolve, reject) => {
            const sql = `
                INSERT INTO reminders_history (todo_id, reminder_time, sent_at)
                VALUES (?, ?, ?)
            `;

            this.db.run(sql, [todoId, reminderTime, new Date().toISOString()], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID });
                }
            });
        });
    }

    /**
     * Get statistics
     */
    async getStatistics() {
        return new Promise((resolve, reject) => {
            const sql = `
                SELECT 
                    (SELECT COUNT(*) FROM diary_entries) as total_entries,
                    (SELECT COUNT(*) FROM todo_items WHERE completed = 0) as pending_todos,
                    (SELECT COUNT(*) FROM todo_items WHERE completed = 1) as completed_todos,
                    (SELECT COUNT(*) FROM reminders_history) as total_reminders
            `;

            this.db.get(sql, [], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    /**
     * Close database connection
     */
    close() {
        if (this.db) {
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err);
                } else {
                    console.log('Database connection closed');
                }
            });
        }
    }
}

module.exports = DatabaseManager;