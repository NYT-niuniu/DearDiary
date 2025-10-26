// 完整测试AI待办事项提取
const GoogleAIService = require('./backend/services/googleAI.js');

async function testTodoExtraction() {
    try {
        const service = new GoogleAIService();
        
        console.log('=== 测试AI待办事项提取 ===');
        
        // 测试输入
        const testInput = "今天下午三点要交作业";
        
        console.log(`测试输入: ${testInput}`);
        
        // 获取时间上下文
        const timeContext = service.getCurrentTimeContext();
        console.log('\n当前时间上下文:');
        console.log(`- 当前日期: ${timeContext.current_date}`);
        console.log(`- 明天日期: ${timeContext.tomorrow_date}`);
        
        // 调用AI分析
        console.log('\n正在调用AI分析...');
        const result = await service.extractTodoItems(testInput);
        
        console.log('\n=== AI分析结果 ===');
        console.log(JSON.stringify(result, null, 2));
        
        // 检查结果中的时间
        if (result.todos && result.todos.length > 0) {
            const firstTodo = result.todos[0];
            console.log('\n=== 时间分析 ===');
            console.log(`截止时间: ${firstTodo.due_time}`);
            console.log(`提醒时间: ${firstTodo.reminder_time}`);
            
            if (firstTodo.due_time && firstTodo.due_time.includes('2023')) {
                console.log('❌ 发现2023年！这是问题所在！');
            } else if (firstTodo.due_time && firstTodo.due_time.includes('2025')) {
                console.log('✅ 时间正确，使用2025年');
            }
        }
        
    } catch (error) {
        console.error('测试失败:', error.message);
    }
}

testTodoExtraction();