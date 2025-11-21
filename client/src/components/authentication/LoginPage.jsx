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

// RTL Theme
const theme = createTheme({
  direction: "rtl",
  typography: { fontFamily: "Tajawal, Arial, sans-serif" },
  palette: {
    primary: { main: "#1e3a8a" }, // Indigo-800
    background: { default: "#f4f6f9" },
  },
  components: {
    MuiInputBase: { styleOverrides: { input: { textAlign: "right" } } },
    MuiButton: { styleOverrides: { root: { fontWeight: 600 } } },
  },
});

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Backend Login
  const onSubmit = async (form) => {
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const { data } = await client.post("/auth/login", {
        email: form.email,
        mot_de_passe: form.mot_de_passe,
      });

      login({ token: data.token, user: data.user }, !!form.remember);
      setSuccess(true);

      // Role routing
      const role = data.user.role;
      const routes = {
        PRESIDENT: "/dashboard/",
        DIRECTEUR: "/dashboard/manager",
        EDUCATEUR: "/dashboard/educateur",
        PARENT: "/dashboard/parent",
      };

      navigate(routes[role] || "/dashboard", { replace: true });
    } catch (e) {
      const msg =
        e.response?.data?.message || "حدث خطأ غير متوقع. حاول لاحقاً.";
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
          background: "#1e3a8a",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <Container maxWidth="md">
          <Paper
            elevation={4}
            sx={{
              borderRadius: 3,
              overflow: "hidden",
              display: "flex",
              flexDirection: { xs: "column-reverse", md: "row" },
              minHeight: 500,
            }}
          >
            {/* RIGHT SIDE — Modern banner */}
            <Box
              sx={{
                flex: 1,
                background: "linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)",
                color: "white",
                p: { xs: 4, md: 5 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <AdminPanelSettings sx={{ fontSize: 60, mb: 2 }} />

              <Typography variant="h5" fontWeight="bold" mb={1}>
                لوحة التحكم
              </Typography>

              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                منصة إدارة الجمعية — لإدارة الأنشطة، الأخبار، المستخدمين،
                والبرامج.
              </Typography>
            </Box>

            {/* LEFT SIDE — Login form */}
            <Box sx={{ flex: 1, p: { xs: 3, md: 5 }, background: "white" }}>
              <Typography
                variant="h4"
                fontWeight="bold"
                color="primary"
                textAlign="center"
                mb={1}
              >
                تسجيل الدخول
              </Typography>
              <Typography
                variant="body2"
                color="textSecondary"
                textAlign="center"
                mb={3}
              >
                دخول الإدارة
              </Typography>

              {error && (
                <Fade in>
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                </Fade>
              )}

              {success && (
                <Fade in>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    تم تسجيل الدخول بنجاح!
                  </Alert>
                </Fade>
              )}

              <form onSubmit={handleSubmit(onSubmit)}>
                {/* EMAIL */}
                <TextField
                  fullWidth
                  label="البريد الإلكتروني"
                  type="email"
                  margin="normal"
                  {...register("email", {
                    required: "يرجى إدخال البريد الإلكتروني",
                  })}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* PASSWORD */}
                <TextField
                  fullWidth
                  label="كلمة السر"
                  type={showPassword ? "text" : "password"}
                  margin="normal"
                  {...register("mot_de_passe", {
                    required: "يرجى إدخال كلمة السر",
                    minLength: {
                      value: 6,
                      message: "لا تقل كلمة السر عن 6 أحرف",
                    },
                  })}
                  error={!!errors.mot_de_passe}
                  helperText={errors.mot_de_passe?.message}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Remember + Forgot */}
                <Grid
                  container
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mt: 1, mb: 3 }}
                >
                  <FormControlLabel
                    control={<Checkbox />}
                    label="تذكرني"
                    {...register("remember")}
                  />
                  <Link href="/forgot-password" underline="hover">
                    هل نسيت كلمة السر؟
                  </Link>
                </Grid>

                {/* Submit */}
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  type="submit"
                  disabled={loading}
                  startIcon={
                    loading ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : null
                  }
                  sx={{ py: 1.5, fontSize: "1rem" }}
                >
                  {loading ? "جاري الدخول..." : "تسجيل الدخول"}
                </Button>
              </form>

              <Typography
                variant="caption"
                display="block"
                textAlign="center"
                color="textSecondary"
                mt={4}
              >
                © 2023 جمعية الحمائم — جميع الحقوق محفوظة
              </Typography>
            </Box>
          </Paper>
        </Container>
      </div>
    </ThemeProvider>
  );
};

export default LoginPage;
