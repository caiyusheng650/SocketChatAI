const axios = require('axios');
const https = require('https');
require('dotenv').config();


class AIService {
  constructor() {
    // AI服务配置
    this.apiKey = process.env.AI_API_KEY;
    this.apiUrl = process.env.AI_API_URL;
    this.model = process.env.AI_MODEL;

    
    
    // 模拟响应配置
    this.mockResponseEnabled = process.env.MOCK_AI_RESPONSE === 'true';
    this.mockResponseText = process.env.MOCK_AI_RESPONSE_TEXT || '这是一个模拟的AI响应。';
    
    // 创建自定义HTTPS代理（如果需要）
    this.httpsAgent = new https.Agent({
      rejectUnauthorized: false // 注意：在生产环境中应设置为true并正确配置SSL证书
    });
  }

  // 处理用户消息并获取AI响应
  async processMessage(content, socket = null) {
    try {
      // 如果启用了模拟响应，直接返回模拟文本
      if (this.mockResponseEnabled) {
        console.log('返回模拟AI响应');
        // 模拟处理延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this.mockResponseText;
      }

      // 如果有socket对象，传入用户ID和对话ID获取历史上下文
      if (socket && socket.userId && socket.conversationId) {
        console.log('使用历史上下文处理消息');
        const response = await this.callAIProvider(content, socket.userId, socket.conversationId);
        return response;
      } else {
        // 基础模式，不使用历史上下文
        console.log('使用基础模式处理消息（无历史上下文）');
        const response = await this.callAIProvider(content);
        return response;
      }
    } catch (error) {
      console.error('处理AI消息时出错:', error);
      throw error;
    }
  }

  // 处理用户消息并获取AI流式响应
  async processMessageStream(content, socket, stream, userId, conversationId) {
    try {
      // 如果启用了模拟响应，直接返回模拟文本（流式）
      if (this.mockResponseEnabled) {
        console.log('返回模拟AI流式响应');
        // 模拟流式处理延迟
        const mockText = this.mockResponseText;
        const chunkSize = 10;
        
        for (let i = 0; i < mockText.length; i += chunkSize) {
          const chunk = mockText.substring(i, Math.min(i + chunkSize, mockText.length));
          stream.write(chunk);
          await new Promise(resolve => setTimeout(resolve, 100)); // 模拟延迟
        }
        
        stream.end();
        return;
      }

      // 调用AI提供商API获取流式响应
      await this.callAIProviderStream(content, socket, stream, userId, conversationId);
    } catch (error) {
      console.error('处理AI流式消息时出错:', error);
      throw error;
    }
  }

  // 调用AI提供商API（带历史上下文）
  async callAIProvider(content, userId = null, conversationId = null) {
    try {
      // 构建消息数组
      const messages = [];
      
      // 如果有用户ID和对话ID，获取历史上下文
      if (userId && conversationId) {
        const dbService = require('./dbService');
        const conversationHistory = await dbService.getMessagesByConversation(conversationId, userId);
        
        
        // 添加历史消息（限制最近的10条消息）
        const recentMessages = conversationHistory;
        recentMessages.forEach(msg => {
          if (msg.type === 'user') {
            messages.push({
              role: "user",
              content: msg.content
            });
          } else if (msg.type === 'assistant') {
            messages.push({
              role: "assistant",
              content: msg.content
            });
          }
        });
        }
      
      // 添加当前用户消息
      messages.push({
        role: "user",
        content: content
      });

      console.log('构建的对话上下文:', messages);
      
      const requestData = {
        model: this.model,
        messages: messages,
      };

      const response = await axios.post(this.apiUrl, requestData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000, // 30秒超时
        httpsAgent: this.httpsAgent
      });

      // 提取AI响应文本
      const aiResponse = response.data.choices[0]?.message?.content || '抱歉，我没有理解您的问题。';
      return aiResponse;
    } catch (error) {
      console.error('调用AI提供商API时出错:', error.response?.data || error.message);
      throw new Error(`AI服务调用失败: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // 调用AI提供商API获取流式响应
  async callAIProviderStream(content, socket, stream, userId, conversationId) {
    
    try {
      // 从数据库获取对话历史，构建上下文
      const dbService = require('./dbService');
      const conversationHistory = await dbService.getMessagesByConversation(conversationId, userId);
      
      // 构建消息数组，包含历史上下文
      const messages = [];
      
      // 添加历史消息
      const recentMessages = conversationHistory;
      recentMessages.forEach(msg => {
        if (msg.type === 'user') {
          messages.push({
            role: "user",
            content: msg.content
          });
        } else if (msg.type === 'assistant') {
          messages.push({
            role: "assistant",
            content: msg.content
          });
        }
      });
      
      // 添加当前用户消息
      messages.push({
        role: "user",
        content: content
      });
      
      
      const requestData = {
        model: this.model,
        messages: messages,
        stream: true // 启用流式响应
      };


      const response = await axios.post(this.apiUrl, requestData, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000, // 30秒超时
        httpsAgent: this.httpsAgent,
        responseType: 'stream' // 设置响应类型为流
      });

      // 处理流式响应
      let buffer = '';
      let fullResponse = ''; // 用于保存完整的AI响应
      response.data.on('data', (chunk) => {
        // 将数据块添加到缓冲区
        buffer += chunk.toString();
        
        // 按行分割数据
        let lines = buffer.split('\n');
        
        // 保留最后一行（可能是不完整的数据）
        buffer = lines.pop();
        
        // 处理完整的行
        for (let line of lines) {
          // 移除"data: "前缀
          if (line.startsWith('data: ')) {
            line = line.substring(6);
          }
          
          // 忽略空行和[DONE]标记
          if (line.trim() === '' || line.trim() === '[DONE]') {
            continue;
          }
          
          try {
            // 解析JSON数据
            const jsonData = JSON.parse(line);
            
            // 提取内容并发送到客户端
            if (jsonData.choices && jsonData.choices[0] && jsonData.choices[0].delta && jsonData.choices[0].delta.content) {
              const content = jsonData.choices[0].delta.content;
              stream.write(content);
              fullResponse += content; // 收集完整响应
            }
          } catch (parseError) {
            console.error('解析流式响应数据时出错:', parseError);
          }
        }
      });

      response.data.on('end', async () => {
        // 处理缓冲区中剩余的数据
        if (buffer.trim() !== '' && buffer.trim() !== '[DONE]') {
          try {
            // 移除"data: "前缀
            if (buffer.startsWith('data: ')) {
              buffer = buffer.substring(6);
            }
            
            const jsonData = JSON.parse(buffer);
            if (jsonData.choices && jsonData.choices[0] && jsonData.choices[0].delta && jsonData.choices[0].delta.content) {
              const content = jsonData.choices[0].delta.content;
              stream.write(content);
              fullResponse += content; // 收集完整响应
            }
          } catch (parseError) {
            console.error('解析流式响应数据时出错:', parseError);
          }
        }
        
        // 流结束时关闭
        stream.end();
        
        // 保存完整的assistant消息到数据库
        if (fullResponse.trim()) {
          try {
            const dbService = require('./dbService');
            const MessageModel = require('../models/Message');
            
            const assistantMessage = {
              _id: new (require('mongoose')).Types.ObjectId(),
              userId: userId,
              conversationId: conversationId,
              content: fullResponse,
              type: 'assistant',
              timestamp: new Date()
            };
            
            
            // 更新对话的updatedAt字段
            try {
              const ConversationService = require('./conversationService');
              const conversationService = new ConversationService();
              await conversationService.updateConversation(conversationId, userId, { updatedAt: new Date() });
            } catch (updateError) {
              console.error('更新对话时间戳时出错:', updateError);
            }

          } catch (saveError) {
            console.error('保存assistant消息时出错:', saveError);
          }
        }
      });

      response.data.on('error', (error) => {
        console.error('流式响应错误:', error);
        stream.end();
      });
    } catch (error) {
      console.error('调用AI提供商API获取流式响应时出错:', error.response?.data || error.message);
      throw new Error(`AI流式服务调用失败: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // 获取模拟响应（用于测试）
  getMockResponse() {
    return this.mockResponseText;
  }

  // 测试AI服务连接
  async testConnection() {
    try {
      if (this.mockResponseEnabled) {
        return { success: true, message: '模拟模式已启用' };
      }

      // 发送一个简单的测试请求（不传入用户ID和对话ID，使用基础模式）
      const testContent = "你好";
      const response = await this.callAIProvider(testContent);
      
      return { 
        success: true, 
        message: 'AI服务连接成功', 
        sampleResponse: response.substring(0, 50) + '...' 
      };
    } catch (error) {
      return { 
        success: false, 
        message: `AI服务连接失败: ${error.message}` 
      };
    }
  }
}

module.exports = AIService;