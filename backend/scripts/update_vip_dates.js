const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('../models/User');
const dbService = require('../services/dbService');

// 加载环境变量
dotenv.config();

/**
 * 更新用户VIP到期日期脚本
 * 此脚本将连接数据库并将用户的VIP到期日期设置为2025年12月31日
 */
async function updateVipExpiryDates() {
  try {
    console.log('开始连接数据库...');
    
    // 连接MongoDB数据库
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('成功连接到MongoDB数据库');
    
    // 设置VIP到期日期为2025年12月31日
    const vipEndDate = new Date('2025-12-31T23:59:59.999Z');
    
    console.log('开始更新用户VIP到期日期...');
    
    // 选项1: 更新所有用户的VIP状态（取消注释以下代码）
    // const result = await User.updateMany(
    //   {},
    //   {
    //     $set: {
    //       isVip: true,
    //       vipEndDate: vipEndDate,
    //       vipPlan: '12months' // 默认设置为12个月计划
    //     }
    //   }
    // );
    // console.log(`成功更新了 ${result.modifiedCount} 个用户的VIP状态`);
    
    // 选项2: 查询所有用户并逐个更新（这样可以处理错误）
    const users = await User.find({});
    console.log(`找到 ${users.length} 个用户`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const user of users) {
      try {
        await dbService.updateUser(user._id, {
          isVip: true,
          vipEndDate: vipEndDate,
          vipPlan: '12months' // 默认设置为12个月计划
        });
        console.log(`成功更新用户 ${user.username || user.email} 的VIP状态`);
        successCount++;
      } catch (error) {
        console.error(`更新用户 ${user.username || user.email} 失败: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n更新完成!`);
    console.log(`成功: ${successCount} 个用户`);
    console.log(`失败: ${errorCount} 个用户`);
    
  } catch (error) {
    console.error('脚本执行失败:', error.message);
  } finally {
    // 关闭数据库连接
    await mongoose.connection.close();
    console.log('数据库连接已关闭');
    process.exit(0);
  }
}

// 执行脚本
updateVipExpiryDates();