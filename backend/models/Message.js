const mongoose = require('mongoose');

// 定义消息Schema
const messageSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  conversationId: {
    type: String,
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['user', 'assistant', 'system']
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  aiResponse: {
    content: String,
    timestamp: Date
  }
}, {
  timestamps: true
});

// 创建消息模型
const MessageModel = mongoose.model('Message', messageSchema);

module.exports = MessageModel;