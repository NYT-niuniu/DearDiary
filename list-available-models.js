require('dotenv').config();

async function listModels() {
    try {
        const apiKey = process.env.GOOGLE_AI_API_KEY;
        
        if (!apiKey) {
            console.error('需要设置 GOOGLE_AI_API_KEY 环境变量');
            return;
        }
        
        console.log('获取可用模型列表...');
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('API 错误:', response.status, errorData);
            return;
        }
        
        const data = await response.json();
        
        console.log('\n可用模型:');
        if (data.models) {
            data.models.forEach(model => {
                console.log(`- 名称: ${model.name}`);
                console.log(`  显示名称: ${model.displayName}`);
                console.log(`  版本: ${model.version}`);
                console.log(`  支持的方法: ${model.supportedGenerationMethods?.join(', ') || '未知'}`);
                console.log(`  输入上限: ${model.inputTokenLimit || '未知'}`);
                console.log(`  输出上限: ${model.outputTokenLimit || '未知'}`);
                console.log('---');
            });
        } else {
            console.log('未找到模型信息');
        }
        
    } catch (error) {
        console.error('错误:', error.message);
    }
}

listModels();