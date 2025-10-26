# Dear Diary - AI-Powered Smart Diary Assistant

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 Overview

Dear Diary is an intelligent diary application powered by Google AI that transforms your daily thoughts into beautifully formatted diary entries. It supports both voice and text input, automatically extracts tasks from your input, and provides smart reminder functionality.

## ✨ Key Features

- 🎤 **Voice-to-Text Input** - Natural speech recognition using Web Speech API
- 🤖 **AI-Powered Content Generation** - Google Gemini AI transforms your thoughts into structured diary entries
- ✅ **Smart Task Extraction** - Automatically identifies and extracts todos from your input
- ⏰ **Intelligent Reminders** - Smart notification system with customizable timing
- 🌍 **Multi-language Support** - Full internationalization with English/Chinese support
- 🎨 **Multiple Themes** - 6 beautiful color themes to personalize your experience
- 💾 **Local Data Storage** - Secure SQLite database for privacy
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Modern semantic markup
- **CSS3** - Responsive design with CSS Grid/Flexbox
- **Vanilla JavaScript** - ES6+ features, modular architecture
- **Web Speech API** - Browser-native voice recognition
- **FontAwesome** - Beautiful iconography

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **SQLite3** - Lightweight, file-based database
- **Google Generative AI** - Gemini API for content processing
- **Node-cron** - Task scheduling for reminders
- **Node-notifier** - Cross-platform notifications

### Development Tools
- **Nodemon** - Development auto-restart
- **Jest** - Testing framework
- **Dotenv** - Environment variable management

## 📁 Project Structure

```
dear-diary/
├── frontend/                 # Client-side application
│   ├── index.html           # Main application page
│   ├── css/
│   │   └── style.css        # Responsive styles and themes
│   └── js/
│       ├── api.js           # API communication layer
│       ├── app.js           # Application entry point
│       ├── i18n.js          # Internationalization
│       ├── speech.js        # Voice recognition service
│       ├── ui.js            # UI controller and interactions
│       └── utils.js         # Utility functions
├── backend/                 # Server-side application
│   ├── server.js           # Express server setup
│   ├── app.js              # Application configuration
│   ├── models/
│   │   └── database.js     # SQLite database operations
│   ├── routes/
│   │   ├── api.js          # API route handlers
│   │   ├── diary.js        # Diary management routes
│   │   └── todos.js        # Todo management routes
│   └── services/
│       ├── ai.js           # Google AI integration
│       └── reminder.js     # Notification service
├── data/                   # Database storage
│   └── diary.db           # SQLite database file
├── .env.example           # Environment configuration template
├── package.json           # Project dependencies and scripts
└── README.md              # Project documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16.0.0 or higher
- npm 8.0.0 or higher
- Google AI API key ([Get one here](https://makersuite.google.com/app/apikey))
- Modern web browser with microphone access

### Installation

1. **Clone and Install**
   ```bash
   git clone https://github.com/NYT-niuniu/DearDiary.git
   cd DearDiary
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your Google AI API key:
   ```env
   GOOGLE_AI_API_KEY=your_google_ai_api_key_here
   ```

3. **Start the Application**
   ```bash
   npm start
   ```
   Visit http://localhost:3000

### Development Mode
```bash
npm run dev  # Auto-restart on file changes
```

## 📖 Usage Guide

### Creating a Diary Entry

1. **Choose Input Method**
   - Click "Voice Input" and speak naturally
   - Or click "Text Input" and type your thoughts

2. **Voice Input Process**
   - Click the microphone button
   - Speak about your day, plans, or thoughts
   - Review and edit the transcribed text if needed

3. **AI Processing**
   - Click "Generate Diary" 
   - AI analyzes your input and creates:
     - A formatted diary entry with weather, mood, and reflection
     - Extracted tasks and todos with priority levels

4. **Review and Confirm**
   - Review the generated content
   - Edit diary or todos if needed
   - Set reminders for important tasks
   - Save to your diary collection

### Managing Your Content

- **My Diary**: Browse all your diary entries by date
- **Todos**: View and manage extracted tasks
- **Settings**: Customize themes, reminders, and language

## 🔧 API Documentation

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | System health check |
| `POST` | `/api/ai/analyze` | Analyze user input with AI |
| `POST` | `/api/process` | Complete diary processing workflow |
| `POST` | `/api/confirm` | Save confirmed diary and todos |
| `GET` | `/api/diary` | Retrieve diary entries |
| `GET` | `/api/todos` | Retrieve todo items |
| `POST` | `/api/reminders/test` | Test notification system |

### Example API Usage

```javascript
// Analyze user input
const response = await fetch('/api/ai/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    input: "Today was amazing! I finished my project and need to call mom tomorrow.",
    language: "en"
  })
});

const result = await response.json();
// Returns: { diary: {...}, todos: [...] }
```

## 🎨 Themes and Customization

The application includes 6 beautiful themes:
- **Pink Theme** (Default) - Warm and friendly
- **Purple Theme** - Creative and inspiring
- **Green Theme** - Natural and calming
- **Warm Theme** - Cozy and comfortable
- **Cool Theme** - Professional and clean
- **Gray Theme** - Minimalist and elegant

## 🌍 Internationalization

Full support for:
- **English** - Complete interface and AI processing
- **Chinese** - 完整的界面和AI处理支持

## 🔐 Privacy and Security

- **Local Storage**: All data stored locally in SQLite database
- **No Cloud Sync**: Your diary entries never leave your device
- **API Security**: Google AI API calls are server-side only
- **Environment Protection**: Sensitive keys stored in `.env` files

## 🧪 Testing

```bash
npm test  # Run Jest test suite
```

## 📋 Browser Compatibility

| Browser | Version | Voice Input | Notifications |
|---------|---------|-------------|---------------|
| Chrome | 60+ | ✅ | ✅ |
| Firefox | 55+ | ⚠️ Limited | ✅ |
| Safari | 11+ | ✅ | ✅ |
| Edge | 79+ | ✅ | ✅ |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Generative AI](https://ai.google.dev/) for powerful content generation
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) for voice recognition
- [FontAwesome](https://fontawesome.com/) for beautiful icons
- DECO7281 course team for project guidance

## 📞 Support

For questions and support:
- Create an issue in this repository
- Check the [SETUP.md](SETUP.md) for detailed configuration
- Review the API health endpoint: `GET /api/health`

---
