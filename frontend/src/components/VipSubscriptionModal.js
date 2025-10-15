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
  Collapse
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [transactionHash, setTransactionHash] = useState(''); // 添加transactionHash状态

  // 创建一个新的关闭处理函数，用于在关闭时重置状态
  const handleClose = () => {
    // 重置success和error状态
    setSuccess('');
    setError('');
    // 调用原始的onClose函数
    onClose();
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
    setError('');
    try {
      const status = await getVipStatus(token);
      setVipStatus(status);
    } catch (err) {
      setError('获取VIP状态失败: ' + err.message);
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
      setError('请先安装MetaMask钱包');
      return;
    }

    try {
      // 请求连接钱包
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      setSuccess('钱包连接成功');
    } catch (err) {
      setError('连接钱包失败: ' + err.message);
    }
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
      setError('请先登录');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setSelectedPlan(planId);

    try {
      // 发送交易
      const txHash = await sendTransaction(planId);

      // 设置交易哈希
      setTransactionHash(txHash);

      // 更新用户VIP状态
      const result = await subscribeVip(planId, txHash, token);

      if (result.success) {
        setSuccess('订阅成功！您的VIP权限已激活（续期）。');
        setVipStatus({
          isVip: result.isVip,
          vipPlan: result.vipPlan,
          vipEndDate: result.vipEndDate
        });
      } else {
        throw new Error('订阅失败');
      }
    } catch (err) {
      setError(err.message);
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={1.5}>
            <WalletIcon color="primary" />
            <Typography id="vip-modal-title" variant="h5" component="h2" fontWeight="bold">
              VIP订阅中心
            </Typography>
          </Box>
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

        {/* 错误提示框 */}
        <Collapse in={!!error}>
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
              boxShadow: 1,
              '& .MuiAlert-icon': {
                fontSize: 20
              }
            }}
            icon={<WarningIcon color="error" size="medium" />}
          >
            {error}
          </Alert>
        </Collapse>

        {/* 成功提示框 */}
        <Collapse in={!!success}>
          <Alert
            severity="success"
            sx={{
              mb: 3,
              borderRadius: 2,
              boxShadow: 1,
              alignItems: 'flex-start',
            }}
            icon={<CheckIcon color="success" size="medium" />}
          >
            <Typography variant="body1" component="div">
              {success}
              {success.includes('订阅成功') && transactionHash && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                  {/* 交易哈希和Etherscan链接 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all', mr: 1 }}>
                      交易哈希:
                    </Typography>
                    <Tooltip 
                      title={transactionHash} 
                      placement="right"
                      componentsProps={{
                        tooltip: {
                          sx: {
                            maxWidth: 'none',
                            whiteSpace: 'nowrap'
                          }
                        }
                      }}
                    >
                      <a
                        href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: '#1976d2',
                          textDecoration: 'none',
                          fontWeight: 'bold',
                          fontSize: '0.875rem',
                          border: '1px solid #1976d2',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: '#fff',
                          cursor: 'pointer'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#e3f2fd'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#fff'}
                      >
                        在Etherscan上查看
                      </a>
                    </Tooltip>
                  </Box>
                </Box>
              )}
            </Typography>
          </Alert>
        </Collapse>
        

        <Collapse in={!!loading}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              my: 3,
              py: 2,
              backgroundColor: 'rgba(245, 245, 245, 0.7)',
              borderRadius: 2,
              border: '1px solid rgba(0, 0, 0, 0.05)'
            }}
          >
            <CircularProgress sx={{ mb: 2 }} color="primary" />
            <Typography variant="body2" color="text.secondary">
              正在处理，请稍候...
            </Typography>
          </Box>
        </Collapse>



        {/* VIP状态和特权卡片 */}
        {vipStatus && (
          <Paper
            elevation={2}
            sx={{
              mb: 4,
              p: 3,
              borderRadius: 3,
              border: '1px solid #e0e0e0'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
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

            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
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
          </Paper>
        )}



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
      </Box>
    </Modal>
  );
};

export default VipSubscriptionModal;