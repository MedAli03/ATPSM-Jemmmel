import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import client from "../../api/client";
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
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import {
  Visibility,
  VisibilityOff,
  Lock,
  Person,
  AdminPanelSettings,
} from "@mui/icons-material";

// App theme (RTL + Arabic fonts). UI strings can remain Arabic.
const theme = createTheme({
  direction: "rtl",
  palette: {
    primary: { main: "#2b6cb0" },
    secondary: { main: "#1a365d" },
    background: { default: "#f7fafc" },
  },
  typography: { fontFamily: "Tajawal, Arial, sans-serif" },
  components: {
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

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // React Hook Form for validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Handle submit by calling backend POST /api/auth/login
  const onSubmit = async (form) => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Backend expects: { email, mot_de_passe }
      const { data } = await client.post("/auth/login", {
        email: form.email,
        mot_de_passe: form.mot_de_passe,
      });

      // data: { token, user: { id, nom, prenom, email, role, avatar_url } }
      login({ token: data.token, user: data.user }, !!form.remember);
      setSuccess(true);

      // Optional: route by role coming from backend
      const role = data.user.role;
      const roleRoute =
        {
          PRESIDENT: "/dashboard/",
          DIRECTEUR: "/dashboard/director",
          DIRECTOR: "/dashboard/director",
          EDUCATEUR: "/dashboard/educateur",
          PARENT: "/dashboard/parent",
        }[role] || "/dashboard";

      navigate(roleRoute, { replace: true });
    } catch (e) {
      // Show backend message if exists, otherwise generic Arabic message for UI consistency
      const msg =
        e.response?.data?.message || "حدث خطأ غير متوقع. حاول مجدداً.";
      setError(msg);
    } finally {
      setLoading(false);
    }
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
            {/* Left side - Form */}
            <Box
              sx={{ flex: 1, p: { xs: 3, md: 6 }, backgroundColor: "white" }}
            >
              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Lock sx={{ fontSize: 50, color: "#2b6cb0", mb: 1 }} />
                <Typography
                  variant="h4"
                  component="h1"
                  fontWeight="bold"
                  color="#1a365d"
                >
                  تسجيل الدخول
                </Typography>
                <Typography variant="body1" color="textSecondary" mt={1}>
                  لوحة تحكم الجمعية الخيرية
                </Typography>
              </Box>

              {error && (
                <Fade in={true}>
                  <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                  </Alert>
                </Fade>
              )}

              {success && (
                <Fade in={true}>
                  <Alert severity="success" sx={{ mb: 3 }}>
                    تم تسجيل الدخول بنجاح! يتم توجيهك الآن...
                  </Alert>
                </Fade>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Email (backend expects "email") */}
                <TextField
                  fullWidth
                  label="البريد الإلكتروني"
                  type="email"
                  variant="outlined"
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person color="primary" />
                      </InputAdornment>
                    ),
                  }}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  {...register("email", {
                    required: "يرجى إدخال البريد الإلكتروني",
                  })}
                  sx={{ mb: 2 }}
                />

                {/* Password (backend expects "mot_de_passe") */}
                <TextField
                  fullWidth
                  label="كلمة السر"
                  type={showPassword ? "text" : "password"}
                  variant="outlined"
                  margin="normal"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock color="primary" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
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
                    minLength: {
                      value: 6,
                      message: "يجب أن تكون كلمة السر 6 أحرف على الأقل",
                    },
                  })}
                  sx={{ mb: 2 }}
                />

                {/* Remember me + Forgot password */}
                <Grid container alignItems="center" sx={{ mt: 2, mb: 3 }}>
                  <Grid item xs>
                    <FormControlLabel
                      control={<Checkbox color="primary" />}
                      label="تذكرني"
                      {...register("remember")}
                    />
                  </Grid>
                  <Grid item>
                    <Link
                      href="/forgot-password"
                      variant="body2"
                      color="primary"
                    >
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
                    loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : null
                  }
                  sx={{ py: 1.5, fontSize: "1.1rem" }}
                >
                  {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
                </Button>
              </form>

              <Box sx={{ mt: 4, textAlign: "center" }}>
                <Typography variant="body2" color="textSecondary">
                  © 2023 الجمعية الخيرية. جميع الحقوق محفوظة.
                </Typography>
              </Box>
            </Box>

            {/* Right side - Banner */}
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
                نظام إدارة الجمعية الخيرية يمنحك التحكم الكامل في إدارة أنشطة
                الجمعية وأعضائها ومشاريعها.
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    bgcolor: "white",
                    borderRadius: "50%",
                    mr: 1,
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
                    mr: 1,
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
                    mr: 1,
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
  );
};

export default LoginPage;
