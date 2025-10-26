// 测试时间上下文生成
const path = require('path');
const GoogleAIService = require('./backend/services/googleAI.js');

const service = new GoogleAIService();

console.log('=== 时间上下文测试 ===');
const timeContext = service.getCurrentTimeContext();
console.log('TimeContext:', JSON.stringify(timeContext, null, 2));

console.log('\n=== 测试示例prompt片段 ===');
console.log(`当前日期：${timeContext.current_date}`);
console.log(`今天下午三点示例：${timeContext.current_date}T15:00:00.000Z`);
console.log(`明天日期：${timeContext.tomorrow_date}`);
console.log(`明天早上九点示例：${timeContext.tomorrow_date}T09:00:00.000Z`);

console.log('\n=== 检查是否存在硬编码的2023年 ===');
const testPrompt = `
时间解析规则（非常重要）：
1. "今天下午三点" = ${timeContext.current_date}T15:00:00.000Z
2. "明天上午九点" = ${timeContext.tomorrow_date}T09:00:00.000Z
`;

console.log('生成的prompt片段:');
console.log(testPrompt);

// 检查是否包含2023
if (testPrompt.includes('2023')) {
    console.log('❌ 发现2023年硬编码！');
} else {
    console.log('✅ 没有发现2023年硬编码');
}