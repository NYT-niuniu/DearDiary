require('dotenv').config();

async function testFullAPI() {
    try {
        console.log('测试完整的 API 流程...');
        
        const baseUrl = 'http://localhost:3000';
        
        // 测试健康检查
        console.log('\n1. 测试健康检查...');
        const healthResponse = await fetch(`${baseUrl}/api/health`);
        const healthData = await healthResponse.json();
        console.log('健康状态:', healthData);
        
        // 测试处理用户输入
        console.log('\n2. 测试处理用户输入...');
        const userInput = "今天工作很忙，完成了项目报告，明天要开会汇报，晚上记得给客户发邮件";
        
        const processResponse = await fetch(`${baseUrl}/api/process`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userInput })
        });
        
        const processData = await processResponse.json();
        console.log('处理结果:', JSON.stringify(processData, null, 2));
        
        // 测试确认并保存数据
        if (processData.success && processData.diaryData && processData.todoData) {
            console.log('\n3. 测试确认并保存数据...');
            
            const confirmResponse = await fetch(`${baseUrl}/api/confirm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    diaryData: processData.diaryData,
                    todoData: processData.todoData,
                    confirmed: true
                })
            });
            
            const confirmData = await confirmResponse.json();
            console.log('保存结果:', confirmData);
        }
        
        console.log('\n✅ 所有测试完成！');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    }
}

testFullAPI();