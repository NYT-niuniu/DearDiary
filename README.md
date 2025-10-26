# Dear Diary 智能日记助手

## 项目简介
Dear Diary是一个基于AI的智能日记应用，支持自然语言输入（语音或文字），自动生成格式化的日记内容，并智能提取待办事项，提供定时提醒功能。

## 功能特点
- 🎤 语音转文字输入
- 📝 智能日记内容生成
- ✅ 自动提取待办事项
- ⏰ 智能提醒系统
- 💾 本地数据存储
- 🎨 简洁易用的用户界面

## 技术栈
- 前端: HTML5, CSS3, JavaScript (Vanilla)
- 后端: Node.js, Express
- AI服务: Google AI (Gemini API)
- 语音识别: Web Speech API + Google Speech-to-Text
- 数据存储: JSON文件 + SQLite
- 提醒服务: Node-cron

## 项目结构
```
Dear-Diary/
├── frontend/           # 前端代码
│   ├── index.html     # 主页面
│   ├── css/           # 样式文件
│   ├── js/            # JavaScript文件
│   └── assets/        # 静态资源
├── backend/           # 后端代码
│   ├── server.js      # 主服务器
│   ├── routes/        # 路由文件
│   ├── services/      # 业务逻辑
│   └── models/        # 数据模型
├── config/            # 配置文件
├── data/              # 数据存储
└── package.json       # 项目依赖
```

## 快速开始
1. 安装依赖: `npm install`
2. 配置Google AI API密钥
3. 启动服务: `npm start`
4. 访问: http://localhost:3000

## 开发计划
- [x] 项目结构搭建
- [ ] Google AI API集成
- [ ] 语音输入功能
- [ ] 日记生成功能
- [ ] 待办事项提取
- [ ] 用户确认界面
- [ ] 定时提醒功能
- [ ] 数据存储和管理