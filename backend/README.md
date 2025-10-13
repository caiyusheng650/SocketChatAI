# Labixiaoxin 智能对话平台后端服务

![Node.js Version](https://img.shields.io/badge/node-%3E%3D14-brightgreen)
![MongoDB](https://img.shields.io/badge/MongoDB-4.4%2B-green)

## 项目概述
基于Node.js的智能对话平台后端，提供用户认证、对话管理、消息处理及AI交互功能，支持实时通信和流式响应。

## 功能特性
- 用户认证与授权 (JWT)
- 实时聊天功能 (Socket.IO)
- MongoDB数据库集成
- AI聊天机器人集成

## 环境要求
- Node.js 14+ 
- MongoDB 4.4+
- OpenSSL (用于HTTPS证书生成)
- AI服务API密钥 ([获取方式](https://platform.siliconflow.com))

## 快速开始

### 本地开发
```bash
git clone https://github.com/your-org/labixiaoxin.git
cd backend
npm install
cp .env.example .env
```

### 生成SSL证书
```bash
mkdir -p ssl
openssl req -x509 -newkey rsa:4096 -keyout ssl/private.key -out ssl/certificate.crt -days 365 -nodes
```

1. 克隆项目到本地：
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. 安装依赖：
   ```bash
   npm install
   ```

3. 配置环境变量：
   复制 `.env.example` 文件并重命名为 `.env`，然后根据你的环境配置相应的值：
   ```bash
   cp .env.example .env
   ```
   
   在 `.env` 文件中配置以下环境变量：
   ```env
   # 服务器配置
   PORT=729
   SSL_KEY_PATH=ssl/private.key
   SSL_CERT_PATH=ssl/certificate.crt
   BACKEND_URL=http://localhost:729

   # JWT密钥 (生产环境中应使用强随机字符串)
   JWT_SECRET=your-super-secret-jwt-key-change-in-production

   # MongoDB数据库配置
   MONGODB_URI=your-mongodb-uri-here

   # AI服务配置
   AI_API_KEY=your-ai-api-key-here
   AI_MODEL=Qwen/Qwen3-235B-A23B-Instruct-2507
   AI_API_URL=https://api.siliconflow.cn/v1/chat/completions

   # 新增配置
   USE_MOCK_AI=false
   FAIL_SILENTLY_ON_AI_ERROR=true
   NODE_ENV=development
   ```

4. 启动服务器：
   ```bash
   npm start
   ```

## API文档

### 认证接口
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "Test@1234"
}
```

### 消息流式响应
```javascript
socket.on('aiResponseToken', (data) => {
  console.log('AI响应片段:', data.content);
});
```
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/conversations` - 创建新对话
- `GET /api/conversations` - 获取用户所有对话
- `GET /api/conversations/:id` - 获取特定对话
- `PUT /api/conversations/:id` - 更新对话信息
- `DELETE /api/conversations/:id` - 删除对话
- `GET /api/conversations/:id/messages` - 获取对话中的所有消息
- `GET /api/conversations/user/:userId` - 获取特定用户的所有对话
- `POST /api/messages/system` - 创建系统消息
- `GET /api/messages/history` - 获取消息历史记录
- `GET /api/messages/:id` - 获取特定消息
- `POST /api/messages/send` - 发送消息到AI
- `GET /api/messages/conversation/:conversationId` - 获取特定对话中的消息

## Socket.IO事件
- `authenticate` - 用户认证
- `authenticated` - 认证结果
- `message` - 接收新消息
- `aiResponseStart` - AI响应开始
- `aiResponseToken` - AI响应的每个文本片段
- `aiResponseEnd` - AI响应结束
- `aiResponseError` - AI响应错误

## 开发指南

### 测试规范
```bash
npm test -- --coverage  # 生成测试覆盖率报告
```

### 代码提交
遵循[Conventional Commits](https://www.conventionalcommits.org)规范：
```bash
git commit -m "feat(messages): 添加消息加密存储功能"
```

## 贡献指南
欢迎通过Issue提交问题或PR贡献代码，请确保：
1. 通过ESLint检查
2. 包含单元测试
3. 更新相关文档

## 许可证
[MIT License](LICENSE)

## 项目结构
```
backend/
├── services/
│   ├── aiService.js        # AI流式响应处理
│   ├── messageService.js   # 消息加密存储
│   └── socketService.js    # WebSocket连接管理
├── middlewares/
│   ├── auth.js             # JWT验证中间件
│   └── errorHandler.js     # 统一错误处理
└── utils/
    ├── validation.js       # 请求参数校验
    └── logger.js           # 分级日志系统
```
```
backend/
├── .env                    # 环境变量配置（不应提交到版本控制）
├── .env.example            # 环境变量配置模板
├── .gitignore              # Git忽略文件配置
├── README.md               # 项目说明文档
├── httpsServer.js          # HTTPS服务器配置
├── package.json            # 项目依赖和脚本
├── server.js               # 主服务器文件
├── test.js                 # 测试入口文件
├── models/                 # 数据模型
│   ├── Conversation.js     # 对话模型
│   ├── Message.js          # 消息模型
│   └── User.js             # 用户模型
├── routes/                 # API路由
│   ├── authRoutes.js       # 认证相关路由
│   ├── conversationRoutes.js # 对话相关路由
│   └── messageRoutes.js    # 消息相关路由
├── services/               # 业务逻辑服务
│   ├── aiService.js        # AI服务
│   ├── conversationService.js # 对话服务
│   ├── dbService.js        # 数据库服务
│   └── messageService.js   # 消息服务
├── ssl/                    # SSL证书文件夹（不应提交到版本控制）
└── tests/                  # 测试文件
    ├── auth-login.test.js  # 认证测试
    ├── conversation.test.js # 对话测试
    ├── message.test.js     # 消息测试
    └── socket-ai-stream.test.js # Socket AI流式响应测试
```