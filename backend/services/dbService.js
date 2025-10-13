const User = require('../models/User');
const MessageModel = require('../models/Message');
const Conversation = require('../models/Conversation');

// 数据库服务 - 使用MongoDB实现完整的CRUD操作
class DatabaseService {
  /**
   * 通用查找所有文档的方法
   * @param {mongoose.Model} model - Mongoose模型
   * @param {Object} filter - 查询条件
   * @param {Object} options - 查询选项（排序、限制等）
   * @returns {Array} 文档数组
   */
  async findAll(model, filter = {}, options = {}) {
    try {
      const { sort = {}, limit, skip = 0, populate = [] } = options;
      let query = model.find(filter).skip(skip);
      
      if (Object.keys(sort).length > 0) {
        query = query.sort(sort);
      }
      
      if (limit) {
        query = query.limit(limit);
      }
      
      if (populate.length > 0) {
        populate.forEach(populateOption => {
          query = query.populate(populateOption);
        });
      }
      
      return await query.exec();
    } catch (error) {
      throw new Error(`查询所有文档失败: ${error.message}`);
    }
  }
  
  /**
   * 根据ID查找单个文档
   * @param {mongoose.Model} model - Mongoose模型
   * @param {String} id - 文档ID
   * @param {Object} options - 查询选项
   * @returns {Object|null} 单个文档或null
   */
  async findById(model, id, options = {}) {
    try {
      const { populate = [] } = options;
      let query = model.findById(id);
      
      if (populate.length > 0) {
        populate.forEach(populateOption => {
          query = query.populate(populateOption);
        });
      }
      
      return await query.exec();
    } catch (error) {
      throw new Error(`根据ID查询文档失败: ${error.message}`);
    }
  }
  
  /**
   * 根据条件查找单个文档
   * @param {mongoose.Model} model - Mongoose模型
   * @param {Object} filter - 查询条件
   * @param {Object} options - 查询选项
   * @returns {Object|null} 单个文档或null
   */
  async findOne(model, filter = {}, options = {}) {
    try {
      const { populate = [] } = options;
      let query = model.findOne(filter);
      
      if (populate.length > 0) {
        populate.forEach(populateOption => {
          query = query.populate(populateOption);
        });
      }
      
      return await query.exec();
    } catch (error) {
      throw new Error(`查询单个文档失败: ${error.message}`);
    }
  }
  
  /**
   * 创建新文档
   * @param {mongoose.Model} model - Mongoose模型
   * @param {Object} data - 文档数据
   * @returns {Object} 新创建的文档
   */
  async create(model, data) {
    try {
      const document = new model(data);
      return await document.save();
    } catch (error) {
      throw new Error(`创建文档失败: ${error.message}`);
    }
  }
  
  /**
   * 更新文档
   * @param {mongoose.Model} model - Mongoose模型
   * @param {String|Object} filter - 查询条件（ID或过滤器对象）
   * @param {Object} updates - 更新数据
   * @param {Object} options - 更新选项
   * @returns {Object} 更新后的文档
   */
  async update(model, filter, updates, options = {}) {
    try {
      const defaultOptions = { 
        new: true, 
        runValidators: true,
        ...options 
      };
      
      // 如果filter是字符串，假定它是ID
      const query = typeof filter === 'string' ? { _id: filter } : filter;
      
      return await model.findOneAndUpdate(query, updates, defaultOptions);
    } catch (error) {
      throw new Error(`更新文档失败: ${error.message}`);
    }
  }
  
  /**
   * 删除文档
   * @param {mongoose.Model} model - Mongoose模型
   * @param {String|Object} filter - 查询条件（ID或过滤器对象）
   * @returns {Object} 删除的文档
   */
  async delete(model, filter) {
    try {
      // 如果filter是字符串，假定它是ID
      const query = typeof filter === 'string' ? { _id: filter } : filter;
      
      return await model.findOneAndDelete(query);
    } catch (error) {
      throw new Error(`删除文档失败: ${error.message}`);
    }
  }
  
  /**
   * 批量删除文档
   * @param {mongoose.Model} model - Mongoose模型
   * @param {Object} filter - 查询条件
   * @returns {Object} 删除结果
   */
  async deleteMany(model, filter = {}) {
    try {
      return await model.deleteMany(filter);
    } catch (error) {
      throw new Error(`批量删除文档失败: ${error.message}`);
    }
  }
  
  /**
   * 统计文档数量
   * @param {mongoose.Model} model - Mongoose模型
   * @param {Object} filter - 查询条件
   * @returns {Number} 文档数量
   */
  async count(model, filter = {}) {
    try {
      return await model.countDocuments(filter);
    } catch (error) {
      throw new Error(`统计文档数量失败: ${error.message}`);
    }
  }
  
  // ==================== 消息相关操作 ====================
  
  // 保存消息到数据库
  async saveMessage(messageData) {
    try {
      const message = new MessageModel(messageData);
      return await message.save();
    } catch (error) {
      throw new Error(`保存消息失败: ${error.message}`);
    }
  }
  
  // 根据用户ID获取消息历史
  async getMessageHistory(userId, options = {}) {
    try {
      const defaultOptions = {
        sort: { timestamp: 1 }, // 按时间升序排列
        ...options
      };
      
      return await this.findAll(MessageModel, { userId }, defaultOptions);
    } catch (error) {
      throw new Error(`获取消息历史失败: ${error.message}`);
    }
  }
  
  // 获取特定消息
  async getMessageById(messageId) {
    try {
      return await this.findById(MessageModel, messageId);
    } catch (error) {
      throw new Error(`获取消息失败: ${error.message}`);
    }
  }
  
  // 更新消息（例如添加AI响应）
  async updateMessage(messageId, updates) {
    try {
      return await this.update(MessageModel, messageId, updates);
    } catch (error) {
      throw new Error(`更新消息失败: ${error.message}`);
    }
  }
  
  // 删除消息
  async deleteMessage(messageId) {
    try {
      return await this.delete(MessageModel, messageId);
    } catch (error) {
      throw new Error(`删除消息失败: ${error.message}`);
    }
  }
  
  // ==================== 用户相关操作 ====================
  
  // 根据用户名或邮箱查找用户
  async findUserByUsernameOrEmail(username, email) {
    try {
      return await this.findOne(User, {
        $or: [{ username }, { email }]
      });
    } catch (error) {
      throw new Error(`查找用户失败: ${error.message}`);
    }
  }
  
  // 根据用户名查找用户
  async findUserByUsername(username) {
    try {
      return await this.findOne(User, { username });
    } catch (error) {
      throw new Error(`查找用户失败: ${error.message}`);
    }
  }
  
  // 根据邮箱查找用户
  async findUserByEmail(email) {
    try {
      return await this.findOne(User, { email });
    } catch (error) {
      throw new Error(`查找用户失败: ${error.message}`);
    }
  }
  
  // 根据ID查找用户
  async findUserById(userId) {
    try {
      return await this.findById(User, userId);
    } catch (error) {
      throw new Error(`查找用户失败: ${error.message}`);
    }
  }
  
  // 创建新用户
  async createUser(userData) {
    try {
      return await this.create(User, userData);
    } catch (error) {
      throw new Error(`创建用户失败: ${error.message}`);
    }
  }
  
  // 更新用户信息
  async updateUser(userId, updates) {
    try {
      // 移除密码字段以防意外更新
      const { password, ...safeUpdates } = updates;
      return await this.update(User, userId, safeUpdates);
    } catch (error) {
      throw new Error(`更新用户失败: ${error.message}`);
    }
  }
  
  // 更新用户最后登录时间
  async updateUserLastLogin(userId) {
    try {
      return await this.update(User, userId, { lastLogin: new Date() });
    } catch (error) {
      throw new Error(`更新用户最后登录时间失败: ${error.message}`);
    }
  }
  
  // 删除用户
  async deleteUser(userId) {
    try {
      return await this.delete(User, userId);
    } catch (error) {
      throw new Error(`删除用户失败: ${error.message}`);
    }
  }
  
  // ==================== 会话相关操作 ====================
  
  // 创建新会话
  async createConversation(conversationData) {
    try {
      return await this.create(Conversation, conversationData);
    } catch (error) {
      throw new Error(`创建会话失败: ${error.message}`);
    }
  }
  
  // 根据用户ID获取会话列表
  async getConversationsByUser(userId, options = {}) {
    try {
      const defaultOptions = {
        sort: { updatedAt: -1 }, // 按更新时间降序排列
        ...options
      };
      
      return await this.findAll(Conversation, { userId }, defaultOptions);
    } catch (error) {
      throw new Error(`获取会话列表失败: ${error.message}`);
    }
  }
  
  // 获取特定会话
  async getConversationById(conversationId) {
    try {
      return await this.findById(Conversation, conversationId);
    } catch (error) {
      throw new Error(`获取会话失败: ${error.message}`);
    }
  }
  
  // 更新会话
  async updateConversation(conversationId, updates) {
    try {
      return await this.update(Conversation, conversationId, updates);
    } catch (error) {
      throw new Error(`更新会话失败: ${error.message}`);
    }
  }
  
  // 删除会话
  async deleteConversation(conversationId) {
    try {
      return await this.delete(Conversation, conversationId);
    } catch (error) {
      throw new Error(`删除会话失败: ${error.message}`);
    }
  }
  
  // 根据会话ID获取消息
  async getMessagesByConversation(conversationId, userId) {
    try {
      const options = {
        sort: { timestamp: 1 } // 按时间升序排列
      };
      
      return await this.findAll(MessageModel, { 
        conversationId, 
        userId 
      }, options);
    } catch (error) {
      throw new Error(`获取会话消息失败: ${error.message}`);
    }
  }
}

module.exports = new DatabaseService();