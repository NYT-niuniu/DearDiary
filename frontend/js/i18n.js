/**
 * 国际化(i18n)管理器
 * 负责多语言支持和语言切换功能
 */
class I18nManager {
    constructor() {
        this.currentLanguage = 'en';  // 默认英文
        this.translations = {};
        this.loadTranslations();
        this.init();
    }

    /**
     * 初始化国际化管理器
     */
    init() {
        // 从本地存储读取语言设置
        const savedLanguage = localStorage.getItem('dearDiary_language');
        if (savedLanguage && this.translations[savedLanguage]) {
            this.currentLanguage = savedLanguage;
        } else {
            // 默认使用英文
            this.currentLanguage = 'en';
        }

        // 绑定语言切换按钮事件
        this.bindLanguageSwitcher();
        
        // 应用当前语言
        this.applyLanguage(this.currentLanguage);
        
        // 延迟更新语言按钮状态，确保DOM已渲染
        setTimeout(() => {
            this.updateLanguageButtons();
        }, 0);
    }

    /**
     * 加载翻译数据
     */
    loadTranslations() {
        this.translations = {
            zh: {
                // 基本界面
                subtitle: '用AI记录生活，智能管理时间',
                tell_me_your_day: '告诉我你的一天',
                text_input: '文字输入',
                voice_input: '语音输入',
                input_placeholder: '在这里输入你的想法、今天发生的事情、计划等等...',
                text_input_hint: '分享你的想法、感受和经历。今天发生了什么？你的感受如何？有什么计划？',
                clear: '清空',
                generate_diary: '生成日记',
                
                // 导航菜单
                nav_home: '主页',
                nav_write_diary: '写日记',
                nav_my_diary: '我的日记',
                nav_diary: '我的日记',
                nav_todos: '待办事项',
                nav_settings: '设置',
                
                // 页面标题
                my_diary: '我的日记',
                my_todos: '待办事项',
                
                // 空状态消息
                no_diary_yet: '还没有写过日记',
                no_todos_detected: '没有检测到待办事项',
                no_todos: '没有待办事项',
                
                // 侧边栏统计
                quick_stats: '快速统计',
                total_diaries: '总日记数',
                pending_todos: '待办事项',
                completed_today: '今日完成',
                
                // 语音功能
                start_recording: '点击开始录音',
                stop_recording: '点击停止录音',
                ready_to_record: '准备录音...',
                recording: '录音中...',
                listening: '正在监听...请说话',
                recording_failed: '启动录音失败，请重试',
                recording_ended: '录音结束',
                processing_audio: '处理音频中...',
                
                // AI处理
                ai_analyzing: 'AI正在分析你的内容...',
                generating_diary: '正在生成日记...',
                extracting_todos: '正在提取待办事项...',
                
                // 结果展示
                generated_diary: '生成的日记',
                extracted_todos: '提取的待办事项',
                edit_diary: '编辑日记',
                edit_todos: '编辑待办事项',
                set_reminders: '设置提醒',
                discard: '放弃',
                confirm_save: '确认保存',
                
                // 日记信息
                date: '日期',
                weather: '天气',
                mood: '心情',
                content: '内容',
                reflection: '感悟',
                
                // 待办事项
                task: '任务',
                priority: '优先级',
                due_date: '截止日期',
                category: '分类',
                high_priority: '高',
                medium_priority: '中',
                low_priority: '低',
                
                // 分类
                work: '工作',
                study: '学习',
                life: '生活',
                health: '健康',
                social: '社交',
                
                // 提醒
                reminder_time: '提醒时间',
                set_reminder: '设置提醒',
                no_reminder: '不提醒',
                
                // 状态消息
                success_save: '保存成功！',
                error_occurred: '发生错误',
                loading: '加载中...',
                
                // 设置页面
                settings_title: '设置',
                reminder_settings: '提醒设置',
                enable_reminders: '启用提醒功能',
                default_reminder_offset: '默认提醒时间提前：',
                '5_minutes': '5分钟',
                '15_minutes': '15分钟',
                '30_minutes': '30分钟',
                '1_hour': '1小时',
                theme_settings: '主题设置',
                choose_theme: '选择主题：',
                theme_pink: '粉色系',
                theme_purple: '紫色系',
                theme_green: '绿色系',
                theme_warm: '暖色系',
                theme_cool: '冷色系',
                theme_gray: '灰色系',
                app_settings: '应用设置',
                test_reminder: '测试提醒',
                
                // 兼容性
                browser_compatibility: '浏览器兼容性问题',
                compatibility_issues: '检测到的问题',
                your_browser: '你的浏览器信息',
                browser: '浏览器',
                version: '版本',
                user_agent: '用户代理',
                solutions: '解决方案',
                update_browser: '更新浏览器（推荐）',
                use_compatible_version: '使用兼容版本',
                reload_page: '重新加载页面',
                enable_compatibility_mode: '启用兼容模式'
            },
            en: {
                // Basic Interface
                subtitle: 'Record life with AI, manage time intelligently',
                tell_me_your_day: 'Tell me about your day',
                text_input: 'Text Input',
                voice_input: 'Voice Input',
                input_placeholder: 'Type your thoughts, what happened today, plans, etc...',
                text_input_hint: 'Share your thoughts, feelings, and experiences. What happened today? How are you feeling? What are your plans?',
                clear: 'Clear',
                generate_diary: 'Generate Diary',
                
                // Navigation Menu
                nav_home: 'Home',
                nav_write_diary: 'Write Diary',
                nav_my_diary: 'My Diary',
                nav_diary: 'My Diary',
                nav_todos: 'To-Do List',
                nav_settings: 'Settings',
                
                // Page Titles
                my_diary: 'My Diary',
                my_todos: 'To-Do List',
                
                // Empty State Messages
                no_diary_yet: 'No diary entries yet',
                no_todos_detected: 'No todos detected',
                no_todos: 'No todos',
                
                // Sidebar Stats
                quick_stats: 'Quick Stats',
                total_diaries: 'Total Diaries',
                pending_todos: 'Pending Todos',
                completed_today: 'Completed Today',
                
                // Voice Features
                start_recording: 'Click to start recording',
                stop_recording: 'Click to stop recording',
                ready_to_record: 'Ready to record...',
                recording: 'Recording...',
                listening: 'Listening... please speak',
                recording_failed: 'Recording failed, please try again',
                recording_ended: 'Recording ended',
                processing_audio: 'Processing audio...',
                
                // AI Processing
                ai_analyzing: 'AI is analyzing your content...',
                generating_diary: 'Generating diary...',
                extracting_todos: 'Extracting todos...',
                
                // Results Display
                generated_diary: 'Generated Diary',
                extracted_todos: 'Extracted Todos',
                edit_diary: 'Edit Diary',
                edit_todos: 'Edit Todos',
                set_reminders: 'Set Reminders',
                discard: 'Discard',
                confirm_save: 'Confirm & Save',
                
                // Diary Information
                date: 'Date',
                weather: 'Weather',
                mood: 'Mood',
                content: 'Content',
                reflection: 'Reflection',
                
                // Todos
                task: 'Task',
                priority: 'Priority',
                due_date: 'Due Date',
                category: 'Category',
                high_priority: 'High',
                medium_priority: 'Medium',
                low_priority: 'Low',
                
                // Categories
                work: 'Work',
                study: 'Study',
                life: 'Life',
                health: 'Health',
                social: 'Social',
                
                // Reminders
                reminder_time: 'Reminder Time',
                set_reminder: 'Set Reminder',
                no_reminder: 'No Reminder',
                
                // Status messages
                success_save: 'Successfully saved!',
                error_occurred: 'An error occurred',
                loading: 'Loading...',
                
                // Settings page
                settings_title: 'Settings',
                reminder_settings: 'Reminder Settings',
                enable_reminders: 'Enable reminder notifications',
                default_reminder_offset: 'Default reminder time before event:',
                '5_minutes': '5 minutes',
                '15_minutes': '15 minutes',
                '30_minutes': '30 minutes',
                '1_hour': '1 hour',
                theme_settings: 'Theme Settings',
                choose_theme: 'Choose theme:',
                theme_pink: 'Pink Scheme',
                theme_purple: 'Purple Scheme',
                theme_green: 'Green Scheme',
                theme_warm: 'Warm Scheme',
                theme_cool: 'Cool Scheme',
                theme_gray: 'Grey Scheme',
                app_settings: 'Application Settings',
                test_reminder: 'Test Reminder',
                
                // Compatibility
                browser_compatibility: 'Browser compatibility issues',
                compatibility_issues: 'Detected Issues',
                your_browser: 'Your Browser Information',
                browser: 'Browser',
                version: 'Version',
                user_agent: 'User Agent',
                solutions: 'Solutions',
                update_browser: 'Update Browser (Recommended)',
                use_compatible_version: 'Use Compatible Version',
                reload_page: 'Reload Page',
                enable_compatibility_mode: 'Enable Compatibility Mode'
            }
        };
    }

    /**
     * 绑定语言切换按钮事件
     */
    bindLanguageSwitcher() {
        const langToggleBtn = document.getElementById('langToggleBtn');
        if (langToggleBtn) {
            langToggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // 切换到另一种语言
                const newLang = this.currentLanguage === 'en' ? 'zh' : 'en';
                this.switchLanguage(newLang);
            });
        }
    }

    /**
     * 切换语言
     * @param {string} language - 语言代码 (zh/en)
     */
    switchLanguage(language) {
        if (!this.translations[language]) {
            console.warn(`Language ${language} not supported`);
            return;
        }

        this.currentLanguage = language;
        localStorage.setItem('dearDiary_language', language);
        
        // 更新语言按钮状态
        this.updateLanguageButtons();
        
        // 应用新语言
        this.applyLanguage(language);
        
        // 更新页面语言属性
        document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en-AU';
        
        // 触发语言切换事件
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language, translations: this.translations[language] }
        }));
    }

    /**
     * 应用语言翻译
     * @param {string} language - 语言代码
     */
    applyLanguage(language) {
        const translations = this.translations[language];
        
        // 翻译带有 data-i18n 属性的元素
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[key]) {
                element.textContent = translations[key];
            }
        });

        // 翻译 placeholder 属性
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (translations[key]) {
                element.placeholder = translations[key];
            }
        });

        // 翻译 title 属性
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            if (translations[key]) {
                element.title = translations[key];
            }
        });
    }

    /**
     * 更新语言按钮状态
     */
    updateLanguageButtons() {
        const langToggleBtn = document.getElementById('langToggleBtn');
        if (langToggleBtn) {
            const flagSpan = langToggleBtn.querySelector('.flag');
            const textSpan = langToggleBtn.querySelector('.lang-text');
            
            if (this.currentLanguage === 'zh') {
                // 当前是中文，显示英文切换选项
                flagSpan.textContent = '🇦🇺';
                textSpan.textContent = 'EN';
                langToggleBtn.title = 'Switch to English';
            } else {
                // 当前是英文，显示中文切换选项
                flagSpan.textContent = '🇨🇳';
                textSpan.textContent = '中文';
                langToggleBtn.title = '切换到中文';
            }
        }
    }

    /**
     * 获取当前语言的翻译
     * @param {string} key - 翻译键
     * @param {string} defaultText - 默认文本
     * @returns {string} 翻译后的文本
     */
    t(key, defaultText = '') {
        const translations = this.translations[this.currentLanguage];
        return translations[key] || defaultText || key;
    }

    /**
     * 获取当前语言
     * @returns {string} 当前语言代码
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * 动态添加翻译文本
     * @param {string} key - 翻译键
     * @param {string} zhText - 中文文本
     * @param {string} enText - 英文文本
     */
    addTranslation(key, zhText, enText) {
        this.translations.zh[key] = zhText;
        this.translations.en[key] = enText;
    }

    /**
     * 翻译动态内容
     * @param {HTMLElement} element - 要翻译的元素
     * @param {string} key - 翻译键
     */
    translateElement(element, key) {
        const translation = this.t(key);
        if (translation && translation !== key) {
            element.textContent = translation;
        }
    }

    /**
     * 批量翻译对象
     * @param {Object} obj - 包含翻译键的对象
     * @returns {Object} 翻译后的对象
     */
    translateObject(obj) {
        const translated = {};
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'string' && this.translations[this.currentLanguage][value]) {
                translated[key] = this.translations[this.currentLanguage][value];
            } else {
                translated[key] = value;
            }
        }
        return translated;
    }
}

// 创建全局i18n实例
window.i18n = new I18nManager();

// 导出类以供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18nManager;
}