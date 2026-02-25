import { useEffect, useState } from "react";
import { getFollowers } from "../api/me";
import type { FollowUser } from "../api/me";
import { UserCard } from "../components/UserCard";
import { Box, Typography, Alert, CircularProgress, Grid } from "@mui/material";

export function FollowersPage() {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getFollowers()
      .then((res) => {
        setUsers(res.users);
        setError("");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <CircularProgress size={24} />
        <Typography>Loading followers…</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h2" component="h1" sx={{ mb: 2 }}>
        Followers
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {!error && users.length === 0 && (
        <Alert severity="info">You have no followers yet.</Alert>
      )}
      {!error && users.length > 0 && (
        <Grid container spacing={2}>
          {users.map((u) => (
            <Grid item key={u.id} xs={12} sm={6} md={4}>
              <UserCard user={u} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
