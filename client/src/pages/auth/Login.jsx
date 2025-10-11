// src/pages/auth/Login.jsx
import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

// MUI
import {
  Container,
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Button,
  Grid,
  Paper,
  Alert,
  Fade,
  IconButton,
  InputAdornment,
  CircularProgress,
  CssBaseline,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  Visibility,
  VisibilityOff,
  Lock,
  Person,
  AdminPanelSettings,
} from "@mui/icons-material";

// MUI RTL support
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";
import rtlPlugin from "stylis-plugin-rtl";

// ---------- THEME (Arabic + RTL) ----------
const theme = createTheme({
  direction: "rtl",
  palette: {
    primary: { main: "#2b6cb0" },
    secondary: { main: "#1a365d" },
    background: { default: "#f7fafc" },
  },
  typography: { fontFamily: "Tajawal, Arial, sans-serif" },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: { direction: "rtl" },
        body: { direction: "rtl" },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: { transformOrigin: "top right", right: 0, left: "auto" },
      },
    },
    MuiInputBase: { styleOverrides: { input: { textAlign: "right" } } },
    MuiButton: {
      styleOverrides: {
        root: { fontWeight: 600, padding: "12px 24px", fontSize: "1rem" },
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

// Emotion cache for RTL
function useRtlCache() {
  return useMemo(
    () =>
      createCache({
        key: "mui-rtl",
        stylisPlugins: [rtlPlugin],
      }),
    []
  );
}

const LoginPage = () => {
  const cache = useRtlCache();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: "", mot_de_passe: "", remember: true } });

  // Submit handler — uses AuthContext.login(email, mot_de_passe)
  const onSubmit = async ({ email, mot_de_passe, remember }) => {
    setLoading(true);
    setErrorMsg("");
    setSuccess(false);
    try {
      const user = await login(email, mot_de_passe, { remember }); // optional third arg if you support it
      setSuccess(true);

      // Route by role
      const role = user?.role;
      const roleRoute =
        {
          PRESIDENT: "/dashboard/president",
          DIRECTEUR: "/dashboard/manager",
          EDUCATEUR: "/dashboard/educateur",
          PARENT: "/dashboard/parent",
        }[role] || "/dashboard";

      navigate(roleRoute, { replace: true });
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || "حدث خطأ غير متوقع. حاول مجدداً.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CacheProvider value={cache}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
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
          <Container maxWidth="md" sx={{ py: 4 }}>
            <Paper
              elevation={10}
              sx={{
                borderRadius: 4,
                overflow: "hidden",
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
              }}
            >
              {/* Left: Form */}
              <Box
                sx={{ flex: 1, p: { xs: 3, md: 6 }, backgroundColor: "white" }}
                component="section"
                aria-label="نموذج تسجيل الدخول"
              >
                <Box sx={{ textAlign: "center", mb: 4 }}>
                  <Lock sx={{ fontSize: 50, color: "#2b6cb0", mb: 1 }} />
                  <Typography variant="h4" component="h1" fontWeight="bold" color="#1a365d">
                    تسجيل الدخول
                  </Typography>
                  <Typography variant="body1" color="textSecondary" mt={1}>
                    لوحة تحكم الجمعية
                  </Typography>
                </Box>

                {errorMsg && (
                  <Fade in>
                    <Alert severity="error" sx={{ mb: 3 }} role="alert">
                      {errorMsg}
                    </Alert>
                  </Fade>
                )}

                {success && (
                  <Fade in>
                    <Alert severity="success" sx={{ mb: 3 }} role="status">
                      تم تسجيل الدخول بنجاح! يتم توجيهك الآن…
                    </Alert>
                  </Fade>
                )}

                <Box
                  component="form"
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                  autoComplete="off"
                >
                  {/* Email */}
                  <TextField
                    fullWidth
                    label="البريد الإلكتروني"
                    type="email"
                    variant="outlined"
                    margin="normal"
                    autoFocus
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="primary" aria-hidden />
                        </InputAdornment>
                      ),
                    }}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    {...register("email", {
                      required: "يرجى إدخال البريد الإلكتروني",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "صيغة بريد إلكتروني غير صحيحة",
                      },
                    })}
                    sx={{ mb: 2 }}
                  />

                  {/* Password */}
                  <TextField
                    fullWidth
                    label="كلمة السر"
                    type={showPassword ? "text" : "password"}
                    variant="outlined"
                    margin="normal"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="primary" aria-hidden />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword((s) => !s)}
                            edge="end"
                            aria-label={showPassword ? "إخفاء كلمة السر" : "إظهار كلمة السر"}
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    error={!!errors.mot_de_passe}
                    helperText={errors.mot_de_passe?.message}
                    {...register("mot_de_passe", {
                      required: "يرجى إدخال كلمة السر",
                      minLength: { value: 6, message: "يجب أن تكون كلمة السر 6 أحرف على الأقل" },
                    })}
                    sx={{ mb: 2 }}
                  />

                  {/* Remember + Forgot */}
                  <Grid container alignItems="center" sx={{ mt: 2, mb: 3 }}>
                    <Grid item xs>
                      <FormControlLabel
                        control={<Checkbox color="primary" defaultChecked />}
                        label="تذكرني"
                        {...register("remember")}
                      />
                    </Grid>
                    <Grid item>
                      <Link href="/forgot-password" variant="body2" color="primary">
                        هل نسيت كلمة المرور؟
                      </Link>
                    </Grid>
                  </Grid>

                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    type="submit"
                    disabled={loading}
                    startIcon={
                      loading ? <CircularProgress size={20} color="inherit" /> : null
                    }
                    sx={{ py: 1.5, fontSize: "1.1rem" }}
                  >
                    {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                  </Button>
                </Box>

                <Box sx={{ mt: 4, textAlign: "center" }}>
                  <Typography variant="body2" color="textSecondary">
                    © {new Date().getFullYear()} الجمعية. جميع الحقوق محفوظة.
                  </Typography>
                </Box>
              </Box>

              {/* Right: Banner */}
              <Box
                sx={{
                  flex: 0.8,
                  background: "linear-gradient(135deg, #2b6cb0 0%, #1a365d 100%)",
                  color: "white",
                  p: { xs: 3, md: 4 },
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  textAlign: "center",
                }}
                aria-hidden
              >
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: "50%",
                    bgcolor: "rgba(255,255,255,0.1)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <AdminPanelSettings sx={{ fontSize: 50 }} />
                </Box>

                <Typography variant="h5" fontWeight="bold" mb={2}>
                  لوحة تحكم الجمعية
                </Typography>
                <Typography variant="body1" mb={3} sx={{ opacity: 0.9 }}>
                  نظام إدارة الجمعية يمنحك التحكم الكامل في إدارة الأنشطة والأعضاء والمشاريع.
                </Typography>

                <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      bgcolor: "white",
                      borderRadius: "50%",
                      ml: 1,
                      opacity: 0.7,
                    }}
                  />
                  <Typography variant="body2">نظام آمن ومحمي</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      bgcolor: "white",
                      borderRadius: "50%",
                      ml: 1,
                      opacity: 0.7,
                    }}
                  />
                  <Typography variant="body2">واجهة سهلة الاستخدام</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      bgcolor: "white",
                      borderRadius: "50%",
                      ml: 1,
                      opacity: 0.7,
                    }}
                  />
                  <Typography variant="body2">تحكم كامل في البيانات</Typography>
                </Box>
              </Box>
            </Paper>
          </Container>
        </div>
      </ThemeProvider>
    </CacheProvider>
  );
};

export default LoginPage;
