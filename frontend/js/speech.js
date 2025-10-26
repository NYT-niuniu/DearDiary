/**
 * Speech recognition service using Web Speech API
 */
class SpeechService {
    constructor() {
        this.recognition = null;
        this.isListening = false;
        this.isSupported = false;
        this.finalTranscript = '';
        this.interimTranscript = '';
        
        this.onStart = null;
        this.onEnd = null;
        this.onResult = null;
        this.onError = null;
        this.onInterimResult = null;
        
        this.init();
    }
    
    init() {
        if ('webkitSpeechRecognition' in window) {
            this.recognition = new webkitSpeechRecognition();
            this.isSupported = true;
        } else if ('SpeechRecognition' in window) {
            this.recognition = new SpeechRecognition();
            this.isSupported = true;
        } else {
            console.warn('Speech recognition not supported');
            this.isSupported = false;
            return;
        }
        
        this.setupRecognition();
    }
    
    setupRecognition() {
        if (!this.recognition) return;
        
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'zh-CN';
        this.recognition.maxAlternatives = 1;
        
        this.recognition.onstart = () => {
            this.isListening = true;
            console.log('Speech recognition started');
            if (this.onStart) this.onStart();
        };
        
        this.recognition.onend = () => {
            this.isListening = false;
            console.log('Speech recognition ended');
            if (this.onEnd) this.onEnd();
        };
        
        this.recognition.onresult = (event) => {
            this.handleResult(event);
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.isListening = false;
            
            let errorMessage = 'Speech recognition error';
            switch (event.error) {
                case 'no-speech':
                    errorMessage = 'No speech detected, please try again';
                    break;
                case 'audio-capture':
                    errorMessage = 'Cannot access microphone, check permissions';
                    break;
                case 'not-allowed':
                    errorMessage = 'Microphone access denied';
                    break;
                case 'network':
                    errorMessage = 'Network connection problem';
                    break;
                case 'service-not-allowed':
                    errorMessage = 'Speech recognition service unavailable';
                    break;
                default:
                    errorMessage = `Speech recognition error: ${event.error}`;
            }
            
            if (this.onError) this.onError(errorMessage);
        };
        
        this.recognition.onnomatch = () => {
            console.log('No clear speech recognized');
            if (this.onError) this.onError('No clear speech recognized, please try again');
        };
    }
    
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
        
        if (finalTranscript && this.onResult) {
            this.onResult(this.finalTranscript);
        }
        
        if (interimTranscript && this.onInterimResult) {
            this.onInterimResult(interimTranscript);
        }
        
        console.log('Final result:', this.finalTranscript);
        console.log('Interim result:', this.interimTranscript);
    }
    
    start() {
        if (!this.isSupported) {
            if (this.onError) this.onError('Speech recognition not supported');
            return false;
        }
        
        if (this.isListening) {
            console.log('Speech recognition already in progress');
            return false;
        }
        
        this.finalTranscript = '';
        this.interimTranscript = '';
        
        try {
            this.recognition.start();
            return true;
        } catch (error) {
            console.error('Failed to start speech recognition:', error);
            if (this.onError) this.onError('Failed to start speech recognition');
            return false;
        }
    }
    
    stop() {
        if (!this.recognition || !this.isListening) {
            return false;
        }
        
        try {
            this.recognition.stop();
            return true;
        } catch (error) {
            console.error('Failed to stop speech recognition:', error);
            return false;
        }
    }
    
    getFullTranscript() {
        return this.finalTranscript + this.interimTranscript;
    }
    
    getFinalTranscript() {
        return this.finalTranscript;
    }
    
    clearTranscript() {
        this.finalTranscript = '';
        this.interimTranscript = '';
    }
    
    checkSupport() {
        return this.isSupported;
    }
    
    getStatus() {
        return {
            isSupported: this.isSupported,
            isListening: this.isListening,
            hasTranscript: this.finalTranscript.length > 0
        };
    }
    
    setLanguage(lang) {
        if (this.recognition) {
            this.recognition.lang = lang;
        }
    }
    
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
 * Speech recognition manager with UI integration
 */
class SpeechManager {
    constructor() {
        this.speechService = new SpeechService();
        this.elements = {};
        this.isInitialized = false;
        
        this.handleStart = this.handleStart.bind(this);
        this.handleEnd = this.handleEnd.bind(this);
        this.handleResult = this.handleResult.bind(this);
        this.handleError = this.handleError.bind(this);
        this.handleInterimResult = this.handleInterimResult.bind(this);
    }
    
    init() {
        this.elements = {
            startBtn: document.getElementById('startRecordBtn'),
            stopBtn: document.getElementById('stopRecordBtn'),
            status: document.getElementById('voiceStatus'),
            transcribedText: document.getElementById('transcribedText'),
            userInput: document.getElementById('userInput')
        };
        
        if (!this.elements.startBtn || !this.elements.stopBtn) {
            console.error('Speech recognition UI elements not found');
            return false;
        }
        
        this.speechService.onStart = this.handleStart;
        this.speechService.onEnd = this.handleEnd;
        this.speechService.onResult = this.handleResult;
        this.speechService.onError = this.handleError;
        this.speechService.onInterimResult = this.handleInterimResult;
        
        this.elements.startBtn.addEventListener('click', () => this.startRecording());
        this.elements.stopBtn.addEventListener('click', () => this.stopRecording());
        
        if (!this.speechService.checkSupport()) {
            this.updateStatus('Speech recognition not supported');
            this.elements.startBtn.disabled = true;
            return false;
        }
        
        this.updateStatus(window.i18n ? window.i18n.t('ready_to_record') : 'Ready to record...');
        this.isInitialized = true;
        return true;
    }
    
    startRecording() {
        if (!this.isInitialized) {
            Notification.error('Speech recognition not initialized');
            return;
        }
        
        const success = this.speechService.start();
        if (!success) {
            this.updateStatus(window.i18n ? window.i18n.t('recording_failed') : 'Recording failed, please try again');
        }
    }
    
    stopRecording() {
        if (!this.isInitialized) return;
        
        this.speechService.stop();
    }
    
    handleStart() {
        this.updateStatus(window.i18n ? window.i18n.t('listening') : 'Listening... please speak');
        this.showStopButton();
        
        if (this.elements.transcribedText) {
            this.elements.transcribedText.value = '';
            this.elements.transcribedText.classList.add('recording');
        }
    }
    
    handleEnd() {
        this.updateStatus(window.i18n ? window.i18n.t('recording_ended') : 'Recording ended');
        this.showStartButton();
        
        if (this.elements.transcribedText) {
            this.elements.transcribedText.classList.remove('recording');
        }
        
        const finalText = this.speechService.getFinalTranscript();
        if (finalText && this.elements.userInput) {
            const currentText = this.elements.userInput.value;
            const separator = currentText ? ' ' : '';
            this.elements.userInput.value = currentText + separator + finalText;
            
            this.elements.userInput.dispatchEvent(new Event('input'));
        }
        
        this.speechService.clearTranscript();
    }
    
    handleResult(transcript) {
        if (this.elements.transcribedText) {
            this.elements.transcribedText.value = transcript;
        }
        
        if (window.uiManager && window.uiManager.updateVoiceProcessButton) {
            window.uiManager.updateVoiceProcessButton();
        }
        
        console.log('Speech recognition result:', transcript);
    }
    
    handleInterimResult(transcript) {
        if (this.elements.transcribedText) {
            const finalText = this.speechService.getFinalTranscript();
            this.elements.transcribedText.value = finalText + transcript;
        }
    }
    
    handleError(message) {
        this.updateStatus(`Error: ${message}`);
        this.showStartButton();
        Notification.error(message);
    }
    
    updateStatus(status) {
        if (this.elements.status) {
            this.elements.status.textContent = status;
        }
    }
    
    showStartButton() {
        if (this.elements.startBtn && this.elements.stopBtn) {
            this.elements.startBtn.classList.remove('hidden');
            this.elements.stopBtn.classList.add('hidden');
        }
    }
    
    showStopButton() {
        if (this.elements.startBtn && this.elements.stopBtn) {
            this.elements.startBtn.classList.add('hidden');
            this.elements.stopBtn.classList.remove('hidden');
        }
    }
    
    getStatus() {
        return this.speechService.getStatus();
    }
    
    destroy() {
        if (this.speechService.isListening) {
            this.speechService.stop();
        }
        
        if (this.elements.startBtn) {
            this.elements.startBtn.removeEventListener('click', this.startRecording);
        }
        if (this.elements.stopBtn) {
            this.elements.stopBtn.removeEventListener('click', this.stopRecording);
        }
        
        this.isInitialized = false;
    }
}

window.speechManager = new SpeechManager();