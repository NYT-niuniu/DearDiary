/**
 * UI控制器
 * 负责管理用户界面的显示和交互
 */
class UIController {
    constructor() {
        this.elements = {};
        this.currentData = {
            diary: null,
            todos: null
        };
        this.currentPage = 'home';
        
        this.init();
    }
    
    /**
     * 初始化UI控制器
     */
    init() {
        this.initElements();
        this.bindEvents();
        this.setupNavigation();
        this.switchInputMethod('voice'); // 默认语音输入
        this.loadSettings(); // 加载设置
    }
    
    /**
     * 初始化DOM元素引用
     */
    initElements() {
        this.elements = {
            // 导航相关
            hamburgerBtn: document.getElementById('hamburgerBtn'),
            mainNav: document.getElementById('mainNav'),
            
            // 输入相关
            textInputBtn: document.getElementById('textInputBtn'),
            voiceInputBtn: document.getElementById('voiceInputBtn'),
            textInputArea: document.getElementById('textInputArea'),
            voiceInputArea: document.getElementById('voiceInputArea'),
            userInput: document.getElementById('userInput'),
            clearBtn: document.getElementById('clearBtn'),
            processBtn: document.getElementById('processBtn'),
            clearVoiceBtn: document.getElementById('clearVoiceBtn'),
            processVoiceBtn: document.getElementById('processVoiceBtn'),
            
            // 结果显示
            resultsSection: document.getElementById('resultsSection'),
            diaryContent: document.getElementById('diaryContent'),
            todosContent: document.getElementById('todosContent'),
            
            // 操作按钮
            editDiaryBtn: document.getElementById('editDiaryBtn'),
            editTodosBtn: document.getElementById('editTodosBtn'),
            setRemindersBtn: document.getElementById('setRemindersBtn'),
            discardBtn: document.getElementById('discardBtn'),
            confirmBtn: document.getElementById('confirmBtn'),
            
            // 导航
            navItems: document.querySelectorAll('.nav-item'),
            mainContent: document.querySelector('.main-content'),
            pages: {
                myDiary: document.getElementById('myDiaryPage'),
                todos: document.getElementById('todosPage'),
                settings: document.getElementById('settingsPage')
            },
            
            // 列表
            diaryList: document.getElementById('diaryList'),
            todosList: document.getElementById('todosList'),
            
            // 模态框
            modalOverlay: document.getElementById('modalOverlay'),
            reminderModal: document.getElementById('reminderModal'),
            reminderForm: document.getElementById('reminderForm'),
            closeModalBtn: document.getElementById('closeModalBtn'),
            cancelReminderBtn: document.getElementById('cancelReminderBtn'),
            saveRemindersBtn: document.getElementById('saveRemindersBtn'),
            
            // 设置
            enableReminders: document.getElementById('enableReminders'),
            defaultReminderOffset: document.getElementById('defaultReminderOffset'),
            testReminderBtn: document.getElementById('testReminderBtn')
        };
    }
    
    /**
     * 绑定事件监听器
     */
    bindEvents() {
        // 汉堡菜单切换
        if (this.elements.hamburgerBtn && this.elements.mainNav) {
            this.elements.hamburgerBtn.addEventListener('click', () => this.toggleMobileMenu());
            
            // 点击导航链接后关闭菜单
            const navItems = this.elements.mainNav.querySelectorAll('.nav-item');
            navItems.forEach(item => {
                item.addEventListener('click', () => this.closeMobileMenu());
            });
        }
        
        // 点击页面其他地方关闭菜单
        document.addEventListener('click', (e) => {
            if (this.elements.hamburgerBtn && this.elements.mainNav) {
                if (!this.elements.hamburgerBtn.contains(e.target) && 
                    !this.elements.mainNav.contains(e.target)) {
                    this.closeMobileMenu();
                }
            }
        });
        
        // 语言切换监听
        window.addEventListener('languageChanged', (e) => {
            this.onLanguageChanged(e.detail);
        });
        
        // 输入方法切换
        if (this.elements.textInputBtn) {
            this.elements.textInputBtn.addEventListener('click', () => this.switchInputMethod('text'));
        }
        if (this.elements.voiceInputBtn) {
            this.elements.voiceInputBtn.addEventListener('click', () => this.switchInputMethod('voice'));
        }
        
        // 操作按钮
        if (this.elements.clearBtn) {
            this.elements.clearBtn.addEventListener('click', () => this.clearInput());
        }
        if (this.elements.processBtn) {
            this.elements.processBtn.addEventListener('click', () => this.processInput());
        }
        if (this.elements.clearVoiceBtn) {
            this.elements.clearVoiceBtn.addEventListener('click', () => this.clearVoiceInput());
        }
        if (this.elements.processVoiceBtn) {
            this.elements.processVoiceBtn.addEventListener('click', () => this.processVoiceInput());
        }
        
        // 结果操作
        if (this.elements.editDiaryBtn) {
            this.elements.editDiaryBtn.addEventListener('click', () => this.editDiary());
        }
        if (this.elements.editTodosBtn) {
            this.elements.editTodosBtn.addEventListener('click', () => this.editTodos());
        }
        if (this.elements.setRemindersBtn) {
            this.elements.setRemindersBtn.addEventListener('click', () => this.setReminders());
        }
        if (this.elements.discardBtn) {
            this.elements.discardBtn.addEventListener('click', () => this.discardResults());
        }
        if (this.elements.confirmBtn) {
            this.elements.confirmBtn.addEventListener('click', () => this.confirmResults());
        }
        
        // 模态框
        if (this.elements.closeModalBtn) {
            this.elements.closeModalBtn.addEventListener('click', () => this.closeModal());
        }
        if (this.elements.cancelReminderBtn) {
            this.elements.cancelReminderBtn.addEventListener('click', () => this.closeModal());
        }
        if (this.elements.saveRemindersBtn) {
            this.elements.saveRemindersBtn.addEventListener('click', () => this.saveReminders());
        }
        if (this.elements.modalOverlay) {
            this.elements.modalOverlay.addEventListener('click', (e) => {
                if (e.target === this.elements.modalOverlay) {
                    this.closeModal();
                }
            });
        }
        
        // 设置
        if (this.elements.testReminderBtn) {
            this.elements.testReminderBtn.addEventListener('click', () => this.sendTestReminder());
        }
        
        // 提醒设置事件监听
        if (this.elements.enableReminders) {
            this.elements.enableReminders.addEventListener('change', () => this.saveReminderSettings());
        }
        if (this.elements.defaultReminderOffset) {
            this.elements.defaultReminderOffset.addEventListener('change', () => this.saveReminderSettings());
        }
        
        // 输入框事件
        if (this.elements.userInput) {
            this.elements.userInput.addEventListener('input', debounce(() => {
                this.updateProcessButton();
            }, 300));
        }
    }
    
    /**
     * 设置导航
     */
    setupNavigation() {
        // 导航项点击事件
        this.elements.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.switchPage(page);
            });
        });
        
        // Logo点击事件
        const logoLink = document.querySelector('.logo-link');
        if (logoLink) {
            logoLink.addEventListener('click', (e) => {
                e.preventDefault();
                const page = logoLink.dataset.page || 'diary';
                this.switchPage(page);
            });
        }
    }
    
    /**
     * 切换移动端菜单显示/隐藏
     */
    toggleMobileMenu() {
        if (this.elements.hamburgerBtn && this.elements.mainNav) {
            this.elements.hamburgerBtn.classList.toggle('active');
            this.elements.mainNav.classList.toggle('active');
        }
    }
    
    /**
     * 关闭移动端菜单
     */
    closeMobileMenu() {
        if (this.elements.hamburgerBtn && this.elements.mainNav) {
            this.elements.hamburgerBtn.classList.remove('active');
            this.elements.mainNav.classList.remove('active');
        }
    }
    
    /**
     * 切换输入方法
     */
    switchInputMethod(method) {
        // 更新按钮状态
        this.elements.textInputBtn.classList.toggle('active', method === 'text');
        this.elements.voiceInputBtn.classList.toggle('active', method === 'voice');
        
        // 切换输入区域
        if (method === 'text') {
            DOM.show(this.elements.textInputArea);
            DOM.hide(this.elements.voiceInputArea);
            this.elements.userInput.focus();
            this.updateProcessButton();
            
            // 重新应用i18n到文本框placeholder
            if (window.i18n) {
                window.i18n.updateContent();
            }
        } else {
            DOM.hide(this.elements.textInputArea);
            DOM.show(this.elements.voiceInputArea);
            this.updateVoiceProcessButton();
        }
    }
    
    /**
     * 清空输入
     */
    clearInput() {
        if (this.elements.userInput) {
            this.elements.userInput.value = '';
            this.updateProcessButton();
        }
        
        // 清空语音转录结果
        if (window.speechManager) {
            const transcribedText = document.getElementById('transcribedText');
            if (transcribedText) {
                transcribedText.textContent = '';
            }
        }
    }
    
    /**
     * 清空语音输入
     */
    clearVoiceInput() {
        // 清空语音转录结果
        const transcribedText = document.getElementById('transcribedText');
        if (transcribedText) {
            transcribedText.textContent = '';
        }
        
        // 重置语音状态
        if (window.speechManager) {
            window.speechManager.reset();
        }
        
        this.updateVoiceProcessButton();
    }
    
    /**
     * 处理语音输入
     */
    async processVoiceInput() {
        const transcribedText = document.getElementById('transcribedText');
        const input = transcribedText?.textContent?.trim();
        
        if (!input) {
            Notification.warning('请先录音或输入一些内容');
            return;
        }
        
        try {
            DOM.show(this.elements.loadingOverlay);
            
            const response = await api.generateDiary(input);
            if (response.success) {
                this.displayResults(response.data);
            } else {
                Notification.error(response.message || 'AI分析失败');
            }
        } catch (error) {
            console.error('处理语音输入失败:', error);
            Notification.error('处理失败，请重试');
        } finally {
            DOM.hide(this.elements.loadingOverlay);
        }
    }
    
    /**
     * 更新语音处理按钮状态
     */
    updateVoiceProcessButton() {
        if (this.elements.processVoiceBtn) {
            const transcribedText = document.getElementById('transcribedText');
            const hasInput = transcribedText && !isEmpty(transcribedText.textContent);
            this.elements.processVoiceBtn.disabled = !hasInput;
        }
    }
    
    /**
     * 更新处理按钮状态
     */
    updateProcessButton() {
        if (this.elements.processBtn && this.elements.userInput) {
            const hasInput = !isEmpty(this.elements.userInput.value);
            this.elements.processBtn.disabled = !hasInput;
        }
    }
    
    /**
     * 处理用户输入
     */
    async processInput() {
        const input = this.elements.userInput?.value?.trim();
        if (!input) {
            Notification.warning('请输入一些内容');
            return;
        }
        
        try {
            const result = await api.analyzeInput(input);
            
            if (result.success) {
                this.displayResults(result.data);
            } else {
                Notification.error('处理失败，请重试');
            }
        } catch (error) {
            console.error('处理输入失败:', error);
        }
    }
    
    /**
     * 显示分析结果
     */
    displayResults(data) {
        this.currentData = data;
        
        // 显示日记内容
        if (data.diary) {
            this.renderDiary(data.diary);
        }
        
        // 显示待办事项
        if (data.todos && data.todos.todos) {
            this.renderTodos(data.todos.todos);
        }
        
        // 显示结果区域
        DOM.show(this.elements.resultsSection);
        
        // 滚动到结果区域
        this.elements.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    /**
     * 渲染日记内容
     */
    renderDiary(diary) {
        if (!this.elements.diaryContent) return;
        
        const html = `
            <div class=\"diary-meta\">
                <div class=\"diary-meta-item\">
                    <span class=\"diary-meta-label\">日期</span>
                    <div class=\"diary-meta-value\">${diary.date}</div>
                </div>
                <div class=\"diary-meta-item\">
                    <span class=\"diary-meta-label\">天气</span>
                    <div class=\"diary-meta-value\">${diary.weather}</div>
                </div>
                <div class=\"diary-meta-item\">
                    <span class=\"diary-meta-label\">心情</span>
                    <div class=\"diary-meta-value\">
                        <i class=\"${getMoodIcon(diary.mood)}\"></i>
                        ${diary.mood}
                    </div>
                </div>
            </div>
            
            <div class=\"diary-text\">
                <h4>今日记录</h4>
                <p>${diary.content}</p>
                
                <h4>今日感悟</h4>
                <p>${diary.reflection}</p>
            </div>
        `;
        
        this.elements.diaryContent.innerHTML = html;
    }
    
    /**
     * 渲染待办事项
     */
    renderTodos(todos) {
        if (!this.elements.todosContent) return;
        
        if (!todos || todos.length === 0) {
            this.elements.todosContent.innerHTML = '<p class="text-center" data-i18n="no_todos_detected">No todos detected</p>';
            // 确保国际化系统更新这个新添加的元素
            if (window.i18n) {
                window.i18n.updateContent();
            }
            return;
        }
        
        const html = todos.map(todo => `
            <div class=\"todo-item\">
                <div class=\"todo-header\">
                    <div class=\"todo-title\">${todo.title}</div>
                    <span class=\"todo-priority ${getPriorityClass(todo.priority)}\">${todo.priority}</span>
                </div>
                ${todo.description ? `<div class=\"todo-description\">${todo.description}</div>` : ''}
                <div class=\"todo-meta\">
                    ${todo.category ? `<span><i class=\"fas fa-tag\"></i> ${todo.category}</span>` : ''}
                    ${todo.due_time ? `<span><i class=\"fas fa-calendar\"></i> ${formatDate(todo.due_time, 'datetime')}</span>` : ''}
                    ${todo.reminder_time ? `<span><i class=\"fas fa-bell\"></i> ${getRelativeTime(todo.reminder_time)}</span>` : ''}
                </div>
            </div>
        `).join('');
        
        this.elements.todosContent.innerHTML = html;
    }
    
    /**
     * 编辑日记
     */
    editDiary() {
        // 这里可以实现日记编辑功能
        Notification.info('日记编辑功能开发中...');
    }
    
    /**
     * 编辑待办事项
     */
    editTodos() {
        // 这里可以实现待办事项编辑功能
        Notification.info('待办事项编辑功能开发中...');
    }
    
    /**
     * 设置提醒
     */
    setReminders() {
        if (!this.currentData.todos || !this.currentData.todos.todos.length) {
            Notification.warning('没有待办事项需要设置提醒');
            return;
        }
        
        this.renderReminderModal();
        DOM.show(this.elements.modalOverlay);
    }
    
    /**
     * 渲染提醒设置模态框
     */
    renderReminderModal() {
        if (!this.elements.reminderForm) return;
        
        const todos = this.currentData.todos.todos;
        const html = todos.map((todo, index) => `
            <div class=\"reminder-item\">
                <h4>${todo.title}</h4>
                ${todo.description ? `<p>${todo.description}</p>` : ''}
                
                <div class=\"reminder-controls\">
                    <label>
                        <input type=\"checkbox\" class=\"todo-reminder-enabled\" data-index=\"${index}\" checked>
                        启用提醒
                    </label>
                    
                    <div class=\"reminder-time-inputs\">
                        <label>
                            提醒时间:
                            <input type=\"datetime-local\" class=\"reminder-time\" data-index=\"${index}\"
                                   value=\"${this.getDefaultReminderTime(todo)}\">
                        </label>
                    </div>
                </div>
            </div>
        `).join('');
        
        this.elements.reminderForm.innerHTML = html;
    }
    
    /**
     * 获取默认提醒时间
     */
    getDefaultReminderTime(todo) {
        let reminderTime;
        
        if (todo.due_time) {
            // 如果有截止时间，设置为截止时间前15分钟
            const dueDate = new Date(todo.due_time);
            reminderTime = new Date(dueDate.getTime() - 15 * 60 * 1000);
        } else {
            // 如果没有截止时间，设置为明天同一时间
            reminderTime = new Date();
            reminderTime.setDate(reminderTime.getDate() + 1);
        }
        
        // 格式化为datetime-local输入框需要的格式
        return reminderTime.toISOString().slice(0, 16);
    }
    
    /**
     * 保存提醒设置
     */
    async saveReminders() {
        const todos = this.currentData.todos.todos;
        const reminderItems = this.elements.reminderForm.querySelectorAll('.reminder-item');
        
        reminderItems.forEach((item, index) => {
            const enabled = item.querySelector('.todo-reminder-enabled').checked;
            const timeInput = item.querySelector('.reminder-time');
            
            if (enabled && timeInput.value) {
                todos[index].reminder_time = new Date(timeInput.value).toISOString();
            } else {
                todos[index].reminder_time = null;
            }
        });
        
        // 更新显示
        this.renderTodos(todos);
        this.closeModal();
        
        Notification.success('提醒时间设置成功！');
    }
    
    /**
     * 关闭模态框
     */
    closeModal() {
        DOM.hide(this.elements.modalOverlay);
    }
    
    /**
     * 放弃结果
     */
    discardResults() {
        DOM.hide(this.elements.resultsSection);
        this.currentData = { diary: null, todos: null };
        this.clearInput();
    }
    
    /**
     * 确认保存结果
     */
    async confirmResults() {
        if (!this.currentData.diary && (!this.currentData.todos || !this.currentData.todos.todos.length)) {
            Notification.warning('没有数据可以保存');
            return;
        }
        
        try {
            const result = await api.confirmData(this.currentData.diary, this.currentData.todos, true);
            
            if (result.success) {
                Notification.success('数据保存成功！');
                this.discardResults();
            }
        } catch (error) {
            console.error('保存数据失败:', error);
        }
    }
    
    /**
     * 切换页面
     */
    switchPage(page) {
        // 更新导航状态
        this.elements.navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });
        
        // 处理主页显示
        if (page === 'home' || page === undefined) {
            // 显示主内容，隐藏所有页面
            if (this.elements.mainContent) {
                DOM.show(this.elements.mainContent);
            }
            Object.values(this.elements.pages).forEach(pageElement => {
                if (pageElement) {
                    DOM.hide(pageElement);
                }
            });
            // 清除所有导航项的active状态
            this.elements.navItems.forEach(item => {
                item.classList.remove('active');
            });
        } else {
            // 隐藏主内容，显示对应页面
            if (this.elements.mainContent) {
                DOM.hide(this.elements.mainContent);
            }
            Object.values(this.elements.pages).forEach(pageElement => {
                if (pageElement) {
                    DOM.hide(pageElement);
                }
            });
            
            // 显示当前页面
            if (this.elements.pages[page]) {
                DOM.show(this.elements.pages[page]);
            }
        }
        
        this.currentPage = page || 'home';
        
        // 加载页面数据
        this.loadPageData(page);
    }
    
    /**
     * 加载页面数据
     */
    async loadPageData(page) {
        switch (page) {
            case 'myDiary':
                await this.loadDiaryList();
                break;
            case 'todos':
                await this.loadTodosList();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }
    
    /**
     * 加载日记列表
     */
    async loadDiaryList() {
        if (!this.elements.diaryList) return;
        
        try {
            const result = await api.getDiaries(20, 0);
            if (result.success && result.data) {
                this.renderDiaryList(result.data);
            }
        } catch (error) {
            console.error('加载日记列表失败:', error);
        }
    }
    
    /**
     * 渲染日记列表
     */
    renderDiaryList(diaries) {
        if (!diaries || diaries.length === 0) {
            this.elements.diaryList.innerHTML = '<p class="text-center" data-i18n="no_diary_yet">No diary entries yet</p>';
            // 确保国际化系统更新这个新添加的元素
            if (window.i18n) {
                window.i18n.updateContent();
            }
            return;
        }
        
        const html = diaries.map(diary => `
            <div class=\"diary-item\">
                <div class=\"diary-item-header\">
                    <h3>${diary.date}</h3>
                    <div class=\"diary-item-mood\">
                        <i class=\"${getMoodIcon(diary.mood)}\"></i>
                        ${diary.mood}
                    </div>
                </div>
                <div class=\"diary-item-content\">
                    ${truncateText(diary.content, 150)}
                </div>
                <div class=\"diary-item-meta\">
                    <span><i class=\"fas fa-cloud\"></i> ${diary.weather}</span>
                    <span><i class=\"fas fa-clock\"></i> ${formatDate(diary.created_at, 'datetime')}</span>
                </div>
            </div>
        `).join('');
        
        this.elements.diaryList.innerHTML = html;
    }
    
    /**
     * 加载待办事项列表
     */
    async loadTodosList() {
        if (!this.elements.todosList) return;
        
        try {
            const result = await api.getTodos(false, 50);
            if (result.success && result.data) {
                this.renderTodosList(result.data);
            }
        } catch (error) {
            console.error('加载待办事项列表失败:', error);
        }
    }
    
    /**
     * 渲染待办事项列表
     */
    renderTodosList(todos) {
        if (!todos || todos.length === 0) {
            this.elements.todosList.innerHTML = '<p class="text-center" data-i18n="no_todos">No todos</p>';
            // 确保国际化系统更新这个新添加的元素
            if (window.i18n) {
                window.i18n.updateContent();
            }
            return;
        }
        
        const html = todos.map(todo => `
            <div class=\"todo-list-item\">
                <div class=\"todo-list-header\">
                    <h4>${todo.title}</h4>
                    <div class=\"todo-list-actions\">
                        <span class=\"todo-priority ${getPriorityClass(todo.priority)}\">${todo.priority}</span>
                        <button class=\"btn btn-small btn-success\" onclick=\"ui.completeTodo(${todo.id})\">
                            <i class=\"fas fa-check\"></i>
                        </button>
                    </div>
                </div>
                ${todo.description ? `<p>${todo.description}</p>` : ''}
                <div class=\"todo-list-meta\">
                    ${todo.category ? `<span><i class=\"fas fa-tag\"></i> ${todo.category}</span>` : ''}
                    ${todo.due_time ? `<span><i class=\"fas fa-calendar\"></i> ${formatDate(todo.due_time, 'datetime')}</span>` : ''}
                    ${todo.reminder_time ? `<span><i class=\"fas fa-bell\"></i> ${getRelativeTime(todo.reminder_time)}</span>` : ''}
                </div>
            </div>
        `).join('');
        
        this.elements.todosList.innerHTML = html;
    }
    
    /**
     * 完成待办事项
     */
    async completeTodo(id) {
        try {
            await api.completeTodo(id);
            this.loadTodosList(); // 重新加载列表
        } catch (error) {
            console.error('完成待办事项失败:', error);
        }
    }
    
    /**
     * 加载设置
     */
    loadSettings() {
        // 从本地存储加载设置
        const settings = Storage.get('dearDiarySettings', {
            enableReminders: true,
            defaultReminderOffset: 60,
            theme: 'pink'
        });
        
        console.log('Loading settings:', settings); // 调试日志
        
        if (this.elements.enableReminders) {
            this.elements.enableReminders.checked = settings.enableReminders;
            console.log('Enable reminders set to:', settings.enableReminders); // 调试日志
        }
        if (this.elements.defaultReminderOffset) {
            this.elements.defaultReminderOffset.value = settings.defaultReminderOffset;
            console.log('Default reminder offset set to:', settings.defaultReminderOffset); // 调试日志
        }
        
        // 设置当前选中的主题
        this.setSelectedTheme(settings.theme);
        
        // 添加主题选择事件监听器
        this.initThemeSelector();
    }
    
    /**
     * 设置选中的主题
     */
    setSelectedTheme(themeName) {
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.theme === themeName) {
                option.classList.add('selected');
            }
        });
    }
    
    /**
     * 保存提醒设置
     */
    saveReminderSettings() {
        const settings = Storage.get('dearDiarySettings', {
            enableReminders: true,
            defaultReminderOffset: 60,
            theme: 'pink'
        });
        
        if (this.elements.enableReminders) {
            settings.enableReminders = this.elements.enableReminders.checked;
        }
        if (this.elements.defaultReminderOffset) {
            settings.defaultReminderOffset = parseInt(this.elements.defaultReminderOffset.value);
        }
        
        Storage.set('dearDiarySettings', settings);
        console.log('提醒设置已保存:', settings);
    }
    
    /**
     * 初始化主题选择器
     */
    initThemeSelector() {
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const themeName = e.currentTarget.dataset.theme;
                this.changeTheme(themeName);
            });
        });
    }
    
    /**
     * 改变主题
     */
    changeTheme(themeName) {
        // 应用主题
        document.documentElement.setAttribute('data-theme', themeName);
        
        // 更新选中状态
        this.setSelectedTheme(themeName);
        
        // 保存设置（保持其他设置不变）
        const settings = Storage.get('dearDiarySettings', {
            enableReminders: true,
            defaultReminderOffset: 60,
            theme: 'pink'
        });
        settings.theme = themeName;
        Storage.set('dearDiarySettings', settings);
        
        console.log('主题已切换为:', themeName);
    }
    
    /**
     * 切换深色模式 (已弃用 - 使用新的主题系统)
     */
    toggleDarkMode() {
        // 这个方法已被新的主题系统替代
        console.warn('toggleDarkMode 已弃用，请使用 changeTheme 方法');
    }
    
    /**
     * 发送测试提醒
     */
    async sendTestReminder() {
        try {
            await api.sendTestReminder();
        } catch (error) {
            console.error('发送测试提醒失败:', error);
        }
    }
    
    /**
     * 加载统计信息
     */
    /**
     * 处理语言切换事件
     * @param {Object} detail - 语言切换详情
     */
    onLanguageChanged(detail) {
        const { language, translations } = detail;
        
        // 更新动态内容的翻译
        this.updateDynamicTranslations(language, translations);
        
        // 重新加载当前页面的内容
        this.refreshCurrentPageContent(language);
    }

    /**
     * 更新动态翻译内容
     * @param {string} language - 语言代码
     * @param {Object} translations - 翻译对象
     */
    updateDynamicTranslations(language, translations) {
        // 更新语音状态文本
        if (this.elements.voiceStatus) {
            const currentText = this.elements.voiceStatus.textContent.trim();
            if (currentText === '录音中...' || currentText === 'Recording...') {
                this.elements.voiceStatus.textContent = translations.recording || '录音中...';
            } else if (currentText === '处理音频中...' || currentText === 'Processing audio...') {
                this.elements.voiceStatus.textContent = translations.processing_audio || '处理音频中...';
            }
        }

        // 更新加载文本
        const loadingText = document.querySelector('#loadingOverlay p');
        if (loadingText && loadingText.textContent) {
            const currentLoadingText = loadingText.textContent.trim();
            if (currentLoadingText.includes('AI正在分析') || currentLoadingText.includes('AI is analyzing')) {
                loadingText.textContent = translations.ai_analyzing || 'AI正在分析你的内容...';
            }
        }
    }

    /**
     * 刷新当前页面内容
     * @param {string} language - 语言代码
     */
    refreshCurrentPageContent(language) {
        // 如果有结果正在显示，更新结果标题
        if (!this.elements.resultsSection.classList.contains('hidden')) {
            this.updateResultsHeaders(language);
        }
    }

    /**
     * 更新结果区域的标题
     * @param {string} language - 语言代码
     */
    updateResultsHeaders(language) {
        const diaryCard = document.querySelector('#diaryPreview .card-title');
        const todosCard = document.querySelector('#todosPreview .card-title');
        
        if (diaryCard) {
            const icon = diaryCard.querySelector('i');
            const iconHTML = icon ? icon.outerHTML : '<i class="fas fa-book"></i>';
            diaryCard.innerHTML = iconHTML + ' ' + window.i18n.t('generated_diary', '生成的日记');
        }
        
        if (todosCard) {
            const icon = todosCard.querySelector('i');
            const iconHTML = icon ? icon.outerHTML : '<i class="fas fa-list"></i>';
            todosCard.innerHTML = iconHTML + ' ' + window.i18n.t('extracted_todos', '提取的待办事项');
        }
    }
}

// 创建全局UI控制器实例
window.ui = new UIController();