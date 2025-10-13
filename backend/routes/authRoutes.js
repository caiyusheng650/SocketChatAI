const express = require('express');
const jwt = require('jsonwebtoken');
const dbService = require('../services/dbService');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// 验证JWT令牌的中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ error: '访问令牌缺失' });
  }
  
  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      return res.status(403).json({ error: '访问令牌无效' });
    }
    
    // 将用户信息添加到请求对象中
    req.user = user;
    
    // 尝试从数据库获取完整的用户信息
    try {
      const fullUser = await dbService.findUserById(user.userId);
      if (fullUser) {
        req.user = { ...user, ...fullUser.toObject() };
      }
    } catch (dbError) {
      // 如果数据库查询失败，使用JWT中的信息
      console.warn('无法获取完整用户信息:', dbError.message);
    }
    
    next();
  });
};

// 注册限流器 - 限制注册请求频率
const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 5, // 限制每个IP 15分钟内最多5次注册请求
  message: {
    error: '注册请求过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 登录限流器 - 限制登录请求频率
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 10, // 限制每个IP 15分钟内最多10次登录请求
  message: {
    error: '登录请求过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // 验证输入数据
    if (!username || !email || !password) {
      return res.status(400).json({ error: '用户名、邮箱和密码都是必填项' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度至少为6位' });
    }
    
    // 检查用户是否已存在
    const existingUser = await dbService.findUserByUsernameOrEmail(username, email);
    if (existingUser) {
      return res.status(409).json({ error: '用户名或邮箱已存在' });
    }
    
    // 创建新用户
    const userData = {
      username,
      email,
      password // 密码将在模型中自动加密
    };
    
    const user = await dbService.createUser(userData);
    
    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // 返回用户信息和令牌（不包含密码）
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.status(201).json({
      user: userWithoutPassword,
      token
    });
    console.log('用户注册成功:', user);
  } catch (error) {
    console.error('注册时出错:', error);
    res.status(500).json({ error: '注册失败，请稍后再试' });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // 验证输入数据
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码都是必填项' });
    }
    
    // 查找用户
    const user = await dbService.findUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    // 验证密码
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    // 更新最后登录时间
    await dbService.updateUserLastLogin(user._id);
    
    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // 返回用户信息和令牌（不包含密码）
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json({
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    console.error('登录时出错:', error);
    res.status(500).json({ error: '登录失败，请稍后再试' });
  }
});

// 获取当前用户信息
router.get('/me', authenticateToken, async (req, res) => {
  try {
    // 从请求对象中获取用户信息
    const { userId, username, email, createdAt, lastLogin } = req.user;
    
    // 返回用户信息（不包含密码等敏感信息）
    res.json({
      user: {
        id: userId,
        username,
        email,
        createdAt,
        lastLogin
      }
    });
  } catch (error) {
    console.error('获取用户信息时出错:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

module.exports = router;