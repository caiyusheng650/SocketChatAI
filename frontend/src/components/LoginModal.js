import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  Link,
  Divider,
  Snackbar
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  AccountCircle,
  Lock,
  Email as EmailIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../theme';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  outline: 'none'
};

const LoginModal = ({ open, onClose }) => {
  const [isLoginMode, setIsLoginMode] = useState(true); // true for login, false for register
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarSeverity, setSnackbarSeverity] = useState('error');
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [loginError, setLoginError] = useState(''); // 专门用于显示登录错误信息

  const { login, register } = useAuth();

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleModeSwitch = () => {
    setIsLoginMode(!isLoginMode);
    // 清除表单数据
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setSnackbarOpen(false);
    // 清除登录错误信息
    setLoginError('');
  };

  // ======================
  // 表单处理函数
  // ======================
  
  /**
   * 处理登录/注册操作
   */
  const handleSubmit = () => {
    // 创建一个异步函数来处理后续逻辑
    const submitForm = async () => {
      setLoading(true);
  
      // 表单验证
      if (!validateForm()) {
        setLoading(false);
        return;
      }
  
      try {
        if (isLoginMode) {
          await handleLogin();
        } else {
          await handleRegister();
        }
      } catch (err) {
        console.error('表单提交错误:', err);
        showSnackbar('提交表单时发生错误，请重试');
      } finally {
        setLoading(false);
      }
    };
    
    // 立即执行异步处理函数
    submitForm();
  };
  
  /**
   * 处理登录逻辑
   */
  const handleLogin = async () => {
    try {
      // 清除之前的错误信息
      setLoginError('');
      
      const result = await login(username, password);
      if (result.success) {
        console.log('登录成功:', result);
        showSnackbar('登录成功！欢迎回来。', 'success');
        // 延迟关闭模态框，让用户看到成功消息
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        console.log('登录失败:', result);
        // 根据错误信息设置具体的错误提示
        let errorMessage = result.error || '登录失败';
        setLoginError(errorMessage);
        
        
        showSnackbar(errorMessage);
      }
      return result;
    } catch (err) {
      const errorMessage = '登录过程中发生错误';
      setLoginError(errorMessage);
      showSnackbar(errorMessage);
      return { success: false, error: errorMessage };
    }
  };
  
  /**
   * 处理注册逻辑
   */
  const handleRegister = async () => {
    try {
      const result = await register(username, email, password);
      if (result.success) {
        const successMessage = result.message || '注册成功！欢迎加入我们。';
        showSnackbar(successMessage, 'success');
        // 切换到登录模式
        setTimeout(() => {
          setIsLoginMode(true);
          setPassword('');
          setConfirmPassword('');
          setUsername(username); // 保持用户名不变，方便用户直接登录
          setEmail(email); // 保持邮箱不变
        }, 2000);
      } else {
        showSnackbar(result.error || '注册失败');
      }
      return result;
    } catch (err) {
      showSnackbar('注册过程中发生错误');
      return { success: false, error: '注册过程中发生错误' };
    }
  };
  
  // ======================
  // 工具函数
  // ======================
  
  /**
   * 显示Snackbar消息
   * @param {string} message - 要显示的消息
   * @param {string} severity - 消息严重程度 ('error' | 'warning' | 'info' | 'success')
   */
  const showSnackbar = (message, severity = 'error') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  /**
   * 验证表单数据
   * @returns {boolean} 验证是否通过
   */
  const validateForm = () => {
    // 清除之前的登录错误信息
    if (isLoginMode) {
      setLoginError('');
    }
    
    if (!username) {
      showSnackbar('请输入用户名');
      return false;
    }
  
    if (!isLoginMode) {
      // 注册模式下的验证
      if (!email) {
        showSnackbar('请输入邮箱地址');
        return false;
      }
  
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        showSnackbar('请输入有效的邮箱地址');
        return false;
      }
  
      if (password.length < 6) {
        showSnackbar('密码长度至少为6位');
        return false;
      }
  
      if (password !== confirmPassword) {
        showSnackbar('两次输入的密码不一致');
        return false;
      }
    } else {
      // 登录模式下的验证
      if (!password) {
        showSnackbar('请输入密码');
        return false;
      }
    }
  
    return true;
  };

  return (
    <>
      <Modal
        open={open}
        onClose={() => {
          // 清除错误信息
          setLoginError('');
          setSnackbarOpen(false);
          onClose();
        }}
        aria-labelledby="auth-modal-title"
        aria-describedby="auth-modal-description"
      >
        <Box sx={style}>
          <Typography
            id="auth-modal-title"
            variant="h5"
            component="h2"
            align="center"
            gutterBottom
            sx={{ fontWeight: 'bold', color: colors.primary }}
          >
            {isLoginMode ? '用户登录' : '用户注册'}
          </Typography>

          {/* 登录错误信息显示区域 */}
          {isLoginMode && loginError && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 2,
                fontWeight: 'bold',
                fontSize: '0.9rem',
                '& .MuiAlert-message': {
                  width: '100%',
                  textAlign: 'center'
                }
              }}
              onClose={() => setLoginError('')}
            >
              {loginError}
            </Alert>
          )}

          {/* 其他错误和成功信息现在通过Snackbar显示 */}

          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="用户名"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccountCircle />
                  </InputAdornment>
                ),
              }}
            />

            {!isLoginMode && (
              <TextField
                fullWidth
                label="邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                margin="normal"
                type="email"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon />
                    </InputAdornment>
                  ),
                }}
              />
            )}

            <TextField
              fullWidth
              label="密码"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {!isLoginMode && (
              <TextField
                fullWidth
                label="确认密码"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                margin="normal"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={handleClickShowConfirmPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            )}

            <Button
              fullWidth
              variant="contained"
              disabled={loading}
              onClick={handleSubmit}
              sx={{
                mt: 3,
                mb: 2,
                py: 1.5,
                backgroundColor: colors.primary,
                '&:hover': {
                  backgroundColor: colors.primaryDark
                }
              }}
            >
              {loading ? (isLoginMode ? '登录中...' : '注册中...') : (isLoginMode ? '登录' : '注册')}
            </Button>

            <Button
              fullWidth
              variant="outlined"
              onClick={onClose}
              sx={{
                py: 1.5,
                borderColor: colors.gray[400],
                color: colors.gray[700],
                '&:hover': {
                  borderColor: colors.gray[500]
                }
              }}
            >
              取消
            </Button>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" align="center">
              {isLoginMode ? '还没有账户？' : '已有账户？'}
              <Link
                component="button"
                variant="body2"
                onClick={handleModeSwitch}
                sx={{ ml: 0.5, fontWeight: 'bold' }}
              >
                {isLoginMode ? '立即注册' : '立即登录'}
              </Link>
            </Typography>
          </Box>
        </Box>
      </Modal>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default LoginModal;