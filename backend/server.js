const dotenv = require('dotenv');
// 加载环境变量
dotenv.config();

const express = require('express');
const http = require('http');
const path = require('path');
const socketIo = require('socket.io');
const ss = require('socket.io-stream');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// 路由导入
const authRoutes = require('./routes/authRoutes');
const messageRoutes = require('./routes/messageRoutes');
const conversationRoutes = require('./routes/conversationRoutes');

// 服务导入
const MessageService = require('./services/messageService');
const messageService = new MessageService();
const ConversationService = require('./services/conversationService');
const conversationService = new ConversationService();

// 注意：如果需要定期清理频率限制记录，请在此处添加相应的实现
// 当前 MessageService 中没有 cleanupRateLimit 方法

// 连接MongoDB数据库
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('成功连接到MongoDB数据库');
  })
  .catch((error) => {
    console.error('连接MongoDB数据库失败:', error);
  });

// 创建Express应用
const app = express();

// 中间件
app.use(cors({
  origin: function (origin, callback) {
    // 允许没有 origin 的请求（比如移动应用或 Postman）
    if (!origin) return callback(null, true);
    
    // 允许本地开发环境
    if (origin === 'http://localhost:3000' || origin === 'https://localhost:3000') {
      return callback(null, true);
    }
    
    // 允许生产环境域名（根据实际情况修改）
    // 你可以在这里添加允许嵌入的域名
    const allowedOrigins = [
      'http://localhost:3000',
      'https://localhost:3000',
      // 添加你希望允许嵌入的域名，例如：
      'https://caiyusheng325.cn',
      'https://www.caiyusheng325.cn',
      'https://ai.caiyusheng325.cn'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // 允许携带凭证（cookies, authorization headers等）
}));
app.use(express.json());

// SSL证书配置（暂时禁用，使用HTTP）
// const sslOptions = {
//   key: fs.readFileSync(path.join(__dirname, 'ssl', 'caiyusheng325.cn.key')),
//   cert: fs.readFileSync(path.join(__dirname, 'ssl', 'caiyusheng325.cn.crt'))
// };

// 基本路由
app.get('/', (req, res) => {
  res.json({ message: 'AI应用后端服务器正在运行' });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', conversationRoutes);

// 创建HTTP服务器（暂时禁用HTTPS）
const server = http.createServer(app);
// const server = https.createServer(sslOptions, app); // HTTPS配置已注释

// 配置Socket.IO
const io = socketIo(server, {
  cors: {
    origin: function (origin, callback) {
      // 允许没有 origin 的请求（比如移动应用或 Postman）
      if (!origin) return callback(null, true);
      
      // 允许本地开发环境
      if (origin === 'http://localhost:3000' || origin === 'https://localhost:3000') {
        return callback(null, true);
      }
      
      // 允许生产环境域名（根据实际情况修改）
      // 你可以在这里添加允许嵌入的域名
      const allowedOrigins = [
        'http://localhost:3000',
        'https://localhost:3000',
        // 添加你希望允许嵌入的域名，例如：
        // 'https://yourdomain.com',
        // 'https://www.yourdomain.com'
      ];
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

// 存储用户连接状态
const userConnections = new Map(); // userId -> Set of socketIds

// 向用户的所有设备广播消息（排除发送者）
function broadcastToUserDevices(userId, event, data, from = null) {
  if (!userConnections.has(userId)) {
    return;
  }

  const userSocketIds = userConnections.get(userId);
  userSocketIds.forEach(socketId => {
    const targetSocket = io.sockets.sockets.get(socketId);
    targetSocket.emit(event, data);
  });
}

// Socket连接处理
io.on('connection', (socket) => {
  console.log('新客户端已连接:', socket.id);

  // 用户认证
  socket.on('authenticate', async (token) => {
    try {
      // 验证JWT令牌
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;

      // 记录用户连接
      if (!userConnections.has(socket.userId)) {
        userConnections.set(socket.userId, new Set());
      }
      userConnections.get(socket.userId).add(socket.id);

      console.log(`用户 ${socket.userId} 连接数: ${userConnections.get(socket.userId).size}`);
      socket.emit('authenticated', { success: true });
    } catch (error) {
      console.error('认证失败:', error.message);
      socket.emit('authenticated', { success: false, error: '认证失败' });
    }
  });

  // 创建新会话
  socket.on('create_conversation', async (data) => {
    try {
      // 验证用户是否已认证
      if (!socket.userId) {
        socket.emit('conversationError', { error: '用户未认证' });
        return;
      }

      // 创建新会话
      const conversation = await conversationService.createConversation(
        socket.userId,
        data.title
      );

      // 返回新创建的会话
      socket.emit('conversationCreated', { conversation });

      // 向用户的其他设备广播新会话创建
      broadcastToUserDevices(socket.userId, 'conversation_sync', {
        type: 'conversation_created',
        conversation: conversation
      }, socket.id);

    } catch (error) {
      console.error('创建会话时出错:', error);
      socket.emit('conversationError', { error: '创建会话时发生错误' });
    }
  });

  // 获取用户会话列表
  socket.on('get_conversations', async () => {
    try {
      // 验证用户是否已认证
      if (!socket.userId) {
        socket.emit('conversationError', { error: '用户未认证' });
        return;
      }

      // 获取会话列表
      const conversations = await conversationService.getConversationsByUser(socket.userId);

      // 返回会话列表
      socket.emit('conversations', { conversations });
    } catch (error) {
      console.error('获取会话列表时出错:', error);
      socket.emit('conversationError', { error: '获取会话列表时发生错误' });
    }
  });

  // 处理用户发送的消息（支持流式传输）
  socket.on('send_message', async (data) => {
    try {
      // 验证用户是否已认证
      if (!socket.userId) {
        socket.emit('messageError', { error: '用户未认证' });
        return;
      }

      // 验证消息数据
      if (!data.content || !data.conversationId) {
        socket.emit('messageError', { error: '消息内容或会话ID缺失' });
        return;
      }

      // 构造用户数据对象
      const userData = {
        userId: socket.userId,
        content: data.content,
        conversationId: data.conversationId
      };

      // 处理用户消息
      const result = await messageService.processUserMessage(userData, socket);

      // 向用户的其他设备广播用户消息同步
      broadcastToUserDevices(socket.userId, 'message_sync', {
        type: 'user_message',
        conversationId: data.conversationId,
        message: result.userMessage
      }, socket.id);

      // 向用户的其他设备广播AI响应消息同步
      broadcastToUserDevices(socket.userId, 'message_sync', {
        type: 'ai_message',
        conversationId: data.conversationId,
        message: result.aiMessage
      }, socket.id);

    } catch (error) {
      console.error('处理消息时出错:', error);
      socket.emit('messageError', { error: '处理消息时发生错误' });
    }
  });

  // 处理用户发送的流式消息
  socket.on('send_stream_message', async (data) => {
    try {
      // 验证用户是否已认证
      if (!socket.userId) {
        socket.emit('messageError', { error: '用户未认证' });
        return;
      }

      // 验证消息数据
      if (!data.content || !data.conversationId) {
        socket.emit('messageError', { error: '消息内容或会话ID缺失' });
        return;
      }

      // 构造用户数据对象
      const userData = {
        userId: socket.userId,
        content: data.content,
        conversationId: data.conversationId
      };

      console.log('240用户发送流式消息:', userData);

      // 处理用户消息（流式）
      const result = await messageService.processUserMessageStream(userData, socket, broadcastToUserDevices);



      // 监听流式结束事件并同步AI消息到其他设备
      socket.once('streamEnd', (endData) => {
        if (socket.userId && endData.aiMessage) {
          broadcastToUserDevices(socket.userId, 'message_sync', {
            type: 'stream_ai_message',
            conversationId: endData.conversationId,
            message: endData.aiMessage
          }, socket.id);
        }
      });

    } catch (error) {
      console.error('处理流式消息时出错:', error);
      socket.emit('messageError', { error: '处理流式消息时发生错误' });
    }
  });

  // 获取会话消息历史
  socket.on('get_conversation_messages', async (data) => {
    try {
      // 验证用户是否已认证
      if (!socket.userId) {
        socket.emit('messageError', { error: '用户未认证' });
        return;
      }

      // 验证会话ID
      if (!data.conversationId) {
        socket.emit('messageError', { error: '会话ID缺失' });
        return;
      }

      // 获取会话消息
      const messages = await conversationService.getMessagesByConversation(
        data.conversationId,
        socket.userId
      );

      // 返回消息历史
      socket.emit('conversationMessages', {
        conversationId: data.conversationId,
        messages
      });
    } catch (error) {
      console.error('获取会话消息时出错:', error);
      socket.emit('messageError', { error: '获取会话消息时发生错误' });
    }
  });

  // 断开连接处理
  socket.on('disconnect', () => {
    console.log('客户端已断开连接:', socket.id);

    // 从用户连接中移除
    if (socket.userId && userConnections.has(socket.userId)) {
      userConnections.get(socket.userId).delete(socket.id);
      console.log(`用户 ${socket.userId} 剩余连接数: ${userConnections.get(socket.userId).size}`);

      // 如果用户没有连接了，删除记录
      if (userConnections.get(socket.userId).size === 0) {
        userConnections.delete(socket.userId);
        console.log(`用户 ${socket.userId} 所有连接已断开`);
      }
    }
  });
});

// // 启动服务器
// const PORT = process.env.PORT;
// server.listen(PORT+1, '0.0.0.0', () => {
//   console.log(`HTTP服务器正在端口 ${PORT} 上运行`);
//   console.log(`本地访问地址: http://localhost:${PORT}`);
// });

module.exports = app;
