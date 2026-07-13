import { Box, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

function LegalFooter() {
  return (
    <Box
      component="footer"
      sx={{
        position: "relative",
        zIndex: 1,
        width: "100%",
        py: { xs: 2, sm: 3 },
        px: { xs: 1.5, sm: 2 },
        borderTop: "1px solid rgba(148, 163, 184, 0.14)",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={{ xs: 0.75, sm: 1.5 }}
        sx={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: 12, sm: 14 } }}>
          Copyright (c) 2026 Lumora. All rights reserved.
        </Typography>
        <Stack direction="row" spacing={{ xs: 1.5, sm: 2 }} sx={{ alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
          <Link component={RouterLink} to="/privacy" color="text.secondary" underline="hover">
            Privacy
          </Link>
          <Link component={RouterLink} to="/terms" color="text.secondary" underline="hover">
            Terms
          </Link>
          <Typography variant="body2" color="text.secondary">
            Beta access
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

export default LegalFooter;
