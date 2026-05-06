import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { search } from "../api/search";
import { getByBggId } from "../api/games";
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
import type { GameSearchItemDto, SearchUserDto } from "../api/search";
import { GameCard, UserCard } from "../components/bg";
import { useAuth } from "../contexts/useAuth";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  List,
  ListItem,
  Snackbar,
} from "@mui/material";

const SEARCH_DEBOUNCE_MS = 400;
const DEFAULT_GAMES_LIMIT = 20;
const RESULTS_MAX_HEIGHT = "60vh";

export function SearchPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [q, setQ] = useState("");
  const [games, setGames] = useState<GameSearchItemDto[]>([]);
  const [users, setUsers] = useState<SearchUserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [hasMoreGames, setHasMoreGames] = useState(false);
  const [acting, setActing] = useState<Record<string, string>>({});
  const [actingFollow, setActingFollow] = useState<Record<string, boolean>>({});
  const [ownedIds, setOwnedIds] = useState<string[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [importingBggId, setImportingBggId] = useState<number | null>(null);
  const [snackMessage, setSnackMessage] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const runSearch = useCallback(
    async (query: string, offset = 0, append = false) => {
      const trimmed = query.trim();
      if (!trimmed) {
        if (!append) {
          setGames([]);
          setUsers([]);
          setHasMoreGames(false);
        }
        return;
      }
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError("");
      try {
        const res = await search(trimmed, {
          gamesLimit: DEFAULT_GAMES_LIMIT,
          gamesOffset: offset,
        });
        if (append) {
          setGames((prev) => [...prev, ...res.games]);
        } else {
          setGames(res.games);
          setUsers(res.users);
        }
        setHasMoreGames(res.hasMoreGames ?? false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Search failed");
        if (!append) {
          setGames([]);
          setUsers([]);
          setHasMoreGames(false);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    []
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = q.trim();
    if (!trimmed) {
      setGames([]);
      setUsers([]);
      setHasMoreGames(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      debounceRef.current = null;
      runSearch(q, 0, false);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q, runSearch]);

  async function handleSearch(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!q.trim()) return;
    runSearch(q, 0, false);
  }

  function handleLoadMoreGames() {
    if (loadingMore || !hasMoreGames) return;
    runSearch(q, games.length, true);
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

  async function handleBggGameClick(game: GameSearchItemDto) {
    if (game.source !== "BGG" || game.bggId == null) return;
    setImportingBggId(game.bggId);
    setSnackMessage(null);
    try {
      const saved = await getByBggId(game.bggId);
      navigate(`/games/${saved.id}`);
    } catch {
      setSnackMessage("Could not import game from BoardGameGeek. Try again later.");
    } finally {
      setImportingBggId(null);
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

  const hasSearched = q.trim() !== "" && !loading;
  const isEmpty = hasSearched && games.length === 0 && users.length === 0;
  const isEmptyQuery = q.trim() === "";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
      <Typography variant="h2" component="h1" sx={{ mb: 2 }}>
        Search
      </Typography>
      {/* Stable search form: same position in tree so focus is preserved when q changes */}
      <Box
        component="form"
        onSubmit={handleSearch}
        sx={{ display: "flex", gap: 1, flexWrap: "wrap", width: "100%", maxWidth: 420, mb: 2 }}
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Content area: welcome when empty query, results when searched */}
      {isEmptyQuery ? (
        <Box
          sx={{
            flex: 1,
            minHeight: { xs: "40vh", md: "50vh" },
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            py: 4,
          }}
        >
          <Typography
            variant="h5"
            component="p"
            textAlign="center"
            color="text.secondary"
            sx={{ typography: { xs: "h6", md: "h5" } }}
          >
            {user
              ? `Welcome to BG Hub, ${user.username}`
              : "Welcome to BG Hub"}
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0, flex: 1 }}>
          {games.length > 0 && (
            <Box sx={{ mb: 2, flexShrink: 0, display: "flex", flexDirection: "column", minHeight: 0 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                Games
              </Typography>
              <Box
                sx={{
                  maxHeight: RESULTS_MAX_HEIGHT,
                  minHeight: 0,
                  overflowY: "auto",
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  bgcolor: "background.paper",
                }}
              >
                <List disablePadding>
                  {games.map((g) => {
                    const stableKey = g.id ?? `bgg-${g.bggId ?? 0}`;
                    const isLocal = g.source === "LOCAL" && g.id;
                    const ownedByUser = !!isLocal && ownedIds.includes(g.id!);
                    const wishedByUser = !!isLocal && wishlistIds.includes(g.id!);
                    const status: "none" | "owned" | "wishlist" = ownedByUser ? "owned" : wishedByUser ? "wishlist" : "none";

                    return (
                      <ListItem
                        key={stableKey}
                        disablePadding
                        sx={{
                          borderBottom: 1,
                          borderColor: "divider",
                          "&:last-of-type": { borderBottom: 0 },
                          py: 1,
                        }}
                      >
                        <Box sx={{ width: "100%", minWidth: 0 }}>
                          <GameCard
                            title={g.name}
                            year={g.year ?? undefined}
                            imageUrl={g.imageUrl ?? undefined}
                            status={isLocal ? status : "none"}
                            onAddOwned={user && isLocal && status === "none" ? () => addTo(g.id!, "owned") : undefined}
                            onAddWishlist={user && isLocal && status === "none" ? () => addTo(g.id!, "wishlist") : undefined}
                            onRemove={user && isLocal && status !== "none" ? () => removeFrom(g.id!, status) : undefined}
                            removing={isLocal ? acting[g.id!] === "removeOwned" || acting[g.id!] === "removeWishlist" : false}
                          />
                        </Box>
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
              {hasMoreGames && (
                <Box sx={{ mt: 1.5 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    size="medium"
                    disabled={loadingMore}
                    onClick={handleLoadMoreGames}
                  >
                    {loadingMore ? "Loading…" : "Load more"}
                  </Button>
                </Box>
              )}
            </Box>
          )}

          {users.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                Users
              </Typography>
              <Box
                sx={{
                  maxHeight: "40vh",
                  overflowY: "auto",
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 1,
                  bgcolor: "background.paper",
                }}
              >
                <List disablePadding>
                  {users.map((u) => (
                    <ListItem
                      key={u.id}
                      disablePadding
                      sx={{
                        borderBottom: 1,
                        borderColor: "divider",
                        "&:last-of-type": { borderBottom: 0 },
                      }}
                    >
                      <Box sx={{ width: "100%", p: 0.5 }}>
                        <UserCard
                          name={u.displayName || u.username}
                          handle={u.username}
                          avatarUrl={u.avatarUrl ?? undefined}
                          stats={{ owned: 0, wishlist: 0, plays: 0 }}
                          isFollowing={u.isFollowing}
                          followsYou={u.followsYou}
                          onFollow={() => handleFollowToggle(u)}
                        />
                      </Box>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          )}

          {isEmpty && !error && (
            <Typography color="text.secondary">
              No games or users found. Try another search.
            </Typography>
          )}
        </Box>
      )}

      <Snackbar
        open={!!snackMessage}
        autoHideDuration={6000}
        onClose={() => setSnackMessage(null)}
        message={snackMessage}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}
