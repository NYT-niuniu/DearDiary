require('dotenv').config();
const GoogleAIService = require('./backend/services/googleAI');

const googleAI = new GoogleAIService();

async function testSmartReminders() {
    console.log('Testing smart reminder time setting...\n');

    const testCases = [
        "明天上午10点我要开会",
        "下周一交报告",
        "今天晚上8点给妈妈打电话",
        "下个月15号之前完成项目",
        "明天早上记得买菜",
        "I need to submit the assignment tomorrow",
        "Call the client next week",
        "Meeting at 3 PM today"
    ];

    for (const testCase of testCases) {
        try {
            console.log(`\n--- Testing: "${testCase}" ---`);
            const result = await googleAI.extractTodoItems(testCase);
            
            if (result.success && result.data.todos.length > 0) {
                result.data.todos.forEach((todo, index) => {
                    console.log(`Todo ${index + 1}:`);
                    console.log(`  Title: ${todo.title}`);
                    console.log(`  Priority: ${todo.priority}`);
                    console.log(`  Due Time: ${todo.due_time || 'Not set'}`);
                    console.log(`  Reminder Time: ${todo.reminder_time || 'Not set'}`);
                    console.log(`  Category: ${todo.category}`);
                });
            } else {
                console.log('No todos extracted or failed');
                if (!result.success) {
                    console.log('Error:', result.error);
                }
            }
        } catch (error) {
            console.error(`Error testing "${testCase}":`, error.message);
        }
    }
}

testSmartReminders().catch(console.error);