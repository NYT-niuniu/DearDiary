/**
 * UI Controller - manages user interface display and interactions
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
    
    init() {
        this.initElements();
        this.bindEvents();
        this.setupNavigation();
        this.switchInputMethod('voice');
        this.loadSettings();
    }
    
    // Initialize DOM element references
    initElements() {
        this.elements = {
            // Navigation
            hamburgerBtn: document.getElementById('hamburgerBtn'),
            mainNav: document.getElementById('mainNav'),
            
            // Input controls
            textInputBtn: document.getElementById('textInputBtn'),
            voiceInputBtn: document.getElementById('voiceInputBtn'),
            textInputArea: document.getElementById('textInputArea'),
            voiceInputArea: document.getElementById('voiceInputArea'),
            userInput: document.getElementById('userInput'),
            clearBtn: document.getElementById('clearBtn'),
            processBtn: document.getElementById('processBtn'),
            clearVoiceBtn: document.getElementById('clearVoiceBtn'),
            processVoiceBtn: document.getElementById('processVoiceBtn'),
            
            // Results display
            resultsSection: document.getElementById('resultsSection'),
            diaryContent: document.getElementById('diaryContent'),
            todosContent: document.getElementById('todosContent'),
            
            // Action buttons
            editDiaryBtn: document.getElementById('editDiaryBtn'),
            editTodosBtn: document.getElementById('editTodosBtn'),
            setRemindersBtn: document.getElementById('setRemindersBtn'),
            discardBtn: document.getElementById('discardBtn'),
            confirmBtn: document.getElementById('confirmBtn'),
            
            // Navigation and pages
            navItems: document.querySelectorAll('.nav-item'),
            mainContent: document.querySelector('.main-content'),
            pages: {
                myDiary: document.getElementById('myDiaryPage'),
                todos: document.getElementById('todosPage'),
                settings: document.getElementById('settingsPage')
            },
            
            // Lists
            diaryList: document.getElementById('diaryList'),
            todosList: document.getElementById('todosList'),
            
            // Modals
            modalOverlay: document.getElementById('modalOverlay'),
            reminderModal: document.getElementById('reminderModal'),
            reminderForm: document.getElementById('reminderForm'),
            closeModalBtn: document.getElementById('closeModalBtn'),
            cancelReminderBtn: document.getElementById('cancelReminderBtn'),
            saveRemindersBtn: document.getElementById('saveRemindersBtn'),
            
            // Settings
            enableReminders: document.getElementById('enableReminders'),
            defaultReminderOffset: document.getElementById('defaultReminderOffset'),
            testReminderBtn: document.getElementById('testReminderBtn')
        };
    }
    
    // Bind event listeners
    bindEvents() {
        // Mobile menu toggle
        if (this.elements.hamburgerBtn && this.elements.mainNav) {
            this.elements.hamburgerBtn.addEventListener('click', () => this.toggleMobileMenu());
            
            const navItems = this.elements.mainNav.querySelectorAll('.nav-item');
            navItems.forEach(item => {
                item.addEventListener('click', () => this.closeMobileMenu());
            });
        }
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (this.elements.hamburgerBtn && this.elements.mainNav) {
                if (!this.elements.hamburgerBtn.contains(e.target) && 
                    !this.elements.mainNav.contains(e.target)) {
                    this.closeMobileMenu();
                }
            }
        });
        
        // Language change listener
        window.addEventListener('languageChanged', (e) => {
            this.onLanguageChanged(e.detail);
        });
        
        // Input method switching
        if (this.elements.textInputBtn) {
            this.elements.textInputBtn.addEventListener('click', () => this.switchInputMethod('text'));
        }
        if (this.elements.voiceInputBtn) {
            this.elements.voiceInputBtn.addEventListener('click', () => this.switchInputMethod('voice'));
        }
        
        // Action buttons
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
        
        // Result actions
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
        
        // Modal events
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
        
        // Settings events
        if (this.elements.testReminderBtn) {
            this.elements.testReminderBtn.addEventListener('click', () => this.sendTestReminder());
        }
        
        if (this.elements.enableReminders) {
            this.elements.enableReminders.addEventListener('change', () => this.saveReminderSettings());
        }
        if (this.elements.defaultReminderOffset) {
            this.elements.defaultReminderOffset.addEventListener('change', () => this.saveReminderSettings());
        }
        
        // Input field events
        if (this.elements.userInput) {
            this.elements.userInput.addEventListener('input', debounce(() => {
                this.updateProcessButton();
            }, 300));
        }
    }
    
    // Setup navigation events
    setupNavigation() {
        // Navigation item click events
        this.elements.navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.dataset.page;
                this.switchPage(page);
            });
        });
        
        // Logo click event
        const logoLink = document.querySelector('.logo-link');
        if (logoLink) {
            logoLink.addEventListener('click', (e) => {
                e.preventDefault();
                const page = logoLink.dataset.page || 'diary';
                this.switchPage(page);
            });
        }
    }
    
    // Mobile menu methods
    toggleMobileMenu() {
        if (this.elements.hamburgerBtn && this.elements.mainNav) {
            this.elements.hamburgerBtn.classList.toggle('active');
            this.elements.mainNav.classList.toggle('active');
        }
    }
    
    closeMobileMenu() {
        if (this.elements.hamburgerBtn && this.elements.mainNav) {
            this.elements.hamburgerBtn.classList.remove('active');
            this.elements.mainNav.classList.remove('active');
        }
    }
    
    // Input method switching
    switchInputMethod(method) {
        this.elements.textInputBtn.classList.toggle('active', method === 'text');
        this.elements.voiceInputBtn.classList.toggle('active', method === 'voice');
        
        if (method === 'text') {
            DOM.show(this.elements.textInputArea);
            DOM.hide(this.elements.voiceInputArea);
            this.elements.userInput.focus();
            this.updateProcessButton();
            
            if (window.i18n) {
                window.i18n.updateContent();
            }
        } else {
            DOM.hide(this.elements.textInputArea);
            DOM.show(this.elements.voiceInputArea);
            this.updateVoiceProcessButton();
        }
    }
    
    // Input management methods
    clearInput() {
        if (this.elements.userInput) {
            this.elements.userInput.value = '';
            this.updateProcessButton();
        }
        
        if (window.speechManager) {
            const transcribedText = document.getElementById('transcribedText');
            if (transcribedText) {
                transcribedText.value = '';
                transcribedText.classList.remove('recording');
            }
        }
    }
    
    clearVoiceInput() {
        const transcribedText = document.getElementById('transcribedText');
        if (transcribedText) {
            transcribedText.value = '';
            transcribedText.classList.remove('recording');
        }
        
        if (window.speechManager) {
            window.speechManager.reset();
        }
        
        this.updateVoiceProcessButton();
    }
    
    // Voice input processing
    async processVoiceInput() {
        const transcribedText = document.getElementById('transcribedText');
        const input = transcribedText?.value?.trim();
        
        if (!input) {
            Notification.warning('Please record or input some content first');
            return;
        }
        
        try {
            DOM.show(this.elements.loadingOverlay);
            
            const response = await api.analyzeInput(input);
            if (response.success) {
                this.displayResults(response.data);
            } else {
                Notification.error(response.message || 'AI analysis failed');
            }
        } catch (error) {
            console.error('Failed to process voice input:', error);
            Notification.error('Processing failed, please try again');
        } finally {
            DOM.hide(this.elements.loadingOverlay);
        }
    }
    
    // Button state management
    updateVoiceProcessButton() {
        if (this.elements.processVoiceBtn) {
            const transcribedText = document.getElementById('transcribedText');
            const hasInput = transcribedText && !isEmpty(transcribedText.value);
            this.elements.processVoiceBtn.disabled = !hasInput;
        }
    }
    
    updateProcessButton() {
        if (this.elements.processBtn && this.elements.userInput) {
            const hasInput = !isEmpty(this.elements.userInput.value);
            this.elements.processBtn.disabled = !hasInput;
        }
    }
    
    // Text input processing
    async processInput() {
        const input = this.elements.userInput?.value?.trim();
        if (!input) {
            Notification.warning('Please input some content');
            return;
        }
        
        try {
            const result = await api.analyzeInput(input);
            
            if (result.success) {
                this.displayResults(result.data);
            } else {
                Notification.error('Processing failed, please try again');
            }
        } catch (error) {
            console.error('Failed to process input:', error);
        }
    }
    
    // Results display methods
    displayResults(data) {
        this.currentData = data;
        
        if (data.diary) {
            this.renderDiary(data.diary);
        }
        
        if (data.todos && data.todos.todos) {
            this.renderTodos(data.todos.todos);
        }
        
        DOM.show(this.elements.resultsSection);
        
        this.elements.resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
    
    renderDiary(diary) {
        if (!this.elements.diaryContent) return;
        
        const html = `
            <div class=\"diary-meta\">
                <div class=\"diary-meta-item\">
                    <span class=\"diary-meta-label\">${window.i18n ? window.i18n.t('date') : 'Date'}</span>
                    <div class=\"diary-meta-value\">${diary.date}</div>
                </div>
                <div class=\"diary-meta-item\">
                    <span class=\"diary-meta-label\">${window.i18n ? window.i18n.t('weather') : 'Weather'}</span>
                    <div class=\"diary-meta-value\">${diary.weather}</div>
                </div>
                <div class=\"diary-meta-item\">
                    <span class=\"diary-meta-label\">${window.i18n ? window.i18n.t('mood') : 'Mood'}</span>
                    <div class=\"diary-meta-value\">
                        <i class=\"${getMoodIcon(diary.mood)}\"></i>
                        ${diary.mood}
                    </div>
                </div>
            </div>
            
            <div class=\"diary-text\">
                <h4>${window.i18n ? window.i18n.t('today_record') : 'Today\'s Record'}</h4>
                <p>${diary.content}</p>
                
                <h4>${window.i18n ? window.i18n.t('today_reflection') : 'Today\'s Reflection'}</h4>
                <p>${diary.reflection}</p>
            </div>
        `;
        
        this.elements.diaryContent.innerHTML = html;
    }
    
    renderTodos(todos) {
        if (!this.elements.todosContent) return;
        
        if (!todos || todos.length === 0) {
            this.elements.todosContent.innerHTML = '<p class="text-center" data-i18n="no_todos_detected">No todos detected</p>';
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
    
    // Diary editing methods
    editDiary() {
        const diaryContent = document.getElementById('diaryContent');
        const editDiaryBtn = document.getElementById('editDiaryBtn');
        
        if (!diaryContent || !editDiaryBtn) {
            Notification.error('Diary content area not found');
            return;
        }

        if (diaryContent.classList.contains('editing')) {
            this.saveDiary();
            return;
        }

        const currentContent = diaryContent.innerHTML;
        const plainText = diaryContent.innerText || diaryContent.textContent || '';
        
        diaryContent.classList.add('editing');
        diaryContent.innerHTML = `
            <div class="diary-editor">
                <textarea id="diaryEditor" class="form-control diary-textarea" rows="8" placeholder="${window.i18n.t('edit_diary_placeholder', 'Edit your diary content...')}">${plainText.trim()}</textarea>
                <div class="editor-actions mt-3">
                    <button class="btn btn-primary" onclick="window.ui.saveDiary()">
                        <i class="fas fa-save"></i>
                        <span data-i18n="save">Save</span>
                    </button>
                    <button class="btn btn-secondary ms-2" onclick="window.ui.cancelEditDiary()">
                        <i class="fas fa-times"></i>
                        <span data-i18n="cancel">Cancel</span>
                    </button>
                </div>
            </div>
        `;

        editDiaryBtn.innerHTML = `
            <i class="fas fa-save"></i>
            <span data-i18n="save">Save</span>
        `;

        const editor = document.getElementById('diaryEditor');
        if (editor) {
            editor.focus();
            editor.setSelectionRange(editor.value.length, editor.value.length);
        }

        diaryContent.dataset.originalContent = currentContent;

        Notification.success('Editing mode enabled');
    }

    saveDiary() {
        const diaryContent = document.getElementById('diaryContent');
        const editDiaryBtn = document.getElementById('editDiaryBtn');
        const editor = document.getElementById('diaryEditor');
        
        if (!diaryContent || !editor) {
            Notification.error('Editor not found');
            return;
        }

        const newContent = editor.value.trim();
        if (!newContent) {
            Notification.error('Diary content cannot be empty');
            return;
        }

        diaryContent.classList.remove('editing');
        
        const formattedContent = newContent
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^/, '<p>')
            .replace(/$/, '</p>');

        diaryContent.innerHTML = formattedContent;

        editDiaryBtn.innerHTML = `
            <i class="fas fa-edit"></i>
            <span data-i18n="edit_diary">Edit Diary</span>
        `;

        delete diaryContent.dataset.originalContent;

        Notification.success('Diary saved successfully');
    }

    cancelEditDiary() {
        const diaryContent = document.getElementById('diaryContent');
        const editDiaryBtn = document.getElementById('editDiaryBtn');
        
        if (!diaryContent) {
            return;
        }

        const originalContent = diaryContent.dataset.originalContent;
        if (originalContent) {
            diaryContent.innerHTML = originalContent;
        }

        diaryContent.classList.remove('editing');

        if (editDiaryBtn) {
            editDiaryBtn.innerHTML = `
                <i class="fas fa-edit"></i>
                <span data-i18n="edit_diary">Edit Diary</span>
            `;
        }

        delete diaryContent.dataset.originalContent;

        Notification.info('Edit cancelled');
    }
    
    editTodos() {
        Notification.info('Todo editing feature coming soon...');
    }
    
    // Reminder management
    setReminders() {
        if (!this.currentData.todos || !this.currentData.todos.todos.length) {
            Notification.warning('No todos to set reminders for');
            return;
        }
        
        this.renderReminderModal();
        DOM.show(this.elements.modalOverlay);
    }
    
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
                        ${window.i18n ? window.i18n.t('enable_reminder') : 'Enable Reminder'}
                    </label>
                    
                    <div class=\"reminder-time-inputs\">
                        <label>
                            ${window.i18n ? window.i18n.t('reminder_time') : 'Reminder Time'}:
                            <input type=\"datetime-local\" class=\"reminder-time\" data-index=\"${index}\"
                                   value=\"${this.getDefaultReminderTime(todo)}\">
                        </label>
                    </div>
                </div>
            </div>
        `).join('');
        
        this.elements.reminderForm.innerHTML = html;
    }
    
    getDefaultReminderTime(todo) {
        let reminderTime;
        
        if (todo.due_time) {
            const dueDate = new Date(todo.due_time);
            reminderTime = new Date(dueDate.getTime() - 15 * 60 * 1000);
        } else {
            reminderTime = new Date();
            reminderTime.setDate(reminderTime.getDate() + 1);
        }
        
        return reminderTime.toISOString().slice(0, 16);
    }
    
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
        
        this.renderTodos(todos);
        this.closeModal();
        
        Notification.success('Reminder time set successfully!');
    }
    
    closeModal() {
        DOM.hide(this.elements.modalOverlay);
    }
    
    // Result actions
    discardResults() {
        DOM.hide(this.elements.resultsSection);
        this.currentData = { diary: null, todos: null };
        this.clearInput();
    }
    
    async confirmResults() {
        if (!this.currentData.diary && (!this.currentData.todos || !this.currentData.todos.todos.length)) {
            Notification.warning('No data to save');
            return;
        }
        
        try {
            const result = await api.confirmData(this.currentData.diary, this.currentData.todos, true);
            
            if (result.success) {
                Notification.success('Data saved successfully!');
                this.discardResults();
            }
        } catch (error) {
            console.error('Failed to save data:', error);
        }
    }
    
    // Page navigation methods
    switchPage(page) {
        // Update navigation state
        this.elements.navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });
        
        // Handle home page display
        if (page === 'home' || page === undefined) {
            if (this.elements.mainContent) {
                DOM.show(this.elements.mainContent);
            }
            Object.values(this.elements.pages).forEach(pageElement => {
                if (pageElement) {
                    DOM.hide(pageElement);
                }
            });
            this.elements.navItems.forEach(item => {
                item.classList.remove('active');
            });
        } else {
            if (this.elements.mainContent) {
                DOM.hide(this.elements.mainContent);
            }
            Object.values(this.elements.pages).forEach(pageElement => {
                if (pageElement) {
                    DOM.hide(pageElement);
                }
            });
            
            if (this.elements.pages[page]) {
                DOM.show(this.elements.pages[page]);
            }
        }
        
        this.currentPage = page || 'home';
        
        this.loadPageData(page);
    }
    
    // Page data loading
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
    
    async loadDiaryList() {
        if (!this.elements.diaryList) return;
        
        try {
            const result = await api.getDiaries(20, 0);
            if (result.success && result.data) {
                this.renderDiaryList(result.data);
            }
        } catch (error) {
            console.error('Failed to load diary list:', error);
        }
    }
    
    renderDiaryList(diaries) {
        if (!diaries || diaries.length === 0) {
            this.elements.diaryList.innerHTML = '<p class="text-center" data-i18n="no_diary_yet">No diary entries yet</p>';
            if (window.i18n) {
                window.i18n.updateContent();
            }
            return;
        }
        
        const html = diaries.map(diary => `
            <div class="diary-item" data-diary-id="${diary.id}">
                <div class="diary-item-header">
                    <h3>${diary.date}</h3>
                    <div class="diary-item-mood">
                        <i class="${getMoodIcon(diary.mood)}"></i>
                        ${diary.mood}
                    </div>
                </div>
                <div class="diary-item-content">
                    ${truncateText(diary.content, 150)}
                </div>
                <div class="diary-item-meta">
                    <span><i class="fas fa-cloud"></i> ${diary.weather}</span>
                    <span><i class="fas fa-clock"></i> ${formatDate(diary.created_at, 'datetime')}</span>
                </div>
            </div>
        `).join('');
        
        this.elements.diaryList.innerHTML = html;
        
        this.bindDiaryItemEvents();
    }

    bindDiaryItemEvents() {
        if (!this.elements.diaryList) return;
        
        this.elements.diaryList.removeEventListener('click', this.handleDiaryItemClick);
        
        this.elements.diaryList.addEventListener('click', this.handleDiaryItemClick.bind(this));
    }

    handleDiaryItemClick(event) {
        const diaryItem = event.target.closest('.diary-item');
        if (diaryItem) {
            const diaryId = diaryItem.getAttribute('data-diary-id');
            if (diaryId) {
                console.log('Diary item clicked, ID:', diaryId);
                this.showDiaryDetails(diaryId);
            }
        }
    }
    
    async loadTodosList() {
        if (!this.elements.todosList) return;
        
        try {
            const result = await api.getTodos(false, 50);
            if (result.success && result.data) {
                this.renderTodosList(result.data);
            }
        } catch (error) {
            console.error('Failed to load todos list:', error);
        }
    }
    
    renderTodosList(todos) {
        if (!todos || todos.length === 0) {
            this.elements.todosList.innerHTML = '<p class="text-center" data-i18n="no_todos">No todos</p>';
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
    
    async completeTodo(id) {
        try {
            await api.completeTodo(id);
            this.loadTodosList();
        } catch (error) {
            console.error('Failed to complete todo:', error);
        }
    }
    
    // Settings management
    loadSettings() {
        // Load settings from local storage
        const settings = Storage.get('dearDiarySettings', {
            enableReminders: true,
            defaultReminderOffset: 60,
            theme: 'pink'
        });
        
        console.log('Loading settings:', settings);
        
        if (this.elements.enableReminders) {
            this.elements.enableReminders.checked = settings.enableReminders;
            console.log('Enable reminders set to:', settings.enableReminders);
        }
        if (this.elements.defaultReminderOffset) {
            this.elements.defaultReminderOffset.value = settings.defaultReminderOffset;
            console.log('Default reminder offset set to:', settings.defaultReminderOffset);
        }
        
        this.setSelectedTheme(settings.theme);
        
        this.initThemeSelector();
    }
    
    setSelectedTheme(themeName) {
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.classList.remove('selected');
            if (option.dataset.theme === themeName) {
                option.classList.add('selected');
            }
        });
    }
    
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
        console.log('Reminder settings saved:', settings);
    }
    
    initThemeSelector() {
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const themeName = e.currentTarget.dataset.theme;
                this.changeTheme(themeName);
            });
        });
    }
    
    changeTheme(themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
        
        this.setSelectedTheme(themeName);
        
        const settings = Storage.get('dearDiarySettings', {
            enableReminders: true,
            defaultReminderOffset: 60,
            theme: 'pink'
        });
        settings.theme = themeName;
        Storage.set('dearDiarySettings', settings);
        
        console.log('Theme changed to:', themeName);
    }
    
    // Deprecated method - replaced by new theme system
    toggleDarkMode() {
        console.warn('toggleDarkMode is deprecated, use changeTheme method instead');
    }
    
    async sendTestReminder() {
        try {
            await api.sendTestReminder();
        } catch (error) {
            console.error('Failed to send test reminder:', error);
        }
    }
    
    // Language change handling
    onLanguageChanged(detail) {
        const { language, translations } = detail;
        
        this.updateDynamicTranslations(language, translations);
        
        this.refreshCurrentPageContent(language);
    }

    updateDynamicTranslations(language, translations) {
        if (this.elements.voiceStatus) {
            const currentText = this.elements.voiceStatus.textContent.trim();
            if (currentText === '录音中...' || currentText === 'Recording...') {
                this.elements.voiceStatus.textContent = translations.recording || '录音中...';
            } else if (currentText === '处理音频中...' || currentText === 'Processing audio...') {
                this.elements.voiceStatus.textContent = translations.processing_audio || '处理音频中...';
            }
        }

        const loadingText = document.querySelector('#loadingOverlay p');
        if (loadingText && loadingText.textContent) {
            const currentLoadingText = loadingText.textContent.trim();
            if (currentLoadingText.includes('AI正在分析') || currentLoadingText.includes('AI is analyzing')) {
                loadingText.textContent = translations.ai_analyzing || 'AI正在分析你的内容...';
            }
        }
    }

    refreshCurrentPageContent(language) {
        if (!this.elements.resultsSection.classList.contains('hidden')) {
            this.updateResultsHeaders(language);
        }
    }

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

    // Diary details modal
    async showDiaryDetails(diaryId) {
        console.log('Showing diary details for ID:', diaryId);
        
        const loadingModal = this.createLoadingModal();
        document.body.appendChild(loadingModal);
        
        try {
            const response = await api.getDiary(diaryId);
            console.log('API response:', response);
            
            loadingModal.remove();
            
            if (response.success) {
                this.displayDiaryModal(response.data);
            } else {
                console.error('Failed to load diary:', response.error);
                Notification.error('Failed to load diary details');
            }
        } catch (error) {
            loadingModal.remove();
            console.error('Error loading diary details:', error);
            Notification.error('Error loading diary details');
        }
    }

    createLoadingModal() {
        const loadingModal = document.createElement('div');
        loadingModal.className = 'modal-overlay';
        loadingModal.innerHTML = `
            <div class="modal-content" style="max-width: 300px; text-align: center; padding: 2rem;">
                <div class="loading-spinner" style="margin-bottom: 1rem;">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary-color);"></i>
                </div>
                <p data-i18n="loading_diary">Loading diary details...</p>
            </div>
        `;
        return loadingModal;
    }

    displayDiaryModal(diary) {
        console.log('Displaying diary modal for:', diary);
        
        // Safe field values with defaults
        const safeContent = diary.content || 'No content available';
        const safeReflection = diary.reflection || '';
        const safeRecord = diary.record || '';
        const safeMood = diary.mood || 'Unknown';
        const safeWeather = diary.weather || 'Unknown';
        const safeDate = diary.date || formatDate(diary.created_at, 'date') || 'Unknown date';
        const safeCreatedAt = diary.created_at ? formatDate(diary.created_at, 'datetime') : 'Unknown time';
        
        // Create modal HTML
        const modalHTML = `
            <div class="modal-overlay" id="diaryModal">
                <div class="modal-content diary-modal">
                    <div class="modal-header">
                        <h2><i class="fas fa-book"></i> ${safeDate}</h2>
                        <button class="modal-close" onclick="window.ui.closeDiaryModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="diary-detail-section">
                            <div class="diary-meta">
                                <div class="meta-item">
                                    <i class="fas fa-heart"></i>
                                    <span data-i18n="mood">Mood</span>: ${safeMood}
                                </div>
                                <div class="meta-item">
                                    <i class="fas fa-cloud"></i>
                                    <span data-i18n="weather">Weather</span>: ${safeWeather}
                                </div>
                                <div class="meta-item">
                                    <i class="fas fa-clock"></i>
                                    <span data-i18n="created_time">Created</span>: ${safeCreatedAt}
                                </div>
                            </div>
                        </div>
                        
                        <div class="diary-detail-section">
                            <h3><i class="fas fa-edit"></i> <span data-i18n="diary_content">Diary Content</span></h3>
                            <div class="diary-content-full">
                                ${safeContent.replace(/\n/g, '<br>')}
                            </div>
                        </div>

                        ${safeReflection ? `
                        <div class="diary-detail-section">
                            <h3><i class="fas fa-lightbulb"></i> <span data-i18n="today_reflection">Today's Reflection</span></h3>
                            <div class="diary-reflection">
                                ${safeReflection.replace(/\n/g, '<br>')}
                            </div>
                        </div>
                        ` : ''}

                        ${safeRecord ? `
                        <div class="diary-detail-section">
                            <h3><i class="fas fa-list-ul"></i> <span data-i18n="today_record">Today's Record</span></h3>
                            <div class="diary-record">
                                ${safeRecord.replace(/\n/g, '<br>')}
                            </div>
                        </div>
                        ` : ''}
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="window.ui.closeDiaryModal()">
                            <i class="fas fa-times"></i>
                            <span data-i18n="close">Close</span>
                        </button>
                        <button class="btn btn-primary" onclick="window.ui.editDiary('${diary.id}')">
                            <i class="fas fa-edit"></i>
                            <span data-i18n="edit">Edit</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        if (window.i18n) {
            window.i18n.updateContent();
        }
        
        const overlay = document.getElementById('diaryModal');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    this.closeDiaryModal();
                }
            });
        }
    }

    closeDiaryModal() {
        const modal = document.getElementById('diaryModal');
        if (modal) {
            modal.remove();
        }
    }

    editDiary(diaryId) {
        console.log('Edit diary:', diaryId);
        this.closeDiaryModal();
        Notification.info('Edit functionality coming soon');
    }
}

// Global UI controller instance
window.ui = new UIController();
window.uiManager = window.ui;