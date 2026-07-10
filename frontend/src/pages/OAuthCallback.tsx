import { useEffect } from "react";
import { Link as RouterLink, useNavigate, useSearchParams } from "react-router-dom";
import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";

import EnterpriseBackground from "../components/EnterpriseBackground";

function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      navigate("/dashboard", { replace: true });
    }
  }, [navigate, token]);

  return (
    <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center", bgcolor: "background.default", p: 2 }}>
      <EnterpriseBackground />
      <Paper sx={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 440, p: 4 }}>
        <Stack spacing={2.5}>
          <Typography variant="h5">Completing sign in</Typography>
          {token ? (
            <Alert severity="info">Redirecting to your workspace.</Alert>
          ) : (
            <>
              <Alert severity="error">OAuth sign in did not return an access token.</Alert>
              <Button component={RouterLink} to="/" variant="contained">
                Back to sign in
              </Button>
            </>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}

export default OAuthCallback;
