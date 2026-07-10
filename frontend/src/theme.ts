import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
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
      default: "#07111f",
      paper: "#101b2d",
    },
    text: {
      primary: "#f8fafc",
      secondary: "#b6c2d2",
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
          backgroundColor: "#07111f",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: "1px solid rgba(148, 163, 184, 0.18)",
          boxShadow: "0 16px 42px rgba(0, 0, 0, 0.26)",
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
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(7, 17, 31, 0.72)",
          color: "#f8fafc",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(182, 194, 210, 0.36)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(96, 165, 250, 0.72)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#60a5fa",
            borderWidth: 2,
          },
          "&.Mui-disabled": {
            backgroundColor: "rgba(15, 23, 42, 0.54)",
          },
          "& input::placeholder, & textarea::placeholder": {
            color: "#cbd5e1",
            opacity: 1,
          },
        },
        input: {
          color: "#f8fafc",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#dbeafe",
          "&.Mui-focused": {
            color: "#93c5fd",
          },
          "&.Mui-error": {
            color: "#fca5a5",
          },
        },
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          color: "#b6c2d2",
        },
      },
    },
  },
});

export default theme;
