import React, { useMemo, useRef, useEffect, useState } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { colors } from '../theme';

const Message = ({ message, isUser, timestamp, type, isSynced = false }) => {

  // 添加淡入动画效果
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // 延迟显示以实现淡入效果
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);
    
    return () => clearTimeout(timer);
  }, []);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // 检查是否是今天
    if (date.toDateString() === now.toDateString()) {
      // 如果是今天，只显示小时和分钟
      return date.toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      // 如果不是今天，显示具体的日期和时间
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  // 使用 useMemo 缓存渲染结果，避免不必要的重新渲染
  const renderedMessage = useMemo(() => {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          // 自定义代码块样式
          
          code({node, inline, className, children, ...props}) {
            // 检查是否为代码块（通过反引号数量或className判断）
            const isCodeBlock = className || (children && children[0] && children[0].value && children[0].value.includes('\n'));
            
            // 获取文本内容
            const textContent = children && children[0] ? children[0].value : '';
            
            // 如果是代码块（多行代码或有语言标识）
            if (isCodeBlock || (textContent && textContent.includes('\n'))) {
              return (
                <pre 
                  style={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.05)', 
                    padding: '12px', 
                    borderRadius: '6px',
                    whiteSpace: 'pre-wrap',
                    fontFamily: 'monospace',
                    overflowX: 'auto'
                  }}
                >
                  <code {...props}>
                    {children}
                  </code>
                </pre>
              );
            } else {
              // 否则渲染为内联代码样式
              return (
                <code 
                  style={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.05)', 
                    padding: '2px 4px', 
                    borderRadius: '4px',
                    fontFamily: 'monospace',
                    fontWeight: 'bold',  // 添加strong效果
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'  // 添加轻微阴影增强视觉效果
                  }} 
                  {...props}
                >
                  {children}
                </code>
              );
            }
          },
          // 自定义链接样式
          a({node, ...props}) {
            return (
              <a 
                style={{ 
                  color: isUser ? '#e0e0e0' : colors.primary, 
                  textDecoration: 'underline' 
                }} 
                {...props}
              />
            );
          },
          // 自定义标题样式
          h1({node, ...props}) {
            return <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '16px 0 8px 0' }} {...props} />;
          },
          h2({node, ...props}) {
            return <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', margin: '14px 0 7px 0' }} {...props} />;
          },
          h3({node, ...props}) {
            return <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '12px 0 6px 0' }} {...props} />;
          },
          // 自定义列表样式
          ul({node, ...props}) {
            return <ul style={{ paddingLeft: '20px', margin: '8px 0' }} {...props} />;
          },
          ol({node, ...props}) {
            return <ol style={{ paddingLeft: '20px', margin: '8px 0' }} {...props} />;
          },
          li({node, ...props}) {
            return <li style={{ margin: '4px 0' }} {...props} />;
          },
          // 自定义引用块样式
          blockquote({node, ...props}) {
            return (
              <blockquote 
                style={{ 
                  borderLeft: `3px solid ${isUser ? 'rgba(255, 255, 255, 0.3)' : colors.primary}`, 
                  paddingLeft: '16px', 
                  margin: '8px 0',
                  fontStyle: 'italic'
                }} 
                {...props}
              />
            );
          },
          // 自定义表格样式
          table({node, ...props}) {
            return (
              <table 
                style={{ 
                  width: '100%', 
                  borderCollapse: 'collapse', 
                  margin: '12px 0',
                  border: `1px solid ${isUser ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`
                }} 
                {...props}
              />
            );
          },
          th({node, ...props}) {
            return (
              <th 
                style={{ 
                  padding: '8px 12px', 
                  borderBottom: `1px solid ${isUser ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                  backgroundColor: isUser ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.03)',
                  textAlign: 'left'
                }} 
                {...props}
              />
            );
          },
          td({node, ...props}) {
            return (
              <td 
                style={{ 
                  padding: '8px 12px', 
                  borderBottom: `1px solid ${isUser ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`
                }} 
                {...props}
              />
            );
          }
        }}
      >
        {message}
      </ReactMarkdown>
    );
  }, [message, isUser]);

  // 根据消息类型获取背景色
  const getBackgroundColor = () => {
    if (isUser) {
      return colors.primary;
    }
    
    switch (type) {
      case 'system':
        return '#f0f0f0'; // 系统消息使用浅灰色背景
      case 'assistant':
      default:
        return colors.secondary;
    }
  };

  // 根据消息类型获取文字颜色
  const getTextColor = () => {
    if (isUser) {
      return 'white';
    }
    
    switch (type) {
      case 'system':
        return '#666'; // 系统消息使用深灰色文字
      case 'assistant':
      default:
        return colors.accent;
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      margin: '12px 0', 
      justifyContent: isUser ? 'flex-end' : 'flex-start',
      width: '100%',
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
      transition: 'opacity 0.4s ease, transform 0.4s ease',
      animation: isVisible ? 'none' : 'fadeInUp 0.4s ease forwards'
    }}
    className="message-container"
    >
      <Box sx={{ 
        width: type === 'assistant' ? '100%' : 'auto', // assistant占100%，其他类型根据内容自适应
        maxWidth: type === 'assistant' ? '100%' : '85%', // 非assistant类型最大宽度70%
        minWidth: type === 'assistant' ? 'auto' : '100px', // 非assistant类型最小宽度200px
      }}>
        <Paper 
          elevation={type === 'system' ? 1 : 2} // 系统消息使用更浅的阴影
          sx={{ 
            padding: '16px 20px', 
            borderRadius: type === 'system' ? '12px' : '20px', // 系统消息使用更小的圆角
            backgroundColor: getBackgroundColor(), 
            color: getTextColor(), 
            boxShadow: type === 'system' ? '0 2px 8px rgba(0,0,0,0.05)' : '0 4px 12px rgba(0,0,0,0.08)',
            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
            fontStyle: type === 'system' ? 'italic' : 'normal', // 系统消息使用斜体
            overflow: 'hidden',
            '&:hover': {
              boxShadow: type === 'system' ? '0 2px 8px rgba(0,0,0,0.08)' : '0 6px 16px rgba(0,0,0,0.12)',
            }
          }}
        >
          <Box 
            sx={{ 
            fontSize: '1rem', 
            lineHeight: 1.6, 
            wordWrap: 'break-word',
            transition: 'all 1s cubic-bezier(0.4, 0, 0.2, 1)',
            opacity: 1,
            transform: 'translateY(0)',
            '& .math-display': {
              margin: '8px 0',
              overflowX: 'auto'
            },
            '& .math-inline': {
              display: 'inline-block'
            }
          }}
          >
            {renderedMessage}
          </Box>
        </Paper>
        <Typography 
          variant="caption" 
          sx={{ 
            fontSize: '0.8rem', 
            color: colors.text.light, 
            marginTop: '6px', 
            textAlign: isUser ? 'right' : 'left',
            display: 'block',
            fontWeight: 500
          }}
        >
          {formatTime(timestamp)}
          {isSynced && (
            <span style={{ marginLeft: '8px', fontSize: '0.7rem', opacity: 0.7 }}>
              🔄 同步自其他设备
            </span>
          )}
        </Typography>
      </Box>
    </Box>
  );
};

export default Message;