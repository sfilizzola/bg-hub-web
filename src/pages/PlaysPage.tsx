import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { createPlay, deletePlay, getPlays } from "../api/me";
import type { PlayLogDto } from "../api/me";
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Alert,
  Card,
  CardContent,
  CardActions,
  Divider,
  Stack,
  Link,
  CircularProgress,
} from "@mui/material";
import { tokens } from "@/theme";

export function PlaysPage() {
  const [plays, setPlays] = useState<PlayLogDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [gameId, setGameId] = useState("");
  const [playedAt, setPlayedAt] = useState(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  });
  const [durationMinutes, setDurationMinutes] = useState("");
  const [playersCount, setPlayersCount] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await getPlays();
      setPlays(res.plays);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!gameId.trim()) return;
    setSubmitting(true);
    setError("");
    try {
      await createPlay({
        gameId: gameId.trim(),
        playedAt: new Date(playedAt).toISOString(),
        durationMinutes: durationMinutes ? Number.parseInt(durationMinutes, 10) : undefined,
        playersCount: playersCount ? Number.parseInt(playersCount, 10) : undefined,
        notes: notes.trim() || undefined,
      });
      setShowForm(false);
      setGameId("");
      setNotes("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create play");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (deletingId) return;
    setDeletingId(id);
    try {
      await deletePlay(id);
      setPlays((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* Header */}
        <Box>
          <Typography variant="h1" sx={{ mb: 1 }}>
            My Plays
          </Typography>
          <Typography variant="body1" color="text.secondary">
            <Link component={RouterLink} to="/search" underline="hover">
              Search games
            </Link>
            {" "}to find a game ID, then log a play below.
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Create Play Form */}
        {showForm ? (
          <Card>
            <CardContent>
              <Stack component="form" onSubmit={handleSubmit} spacing={2}>
                <Typography variant="h3">Log a play</Typography>

                <TextField
                  id="gameId"
                  label="Game ID (from search)"
                  type="text"
                  value={gameId}
                  onChange={(e) => setGameId(e.target.value)}
                  placeholder="uuid"
                  required
                  fullWidth
                  size="small"
                />

                <TextField
                  id="playedAt"
                  label="Played at"
                  type="datetime-local"
                  value={playedAt}
                  onChange={(e) => setPlayedAt(e.target.value)}
                  required
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  id="duration"
                  label="Duration (minutes)"
                  type="number"
                  inputProps={{ min: 1 }}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  fullWidth
                  size="small"
                />

                <TextField
                  id="players"
                  label="Players count"
                  type="number"
                  inputProps={{ min: 1 }}
                  value={playersCount}
                  onChange={(e) => setPlayersCount(e.target.value)}
                  fullWidth
                  size="small"
                />

                <TextField
                  id="notes"
                  label="Notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  multiline
                  rows={3}
                  fullWidth
                  size="small"
                />

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    type="button"
                    variant="text"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={submitting}
                  >
                    {submitting ? "Saving…" : "Save play"}
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ) : (
          <Button
            variant="contained"
            onClick={() => setShowForm(true)}
          >
            Log a play
          </Button>
        )}

        {/* Plays List */}
        {plays.length > 0 ? (
          <Stack spacing={2}>
            {plays.map((p) => (
              <Card key={p.id}>
                <CardContent>
                  <Typography variant="h3" sx={{ mb: 1 }}>
                    {p.game.name}
                    {p.game.year != null && ` (${p.game.year})`}
                  </Typography>

                  <Typography variant="caption" color="text.secondary">
                    {new Date(p.playedAt).toLocaleString()}
                    {p.durationMinutes != null && ` · ${p.durationMinutes} min`}
                    {p.playersCount != null && ` · ${p.playersCount} players`}
                  </Typography>

                  {p.notes && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {p.notes}
                    </Typography>
                  )}
                </CardContent>

                <Divider />

                <CardActions>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleDelete(p.id)}
                    disabled={deletingId === p.id}
                  >
                    {deletingId === p.id ? (
                      <CircularProgress size={16} />
                    ) : (
                      "Delete"
                    )}
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Stack>
        ) : (
          !error && (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No plays yet. {!showForm && "Log your first play above."}
              </Typography>
            </Box>
          )
        )}
      </Stack>
    </Container>
  );
}
