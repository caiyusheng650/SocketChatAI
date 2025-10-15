// API服务文件，用于处理与后端的通信
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001'; // 从环境变量读取API地址，默认端口与后端保持一致

// 处理API响应
const handleResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.indexOf('application/json') !== -1) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || '请求失败');
    }
    return data;
  } else {
    if (!response.ok) {
      throw new Error('请求失败');
    }
    return response.text();
  }
};

// 注册用户
export const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });
  
  return handleResponse(response);
};

// 登录用户
export const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
    credentials: 'include' // 包含凭证（cookies）
  });
  
  return handleResponse(response);
};

// 获取当前用户信息
export const getCurrentUser = async (token) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include'
  });
  
  return handleResponse(response);
};

// 获取会话消息历史
export const getConversationMessages = async (conversationId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/messages/conversation/${conversationId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include'
  });
  
  return handleResponse(response);
};

// 创建系统消息
export const createSystemMessage = async (conversationId, content, token) => {
  const response = await fetch(`${API_BASE_URL}/api/messages/system`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ conversationId, content }),
    credentials: 'include'
  });
  
  return handleResponse(response);
};

// 获取用户会话列表
export const getUserConversations = async (token) => {
  const response = await fetch(`${API_BASE_URL}/api/conversations/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include'
  });
  
  return handleResponse(response);
};

// 创建新会话
export const createConversation = async (token, title) => {
  const response = await fetch(`${API_BASE_URL}/api/conversations/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ title }),
    credentials: 'include'
  });
  
  return handleResponse(response);
};

// 重命名会话
export const renameConversation = async (conversationId, title, token) => {
  const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ title }),
    credentials: 'include'
  });
  
  return handleResponse(response);
};

// 删除会话（软删除）
export const deleteConversation = async (conversationId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include'
  });
  
  return handleResponse(response);
};

// 发送消息到AI
export const sendMessageToAI = async (messageData, token) => {
  const response = await fetch(`${API_BASE_URL}/api/messages/send`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(messageData),
  });
  
  return handleResponse(response);
};

// 更新用户信息
export const updateUser = async (userData, token) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/update`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(userData),
    credentials: 'include'
  });
  
  return handleResponse(response);
};

// 获取用户VIP状态
export const getVipStatus = async (token) => {
  const response = await fetch(`${API_BASE_URL}/api/vip/status`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    credentials: 'include'
  });
  
  return handleResponse(response);
};

// 订阅VIP
export const subscribeVip = async (plan, transactionHash, token) => {
  const response = await fetch(`${API_BASE_URL}/api/vip/subscribe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ plan, transactionHash }),
    credentials: 'include'
  });
  
  return handleResponse(response);
};