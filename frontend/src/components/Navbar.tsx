import {
  AppBar,
  Box,
  Button,
  Chip,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const navItems = [
    { label: "Dashboard", to: "/dashboard" },
    { label: "Documents", to: "/documents" },
    { label: "Chat", to: "/chat" },
    { label: "Tickets", to: "/tickets" },
  ];

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        backdropFilter: "blur(14px)",
        bgcolor: "rgba(0, 0, 0, 0.9)",
        borderBottom: "1px solid rgba(148, 163, 184, 0.18)",
      }}
    >
      <Toolbar sx={{ minHeight: 72, gap: 2 }}>
        <Stack direction="row" spacing={1.5} sx={{ flexGrow: 1, alignItems: "center" }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              bgcolor: "primary.main",
              display: "grid",
              placeItems: "center",
              color: "#ffffff",
              fontWeight: 900,
              letterSpacing: 0,
              boxShadow: "0 12px 24px rgba(11, 61, 145, 0.22)",
            }}
          >
            L
          </Box>
          <Box>
            <Typography variant="h6" sx={{ lineHeight: 1.1 }}>
              Lumora
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Illuminate Enterprise Knowledge.
            </Typography>
          </Box>
          <Chip
            label="Private"
            size="small"
            sx={{
              display: { xs: "none", md: "inline-flex" },
              bgcolor: "rgba(11, 61, 145, 0.12)",
              color: "primary.dark",
            }}
          />
        </Stack>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;

            return (
              <Button
                key={item.to}
                component={RouterLink}
                to={item.to}
                variant={isActive ? "contained" : "text"}
                color={isActive ? "primary" : "inherit"}
                sx={{ display: { xs: item.to === "/dashboard" ? "none" : "inline-flex", sm: "inline-flex" } }}
              >
                {item.label}
              </Button>
            );
          })}
          <Button color="secondary" variant="outlined" onClick={handleLogout}>
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;



