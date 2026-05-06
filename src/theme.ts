/**
 * BG Hub — MUI Theme
 * Maps the design system tokens to a MUI theme.
 * Replace the existing src/theme.ts with this file.
 */

import { createTheme, alpha } from "@mui/material/styles";

/* ------------------------------------------------------------------ */
/* Token layer — mirrors design-system.html CSS custom properties     */
/* ------------------------------------------------------------------ */
export const tokens = {
  surface: {
    base: "#0F0E0C",
    s1:   "#1A1612",
    s2:   "#241D18",
    s3:   "#322820",
    s4:   "#41342A",
    edge: "#5B4A3C",
  },
  ink: {
    100: "#F6EFE1",
    80:  "#DCCFB6",
    60:  "#A89881",
    40:  "#7A6C5A",
    20:  "#544A3E",
  },
  amber: {
    200: "#FBE7C0", 300: "#F7D290", 400: "#F4BE5D",
    500: "#F0A830", 600: "#A47828", 700: "#6B4A1C", 900: "#3A2810",
  },
  emerald: {
    200: "#CFE7D8", 300: "#9BCFAE", 400: "#6CB185",
    500: "#3F8A5A", 600: "#2E6B48", 700: "#1F4F37", 900: "#0F2A1D",
  },
  rust: {
    200: "#F3CDC0", 300: "#E8A795", 400: "#D97F6A",
    500: "#C2553D", 600: "#A4422E", 700: "#7A2F1F", 900: "#3A1810",
  },
  radius: { sm: 4, md: 8, lg: 14, xl: 22 },
  font: {
    display: "'Bricolage Grotesque', 'Public Sans', system-ui, sans-serif",
    ui:      "'Public Sans', system-ui, sans-serif",
    mono:    "'JetBrains Mono', ui-monospace, monospace",
  },
  shadow: {
    e1: "0 1px 0 rgba(255,200,140,.04), 0 2px 6px rgba(0,0,0,.35)",
    e2: "0 1px 0 rgba(255,200,140,.06), 0 6px 18px rgba(0,0,0,.45)",
    e3: "0 1px 0 rgba(255,200,140,.08), 0 14px 38px rgba(0,0,0,.55)",
    e4: "0 1px 0 rgba(255,200,140,.10), 0 28px 64px rgba(0,0,0,.65)",
  },
} as const;

/* ------------------------------------------------------------------ */
/* Module augmentation — extend MUI types for our custom palette keys */
/* ------------------------------------------------------------------ */
declare module "@mui/material/styles" {
  interface Palette {
    surface: {
      base: string; s1: string; s2: string; s3: string; s4: string; edge: string;
    };
    ink: { 100: string; 80: string; 60: string; 40: string; 20: string };
    amber: Palette["primary"];
    emerald: Palette["primary"];
    rust: Palette["primary"];
  }
  interface PaletteOptions {
    surface?: Partial<Palette["surface"]>;
    ink?: Partial<Palette["ink"]>;
    amber?: PaletteOptions["primary"];
    emerald?: PaletteOptions["primary"];
    rust?: PaletteOptions["primary"];
  }
  interface TypographyVariants {
    display1: React.CSSProperties;
    display2: React.CSSProperties;
    eyebrow: React.CSSProperties;
    mono: React.CSSProperties;
    score: React.CSSProperties;
  }
  interface TypographyVariantsOptions {
    display1?: React.CSSProperties;
    display2?: React.CSSProperties;
    eyebrow?: React.CSSProperties;
    mono?: React.CSSProperties;
    score?: React.CSSProperties;
  }
}

declare module "@mui/material/Typography" {
  interface TypographyPropsVariantOverrides {
    display1: true; display2: true; eyebrow: true; mono: true; score: true;
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    amber: true; emerald: true; rust: true;
  }
}

/* ------------------------------------------------------------------ */
/* Theme                                                              */
/* ------------------------------------------------------------------ */
export const theme = createTheme({
  palette: {
    mode: "dark",

    // Map amber → primary (lantern, primary CTA)
    primary: {
      main:        tokens.amber[500],
      light:       tokens.amber[400],
      dark:        tokens.amber[600],
      contrastText: "#1A1410",
    },
    // Map emerald → secondary (felt, owned, success-ish accents)
    secondary: {
      main:        tokens.emerald[500],
      light:       tokens.emerald[400],
      dark:        tokens.emerald[600],
      contrastText: tokens.ink[100],
    },

    error:   { main: tokens.rust[500],    light: tokens.rust[400],    dark: tokens.rust[700],    contrastText: tokens.ink[100] },
    warning: { main: tokens.amber[500],   light: tokens.amber[400],   dark: tokens.amber[700],   contrastText: "#1A1410" },
    info:    { main: "#5C8FBF",           light: "#82AAD0",           dark: "#1F3A52",           contrastText: tokens.ink[100] },
    success: { main: tokens.emerald[500], light: tokens.emerald[400], dark: tokens.emerald[700], contrastText: tokens.ink[100] },

    background: {
      default: tokens.surface.base,
      paper:   tokens.surface.s2,
    },
    text: {
      primary:   tokens.ink[100],
      secondary: tokens.ink[60],
      disabled:  tokens.ink[20],
    },
    divider: tokens.surface.s3,

    // Custom token groups (accessible via theme.palette.amber, etc.)
    surface: tokens.surface,
    ink:     tokens.ink,
    amber:   { main: tokens.amber[500],   light: tokens.amber[400],   dark: tokens.amber[600],   contrastText: "#1A1410" },
    emerald: { main: tokens.emerald[500], light: tokens.emerald[400], dark: tokens.emerald[600], contrastText: tokens.ink[100] },
    rust:    { main: tokens.rust[500],    light: tokens.rust[400],    dark: tokens.rust[600],    contrastText: tokens.ink[100] },
  },

  shape: { borderRadius: tokens.radius.md },

  // 4-px base spacing scale: theme.spacing(1) = 4px
  spacing: 4,

  // Soft, warm shadows. MUI expects 25 entries; e1–e4 cycle through the rest.
  shadows: [
    "none",
    tokens.shadow.e1, tokens.shadow.e1, tokens.shadow.e1, tokens.shadow.e1,
    tokens.shadow.e2, tokens.shadow.e2, tokens.shadow.e2, tokens.shadow.e2,
    tokens.shadow.e3, tokens.shadow.e3, tokens.shadow.e3, tokens.shadow.e3,
    tokens.shadow.e3, tokens.shadow.e3, tokens.shadow.e3, tokens.shadow.e3,
    tokens.shadow.e4, tokens.shadow.e4, tokens.shadow.e4, tokens.shadow.e4,
    tokens.shadow.e4, tokens.shadow.e4, tokens.shadow.e4, tokens.shadow.e4,
  ] as any,

  typography: {
    fontFamily: tokens.font.ui,
    fontSize: 15,

    display1: { fontFamily: tokens.font.display, fontWeight: 700, fontSize: "64px", lineHeight: 1.05, letterSpacing: "-0.02em", color: tokens.ink[100] },
    display2: { fontFamily: tokens.font.display, fontWeight: 700, fontSize: "48px", lineHeight: 1.08, letterSpacing: "-0.02em", color: tokens.ink[100] },

    h1: { fontFamily: tokens.font.display, fontWeight: 700, fontSize: "32px", lineHeight: 1.10, letterSpacing: "-0.02em" },
    h2: { fontFamily: tokens.font.display, fontWeight: 600, fontSize: "24px", lineHeight: 1.15 },
    h3: { fontFamily: tokens.font.ui,      fontWeight: 600, fontSize: "18px", lineHeight: 1.30 },
    h4: { fontFamily: tokens.font.display, fontWeight: 600, fontSize: "18px", lineHeight: 1.30 },
    h5: { fontFamily: tokens.font.ui,      fontWeight: 600, fontSize: "16px", lineHeight: 1.35 },
    h6: { fontFamily: tokens.font.ui,      fontWeight: 600, fontSize: "14px", lineHeight: 1.40, textTransform: "uppercase", letterSpacing: "0.08em" },

    body1: { fontFamily: tokens.font.ui, fontWeight: 400, fontSize: "15px", lineHeight: 1.55 },
    body2: { fontFamily: tokens.font.ui, fontWeight: 400, fontSize: "13px", lineHeight: 1.50 },

    subtitle1: { fontFamily: tokens.font.ui, fontWeight: 500, fontSize: "17px", lineHeight: 1.45 },
    subtitle2: { fontFamily: tokens.font.ui, fontWeight: 600, fontSize: "13px", lineHeight: 1.40 },

    caption: { fontFamily: tokens.font.ui, fontWeight: 500, fontSize: "12px", letterSpacing: "0.06em", color: tokens.ink[40] },
    overline: { fontFamily: tokens.font.ui, fontWeight: 600, fontSize: "11px", letterSpacing: "0.10em", textTransform: "uppercase", color: tokens.ink[40] },

    eyebrow: { fontFamily: tokens.font.ui, fontWeight: 600, fontSize: "12px", letterSpacing: "0.16em", textTransform: "uppercase", color: tokens.amber[500] },
    mono:    { fontFamily: tokens.font.mono, fontWeight: 500, fontSize: "13px" },
    score:   { fontFamily: tokens.font.mono, fontWeight: 700, fontSize: "56px", color: tokens.amber[500], letterSpacing: "-0.02em" },

    button: { fontFamily: tokens.font.ui, fontWeight: 600, fontSize: "14px", textTransform: "none", letterSpacing: 0 },
  },

  components: {
    /* ---------- Global baseline ---------- */
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: tokens.surface.base,
          backgroundImage:
            "radial-gradient(1200px 600px at 20% -200px, rgba(240,168,48,.06), transparent 60%), radial-gradient(900px 500px at 110% 10%, rgba(63,138,90,.05), transparent 60%)",
          color: tokens.ink[80],
          WebkitFontSmoothing: "antialiased",
        },
      },
    },

    /* ---------- Buttons ---------- */
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.md,
          padding: "10px 16px",
          fontWeight: 600,
          textTransform: "none",
          gap: 8,
          transition: "transform .08s ease, box-shadow .15s ease, background .15s ease",
          "&:active": { transform: "translateY(1px)" },
        },
        sizeSmall: { padding: "7px 12px", fontSize: 13, borderRadius: 6 },
        sizeLarge: { padding: "14px 22px", fontSize: 16, borderRadius: 10 },
        containedPrimary: {
          backgroundColor: tokens.amber[500],
          color: "#1A1410",
          border: `1px solid ${tokens.amber[600]}`,
          boxShadow: `inset 0 -2px 0 rgba(0,0,0,.18), 0 1px 0 rgba(255,210,140,.25), ${tokens.shadow.e1}`,
          "&:hover":  { backgroundColor: tokens.amber[400], boxShadow: tokens.shadow.e1 },
          "&:active": { backgroundColor: tokens.amber[600], boxShadow: "inset 0 2px 0 rgba(0,0,0,.18)" },
          "&.Mui-disabled": { backgroundColor: tokens.surface.s3, color: tokens.ink[40], borderColor: tokens.surface.s3 },
        },
        containedSecondary: {
          backgroundColor: tokens.emerald[700],
          color: tokens.emerald[200],
          border: `1px solid ${tokens.emerald[600]}`,
          "&:hover": { backgroundColor: tokens.emerald[600], color: tokens.ink[100] },
        },
        outlined: {
          borderColor: tokens.surface.edge,
          color: tokens.ink[100],
          backgroundColor: "transparent",
          "&:hover": { backgroundColor: tokens.surface.s2, borderColor: tokens.ink[40] },
        },
        text: {
          color: tokens.ink[80],
          "&:hover": { backgroundColor: tokens.surface.s3, color: tokens.ink[100] },
        },
      },
    },

    MuiIconButton: {
      styleOverrides: {
        root: {
          color: tokens.ink[80],
          borderRadius: tokens.radius.md,
          "&:hover": { backgroundColor: tokens.surface.s3, color: tokens.ink[100] },
        },
      },
    },

    /* ---------- Inputs ---------- */
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.surface.s3,
          borderRadius: tokens.radius.md,
          color: tokens.ink[100],
          fontFamily: tokens.font.ui,
          fontSize: 15,
          "& .MuiOutlinedInput-notchedOutline": { borderColor: tokens.surface.s4 },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: tokens.ink[40] },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: tokens.amber[500], borderWidth: 1 },
          "&.Mui-focused": { boxShadow: `0 0 0 3px ${alpha(tokens.amber[500], 0.18)}` },
          "&.Mui-error .MuiOutlinedInput-notchedOutline": { borderColor: tokens.rust[500] },
          "&.Mui-error.Mui-focused": { boxShadow: `0 0 0 3px ${alpha(tokens.rust[500], 0.20)}` },
        },
        input: { padding: "10px 14px", "&::placeholder": { color: tokens.ink[40], opacity: 1 } },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: tokens.ink[60],
          fontSize: 12,
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          "&.Mui-focused": { color: tokens.amber[500] },
        },
      },
    },

    MuiFormHelperText: {
      styleOverrides: {
        root: {
          marginLeft: 0,
          color: tokens.ink[40],
          fontSize: 12,
          "&.Mui-error": { color: tokens.rust[400] },
        },
      },
    },

    /* ---------- Surfaces ---------- */
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: "none", backgroundColor: tokens.surface.s2 },
        outlined: { borderColor: tokens.surface.s3 },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 1 },
      styleOverrides: {
        root: {
          backgroundColor: tokens.surface.s2,
          border: `1px solid ${tokens.surface.s3}`,
          borderRadius: tokens.radius.lg,
          boxShadow: tokens.shadow.e1,
          backgroundImage: "none",
        },
      },
    },
    MuiCardContent: {
      styleOverrides: { root: { padding: 18, "&:last-child": { paddingBottom: 18 } } },
    },

    MuiAppBar: {
      defaultProps: { elevation: 0, color: "default" },
      styleOverrides: {
        root: {
          backgroundColor: tokens.surface.s1,
          backgroundImage: "none",
          borderBottom: `1px solid ${tokens.surface.s3}`,
          color: tokens.ink[100],
        },
      },
    },

    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: tokens.surface.s1,
          backgroundImage: "none",
          borderRight: `1px solid ${tokens.surface.s3}`,
        },
      },
    },

    MuiDivider: {
      styleOverrides: { root: { borderColor: tokens.surface.s3 } },
    },

    /* ---------- Sidebar list (use as <List dense> in the Drawer) ---------- */
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: tokens.radius.md,
          padding: "8px 12px",
          margin: "1px 4px",
          color: tokens.ink[80],
          fontSize: 14,
          fontWeight: 500,
          "&:hover": { backgroundColor: tokens.surface.s2, color: tokens.ink[100] },
          "&.Mui-selected": {
            backgroundColor: tokens.surface.s3,
            color: tokens.ink[100],
            position: "relative",
            "&::before": {
              content: '""',
              position: "absolute",
              left: -1, top: 8, bottom: 8, width: 3,
              backgroundColor: tokens.amber[500],
              borderRadius: "0 3px 3px 0",
            },
            "&:hover": { backgroundColor: tokens.surface.s3 },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: { color: tokens.ink[40], minWidth: 28 },
      },
    },
    MuiListSubheader: {
      styleOverrides: {
        root: {
          backgroundColor: "transparent",
          color: tokens.ink[40],
          fontSize: 11,
          textTransform: "uppercase",
          letterSpacing: "0.10em",
          fontWeight: 600,
          padding: "14px 12px 6px",
          lineHeight: 1.2,
        },
      },
    },

    /* ---------- Chips ---------- */
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: tokens.font.ui,
          fontWeight: 600,
          fontSize: 12,
          height: 24,
          borderRadius: 999,
          letterSpacing: "0.02em",
          backgroundColor: tokens.surface.s2,
          border: `1px solid ${tokens.surface.s3}`,
          color: tokens.ink[80],
        },
        outlined: {
          backgroundColor: tokens.surface.s2,
          borderColor: tokens.surface.edge,
        },
        colorPrimary: {
          backgroundColor: alpha(tokens.amber[500], 0.13),
          color: tokens.amber[300],
          borderColor: tokens.amber[700],
        },
        colorSecondary: {
          backgroundColor: alpha(tokens.emerald[500], 0.15),
          color: tokens.emerald[300],
          borderColor: tokens.emerald[700],
        },
        colorError: {
          backgroundColor: alpha(tokens.rust[500], 0.15),
          color: tokens.rust[300],
          borderColor: tokens.rust[700],
        },
        deleteIcon: { color: "inherit", opacity: 0.6, "&:hover": { opacity: 1, color: "inherit" } },
      },
    },

    /* ---------- Tabs ---------- */
    MuiTabs: {
      styleOverrides: {
        root: { borderBottom: `1px solid ${tokens.surface.edge}`, minHeight: 44 },
        indicator: { height: 3, borderRadius: "3px 3px 0 0", backgroundColor: tokens.amber[500] },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontFamily: tokens.font.display,
          fontWeight: 600,
          fontSize: 15,
          color: tokens.ink[60],
          minHeight: 44,
          padding: "12px 18px",
          "&:hover": { color: tokens.ink[100] },
          "&.Mui-selected": { color: tokens.ink[100] },
        },
      },
    },

    /* ---------- Avatar ---------- */
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontFamily: tokens.font.display,
          fontWeight: 700,
          color: "#1A1410",
          backgroundColor: tokens.surface.s4,
          border: "1px solid rgba(0,0,0,.25)",
        },
      },
    },

    /* ---------- Dialog / Sheet ---------- */
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: tokens.surface.s1,
          backgroundImage: "none",
          borderRadius: tokens.radius.xl,
          border: `1px solid ${tokens.surface.s3}`,
          boxShadow: tokens.shadow.e4,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontFamily: tokens.font.display,
          fontWeight: 700,
          fontSize: 20,
          color: tokens.ink[100],
          padding: "18px 22px",
          borderBottom: `1px solid ${tokens.surface.s3}`,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: { root: { padding: "18px 22px" } },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: "14px 22px",
          borderTop: `1px solid ${tokens.surface.s3}`,
          backgroundColor: tokens.surface.base,
        },
      },
    },

    MuiBackdrop: {
      styleOverrides: {
        root: { backgroundColor: "rgba(15,14,12,0.7)", backdropFilter: "blur(4px)" },
      },
    },

    /* ---------- Tooltip ---------- */
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: tokens.surface.s4,
          color: tokens.ink[100],
          border: `1px solid ${tokens.surface.edge}`,
          fontSize: 12,
          fontFamily: tokens.font.ui,
          padding: "6px 10px",
          borderRadius: tokens.radius.sm,
        },
        arrow: { color: tokens.surface.s4 },
      },
    },

    /* ---------- Switch / Checkbox / Radio ---------- */
    MuiSwitch: {
      styleOverrides: {
        switchBase: { "&.Mui-checked": { color: tokens.amber[500] }, "&.Mui-checked + .MuiSwitch-track": { backgroundColor: tokens.amber[600], opacity: 1 } },
        track: { backgroundColor: tokens.surface.s4, opacity: 1 },
      },
    },

    /* ---------- Toggle button group (segmented control) ---------- */
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.surface.s3,
          border: `1px solid ${tokens.surface.s4}`,
          borderRadius: 999,
          padding: 3,
          gap: 2,
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          border: 0,
          borderRadius: "999px !important",
          color: tokens.ink[60],
          padding: "7px 16px",
          fontFamily: tokens.font.ui,
          fontWeight: 600,
          fontSize: 13,
          textTransform: "none",
          "&.Mui-selected": {
            backgroundColor: tokens.amber[500],
            color: "#1A1410",
            "&:hover": { backgroundColor: tokens.amber[400] },
          },
        },
      },
    },

    /* ---------- Linear / circular progress ---------- */
    MuiLinearProgress: {
      styleOverrides: {
        root: { backgroundColor: tokens.surface.s3, borderRadius: 999, height: 6 },
        bar:  { backgroundColor: tokens.amber[500], borderRadius: 999 },
      },
    },

    /* ---------- Skeleton ---------- */
    MuiSkeleton: {
      styleOverrides: {
        root: { backgroundColor: tokens.surface.s3 },
      },
    },
  },
});

export default theme;
