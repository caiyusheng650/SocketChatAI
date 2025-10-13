const express = require('express');
const jwt = require('jsonwebtoken');
const dbService = require('../services/dbService');
const MessageService = require('../services/messageService');
const messageService = new MessageService();

const router = express.Router();

// 验证JWT令牌的中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: '访问令牌缺失' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '访问令牌无效' });
    }
    req.user = user;
    next();
  });
};

// 获取用户消息历史
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const messages = await messageService.getUserMessageHistory(userId);
    res.json({ messages });
  } catch (error) {
    console.error('获取消息历史时出错:', error);
    res.status(500).json({ error: '获取消息历史失败' });
  }
});

// 根据ID获取特定消息
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    
    const message = await messageService.getMessageById(id);
    
    // 验证用户权限
    if (message.userId !== userId) {
      return res.status(403).json({ error: '无权访问此消息' });
    }
    
    res.json({ message });
  } catch (error) {
    console.error('获取消息时出错:', error);
    res.status(500).json({ error: '获取消息失败' });
  }
});

// 创建系统消息
router.post('/system', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { content, conversationId } = req.body;
    
    // 验证输入数据
    if (!content) {
      return res.status(400).json({ error: '消息内容不能为空' });
    }
    
    if (!conversationId) {
      return res.status(400).json({ error: '会话ID不能为空' });
    }
    
    // 创建系统消息
    const systemMessage = await messageService.createSystemMessage(conversationId, userId, content);
    
    res.json({ message: systemMessage });
  } catch (error) {
    console.error('创建系统消息时出错:', error);
    res.status(500).json({ error: '创建系统消息失败' });
  }
});

// 发送消息到AI（HTTP接口版本）
router.post('/send', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { content, conversationId } = req.body;
    
    // 验证输入数据
    if (!content) {
      return res.status(400).json({ error: '消息内容不能为空' });
    }
    
    if (!conversationId) {
      return res.status(400).json({ error: '会话ID不能为空' });
    }
    
    // 构造用户数据对象
    const userData = {
      userId,
      content,
      conversationId
    };
    
    // 保存用户消息到数据库
    const userMessage = await messageService.saveMessage({
      userId: userData.userId,
      conversationId: userData.conversationId,
      content: userData.content,
      type: 'user'
    });
    
    // 调用AI服务获取响应
    const aiResponse = await messageService.processUserMessageHTTP(userData.content);
    
    // 保存AI响应到数据库
    const aiMessage = await messageService.saveMessage({
      userId: userData.userId,
      conversationId: userData.conversationId,
      content: aiResponse,
      type: 'assistant'
    });
    
    res.json({ 
      success: true, 
      userMessage: userMessage,
      aiMessage: aiMessage 
    });
  } catch (error) {
    console.error('处理消息时出错:', error);
    res.status(500).json({ error: '处理消息失败' });
  }
});

// 从特定会话获取消息
router.get('/conversation/:conversationId', authenticateToken, async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.user;
    
    // 验证会话是否存在
    const conversation = await dbService.getConversationById(conversationId);
    if (!conversation) {
      return res.status(404).json({ error: '会话不存在' });
    }
    
    // 验证用户是否有权限访问此会话
    if (conversation.userId !== userId) {
      return res.status(403).json({ error: '无权访问此会话' });
    }
    
    const messages = await messageService.getConversationMessages(conversationId, userId);
    res.json({ messages });
  } catch (error) {
    console.error('从会话获取消息时出错:', error);
    res.status(500).json({ error: '从会话获取消息失败' });
  }
});

module.exports = router;