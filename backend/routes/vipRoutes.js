const express = require('express');
const dbService = require('../services/dbService');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// 获取用户VIP状态
router.get('/status', authenticateToken, async (req, res) => {
  try {
    const user = await dbService.findUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: '用户未找到' });
    }

    res.json({
      isVip: user.isVip,
      vipPlan: user.vipPlan,
      vipEndDate: user.vipEndDate
    });
  } catch (error) {
    console.error('获取VIP状态时出错:', error);
    res.status(500).json({ error: '获取VIP状态失败' });
  }
});

// 更新VIP状态（用于支付成功后更新用户VIP信息）
router.post('/subscribe', authenticateToken, async (req, res) => {
  try {
    const { plan, transactionHash } = req.body;
    const userId = req.user.userId;
    
    // 验证计划类型
    const validPlans = ['1month', '3months', '6months'];
    if (!validPlans.includes(plan)) {
      return res.status(400).json({ error: '无效的订阅计划' });
    }
    
    // 验证交易哈希
    if (!transactionHash) {
      return res.status(400).json({ error: '交易哈希缺失' });
    }
    
    // 计算VIP结束日期
    const user = await dbService.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: '用户未找到' });
    }
    
    // 如果用户已经是VIP且未过期，则在现有结束日期基础上延长
    let vipEndDate = user.vipEndDate;
    const now = new Date();
    
    if (!vipEndDate || vipEndDate < now) {
      vipEndDate = now;
    }
    
    // 根据计划类型增加相应的时间
    switch (plan) {
      case '1month':
        vipEndDate.setMonth(vipEndDate.getMonth() + 1);
        break;
      case '3months':
        vipEndDate.setMonth(vipEndDate.getMonth() + 3);
        break;
      case '6months':
        vipEndDate.setMonth(vipEndDate.getMonth() + 6);
        break;
    }
    
    // 更新用户VIP信息
    const updatedUser = await dbService.updateUser(userId, {
      isVip: true,
      vipPlan: plan,
      vipEndDate: vipEndDate
    });
    
    res.json({
      success: true,
      isVip: updatedUser.isVip,
      vipPlan: updatedUser.vipPlan,
      vipEndDate: updatedUser.vipEndDate
    });
  } catch (error) {
    console.error('订阅VIP时出错:', error);
    res.status(500).json({ error: '订阅VIP失败' });
  }
});

module.exports = router;