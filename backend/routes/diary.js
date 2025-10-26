const express = require('express');
const router = express.Router();

/**
 * POST /api/diary
 * 创建新的日记条目
 */
router.post('/', async (req, res) => {
    try {
        const { date, weather, mood, content, reflection, raw_input } = req.body;
        
        if (!content) {
            return res.status(400).json({
                success: false,
                error: 'Content is required'
            });
        }

        const diaryData = {
            date: date || new Date().toLocaleDateString('zh-CN'),
            weather: weather || '未记录',
            mood: mood || '平静',
            content,
            reflection: reflection || '',
            raw_input: raw_input || ''
        };

        const savedEntry = await req.db.saveDiaryEntry(diaryData);
        
        res.json({
            success: true,
            data: savedEntry
        });
        
    } catch (error) {
        console.error('Error creating diary entry:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create diary entry'
        });
    }
});

/**
 * GET /api/diary
 * 获取日记条目列表
 */
router.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        
        const entries = await req.db.getDiaryEntries(limit, offset);
        
        res.json({
            success: true,
            data: entries,
            pagination: {
                limit,
                offset,
                count: entries.length
            }
        });
        
    } catch (error) {
        console.error('Error fetching diary entries:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch diary entries'
        });
    }
});

/**
 * GET /api/diary/:id
 * 获取特定日记条目
 */
router.get('/:id', async (req, res) => {
    try {
        const entryId = parseInt(req.params.id);
        
        if (isNaN(entryId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid entry ID'
            });
        }

        // 这里需要添加获取单个日记条目的方法
        // 暂时返回未实现的错误
        res.status(501).json({
            success: false,
            error: 'Feature not implemented yet'
        });
        
    } catch (error) {
        console.error('Error fetching diary entry:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch diary entry'
        });
    }
});

module.exports = router;