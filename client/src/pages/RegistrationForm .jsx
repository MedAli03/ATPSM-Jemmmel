import { useForm } from "react-hook-form";
import {
  Container,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Box,
} from "@mui/material";

const RegistrationForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Box
        sx={{
          position: "relative",
          backgroundImage: "url(img2.jpg)", // Add your image path
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "8px",
          py: 4,
          px: 2,
          mb: 4,
          textAlign: "center",
          color: "white",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.4)",
            borderRadius: "8px",
          },
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ position: "relative", zIndex: 1 }}
        >
          Registration Form
        </Typography>
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{ position: "relative", zIndex: 1 }}
        >
          Please fill in the form below
        </Typography>
      </Box>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Full Name Section */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Full Name *
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="First Name"
              {...register("firstName", { required: "First name is required" })}
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Last Name"
              {...register("lastName", { required: "Last name is required" })}
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
            />
          </Grid>
        </Grid>

        {/* Address Section */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Address *
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Street Address"
              {...register("street1", {
                required: "Street address is required",
              })}
              error={!!errors.street1}
              helperText={errors.street1?.message}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Street Address Line 2"
              {...register("street2")}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="City"
              {...register("city", { required: "City is required" })}
              error={!!errors.city}
              helperText={errors.city?.message}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="State / Province"
              defaultValue=""
              {...register("state", { required: "State is required" })}
              error={!!errors.state}
              helperText={errors.state?.message}
            >
              <MenuItem value="" disabled>
                Please Select
              </MenuItem>
              <MenuItem value="CA">California</MenuItem>
              <MenuItem value="NY">New York</MenuItem>
              {/* Add more states as needed */}
            </TextField>
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Postal / Zip Code"
              {...register("zip", { required: "Zip code is required" })}
              error={!!errors.zip}
              helperText={errors.zip?.message}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              select
              fullWidth
              label="Country"
              defaultValue=""
              {...register("country", { required: "Country is required" })}
              error={!!errors.country}
              helperText={errors.country?.message}
            >
              <MenuItem value="" disabled>
                Please Select
              </MenuItem>
              <MenuItem value="US">United States</MenuItem>
              <MenuItem value="CA">Canada</MenuItem>
              {/* Add more countries as needed */}
            </TextField>
          </Grid>
        </Grid>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mt: 4, mb: 4 }}
        >
          Submit
        </Button>
      </form>
    </Container>
  );
};

export default RegistrationForm;
