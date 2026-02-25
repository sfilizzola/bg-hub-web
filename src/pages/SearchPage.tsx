import { useState, useEffect } from "react";
import { search } from "../api/search";
import {
  addOwned,
  addWishlist,
  getOwned,
  getWishlist,
  removeOwned,
  removeWishlist,
  followUserById,
  unfollowUserById,
} from "../api/me";
import type { GameDto } from "../api/games";
import type { SearchUserDto } from "../api/search";
import { GameCard } from "../components/GameCard";
import { UserCard } from "../components/UserCard";
import { useAuth } from "../contexts/useAuth";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  Grid,
  Container,
  Stack,
} from "@mui/material";

export function SearchPage() {
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [games, setGames] = useState<GameDto[]>([]);
  const [users, setUsers] = useState<SearchUserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [acting, setActing] = useState<Record<string, string>>({});
  const [actingFollow, setActingFollow] = useState<Record<string, boolean>>({});
  const [ownedIds, setOwnedIds] = useState<string[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setOwnedIds([]);
      setWishlistIds([]);
      return;
    }
    let cancelled = false;
    Promise.all([getOwned(), getWishlist()])
      .then(([ownedRes, wishlistRes]) => {
        if (cancelled) return;
        setOwnedIds(ownedRes.games.map((g) => g.id));
        setWishlistIds(wishlistRes.games.map((g) => g.id));
      })
      .catch(() => {
        if (!cancelled) {
          setOwnedIds([]);
          setWishlistIds([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  async function handleSearch(e: { preventDefault(): void }) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await search(q);
      setGames(res.games);
      setUsers(res.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setGames([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  async function addTo(gameId: string, key: "owned" | "wishlist") {
    if (acting[gameId]) return;
    setActing((a) => ({ ...a, [gameId]: key }));
    try {
      if (key === "owned") {
        await addOwned(gameId);
        setOwnedIds((prev) => (prev.includes(gameId) ? prev : [...prev, gameId]));
      } else {
        await addWishlist(gameId);
        setWishlistIds((prev) => (prev.includes(gameId) ? prev : [...prev, gameId]));
      }
    } catch {
      // User feedback via acting state; ignore network errors
    } finally {
      setActing((a) => {
        const next = { ...a };
        delete next[gameId];
        return next;
      });
    }
  }

  async function removeFrom(gameId: string, key: "owned" | "wishlist") {
    const actingKey = key === "owned" ? "removeOwned" : "removeWishlist";
    if (acting[gameId]) return;
    setActing((a) => ({ ...a, [gameId]: actingKey }));
    try {
      if (key === "owned") {
        await removeOwned(gameId);
        setOwnedIds((prev) => prev.filter((id) => id !== gameId));
      } else {
        await removeWishlist(gameId);
        setWishlistIds((prev) => prev.filter((id) => id !== gameId));
      }
    } catch {
      // Ignore network errors
    } finally {
      setActing((a) => {
        const next = { ...a };
        delete next[gameId];
        return next;
      });
    }
  }

  async function handleFollowToggle(user: SearchUserDto) {
    const id = user.id;
    if (actingFollow[id]) return;
    const wasFollowing = user.isFollowing;
    setActingFollow((a) => ({ ...a, [id]: true }));
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, isFollowing: !u.isFollowing } : u))
    );
    try {
      if (wasFollowing) {
        await unfollowUserById(id);
      } else {
        await followUserById(id);
      }
    } catch {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isFollowing: wasFollowing } : u))
      );
    } finally {
      setActingFollow((a) => {
        const next = { ...a };
        delete next[id];
        return next;
      });
    }
  }

  const hasSearched = !!q && !loading;
  const isEmpty = hasSearched && games.length === 0 && users.length === 0;
  const isEmptyQuery = q.trim() === "";

  const searchForm = (
    <Box
      component="form"
      onSubmit={handleSearch}
      sx={{ display: "flex", gap: 1, flexWrap: "wrap", width: "100%", maxWidth: 420 }}
    >
      <TextField
        type="search"
        placeholder="Games and users…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        size="small"
        sx={{ minWidth: 220, flex: 1 }}
      />
      <Button type="submit" variant="contained" disabled={loading}>
        {loading ? "Searching…" : "Search"}
      </Button>
    </Box>
  );

  if (isEmptyQuery) {
    return (
      <Container maxWidth="sm">
        <Box
          sx={{
            minHeight: { xs: "50vh", md: "60vh" },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 4,
          }}
        >
          <Stack alignItems="center" spacing={3} sx={{ width: "100%" }}>
            <Typography
              variant="h4"
              component="h1"
              textAlign="center"
              sx={{
                fontWeight: 600,
                typography: { xs: "h5", md: "h4" },
              }}
            >
              {user
                ? `Welcome to BG Hub, ${user.username}`
                : "Welcome to BG Hub"}
            </Typography>
            {searchForm}
          </Stack>
        </Box>
      </Container>
    );
  }

  return (
    <Box>
      <Typography variant="h2" component="h1" sx={{ mb: 2 }}>
        Search
      </Typography>
      <Box sx={{ mb: 3 }}>{searchForm}</Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {games.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Games
          </Typography>
          <Grid container spacing={2}>
            {games.map((g) => (
              <Grid item key={g.id} xs={12} sm={6} md={4} sx={{ minWidth: 0 }}>
                <Box sx={{ width: "100%", minWidth: 0 }}>
                  <GameCard
                  game={g}
                  variant="search"
                  inCollection={ownedIds.includes(g.id)}
                  inWishlist={wishlistIds.includes(g.id)}
                  acting={acting[g.id]}
                  onAddOwned={user ? () => addTo(g.id, "owned") : undefined}
                  onAddWishlist={user ? () => addTo(g.id, "wishlist") : undefined}
                  onRemoveOwned={user && ownedIds.includes(g.id) ? () => removeFrom(g.id, "owned") : undefined}
                  onRemoveWishlist={user && wishlistIds.includes(g.id) ? () => removeFrom(g.id, "wishlist") : undefined}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {users.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Users
          </Typography>
          <Grid container spacing={2}>
            {users.map((u) => (
              <Grid item key={u.id} xs={12} sm={6} md={4}>
                <UserCard
                  user={u}
                  showActions
                  acting={!!actingFollow[u.id]}
                  onFollowToggle={() => handleFollowToggle(u)}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {isEmpty && !error && (
        <Typography color="text.secondary">
          No games or users found. Try another search.
        </Typography>
      )}
    </Box>
  );
}
