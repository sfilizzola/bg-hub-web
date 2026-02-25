import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Avatar,
  ButtonBase,
  Stack,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import SportsEsports from "@mui/icons-material/SportsEsports";
import { useAuth } from "../contexts/useAuth";

/** Placeholder branding icon for the app. Replace with a custom logo when available. */
function BrandIcon() {
  return <SportsEsports sx={{ fontSize: 28 }} />;
}

const navLinks = [
  { to: "/search", label: "Search" },
  { to: "/me/owned", label: "Owned" },
  { to: "/me/wishlist", label: "Wishlist" },
  { to: "/me/plays", label: "Plays" },
  { to: "/me/following", label: "Following" },
  { to: "/me/followers", label: "Followers" },
];

export function Layout() {
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const profilePath = user ? `/u/${user.username}` : "/profile";

  const navContent = (
    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ display: { xs: "none", md: "flex" } }}>
      {navLinks.map(({ to, label }) => (
        <Button
          key={to}
          component={Link}
          to={to}
          color="inherit"
          size="small"
        >
          {label}
        </Button>
      ))}
    </Stack>
  );

  const authContent = user ? (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <ButtonBase
        component={Link}
        to={profilePath}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          borderRadius: 1,
          px: 1,
          py: 0.5,
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <Avatar
          sx={{ width: 32, height: 32 }}
          src={(user as { avatarUrl?: string }).avatarUrl}
        >
          {user.username.charAt(0).toUpperCase()}
        </Avatar>
        <Typography
          variant="body2"
          component="span"
          sx={{ display: { xs: "none", sm: "inline" }, fontWeight: 500 }}
        >
          {user.username}
        </Typography>
      </ButtonBase>
      <Button color="inherit" variant="outlined" size="small" onClick={logout}>
        Logout
      </Button>
    </Box>
  ) : (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      <Button component={Link} to="/login" color="inherit">
        Login
      </Button>
      <Button component={Link} to="/signup" color="inherit">
        Signup
      </Button>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static">
        <Toolbar sx={{ gap: 1 }}>
          {user && (
            <IconButton
              color="inherit"
              aria-label="Open menu"
              edge="start"
              sx={{ display: { md: "none" }, mr: 0.5 }}
              onClick={() => setDrawerOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          )}
          <IconButton
            component={Link}
            to="/search"
            color="inherit"
            aria-label="BG Hub home"
            sx={{ p: 0.5 }}
          >
            <BrandIcon />
          </IconButton>
          {navContent}
          <Box sx={{ flexGrow: 1 }} />
          {authContent}
        </Toolbar>
      </AppBar>

      {user && (
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { width: 240 },
          }}
        >
          <Toolbar />
          <List>
            {navLinks.map(({ to, label }) => (
              <ListItemButton
                key={to}
                component={Link}
                to={to}
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemText primary={label} />
              </ListItemButton>
            ))}
          </List>
        </Drawer>
      )}

      <Container component="main" sx={{ py: 3, flex: 1 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
