import React from 'react';
import { Box } from '@mui/material';
import styled from 'styled-components';
import { colors } from '../theme';
import ChatHistory from './ChatHistory';
import MessageInput from './MessageInput';

const ChatContainer = styled(Box)`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: ${colors.background};
  margin-left: 0;
  transition: margin-left 0.3s ease-out;
  width: 100%;
`;

const ChatHeader = styled(Box)`
  background: ${colors.background};
  padding: 12px 24px;  /* 减小头部padding，给内容更多空间 */
  min-height: 60px;  /* 设置最小高度，与侧边栏顶部容器高度一致 */
  display: flex;
  border: 0;
  align-items: center;
  position: sticky;
  top: 0;
  z-index: 100;
`;

const ChatContent = styled(Box)`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;  /* 保持隐藏，但允许子元素有自己的滚动条 */
  min-height: 0;  /* 确保flex布局正确工作，允许子元素收缩 */
`;

const ChatArea = ({ 
  messages, 
  onSendMessage, 
  currentConversation,
  isStreaming,
  sidebarCollapsed = false,
}) => {

  return (
    <ChatContainer $sidebarCollapsed={sidebarCollapsed}>
      {/* 聊天头部 */}
      <ChatHeader>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',backgroundColor: 'transparent' }}>
          <Box sx={{ backgroundColor: 'transparent' }}>
            <h2 style={{ margin: 0, color: colors.primary, fontSize: '1.25rem' ,backgroundColor: 'transparent' }}>
              {currentConversation?.title || ''}
            </h2>
            
          </Box>
        </Box>
      </ChatHeader>

      {/* 聊天内容区域 */}
      <ChatContent>
        <ChatHistory 
          messages={messages} 
          streamingMessage={isStreaming && messages.length > 0 && !messages[messages.length - 1].isUser && !messages[messages.length - 1].isSynced ? messages[messages.length - 1].content : ''}
          isStreaming={isStreaming}
        />
        <MessageInput 
          onSendMessage={onSendMessage}
          disabled={isStreaming}
        />
      </ChatContent>
    </ChatContainer>
  );
};

export default ChatArea;