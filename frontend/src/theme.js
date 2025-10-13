import { createTheme } from '@mui/material/styles';

// 自定义颜色配置
export const colors = {
  primary: '#e47470',      // 主题色1 - 珊瑚红
  secondary: '#f3d84b',    // 主题色2 - 金黄色
  accent: '#c15c54',       // 主题色3 - 深珊瑚色
  background: '#fcf5e8',   // 背景色 - 浅米色
  text: {
    primary: '#333333',
    secondary: '#666666',
    light: '#999999'
  },
  white: '#ffffff',
  gray: {
    100: '#f5f5f5',
    200: '#e0e0e0',
    300: '#cccccc',
    400: '#999999',
    500: '#666666',
    600: '#333333'
  }
};

// MUI主题配置
export const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary,
      light: '#f08c89',
      dark: '#d45a56'
    },
    secondary: {
      main: colors.secondary,
      light: '#f5e07d',
      dark: '#e6c442'
    },
    background: {
      default: colors.background,
      paper: colors.white
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 500
    },
    body1: {
      fontSize: '0.875rem'
    },
    body2: {
      fontSize: '0.75rem'
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8
          }
        }
      }
    }
  }
});