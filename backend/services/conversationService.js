const dbService = require('./dbService');

class ConversationService {
  /**
   * 创建新会话
   * @param {String} userId - 用户ID
   * @param {String} title - 会话标题
   * @returns {Object} 新创建的会话
   */
  async createConversation(userId, title) {
    try {
      const conversationData = {
        userId,
        title: title || `新对话 ${new Date().toLocaleString('zh-CN')}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const conversation = await dbService.createConversation(conversationData);
      // 将MongoDB的_id转换为id，供前端使用
      const conversationObj = conversation.toObject();
      return {
        ...conversationObj,
        id: conversationObj._id.toString()
      };
    } catch (error) {
      throw new Error(`创建会话失败: ${error.message}`);
    }
  }
  
  /**
   * 根据用户ID获取会话列表（只返回激活的会话）
   * @param {String} userId - 用户ID
   * @returns {Array} 会话列表
   */
  async getConversationsByUser(userId) {
    try {
      const conversations = await dbService.getConversationsByUser(userId);
      // 将MongoDB的_id转换为id，供前端使用，并过滤掉已删除的会话
      return conversations
        .filter(conversation => conversation.isActive !== false)
        .map(conversation => {
          const conversationObj = conversation.toObject();
          return {
            ...conversationObj,
            id: conversationObj._id.toString()
          };
        });
    } catch (error) {
      throw new Error(`获取会话列表失败: ${error.message}`);
    }
  }
  
  /**
   * 获取特定会话
   * @param {String} conversationId - 会话ID
   * @param {String} userId - 用户ID
   * @returns {Object} 会话对象
   */
  async getConversationById(conversationId, userId) {
    try {
      const conversation = await dbService.getConversationById(conversationId);
      
      // 验证用户权限
      if (conversation.userId !== userId) {
        throw new Error('无权访问此会话');
      }
      
      // 将MongoDB的_id转换为id，供前端使用
      const conversationObj = conversation.toObject();
      return {
        ...conversationObj,
        id: conversationObj._id.toString()
      };
    } catch (error) {
      throw new Error(`获取会话失败: ${error.message}`);
    }
  }
  
  /**
   * 更新会话
   * @param {String} conversationId - 会话ID
   * @param {String} userId - 用户ID
   * @param {Object} updates - 更新数据
   * @returns {Object} 更新后的会话
   */
  async updateConversation(conversationId, userId, updates) {
    try {
      // 验证用户权限
      const conversation = await this.getConversationById(conversationId, userId);
      
      // 只允许更新标题和活跃状态
      const allowedUpdates = {};
      if (updates.title) allowedUpdates.title = updates.title;
      if (typeof updates.isActive !== 'undefined') allowedUpdates.isActive = updates.isActive;
      allowedUpdates.updatedAt = new Date();
      
      const updatedConversation = await dbService.updateConversation(conversationId, allowedUpdates);
      
      // 将MongoDB的_id转换为id，供前端使用
      const conversationObj = updatedConversation.toObject();
      return {
        ...conversationObj,
        id: conversationObj._id.toString()
      };
    } catch (error) {
      throw new Error(`更新会话失败: ${error.message}`);
    }
  }
  
  /**
   * 删除会话（软删除 - 设置isActive为false）
   * @param {String} conversationId - 会话ID
   * @param {String} userId - 用户ID
   * @returns {Object} 更新后的会话
   */
  async deleteConversation(conversationId, userId) {
    try {
      // 验证用户权限并更新isActive为false
      return await this.updateConversation(conversationId, userId, { isActive: false });
    } catch (error) {
      throw new Error(`删除会话失败: ${error.message}`);
    }
  }
  
  /**
   * 根据会话ID获取消息
   * @param {String} conversationId - 会话ID
   * @param {String} userId - 用户ID
   * @returns {Array} 消息列表
   */
  async getMessagesByConversation(conversationId, userId) {
    try {
      // 验证用户权限
      await this.getConversationById(conversationId, userId);
      
      return await dbService.getMessagesByConversation(conversationId, userId);
    } catch (error) {
      throw new Error(`获取会话消息失败: ${error.message}`);
    }
  }
}

module.exports = ConversationService;