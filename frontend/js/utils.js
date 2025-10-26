// 工具函数库

/**
 * 格式化日期
 * @param {Date|string} date - 日期对象或ISO字符串
 * @param {string} format - 格式类型：'short', 'long', 'time'
 * @returns {string} 格式化后的日期字符串
 */
function formatDate(date, format = 'short') {
    const d = new Date(date);
    
    if (isNaN(d.getTime())) {
        return '无效日期';
    }
    
    const options = {
        short: { 
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
    
    return d.toLocaleDateString('zh-CN', options[format] || options.short);
}

/**
 * 计算相对时间
 * @param {Date|string} date - 日期
 * @returns {string} 相对时间描述
 */
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

/**
 * 防抖函数
 * @param {Function} func - 要防抖的函数
 * @param {number} wait - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
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

/**
 * 节流函数
 * @param {Function} func - 要节流的函数
 * @param {number} limit - 时间限制（毫秒）
 * @returns {Function} 节流后的函数
 */
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

/**
 * 深度克隆对象
 * @param {any} obj - 要克隆的对象
 * @returns {any} 克隆后的对象
 */
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

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 验证字符串是否为空
 * @param {string} str - 要验证的字符串
 * @returns {boolean} 是否为空
 */
function isEmpty(str) {
    return !str || str.trim().length === 0;
}

/**
 * 截断文本
 * @param {string} text - 原文本
 * @param {number} maxLength - 最大长度
 * @param {string} suffix - 后缀
 * @returns {string} 截断后的文本
 */
function truncateText(text, maxLength = 100, suffix = '...') {
    if (!text || text.length <= maxLength) return text;
    return text.substr(0, maxLength - suffix.length) + suffix;
}

/**
 * 获取优先级颜色类
 * @param {string} priority - 优先级
 * @returns {string} CSS类名
 */
function getPriorityClass(priority) {
    const priorityMap = {
        'high': 'high',
        'medium': 'medium',
        'low': 'low'
    };
    return priorityMap[priority] || 'medium';
}

/**
 * 获取优先级图标
 * @param {string} priority - 优先级
 * @returns {string} 图标类名
 */
function getPriorityIcon(priority) {
    const iconMap = {
        'high': 'fas fa-exclamation-circle',
        'medium': 'fas fa-minus-circle',
        'low': 'fas fa-check-circle'
    };
    return iconMap[priority] || 'fas fa-minus-circle';
}

/**
 * 获取心情图标
 * @param {string} mood - 心情
 * @returns {string} 图标类名
 */
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

/**
 * 本地存储工具
 */
const Storage = {
    /**
     * 保存数据到本地存储
     * @param {string} key - 键名
     * @param {any} value - 值
     */
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('保存到本地存储失败:', error);
        }
    },
    
    /**
     * 从本地存储获取数据
     * @param {string} key - 键名
     * @param {any} defaultValue - 默认值
     * @returns {any} 存储的值或默认值
     */
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('从本地存储读取失败:', error);
            return defaultValue;
        }
    },
    
    /**
     * 从本地存储删除数据
     * @param {string} key - 键名
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('从本地存储删除失败:', error);
        }
    },
    
    /**
     * 清空本地存储
     */
    clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('清空本地存储失败:', error);
        }
    }
};

/**
 * 通知工具
 */
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
    
    /**
     * 显示通知
     * @param {string} message - 消息内容
     * @param {string} type - 通知类型：success, error, warning, info
     * @param {number} duration - 持续时间（毫秒），0表示不自动隐藏
     */
    show(message, type = 'info', duration = 3000) {
        if (!this.container) {
            console.log(`通知: ${message}`);
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
    
    /**
     * 隐藏通知
     */
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

/**
 * DOM工具
 */
const DOM = {
    /**
     * 查找元素
     * @param {string} selector - CSS选择器
     * @param {Element} parent - 父元素
     * @returns {Element|null} 找到的元素
     */
    find(selector, parent = document) {
        return parent.querySelector(selector);
    },
    
    /**
     * 查找所有匹配的元素
     * @param {string} selector - CSS选择器
     * @param {Element} parent - 父元素
     * @returns {NodeList} 找到的元素列表
     */
    findAll(selector, parent = document) {
        return parent.querySelectorAll(selector);
    },
    
    /**
     * 创建元素
     * @param {string} tag - 标签名
     * @param {Object} attributes - 属性对象
     * @param {string} content - 内容
     * @returns {Element} 创建的元素
     */
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
    
    /**
     * 添加类
     * @param {Element} element - 元素
     * @param {string} className - 类名
     */
    addClass(element, className) {
        if (element) {
            element.classList.add(className);
        }
    },
    
    /**
     * 移除类
     * @param {Element} element - 元素
     * @param {string} className - 类名
     */
    removeClass(element, className) {
        if (element) {
            element.classList.remove(className);
        }
    },
    
    /**
     * 切换类
     * @param {Element} element - 元素
     * @param {string} className - 类名
     */
    toggleClass(element, className) {
        if (element) {
            element.classList.toggle(className);
        }
    },
    
    /**
     * 显示元素
     * @param {Element} element - 元素
     */
    show(element) {
        if (element) {
            element.classList.remove('hidden');
        }
    },
    
    /**
     * 隐藏元素
     * @param {Element} element - 元素
     */
    hide(element) {
        if (element) {
            element.classList.add('hidden');
        }
    }
};

/**
 * 加载状态管理
 */
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

// 导出所有工具函数（如果在模块环境中）
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