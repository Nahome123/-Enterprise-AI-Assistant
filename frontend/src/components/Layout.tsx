import { Box, Container } from "@mui/material";
import { Outlet } from "react-router-dom";

import EnterpriseBackground from "./EnterpriseBackground";
import Navbar from "./Navbar";

function Layout() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <EnterpriseBackground />
      <Navbar />
      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 4 }, position: "relative", zIndex: 1 }}>
        <Outlet />
      </Container>
    </Box>
  );
}

export default Layout;
