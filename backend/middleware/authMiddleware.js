const jwt = require('jsonwebtoken');
const dbService = require('../services/dbService');

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

module.exports = {
  authenticateToken
};