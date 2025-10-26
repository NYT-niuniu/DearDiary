/**
 * 语音识别服务
 * 使用Web Speech API实现语音转文字功能
 */
class SpeechService {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.isSupported = false;
        this.finalTranscript = '';
        this.interimTranscript = '';
        
        // 回调函数
        this.onStart = null;
        this.onEnd = null;
        this.onResult = null;
        this.onError = null;
        this.onInterimResult = null;
        
        this.init();
    }
    
    /**
     * 初始化语音识别
     */
    init() {
        // 检查浏览器支持
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.isSupported = true;
        } else if ('SpeechRecognition' in window) {
            this.recognition = new SpeechRecognition();
            this.isSupported = true;
        } else {
            console.warn('当前浏览器不支持语音识别');
            this.isSupported = false;
            return;
        }
        
        this.setupRecognition();
    }
    
    /**
     * 配置语音识别
     */
    setupRecognition() {
        if (!this.recognition) return;
        
        // 基本配置
        this.recognition.continuous = true;           // 持续监听
        this.recognition.interimResults = true;       // 返回临时结果
        this.recognition.lang = 'zh-CN';             // 设置语言为中文
        this.recognition.maxAlternatives = 1;        // 最大候选结果数
        
        // 事件监听器
        this.recognition.onstart = () => {
            this.isListening = true;
            console.log('语音识别开始');
            if (this.onStart) this.onStart();
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            console.log('语音识别结束');
            if (this.onEnd) this.onEnd();
        };
        
        this.recognition.onresult = (event) => {
            this.handleResult(event);
        };
        
        this.recognition.onerror = (event) => {
            console.error('语音识别错误:', event.error);
            this.isListening = false;
            
            let errorMessage = '语音识别出现错误';
            switch (event.error) {
                case 'no-speech':
                    errorMessage = '没有检测到语音，请重试';
                    break;
                case 'audio-capture':
                    errorMessage = '无法访问麦克风，请检查权限设置';
                    break;
                case 'not-allowed':
                    errorMessage = '未授权访问麦克风，请允许麦克风权限';
                    break;
                case 'network':
                    errorMessage = '网络连接问题，请检查网络设置';
                    break;
                case 'service-not-allowed':
                    errorMessage = '语音识别服务不可用';
                    break;
                default:
                    errorMessage = `语音识别错误: ${event.error}`;
            }
            
            if (this.onError) this.onError(errorMessage);
        };
        
        this.recognition.onnomatch = () => {
            console.log('没有识别到匹配的语音');
            if (this.onError) this.onError('没有识别到清晰的语音，请重试');
        };
    }
    
    /**
     * 处理识别结果
     */
    handleResult(event) {
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
                finalTranscript += transcript;
            } else {
                interimTranscript += transcript;
            }
        }
        
        this.finalTranscript += finalTranscript;
        this.interimTranscript = interimTranscript;
        
        // 触发回调
        if (finalTranscript && this.onResult) {
            this.onResult(this.finalTranscript);
        }
        
        if (interimTranscript && this.onInterimResult) {
            this.onInterimResult(interimTranscript);
        }
        
        console.log('最终结果:', this.finalTranscript);
        console.log('临时结果:', this.interimTranscript);
    }
    
    /**
     * 开始语音识别
     */
    start() {
        if (!this.isSupported) {
            if (this.onError) this.onError('当前浏览器不支持语音识别功能');
            return false;
        }
        
        if (this.isListening) {
            console.log('语音识别已在进行中');
            return false;
        }
        
        // 重置转录结果
        this.finalTranscript = '';
        this.interimTranscript = '';
        
        try {
            this.recognition.start();
            return true;
        } catch (error) {
            console.error('启动语音识别失败:', error);
            if (this.onError) this.onError('启动语音识别失败，请重试');
            return false;
        }
    }
    
    /**
     * 停止语音识别
     */
    stop() {
        if (!this.recognition || !this.isListening) {
            return false;
        }
        
        try {
            this.recognition.stop();
            return true;
        } catch (error) {
            console.error('停止语音识别失败:', error);
            return false;
        }
    }
    
    /**
     * 获取完整的转录结果
     */
    getFullTranscript() {
        return this.finalTranscript + this.interimTranscript;
    }
    
    /**
     * 获取最终转录结果
     */
    getFinalTranscript() {
        return this.finalTranscript;
    }
    
    /**
     * 清除转录结果
     */
    clearTranscript() {
        this.finalTranscript = '';
        this.interimTranscript = '';
    }
    
    /**
     * 检查是否支持语音识别
     */
    checkSupport() {
        return this.isSupported;
    }
    
    /**
     * 获取当前状态
     */
    getStatus() {
        return {
            isSupported: this.isSupported,
            isListening: this.isListening,
            hasTranscript: this.finalTranscript.length > 0
        };
    }
    
    /**
     * 设置语言
     */
    setLanguage(lang) {
        if (this.recognition) {
            this.recognition.lang = lang;
        }
    }
    
    /**
     * 设置配置选项
     */
    setConfig(options) {
        if (!this.recognition) return;
        
        if (options.continuous !== undefined) {
            this.recognition.continuous = options.continuous;
        }
        
        if (options.interimResults !== undefined) {
            this.recognition.interimResults = options.interimResults;
        }
        
        if (options.maxAlternatives !== undefined) {
            this.recognition.maxAlternatives = options.maxAlternatives;
        }
        
        if (options.lang !== undefined) {
            this.recognition.lang = options.lang;
        }
    }
}

/**
 * 语音识别管理器
 * 提供更高级的语音识别功能和UI集成
 */
class SpeechManager {
    constructor() {
        this.speechService = new SpeechService();
        this.elements = {};
        this.isInitialized = false;
        
        // 绑定方法上下文
        this.handleStart = this.handleStart.bind(this);
        this.handleEnd = this.handleEnd.bind(this);
        this.handleResult = this.handleResult.bind(this);
        this.handleError = this.handleError.bind(this);
        this.handleInterimResult = this.handleInterimResult.bind(this);
    }
    
    /**
     * 初始化语音管理器
     */
    init() {
        // 获取DOM元素
        this.elements = {
            startBtn: document.getElementById('startRecordBtn'),
            stopBtn: document.getElementById('stopRecordBtn'),
            status: document.getElementById('voiceStatus'),
            transcribedText: document.getElementById('transcribedText'),
            userInput: document.getElementById('userInput')
        };
        
        // 检查必要元素是否存在
        if (!this.elements.startBtn || !this.elements.stopBtn) {
            console.error('语音识别UI元素未找到');
            return false;
        }
        
        // 设置语音服务回调
        this.speechService.onStart = this.handleStart;
        this.speechService.onEnd = this.handleEnd;
        this.speechService.onResult = this.handleResult;
        this.speechService.onError = this.handleError;
        this.speechService.onInterimResult = this.handleInterimResult;
        
        // 绑定事件监听器
        this.elements.startBtn.addEventListener('click', () => this.startRecording());
        this.elements.stopBtn.addEventListener('click', () => this.stopRecording());
        
        // 检查支持性
        if (!this.speechService.checkSupport()) {
            this.updateStatus('当前浏览器不支持语音识别');
            this.elements.startBtn.disabled = true;
            return false;
        }
        
        this.updateStatus(window.i18n ? window.i18n.t('ready_to_record') : 'Ready to record...');
        this.isInitialized = true;
        return true;
    }
    
    /**
     * 开始录音
     */
    startRecording() {
        if (!this.isInitialized) {
            Notification.error('语音识别未初始化');
            return;
        }
        
        const success = this.speechService.start();
        if (!success) {
            this.updateStatus(window.i18n ? window.i18n.t('recording_failed') : 'Recording failed, please try again');
        }
    }
    
    /**
     * 停止录音
     */
    stopRecording() {
        if (!this.isInitialized) return;
        
        this.speechService.stop();
    }
    
    /**
     * 处理录音开始
     */
    handleStart() {
        this.updateStatus(window.i18n ? window.i18n.t('listening') : 'Listening... please speak');
        this.showStopButton();
        
        // 清空之前的转录文本并临时隐藏placeholder
        if (this.elements.transcribedText) {
            this.elements.transcribedText.value = '';
            // 添加录音中的CSS类来隐藏placeholder
            this.elements.transcribedText.classList.add('recording');
        }
    }
    
    /**
     * 处理录音结束
     */
    handleEnd() {
        this.updateStatus(window.i18n ? window.i18n.t('recording_ended') : 'Recording ended');
        this.showStartButton();
        
        // 恢复placeholder显示（如果没有内容的话）
        if (this.elements.transcribedText) {
            this.elements.transcribedText.classList.remove('recording');
        }
        
        // 将最终结果复制到文本输入框
        const finalText = this.speechService.getFinalTranscript();
        if (finalText && this.elements.userInput) {
            // 如果输入框已有内容，在后面追加
            const currentText = this.elements.userInput.value;
            const separator = currentText ? ' ' : '';
            this.elements.userInput.value = currentText + separator + finalText;
            
            // 触发输入事件
            this.elements.userInput.dispatchEvent(new Event('input'));
        }
        
        // 清除语音服务的转录缓存
        this.speechService.clearTranscript();
    }
    
    /**
     * 处理最终结果
     */
    handleResult(transcript) {
        if (this.elements.transcribedText) {
            this.elements.transcribedText.value = transcript;
        }
        
        // 更新语音处理按钮状态
        if (window.uiManager && window.uiManager.updateVoiceProcessButton) {
            window.uiManager.updateVoiceProcessButton();
        }
        
        console.log('语音识别结果:', transcript);
    }
    
    /**
     * 处理临时结果
     */
    handleInterimResult(transcript) {
        if (this.elements.transcribedText) {
            const finalText = this.speechService.getFinalTranscript();
            // 对于textarea，只显示文本内容，不使用HTML
            this.elements.transcribedText.value = finalText + transcript;
        }
    }
    
    /**
     * 处理错误
     */
    handleError(message) {
        this.updateStatus(`错误: ${message}`);
        this.showStartButton();
        Notification.error(message);
    }
    
    /**
     * 更新状态显示
     */
    updateStatus(status) {
        if (this.elements.status) {
            this.elements.status.textContent = status;
        }
    }
    
    /**
     * 显示开始按钮
     */
    showStartButton() {
        if (this.elements.startBtn && this.elements.stopBtn) {
            this.elements.startBtn.classList.remove('hidden');
            this.elements.stopBtn.classList.add('hidden');
        }
    }
    
    /**
     * 显示停止按钮
     */
    showStopButton() {
        if (this.elements.startBtn && this.elements.stopBtn) {
            this.elements.startBtn.classList.add('hidden');
            this.elements.stopBtn.classList.remove('hidden');
        }
    }
    
    /**
     * 获取状态
     */
    getStatus() {
        return this.speechService.getStatus();
    }
    
    /**
     * 销毁语音管理器
     */
    destroy() {
        if (this.speechService.isListening) {
            this.speechService.stop();
        }
        
        // 移除事件监听器
        if (this.elements.startBtn) {
            this.elements.startBtn.removeEventListener('click', this.startRecording);
        }
        if (this.elements.stopBtn) {
            this.elements.stopBtn.removeEventListener('click', this.stopRecording);
        }
        
        this.isInitialized = false;
    }
}

// 全局语音管理器实例
window.speechManager = new SpeechManager();