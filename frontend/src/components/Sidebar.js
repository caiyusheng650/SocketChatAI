import React, { useState, useEffect } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  TextField,
  InputAdornment,
  Badge,
  Typography,
  Tooltip,
  Fade,
  Zoom
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { colors } from '../theme';
import AuthButton from './AuthButton';

const Sidebar = ({
  conversations,
  selectedConversation,
  onConversationSelect,
  onNewChat,
  collapsed: propCollapsed,
  onToggle,
  onRenameConversation,
  onDeleteConversation
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const [hoveredChat, setHoveredChat] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [editingChat, setEditingChat] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const collapsed = window.innerWidth < 1000 ? true : propCollapsed !== undefined ? propCollapsed : internalCollapsed;
  const setCollapsed = onToggle || setInternalCollapsed;

  // 分组对话
  const groupedConversations = conversations.reduce((groups, conv) => {
    const today = new Date();
    const convDate = new Date(conv.timestamp);
    const diffTime = Math.abs(today - convDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let group = '更早';
    if (diffDays === 0) {
      group = '今天';
    } else if (diffDays === 1) {
      group = '昨天';
    } else if (diffDays <= 7) {
      group = '本周';
    } else if (diffDays <= 30) {
      group = '本月';
    }

    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(conv);
    return groups;
  }, {});

  // 过滤对话
  const filteredConversations = Object.entries(groupedConversations).reduce((acc, [group, chats]) => {
    const filtered = chats.filter(chat =>
      (chat.title && chat.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (chat.lastMessage && chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    if (filtered.length > 0) {
      acc[group] = filtered;
    }
    return acc;
  }, {});

  // 格式化时间
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    return date.toLocaleDateString();
  };

  // 处理删除对话确认
  const handleDeleteConversation = (e, conversation) => {
    e.stopPropagation();
    setShowDeleteConfirm(conversation._id);
    setTimeout(() => setShowDeleteConfirm(null), 3000);
  };

  // 确认删除对话
  const confirmDeleteConversation = async (e, conversationId) => {
    e.stopPropagation();
    if (onDeleteConversation) {
      await onDeleteConversation(conversationId);
    }
    setShowDeleteConfirm(null);
  };

  // 开始编辑对话标题
  const handleStartEdit = (e, conversation) => {
    e.stopPropagation();
    setEditingChat(conversation._id);
    setEditTitle(conversation.title);
  };

  // 确认重命名
  const handleConfirmRename = (e, conversationId) => {
    e.stopPropagation();
    if (editTitle.trim() && onRenameConversation) {
      onRenameConversation(conversationId, editTitle.trim());
    }
    setEditingChat(null);
    setEditTitle('');
  };

  // 取消重命名
  const handleCancelRename = (e) => {
    e.stopPropagation();
    setEditingChat(null);
    setEditTitle('');
  };

  // 处理键盘事件
  const handleEditKeyDown = (e, conversationId) => {
    if (e.key === 'Enter') {
      handleConfirmRename(e, conversationId);
    } else if (e.key === 'Escape') {
      handleCancelRename(e);
    }
  };

  // 获取折叠宽度
  const getSidebarWidth = () => {
    if (collapsed) return 60;
    return 320;
  };

  return (
    <Box
      sx={{
        width: getSidebarWidth(),

        height: '100vh',
        background: `linear-gradient(135deg, ${colors.background} 0%, #f9f0d9 100%)`,
        borderRight: `1px solid ${colors.gray[200]}`,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s ease-out',
        overflow: 'hidden'
      }}
    >
      {/* 顶部操作区 */}
      <Box
        sx={{
          p: collapsed ? 1 : 2,
          borderBottom: `0`,
          display: 'flex',
          alignItems: 'center',
          gap: collapsed ? 1 : 1,
          transition: 'padding 0.3s ease',
          minHeight: collapsed ? '60px' : 'auto',
          justifyContent: 'flex-end',
          flexWrap: collapsed ? 'wrap' : 'nowrap'
        }}
      >
        {/* 新建对话按钮 */}
        <Tooltip title="新建对话" placement="bottom">
          <IconButton
            onClick={onNewChat}
            sx={{
              backgroundColor: 'transparent',
              color: colors.primary,
              '&:hover': {
                backgroundColor: colors.secondary,
                color: colors.text.primary,
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s ease',
              flexShrink: 0,
              ml: collapsed ? 0 : 'auto',
              order: collapsed ? 1:2,
              mb: collapsed ? 1 : 0,
              borderRadius: 2,
              display: collapsed ? 'none' : 'inline-flex'
            }}
            size="small"
          >
            <AddIcon />
          </IconButton>
        </Tooltip>

        {/* 搜索框 */}
        <Box sx={{ flex: 1, ml: collapsed ? 0 : 1, display: collapsed ? 'none' : 'block' }}>
          <TextField
            fullWidth
            placeholder="搜索对话..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: 'white',
                '& fieldset': {
                  borderColor: colors.gray[300]
                },
                '&:hover fieldset': {
                  borderColor: colors.secondary
                },
                '&.Mui-focused fieldset': {
                  borderColor: colors.primary
                }
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: colors.gray[400], fontSize: 18 }} />
                </InputAdornment>
              )
            }}
          />
        </Box>

        {/* 折叠按钮 - 折叠时放在顶部 */}
        <Tooltip title={collapsed ? "展开" : "折叠"} placement="bottom">
          <IconButton
            onClick={() => setCollapsed(!collapsed)}
            sx={{
              color: colors.primary,
              backgroundColor: 'transparent',
              '&:hover': {
                backgroundColor: colors.secondary,
                color: colors.text.primary,
                transform: 'scale(1.05)'
              },
              transition: 'all 0.2s ease',
              flexShrink: 0,
              ml: collapsed ? 0 : 'auto',
              order: collapsed ? 1 : 2,
              mb: collapsed ? 1 : 0,
              borderRadius: 2
            }}
            size="small"
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Tooltip>
      </Box>

      {/* 聊天列表 */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          py: 1,
          // 设置纵向滚动条样式为主题色
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#ce7a74',  /* 使用主题色 */
            borderRadius: '4px',
            '&:hover': {
              background: '#b56560',  /* 悬停时稍微深一点的颜色 */
            }
          },
          // Firefox滚动条样式
          scrollbarWidth: 'thin',
          scrollbarColor: '#ce7a74 rgba(255, 255, 255, 0.1)',
        }}
      >
        {Object.entries(filteredConversations).map(([group, chats]) => (
          <Box key={group} sx={{ mb: 2 }}>
            {/* 分组标题 */}
            <Typography
              variant="caption"
              sx={{
                px: collapsed ? 1 : 2,
                py: 0.5,
                color: colors.gray[500],
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: collapsed ? 'none' : 'block'
              }}
            >
              {group}
            </Typography>

            <List sx={{ py: 0 }}>
              {chats.map((conversation) => (
                <Tooltip
                  key={conversation._id}
                  title={collapsed ? conversation.title : ""}
                  placement="right"
                >
                  <ListItem
                    button="true"
                    // 检查是否是当前选中的会话，比较_id字段
                    selected={selectedConversation && selectedConversation._id === conversation._id}
                    onClick={() => onConversationSelect(conversation)}
                    onMouseEnter={() => setHoveredChat(conversation._id)}
                    onMouseLeave={() => setHoveredChat(null)}
                    sx={{
                      px: collapsed ? 1 : 2,
                      py: collapsed ? 1 : 1.5,

                      mb: 0.5,
                      mx: 0,
                      borderRadius: 2,
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      backgroundColor: selectedConversation && selectedConversation._id === conversation._id
                        ? 'rgba(228, 116, 112, 0.1)'
                        : hoveredChat === conversation._id
                          ? 'rgba(243, 216, 75, 0.15)'
                          : 'transparent',
                      borderLeft: selectedConversation && selectedConversation._id === conversation._id
                        ? `4px solid ${colors.primary}`
                        : '4px solid transparent',
                      '&:hover': {
                        backgroundColor: hoveredChat === conversation._id
                          ? 'rgba(243, 216, 75, 0.2)'
                          : 'rgba(243, 216, 75, 0.15)'
                      },
                      '&::after': conversation.unread ? {
                        content: '""',
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: colors.accent,
                        display: collapsed ? 'none' : 'block'
                      } : {}
                    }}
                  >
                    {/* 聊天信息 */}
                    <Box sx={{ flex: 1, minWidth: 0, display: collapsed ? 'none' : 'block' }}>
                      {!collapsed && (
                        <>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            {editingChat === conversation._id ? (
                              // 编辑模式
                              <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TextField
                                  value={editTitle}
                                  onChange={(e) => setEditTitle(e.target.value)}
                                  onKeyDown={(e) => handleEditKeyDown(e, conversation._id)}
                                  size="small"
                                  autoFocus
                                  sx={{
                                    flex: 1,
                                    '& .MuiOutlinedInput-root': {
                                      fontSize: '0.875rem',
                                      fontWeight: 500,
                                      padding: '4px 8px',
                                      minHeight: '32px'
                                    }
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleConfirmRename(e, conversation._id)}
                                  sx={{
                                    color: colors.primary,
                                    '&:hover': {
                                      backgroundColor: 'rgba(228, 116, 112, 0.1)'
                                    }
                                  }}
                                >
                                  <CheckIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={handleCancelRename}
                                  sx={{
                                    color: colors.gray[500],
                                    '&:hover': {
                                      backgroundColor: 'rgba(153, 153, 153, 0.1)'
                                    }
                                  }}
                                >
                                  <CloseIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                              </Box>
                            ) : (
                              // 正常显示模式
                              <ListItemText
                                primary={
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontWeight: selectedConversation === conversation._id ? 600 : 500,
                                      color: colors.text.primary,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}
                                  >
                                    {conversation.title}
                                  </Typography>
                                }
                                secondary={
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      color: colors.gray[500],
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      display: 'block'
                                    }}
                                  >
                                    {conversation.lastMessage}
                                  </Typography>
                                }
                              />
                            )}

                            {/* 时间戳 */}
                            {(editingChat !== conversation._id && (
                              <Typography
                                variant="caption"
                                sx={{
                                  color: colors.gray[400],
                                  fontSize: '0.7rem',
                                  ml: 1,
                                  whiteSpace: 'nowrap',
                                  // 在悬停时隐藏时间戳
                                  display: hoveredChat === conversation._id ? 'none' : 'block'
                                }}
                              >
                                {formatTime(conversation.updatedAt)}
                              </Typography>
                            ))}
                          </Box>

                          {/* 操作按钮 */}
                          {editingChat !== conversation._id && hoveredChat === conversation._id && (
                            <Box sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 0.5 }}>
                              {showDeleteConfirm === conversation._id ? (
                                // 删除确认模式
                                <Box sx={{ 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  gap: 1, 
                                  backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                                  borderRadius: 2, 
                                  px: 1, 
                                  py: 0.5,
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}>
                                  <Typography variant="body2" sx={{ color: colors.accent, fontWeight: 600, minWidth: 'fit-content' }}>
                                    确认删除?
                                  </Typography>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => confirmDeleteConversation(e, conversation._id)}
                                    sx={{
                                      color: colors.accent,
                                      '&:hover': {
                                        backgroundColor: 'rgba(193, 92, 84, 0.2)'
                                      },
                                      padding: '4px',
                                      minWidth: '32px',
                                      minHeight: '32px'
                                    }}
                                  >
                                    <CheckIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowDeleteConfirm(null);
                                    }}
                                    sx={{
                                      color: colors.gray[600],
                                      '&:hover': {
                                        backgroundColor: 'rgba(153, 153, 153, 0.2)'
                                      },
                                      padding: '4px',
                                      minWidth: '32px',
                                      minHeight: '32px'
                                    }}
                                  >
                                    <CloseIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                </Box>
                              ) : (
                                // 正常操作按钮
                                <>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleStartEdit(e, conversation)}
                                    sx={{
                                      color: colors.gray[400],
                                      '&:hover': {
                                        color: colors.secondary,
                                        backgroundColor: 'rgba(243, 216, 75, 0.1)'
                                      }
                                    }}
                                  >
                                    <EditIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleDeleteConversation(e, conversation)}
                                    sx={{
                                      color: colors.gray[400],
                                      '&:hover': {
                                        color: colors.accent,
                                        backgroundColor: 'rgba(193, 92, 84, 0.1)'
                                      }
                                    }}
                                  >
                                    <DeleteIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </>
                              )}
                            </Box>
                          )}
                        </>
                      )}
                    </Box>

                    {/* 折叠模式下的简单显示 */}
                    <Box sx={{ display: collapsed ? 'flex' : 'none', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: selectedConversation === conversation._id ? '#8B0000' : '#A0522D',
                          fontSize: '0.7rem',
                          writingMode: 'vertical-rl',
                          textOrientation: 'mixed',
                          fontWeight: selectedConversation === conversation._id ? 600 : 500
                        }}
                      >
                        {conversation.title.slice(0, 8)}
                      </Typography>
                    </Box>
                  </ListItem>
                </Tooltip>
              ))}
            </List>
          </Box>
        ))}

        {/* 空状态 */}
        {Object.keys(filteredConversations).length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
            <Typography variant="h6" sx={{ fontSize: collapsed ? 'medium' : '2.5rem', color: colors.gray[300], mb: 2}}>
              💬
            </Typography>
            <Typography variant="body2" sx={{ justifyContent: 'center', color: colors.gray[500], writingMode: collapsed ? 'vertical-rl' : 'horizontal-tb', textOrientation: 'mixed',overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              
              {searchTerm ? '没有找到相关对话' : '还没有对话 ，开始一个新的吧 ！ '} 
              {collapsed ? ' ' : <br/>}
              {collapsed ? '' : '点击上方 + 图标来新建对话'} 
              
            </Typography>
            
          </Box>
        )}
      </Box>
      
      {/* 认证按钮 */}
      <Box sx={{ 
        minHeight: '60px',  // 固定最小高度，保持折叠/展开时高度一致
        maxHeight: '60px',  // 固定最大高度，防止内容超出
        width: '100%',  // 宽度100%，与其他项对齐
        display: 'flex',
        alignItems: 'center'
      }}>
        <AuthButton collapsed={collapsed} />
      </Box>
    </Box>
  );
};

export default Sidebar;