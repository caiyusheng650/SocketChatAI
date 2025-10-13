const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const dbService = require('./dbService');
const AIService = require('./aiService');
const aiService = new AIService();

class MessageService {
  // 保存消息到数据库
  async saveMessage(messageData) {
    try {
      const message = {
        _id: new mongoose.Types.ObjectId(),  // 使用ObjectId而不是UUID
        userId: messageData.userId,
        conversationId: messageData.conversationId,
        content: messageData.content,
        type: messageData.type,  // 直接使用type字段
        timestamp: new Date()
      };

      const savedMessage = await dbService.saveMessage(message);
      // 将MongoDB的_id转换为id，供前端使用
      const messageObj = savedMessage.toObject();
      return {
        ...messageObj,
        id: messageObj._id.toString()
      };
    } catch (error) {
      console.error('保存消息时出错:', error);
      throw error;
    }
  }

  // 处理用户消息
  async processUserMessage(userData, socket) {
    try {
      // 在socket上设置当前对话ID，供AI服务使用
      socket.conversationId = userData.conversationId;
            const userMessage = await this.saveMessage({
        userId: userData.userId,
        conversationId: userData.conversationId,
        content: userData.content,
        type: 'user'  // 将role改为type
      });

      // 向客户端发送用户消息确认
      socket.emit('userMessageReceived', { message: userMessage });

      // 调用AI服务获取响应（传入用户ID和对话ID以获取历史上下文）
      const aiResponse = await aiService.processMessage(userData.content, socket);

      // 保存AI响应到数据库
      const aiMessage = await this.saveMessage({
        userId: userData.userId,
        conversationId: userData.conversationId,
        content: aiResponse,
        type: 'assistant'  // 使用'assistant'与ChatGPT标准对齐
      });

      // 向客户端发送AI响应
      socket.emit('aiResponse', { message: aiMessage });
      
      // 返回两个消息供多端同步使用
      return { userMessage, aiMessage };
    } catch (error) {
      console.error('处理用户消息时出错:', error);
      throw error;
    }
  }

  // 处理用户消息（流式）
  async processUserMessageStream(userData, socket, broadcastToUserDevices = null) {
    try {
      // 在socket上设置当前对话ID，供AI服务使用
      socket.conversationId = userData.conversationId;
      
      // 保存用户消息到数据库
      const userMessage = await this.saveMessage({
        userId: userData.userId,
        conversationId: userData.conversationId,
        content: userData.content,
        type: 'user',  // 将role改为type
        from: socket.id  // 添加from字段，标识消息来源
      });

      // 向客户端发送用户消息确认
      if(broadcastToUserDevices) {
        broadcastToUserDevices(userData.userId, 'message_sync', { 
          type: 'stream_user_message',
          content: userData.content,
          conversationId: userData.conversationId,
          from: socket.id  // 添加from字段，标识消息来源
        }, socket.id);
      }

      // 用于收集完整的AI响应
      let fullResponse = '';
      let aiMessage = null;

      // 创建流式响应处理器
      const streamHandler = {
        write: (chunk) => {
          // 收集完整响应
          fullResponse += chunk;
          // 如果有广播函数，向所有设备广播流式数据
          if (broadcastToUserDevices) {
            broadcastToUserDevices(userData.userId, 'message_sync', { 
              type: 'stream_ai_message',
              content: chunk,
              conversationId: userData.conversationId,
              from: socket.id  // 添加from字段，标识消息来源
            }, socket.id);
          }
        },
        end: async () => {
          // 流式响应结束，保存AI消息到数据库
          if (fullResponse) {
            aiMessage = await this.saveMessage({
              userId: userData.userId,
              conversationId: userData.conversationId,
              content: fullResponse,
              type: 'assistant'
            });
          }
          
          // 如果有广播函数，向所有设备广播流式结束事件
          if (broadcastToUserDevices && aiMessage) {
            broadcastToUserDevices(userData.userId, 'message_sync', { 
              type: 'stream_ai_message_end',
              message: aiMessage,
              conversationId: userData.conversationId,
              from: socket.id  // 添加from字段，标识消息来源
            }, socket.id);
          }
        },
        on: (event, callback) => {
          // 为了兼容性，这里不需要实现
        }
      };

      // 调用AI服务获取流式响应
      await aiService.processMessageStream(userData.content, socket, streamHandler, userData.userId, userData.conversationId);
      
      // 返回用户消息和AI消息供多端同步使用
      return { userMessage, aiMessage };
    } catch (error) {
      console.error('处理用户流式消息时出错:', error);
      throw error;
    }
  }

  // 处理用户消息（HTTP版本，不需要socket）
  async processUserMessageHTTP(content) {
    try {
      // 调用AI服务获取响应
      const aiResponse = await aiService.processMessage(content);
      return aiResponse;
    } catch (error) {
      console.error('处理用户HTTP消息时出错:', error);
      throw error;
    }
  }

  // 获取指定会话的消息历史
  async getConversationMessages(conversationId, userId) {
    try {
      const messages = await dbService.getMessagesByConversation(conversationId, userId);
      // 将MongoDB的_id转换为id，供前端使用
      return messages.map(message => {
        const messageObj = message.toObject();
        return {
          ...messageObj,
          id: messageObj._id.toString()
        };
      });
    } catch (error) {
      console.error('获取会话消息时出错:', error);
      throw error;
    }
  }

  // 创建系统消息
  async createSystemMessage(conversationId, userId, content) {
    try {
      const systemMessage = {
        userId: userId,
        conversationId: conversationId,
        content: content,
        type: 'system',
        timestamp: new Date()
      };

      const savedMessage = await this.saveMessage(systemMessage);
      return savedMessage;
    } catch (error) {
      console.error('创建系统消息时出错:', error);
      throw error;
    }
  }
}

module.exports = MessageService;