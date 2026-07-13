import { Box, Container } from "@mui/material";
import { Outlet } from "react-router-dom";

import EnterpriseBackground from "./EnterpriseBackground";
import LegalFooter from "./LegalFooter";
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
      <Container
        maxWidth="xl"
        sx={{
          px: { xs: 1.5, sm: 3 },
          py: { xs: 2, md: 4 },
          position: "relative",
          zIndex: 1,
        }}
      >
        <Outlet />
      </Container>
      <LegalFooter />
    </Box>
  );
}

export default Layout;
