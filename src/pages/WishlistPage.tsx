import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getWishlist, removeWishlist } from "../api/me";
import type { GameDto } from "../api/games";
import { GameCard } from "../components/GameCard";
import { Box, Typography, Alert, Button, CircularProgress, Grid } from "@mui/material";

export function WishlistPage() {
  const [games, setGames] = useState<GameDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await getWishlist();
      setGames(res.games);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRemove(gameId: string) {
    if (removing) return;
    setRemoving(gameId);
    try {
      await removeWishlist(gameId);
      setGames((prev) => prev.filter((g) => g.id !== gameId));
    } catch {
      setError("Failed to remove");
    } finally {
      setRemoving(null);
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        <CircularProgress size={24} />
        <Typography>Loading wishlist…</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h2" component="h1" sx={{ mb: 2 }}>
        Wishlist
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {games.length === 0 && !error ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography sx={{ mb: 1 }}>No wishlist games yet.</Typography>
          <Button component={Link} to="/search" variant="contained" size="small">
            Search games
          </Button>
        </Alert>
      ) : (
        <Grid container spacing={2}>
          {games.map((g) => (
            <Grid item key={g.id} xs={12} sm={6} md={4}>
              <GameCard
                game={g}
                variant="list"
                removing={removing === g.id}
                onRemove={() => handleRemove(g.id)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
