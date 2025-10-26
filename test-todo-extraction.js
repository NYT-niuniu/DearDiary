require('dotenv').config();
const GoogleAIService = require('./backend/services/googleAI');

async function testTodoExtraction() {
    try {
        console.log('测试待办事项提取功能...');
        
        const aiService = new GoogleAIService();
        
        // 测试待办事项提取
        const testInput = "明天要去超市买菜，下午2点要开会，晚上要给妈妈打电话，还要记得明天交作业";
        
        console.log('\n测试输入:', testInput);
        console.log('\n开始提取待办事项...');
        
        const result = await aiService.extractTodoItems(testInput);
        
        console.log('\n提取结果:');
        console.log(JSON.stringify(result, null, 2));
        
    } catch (error) {
        console.error('测试失败:', error.message);
        console.error('详细错误:', error);
    }
}

testTodoExtraction();