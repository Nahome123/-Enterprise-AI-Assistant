import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#0b3d91",
      light: "#2f6fd6",
      dark: "#062b63",
    },
    secondary: {
      main: "#017E84",
      light: "#2aa5aa",
      dark: "#005f63",
    },
    background: {
      default: "#f8f9fa",
      paper: "#ffffff",
    },
    text: {
      primary: "#1f2937",
      secondary: "#6b7280",
    },
    success: {
      main: "#198754",
    },
    warning: {
      main: "#f0ad4e",
    },
    error: {
      main: "#dc3545",
    },
  },
  shape: {
    borderRadius: 6,
  },
  typography: {
    fontFamily: [
      "ADLaM Display",
      "Segoe UI",
      "Roboto",
      "Arial",
      "sans-serif",
    ].join(","),
    h1: {
      fontFamily: '"ADLaM Display", "Segoe UI", Roboto, Arial, sans-serif',
      fontWeight: 900,
    },
    h2: {
      fontFamily: '"ADLaM Display", "Segoe UI", Roboto, Arial, sans-serif',
      fontWeight: 900,
    },
    h3: {
      fontFamily: '"ADLaM Display", "Segoe UI", Roboto, Arial, sans-serif',
      fontWeight: 900,
    },
    h4: {
      fontFamily: '"ADLaM Display", "Segoe UI", Roboto, Arial, sans-serif',
      fontWeight: 900,
    },
    h5: {
      fontFamily: '"ADLaM Display", "Segoe UI", Roboto, Arial, sans-serif',
      fontWeight: 900,
    },
    h6: {
      fontFamily: '"ADLaM Display", "Segoe UI", Roboto, Arial, sans-serif',
      fontWeight: 900,
    },
    subtitle1: {
      fontWeight: 800,
    },
    button: {
      fontWeight: 800,
      textTransform: "none",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: "#f8f9fa",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid #e5e7eb",
          boxShadow: "0 10px 30px rgba(31, 41, 55, 0.06)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
  },
});

export default theme;
