# Dear Diary 部署指南

## 📋 环境要求

### 系统要求
- Node.js 16.0.0 或更高版本
- npm 8.0.0 或更高版本
- 现代浏览器（Chrome 60+, Firefox 55+, Safari 11+, Edge 79+）

### API 要求
- Google AI API 密钥（Gemini API）

## 🚀 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 配置环境变量
复制环境变量模板：
```bash
copy .env.example .env
```

编辑 `.env` 文件，填入你的 Google AI API 密钥：
```env
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
PORT=3000
NODE_ENV=development
```

### 3. 获取 Google AI API 密钥
1. 访问 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 创建新的 API 密钥
3. 将密钥复制到 `.env` 文件中

### 4. 启动应用
```bash
npm start
```

应用将在 http://localhost:3000 启动

### 5. 开发模式（可选）
如果需要自动重启功能：
```bash
npm run dev
```

## 🔧 配置说明

### 环境变量详解
- `GOOGLE_AI_API_KEY`: Google AI API 密钥（必需）
- `PORT`: 服务器端口（默认: 3000）
- `NODE_ENV`: 运行环境（development/production）
- `DB_PATH`: 数据库文件路径（默认: ./data/diary.db）
- `REMINDER_CHECK_INTERVAL`: 提醒检查间隔（默认: 每分钟）

### 目录结构
```
Dear-Diary/
├── frontend/           # 前端文件
│   ├── index.html     # 主页面
│   ├── css/           # 样式文件
│   ├── js/            # JavaScript文件
│   └── assets/        # 静态资源
├── backend/           # 后端文件
│   ├── server.js      # 主服务器
│   ├── routes/        # API路由
│   ├── services/      # 业务逻辑
│   └── models/        # 数据模型
├── config/            # 配置文件
├── data/              # 数据存储
└── package.json       # 项目配置
```

## 📱 功能说明

### 核心功能
1. **智能日记生成**: 使用 Google AI 将用户输入转换为格式化日记
2. **语音输入**: 支持语音转文字输入（需要浏览器支持）
3. **待办事项提取**: 自动从用户输入中提取任务和计划
4. **智能提醒**: 为待办事项设置提醒时间
5. **数据管理**: 本地数据库存储日记和待办事项

### API 端点
- `GET /api/health` - 健康检查
- `POST /api/ai/analyze` - 分析用户输入
- `POST /api/process` - 完整处理流程
- `POST /api/confirm` - 确认保存数据
- `GET /api/diary` - 获取日记列表
- `GET /api/todos` - 获取待办事项
- `POST /api/reminders/test` - 测试提醒功能

## 🛠️ 开发指南

### 添加新功能
1. 后端 API: 在 `backend/routes/` 中添加新路由
2. 前端界面: 修改 `frontend/` 中的相应文件
3. 数据模型: 在 `backend/models/` 中定义数据结构

### 调试技巧
1. 查看浏览器控制台获取前端错误信息
2. 查看服务器控制台获取后端日志
3. 使用 `GET /api/health` 检查系统状态

### 常见问题

#### 1. 语音识别不工作
- 确保浏览器支持 Web Speech API
- 检查麦克风权限设置
- 尝试使用 HTTPS 连接

#### 2. AI 生成失败
- 检查 Google AI API 密钥是否正确
- 确保网络连接正常
- 查看 API 配额是否充足

#### 3. 提醒不显示
- 检查浏览器通知权限
- 确保提醒服务已启动
- 验证系统时间设置

#### 4. 数据保存失败
- 检查数据库文件权限
- 确保磁盘空间充足
- 查看后端错误日志

## 🔒 安全建议

1. **API 密钥安全**:
   - 不要将 `.env` 文件提交到版本控制
   - 定期轮换 API 密钥
   - 限制 API 密钥的使用范围

2. **数据安全**:
   - 定期备份数据库文件
   - 考虑加密敏感数据
   - 限制数据库文件访问权限

3. **网络安全**:
   - 生产环境使用 HTTPS
   - 配置适当的 CORS 策略
   - 实施请求频率限制

## 📊 监控和维护

### 日志文件
- 应用日志: 控制台输出
- 错误日志: 浏览器控制台 + 服务器控制台
- 数据库日志: SQLite 日志

### 性能优化
1. 定期清理过期数据
2. 优化数据库查询
3. 压缩前端资源
4. 实施缓存策略

### 备份策略
1. 定期备份数据库文件
2. 备份用户配置
3. 版本控制代码更改

## 🆘 支持和帮助

如果遇到问题：

1. 检查本文档的常见问题部分
2. 查看应用健康状态: `GET /api/health`
3. 检查浏览器控制台错误
4. 查看服务器日志输出

## 📝 更新日志

### v1.0.0 (2024-10-26)
- 初始版本发布
- 基础日记生成功能
- 语音输入支持
- 待办事项提取
- 智能提醒系统
- 本地数据存储

---

**注意**: 这是一个演示项目，建议在生产环境使用前进行充分的测试和安全审查。