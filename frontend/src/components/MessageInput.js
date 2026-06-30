import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField, IconButton, Paper, Chip } from '@mui/material';
import {
  AttachFile,
  Mic,
  ExpandLess,
  ExpandMore,
  TheaterComedy,
  ChildCare,
  SportsEsports,
  WbSunny,
  SentimentVerySatisfied,
  Translate,
  Code,
  Edit,
  Functions
} from '@mui/icons-material';
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
  && {
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid ${colors.gray[200]};
    border-radius: 20px;
    padding: 4px 8px;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    color: ${colors.text.secondary};
    font-weight: 500;
    font-size: 0.85rem;

    &:hover {
      background: rgba(228, 116, 112, 0.12);
      border-color: ${colors.primary}50;
      color: ${colors.primary};
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(228, 116, 112, 0.15);
    }

    &.MuiChip-clickable {
      &:active {
        transform: translateY(0);
      }
    }

    &.Mui-selected {
      background: ${colors.primary};
      border-color: ${colors.primary};
      color: #fff;
      box-shadow: 0 2px 12px rgba(228, 116, 112, 0.35);

      &:hover {
        background: ${colors.accent};
        border-color: ${colors.accent};
        color: #fff;
      }

      & .MuiChip-icon {
        color: #fff;
      }
    }

    & .MuiChip-icon {
      color: ${colors.primary};
      font-size: 1.1rem;
      margin-left: 4px;
    }

    &:disabled {
      opacity: 0.5;
      transform: none;
      box-shadow: none;
    }
  }
`;

const PromptContainerWrapper = styled(Box)`
  padding: 8px 16px 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PromptScrollContainer = styled(Box)`
  flex: 1;
  overflow: hidden;
  transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease;
  max-height: ${props => props.$collapsed ? '0px' : '56px'};
  opacity: ${props => props.$collapsed ? 0 : 1};
  
  & > div {
    display: flex;
    gap: 8px;
    padding: 8px 0;
    overflow-x: auto;
    scrollbar-width: thin;
    scrollbar-color: ${colors.primary}40 transparent;
    
    &::-webkit-scrollbar {
      height: 4px;
    }
    
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    
    &::-webkit-scrollbar-thumb {
      background: ${colors.primary}30;
      border-radius: 2px;
      
      &:hover {
        background: ${colors.primary}50;
      }
    }
  }
`;

const CollapseToggleButton = styled(IconButton)`
  && {
    background: rgba(255, 255, 255, 0.7);
    border: 1px solid ${colors.gray[200]};
    color: ${colors.text.secondary};
    padding: 6px;
    transition: all 0.2s ease;
    flex-shrink: 0;

    &:hover {
      background: rgba(228, 116, 112, 0.1);
      color: ${colors.primary};
      border-color: ${colors.primary}50;
    }
  }
`;

const MessageInput = ({ onSendMessage, disabled = false, isStreaming }) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const inputRef = useRef(null);

  const handleSend = () => {
    if (message.trim() && !disabled && !isStreaming) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  // 处理提示词按钮点击，添加提示词到输入框
  const handlePromptChipClick = (promptText, index) => {
    if (!isStreaming) {
      setMessage(prev => promptText);
      setSelectedPrompt(index);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  // 预设提示词按钮配置
  const promptButtons = [
    {
      label: '角色扮演',
      icon: <TheaterComedy />,
      prompt: '你现在要随机挑选一个经典卡通人物进行角色扮演，完全模仿他的语言风格、神态表情和性格特点。用口语化、天真可爱的方式回答问题，用括号描述它的神态。'
    },
    {
      label: '蜡笔小新',
      icon: <ChildCare />,
      prompt: '你现在要扮演蜡笔小新，保持蜡笔小新的说话风格和性格特点，用口语化、天真可爱的方式回答问题，带点搞怪和调皮(比如"哎呀，好麻烦啊～")，经常说"动感光波～"，说话时可以加上一些小新式的口头禅和表情描述(比如"嘿嘿嘿"、"好麻烦呐")。'
    },
    {
      label: '唐老鸭',
      icon: <SportsEsports />,
      prompt: '你现在要扮演唐老鸭，保持唐老鸭独特的说话方式，稍微有点口吃，用词简单直接，语气生动有趣，口头禅是"嘎嘎"(Gah Gah)，说话时可以加上唐老鸭式的愤怒或兴奋表情描述(比如"嘎嘎!气死我了!"或"嘎嘎!太棒了!")。'
    },
    {
      label: '孙悟空',
      icon: <WbSunny />,
      prompt: '你现在要扮演孙悟空，保持孙悟空的说话风格和性格特点，说话豪爽直接，偶尔带点猴儿的机灵劲儿(比如"嘿嘿，俺老孙有办法了!")，喜欢用"俺老孙"自称，遇到问题时会说"看俺老孙的七十二变"，说话时可以加上孙悟空式的动作描述(比如"抓耳挠腮"、"腾云驾雾")。'
    },
    {
      label: '海绵宝宝',
      icon: <SentimentVerySatisfied />,
      prompt: '你现在要扮演海绵宝宝，保持海绵宝宝的说话风格和性格特点，说话充满活力和乐观(比如"哈哈哈，太有趣了!")，经常说"我准备好了!"，遇到开心的事情会说"哈哈哈，太有趣了!"，说话时可以加上海绵宝宝式的兴奋动作描述(比如"手舞足蹈"、"眼睛发光")。'
    },
    {
      label: '英文翻译',
      icon: <Translate />,
      prompt: '请将以下内容翻译成英语：'
    },
    {
      label: '代码解释',
      icon: <Code />,
      prompt: '请解释以下代码的作用和原理：\n\n```\n// 在这里粘贴你的代码\n```\n\n解释：'
    },
    {
      label: '写作助手',
      icon: <Edit />,
      prompt: '请帮我润色以下文字，使其更加生动有趣：\n\n'
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
      <PromptContainerWrapper>
        <CollapseToggleButton
          size="small"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? '展开提示词' : '收起提示词'}
        >
          {isCollapsed ? <ExpandMore /> : <ExpandLess />}
        </CollapseToggleButton>
        <PromptScrollContainer $collapsed={isCollapsed}>
          <div>
            {promptButtons.map((button, index) => (
              <PromptChip
                key={index}
                label={button.label}
                icon={button.icon}
                onClick={() => handlePromptChipClick(button.prompt, index)}
                disabled={isStreaming}
                clickable
                className={selectedPrompt === index ? 'Mui-selected' : ''}
              />
            ))}
          </div>
        </PromptScrollContainer>
      </PromptContainerWrapper>
      
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