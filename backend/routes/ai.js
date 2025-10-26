const express = require('express');
const router = express.Router();
const GoogleAIService = require('../services/googleAI');

const googleAI = new GoogleAIService();

/**
 * POST /api/ai/diary
 * 生成日记内容
 */
router.post('/diary', async (req, res) => {
    try {
        const { userInput } = req.body;
        
        if (!userInput || typeof userInput !== 'string' || userInput.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'User input is required and must be a non-empty string'
            });
        }

        const result = await googleAI.generateDiaryEntry(userInput.trim());
        res.json(result);
        
    } catch (error) {
        console.error('Error in /api/ai/diary:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while generating diary entry'
        });
    }
});

/**
 * POST /api/ai/todos
 * 提取待办事项
 */
router.post('/todos', async (req, res) => {
    try {
        const { userInput } = req.body;
        
        if (!userInput || typeof userInput !== 'string' || userInput.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'User input is required and must be a non-empty string'
            });
        }

        const result = await googleAI.extractTodoItems(userInput.trim());
        res.json(result);
        
    } catch (error) {
        console.error('Error in /api/ai/todos:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while extracting todo items'
        });
    }
});

/**
 * POST /api/ai/improve
 * 优化文本
 */
router.post('/improve', async (req, res) => {
    try {
        const { userInput } = req.body;
        
        if (!userInput || typeof userInput !== 'string' || userInput.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'User input is required and must be a non-empty string'
            });
        }

        const result = await googleAI.improveText(userInput.trim());
        res.json(result);
        
    } catch (error) {
        console.error('Error in /api/ai/improve:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while improving text'
        });
    }
});

/**
 * POST /api/ai/analyze
 * 综合分析用户输入（生成日记+提取待办事项）
 */
router.post('/analyze', async (req, res) => {
    try {
        const { userInput } = req.body;
        
        if (!userInput || typeof userInput !== 'string' || userInput.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: 'User input is required and must be a non-empty string'
            });
        }

        const trimmedInput = userInput.trim();
        
        // 并行执行日记生成和待办事项提取
        const [diaryResult, todoResult] = await Promise.all([
            googleAI.generateDiaryEntry(trimmedInput),
            googleAI.extractTodoItems(trimmedInput)
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
        console.error('Error in /api/ai/analyze:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error while analyzing user input'
        });
    }
});

module.exports = router;