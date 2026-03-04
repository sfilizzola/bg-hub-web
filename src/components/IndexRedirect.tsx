import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { Box, CircularProgress, Typography } from "@mui/material";

/**
 * For route "/": when logged in redirect to Feed, otherwise to Search.
 * Shows a brief loading state while auth is resolving.
 */
export function IndexRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <CircularProgress size={24} />
        <Typography>Loading…</Typography>
      </Box>
    );
  }

  return <Navigate to={user ? "/me/feed" : "/search"} replace />;
}
