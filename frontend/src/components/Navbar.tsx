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

import lumoraMark from "../assets/lumora-mark.svg";

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
      <Toolbar
        sx={{
          minHeight: { xs: 60, sm: 72 },
          gap: { xs: 1, sm: 2 },
          px: { xs: 1.25, sm: 2 },
          py: { xs: 1, sm: 0 },
          flexWrap: { xs: "wrap", md: "nowrap" },
        }}
      >
        <Stack
          direction="row"
          spacing={{ xs: 1, sm: 1.5 }}
          sx={{ flexGrow: 1, minWidth: 0, alignItems: "center" }}
        >
          <Box
            component="img"
            src={lumoraMark}
            alt="Lumora"
            sx={{
              width: { xs: 38, sm: 48 },
              height: { xs: 38, sm: 48 },
              display: "block",
              borderRadius: 2,
              boxShadow: "0 14px 30px rgba(37, 99, 235, 0.2)",
              flexShrink: 0,
            }}
          />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ lineHeight: 1.1 }}>
              Lumora
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: { xs: "none", sm: "block" }, whiteSpace: "nowrap" }}
            >
              Illuminate Enterprise Knowledge.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} sx={{ display: { xs: "none", md: "flex" } }}>
            <Chip
              label="Free beta"
              size="small"
              color="primary"
              sx={{ fontWeight: 850 }}
            />
            <Chip
              label="Limited time"
              size="small"
              variant="outlined"
              color="secondary"
            />
            <Chip
              label="Private"
              size="small"
              sx={{
                bgcolor: "rgba(11, 61, 145, 0.12)",
                color: "primary.dark",
              }}
            />
          </Stack>
        </Stack>
        <Box
          sx={{
            display: "flex",
            gap: { xs: 0.5, sm: 1 },
            alignItems: "center",
            width: { xs: "100%", md: "auto" },
            overflowX: { xs: "auto", md: "visible" },
            pb: { xs: 0.25, md: 0 },
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
          }}
        >
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;

            return (
              <Button
                key={item.to}
                component={RouterLink}
                to={item.to}
                variant={isActive ? "contained" : "text"}
                color={isActive ? "primary" : "inherit"}
                sx={{
                  flexShrink: 0,
                  minWidth: "auto",
                  px: { xs: 1.15, sm: 2 },
                  display: { xs: item.to === "/dashboard" ? "none" : "inline-flex", sm: "inline-flex" },
                }}
              >
                {item.label}
              </Button>
            );
          })}
          <Button
            color="secondary"
            variant="outlined"
            onClick={handleLogout}
            sx={{ flexShrink: 0, minWidth: "auto", px: { xs: 1.15, sm: 2 } }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;



