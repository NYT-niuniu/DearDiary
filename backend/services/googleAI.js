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
     * Call Google AI API
     * @param {string} prompt - AI prompt
     * @returns {Promise<string>} API response text
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
     * Detect user input language
     * @param {string} userInput - User input text
     * @returns {string} Language code (zh/en)
     */
    detectLanguage(userInput) {
        const chinesePattern = /[\u4e00-\u9fff]/;
        const englishPattern = /[a-zA-Z]/;
        
        const chineseCount = (userInput.match(chinesePattern) || []).length;
        const englishCount = (userInput.match(englishPattern) || []).length;
        
        if (chineseCount > englishCount * 0.5) {
            return 'zh';
        }
        return 'en';
    }

    /**
     * Get current date in unified format
     * @param {string} language - Language code
     * @returns {string} Formatted date string
     */
    getCurrentDate(language = 'zh') {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    }

    /**
     * Get current time context for AI understanding
     * @returns {Object} Object containing current time information
     */
    getCurrentTimeContext() {
        const now = new Date();
        
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const nextWeek = new Date(now);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        
        return {
            current_datetime: now.toISOString(),
            current_date: formatDate(now),
            current_time: now.toTimeString().slice(0, 5),
            current_weekday: now.toLocaleDateString('en-US', { weekday: 'long' }),
            tomorrow_date: formatDate(tomorrow),
            next_week_date: formatDate(nextWeek),
            current_year: now.getFullYear(),
            current_month: now.getMonth() + 1,
            current_day: now.getDate(),
            current_hour: now.getHours()
        };
    }

    /**
     * Generate formatted diary entry
     * @param {string} userInput - User's original input
     * @returns {Promise<Object>} Object containing diary content and metadata
     */
    async generateDiaryEntry(userInput) {
        try {
            const language = this.detectLanguage(userInput);
            const currentDate = this.getCurrentDate(language);
            
            let prompt;
            if (language === 'zh') {
                // Chinese prompt: Acts as professional diary assistant to convert natural language input into structured diary format
                // Extracts date, weather, mood, content and reflection in Chinese
                prompt = `
作为一个专业的日记助手，请帮我将以下用户的自然语言输入转换成一篇格式化的日记：

用户输入：${userInput}

请按照以下格式生成日记：

**日期**: ${currentDate}
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
5. 日期必须使用YYYY-MM-DD格式：${currentDate}

请以JSON格式返回结果：
{
    "date": "${currentDate}",
    "weather": "天气",
    "mood": "心情",
    "content": "今日记录内容",
    "reflection": "今日感悟",
    "raw_input": "原始输入"
}
                `;
            } else {
                // English prompt: Acts as professional diary assistant to convert natural language input into structured diary format
                // Extracts date, weather, mood, content and reflection in English
                prompt = `
As a professional diary assistant, please help me convert the following user's natural language input into a formatted diary entry:

User input: ${userInput}

Please generate a diary entry in the following format:

**Date**: ${currentDate}
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
5. Date must use YYYY-MM-DD format: ${currentDate}

Please return results in JSON format:
{
    "date": "${currentDate}",
    "weather": "weather",
    "mood": "mood",
    "content": "today's record content",
    "reflection": "today's reflection",
    "raw_input": "original input"
}
                `;
            }

            const text = await this.callAPI(prompt);
            
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
            
            return {
                success: true,
                data: {
                    date: currentDate,
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
     * Extract todo items from user input
     * @param {string} userInput - User's original input
     * @returns {Promise<Object>} Object containing todo items list
     */
    async extractTodoItems(userInput) {
        try {
            const language = this.detectLanguage(userInput);
            const timeContext = this.getCurrentTimeContext();
            
            let prompt;
            if (language === 'zh') {
                // Chinese prompt: Extracts todo items from natural language input with intelligent time parsing
                // Handles relative time expressions, priority assessment, and automatic reminder scheduling
                // Provides detailed time parsing rules for Chinese temporal expressions
                prompt = `
请从以下用户输入中提取待办事项（todo items）：

用户输入：${userInput}

当前时间上下文：
- 当前日期时间：${timeContext.current_datetime}
- 当前日期：${timeContext.current_date}（${timeContext.current_weekday}）
- 当前时间：${timeContext.current_time}
- 明天日期：${timeContext.tomorrow_date}
- 下周同一天：${timeContext.next_week_date}

请识别出所有明确或隐含的任务、计划、约会等需要用户后续执行的事项。

时间解析规则（非常重要）：
1. "今天下午三点" = ${timeContext.current_date}T15:00:00.000Z
2. "明天上午九点" = ${timeContext.tomorrow_date}T09:00:00.000Z
3. "今天晚上" = ${timeContext.current_date}T20:00:00.000Z
4. "明天" 默认 = ${timeContext.tomorrow_date}T09:00:00.000Z
5. "下周一" = 计算下周一的日期 + 09:00:00.000Z
6. 相对时间要基于当前时间计算绝对时间

对于每个待办事项，请智能提取以下信息：
1. 任务描述（简洁明确）
2. 优先级（高/中/低）- 基于紧急程度和用户语气
3. 截止时间（due_time）- 准确解析用户提到的时间
4. 提醒时间（reminder_time）- 智能设置提醒策略：
   
   提醒时间设置规则：
   - 如果截止时间在今天：提醒时间 = 截止时间前30分钟
   - 如果截止时间在明天：提醒时间 = 今天晚上8点
   - 如果截止时间在本周内：提醒时间 = 前一天晚上8点
   - 如果截止时间超过一周：提醒时间 = 前两天上午9点
   - 紧急任务（high优先级）：提醒时间可以更早

5. 类别（学习/工作/生活/健康/社交等）

示例分析：
- "今天下午三点要交作业" 
  → due_time: ${timeContext.current_date}T15:00:00.000Z
  → reminder_time: ${timeContext.current_date}T14:30:00.000Z（提前30分钟）
- "明天早上开会"
  → due_time: ${timeContext.tomorrow_date}T09:00:00.000Z  
  → reminder_time: ${timeContext.current_date}T20:00:00.000Z（今晚8点提醒）

请以JSON格式返回结果：
{
    "todos": [
        {
            "title": "任务标题",
            "description": "详细描述",
            "priority": "high/medium/low",
            "due_time": "YYYY-MM-DDTHH:MM:SS.000Z或null",
            "category": "类别",
            "reminder_time": "YYYY-MM-DDTHH:MM:SS.000Z或null"
        }
    ],
    "total_count": 数量
}

注意：必须严格按照时间解析规则计算时间，所有时间使用ISO 8601格式。
                `;
            } else {
                // English prompt: Extracts todo items from natural language input with intelligent time parsing
                // Handles relative time expressions, priority assessment, and automatic reminder scheduling
                prompt = `
Please extract todo items from the following user input:

User input: ${userInput}

Current time context:
- Current datetime: ${timeContext.current_datetime}
- Current date: ${timeContext.current_date}
- Current time: ${timeContext.current_time}
- Current weekday: ${timeContext.current_weekday}
- Tomorrow date: ${timeContext.tomorrow_date}
- Next week same day: ${timeContext.next_week_date}

Please identify all explicit or implicit tasks, plans, appointments, etc. that require user's follow-up actions.

For each todo item, please intelligently extract the following information:
1. Task description (concise and clear)
2. Priority (high/medium/low) - based on user's tone and urgency
3. Due time (due_time) - if user mentions specific time, calculate accurate ISO format time
4. Reminder time (reminder_time) - intelligently set reminder time:
   - If there's a clear due time, reminder should be before the due time
   - If user says "tomorrow", set reminder to tomorrow 8:00 AM
   - If user says "next week", set reminder to next Monday 9:00 AM
   - For urgent tasks, reminder can be set earlier
5. Category (work/study/life/health/social, etc.)

Please return results in JSON format:
{
    "todos": [
        {
            "title": "task title",
            "description": "detailed description",
            "priority": "high/medium/low",
            "due_time": "YYYY-MM-DDTHH:MM:SS.000Z or null",
            "category": "category",
            "reminder_time": "YYYY-MM-DDTHH:MM:SS.000Z or null"
        }
    ],
    "total_count": number
}

Notes: All times must use ISO 8601 format, reminder time should be set reasonably.
                `;
            }

            const text = await this.callAPI(prompt);
            
            try {
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsedResult = JSON.parse(jsonMatch[0]);
                    
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
     * Improve and optimize user's original text input
     * @param {string} userInput - User's original text input
     * @returns {Promise<Object>} Optimized text
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