import React, { useState } from 'react';
import {
  Button,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
  Tooltip
} from '@mui/material';
import {
  Login as LoginIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountIcon,
  Settings as SettingsIcon,
  WorkspacePremium as VipIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './LoginModal';
import VipSubscriptionModal from './VipSubscriptionModal';

const AuthButton = ({ collapsed }) => {
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [vipModalOpen, setVipModalOpen] = useState(false);
  
  const open = Boolean(anchorEl);
  
  // 防止过渡期间的布局闪烁
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleLoginClick = () => {
    setLoginModalOpen(true);
    handleMenuClose();
  };
  
  const handleLogoutClick = () => {
    logout();
    handleMenuClose();
  };
  
  const handleSettingsClick = () => {
    handleMenuClose();
    setSettingsModalOpen(true);
  };
  
  const handleVipSubscriptionClick = () => {
    handleMenuClose();
    setVipModalOpen(true);
  };
  
  const handleSettingsModalClose = () => {
    setSettingsModalOpen(false);
  };
  
  const handleVipModalClose = () => {
    setVipModalOpen(false);
  };
  
  const handleLoginModalClose = () => {
    setLoginModalOpen(false);
  };

  return (
    <>
      <Box
        sx={{
          p: 1,
          borderTop: '0',
          display: 'flex',
          justifyContent: 'flex-start',
          alignItems: 'center',
          minHeight: '60px',  // 固定最小高度，防止过渡期间高度变化
          maxHeight: '60px',  // 固定最大高度，防止内容超出
          width: '100%',  // 宽度100%，与其他项对齐
          transition: 'all 0.3s ease-out',  // 添加过渡动画
          overflow: 'hidden'  // 防止内容溢出

        }}
      >
        {user ? (
          // 已登录用户
          <Tooltip title={collapsed ? user.username : ''} placement="right">
            <Button
              onClick={handleMenuOpen}
              sx={{
                width: collapsed ? 'auto' : '100%',
                minWidth: '40px',
                p: 1,
                borderRadius: 2,
                display: 'flex',
                justifyContent: collapsed ? 'center' : 'flex-start',
                alignItems: 'center',
                textTransform: 'none',
                color: 'text.primary',
                transition: 'all 0.3s ease-out',  // 添加过渡动画
                
              }}
            >
              <Avatar 
                sx={{ 
                  width: 24, 
                  height: 24, 
                  fontSize: 12,
                  mr: collapsed ? 0 : 1,
                  mb: collapsed ? 0.5 : 0
                }} 
                src={user.avatar}
              >
                {user.username.charAt(0).toUpperCase()}
              </Avatar>
              {!collapsed && (
                <Box sx={{ 
                  textAlign: 'left',
                  opacity: collapsed ? 0 : 1,
                  transition: 'opacity 0.3s ease-out',
                  maxWidth: collapsed ? 0 : '200px',
                  overflow: 'hidden',
                  marginLeft: 1
                }}>
                  
                    {user.username}
                </Box>
              )}
            </Button>
          </Tooltip>
        ) : (
          // 未登录用户
          <Tooltip title={collapsed ? '登录' : ''} placement="right">
            <Button
              onClick={handleLoginClick}
              startIcon={<LoginIcon />}
              sx={{
                width: collapsed ? 'auto' : '100%',
                minWidth: '40px',
                p: 1,
                borderRadius: 2,
                justifyContent: collapsed ? 'center' : 'flex-start',
                textTransform: 'none',
                color: 'text.primary',
                transition: 'all 0.3s ease-out',  // 添加过渡动画
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              {!collapsed && (
                <Box sx={{
                  opacity: collapsed ? 0 : 1,
                  transition: 'opacity 0.3s ease-out',
                  maxWidth: collapsed ? 0 : '100px',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',  // 不准换行
                  textOverflow: 'ellipsis'  // 溢出时显示省略号
                }}>
                  登录
                </Box>
              )}
            </Button>
          </Tooltip>
        )}
      </Box>
      
      {/* 用户菜单 */}
      {user && (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
          PaperProps={{
            elevation: 0,
            sx: {
              overflow: 'visible',
              filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
              mt: 1.5,
              minWidth: 200,
              width: 'auto',
              maxWidth: 280,
              '& .MuiAvatar-root': {
                width: 32,
                height: 32,
                ml: -0.5,
                mr: 1,
              },
            },
          }}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          <MenuItem>
            <ListItemIcon>
              <AccountIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>
              <Box sx={{ fontWeight: 500 }}>{user.username}</Box>
            </ListItemText>
          </MenuItem>
          <Divider />
          
          <MenuItem onClick={handleVipSubscriptionClick}>
            <ListItemIcon>
              <VipIcon fontSize="small" />
            </ListItemIcon>
            订阅
          </MenuItem>
          <MenuItem onClick={handleLogoutClick}>
            <ListItemIcon>
              <LogoutIcon fontSize="small" />
            </ListItemIcon>
            登出
          </MenuItem>
        </Menu>
      )}
      
      {/* 登录模态框 */}
      <LoginModal 
        open={loginModalOpen} 
        onClose={handleLoginModalClose} 
      />
      
     
      
      {/* VIP订阅模态框 */}
      <VipSubscriptionModal
        open={vipModalOpen}
        onClose={handleVipModalClose}
      />
    </>
  );
};

export default AuthButton;