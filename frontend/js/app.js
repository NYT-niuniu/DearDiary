/**
 * Dear Diary Application Main Entry
 * Responsible for application initialization and global event handling
 */
class DearDiaryApp {
    constructor() {
        this.isInitialized = false;
        this.version = '1.0.0';
        
        this.handleError = this.handleError.bind(this);
        this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    }
    
    /**
     * Initialize application
     */
    async init() {
        try {
            console.log(`Dear Diary v${this.version} starting...`);
            
            this.initUtils();
            this.initI18nSystem();
            this.initNotificationSystem();
            this.initLoadingSystem();
            
            const speechInitialized = window.speechManager ? window.speechManager.init() : false;
            if (!speechInitialized) {
                console.warn('Speech recognition initialization failed, speech features will be disabled');
            }
            
            await this.checkAPIConnection();
            this.loadUserSettings();
            this.setupGlobalEventListeners();
            
            this.isInitialized = true;
            console.log('Dear Diary initialization complete');
            
            this.showWelcomeMessage();
            
            return true;
            
        } catch (error) {
            console.error('Application initialization failed:', error);
            this.handleInitializationError(error);
            return false;
        }
    }
    
    /**
     * Initialize internationalization system
     */
    initI18nSystem() {
        try {
            if (window.I18nManager) {
                window.i18n = new window.I18nManager();
                console.log('Internationalization system initialized');
            } else {
                console.warn('I18nManager not found, skip internationalization initialization');
            }
        } catch (error) {
            console.warn('Internationalization system initialization failed:', error);
        }
    }
    
    /**
     * Initialize notification system
     */
    initNotificationSystem() {
        try {
            if (window.Notification) {
                Notification.init();
            } else {
                window.Notification = {
                    init: function() {},
                    show: function(message, type) {
                        alert(type + ': ' + message);
                    },
                    success: function(message) { this.show(message, 'Success'); },
                    error: function(message) { this.show(message, 'Error'); },
                    warning: function(message) { this.show(message, 'Warning'); },
                    info: function(message) { this.show(message, 'Info'); }
                };
            }
        } catch (error) {
            console.warn('Notification system initialization failed:', error);
        }
    }
    
    /**
     * Initialize loading system
     */
    initLoadingSystem() {
        try {
            if (window.Loading) {
                Loading.init();
            } else {
                window.Loading = {
                    init: function() {},
                    show: function(message) {
                        console.log('Loading: ' + message);
                    },
                    hide: function() {
                        console.log('Loading complete');
                    }
                };
            }
        } catch (error) {
            console.warn('Loading system initialization failed:', error);
        }
    }
    
    initUtils() {
        console.log('Utilities initialized');
    }
    
    /**
     * Check API connection
     */
    async checkAPIConnection() {
        try {
            const health = await window.apiService.getHealth();
            console.log('API connection normal:', health);
            return true;
        } catch (error) {
            console.warn('API connection failed, will run in offline mode:', error);
            window.isOfflineMode = true;
            return false;
        }
    }
    
    /**
     * Load user settings
     */
    loadUserSettings() {
        const settings = Storage.get('dearDiarySettings', {
            theme: 'pink',
            enableReminders: true,
            defaultReminderOffset: 60,
            language: 'en-AU'
        });
        
        this.applyTheme(settings.theme);
        window.userSettings = settings;
        
        console.log('User settings loaded:', settings);
    }

    applyTheme(themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
    }
    
    /**
     * Setup global event listeners
     */
    setupGlobalEventListeners() {
        window.addEventListener('error', this.handleError);
        window.addEventListener('unhandledrejection', this.handleError);
        window.addEventListener('beforeunload', this.handleBeforeUnload);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
        
        console.log('Global event listeners setup complete');
    }
    
    /**
     * Handle global errors
     */
    handleError(event) {
        console.error('Global error:', event);
        
        let message = 'Application error occurred';
        
        if (event.error) {
            message = event.error.message || message;
        } else if (event.reason) {
            message = event.reason.message || event.reason || message;
        }
        
        Notification.error(`Error occurred: ${message}`);
        this.reportError(event);
    }
    
    /**
     * Handle before page unload event
     */
    handleBeforeUnload(event) {
        if (window.ui && window.ui.currentData && (window.ui.currentData.diary || window.ui.currentData.todos)) {
            event.preventDefault();
            event.returnValue = 'You have unsaved data, are you sure you want to leave?';
            return event.returnValue;
        }
    }
    
    /**
     * Handle page visibility change
     */
    handleVisibilityChange() {
        if (document.hidden) {
            console.log('Page hidden');
        } else {
            console.log('Page visible');
            if (window.ui && window.ui.loadStatistics && !window.isOfflineMode) {
                window.ui.loadStatistics();
            }
        }
    }
    
    /**
     * Handle keyboard shortcuts
     */
    handleKeyboardShortcuts(event) {
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            if (window.ui && window.ui.elements.userInput === document.activeElement) {
                event.preventDefault();
                window.ui.processInput();
            }
        }
        
        if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
            if (window.ui && window.ui.elements.userInput === document.activeElement) {
                event.preventDefault();
                window.ui.clearInput();
            }
        }
        
        if (event.key === 'Escape') {
            if (window.ui && window.ui.elements.modalOverlay && !window.ui.elements.modalOverlay.classList.contains('hidden')) {
                window.ui.closeModal();
            }
        }
    }
    
    /**
     * Show welcome message
     */
    showWelcomeMessage() {
        const isFirstVisit = !this.getStorageItem('hasVisited', false);
        
        if (isFirstVisit) {
            setTimeout(() => {
                const message = 'Welcome to Dear Diary! Start recording your wonderful life 📝';
                
                if (window.Notification && window.Notification.info) {
                    Notification.info(message, 5000);
                } else {
                    console.log(message);
                }
                
                this.setStorageItem('hasVisited', true);
            }, 1000);
        }
    }
    
    getStorageItem(key, defaultValue) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('Failed to read local storage:', error);
            return defaultValue;
        }
    }
    
    setStorageItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn('Failed to write to local storage:', error);
        }
    }
    
    /**
     * Handle initialization error
     */
    handleInitializationError(error) {
        const errorMessage = `
            <div style="text-align: center; padding: 2rem; background: #fee; border: 1px solid #fcc; border-radius: 8px; margin: 2rem;">
                <h2 style="color: #c33;">Application Startup Failed</h2>
                <p>Dear Diary encountered a problem during startup:</p>
                <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; text-align: left;">${error.message}</pre>
                <button onclick="location.reload()" style="background: #667eea; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
                    Reload
                </button>
            </div>
        `;
        
        document.body.innerHTML = errorMessage;
    }
    
    /**
     * Report error (optional)
     */
    reportError(event) {
        console.log('Error logged, reporting logic can be added here');
    }
    
    /**
     * Get application status
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            version: this.version,
            userSettings: window.userSettings || {},
            apiConnected: window.apiService ? true : false,
            speechSupported: window.speechManager ? window.speechManager.speechService.isSupported : false
        };
    }
    
    /**
     * Restart application
     */
    async restart() {
        console.log('Restarting application...');
        
        if (window.speechManager) {
            window.speechManager.destroy();
        }
        
        return await this.init();
    }
    
    /**
     * Destroy application
     */
    destroy() {
        console.log('Destroying application...');
        
        window.removeEventListener('error', this.handleError);
        window.removeEventListener('unhandledrejection', this.handleError);
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        
        if (window.speechManager) {
            window.speechManager.destroy();
        }
        
        this.isInitialized = false;
        console.log('Application destroyed');
    }
}

/**
 * Application startup function
 */
async function startApp() {
    if (document.readyState === 'loading') {
        await new Promise(resolve => {
            document.addEventListener('DOMContentLoaded', resolve);
        });
    }
    
    window.app = new DearDiaryApp();
    const success = await window.app.init();
    
    if (success) {
        console.log('🎉 Dear Diary started successfully!');
    } else {
        console.error('❌ Dear Diary startup failed!');
    }
    
    return success;
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = DearDiaryApp;
}