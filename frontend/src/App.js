import { useState, useEffect, useCallback } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Snackbar, Alert, Typography, Container } from '@mui/material';
import { theme } from './theme';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import LoginModal from './components/LoginModal';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { getUserConversations, getConversationMessages, createConversation, renameConversation, deleteConversation } from './services/api';
import { convertBackendMessages } from './utils/messageUtils';
import socketService from './services/socketService';
import { useNavigate, useParams, useLocation, Routes, Route } from 'react-router-dom';

// 主要的应用内容组件，在AuthProvider内部使用useAuth
function AppContent() {



  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]); // 从后端获取消息列表
  const [selectedConversation, setSelectedConversation] = useState(null); // 存储完整的对话对象
  const [isLoading, setIsLoading] = useState(false); // 控制对话加载状态
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const { isAuthenticated, user, token } = useAuth();
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const location = useLocation();
  // 控制提示消息的状态
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');


  // 处理提示消息的显示
  const showSnackbar = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };


  // 初始化Socket连接
  useEffect(() => {
    if (isAuthenticated && token) {
      // 连接Socket服务器
      const socketUrl = process.env.REACT_APP_SOCKET_URL;
      socketService.connect(socketUrl);

      // 设置Socket事件监听
      socketService.on('connect', () => {
        setSocketConnected(true);
        // 连接成功后进行认证
        socketService.authenticate(token);
        // 加载对话列表
        loadConversations();
      });

      socketService.on('disconnect', () => {
        console.log('Socket连接断开');
        setSocketConnected(false);
      });

      socketService.on('authenticated', (data) => {
        if (data.success) {
          console.log('Socket认证成功');
        } else {
          console.error('Socket认证失败:', data.error);
        }
      });

      // 监听消息同步
      socketService.on('message_sync', handleMessageSync);

      // 监听对话同步
      socketService.on('conversation_sync', handleConversationSync);

      // 监听错误事件
      socketService.on('messageError', (error) => {
        console.error('消息错误:', error);
      });

      socketService.on('conversationError', (error) => {
        console.error('对话错误:', error);
      });
    }

    // 清理函数
    return () => {
      socketService.off('connect');
      socketService.off('disconnect');
      socketService.off('authenticated');
      socketService.off('message_sync');
      socketService.off('conversation_sync');
      socketService.off('messageError');
      socketService.off('conversationError');
      socketService.disconnect();
    };
  }, [isAuthenticated, token]);

  // 加载对话列表
  const loadConversations = async () => {
    if (!isAuthenticated || !token) return;

    try {
      const response = await getUserConversations(token);

      const convs = response.conversations || [];
      setConversations(convs);

      // 尝试从URL中获取对话ID（增强版）
      let urlConversationId = conversationId;

      // 如果useParams没有获取到，尝试从location.pathname手动解析
      if (!urlConversationId && location.pathname.includes('/conversation/')) {
        const pathParts = location.pathname.split('/');
        const index = pathParts.indexOf('conversation');
        if (index !== -1 && pathParts.length > index + 1) {
          urlConversationId = pathParts[index + 1];
        }
      }

      // 优先检查URL中的对话ID
      if (urlConversationId) {
        const conv = convs.find(c => c._id === urlConversationId);
        if (conv) {
          setSelectedConversation(conv);
          loadConversationMessages(urlConversationId);
          return; // 已找到URL指定的对话，不需要继续
        }

      }
      if (convs.length > 0) {
        setSelectedConversation(convs[0]);

        loadConversationMessages(convs[0]._id);
      }

    } catch (error) {
      console.error('加载对话列表失败:', error);
      // 出错时如果没有对话，也尝试创建一个新对话
      if (isAuthenticated && !conversations.length) {
        handleNewChat();
      }
    }
  };


  // 加载对话消息
  const loadConversationMessages = async (convId) => {
    if (!isAuthenticated || !token) return;

    try {
      const response = await getConversationMessages(convId, token);
      const convertedMessages = convertBackendMessages(response.messages);
      // 确保所有消息都有isSynced属性
      const messagesWithSync = convertedMessages.map(msg => ({
        ...msg,
        isSynced: false
      }));
      setMessages(messagesWithSync);
    } catch (error) {
      console.error('加载对话消息失败:', error);
    }
  };

  // 处理对话选择
  const handleConversationSelect = useCallback((conversation) => {
    // 防御性编程：确保conversation不为undefined或null
    if (!conversation) {
      console.warn('尝试选择无效的对话');
      return;
    }

    // 确保存储完整的对话对象
    let conversationObj;
    if (typeof conversation === 'string') {
      // 统一ID字段处理
      conversationObj = conversations.find(conv =>
        conv && (conv._id === conversation)
      );

      // 添加错误处理：对话不存在时的提示
      if (!conversationObj) {
        showSnackbar('所选对话不存在，请刷新页面后重试', 'error');
        console.error('对话不存在:', conversation);
        return;
      }
    } else {
      conversationObj = conversation;
    }

    if (conversationObj) {
      // 优化性能：避免重复选择同一个对话
      const currentConvId = selectedConversation?._id;
      const newConvId = conversationObj._id;

      if (currentConvId !== newConvId) {
        setSelectedConversation(conversationObj);
        setIsLoading(true); // 显示加载状态

        loadConversationMessages(newConvId)
          .finally(() => {
            setIsLoading(false); // 加载完成后隐藏加载状态
          });

        navigate(`/conversation/${newConvId}`);
      }
    }
  }, [conversations, navigate, selectedConversation, showSnackbar]);

  // 处理新聊天创建
  const handleNewChat = async () => {
    if (!isAuthenticated || !token) {
      setLoginModalOpen(true);
      return;
    }
    if (isLoading) {
      showSnackbar('请稍后，当前正在处理中', 'warning');
      return;
    }

    try {
      // 格式化当前时间为更友好的显示格式
      const now = new Date();
      const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const conversationName = `对话 ${formattedDate}`;

      const response = await createConversation(token, conversationName);
      const newConversation = response.conversation;
      console.log('新对话创建成功:', newConversation);

      // 更新对话列表
      setConversations(prev => [newConversation, ...prev]);


      // 选择新创建的对话
      handleConversationSelect(newConversation);

    } catch (error) {
      console.error('创建新对话失败:', error);
    }
  };



  // 处理消息发送
  const handleSendMessage = async (content) => {
    if (!isAuthenticated || !token) {
      showSnackbar('请先登录', 'warning');
      setTimeout(() => {
        setLoginModalOpen(true);
      }, 1000);
      return;
    }
    if (!selectedConversation) {
      showSnackbar('请先选择一个对话', 'warning');
      return;
    }
    if (!isAuthenticated || !token || !selectedConversation || !content.trim()) return;

    if (isStreaming) {
      showSnackbar('请稍后，当前正在处理中', 'warning');
      return;
    }

    try {
      setIsStreaming(true);

      // 获取对话ID
      const convId = selectedConversation._id;

      // 创建用户消息对象
      const userMessage = {
        content: content.trim(),
        isUser: true,
        timestamp: new Date().toISOString(),
        type: 'user'
      };

      // 先将用户消息添加到本地消息列表
      setMessages(prev => [...prev, userMessage]);

      // 使用Socket发送流式消息
      socketService.emit('send_stream_message', {
        content: content.trim(),
        conversationId: convId
      });

    } catch (error) {
      console.error('发送消息失败:', error);
      setIsStreaming(false);
    }
  };


  // 处理对话重命名
  const handleRenameConversation = async (conversationId, newTitle) => {
    if (!isAuthenticated || !token) return;

    try {
      await renameConversation(conversationId, newTitle, token);
      // 更新本地对话列表
      setConversations(prev =>
        prev.map(conv =>
          conv._id === conversationId
            ? { ...conv, title: newTitle }
            : conv
        )
      );
    } catch (error) {
      console.error('重命名对话失败:', error);
    }
  };

  // 处理对话删除
  const handleDeleteConversation = async (conversationToDelete) => {
    if (!isAuthenticated || !token) return;

    // 获取要删除的对话ID
    const conversationId = typeof conversationToDelete === 'string'
      ? conversationToDelete
      : conversationToDelete._id;

    try {
      await deleteConversation(conversationId, token);

      // 获取当前选中对话的ID
      const selectedConvId = selectedConversation?._id;

      // 从本地对话列表中删除，并获取更新后的对话列表
      setConversations(prev => {
        const updatedConversations = prev.filter(conv => conv._id !== conversationId);

        // 如果删除的是当前选中的对话，清除选择并处理后续逻辑
        if (selectedConvId === conversationId) {
          setSelectedConversation(null);
          setMessages([]);
          navigate('/');

          // 根据更新后的对话列表状态决定后续操作
          if (updatedConversations.length > 0) {
            // 如果还有其他对话，选择第一个
            const firstConv = updatedConversations[0];
            // 使用setTimeout确保状态更新后再执行选择操作
            setTimeout(() => {
              setSelectedConversation(firstConv);
              loadConversationMessages(firstConv._id);
              navigate(`/conversation/${firstConv._id}`);
            }, 0);
          } else {
            // 如果没有对话了，创建新对话
            setTimeout(() => {
              handleNewChat();
            }, 0);
          }
        }

        return updatedConversations;
      });
    } catch (error) {
      console.error('删除对话失败:', error);
    }
  };

  // 处理侧边栏切换
  const handleSidebarToggle = () => {
    setSidebarCollapsed(prev => !prev);
  };

  // 处理消息同步
  const handleMessageSync = (data) => {

    // 如果是当前选中的对话，更新messages状态
    if (window.location.href.split('/').filter(Boolean).pop() === data.conversationId) {
      switch (data.type) {
        case 'stream_user_message':
          // 添加同步的用户消息
          setMessages(prev => {
            // 获取当前socket的ID
            const currentSocketId = socketService.getSocketId();


            if (data.from && data.from === currentSocketId) {
              setIsStreaming(true);
              // 修改：添加一个占位符内容，确保消息能够显示
              return [...prev, {
                content: '',
                isUser: false,
                timestamp: data.timestamp || new Date().toISOString(),
                type: 'assistant',
                isSynced: false,
                _id: `temp-${Date.now()}` // 添加临时ID，避免被流式渲染逻辑隐藏
              }];
            }
            return [...prev, {
              content: data.content,
              isUser: true,
              timestamp: data.timestamp || new Date().toISOString(),
              type: 'user',
              isSynced: true
            }, {
              content: '',
              isUser: false,
              timestamp: data.timestamp || new Date().toISOString(),
              type: 'assistant',
              isSynced: false
            }];
          });
          break;
        case 'stream_ai_message':
          // 设置isStreaming为true，确保同步设备上的状态一致
          setIsStreaming(true);
          // 添加或更新同步的AI消息
          setMessages(prev => {
            let updatedMessages = [...prev];

            // 获取最后一条消息的当前内容，并追加新的内容
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            const currentContent = lastMessage?.content || '';
            const newContent = currentContent + data.content;

            updatedMessages[updatedMessages.length - 1] = {
              timestamp: lastMessage?.timestamp || Date.now(),
              isUser: false,
              type: 'assistant',
              content: newContent,
              isSynced: false
            };
            return updatedMessages;
          });
          break;
        case 'stream_ai_message_end':
          // 流式响应结束
          setIsStreaming(false);
          // 更新最后一条消息，标记为已同步
          setMessages(prev => {
            const updatedMessages = [...prev];
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (lastMessage &&
              !lastMessage.isUser &&
              lastMessage.type === 'assistant' &&
              lastMessage._id === data.messageId) {
              updatedMessages[updatedMessages.length - 1] = {
                ...lastMessage,
                isSynced: false
              };
            }
            return updatedMessages;
          });
          break;
        default:
          break;
      }
    }
  };

  // 处理对话同步
  const handleConversationSync = (data) => {
    // 获取当前选中对话的ID

    switch (data.type) {
      case 'conversation_created':
        // 添加新创建的对话
        showSnackbar(`对话 ${data.conversationId} 已创建，刷新后生效`);
        break;
      case 'conversation_renamed':
        showSnackbar(`对话 ${data.conversationId} 已重命名为 ${data.newTitle}, 刷新后生效`);
        break;
      case 'conversation_deleted':
        // 删除对话
        showSnackbar(`对话 ${data.conversationId} 已删除，刷新后生效`);
        break;
      default:
        break;
    }
  };

  // 关闭登录模态框
  const handleCloseLoginModal = () => {
    setLoginModalOpen(false);
  };

  // 当用户认证状态改变时重新加载数据
  useEffect(() => {
    if (isAuthenticated && token) {
      loadConversations();
    } else {
      setConversations([]);
      setMessages([]);
      setSelectedConversation(null);
    }
  }, [isAuthenticated, token]);

  // 当URL中的对话ID改变时加载对应的对话
  useEffect(() => {
    // 尝试从URL路径中获取对话ID
    let urlConversationId = conversationId;

    // 如果useParams没有获取到，尝试从location.pathname手动解析
    if (!urlConversationId && location.pathname.includes('/conversation/')) {
      const pathParts = location.pathname.split('/');
      const index = pathParts.indexOf('conversation');
      if (index !== -1 && pathParts.length > index + 1) {
        urlConversationId = pathParts[index + 1];
      }
    }

    if (urlConversationId && isAuthenticated) {
      const conv = conversations.find(c => c._id === urlConversationId);
      if (conv) {
        // 检查当前选中的对话是否与URL参数匹配
        const currentConvId = selectedConversation?._id;
        if (currentConvId !== urlConversationId) {
          setSelectedConversation(conv);
          loadConversationMessages(urlConversationId);
        }
      } else if (!selectedConversation && conversations.length > 0) {
        // 如果URL参数的对话不存在但有其他对话，则选择第一个
        const firstConv = conversations[0];
        setSelectedConversation(firstConv);
        loadConversationMessages(firstConv._id);
        navigate(`/conversation/${firstConv._id}`);
      }
    } else if (!urlConversationId && selectedConversation && isAuthenticated) {
      // 如果URL中没有对话ID但当前有选中的对话，同步URL
      const convId = selectedConversation._id;
      navigate(`/conversation/${convId}`);
    }
  }, [conversationId, conversations, isAuthenticated, selectedConversation, navigate, location.pathname]);


  // 移动端提示组件
  const MobileWarning = () => (
    <Container maxWidth="sm" style={{ textAlign: 'center', marginTop: '50px' }}>
      <Typography variant="h4" gutterBottom style={{ color: '#e47470' }}>
        📱 温馨提示
      </Typography>
      <Typography variant="h4" gutterBottom style={{ color: '#e47470' }}>
        在手机上不可用<br />请移步电脑端
      </Typography>
      <Typography variant="h6" gutterBottom style={{ color: '#333333' }}>
        抱歉，这里似乎没有为小屏幕准备的魔法配方！
      </Typography>
      <Typography variant="body1" gutterBottom style={{ color: '#666666' }}>
        本应用目前只在电脑端施展它的超能力，为了给您带来最佳体验，
        请在电脑上访问我们，让聊天超人发挥全部实力！
      </Typography>
      <Typography variant="body2" style={{ marginTop: '20px', color: '#999999' }}>
        我们正在努力调配移动端的魔法药水，敬请期待！✨
      </Typography>
    </Container>
  );

  if (window.innerWidth <= 768) {
    return <MobileWarning />;
  }


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{
        display: 'flex',
        height: '100vh',
        minHeight: '100vh',
        maxHeight: '100vh',
        width: '100vw',
        overflow: 'hidden', // 完全禁止滚动，总是显示顶部内容
        position: 'fixed', // 固定定位确保内容固定在顶部
        top: 0,
        left: 0,
        scrollBehavior: 'auto' // 禁用平滑滚动
      }}>
        <Routes>
          <Route path="/" element={
            <>
              <Sidebar
                conversations={conversations}
                selectedConversation={selectedConversation}
                onConversationSelect={handleConversationSelect}
                onNewChat={handleNewChat}
                onRenameConversation={handleRenameConversation}
                onDeleteConversation={handleDeleteConversation}
                collapsed={sidebarCollapsed}
                onToggle={handleSidebarToggle}
              />
              <ChatArea
                messages={messages}
                onSendMessage={handleSendMessage}
                loading={loading}
                isStreaming={isStreaming}
                currentConversation={selectedConversation}
              />
              <LoginModal
                open={loginModalOpen}
                onClose={handleCloseLoginModal}
              />
            </>
          } />
          <Route path="/conversation/:conversationId" element={
            <>
              <Sidebar
                conversations={conversations}
                selectedConversation={selectedConversation}
                onConversationSelect={handleConversationSelect}
                onNewChat={handleNewChat}
                onRenameConversation={handleRenameConversation}
                onDeleteConversation={handleDeleteConversation}
                collapsed={sidebarCollapsed}
                onToggle={handleSidebarToggle}
              />
              <ChatArea
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isStreaming}
                currentConversation={selectedConversation}
              />
              <LoginModal
                open={loginModalOpen}
                onClose={handleCloseLoginModal}
              />
            </>
          } />
        </Routes>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
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
      </Box>
    </ThemeProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
