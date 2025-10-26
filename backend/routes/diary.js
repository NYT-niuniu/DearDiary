const express = require('express');
const router = express.Router();

// POST /api/diary
router.post('/', async (req, res) => {
    try {
        const { date, weather, mood, content, reflection, raw_input, language } = req.body;
        
        if (!content) {
            return res.status(400).json({
                success: false,
                error: 'Content is required'
            });
        }

        const isZhCN = language === 'zh' || req.headers['accept-language']?.includes('zh');
        const defaultWeather = isZhCN ? '未记录' : 'Not recorded';
        const defaultMood = isZhCN ? '平静' : 'Calm';

        const diaryData = {
            date: date || new Date().toLocaleDateString('zh-CN'),
            weather: weather || defaultWeather,
            mood: mood || defaultMood,
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

// GET /api/diary
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

// GET /api/diary/:id
router.get('/:id', async (req, res) => {
    try {
        const entryId = parseInt(req.params.id);
        
        if (isNaN(entryId)) {
            return res.status(400).json({
                success: false,
                error: 'Invalid entry ID'
            });
        }

        // TODO: Add method to get single diary entry
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