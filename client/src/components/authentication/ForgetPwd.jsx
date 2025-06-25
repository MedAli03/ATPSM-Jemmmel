// src/components/authentication/ForgetPwd.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { 
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  Alert,
  Fade,
  CircularProgress,
  Link
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { ArrowBack, Mail } from '@mui/icons-material';

// Reuse the theme from LoginPage for consistency
const theme = createTheme({
  direction: "rtl",
  palette: {
    primary: {
      main: "#2b6cb0",
    },
    secondary: {
      main: "#1a365d",
    },
    background: {
      default: "#f7fafc",
    },
  },
  typography: {
    fontFamily: "Tajawal, Arial, sans-serif",
  },
  components: {
    MuiFormLabel: {
      styleOverrides: {
        root: {
          transformOrigin: "top right",
          right: 0,
          left: "auto",
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          textAlign: "right",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          padding: "12px 24px",
          fontSize: "1rem",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        outlined: {
          "&.MuiInputLabel-shrink": {
            transform: "translate(-14px, -6px) scale(0.75)",
          },
        },
      },
    },
  },
});

const ForgetPwd = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm();

  const onSubmit = (data) => {
    setLoading(true);
    setError('');
    setSuccess(false);
    
    // Simulate API call to send reset password email
    setTimeout(() => {
      // In a real app, this would check if the email exists in your database
      if (data.email.includes('@')) {
        setSuccess(true);
      } else {
        setError('البريد الإلكتروني غير صالح. يرجى المحاولة مرة أخرى.');
      }
      setLoading(false);
    }, 1500);
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <ThemeProvider theme={theme}>
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #1a365d 0%, #153e75 100%)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
          fontFamily: "Tajawal, Arial, sans-serif",
          direction: "rtl",
        }}
      >
        <Container maxWidth="sm" sx={{ py: 4 }}>
          <Paper
            elevation={10}
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              backgroundColor: "white",
              position: "relative",
            }}
          >
            <Button
              startIcon={<ArrowBack />}
              onClick={handleBackToLogin}
              sx={{
                position: "absolute",
                top: 16,
                left: 16,
                color: "#2b6cb0",
                fontWeight: 600,
              }}
            >
              العودة
            </Button>
            
            <Box sx={{ p: { xs: 3, md: 6 } }}>
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Mail sx={{ 
                  fontSize: 50, 
                  color: "#2b6cb0", 
                  mb: 1,
                  background: "rgba(43, 108, 176, 0.1)",
                  borderRadius: "50%",
                  padding: "12px",
                }} />
                <Typography
                  variant="h4"
                  component="h1"
                  fontWeight="bold"
                  color="#1a365d"
                  gutterBottom
                >
                  نسيت كلمة المرور؟
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور الخاصة بك
                </Typography>
              </Box>
              
              {error && (
                <Fade in={true}>
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                </Fade>
              )}
              
              {success ? (
                <Fade in={true}>
                  <Box sx={{ textAlign: 'center', py: 3 }}>
                    <Box sx={{ 
                      width: 80, 
                      height: 80, 
                      borderRadius: '50%', 
                      bgcolor: 'rgba(46, 204, 113, 0.1)', 
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      margin: '0 auto 20px'
                    }}>
                      <Mail sx={{ fontSize: 40, color: "#2ecc71" }} />
                    </Box>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                      تم إرسال البريد الإلكتروني بنجاح!
                    </Typography>
                    <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
                      تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.
                      يرجى التحقق من صندوق الوارد الخاص بك.
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleBackToLogin}
                      sx={{ mt: 2 }}
                    >
                      العودة إلى تسجيل الدخول
                    </Button>
                  </Box>
                </Fade>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)}>
                  <TextField
                    fullWidth
                    label="البريد الإلكتروني"
                    variant="outlined"
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <Mail color="primary" sx={{ mr: 1 }} />
                      ),
                    }}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    {...register("email", { 
                      required: "يرجى إدخال البريد الإلكتروني",
                      pattern: { 
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "بريد إلكتروني غير صالح"
                      }
                    })}
                    sx={{ mb: 3 }}
                  />
                  
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    type="submit"
                    disabled={loading}
                    startIcon={
                      loading ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : null
                    }
                    sx={{ py: 1.5, fontSize: "1.1rem", mt: 2 }}
                  >
                    {loading ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
                  </Button>
                </form>
              )}
              
              <Box sx={{ mt: 4, textAlign: "center" }}>
                <Typography variant="body2" color="textSecondary">
                  © 2023 الجمعية الخيرية. جميع الحقوق محفوظة.
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Container>
      </div>
    </ThemeProvider>
  );
};

export default ForgetPwd;