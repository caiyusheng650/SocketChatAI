// 消息类型转换工具函数

/**
 * 将后端消息类型转换为前端的isUser布尔值
 * @param {string} type - 后端消息类型 ('user', 'assistant', 'system')
 * @returns {boolean} - 是否为用户的消息
 */
export const convertMessageType = (type) => {
  switch (type) {
    case 'user':
      return true;
    case 'assistant':
    case 'system':
      return false;
    default:
      return false;
  }
};

/**
 * 将后端消息对象转换为前端消息格式
 * @param {Object} backendMessage - 后端消息对象
 * @returns {Object} - 前端消息对象
 */
export const convertBackendMessage = (backendMessage) => {
  return {
    id: backendMessage._id || backendMessage.id,
    content: backendMessage.content,
    isUser: convertMessageType(backendMessage.type),
    timestamp: backendMessage.timestamp,
    type: backendMessage.type, // 保留原始类型信息
    isSynced: true // 来自后端的消息默认已同步
  };
};

/**
 * 批量转换后端消息数组
 * @param {Array} backendMessages - 后端消息数组
 * @returns {Array} - 前端消息数组
 */
export const convertBackendMessages = (backendMessages) => {
  if (!backendMessages || !Array.isArray(backendMessages)) {
    return [];
  }
  return backendMessages.map(convertBackendMessage);
};

/**
 * 格式化消息时间戳
 * @param {string|number} timestamp - 时间戳
 * @returns {string} - 格式化后的时间字符串
 */
export const formatMessageTimestamp = (timestamp) => {
  if (!timestamp) return '';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffMins < 1) {
    return '刚刚';
  } else if (diffMins < 60) {
    return `${diffMins}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    // 超过7天的消息显示具体日期
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
};

/**
 * 生成唯一消息ID
 * @returns {string} - 唯一的消息ID
 */
export const generateMessageId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * 验证消息内容是否有效
 * @param {string} content - 消息内容
 * @returns {boolean} - 内容是否有效
 */
export const isValidMessageContent = (content) => {
  return content && typeof content === 'string' && content.trim().length > 0;
};

/**
 * 按时间排序消息
 * @param {Array} messages - 消息数组
 * @returns {Array} - 排序后的消息数组
 */
export const sortMessagesByTime = (messages) => {
  return [...messages].sort((a, b) => {
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    return timeA - timeB;
  });
};