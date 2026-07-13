import { useState } from "react";
import type { FormEvent } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import {
  Alert,
  Box,
  Button,
  Chip,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import api from "../api/axios";
import EnterpriseBackground from "../components/EnterpriseBackground";
import LegalFooter from "../components/LegalFooter";
import type { AuthToken } from "../types/auth";

interface ApiError {
  detail?: string | Array<{ msg?: string }>;
}

function getApiErrorMessage(error: unknown, fallback: string) {
  const apiError = error as AxiosError<ApiError>;
  const detail = apiError.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail.map((item) => item.msg).filter(Boolean).join(" ");
  }

  return fallback;
}

function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const normalizedName = fullName.trim().replace(/\s+/g, " ");
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedName.length < 2) {
      return "Full name must be at least 2 characters.";
    }

    if (!normalizedEmail.includes("@")) {
      return "Enter a valid email address.";
    }

    if (password.length < 8) {
      return "Password must be at least 8 characters.";
    }

    if (password.length > 72) {
      return "Password must be 72 characters or fewer.";
    }

    return "";
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const normalizedName = fullName.trim().replace(/\s+/g, " ");
      const normalizedEmail = email.trim().toLowerCase();

      await api.post("/auth/register", {
        full_name: normalizedName,
        email: normalizedEmail,
        password,
      });

      setSuccess("Your account has been created successfully. Signing you in now...");
      await new Promise((resolve) => {
        window.setTimeout(resolve, 1200);
      });

      const response = await api.post<AuthToken>("/auth/login", {
        email: normalizedEmail,
        password,
      });

      localStorage.setItem("token", response.data.access_token);
      navigate("/dashboard");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Registration failed. Check your details and try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        p: 2,
      }}
    >
      <EnterpriseBackground />
      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 480,
          my: "auto",
          p: 4,
          bgcolor: "rgba(0, 0, 0, 0.94)",
          backdropFilter: "blur(14px)",
          boxShadow: "0 24px 70px rgba(0, 0, 0, 0.26)",
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="overline" color="secondary.dark">
              New workspace user
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 1.5, flexWrap: "wrap" }}>
              <Chip label="Free beta access" color="primary" size="small" sx={{ fontWeight: 850 }} />
              <Chip label="Limited-time account" color="secondary" variant="outlined" size="small" />
            </Stack>
            <Typography variant="h4" sx={{ fontWeight: 850 }}>
              Create account
            </Typography>
            <Typography color="text.secondary">
              Start uploading and searching enterprise documents during the beta access period.
            </Typography>
          </Box>
          {error ? <Alert severity="error">{error}</Alert> : null}
          {success ? <Alert severity="success">{success}</Alert> : null}
          <TextField
            label="Full name"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            helperText="Use your real workspace display name."
            required
            fullWidth
          />
          <TextField
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            helperText="Email is normalized to lowercase."
            required
            fullWidth
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            helperText="Use 8 to 72 characters."
            required
            fullWidth
          />
          <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create account"}
          </Button>
          <Typography variant="body2">
            Already registered?{" "}
            <Link component={RouterLink} to="/">
              Sign in
            </Link>
          </Typography>
        </Stack>
      </Paper>
      <LegalFooter />
    </Box>
  );
}

export default Register;

