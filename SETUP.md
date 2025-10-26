# Dear Diary - Setup Guide

## 📋 System Requirements

### Prerequisites
- **Node.js**: Version 16.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: Version 8.0.0 or higher (included with Node.js)
- **Modern Browser**: Chrome 60+, Firefox 55+, Safari 11+, or Edge 79+
- **Google AI API Key**: Required for AI-powered features ([Get one here](https://makersuite.google.com/app/apikey))

### Hardware Requirements
- **RAM**: Minimum 4GB (8GB recommended)
- **Storage**: 100MB free space
- **Network**: Internet connection for AI processing
- **Microphone**: For voice input functionality (optional)

## 🚀 Installation Guide

### Step 1: Download and Setup

#### Option A: Clone from Git
```bash
git clone https://github.com/NYT-niuniu/DearDiary.git
cd DearDiary
```

#### Option B: Download ZIP
1. Download the project ZIP file
2. Extract to your desired location
3. Open terminal/command prompt in the project folder

### Step 2: Install Dependencies
```bash
npm install
```

This will install all required packages including:
- Express.js server framework
- Google Generative AI client
- SQLite3 database
- Node-cron for scheduling
- And other essential dependencies

### Step 3: Configure Environment Variables

#### Create Environment File
```bash
# Windows
copy .env.example .env

# macOS/Linux
cp .env.example .env
```

#### Configure Your Settings
Edit the `.env` file with your specific configuration:

```env
# Environment configuration file
# Copy this file as .env and fill in your actual configuration values

# Google AI API configuration
GOOGLE_AI_API_KEY=your_actual_api_key_here

# Server configuration
PORT=3000
NODE_ENV=development

# Database configuration
DB_PATH=./data/diary.db

# Logging configuration
LOG_LEVEL=info

# Reminder service configuration
REMINDER_CHECK_INTERVAL=*/5 * * * *  # Check reminders every 5 minutes

# Application configuration
APP_NAME=Dear Diary
APP_VERSION=1.0.0
```

### Step 4: Get Google AI API Key

1. **Visit Google AI Studio**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account

2. **Create API Key**
   - Click "Create API Key"
   - Choose your Google Cloud project (or create new)
   - Copy the generated API key

3. **Configure API Key**
   - Paste the key into your `.env` file
   - Replace `your_actual_api_key_here` with your actual key

### Step 5: Start the Application

#### Production Mode
```bash
npm start
```

#### Development Mode (Auto-restart)
```bash
npm run dev
```

#### Test Mode
```bash
npm test
```

### Step 6: Access the Application

1. **Open your browser**
2. **Navigate to**: http://localhost:3000
3. **Grant permissions** for microphone access (for voice input)
4. **Start creating your diary entries!**

## 🔧 Configuration Options

### Environment Variables Reference

| Variable | Description | Default Value | Required |
|----------|-------------|---------------|----------|
| `GOOGLE_AI_API_KEY` | Google Gemini API key | None | ✅ Yes |
| `PORT` | Server port number | 3000 | ❌ No |
| `NODE_ENV` | Runtime environment | development | ❌ No |
| `DB_PATH` | SQLite database file path | ./data/diary.db | ❌ No |
| `LOG_LEVEL` | Logging verbosity | info | ❌ No |
| `REMINDER_CHECK_INTERVAL` | Cron pattern for reminders | */5 * * * * | ❌ No |
| `APP_NAME` | Application name | Dear Diary | ❌ No |
| `APP_VERSION` | Application version | 1.0.0 | ❌ No |

### Database Configuration

The application uses SQLite for local data storage:
- **Database file**: `./data/diary.db` (created automatically)
- **Tables**: 
  - `diary_entries` - Stores diary entries
  - `todos` - Stores extracted tasks
  - `reminders` - Stores reminder configurations

### Port Configuration

If port 3000 is already in use:
1. Change `PORT` in `.env` file
2. Or set environment variable: `PORT=4000 npm start`

## 🎯 Feature Configuration

### Voice Input Setup

1. **Browser Permissions**
   - Allow microphone access when prompted
   - Check browser settings if voice input doesn't work

2. **Supported Browsers**
   - Chrome: Full support
   - Safari: Full support  
   - Firefox: Limited support
   - Edge: Full support

### Notification Setup

1. **Browser Notifications**
   - Allow notifications when prompted
   - Check browser notification settings

2. **System Notifications**
   - Windows: Automatic support
   - macOS: Automatic support
   - Linux: May require additional setup

### Theme Customization

The application includes 6 built-in themes:
- Pink (Default), Purple, Green, Warm, Cool, Gray
- Change theme in Settings → Theme Settings

### Language Configuration

- **Default**: English
- **Available**: English, Chinese
- **Switch**: Use language toggle in header

## 🛠️ Development Setup

### Additional Development Dependencies

For contributors and developers:

```bash
# Install development dependencies
npm install --include=dev

# Available scripts
npm run start    # Production mode
npm run dev      # Development with auto-restart
npm run test     # Run test suite
npm run build    # Build process (placeholder)
```

### Development Tools

- **Nodemon**: Auto-restart on file changes
- **Jest**: Testing framework
- **ESLint**: Code linting (can be added)
- **Prettier**: Code formatting (can be added)

### Project Structure Overview

```
dear-diary/
├── frontend/                 # Client-side files
│   ├── index.html           # Main HTML page
│   ├── css/style.css        # Styles and themes
│   └── js/                  # JavaScript modules
│       ├── api.js           # API communication
│       ├── app.js           # Main application
│       ├── i18n.js          # Internationalization
│       ├── speech.js        # Voice recognition
│       ├── ui.js            # User interface
│       └── utils.js         # Utility functions
├── backend/                 # Server-side files
│   ├── server.js           # Express server
│   ├── app.js              # App configuration
│   ├── models/database.js  # Database operations
│   ├── routes/             # API endpoints
│   └── services/           # Business logic
├── data/                   # Database storage
└── node_modules/           # Dependencies (auto-generated)
```

## � Troubleshooting

### Common Issues and Solutions

#### 1. Application Won't Start

**Error**: `Cannot find module` or similar
```bash
# Solution: Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Error**: `Port already in use`
```bash
# Solution: Change port or kill existing process
# Change port in .env file, or:
lsof -ti:3000 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :3000   # Windows
```

#### 2. AI Features Not Working

**Issue**: API key invalid
- Verify your Google AI API key is correct
- Check API quotas and billing in Google Cloud Console
- Ensure the key has proper permissions

**Issue**: Network errors
- Check internet connection
- Verify firewall settings
- Try different network if behind corporate firewall

#### 3. Voice Input Problems

**Issue**: Microphone not working
- Grant microphone permissions in browser
- Check system microphone settings
- Try a different browser

**Issue**: Voice recognition accuracy
- Speak clearly and at moderate pace
- Use a good quality microphone
- Minimize background noise

#### 4. Database Issues

**Issue**: Database connection errors
- Check file permissions in `data/` directory
- Ensure sufficient disk space
- Verify SQLite3 installation

**Issue**: Data not saving
- Check database file permissions
- Verify data directory exists
- Look for error messages in console

#### 5. Notification Problems

**Issue**: Reminders not showing
- Allow notifications in browser settings
- Check system notification settings
- Verify reminder service is running

### Debug Mode

Enable detailed logging:
```bash
LOG_LEVEL=debug npm start
```

### Health Check

Check system status:
```bash
curl http://localhost:3000/api/health
```

## 🔒 Security Considerations

### API Key Security
- **Never commit** `.env` file to version control
- **Rotate keys** regularly
- **Restrict API key** scope in Google Cloud Console
- **Monitor usage** to detect unauthorized access

### Data Privacy
- All diary data stored locally
- No automatic cloud backup
- Consider regular manual backups
- Database file contains personal information

### Network Security
- Use HTTPS in production environments
- Configure proper CORS settings
- Implement rate limiting for production
- Regular security updates for dependencies

## 📊 Performance Optimization

### For Better Performance

1. **Database Optimization**
   ```bash
   # Regular database maintenance
   sqlite3 data/diary.db "VACUUM;"
   ```

2. **Memory Management**
   - Restart application periodically
   - Monitor memory usage
   - Clear old data if needed

3. **Network Optimization**
   - Use caching for repeated AI requests
   - Optimize image assets
   - Enable gzip compression

## � Maintenance Tasks

### Regular Maintenance

1. **Weekly**
   - Check disk space
   - Review error logs
   - Test key features

2. **Monthly**
   - Update dependencies: `npm audit fix`
   - Backup database file
   - Check API usage quotas

3. **Quarterly**
   - Review and rotate API keys
   - Update Node.js version
   - Performance review

### Backup Strategy

```bash
# Backup database
cp data/diary.db backups/diary_$(date +%Y%m%d).db

# Backup configuration
cp .env backups/env_$(date +%Y%m%d).backup
```

## 🆘 Getting Help

### Support Channels

1. **Documentation**: Check this SETUP.md and README.md
2. **Health Check**: Visit http://localhost:3000/api/health
3. **Logs**: Check console output for error messages
4. **GitHub Issues**: Report bugs on the project repository

### Information to Include When Reporting Issues

- Operating system and version
- Node.js and npm versions
- Browser and version
- Error messages (full stack trace)
- Steps to reproduce the issue
- Expected vs actual behavior

### Useful Commands for Troubleshooting

```bash
# Check versions
node --version
npm --version

# Check running processes
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Test API endpoints
curl -X GET http://localhost:3000/api/health
curl -X POST http://localhost:3000/api/ai/analyze \
  -H "Content-Type: application/json" \
  -d '{"input":"test","language":"en"}'
```

---

## 🎉 Success!

If everything is working correctly, you should see:
- ✅ Server running on http://localhost:3000
- ✅ Database connection established
- ✅ AI service responding
- ✅ Voice input functional (with microphone permission)
- ✅ Notifications enabled

**Welcome to Dear Diary! Start creating your AI-powered diary entries.**