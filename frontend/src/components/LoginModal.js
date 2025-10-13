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
  Divider
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
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
    // 清除表单数据和错误信息
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!username) {
      setError('请输入用户名');
      return false;
    }
    
    if (!isLoginMode) {
      // 注册模式下的验证
      if (!email) {
        setError('请输入邮箱地址');
        return false;
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('请输入有效的邮箱地址');
        return false;
      }
      
      if (password.length < 6) {
        setError('密码长度至少为6位');
        return false;
      }
      
      if (password !== confirmPassword) {
        setError('两次输入的密码不一致');
        return false;
      }
    } else {
      // 登录模式下的验证
      if (!password) {
        setError('请输入密码');
        return false;
      }
    }
    
    return true;
  };

  const handleLogin = async () => {
    try {
      const result = await login(username, password);
      if (result.success) {
        onClose();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('登录过程中发生错误');
    }
  };

  const handleRegister = async () => {
    try {
      const result = await register(username, email, password);
      if (result.success) {
        setSuccess(result.message || '注册成功！请登录您的账户。');
        // 切换到登录模式
        setTimeout(() => {
          setIsLoginMode(true);
          setSuccess('');
          setPassword('');
          setConfirmPassword('');
        }, 2000);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('注册过程中发生错误');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    // 表单验证
    if (!validateForm()) {
      setLoading(false);
      return;
    }
    
    if (isLoginMode) {
      await handleLogin();
    } else {
      await handleRegister();
    }
    
    setLoading(false);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
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
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
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
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
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
  );
};

export default LoginModal;