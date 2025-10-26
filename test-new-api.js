require('dotenv').config();
const GoogleAIService = require('./backend/services/googleAI');

async function testAPI() {
    try {
        console.log('测试新的 Google AI API 端点...');
        
        const aiService = new GoogleAIService();
        
        console.log('API 端点:', aiService.baseUrl);
        console.log('API Key (前5位):', aiService.apiKey?.substring(0, 5) + '...');
        
        // 测试简单的文本生成
        const testInput = "今天天气很好，去公园散步了，感觉很放松";
        
        console.log('\n测试输入:', testInput);
        console.log('\n开始生成日记...');
        
        const result = await aiService.generateDiaryEntry(testInput);
        
        console.log('\n生成结果:');
        console.log(JSON.stringify(result, null, 2));
        
    } catch (error) {
        console.error('测试失败:', error.message);
        console.error('详细错误:', error);
    }
}

testAPI();