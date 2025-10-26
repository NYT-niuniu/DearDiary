require('dotenv').config();

class GoogleAIService {
    constructor() {
        if (!process.env.GOOGLE_AI_API_KEY) {
            throw new Error('Google AI API key is required. Please set GOOGLE_AI_API_KEY in your .env file.');
        }
        
        this.apiKey = process.env.GOOGLE_AI_API_KEY;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    }

    /**
     * 调用 Google AI API
     * @param {string} prompt - 提示词
     * @returns {Promise<string>} API响应文本
     */
    async callAPI(prompt) {
        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        };

        const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Google AI API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
            return data.candidates[0].content.parts[0].text;
        }
        
        throw new Error('Invalid response format from Google AI API');
    }

    /**
     * 检测用户输入的语言
     * @param {string} userInput - 用户输入
     * @returns {string} 语言代码 (zh/en)
     */
    detectLanguage(userInput) {
        // 简单的语言检测逻辑
        const chinesePattern = /[\u4e00-\u9fff]/;
        const englishPattern = /[a-zA-Z]/;
        
        const chineseCount = (userInput.match(chinesePattern) || []).length;
        const englishCount = (userInput.match(englishPattern) || []).length;
        
        // 如果中文字符数量明显多于英文，判断为中文
        if (chineseCount > englishCount * 0.5) {
            return 'zh';
        }
        // 否则默认为英文
        return 'en';
    }

    /**
     * 生成格式化的日记内容
     * @param {string} userInput - 用户的原始输入
     * @returns {Promise<Object>} 包含日记内容和元数据的对象
     */
    async generateDiaryEntry(userInput) {
        try {
            const language = this.detectLanguage(userInput);
            
            let prompt;
            if (language === 'zh') {
                prompt = `
作为一个专业的日记助手，请帮我将以下用户的自然语言输入转换成一篇格式化的日记：

用户输入：${userInput}

请按照以下格式生成日记：

**日期**: ${new Date().toLocaleDateString('zh-CN')}
**天气**: [如果用户提到天气，请提取；如果没有提到，标记为"未记录"]
**心情**: [根据用户的话语分析情绪，用一个词概括，如：开心、平静、疲惫、兴奋等]

**今日记录**:
[将用户的输入重新组织成流畅的日记段落，保持第一人称，使语言更加生动和有条理]

**今日感悟**:
[基于用户的分享，提供一些正面的思考或建议，不超过50字]

请确保：
1. 保持用户原意，不要添加用户没有提到的具体事件
2. 语言要自然流畅，符合日记写作风格
3. 如果用户提到了具体的时间、地点、人物，请保留这些信息
4. 保持积极正面的语调

请以JSON格式返回结果：
{
    "date": "日期",
    "weather": "天气",
    "mood": "心情",
    "content": "今日记录内容",
    "reflection": "今日感悟",
    "raw_input": "原始输入"
}
                `;
            } else {
                prompt = `
As a professional diary assistant, please help me convert the following user's natural language input into a formatted diary entry:

User input: ${userInput}

Please generate a diary entry in the following format:

**Date**: ${new Date().toLocaleDateString('en-AU')}
**Weather**: [Extract weather if mentioned by user; otherwise mark as "Not recorded"]
**Mood**: [Analyze emotion based on user's words, summarize in one word, such as: happy, calm, tired, excited, etc.]

**Today's Record**:
[Reorganize user's input into smooth diary paragraphs, maintain first person, make language more vivid and organized]

**Today's Reflection**:
[Based on user's sharing, provide some positive thoughts or suggestions, no more than 50 words]

Please ensure:
1. Maintain user's original meaning, don't add specific events not mentioned by user
2. Language should be natural and smooth, conforming to diary writing style
3. If user mentions specific time, place, people, please retain this information
4. Maintain positive tone

Please return results in JSON format:
{
    "date": "date",
    "weather": "weather",
    "mood": "mood",
    "content": "today's record content",
    "reflection": "today's reflection",
    "raw_input": "original input"
}
                `;
            }

            const text = await this.callAPI(prompt);
            
            // 尝试解析JSON响应
            try {
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsedResult = JSON.parse(jsonMatch[0]);
                    return {
                        success: true,
                        data: {
                            ...parsedResult,
                            generated_at: new Date().toISOString()
                        }
                    };
                }
            } catch (parseError) {
                console.error('JSON parsing error:', parseError);
            }
            
            // 如果JSON解析失败，返回原始文本
            return {
                success: true,
                data: {
                    date: new Date().toLocaleDateString('zh-CN'),
                    weather: "未记录",
                    mood: "平静",
                    content: text,
                    reflection: "记录生活的点点滴滴，珍惜每一个当下。",
                    raw_input: userInput,
                    generated_at: new Date().toISOString()
                }
            };
            
        } catch (error) {
            console.error('Error generating diary entry:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 从用户输入中提取待办事项
     * @param {string} userInput - 用户的原始输入
     * @returns {Promise<Object>} 包含待办事项列表的对象
     */
    async extractTodoItems(userInput) {
        try {
            const language = this.detectLanguage(userInput);
            
            let prompt;
            if (language === 'zh') {
                prompt = `
请从以下用户输入中提取待办事项（todo items）：

用户输入：${userInput}

请识别出所有明确或隐含的任务、计划、约会等需要用户后续执行的事项。

对于每个待办事项，请提取以下信息：
1. 任务描述（简洁明确）
2. 优先级（高/中/低）
3. 预估的截止时间或提醒时间（如果用户提到了时间）
4. 类别（工作/学习/生活/健康/社交等）

请以JSON格式返回结果：
{
    "todos": [
        {
            "title": "任务标题",
            "description": "详细描述",
            "priority": "high/medium/low",
            "due_time": "ISO时间格式或null",
            "category": "类别",
            "reminder_time": "提醒时间的ISO格式或null"
        }
    ],
    "total_count": 数量
}

注意：
- 如果没有发现任何待办事项，返回空数组
- 时间相关的信息要尽可能准确，如果用户说"明天"，请计算出具体日期
- 优先级基于用户的语气和紧急程度判断
- 只提取明确的行动项目，不要包含已经完成的事情
                `;
            } else {
                prompt = `
Please extract todo items from the following user input:

User input: ${userInput}

Please identify all explicit or implicit tasks, plans, appointments, etc. that require user's follow-up actions.

For each todo item, please extract the following information:
1. Task description (concise and clear)
2. Priority (high/medium/low)
3. Estimated due time or reminder time (if user mentioned time)
4. Category (work/study/life/health/social, etc.)

Please return results in JSON format:
{
    "todos": [
        {
            "title": "task title",
            "description": "detailed description",
            "priority": "high/medium/low",
            "due_time": "ISO time format or null",
            "category": "category",
            "reminder_time": "reminder time in ISO format or null"
        }
    ],
    "total_count": number
}

Notes:
- If no todo items are found, return empty array
- Time-related information should be as accurate as possible, if user says "tomorrow", please calculate the specific date
- Priority based on user's tone and urgency judgment
- Only extract clear action items, don't include completed things
                `;
            }

            const text = await this.callAPI(prompt);
            
            // 尝试解析JSON响应
            try {
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsedResult = JSON.parse(jsonMatch[0]);
                    
                    // 为每个todo添加ID和创建时间
                    if (parsedResult.todos && Array.isArray(parsedResult.todos)) {
                        parsedResult.todos = parsedResult.todos.map((todo, index) => ({
                            id: Date.now() + index,
                            ...todo,
                            created_at: new Date().toISOString(),
                            completed: false
                        }));
                    }
                    
                    return {
                        success: true,
                        data: parsedResult
                    };
                }
            } catch (parseError) {
                console.error('JSON parsing error:', parseError);
            }
            
            // 如果JSON解析失败，返回空的待办事项
            return {
                success: true,
                data: {
                    todos: [],
                    total_count: 0
                }
            };
            
        } catch (error) {
            console.error('Error extracting todo items:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 优化和改进用户的原始文本输入
     * @param {string} userInput - 用户输入的原始文本
     * @returns {Promise<Object>} 优化后的文本
     */
    async improveText(userInput) {
        try {
            const prompt = `
请帮我优化以下文本，使其更加清晰、流畅和有条理：

原文：${userInput}

优化要求：
1. 纠正明显的语法错误和拼写错误
2. 改善句子结构，使表达更清晰
3. 保持原意不变，不要添加新的信息
4. 保持原文的语调和风格
5. 如果是语音转文字的结果，修正常见的转换错误

请返回优化后的文本。
            `;

            const text = await this.callAPI(prompt);
            
            return {
                success: true,
                data: {
                    original: userInput,
                    improved: text.trim(),
                    improved_at: new Date().toISOString()
                }
            };
            
        } catch (error) {
            console.error('Error improving text:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = GoogleAIService;