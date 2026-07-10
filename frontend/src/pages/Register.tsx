import { useState } from "react";
import type { FormEvent } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import type { AxiosError } from "axios";
import {
  Alert,
  Box,
  Button,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import api from "../api/axios";
import EnterpriseBackground from "../components/EnterpriseBackground";

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
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      await api.post("/auth/register", {
        full_name: fullName.trim().replace(/\s+/g, " "),
        email: email.trim().toLowerCase(),
        password,
      });
      navigate("/");
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Registration failed. Check your details and try again."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "background.default", p: 2 }}>
      <EnterpriseBackground />
      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth: 480,
          p: 4,
          bgcolor: "rgba(16, 27, 45, 0.94)",
          backdropFilter: "blur(14px)",
          boxShadow: "0 24px 70px rgba(0, 0, 0, 0.26)",
        }}
      >
        <Stack spacing={3}>
          <Box>
            <Typography variant="overline" color="secondary.dark">
              New workspace user
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 850 }}>
              Create account
            </Typography>
            <Typography color="text.secondary">
              Start uploading and searching enterprise documents.
            </Typography>
          </Box>
          {error ? <Alert severity="error">{error}</Alert> : null}
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
    </Box>
  );
}

export default Register;
