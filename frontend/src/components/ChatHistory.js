import React, { useEffect, useRef } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import styled from 'styled-components';
import { colors } from '../theme';
import Message from './Message';

const ChatHistoryContainer = styled(Box)`
  flex-grow: 1;
  background-color: ${colors.background};
  padding: 16px 20px;  /* 减小顶部和底部padding */
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;  /* 更改justify-content为flex-start */
  min-height: 0;  /* 确保flex布局正确工作 */
  
  /* 添加平滑滚动行为 */
  scroll-behavior: smooth;
  
  /* 边缘透明效果 - 仅在接近边缘时有渐变 */
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0, 0, 0, 1) 1%,
    rgba(0, 0, 0, 1) 99.5%,
    transparent 100%
  );


  
  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #ce7a74;  /* 使用主题色 */
    border-radius: 4px;
    
    &:hover {
      background: #b56560;  /* 悬停时稍微深一点的颜色 */
    }
  }
`;

// 专门用于欢迎消息的样式组件
const WelcomeMessageContainer = styled(Paper)`
  && {
    background: transparent;
    color: ${colors.text.secondary};
    padding: 24px;
    box-shadow: 0px;

    margin: 20px 0;
    text-align: center;
    animation: fadeInScale 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
    
    
    &:hover {
      transform: translateY(-5px);
      transition: all 0.3s ease;
    }
  }
`;

const WelcomeTitle = styled(Typography)`
  && {
    font-weight: 700;
    font-size: 1.8rem;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }
`;

const WelcomeText = styled(Typography)`
  && {
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 20px;
    font-weight: 500;
  }
`;


const Emoji = styled.span`
  font-size: 1.4rem;
  margin-right: 8px;
`;

const ChatHistory = ({ messages, streamingMessage, isStreaming }) => {

  const chatEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // 自动滚动到底部的函数
  const scrollToBottom = () => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  };

  // 当消息变化或流式消息更新时滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage, isStreaming]);

  // 监听容器高度变化并滚动到底部
  useEffect(() => {
    const container = chatContainerRef.current;
    if (!container) return;

    // 创建 ResizeObserver 来监听容器高度变化
    const resizeObserver = new ResizeObserver(() => {
      scrollToBottom();
    });

    resizeObserver.observe(container);

    // 清理函数
    return () => {
      resizeObserver.disconnect();
    };
  }, []);


  const getWelcomeMessage = () => {
    const now = new Date();
    const hour = now.getHours();
    let greeting = '';
    let emoji = '';

    if (hour >= 5 && hour < 9) {
      greeting = '早上好！新的一天开始了，有什么我可以帮您的吗？';
      emoji = '🌅';
    } else if (hour >= 9 && hour < 12) {
      greeting = '上午好！希望您今天过得愉快，有什么需要帮助的吗？';
      emoji = '🌤️';
    } else if (hour >= 12 && hour < 14) {
      greeting = '中午好！午餐时间到了，有什么我可以协助您的吗？';
      emoji = '☀️';
    } else if (hour >= 14 && hour < 18) {
      greeting = '下午好！工作顺利吗？有什么问题需要我帮忙的吗？';
      emoji = '🌤️';
    } else if (hour >= 18 && hour < 22) {
      greeting = '晚上好！辛苦了一天，有什么我可以为您做的吗？';
      emoji = '🌇';
    } else {
      greeting = '您好！这么晚还在工作，有什么紧急的事情需要处理吗？';
      emoji = '✨';
    }

    return { greeting, emoji };
  };

  // 渲染欢迎消息
  const renderWelcomeMessage = () => {
    const { greeting, emoji } = getWelcomeMessage();
    
    return (
      <WelcomeMessageContainer elevation={0}>
        <WelcomeTitle variant="h4">
          <Emoji>{emoji}</Emoji>
          欢迎来到聊天超人！
        </WelcomeTitle>
        <WelcomeText variant="body1">
          {greeting}
        </WelcomeText>
        <WelcomeText variant="body1">
          快来和我聊天吧，我会用超能力帮您解答各种问题！
        </WelcomeText>
      </WelcomeMessageContainer>
    );
  };

  return (
    <ChatHistoryContainer ref={chatContainerRef}>

      {(!messages.length && renderWelcomeMessage())}
      {messages.map((message, index) => {

        return (
          <div 
            key={index} 
          >
            <Message
              message={message.content}
              isUser={message.isUser}
              timestamp={message.timestamp}
              type={message.type || (message.isUser ? 'user' : 'assistant')}
              isSynced={message.isSynced}
            />
          </div>
        );
      })}
      
      
      {/* 滚动到底部的锚点 */}
      <div ref={chatEndRef} />
    </ChatHistoryContainer>
  );
};

export default ChatHistory;