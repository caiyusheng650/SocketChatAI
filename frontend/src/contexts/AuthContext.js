import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { registerUser, loginUser } from '../services/api';

// 创建认证上下文
const AuthContext = createContext();

// 认证提供者组件
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 检查本地存储中的用户信息
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      try {
        // 验证token是否有效
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp > currentTime) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } else {
          // token过期，清除本地存储
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } catch (error) {
        console.error('解析token失败:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  // 注册函数
  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      // 调用实际的API注册端点
      const data = await registerUser({ username, email, password });
      
      const decodedToken = jwtDecode(data.token);
      setUser({
        id: decodedToken.userId,
        username: data.user.username,
        email: data.user.email
      });
      
      setIsAuthenticated(true);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return { success: true, message: '注册成功！' };
    } catch (err) {
      const errorMessage = err.message || '注册失败';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // 登录函数
  const login = async (username, password) => {
    setLoading(true);
    setError(null);
    
    try {
      // 调用实际的API登录端点
      const data = await loginUser({ username, password });
      
      const decodedToken = jwtDecode(data.token);
      setUser({
        id: decodedToken.userId,
        username: data.user.username,
        email: data.user.email
      });
      
      setIsAuthenticated(true);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || '登录失败';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // 登出函数
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // 获取token的辅助函数
  const getToken = () => {
    return localStorage.getItem('token');
  };

  // 认证上下文值
  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    token: getToken(), // 直接从localStorage获取token
    register,
    login,
    logout,
    getToken
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 自定义钩子用于访问认证上下文
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;