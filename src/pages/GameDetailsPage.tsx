import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getGame } from "../api/games";
import {
  addOwned,
  addWishlist,
  getOwned,
  getWishlist,
  removeOwned,
  removeWishlist,
} from "../api/me";
import type { GameDto } from "../api/games";
import { useAuth } from "../contexts/useAuth";
import CheckCircle from "@mui/icons-material/CheckCircle";
import {
  Box,
  Container,
  Grid,
  Stack,
  Paper,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
  Chip,
  Button,
  Alert,
  Skeleton,
  Card,
  CardMedia,
  Tabs,
  Tab,
  Divider,
  TextField,
} from "@mui/material";

function buildMeta(game: GameDto): string[] {
  const meta: string[] = [];
  if (game.year != null) meta.push(String(game.year));
  if (game.minPlayers != null && game.maxPlayers != null) {
    meta.push(`${game.minPlayers}-${game.maxPlayers} players`);
  } else if (game.minPlayers != null) meta.push(`${game.minPlayers}+ players`);
  else if (game.maxPlayers != null) meta.push(`up to ${game.maxPlayers} players`);
  if (game.playTime != null) meta.push(`${game.playTime} min`);
  if (game.complexityWeight != null)
    meta.push(`Complexity: ${game.complexityWeight.toFixed(1)}`);
  return meta;
}

type TabPanelProps = Readonly<{
  value: number;
  index: number;
  children: React.ReactNode;
}>;

function TabPanel({ value, index, children }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 2 }}>{children}</Box>}
    </div>
  );
}

type GameDetailsActionsProps = Readonly<{
  inCollection: boolean;
  inWishlist: boolean;
  user: unknown;
  acting: string | null;
  onAddOwned: () => void;
  onAddWishlist: () => void;
  onRemoveOwned: () => void;
  onRemoveWishlist: () => void;
}>;

function GameDetailsActions({
  inCollection,
  inWishlist,
  user,
  acting,
  onAddOwned,
  onAddWishlist,
  onRemoveOwned,
  onRemoveWishlist,
}: GameDetailsActionsProps) {
  if (inCollection) {
    return (
      <>
        <Button size="small" variant="contained" disabled startIcon={<CheckCircle />}>
          In collection
        </Button>
        <Button size="small" color="error" variant="outlined" disabled={!!acting} onClick={onRemoveOwned}>
          {acting === "removeOwned" ? "…" : "Remove from collection"}
        </Button>
      </>
    );
  }
  if (inWishlist) {
    return (
      <>
        <Button size="small" variant="outlined" disabled startIcon={<CheckCircle />}>
          In wanted
        </Button>
        <Button size="small" variant="contained" disabled={!!acting} onClick={onAddOwned}>
          {acting === "owned" ? "…" : "Add to collection"}
        </Button>
        <Button size="small" color="error" variant="outlined" disabled={!!acting} onClick={onRemoveWishlist}>
          {acting === "removeWishlist" ? "…" : "Remove from wanted"}
        </Button>
      </>
    );
  }
  if (!user) return null;
  return (
    <>
      <Button size="small" variant="contained" disabled={!!acting} onClick={onAddOwned}>
        {acting === "owned" ? "…" : "Add to collection"}
      </Button>
      <Button size="small" variant="outlined" disabled={!!acting} onClick={onAddWishlist}>
        {acting === "wishlist" ? "…" : "Add to wanted"}
      </Button>
    </>
  );
}

export function GameDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [game, setGame] = useState<GameDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acting, setActing] = useState<string | null>(null);
  const [tab, setTab] = useState(0);
  const [notes, setNotes] = useState("");
  const [ownedIds, setOwnedIds] = useState<string[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    getGame(id)
      .then((gameData) => {
        setGame(gameData);
        setError("");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load")
      )
      .finally(() => setLoading(false));
  }, [id]);

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

  const inCollection = game ? ownedIds.includes(game.id) : false;
  const inWishlist = game ? wishlistIds.includes(game.id) : false;

  async function addTo(key: "owned" | "wishlist") {
    if (!game || acting) return;
    setActing(key);
    try {
      if (key === "owned") {
        await addOwned(game.id);
        setOwnedIds((prev) => (prev.includes(game.id) ? prev : [...prev, game.id]));
      } else {
        await addWishlist(game.id);
        setWishlistIds((prev) => (prev.includes(game.id) ? prev : [...prev, game.id]));
      }
    } catch {
      // Ignore add owned/wishlist errors
    } finally {
      setActing(null);
    }
  }

  async function removeFrom(key: "owned" | "wishlist") {
    if (!game || acting) return;
    const actingKey = key === "owned" ? "removeOwned" : "removeWishlist";
    setActing(actingKey);
    try {
      if (key === "owned") {
        await removeOwned(game.id);
        setOwnedIds((prev) => prev.filter((id) => id !== game.id));
      } else {
        await removeWishlist(game.id);
        setWishlistIds((prev) => prev.filter((id) => id !== game.id));
      }
    } catch {
      // Ignore
    } finally {
      setActing(null);
    }
  }

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ mb: 2 }}>
          <MuiLink component={Link} to="/search" underline="hover" color="inherit">
            Search
          </MuiLink>
          <Typography color="text.primary">…</Typography>
        </Breadcrumbs>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rounded" height={280} />
            <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
              <Skeleton variant="rounded" width={80} height={24} />
              <Skeleton variant="rounded" width={100} height={24} />
              <Skeleton variant="rounded" width={60} height={24} />
            </Stack>
          </Grid>
          <Grid item xs={12} md={8}>
            <Skeleton variant="text" width="70%" height={48} />
            <Skeleton variant="text" width="50%" height={24} sx={{ mt: 1 }} />
            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Skeleton variant="rounded" width={120} height={36} />
              <Skeleton variant="rounded" width={120} height={36} />
            </Stack>
          </Grid>
        </Grid>
      </Container>
    );
  }

  if (error || !game) {
    return (
      <Container maxWidth="lg">
        <Alert
          severity="error"
          action={
            <Button
              component={Link}
              to="/search"
              color="inherit"
              size="small"
              variant="outlined"
            >
              Back to Search
            </Button>
          }
        >
          {error || "Game not found."}
        </Alert>
      </Container>
    );
  }

  const meta = buildMeta(game);
  const categories = game.categories ?? [];
  const mechanics = game.mechanics ?? [];

  return (
    <Container maxWidth="lg">
      <Breadcrumbs sx={{ mb: 2 }}>
        <MuiLink component={Link} to="/search" underline="hover" color="inherit">
          Search
        </MuiLink>
        <Typography color="text.primary" noWrap sx={{ maxWidth: 200 }}>
          {game.name}
        </Typography>
      </Breadcrumbs>

      <Grid container spacing={3}>
        {/* Left: image + quick facts */}
        <Grid item xs={12} md={4}>
          <Stack spacing={2}>
            {game.imageUrl ? (
              <Card variant="outlined" sx={{ overflow: "hidden" }}>
                <CardMedia
                  component="img"
                  image={game.imageUrl}
                  alt={game.name}
                  sx={{
                    maxHeight: 280,
                    objectFit: "contain",
                    bgcolor: "action.hover",
                  }}
                />
              </Card>
            ) : (
              <Paper
                variant="outlined"
                sx={{
                  height: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "action.hover",
                }}
              >
                <Typography color="text.secondary">No image</Typography>
              </Paper>
            )}
            {meta.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                {meta.join(" · ")}
              </Typography>
            )}
            <Stack direction="row" flexWrap="wrap" gap={0.5} useFlexGap>
              {categories.map((c, i) => (
                <Chip key={`cat-${i}-${c}`} label={c} size="small" variant="outlined" />
              ))}
              {mechanics.map((m, i) => (
                <Chip key={`mech-${i}-${m}`} label={m} size="small" variant="outlined" />
              ))}
            </Stack>
          </Stack>
        </Grid>

        {/* Right: title, actions, tabs */}
        <Grid item xs={12} md={8}>
          <Typography variant="h2" component="h1" fontWeight={600} sx={{ mb: 1 }}>
            {game.name}
          </Typography>

          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
            <GameDetailsActions
              inCollection={inCollection}
              inWishlist={inWishlist}
              user={user}
              acting={acting}
              onAddOwned={() => addTo("owned")}
              onAddWishlist={() => addTo("wishlist")}
              onRemoveOwned={() => removeFrom("owned")}
              onRemoveWishlist={() => removeFrom("wishlist")}
            />
            <Button component={Link} to="/me/plays" variant="outlined" size="small">
              Log Play
            </Button>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
              <Tab label="Details" />
              <Tab label="Expansions" />
              <Tab label="Plays" />
              <Tab label="Notes" />
            </Tabs>
          </Box>

          <TabPanel value={tab} index={0}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Description
            </Typography>
            {game.description ? (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  whiteSpace: "pre-wrap",
                  maxWidth: "60ch",
                  bgcolor: "action.hover",
                }}
              >
                <Typography variant="body2" component="pre" sx={{ fontFamily: "inherit" }}>
                  {game.description}
                </Typography>
              </Paper>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No description available.
              </Typography>
            )}
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <Typography variant="body2" color="text.secondary">
              No expansions data in MVP.
            </Typography>
          </TabPanel>

          <TabPanel value={tab} index={2}>
            <Typography variant="body2" color="text.secondary">
              View and log plays from{" "}
              <MuiLink component={Link} to="/me/plays">
                Plays
              </MuiLink>
              .
            </Typography>
          </TabPanel>

          <TabPanel value={tab} index={3}>
            <TextField
              label="Notes"
              placeholder="Your notes about this game…"
              multiline
              minRows={3}
              fullWidth
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              variant="outlined"
              size="small"
            />
          </TabPanel>
        </Grid>
      </Grid>
    </Container>
  );
}
