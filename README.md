# Labixiaoxin 智能对话平台

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D14-brightgreen)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4.4%2B-green)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)

一个基于AI的智能对话平台，提供实时消息交流、流式响应和对话管理功能。支持Markdown渲染、代码高亮和数学公式显示，为用户带来流畅的智能交互体验。

## 🚀 项目概述

Labixiaoxin是一个全栈智能对话应用，结合了现代前端技术和强大的后端服务，为用户提供类似ChatGPT的交互体验。该项目采用前后端分离架构，支持实时消息流、多轮对话管理和AI响应生成。

## 🎯 功能特性

- **用户认证与授权**：基于JWT的安全身份验证系统
- **实时聊天功能**：利用Socket.IO实现消息的即时传递和流式响应
- **对话管理**：创建、重命名、删除对话，支持多轮对话历史记录
- **富文本支持**：Markdown渲染、代码高亮和数学公式显示
- **响应式设计**：适配不同屏幕尺寸的现代化UI界面
- **AI集成**：支持与SiliconFlow等AI服务集成，获取智能回复

## 🛠️ 技术栈

### 前端
- React 19
- Material-UI (MUI) 7
- Socket.IO-client
- React Router 7
- Axios
- React Markdown
- Highlight.js & KaTeX

### 后端
- Node.js
- Express 5
- MongoDB & Mongoose
- Socket.IO
- JWT (JSON Web Tokens)
- CORS
- Dotenv

## 🚦 快速开始

### 环境要求

- Node.js 14+ 
- MongoDB 4.4+ 
- Git
- AI服务API密钥 (如使用SiliconFlow)

### 1. 克隆项目

```bash
# 克隆仓库
git clone https://github.com/caiyusheng650/LabixiaoxinAI.git
cd labixiaoxin
```

### 2. 安装后端依赖

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑.env文件，配置MongoDB连接和AI服务等信息
```

### 3. 安装前端依赖

```bash
# 返回项目根目录
cd ..

# 进入前端目录
cd frontend

# 安装依赖
npm install
```

### 4. 启动开发服务器

#### 后端服务器

```bash
# 在backend目录下
npm start
# 或使用HTTPS
npm run https
```

后端服务器将在 http://localhost:729 启动。

#### 前端开发服务器

```bash
# 在frontend目录下
npm start
```

前端服务器将在 http://localhost:3000 启动。

## ⚙️ 配置说明

### 后端环境变量

在`backend/.env`文件中配置以下变量：

```env
# 服务器配置
PORT=729
SSL_KEY_PATH=ssl/private.key
SSL_CERT_PATH=ssl/certificate.crt
BACKEND_URL=http://localhost:729

# JWT密钥
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# MongoDB数据库配置
MONGODB_URI=your-mongodb-uri-here

# AI服务配置
AI_API_KEY=your-ai-api-key-here
AI_MODEL=Qwen/Qwen3-235B-A23B-Instruct-2507
AI_API_URL=https://api.siliconflow.cn/v1/chat/completions

# 其他配置
USE_MOCK_AI=false
FAIL_SILENTLY_ON_AI_ERROR=true
NODE_ENV=development
```

### 生成SSL证书

如果需要使用HTTPS，可以按照以下步骤生成自签名证书：

```bash
# 在backend目录下
mkdir -p ssl
openssl req -x509 -newkey rsa:4096 -keyout ssl/private.key -out ssl/certificate.crt -days 365 -nodes
```

## 📁 项目结构

```
├── backend/
│   ├── models/         # 数据模型定义
│   ├── routes/         # API路由
│   ├── services/       # 业务逻辑服务
│   ├── tests/          # 测试文件
│   ├── server.js       # 主服务器入口
│   └── httpsServer.js  # HTTPS服务器入口
├── frontend/
│   ├── public/         # 静态资源
│   └── src/
│       ├── components/ # React组件
│       ├── contexts/   # 上下文管理
│       ├── services/   # API服务
│       ├── utils/      # 工具函数
│       ├── App.js      # 应用主组件
│       └── index.js    # 前端入口
```

## 🔍 API文档

### 认证接口

- `POST /api/auth/login` - 用户登录
- `POST /api/auth/register` - 用户注册

### 对话接口

- `GET /api/conversations` - 获取用户对话列表
- `POST /api/conversations` - 创建新对话
- `PUT /api/conversations/:id` - 更新对话信息
- `DELETE /api/conversations/:id` - 删除对话

### 消息接口

- `GET /api/conversations/:id/messages` - 获取对话消息
- `POST /api/conversations/:id/messages` - 发送消息

## 🧪 测试

后端提供了多种测试脚本：

```bash
# 在backend目录下
npm test:auth           # 运行认证相关测试
npm test:message        # 运行消息相关测试
npm test:conversation   # 运行对话相关测试
npm test:socket         # 运行Socket.IO相关测试
npm test:stream         # 运行流式响应测试
```

## 🚀 部署

### 前端部署

```bash
# 在frontend目录下
npm run build
```

构建后的文件将生成在`frontend/build`目录，可以部署到任何静态文件服务器或CDN。

### 后端部署

后端可以部署到任何支持Node.js的平台，如Heroku、AWS、Vercel等。确保设置好环境变量。
