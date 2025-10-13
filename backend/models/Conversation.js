const mongoose = require('mongoose');

// 定义会话Schema
const conversationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// 更新时间戳的中间件
conversationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// 创建会话模型
const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;