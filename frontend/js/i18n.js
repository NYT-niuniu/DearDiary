/**
 * Internationalization (i18n) Manager
 * Handles multi-language support and language switching
 */
class I18nManager {
    constructor() {
        this.currentLanguage = 'en';
        this.translations = {};
        this.loadTranslations();
        this.init();
    }

    /**
     * Initialize i18n manager
     */
    init() {
        const savedLanguage = localStorage.getItem('dearDiary_language');
        if (savedLanguage && this.translations[savedLanguage]) {
            this.currentLanguage = savedLanguage;
        } else {
            this.currentLanguage = 'en';
        }

        this.bindLanguageSwitcher();
        this.applyLanguage(this.currentLanguage);
        
        setTimeout(() => {
            this.updateLanguageButtons();
        }, 0);
    }

    /**
     * Load translation data
     */
    loadTranslations() {
        this.translations = {
            zh: {
                subtitle: '用AI记录生活，智能管理时间',
                tell_me_your_day: '告诉我你的一天',
                text_input: '文字输入',
                voice_input: '语音输入',
                input_placeholder: '在这里输入你的想法、今天发生的事情、计划等等...',
                text_input_hint: '分享你的想法、感受和经历。今天发生了什么？你的感受如何？有什么计划？',
                clear: '清空',
                generate_diary: '生成日记',
                nav_home: '主页',
                nav_write_diary: '写日记',
                nav_my_diary: '我的日记',
                nav_diary: '我的日记',
                nav_todos: '待办事项',
                nav_settings: '设置',
                my_diary: '我的日记',
                my_todos: '待办事项',
                no_diary_yet: '还没有写过日记',
                no_todos_detected: '没有检测到待办事项',
                no_todos: '没有待办事项',
                quick_stats: '快速统计',
                total_diaries: '总日记数',
                pending_todos: '待办事项',
                completed_today: '今日完成',
                start_recording: '点击开始录音',
                stop_recording: '点击停止录音',
                ready_to_record: '准备录音...',
                recording: '录音中...',
                listening: '正在监听...请说话',
                recording_failed: '启动录音失败，请重试',
                recording_ended: '录音结束',
                processing_audio: '处理音频中...',
                transcribed_placeholder: '您的语音转录文本将出现在这里，可以编辑...',
                ai_analyzing: 'AI正在分析你的内容...',
                generating_diary: '正在生成日记...',
                extracting_todos: '正在提取待办事项...',
                generated_diary: '生成的日记',
                extracted_todos: '提取的待办事项',
                edit_diary: '编辑日记',
                edit_diary_placeholder: '编辑您的日记内容...',
                edit_todos: '编辑待办事项',
                save: '保存',
                cancel: '取消',
                set_reminders: '设置提醒',
                discard: '放弃',
                confirm_save: '确认保存',
                date: '日期',
                weather: '天气',
                mood: '心情',
                content: '内容',
                reflection: '感悟',
                today_record: '今日记录',
                today_reflection: '今日感悟',
                diary_content: '日记内容',
                created_time: '创建时间',
                close: '关闭',
                edit: '编辑',
                loading_diary: '正在加载日记详情...',
                task: '任务',
                priority: '优先级',
                due_date: '截止日期',
                category: '分类',
                high_priority: '高',
                medium_priority: '中',
                low_priority: '低',
                work: '工作',
                study: '学习',
                life: '生活',
                health: '健康',
                social: '社交',
                reminder_time: '提醒时间',
                set_reminder: '设置提醒',
                no_reminder: '不提醒',
                enable_reminder: '启用提醒',
                success_save: '保存成功！',
                error_occurred: '发生错误',
                loading: '加载中...',
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
                test_reminder_sent: '测试提醒已发送！',
                test_reminder_failed: '发送测试提醒失败',
                test_notification: '测试通知系统：'
            },
            en: {
                subtitle: 'Record life with AI, manage time intelligently',
                tell_me_your_day: 'Tell me about your day',
                text_input: 'Text Input',
                voice_input: 'Voice Input',
                input_placeholder: 'Type your thoughts, what happened today, plans, etc...',
                text_input_hint: 'Share your thoughts, feelings, and experiences. What happened today? How are you feeling? What are your plans?',
                clear: 'Clear',
                generate_diary: 'Generate Diary',
                nav_home: 'Home',
                nav_write_diary: 'Write Diary',
                nav_my_diary: 'My Diary',
                nav_diary: 'My Diary',
                nav_todos: 'To-Do List',
                nav_settings: 'Settings',
                my_diary: 'My Diary',
                my_todos: 'To-Do List',
                no_diary_yet: 'No diary entries yet',
                no_todos_detected: 'No todos detected',
                no_todos: 'No todos',
                quick_stats: 'Quick Stats',
                total_diaries: 'Total Diaries',
                pending_todos: 'Pending Todos',
                completed_today: 'Completed Today',
                start_recording: 'Click to start recording',
                stop_recording: 'Click to stop recording',
                ready_to_record: 'Ready to record...',
                recording: 'Recording...',
                listening: 'Listening... please speak',
                recording_failed: 'Recording failed, please try again',
                recording_ended: 'Recording ended',
                processing_audio: 'Processing audio...',
                transcribed_placeholder: 'Your transcribed text will appear here and can be edited...',
                ai_analyzing: 'AI is analyzing your content...',
                generating_diary: 'Generating diary...',
                extracting_todos: 'Extracting todos...',
                generated_diary: 'Generated Diary',
                extracted_todos: 'Extracted Todos',
                edit_diary: 'Edit Diary',
                edit_diary_placeholder: 'Edit your diary content...',
                edit_todos: 'Edit Todos',
                save: 'Save',
                cancel: 'Cancel',
                set_reminders: 'Set Reminders',
                discard: 'Discard',
                confirm_save: 'Confirm & Save',
                date: 'Date',
                weather: 'Weather',
                mood: 'Mood',
                content: 'Content',
                reflection: 'Reflection',
                today_record: 'Today\'s Record',
                today_reflection: 'Today\'s Reflection',
                diary_content: 'Diary Content',
                created_time: 'Created Time',
                close: 'Close',
                edit: 'Edit',
                loading_diary: 'Loading diary details...',
                task: 'Task',
                priority: 'Priority',
                due_date: 'Due Date',
                category: 'Category',
                high_priority: 'High',
                medium_priority: 'Medium',
                low_priority: 'Low',
                work: 'Work',
                study: 'Study',
                life: 'Life',
                health: 'Health',
                social: 'Social',
                reminder_time: 'Reminder Time',
                set_reminder: 'Set Reminder',
                no_reminder: 'No Reminder',
                enable_reminder: 'Enable Reminder',
                success_save: 'Successfully saved!',
                error_occurred: 'An error occurred',
                loading: 'Loading...',
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
                test_reminder_sent: 'Test reminder sent successfully!',
                test_reminder_failed: 'Failed to send test reminder',
                test_notification: 'Test notification system:'
            }
        };
    }

    bindLanguageSwitcher() {
        const langToggleBtn = document.getElementById('langToggleBtn');
        if (langToggleBtn) {
            langToggleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const newLang = this.currentLanguage === 'en' ? 'zh' : 'en';
                this.switchLanguage(newLang);
            });
        }
    }

    /**
     * Switch language
     * @param {string} language - Language code (zh/en)
     */
    switchLanguage(language) {
        if (!this.translations[language]) {
            console.warn(`Language ${language} not supported`);
            return;
        }

        this.currentLanguage = language;
        localStorage.setItem('dearDiary_language', language);
        
        this.updateLanguageButtons();
        this.applyLanguage(language);
        
        document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en-AU';
        
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language, translations: this.translations[language] }
        }));
    }

    /**
     * Apply language translations
     * @param {string} language - Language code
     */
    applyLanguage(language) {
        const translations = this.translations[language];
        
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            if (translations[key]) {
                element.textContent = translations[key];
            }
        });

        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            if (translations[key]) {
                element.placeholder = translations[key];
            }
        });

        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            if (translations[key]) {
                element.title = translations[key];
            }
        });
    }

    updateLanguageButtons() {
        const langToggleBtn = document.getElementById('langToggleBtn');
        if (langToggleBtn) {
            const flagSpan = langToggleBtn.querySelector('.flag');
            const textSpan = langToggleBtn.querySelector('.lang-text');
            
            if (this.currentLanguage === 'zh') {
                flagSpan.textContent = '🇦🇺';
                textSpan.textContent = 'EN';
                langToggleBtn.title = 'Switch to English';
            } else {
                flagSpan.textContent = '🇨🇳';
                textSpan.textContent = '中文';
                langToggleBtn.title = '切换到中文';
            }
        }
    }

    /**
     * Get translation for current language
     * @param {string} key - Translation key
     * @param {string} defaultText - Default text
     * @returns {string} Translated text
     */
    t(key, defaultText = '') {
        const translations = this.translations[this.currentLanguage];
        return translations[key] || defaultText || key;
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Add translation dynamically
     * @param {string} key - Translation key
     * @param {string} zhText - Chinese text
     * @param {string} enText - English text
     */
    addTranslation(key, zhText, enText) {
        this.translations.zh[key] = zhText;
        this.translations.en[key] = enText;
    }

    translateElement(element, key) {
        const translation = this.t(key);
        if (translation && translation !== key) {
            element.textContent = translation;
        }
    }

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

window.i18n = new I18nManager();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = I18nManager;
}