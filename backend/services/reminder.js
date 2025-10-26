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
     * Start the reminder service
     */
    start() {
        if (this.isRunning) {
            console.log('Reminder service is already running');
            return;
        }

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
     * Stop the reminder service
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
     * Check for pending reminders and send notifications
     */
    async checkAndSendReminders() {
        try {
            const todosToRemind = await this.db.getTodosForReminder();
            
            for (const todo of todosToRemind) {
                await this.sendReminder(todo);
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
     * Send individual reminder notification
     */
    async sendReminder(todo) {
        try {
            const title = '📝 Dear Diary Reminder';
            const message = this.formatReminderMessage(todo);
            
            notifier.notify({
                title: title,
                message: message,
                icon: path.join(__dirname, '../../frontend/assets/icon.png'),
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

            console.log(`Reminder sent for todo: ${todo.title}`);
        } catch (error) {
            console.error('Error sending reminder:', error);
        }
    }

    /**
     * Format reminder message with todo details
     */
    formatReminderMessage(todo) {
        let message = `⏰ Todo Reminder: ${todo.title}`;
        
        if (todo.description) {
            message += `\n📄 Description: ${todo.description}`;
        }
        
        if (todo.due_time) {
            const dueDate = new Date(todo.due_time);
            const now = new Date();
            const timeDiff = dueDate.getTime() - now.getTime();
            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
            
            if (daysDiff === 0) {
                message += `\n🚨 Due today`;
            } else if (daysDiff === 1) {
                message += `\n📅 Due tomorrow`;
            } else if (daysDiff > 1) {
                message += `\n📅 Due in ${daysDiff} days`;
            } else {
                message += `\n⚠️ Overdue by ${Math.abs(daysDiff)} days`;
            }
        }
        
        const priorityEmoji = {
            'high': '🔴',
            'medium': '🟡',
            'low': '🟢'
        };
        message += `\n${priorityEmoji[todo.priority] || '🟡'} Priority: ${todo.priority}`;
        
        return message;
    }

    /**
     * Send test reminder for debugging
     */
    async sendTestReminder() {
        const testTodo = {
            id: 0,
            title: 'This is a test reminder',
            description: 'Testing Dear Diary reminder functionality',
            priority: 'medium',
            due_time: new Date().toISOString(),
            category: 'test'
        };

        await this.sendReminder(testTodo);
        return { success: true, message: 'Test reminder sent' };
    }

    /**
     * Create custom reminder with specified time
     */
    async createCustomReminder(title, message, scheduledTime) {
        try {
            const now = new Date();
            const targetTime = new Date(scheduledTime);
            
            if (targetTime <= now) {
                throw new Error('Scheduled time must be in the future');
            }

            const delay = targetTime.getTime() - now.getTime();
            
            setTimeout(() => {
                notifier.notify({
                    title: title || '📝 Dear Diary Custom Reminder',
                    message: message || 'You have a custom reminder',
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
     * Get service status and configuration
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            cronExpression: process.env.REMINDER_CHECK_INTERVAL || '* * * * *',
            nextCheck: this.cronJob ? this.cronJob.nextDates().toISOString() : null
        };
    }

    /**
     * Batch set reminder times for multiple todos
     */
    async batchSetReminders(todos, defaultOffset = 15) {
        const results = [];
        
        for (const todo of todos) {
            try {
                let reminderTime;
                
                if (todo.due_time) {
                    const dueDate = new Date(todo.due_time);
                    reminderTime = new Date(dueDate.getTime() - (defaultOffset * 60 * 1000));
                } else {
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    reminderTime = tomorrow;
                }

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