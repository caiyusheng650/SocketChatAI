import io from 'socket.io-client';

const socketService = {
  socket: null,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
  reconnectTimeout: 1000,
  connectionCallbacks: [],
  disconnectCallbacks: [],
  
  // 连接Socket服务器
  connect(url) {
    if (this.socket && this.socket.connected) {
      console.log('Socket已经连接');
      return;
    }
    
    // 创建Socket连接，配置重连策略
    this.socket = io(url, {
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectTimeout,
      reconnectionDelayMax: 5000,
      autoConnect: true,
      transports: ['websocket'], // 优先使用WebSocket
      withCredentials: true
    });
    
    // 监听连接事件
    this.socket.on('connect', () => {
      console.log('Socket连接成功:', this.socket.id);
      this.reconnectAttempts = 0;
      // 调用所有注册的连接回调
      this.connectionCallbacks.forEach(callback => callback());
    });
    
    // 监听重连尝试
    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Socket重连尝试 #${attemptNumber}`);
      this.reconnectAttempts = attemptNumber;
    });
    
    // 监听重连成功
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`Socket重连成功，尝试次数: ${attemptNumber}`);
      this.reconnectAttempts = 0;
    });
    
    // 监听重连失败
    this.socket.on('reconnect_failed', () => {
      console.error(`Socket重连失败，已尝试${this.maxReconnectAttempts}次`);
    });
    
    // 监听断开连接事件
    this.socket.on('disconnect', (reason) => {
      console.log('Socket连接断开:', reason);
      // 调用所有注册的断开连接回调
      this.disconnectCallbacks.forEach(callback => callback(reason));
    });
    
    // 监听错误事件
    this.socket.on('error', (error) => {
      console.error('Socket错误:', error);
    });
  },
  
  // 断开连接
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
      // 清空回调数组
      this.connectionCallbacks = [];
      this.disconnectCallbacks = [];
    }
  },
  
  // 注册事件监听器
  on(eventName, callback) {
    if (this.socket) {
      this.socket.on(eventName, callback);
    }
  },
  
  // 移除事件监听器
  off(eventName, callback) {
    if (this.socket) {
      this.socket.off(eventName, callback);
    }
  },
  
  // 发送事件
  emit(eventName, data) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(eventName, data);
    } else {
      console.warn('Socket未连接，无法发送事件:', eventName);
    }
  },
  
  // 获取连接状态
  getConnectionStatus() {
    return this.socket ? this.socket.connected : false;
  },
  
  // 用户认证
  authenticate(token) {
    if (this.socket) {
      this.socket.emit('authenticate', token);
    }
  },
  
  // 注册连接成功回调
  onConnect(callback) {
    if (typeof callback === 'function') {
      this.connectionCallbacks.push(callback);
      // 如果已经连接，立即执行回调
      if (this.socket && this.socket.connected) {
        callback();
      }
    }
  },
  
  // 注册断开连接回调
  onDisconnect(callback) {
    if (typeof callback === 'function') {
      this.disconnectCallbacks.push(callback);
    }
  },
  
  // 获取当前Socket ID
  getSocketId() {
    return this.socket ? this.socket.id : null;
  },
  
  // 检查是否正在重连
  isReconnecting() {
    return this.socket ? this.socket.io.reconnecting : false;
  },
  
  // 手动触发重连
  reconnect() {
    if (this.socket) {
      this.socket.connect();
    }
  }
};

export default socketService;