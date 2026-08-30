import { createTheme } from "@mui/material/styles";

export const mono = "'IBM Plex Mono', ui-monospace, monospace";

export const moss = {
  900: "#2E453B",
  700: "#3F5D50",
  300: "#C6D5CC",
  100: "#E8EEEA",
  50: "#F2F5F3",
};
export const clay = { 700: "#8E4223", 500: "#B4552D", 50: "#F6E7DF" };
export const paper = { bg: "#F4F3EF", card: "#FFFFFF", sunken: "#FBFAF8" };
export const line = {
  structural: "#E2E0DA",
  inCard: "#EFEDE7",
  input: "#C9C7C0",
  muted: "#DDDBD4",
};
export const ink = {
  900: "#191C1A",
  800: "#2C302D",
  700: "#3B403C",
  600: "#5B615D",
  500: "#6B716C",
  400: "#8A908B",
  300: "#A0A59F",
};

export const theme = createTheme({
  cssVariables: true,
  palette: {
    primary: {
      main: moss[700],
      dark: moss[900],
      light: moss[100],
      contrastText: "#fff",
    },
    secondary: { main: clay[500], dark: clay[700], light: clay[50] },
    error: { main: clay[500], dark: clay[700] },
    background: { default: paper.bg, paper: paper.card },
    text: { primary: ink[900], secondary: ink[500], disabled: ink[300] },
    divider: line.structural,
    action: { hover: paper.sunken, selected: moss[100] },
  },
  typography: {
    fontFamily: "'Public Sans', Helvetica, Arial, sans-serif",
    h4: {
      fontWeight: 700,
      fontSize: "1.625rem",
      lineHeight: 1.2,
      letterSpacing: "-0.01em",
    },
    h5: {
      fontWeight: 700,
      fontSize: "1.5rem",
      lineHeight: 1.2,
      letterSpacing: "-0.01em",
    },
    h6: { fontWeight: 600, fontSize: "1.1875rem", lineHeight: 1.3 },
    subtitle1: { fontWeight: 600, fontSize: "1.125rem", lineHeight: 1.2 },
    subtitle2: { fontWeight: 600, fontSize: "0.8125rem", lineHeight: 1 },
    body1: { fontWeight: 400, fontSize: "1rem", lineHeight: 1.65 },
    body2: { fontWeight: 400, fontSize: "0.875rem", lineHeight: 1.55 },
    button: {
      fontWeight: 600,
      fontSize: "0.8125rem",
      letterSpacing: "0.04em",
      textTransform: "uppercase",
    },
    caption: { fontFamily: mono, fontSize: "0.78125rem", lineHeight: 1 },
    overline: {
      fontFamily: mono,
      fontWeight: 600,
      fontSize: "0.6875rem",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
    },
  },
});
