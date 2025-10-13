const express = require('express');
const jwt = require('jsonwebtoken');
const ConversationService = require('../services/conversationService');
const conversationService = new ConversationService();

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

// 创建新会话
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const { title } = req.body;
    
    const conversation = await conversationService.createConversation(userId, title);
    res.status(201).json({ conversation });
  } catch (error) {
    console.error('创建会话时出错:', error);
    res.status(500).json({ error: '创建会话失败' });
  }
});

// 获取用户会话列表
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.user;
    const conversations = await conversationService.getConversationsByUser(userId);
    res.json({ conversations });
  } catch (error) {
    console.error('获取会话列表时出错:', error);
    res.status(500).json({ error: '获取会话列表失败' });
  }
});

// 获取特定会话
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    
    const conversation = await conversationService.getConversationById(id, userId);
    res.json({ conversation });
  } catch (error) {
    console.error('获取会话时出错:', error);
    if (error.message.includes('无权访问')) {
      return res.status(403).json({ error: '无权访问此会话' });
    }
    res.status(500).json({ error: '获取会话失败' });
  }
});

// 更新会话
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const updates = req.body;
    
    const conversation = await conversationService.updateConversation(id, userId, updates);
    res.json({ conversation });
  } catch (error) {
    console.error('更新会话时出错:', error);
    if (error.message.includes('无权访问')) {
      return res.status(403).json({ error: '无权访问此会话' });
    }
    res.status(500).json({ error: '更新会话失败' });
  }
});

// 删除会话
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    
    await conversationService.deleteConversation(id, userId);
    res.json({ message: '会话删除成功' });
  } catch (error) {
    console.error('删除会话时出错:', error);
    if (error.message.includes('无权访问')) {
      return res.status(403).json({ error: '无权访问此会话' });
    }
    res.status(500).json({ error: '删除会话失败' });
  }
});

// 获取会话消息历史
router.get('/:id/messages', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    
    const messages = await conversationService.getMessagesByConversation(id, userId);
    res.json({ messages });
  } catch (error) {
    console.error('获取会话消息时出错:', error);
    if (error.message.includes('无权访问')) {
      return res.status(403).json({ error: '无权访问此会话' });
    }
    res.status(500).json({ error: '获取会话消息失败' });
  }
});

// 根据用户ID获取会话列表
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const conversations = await conversationService.getConversationsByUser(userId);
    res.json({ conversations });
  } catch (error) {
    console.error('根据用户ID获取会话列表时出错:', error);
    res.status(500).json({ error: '根据用户ID获取会话列表失败' });
  }
});

module.exports = router;