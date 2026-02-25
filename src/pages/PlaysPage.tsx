import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createPlay, deletePlay, getPlays } from "../api/me";
import type { PlayLogDto } from "../api/me";

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

  if (loading) return <p className="loading">Loading plays…</p>;
  return (
    <div>
      <h1>My Plays</h1>
      <p>
        <Link to="/search">Search games</Link> to find a game ID, then log a play below.
      </p>
      {error && <p className="error">{error}</p>}

      {showForm ? (
        <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
          <div>
            <label htmlFor="gameId">Game ID (from search)</label>
            <input
              id="gameId"
              type="text"
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              placeholder="uuid"
              required
            />
          </div>
          <div>
            <label htmlFor="playedAt">Played at</label>
            <input
              id="playedAt"
              type="datetime-local"
              value={playedAt}
              onChange={(e) => setPlayedAt(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="duration">Duration (minutes)</label>
            <input
              id="duration"
              type="number"
              min={1}
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="players">Players count</label>
            <input
              id="players"
              type="number"
              min={1}
              value={playersCount}
              onChange={(e) => setPlayersCount(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          <button type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Save play"}
          </button>
          <button type="button" onClick={() => setShowForm(false)}>
            Cancel
          </button>
        </form>
      ) : (
        <button type="button" onClick={() => setShowForm(true)}>
          Log a play
        </button>
      )}

      <ul style={{ listStyle: "none", padding: 0 }}>
        {plays.map((p) => (
          <li key={p.id} style={{ marginBottom: "0.75rem" }}>
            <strong>{p.game.name}</strong>
            {p.game.year != null && ` (${p.game.year})`}
            <br />
            <small>
              {new Date(p.playedAt).toLocaleString()}
              {p.durationMinutes != null && ` · ${p.durationMinutes} min`}
              {p.playersCount != null && ` · ${p.playersCount} players`}
            </small>
            {p.notes && <p style={{ margin: "0.25rem 0 0", fontSize: "0.9rem" }}>{p.notes}</p>}
            <button
              type="button"
              disabled={deletingId === p.id}
              onClick={() => handleDelete(p.id)}
              style={{ marginTop: "0.25rem" }}
            >
              {deletingId === p.id ? "…" : "Delete"}
            </button>
          </li>
        ))}
      </ul>
      {plays.length === 0 && !error && showForm === false && <p>No plays yet.</p>}
    </div>
  );
}
