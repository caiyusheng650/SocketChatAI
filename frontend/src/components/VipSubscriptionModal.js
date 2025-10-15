import React, { useState, useEffect } from 'react';
import {
  Modal,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Collapse,
  Snackbar
} from '@mui/material';
import {
  Check as CheckIcon,
  AccountBalanceWallet as WalletIcon,
  Warning as WarningIcon,
  Star as StarIcon,
  Verified as VerifiedIcon,
  EmojiEvents as EmojiEventsIcon,
  LocalFireDepartment as LocalFireDepartmentIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { getVipStatus, subscribeVip } from '../services/api';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
  outline: 'none'
};

const VipSubscriptionModal = ({ open, onClose }) => {
  const { user, token } = useAuth();
  const [vipStatus, setVipStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [transactionHash, setTransactionHash] = useState(''); // 添加transactionHash状态
  const [isWalletConnected, setIsWalletConnected] = useState(false); // 添加钱包连接状态
  const [paymentSuccess, setPaymentSuccess] = useState(false); // 支付成功状态
  
  // Snackbar状态
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('info');

  // 创建一个新的关闭处理函数，用于在关闭时重置状态
  const handleClose = () => {
    // 调用原始的onClose函数
    onClose();
  };
  
  // 处理提示消息的显示
  const showSnackbar = (message, severity = 'info') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  const plans = [
    {
      id: '1month',
      name: '月度VIP',
      price: '0.000001 ETH',
      duration: '1个月',
      description: '适合短期使用',
      features: ['无限制AI对话', '抢先体验新功能'],
      popular: false
    },
    {
      id: '3months',
      name: '季度VIP',
      price: '0.000002 ETH',
      duration: '3个月',
      description: '性价比之选',
      features: ['无限制AI对话', '抢先体验新功能'],
      popular: false
    },
    {
      id: '6months',
      name: '半年VIP',
      price: '0.000003 ETH',
      duration: '6个月',
      description: '长期用户推荐',
      features: ['无限制AI对话', '抢先体验新功能'],
      popular: false
    }
  ];

  // VIP特权列表
  const vipBenefits = [
    { icon: <VerifiedIcon color="primary" />, text: '无限制AI对话次数' },
    { icon: <EmojiEventsIcon color="primary" />, text: '抢先体验新功能' }
  ];

  // 获取用户VIP状态
  useEffect(() => {
    if (open && user && token) {
      fetchVipStatus();
    }
  }, [open, user, token]);

  const fetchVipStatus = async () => {
    setLoading(true);
    
    try {
      setVipStatus(null); // 重置VIP状态
      const status = await getVipStatus(token);
      setVipStatus(status);
    } catch (err) {
      showSnackbar('获取VIP状态失败: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // 检查MetaMask是否已安装
  const isMetaMaskInstalled = () => {
    return typeof window.ethereum !== 'undefined';
  };

  // 连接MetaMask钱包
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      showSnackbar('请先安装MetaMask钱包', 'error');
      return;
    }

    try {
      // 请求连接钱包
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      setIsWalletConnected(true); // 设置钱包连接状态为true
      showSnackbar('钱包连接成功', 'success');
    } catch (err) {
      showSnackbar('连接钱包失败: ' + err.message, 'error');
    }
  };

  // 断开钱包连接
  const disconnectWallet = () => {
    setIsWalletConnected(false);
    showSnackbar('钱包已断开连接', 'info');
  };

  // 获取当前钱包地址
  const getCurrentAccount = async () => {
    if (!isMetaMaskInstalled()) {
      throw new Error('MetaMask未安装');
    }

    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length === 0) {
      throw new Error('请先连接钱包');
    }

    return accounts[0];
  };

  // 发送交易
  const sendTransaction = async (planId) => {
    if (!isMetaMaskInstalled()) {
      throw new Error('请先安装MetaMask钱包');
    }

    try {
      // 先切换到Sepolia网络
      await switchToSepoliaNetwork();

      // 获取当前账户
      const account = await getCurrentAccount();

      // 根据计划设置交易金额
      let amount;
      switch (planId) {
        case '1month':
          amount = '0.000001';
          break;
        case '3months':
          amount = '0.000002';
          break;
        case '6months':
          amount = '0.000003';
          break;
        default:
          throw new Error('无效的订阅计划');
      }

      // 发送交易
      const transactionParameters = {
        from: account,
        to: process.env.REACT_APP_VIP_WALLET_ADDRESS, // 收款地址
        value: (parseFloat(amount) * 1e18).toString(16), // 转换为十六进制的wei
        chainId: '0xaa36a7' // Sepolia测试网络ID
      };

      const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [transactionParameters]
      });

      return txHash;
    } catch (err) {
      throw new Error('交易失败: ' + err.message);
    }
  };

  // 切换到Sepolia网络
  const switchToSepoliaNetwork = async () => {
    try {
      // 尝试切换到Sepolia网络
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // Sepolia的链ID
      });
    } catch (switchError) {
      // 如果Sepolia网络未添加，则添加该网络
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0xaa36a7',
                chainName: 'Sepolia Testnet',
                rpcUrls: ['https://rpc.sepolia.org/'],
                blockExplorerUrls: ['https://sepolia.etherscan.io/'],
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
              },
            ],
          });
        } catch (addError) {
          throw new Error('添加Sepolia网络失败: ' + addError.message);
        }
      } else {
        throw new Error('切换到Sepolia网络失败: ' + switchError.message);
      }
    }
  };

  // 处理订阅
  const handleSubscribe = async (planId) => {
    if (!user || !token) {
      showSnackbar('请先登录', 'error');
      return;
    }
    if(!isWalletConnected) {
      showSnackbar('请先连接钱包', 'error');
      return;
    }

    setLoading(true);
    setSelectedPlan(planId);

    try {
      // 发送交易
      const txHash = await sendTransaction(planId);

      // 设置交易哈希
      setTransactionHash(txHash);

      // 更新用户VIP状态
      const result = await subscribeVip(planId, txHash, token);

      if (result.success) {
        // 显示支付成功动画
        setPaymentSuccess(true);
        
        // 3秒后隐藏动画
        setTimeout(() => {
          setPaymentSuccess(false);
          showSnackbar('订阅成功！您的VIP权限已激活（续期）。', 'success');
        }, 3000);
        
        setVipStatus({
          isVip: result.isVip,
          vipPlan: result.vipPlan,
          vipEndDate: result.vipEndDate
        });
      } else {
        throw new Error('订阅失败');
      }
    } catch (err) {
      showSnackbar(err.message, 'error');
    } finally {
      setLoading(false);
      setSelectedPlan(null);
    }
  };

  // 格式化日期
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Modal open={open} onClose={handleClose} aria-labelledby="vip-modal-title" aria-describedby="vip-modal-description">
      <Box sx={style}>
        <style>
          {`
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(-20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}
        </style>
        
        {/* 支付成功全屏动画 */}
        {paymentSuccess && (
          <>
            {/* 全屏背景遮罩 */}
            <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                zIndex: 9998,
                animation: 'fadeInBackground 0.5s ease-in-out',
              }}
            />
            
            {/* 动画内容 */}
            <Box
              sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 9999,
                animation: 'fadeIn 0.6s ease-in-out',
              }}
            >
              <style>
                {`
                  @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                  }
                  @keyframes fadeInBackground {
                    from { opacity: 0; }
                    to { opacity: 1; }
                  }
                  @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                  }
                  @keyframes float {
                    0% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                    100% { transform: translateY(0px); }
                  }
                  @keyframes scaleUp {
                    0% { transform: scale(0); }
                    60% { transform: scale(1.2); }
                    100% { transform: scale(1); }
                  }
                  @keyframes rotate {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                  @keyframes fillCircle {
                    0% { clip-path: polygon(50% 50%, 50% 0%, 50% 0%, 50% 0%); }
                    25% { clip-path: polygon(50% 50%, 50% 0%, 100% 0%, 100% 0%); }
                    50% { clip-path: polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%); }
                    75% { clip-path: polygon(50% 50%, 50% 0%, 100% 0%, 0% 100%); }
                    100% { clip-path: polygon(50% 50%, 50% 0%, 100% 0%, 0% 50%); }
                  }
                  @keyframes drawCheck {
                    0% { opacity: 0; transform: scale(0.2); }
                    50% { opacity: 1; transform: scale(1.1); }
                    100% { opacity: 1; transform: scale(1); }
                  }
                  .success-icon {
                    animation: pulse 1.5s infinite ease-in-out;
                  }
                  .success-text {
                    animation: float 2s infinite ease-in-out;
                  }
                  .scale-up {
                    animation: scaleUp 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                  }
                  .rotate-circle {
                    animation: rotate 15s linear infinite;
                  }
                `}
              </style>
              
              {/* 旋转背景圆圈 */}
              <Box 
                sx={{
                  position: 'absolute',
                  width: 900,
                  height: 900,
                  borderRadius: '50%',
                  border: '8px dashed rgba(76, 175, 80, 0.3)',
                  className: 'rotate-circle'
                }}
              />
              
              {/* 成功图标容器 */}
              <Box 
                sx={{ 
                  position: 'relative',
                  width: 200,
                  height: 200,
                  mb: 6,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  className: 'scale-up'
                }}
              >
                {/* 外层光环 */}
                <Box 
                  sx={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    background: 'conic-gradient(transparent, rgba(76, 175, 80, 0.8), transparent)',
                    animation: 'rotate 2s linear infinite',
                    filter: 'blur(5px)'
                  }}
                />
                
                {/* 内层光环 */}
                <Box 
                  sx={{
                    position: 'absolute',
                    width: '90%',
                    height: '90%',
                    borderRadius: '50%',
                    background: 'conic-gradient(transparent, rgba(76, 175, 80, 0.6), transparent)',
                    animation: 'rotate 3s linear infinite reverse',
                    filter: 'blur(3px)'
                  }}
                />
                
                {/* 主圆圈 */}
                <Box 
                  sx={{ 
                    position: 'relative',
                    backgroundColor: 'success.main', 
                    borderRadius: '50%', 
                    width: 180,
                    height: 180,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 15px 40px rgba(76, 175, 80, 0.4), 0 0 0 20px rgba(76, 175, 80, 0.2), 0 0 0 40px rgba(76, 175, 80, 0.1)',
                    zIndex: 1,
                    overflow: 'hidden'
                  }}
                >
                  {/* 打勾动画路径 */}
                  <Box 
                    sx={{
                      position: 'absolute',
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
                      animation: 'fillCircle 1.5s ease-in-out forwards'
                    }}
                  />
                  
                  {/* 打勾图标 */}
                  <CheckIcon 
                    sx={{ 
                      color: 'white', 
                      fontSize: 100,
                      zIndex: 2,
                      animation: 'drawCheck 1s 0.5s ease-in-out forwards',
                      opacity: 0
                    }} 
                  />
                </Box>
              </Box>
              
              {/* 文字内容 */}
              <Typography 
                variant="h2" 
                color="white" 
                fontWeight="bold"
                className="success-text"
                sx={{ 
                  mb: 4,
                  textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
                  fontSize: { xs: '2.5rem', md: '4rem' }
                }}
              >
                支付成功！
              </Typography>
              <Typography 
                variant="h5" 
                color="white"
                sx={{ 
                  mb: 6,
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                  fontSize: { xs: '1.2rem', md: '1.8rem' }
                }}
              >
                您已成功订阅VIP服务
              </Typography>
              
             
              
              {/* 底部装饰光效 */}
              <Box 
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  width: '100%',
                  height: 200,
                  background: 'linear-gradient(180deg, transparent, rgba(76, 175, 80, 0.2))',
                  filter: 'blur(30px)'
                }}
              />
            </Box>
          </>
        )}
        
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <WalletIcon color="primary" />
            <Typography id="vip-modal-title" variant="h5" component="h2" fontWeight="bold">
              VIP订阅中心
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            {!isWalletConnected ? (
              <Button
                variant="contained"
                color="primary"
                onClick={connectWallet}
                startIcon={<WalletIcon />}
                size="small"
              >
                连接钱包
              </Button>
            ) : (
              <Button
                variant="outlined"
                color="primary"
                onClick={disconnectWallet}
                size="small"
              >
                断开连接
              </Button>
            )}
            <Button
              onClick={onClose}
              variant="text"
              color="inherit"
              sx={{
                minWidth: 'auto',
                padding: 1,
                borderRadius: '50%',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <CloseIcon />
            </Button>
          </Box>
        </Box>


        {/* VIP状态和特权卡片 */}
        <Paper
          elevation={vipStatus ? 2 : 0}
          sx={{
            mb: 4,
            p: 3,
            borderRadius: 3,
            border: '1px solid #e0e0e0',
            backgroundColor: vipStatus ? 'white' : '#f5f5f5',
            minHeight: vipStatus ? 'auto' : '300px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: vipStatus ? 'flex-start' : 'center',
            opacity: vipStatus ? 1 : 0.7,
          }}
        >
          {vipStatus ? (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, width: '100%' }}>
                <Typography variant="h6" fontWeight="bold">
                  当前账户状态
                </Typography>

                {vipStatus.isVip ? (
                  <Chip
                    label="VIP用户"
                    color="success"
                    icon={<VerifiedIcon />}
                    sx={{ fontWeight: 'bold' }}
                  />
                ) : (
                  <Chip
                    label="标准用户"
                    color="default"
                    icon={<WarningIcon />}
                  />
                )}
              </Box>

              <Divider sx={{ mb: 3, width: '100%' }} />

              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4, width: '100%' }}>
                {/* 账户详情区 */}
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500, color: 'text.secondary' }}>
                    账户详情
                  </Typography>

                  <Box sx={{ display: 'grid', gap: 2 }}>
                    {vipStatus.isVip ? (
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, mt: 2 }}>
                          <Typography variant="body2" color="text.secondary">有效期至:</Typography>
                          <Typography variant="body1" fontWeight="bold">{formatDate(vipStatus.vipEndDate)}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                          <Typography variant="body2" color="text.secondary">距离到期:</Typography>
                          <Typography variant="body1" fontWeight="bold">
                            {Math.ceil((new Date(vipStatus.vipEndDate) - new Date()) / (1000 * 60 * 60 * 24))} 天
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">账户状态:</Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <VerifiedIcon size="small" sx={{ color: '#2e7d32' }} />
                            <Typography variant="body1" fontWeight="bold" color="success.main">
                              VIP特权已激活
                            </Typography>
                          </Box>
                        </Box>
                      </>
                    ) : (
                      <Box sx={{ textAlign: 'left', py: 2 }}>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                          升级为VIP用户，享受更多特权功能
                        </Typography>
                        <Button
                          variant="outlined"
                          color="primary"
                          size="small"
                          onClick={() => document.getElementById('subscription-plans').scrollIntoView({ behavior: 'smooth' })}
                        >
                          查看订阅计划
                        </Button>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* VIP特权区 */}
                <Box sx={{ flex: 1, borderLeft: { md: '1px solid #e0e0e0' }, pl: { md: 4 } }}>
                  <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 500, color: 'text.secondary' }}>
                    VIP特权
                  </Typography>

                  <Box sx={{ display: 'grid', gap: 2 }}>
                    {vipBenefits.map((benefit, index) => (
                      <Box key={index} display="flex" alignItems="center" gap={2}>
                        <Box sx={{
                          p: 1,
                          borderRadius: '50%',
                          color: 'primary.main'
                        }}>
                          {benefit.icon}
                        </Box>
                        <Typography variant="body2">{benefit.text}</Typography>
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ mt: 4 }}>
                    <Typography variant="caption" color="text.secondary">
                      • 所有订阅均使用Sepolia测试网络ETH进行支付
                    </Typography>
                    
                    <Typography variant="caption" color="text.secondary" component="div">
                      • 订阅成功后，您的VIP权限将立即生效
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </>
          ) : (
            <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
              <CircularProgress size={83} sx={{ color: '#757575' }} />
              <Typography variant="h6" color="#757575" sx={{ mt: 2 }}>
                查询中...
              </Typography>
              
            </Box>
          )}
        </Paper>



        {/* 订阅计划区域 */}


        <Box sx={{ width: '100%', p: 0, m: 0 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 1, p: 0, m: 0 }}>
            {plans.map((plan) => (
              <Box key={plan.id} sx={{ width: '100%', p: 0, m: 0 }}>
                <Card
                  variant="outlined"
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 2,
                    borderColor: 'divider',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    p: 0,
                    m: 0,
                    ...(selectedPlan === plan.id ? {
                      border: '2px solid #1976d2',
                      transform: 'translateY(-3px)',
                      boxShadow: 2
                    } : {})
                  }}
                >
                  {plan.popular && (
                    <Box sx={{
                      position: 'absolute',
                      top: -12,
                      right: 16,
                      backgroundColor: '#ff9800',
                      color: 'white',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.75rem',
                      fontWeight: 'bold'
                    }}>
                      热门推荐
                    </Box>
                  )}

                  <CardContent sx={{ flexGrow: 1, pt: plan.popular ? 3 : 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" align="center" sx={{ mb: 2 }}>
                      {plan.name}
                    </Typography>

                    <Box sx={{ my: 2, textAlign: 'center' }}>
                      <Typography variant="h4" color="primary" fontWeight="bold">
                        {plan.price}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {plan.duration}
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 2 }}>
                      {plan.description}
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ mt: 1 }}>
                      {plan.features.map((feature, index) => (
                        <Box key={index} display="flex" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
                          <CheckIcon sx={{ fontSize: 16, color: 'success.main' }} />
                          <Typography variant="caption">{feature}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>

                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      variant={plan.popular ? "contained" : "outlined"}
                      color={plan.popular ? "warning" : "primary"}
                      fullWidth
                      disabled={loading || selectedPlan === plan.id}
                      onClick={() => handleSubscribe(plan.id)}
                      sx={{
                        fontWeight: 'bold',
                        py: 1,
                        ...(plan.popular ? {
                          backgroundColor: '#ff9800',
                          '&:hover': {
                            backgroundColor: '#f57c00'
                          }
                        } : {})
                      }}
                    >
                      {selectedPlan === plan.id ? '处理中...' : '立即订阅'}
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            ))}
          </Box>
        </Box>
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
    </Modal>
  );
};

export default VipSubscriptionModal;