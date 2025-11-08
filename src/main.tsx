import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import queryClient from "./lib/queryClient.ts";
import { createTheme, ThemeProvider } from "@mui/material";
import { AuthProvider } from "./context/AuthContext.tsx";

const theme = createTheme({
  palette: {
    primary: {
      main: "#4caf50",
    },
    secondary: {
      main: "#0A4D82",
    },
    background: {
      default: "#f5f5f5",
    },
    text: {
      primary: "#333",
    },
  },
  typography: {
    fontFamily: "Montserrat",
    h2: {
      fontWeight: "600",
      fontSize: "24px",
    },
  },
  components: {
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: "10px !important",
          position: "unset",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: "#354A36",
          color: "white",
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: "white",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          fontWeight: "500",
          fontSize: "14px",
        },
        head: {
          fontWeight: "700",
          fontSize: "15px",
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          height: "100%",
        },
      },
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <App />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
