import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Paper, Chip } from '@mui/material';
import { AttachFile, Mic } from '@mui/icons-material';
import styled from 'styled-components';
import { colors } from '../theme';

const InputContainer = styled(Paper)`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  margin: 16px;
  border-radius: 24px;
  background: linear-gradient(135deg, ${colors.primary}15, ${colors.secondary}15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 
      0 12px 40px rgba(0, 0, 0, 0.15),
      inset 0 1px 0 rgba(255, 255, 255, 0.8);
  }
  
  &.focused {
    border-color: ${colors.primary};
    box-shadow: 
      0 0 0 3px ${colors.primary}30,
      0 8px 32px rgba(0, 0, 0, 0.1);
  }

  
`;

const StyledTextField = styled(TextField)`
  flex: 1;
  margin: 0 8px;
  

  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: ${colors.primary} transparent;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: ${colors.primary};
    border-radius: 3px;
  }

  & .MuiOutlinedInput-root {
    background: transparent;
    border-radius: 20px;
    border: none;
    
    & fieldset {
      border: none;
    }
    
    &.Mui-focused fieldset {
      border: none;
    }
    
    input, textarea {
      padding: 12px 16px;
      font-size: 16px;
      line-height: 1.5;
      color: ${colors.gray[800]};
      overflow: auto; /* 溢出隐藏 */
      text-overflow: ellipsis; /* 超出显示省略号 */
      
      &::placeholder {
        color: ${colors.gray[500]};
        opacity: 0.8;
      }
    }
  }
`;

const ActionButton = styled(IconButton)`
  background: rgba(255, 255, 255, 0.8);
  color: ${colors.gray[600]};
  border-radius: 50%;
  padding: 10px;
  margin: 0 2px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 1);
    color: ${colors.primary};
    transform: scale(1.1);
  }
  
  &:disabled {
    background: rgba(255, 255, 255, 0.4);
    color: ${colors.gray[400]};
  }
`;

const PromptChip = styled(Chip)`
  margin: 4px;
  background: linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}20);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, ${colors.primary}30, ${colors.secondary}30);
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    transform: none;
  }
`;

const PromptContainer = styled(Box)`
  display: flex;
  flex-wrap: nowrap;
  padding: 8px 16px;
  margin-bottom: -8px;
  gap: 4px;
  overflow-x: hidden;
  height: 60px;
  align-items: flex-end;
  min-height: 60px;
`;

const MessageInput = ({ onSendMessage, disabled = false, isStreaming }) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  const handleSend = () => {
    if (message.trim() && !disabled && !isStreaming) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  // 处理提示词按钮点击，添加提示词到输入框
  const handlePromptChipClick = (promptText) => {
    if (!isStreaming) {
      setMessage(prev => promptText);
      // 聚焦到输入框
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // 预设提示词按钮配置
  const promptButtons = [
    {
      label: '角色扮演',
      prompt: '你现在要随机挑选一个经典卡通人物进行角色扮演，完全模仿他的语言风格、神态表情和性格特点。用口语化、天真可爱的方式回答问题，用括号描述它的神态。'
    },
    {
      label: '蜡笔小新',
      prompt: '你现在要扮演蜡笔小新，保持蜡笔小新的说话风格和性格特点，用口语化、天真可爱的方式回答问题，带点搞怪和调皮(比如"哎呀，好麻烦啊～")，经常说"动感光波～"，说话时可以加上一些小新式的口头禅和表情描述(比如"嘿嘿嘿"、"好麻烦呐")。'
    },
    {
      label: '唐老鸭',
      prompt: '你现在要扮演唐老鸭，保持唐老鸭独特的说话方式，稍微有点口吃，用词简单直接，语气生动有趣，口头禅是"嘎嘎"(Gah Gah)，说话时可以加上唐老鸭式的愤怒或兴奋表情描述(比如"嘎嘎!气死我了!"或"嘎嘎!太棒了!")。'
    },
    {
      label: '孙悟空',
      prompt: '你现在要扮演孙悟空，保持孙悟空的说话风格和性格特点，说话豪爽直接，偶尔带点猴儿的机灵劲儿(比如"嘿嘿，俺老孙有办法了!")，喜欢用"俺老孙"自称，遇到问题时会说"看俺老孙的七十二变"，说话时可以加上孙悟空式的动作描述(比如"抓耳挠腮"、"腾云驾雾")。'
    },
    {
      label: '海绵宝宝',
      prompt: '你现在要扮演海绵宝宝，保持海绵宝宝的说话风格和性格特点，说话充满活力和乐观(比如"哈哈哈，太有趣了!")，经常说"我准备好了!"，遇到开心的事情会说"哈哈哈，太有趣了!"，说话时可以加上海绵宝宝式的兴奋动作描述(比如"手舞足蹈"、"眼睛发光")。'
    },
    {
      label: '英文翻译',
      prompt: '请将以下内容翻译成英语：'
    },
    {
      label: '代码解释',
      prompt: '请解释以下代码的作用和原理：\n\n```\n// 在这里粘贴你的代码\n```\n\n解释：'
    },
    {
      label: '写作助手',
      prompt: '请帮我润色以下文字，使其更加生动有趣：\n\n'
    },
    {
      label: '数学专家',
      prompt: '请用LaTeX格式解答以下数学问题：$$在这里输入你的数学问题$$'
    }
  ];

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleFileAttach = () => {
    // 文件上传功能占位符
    console.log('文件上传功能');
  };

  const handleVoiceInput = () => {
    // 语音输入功能占位符
    console.log('语音输入功能');
  };

  return (
    <>
      <PromptContainer>
        {promptButtons.map((button, index) => (
          <PromptChip
            key={index}
            label={button.label}
            onClick={() => handlePromptChipClick(button.prompt)}
            disabled={isStreaming}
            clickable
            variant="outlined"
          />
        ))}
      </PromptContainer>
      
      <InputContainer 
        elevation={0} 
        className={isFocused ? 'focused' : ''}
      >
        

      <StyledTextField
        inputRef={inputRef}
        multiline
        maxRows={6}
        placeholder= {isStreaming ? "对方正在输入，别着急..." : "输入消息，按 Enter 发送，Shift+Enter 换行..."}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyPress={handleKeyPress}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        disabled={isStreaming}
        variant="outlined"
        fullWidth
        InputProps={{
          style: {
            fontSize: '16px',
            lineHeight: '1.5',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }
        }}
      />
    </InputContainer>
    </>
  );
};

export default MessageInput;