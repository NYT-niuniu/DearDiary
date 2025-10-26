const express = require('express');
const router = express.Router();

/**
 * POST /api/todos
 * Create new todo item
 */
router.post('/', async (req, res) => {
    try {
        const { title, description, priority, due_time, category, reminder_time, diary_entry_id } = req.body;
        
        if (!title) {
            return res.status(400).json({
                success: false,
                error: 'Title is required'
            });
        }

        const todoData = {
            title,
            description: description || '',
            priority: priority || 'medium',
            due_time: due_time || null,
            category: category || 'general',
            reminder_time: reminder_time || null
        };

        const savedTodo = await req.db.saveTodoItem(todoData, diary_entry_id || null);
        
        res.json({
            success: true,
            data: savedTodo
        });
        
    } catch (error) {
        console.error('Error creating todo item:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create todo item'
        });
    }
});

/**
 * GET /api/todos
 * Get todo items list
 */
router.get('/', async (req, res) => {
    try {
        const completed = req.query.completed === 'true';
        const limit = parseInt(req.query.limit) || 100;
        
        const todos = await req.db.getTodoItems(completed, limit);
        
        res.json({
            success: true,
            data: todos,
            meta: {
                completed,
                count: todos.length
            }
        });
        
    } catch (error) {
        console.error('Error fetching todos:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch todos'
        });
    }
});

/**
 * PUT /api/todos/:id/complete
 * Mark todo item as completed
 */
router.put('/:id/complete', async (req, res) => {
    try {
        const todoId = parseInt(req.params.id);
        
        if (isNaN(todoId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid todo ID'
            });
        }

        const result = await req.db.completeTodoItem(todoId);
        
        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                error: 'Todo item not found'
            });
        }

        res.json({
            success: true,
            data: result
        });
        
    } catch (error) {
        console.error('Error completing todo:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to complete todo item'
        });
    }
});

/**
 * POST /api/todos/batch
 * Batch create todo items
 */
router.post('/batch', async (req, res) => {
    try {
        const { todos, diary_entry_id } = req.body;
        
        if (!Array.isArray(todos) || todos.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Todos array is required and must not be empty'
            });
        }

        const results = [];
        const errors = [];

        for (const todo of todos) {
            try {
                if (!todo.title) {
                    errors.push({ todo, error: 'Title is required' });
                    continue;
                }

                const todoData = {
                    title: todo.title,
                    description: todo.description || '',
                    priority: todo.priority || 'medium',
                    due_time: todo.due_time || null,
                    category: todo.category || 'general',
                    reminder_time: todo.reminder_time || null
                };

                const savedTodo = await req.db.saveTodoItem(todoData, diary_entry_id || null);
                results.push(savedTodo);
            } catch (error) {
                errors.push({ todo, error: error.message });
            }
        }

        res.json({
            success: true,
            data: {
                created: results,
                errors: errors,
                totalCreated: results.length,
                totalErrors: errors.length
            }
        });
        
    } catch (error) {
        console.error('Error batch creating todos:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to batch create todos'
        });
    }
});

module.exports = router;