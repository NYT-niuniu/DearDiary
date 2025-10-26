const express = require('express');
const router = express.Router();

/**
 * GET /api/reminders/status
 * 获取提醒服务状态
 */
router.get('/status', (req, res) => {
    try {
        const status = req.reminderService.getStatus();
        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        console.error('Error getting reminder status:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get reminder status'
        });
    }
});

/**
 * POST /api/reminders/start
 * 启动提醒服务
 */
router.post('/start', (req, res) => {
    try {
        req.reminderService.start();
        res.json({
            success: true,
            message: 'Reminder service started'
        });
    } catch (error) {
        console.error('Error starting reminder service:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to start reminder service'
        });
    }
});

/**
 * POST /api/reminders/stop
 * 停止提醒服务
 */
router.post('/stop', (req, res) => {
    try {
        req.reminderService.stop();
        res.json({
            success: true,
            message: 'Reminder service stopped'
        });
    } catch (error) {
        console.error('Error stopping reminder service:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to stop reminder service'
        });
    }
});

/**
 * POST /api/reminders/test
 * 发送测试提醒
 */
router.post('/test', async (req, res) => {
    try {
        const result = await req.reminderService.sendTestReminder();
        res.json(result);
    } catch (error) {
        console.error('Error sending test reminder:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to send test reminder'
        });
    }
});

/**
 * POST /api/reminders/custom
 * 创建自定义提醒
 */
router.post('/custom', async (req, res) => {
    try {
        const { title, message, scheduledTime } = req.body;
        
        if (!scheduledTime) {
            return res.status(400).json({
                success: false,
                error: 'Scheduled time is required'
            });
        }

        const result = await req.reminderService.createCustomReminder(title, message, scheduledTime);
        res.json(result);
    } catch (error) {
        console.error('Error creating custom reminder:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create custom reminder'
        });
    }
});

/**
 * GET /api/reminders/pending
 * 获取待提醒的待办事项
 */
router.get('/pending', async (req, res) => {
    try {
        const pendingReminders = await req.db.getTodosForReminder();
        res.json({
            success: true,
            data: pendingReminders,
            count: pendingReminders.length
        });
    } catch (error) {
        console.error('Error getting pending reminders:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get pending reminders'
        });
    }
});

/**
 * POST /api/reminders/batch-set
 * 批量设置提醒时间
 */
router.post('/batch-set', async (req, res) => {
    try {
        const { todoIds, offsetMinutes = 15 } = req.body;
        
        if (!Array.isArray(todoIds) || todoIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Todo IDs array is required'
            });
        }

        // 获取这些待办事项
        const todos = [];
        for (const id of todoIds) {
            // 这里需要添加根据ID获取todo的方法，暂时跳过
            // const todo = await req.db.getTodoById(id);
            // if (todo) todos.push(todo);
        }

        const results = await req.reminderService.batchSetReminders(todos, offsetMinutes);
        
        res.json({
            success: true,
            data: results
        });
    } catch (error) {
        console.error('Error batch setting reminders:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to batch set reminders'
        });
    }
});

module.exports = router;