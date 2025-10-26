// Utility functions library

// Date formatting
function formatDate(date, format = 'short') {
    const d = new Date(date);
    
    if (isNaN(d.getTime())) {
        return window.i18n ? window.i18n.t('invalid_date', '无效日期') : '无效日期';
    }
    
    const currentLang = window.i18n ? window.i18n.currentLanguage : 'zh';
    const locale = currentLang === 'en' ? 'en-US' : 'zh-CN';
    
    const options = {
        short: { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
        },
        date: { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit' 
        },
        long: { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            weekday: 'long'
        },
        time: { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
        },
        datetime: {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        }
    };
    
    return d.toLocaleDateString(locale, options[format] || options.short);
}

function getRelativeTime(date) {
    const now = new Date();
    const target = new Date(date);
    const diffMs = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.ceil(diffMs / (1000 * 60));
    
    if (diffMs < 0) {
        const absDays = Math.abs(diffDays);
        const absHours = Math.abs(diffHours);
        const absMinutes = Math.abs(diffMinutes);
        
        if (absDays > 0) return `${absDays}天前`;
        if (absHours > 0) return `${absHours}小时前`;
        if (absMinutes > 0) return `${absMinutes}分钟前`;
        return '刚刚';
    } else {
        if (diffDays > 0) return `${diffDays}天后`;
        if (diffHours > 0) return `${diffHours}小时后`;
        if (diffMinutes > 0) return `${diffMinutes}分钟后`;
        return '现在';
    }
}

// Function utilities
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Object utilities
function deepClone(obj) {
    if (obj === null || typeof obj !== "object") return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === "object") {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// String utilities
function isEmpty(str) {
    return !str || str.trim().length === 0;
}

function truncateText(text, maxLength = 100, suffix = '...') {
    if (!text || text.length <= maxLength) return text;
    return text.substr(0, maxLength - suffix.length) + suffix;
}

// UI helper functions
function getPriorityClass(priority) {
    const priorityMap = {
        'high': 'high',
        'medium': 'medium',
        'low': 'low'
    };
    return priorityMap[priority] || 'medium';
}

function getPriorityIcon(priority) {
    const iconMap = {
        'high': 'fas fa-exclamation-circle',
        'medium': 'fas fa-minus-circle',
        'low': 'fas fa-check-circle'
    };
    return iconMap[priority] || 'fas fa-minus-circle';
}

function getMoodIcon(mood) {
    const moodMap = {
        '开心': 'fas fa-smile',
        '高兴': 'fas fa-grin',
        '兴奋': 'fas fa-grin-stars',
        '平静': 'fas fa-meh',
        '满足': 'fas fa-smile-beam',
        '疲惫': 'fas fa-tired',
        '难过': 'fas fa-frown',
        '生气': 'fas fa-angry',
        '焦虑': 'fas fa-dizzy',
        '困惑': 'fas fa-question'
    };
    return moodMap[mood] || 'fas fa-meh';
}

// Local storage utility
const Storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Failed to save to local storage:', error);
        }
    },
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Failed to read from local storage:', error);
            return defaultValue;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Failed to remove from local storage:', error);
        }
    },
    
    clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Failed to clear local storage:', error);
        }
    }
};

// Notification utility
const Notification = {
    container: null,
    
    init() {
        this.container = document.getElementById('notification');
        if (this.container) {
            this.container.querySelector('.notification-close').addEventListener('click', () => {
                this.hide();
            });
        }
    },
    
    show(message, type = 'info', duration = 3000) {
        if (!this.container) {
            console.log(`Notification: ${message}`);
            return;
        }
        
        this.container.className = `notification ${type}`;
        this.container.querySelector('.notification-message').textContent = message;
        this.container.classList.add('show');
        
        if (duration > 0) {
            setTimeout(() => {
                this.hide();
            }, duration);
        }
    },
    
    hide() {
        if (this.container) {
            this.container.classList.remove('show');
        }
    },
    
    success(message, duration = 3000) {
        this.show(message, 'success', duration);
    },
    
    error(message, duration = 5000) {
        this.show(message, 'error', duration);
    },
    
    warning(message, duration = 4000) {
        this.show(message, 'warning', duration);
    },
    
    info(message, duration = 3000) {
        this.show(message, 'info', duration);
    }
};

// DOM utility
const DOM = {
    find(selector, parent = document) {
        return parent.querySelector(selector);
    },
    
    findAll(selector, parent = document) {
        return parent.querySelectorAll(selector);
    },
    
    create(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        Object.keys(attributes).forEach(key => {
            if (key === 'className') {
                element.className = attributes[key];
            } else if (key === 'innerHTML') {
                element.innerHTML = attributes[key];
            } else {
                element.setAttribute(key, attributes[key]);
            }
        });
        
        if (content) {
            element.textContent = content;
        }
        
        return element;
    },
    
    addClass(element, className) {
        if (element) {
            element.classList.add(className);
        }
    },
    
    removeClass(element, className) {
        if (element) {
            element.classList.remove(className);
        }
    },
    
    toggleClass(element, className) {
        if (element) {
            element.classList.toggle(className);
        }
    },
    
    show(element) {
        if (element) {
            element.classList.remove('hidden');
        }
    },
    
    hide(element) {
        if (element) {
            element.classList.add('hidden');
        }
    }
};

// Loading state management
const Loading = {
    overlay: null,
    
    init() {
        this.overlay = document.getElementById('loadingOverlay');
    },
    
    show(message = 'AI正在分析你的内容...') {
        if (this.overlay) {
            const messageElement = this.overlay.querySelector('p');
            if (messageElement) {
                messageElement.textContent = message;
            }
            DOM.show(this.overlay);
        }
    },
    
    hide() {
        if (this.overlay) {
            DOM.hide(this.overlay);
        }
    }
};

// Module exports
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatDate,
        getRelativeTime,
        debounce,
        throttle,
        deepClone,
        generateId,
        isEmpty,
        truncateText,
        getPriorityClass,
        getPriorityIcon,
        getMoodIcon,
        Storage,
        Notification,
        DOM,
        Loading
    };
}