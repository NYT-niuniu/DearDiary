const cron = require('node-cron');
const notifier = require('node-notifier');
const path = require('path');

class ReminderService {
    constructor(databaseManager) {
        this.db = databaseManager;
        this.cronJob = null;
        this.isRunning = false;
    }

    /**
     * 启动提醒服务
     */
    start() {
        if (this.isRunning) {
            console.log('Reminder service is already running');
            return;
        }

        // 每分钟检查一次是否有需要提醒的待办事项
        this.cronJob = cron.schedule(process.env.REMINDER_CHECK_INTERVAL || '* * * * *', async () => {
            await this.checkAndSendReminders();
        }, {
            scheduled: false
        });

        this.cronJob.start();
        this.isRunning = true;
        console.log('Reminder service started');
    }

    /**
     * 停止提醒服务
     */
    stop() {
        if (this.cronJob) {
            this.cronJob.stop();
            this.cronJob = null;
        }
        this.isRunning = false;
        console.log('Reminder service stopped');
    }

    /**
     * 检查并发送提醒
     */
    async checkAndSendReminders() {
        try {
            const todosToRemind = await this.db.getTodosForReminder();
            
            for (const todo of todosToRemind) {
                await this.sendReminder(todo);
                // 记录提醒已发送
                await this.db.recordReminderSent(todo.id, todo.reminder_time);
            }

            if (todosToRemind.length > 0) {
                console.log(`Sent ${todosToRemind.length} reminders`);
            }
        } catch (error) {
            console.error('Error checking reminders:', error);
        }
    }

    /**
     * 发送单个提醒
     */
    async sendReminder(todo) {
        try {
            const title = '📝 Dear Diary 提醒';
            const message = this.formatReminderMessage(todo);
            
            // 桌面通知
            notifier.notify({
                title: title,
                message: message,
                icon: path.join(__dirname, '../../frontend/assets/icon.png'), // 需要添加图标文件
                sound: true,
                wait: true,
                timeout: 10
            }, (err, response) => {
                if (err) {
                    console.error('Notification error:', err);
                } else {
                    console.log('Notification sent:', response);
                }
            });

            // 如果是Web环境，也可以通过WebSocket发送实时通知
            // 这里可以扩展WebSocket功能
            
            console.log(`Reminder sent for todo: ${todo.title}`);
        } catch (error) {
            console.error('Error sending reminder:', error);
        }
    }

    /**
     * 格式化提醒消息
     */
    formatReminderMessage(todo) {
        let message = `⏰ 待办提醒：${todo.title}`;
        
        if (todo.description) {
            message += `\n📄 描述：${todo.description}`;
        }
        
        if (todo.due_time) {
            const dueDate = new Date(todo.due_time);
            const now = new Date();
            const timeDiff = dueDate.getTime() - now.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            
            if (daysDiff === 0) {
                message += `\n🚨 今天截止`;
            } else if (daysDiff === 1) {
                message += `\n📅 明天截止`;
            } else if (daysDiff > 1) {
                message += `\n📅 ${daysDiff}天后截止`;
            } else {
                message += `\n⚠️ 已过期${Math.abs(daysDiff)}天`;
            }
        }
        
        // 添加优先级标识
        const priorityEmoji = {
            'high': '🔴',
            'medium': '🟡',
            'low': '🟢'
        };
        message += `\n${priorityEmoji[todo.priority] || '🟡'} 优先级：${todo.priority}`;
        
        return message;
    }

    /**
     * 手动发送测试提醒
     */
    async sendTestReminder() {
        const testTodo = {
            id: 0,
            title: '这是一个测试提醒',
            description: '测试Dear Diary提醒功能是否正常工作',
            priority: 'medium',
            due_time: new Date().toISOString(),
            category: 'test'
        };

        await this.sendReminder(testTodo);
        return { success: true, message: 'Test reminder sent' };
    }

    /**
     * 创建自定义提醒
     */
    async createCustomReminder(title, message, scheduledTime) {
        try {
            const now = new Date();
            const targetTime = new Date(scheduledTime);
            
            if (targetTime <= now) {
                throw new Error('Scheduled time must be in the future');
            }

            // 计算延迟时间（毫秒）
            const delay = targetTime.getTime() - now.getTime();
            
            // 使用setTimeout设置一次性提醒
            setTimeout(() => {
                notifier.notify({
                    title: title || '📝 Dear Diary 自定义提醒',
                    message: message || '您有一个自定义提醒',
                    icon: path.join(__dirname, '../../frontend/assets/icon.png'),
                    sound: true,
                    wait: true,
                    timeout: 10
                });
            }, delay);

            return {
                success: true,
                message: 'Custom reminder scheduled',
                scheduledTime: targetTime.toISOString()
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 获取服务状态
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            cronExpression: process.env.REMINDER_CHECK_INTERVAL || '* * * * *',
            nextCheck: this.cronJob ? this.cronJob.nextDates().toISOString() : null
        };
    }

    /**
     * 批量设置提醒时间
     */
    async batchSetReminders(todos, defaultOffset = 15) {
        const results = [];
        
        for (const todo of todos) {
            try {
                let reminderTime;
                
                if (todo.due_time) {
                    // 如果有截止时间，设置为截止时间前N分钟提醒
                    const dueDate = new Date(todo.due_time);
                    reminderTime = new Date(dueDate.getTime() - (defaultOffset * 60 * 1000));
                } else {
                    // 如果没有截止时间，设置为明天同一时间提醒
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    reminderTime = tomorrow;
                }

                // 更新数据库中的提醒时间
                await this.db.db.run(
                    'UPDATE todo_items SET reminder_time = ? WHERE id = ?',
                    [reminderTime.toISOString(), todo.id]
                );

                results.push({
                    todoId: todo.id,
                    title: todo.title,
                    reminderTime: reminderTime.toISOString(),
                    success: true
                });
            } catch (error) {
                results.push({
                    todoId: todo.id,
                    title: todo.title,
                    success: false,
                    error: error.message
                });
            }
        }

        return results;
    }
}

module.exports = ReminderService;