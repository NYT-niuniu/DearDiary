/**
 * Dear Diary 应用主入口
 * 负责应用的初始化和全局事件处理
 */
class DearDiaryApp {
    constructor() {
        this.isInitialized = false;
        this.version = '1.0.0';
        
        // 绑定方法上下文
        this.handleError = this.handleError.bind(this);
        this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
    }
    
    /**
     * 初始化应用
     */
    async init() {
        try {
            console.log(`Dear Diary v${this.version} 正在启动...`);
            
            // 检查是否启用兼容模式
            const compatibilityMode = localStorage.getItem('dearDiary_compatibilityMode') === 'true';
            if (compatibilityMode) {
                console.log('兼容模式已启用');
                this.enableCompatibilityFeatures();
            }
            
            // 1. 初始化工具类
            this.initUtils();
            
            // 2. 检查浏览器兼容性（兼容模式下跳过严格检查）
            if (!compatibilityMode && !this.checkCompatibility()) {
                return false;
            }
            
            // 3. 初始化国际化系统
            this.initI18nSystem();
            
            // 4. 初始化通知系统
            this.initNotificationSystem();
            
            // 5. 初始化加载组件
            this.initLoadingSystem();
            
            // 6. 初始化语音识别（兼容模式下可选）
            if (!compatibilityMode) {
                const speechInitialized = window.speechManager ? window.speechManager.init() : false;
                if (!speechInitialized) {
                    console.warn('语音识别初始化失败，将禁用语音功能');
                }
            } else {
                console.log('兼容模式：跳过语音识别初始化');
            }
            
            // 7. 检查API连接
            await this.checkAPIConnection();
            
            // 8. 加载用户设置
            this.loadUserSettings();
            
            // 9. 设置全局事件监听器
            this.setupGlobalEventListeners();
            
            // 10. 初始化完成
            this.isInitialized = true;
            console.log('Dear Diary 初始化完成');
            
            // 11. 显示欢迎消息
            this.showWelcomeMessage(compatibilityMode);
            
            return true;
            
        } catch (error) {
            console.error('应用初始化失败:', error);
            this.handleInitializationError(error);
            return false;
        }
    }
    
    /**
     * 启用兼容性功能
     */
    enableCompatibilityFeatures() {
        // 添加兼容性CSS类
        document.documentElement.classList.add('compatibility-mode');
        
        // 禁用一些高级动画
        const style = document.createElement('style');
        style.textContent = `
            .compatibility-mode * {
                transition: none !important;
                animation: none !important;
            }
            .compatibility-mode .voice-input-area {
                display: none !important;
            }
            .compatibility-mode .voice-btn {
                display: none !important;
            }
        `;
        document.head.appendChild(style);
        
        // 设置兼容模式标志
        window.isCompatibilityMode = true;
    }
    
    /**
     * 初始化国际化系统
     */
    initI18nSystem() {
        try {
            // 创建国际化管理器实例
            if (window.I18nManager) {
                window.i18n = new window.I18nManager();
                console.log('国际化系统已初始化');
            } else {
                console.warn('I18nManager 未找到，跳过国际化初始化');
            }
        } catch (error) {
            console.warn('国际化系统初始化失败:', error);
        }
    }
    
    /**
     * 初始化通知系统
     */
    initNotificationSystem() {
        try {
            if (window.Notification) {
                Notification.init();
            } else {
                // 提供简单的替代通知系统
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
            console.warn('通知系统初始化失败:', error);
        }
    }
    
    /**
     * 初始化加载系统
     */
    initLoadingSystem() {
        try {
            if (window.Loading) {
                Loading.init();
            } else {
                // 提供简单的替代加载系统
                window.Loading = {
                    init: function() {},
                    show: function(message) {
                        console.log('加载中: ' + message);
                    },
                    hide: function() {
                        console.log('加载完成');
                    }
                };
            }
        } catch (error) {
            console.warn('加载系统初始化失败:', error);
        }
    }
    
    /**
     * 初始化工具类
     */
    initUtils() {
        // 这里可以进行一些工具类的初始化配置
        console.log('工具类已初始化');
    }
    
    /**
     * 检查浏览器兼容性
     */
    checkCompatibility() {
        const issues = [];
        const browserInfo = this.getBrowserInfo();
        
        // 对于现代浏览器（Chrome 80+, Firefox 70+等），跳过严格检测
        if (this.isModernBrowser(browserInfo)) {
            console.log('检测到现代浏览器，跳过严格兼容性检测');
            return true;
        }
        
        // 检查 window 对象的API支持
        const windowAPIs = {
            'localStorage': '本地存储',
            'addEventListener': '事件监听'
        };
        
        for (const [api, description] of Object.entries(windowAPIs)) {
            if (!(api in window)) {
                issues.push(`不支持 ${api} (${description})`);
            }
        }
        
        // 检查 document 对象的API支持
        const documentAPIs = {
            'querySelector': 'DOM查询'
        };
        
        for (const [api, description] of Object.entries(documentAPIs)) {
            if (!document || !(api in document)) {
                issues.push(`不支持 ${api} (${description})`);
            }
        }
        
        // 检查 fetch API，如果不支持则尝试提供 polyfill
        if (!('fetch' in window)) {
            console.warn('浏览器不支持 fetch API，将使用 XMLHttpRequest 替代');
            this.setupFetchPolyfill();
        }
        
        // 检查基本的 JavaScript 特性
        try {
            // 检查基本的函数语法
            var testFunc = function() { return true; };
            if (!testFunc()) {
                issues.push('JavaScript 基本功能异常');
            }
        } catch (error) {
            issues.push('JavaScript 执行环境异常');
        }
        
        // 检查 JSON 支持
        if (!window.JSON) {
            issues.push('不支持 JSON');
        }
        
        if (issues.length > 0) {
            console.error('浏览器兼容性问题:', issues);
            this.showCompatibilityError(issues);
            return false;
        }
        
        return true;
    }
    
    /**
     * 设置 fetch polyfill
     */
    setupFetchPolyfill() {
        if (!window.fetch) {
            window.fetch = function(url, options) {
                return new Promise(function(resolve, reject) {
                    var xhr = new XMLHttpRequest();
                    options = options || {};
                    
                    xhr.open(options.method || 'GET', url, true);
                    
                    // 设置请求头
                    if (options.headers) {
                        for (var key in options.headers) {
                            xhr.setRequestHeader(key, options.headers[key]);
                        }
                    }
                    
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState === 4) {
                            if (xhr.status >= 200 && xhr.status < 300) {
                                resolve({
                                    ok: true,
                                    status: xhr.status,
                                    json: function() {
                                        return Promise.resolve(JSON.parse(xhr.responseText));
                                    },
                                    text: function() {
                                        return Promise.resolve(xhr.responseText);
                                    }
                                });
                            } else {
                                reject(new Error('HTTP ' + xhr.status));
                            }
                        }
                    };
                    
                    xhr.onerror = function() {
                        reject(new Error('Network error'));
                    };
                    
                    xhr.send(options.body || null);
                });
            };
        }
    }
    
    /**
     * 显示兼容性错误
     */
    showCompatibilityError(issues = []) {
        const browserInfo = this.getBrowserInfo();
        
        const message = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 2rem auto; padding: 2rem; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px;">
                <h2 style="color: #856404; margin-bottom: 1rem; text-align: center;">🚫 浏览器兼容性问题</h2>
                
                <div style="background: #fff; padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                    <h3 style="color: #dc3545; margin-bottom: 0.5rem;">检测到的问题:</h3>
                    <ul style="color: #721c24; margin: 0; padding-left: 1.5rem;">
                        ${issues.map(issue => `<li>${issue}</li>`).join('')}
                    </ul>
                </div>
                
                <div style="background: #d1ecf1; padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                    <h3 style="color: #0c5460; margin-bottom: 0.5rem;">你的浏览器信息:</h3>
                    <p style="color: #0c5460; margin: 0;">
                        <strong>浏览器:</strong> ${browserInfo.name}<br>
                        <strong>版本:</strong> ${browserInfo.version}<br>
                        <strong>用户代理:</strong> ${browserInfo.userAgent}
                    </p>
                </div>
                
                <div style="background: #d4edda; padding: 1rem; border-radius: 6px; margin-bottom: 1rem;">
                    <h3 style="color: #155724; margin-bottom: 0.5rem;">🔧 解决方案:</h3>
                    <div style="color: #155724;">
                        <h4>方案一：更新浏览器（推荐）</h4>
                        <ul style="margin: 0.5rem 0; padding-left: 1.5rem;">
                            <li><a href="https://www.google.com/chrome/" target="_blank" style="color: #007bff;">Chrome 80+</a> - 最佳兼容性</li>
                            <li><a href="https://www.mozilla.org/firefox/" target="_blank" style="color: #007bff;">Firefox 70+</a> - 良好支持</li>
                            <li><a href="https://www.microsoft.com/edge" target="_blank" style="color: #007bff;">Edge 80+</a> - 推荐Windows用户</li>
                        </ul>
                        
                        <h4>方案二：使用兼容版本</h4>
                        <button onclick="window.location.href='fallback.html'" 
                                style="background: #17a2b8; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin: 0.5rem 0;">
                            🚀 使用兼容版本
                        </button>
                        
                        <h4>方案三：重新尝试</h4>
                        <button onclick="window.location.reload()" 
                                style="background: #28a745; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin: 0.5rem 0;">
                            🔄 重新加载页面
                        </button>
                        
                        <h4>方案四：启用兼容模式</h4>
                        <button onclick="enableCompatibilityMode()" 
                                style="background: #007bff; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin: 0.5rem 0;">
                            🛠️ 启用兼容模式
                        </button>
                    </div>
                </div>
                
                <div style="text-align: center; color: #6c757d; font-size: 0.9rem;">
                    <p>如果问题持续存在，请联系技术支持</p>
                </div>
            </div>
            
            <script>
                function enableCompatibilityMode() {
                    localStorage.setItem('dearDiary_compatibilityMode', 'true');
                    alert('兼容模式已启用，页面将重新加载');
                    window.location.reload();
                }
            </script>
        `;
        
        document.body.innerHTML = message;
    }
    
    /**
     * 检查是否为现代浏览器
     */
    isModernBrowser(browserInfo) {
        const { name, version } = browserInfo;
        const versionNum = parseInt(version, 10);
        
        // 现代浏览器版本阈值
        const modernBrowsers = {
            'Chrome': 80,
            'Firefox': 70,
            'Safari': 13,
            'Edge': 80
        };
        
        if (modernBrowsers[name] && versionNum >= modernBrowsers[name]) {
            return true;
        }
        
        return false;
    }

    /**
     * 获取浏览器信息
     */
    getBrowserInfo() {
        const ua = navigator.userAgent;
        let browserName = 'Unknown';
        let browserVersion = 'Unknown';
        
        if (ua.indexOf('Chrome') > -1) {
            browserName = 'Chrome';
            const match = ua.match(/Chrome\/(\d+)/);
            browserVersion = match ? match[1] : 'Unknown';
        } else if (ua.indexOf('Firefox') > -1) {
            browserName = 'Firefox';
            const match = ua.match(/Firefox\/(\d+)/);
            browserVersion = match ? match[1] : 'Unknown';
        } else if (ua.indexOf('Safari') > -1) {
            browserName = 'Safari';
            const match = ua.match(/Version\/(\d+)/);
            browserVersion = match ? match[1] : 'Unknown';
        } else if (ua.indexOf('Edge') > -1) {
            browserName = 'Edge';
            const match = ua.match(/Edge\/(\d+)/);
            browserVersion = match ? match[1] : 'Unknown';
        } else if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) {
            browserName = 'Internet Explorer';
            const match = ua.match(/(?:MSIE |rv:)(\d+)/);
            browserVersion = match ? match[1] : 'Unknown';
        }
        
        return {
            name: browserName,
            version: browserVersion,
            userAgent: ua
        };
    }
    
    /**
     * 检查API连接
     */
    async checkAPIConnection() {
        try {
            const health = await window.apiService.getHealth();
            console.log('API连接正常:', health);
            return true;
        } catch (error) {
            console.warn('API连接失败，将在离线模式下运行:', error);
            // 设置离线模式标志
            window.isOfflineMode = true;
            return false;
        }
    }
    
    /**
     * 加载用户设置
     */
    loadUserSettings() {
        const settings = Storage.get('dearDiarySettings', {
            theme: 'pink',
            enableReminders: true,
            defaultReminderOffset: 15,
            language: 'en-AU'
        });
        
        // 应用主题设置
        this.applyTheme(settings.theme);
        
        // 保存设置到全局
        window.userSettings = settings;
        
        console.log('用户设置已加载:', settings);
    }

    /**
     * 应用主题
     */
    applyTheme(themeName) {
        document.documentElement.setAttribute('data-theme', themeName);
    }
    
    /**
     * 设置全局事件监听器
     */
    setupGlobalEventListeners() {
        // 错误处理
        window.addEventListener('error', this.handleError);
        window.addEventListener('unhandledrejection', this.handleError);
        
        // 页面卸载前处理
        window.addEventListener('beforeunload', this.handleBeforeUnload);
        
        // 页面可见性变化
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        
        // 键盘快捷键
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
        
        console.log('全局事件监听器已设置');
    }
    
    /**
     * 处理全局错误
     */
    handleError(event) {
        console.error('全局错误:', event);
        
        let message = '应用出现错误';
        
        if (event.error) {
            message = event.error.message || message;
        } else if (event.reason) {
            message = event.reason.message || event.reason || message;
        }
        
        // 显示用户友好的错误消息
        Notification.error(`出现错误: ${message}`);
        
        // 可以在这里添加错误上报逻辑
        this.reportError(event);
    }
    
    /**
     * 处理页面卸载前事件
     */
    handleBeforeUnload(event) {
        // 如果有未保存的数据，提醒用户
        if (window.ui && window.ui.currentData && (window.ui.currentData.diary || window.ui.currentData.todos)) {
            event.preventDefault();
            event.returnValue = '您有未保存的数据，确定要离开吗？';
            return event.returnValue;
        }
    }
    
    /**
     * 处理页面可见性变化
     */
    handleVisibilityChange() {
        if (document.hidden) {
            console.log('页面隐藏');
            // 页面隐藏时可以暂停一些操作
        } else {
            console.log('页面显示');
            // 页面显示时可以恢复操作或刷新数据
            // 在离线模式下跳过统计数据加载
            if (window.ui && window.ui.loadStatistics && !window.isOfflineMode) {
                window.ui.loadStatistics();
            }
        }
    }
    
    /**
     * 处理键盘快捷键
     */
    handleKeyboardShortcuts(event) {
        // Ctrl/Cmd + Enter: 处理输入
        if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
            if (window.ui && window.ui.elements.userInput === document.activeElement) {
                event.preventDefault();
                window.ui.processInput();
            }
        }
        
        // Ctrl/Cmd + L: 清空输入
        if ((event.ctrlKey || event.metaKey) && event.key === 'l') {
            if (window.ui && window.ui.elements.userInput === document.activeElement) {
                event.preventDefault();
                window.ui.clearInput();
            }
        }
        
        // Escape: 关闭模态框
        if (event.key === 'Escape') {
            if (window.ui && window.ui.elements.modalOverlay && !window.ui.elements.modalOverlay.classList.contains('hidden')) {
                window.ui.closeModal();
            }
        }
    }
    
    /**
     * 显示欢迎消息
     */
    showWelcomeMessage(compatibilityMode = false) {
        // 检查是否是首次访问
        const isFirstVisit = !this.getStorageItem('hasVisited', false);
        
        if (isFirstVisit) {
            setTimeout(() => {
                let message = '欢迎使用 Dear Diary！开始记录你的精彩生活吧 📝';
                if (compatibilityMode) {
                    message += ' (兼容模式已启用)';
                }
                
                if (window.Notification && window.Notification.info) {
                    Notification.info(message, 5000);
                } else {
                    console.log(message);
                }
                
                this.setStorageItem('hasVisited', true);
            }, 1000);
        }
    }
    
    /**
     * 安全的本地存储操作
     */
    getStorageItem(key, defaultValue) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('读取本地存储失败:', error);
            return defaultValue;
        }
    }
    
    setStorageItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.warn('写入本地存储失败:', error);
        }
    }
    
    /**
     * 处理初始化错误
     */
    handleInitializationError(error) {
        const errorMessage = `
            <div style="text-align: center; padding: 2rem; background: #fee; border: 1px solid #fcc; border-radius: 8px; margin: 2rem;">
                <h2 style="color: #c33;">应用启动失败</h2>
                <p>Dear Diary 在启动过程中遇到问题：</p>
                <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; text-align: left;">${error.message}</pre>
                <button onclick="location.reload()" style="background: #667eea; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
                    重新加载
                </button>
            </div>
        `;
        
        document.body.innerHTML = errorMessage;
    }
    
    /**
     * 上报错误（可选）
     */
    reportError(event) {
        // 这里可以添加错误上报到服务器的逻辑
        // 例如发送到 Sentry、LogRocket 等错误监控服务
        console.log('错误已记录，可以在这里添加上报逻辑');
    }
    
    /**
     * 获取应用状态
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
     * 重启应用
     */
    async restart() {
        console.log('重启应用...');
        
        // 清理现有状态
        if (window.speechManager) {
            window.speechManager.destroy();
        }
        
        // 重新初始化
        return await this.init();
    }
    
    /**
     * 销毁应用
     */
    destroy() {
        console.log('销毁应用...');
        
        // 移除事件监听器
        window.removeEventListener('error', this.handleError);
        window.removeEventListener('unhandledrejection', this.handleError);
        window.removeEventListener('beforeunload', this.handleBeforeUnload);
        document.removeEventListener('visibilitychange', this.handleVisibilityChange);
        
        // 销毁组件
        if (window.speechManager) {
            window.speechManager.destroy();
        }
        
        this.isInitialized = false;
        console.log('应用已销毁');
    }
}

/**
 * 应用启动函数
 */
async function startApp() {
    // 等待DOM加载完成
    if (document.readyState === 'loading') {
        await new Promise(resolve => {
            document.addEventListener('DOMContentLoaded', resolve);
        });
    }
    
    // 创建并启动应用
    window.app = new DearDiaryApp();
    const success = await window.app.init();
    
    if (success) {
        console.log('🎉 Dear Diary 启动成功！');
    } else {
        console.error('❌ Dear Diary 启动失败！');
    }
    
    return success;
}

/**
 * 页面加载完成后自动启动应用
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}

// 导出应用类（如果在模块环境中）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DearDiaryApp;
}