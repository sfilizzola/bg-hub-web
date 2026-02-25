import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getWishlist, removeWishlist } from "../api/me";
import type { GameDto } from "../api/games";

function gameMeta(g: GameDto): string {
  const parts: string[] = [];
  if (g.year != null) parts.push(String(g.year));
  if (g.minPlayers != null && g.maxPlayers != null) {
    parts.push(`${g.minPlayers}-${g.maxPlayers} players`);
  } else if (g.minPlayers != null) parts.push(`${g.minPlayers}+ players`);
  else if (g.maxPlayers != null) parts.push(`up to ${g.maxPlayers} players`);
  if (g.playTime != null) parts.push(`${g.playTime} min`);
  return parts.join(" · ");
}

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
      <div className="d-flex align-items-center gap-2">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
        <span>Loading wishlist…</span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="h3 mb-3">Wishlist</h1>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {games.length === 0 && !error ? (
        <div className="alert alert-secondary" role="alert">
          <p className="mb-2">No wishlist games yet.</p>
          <Link to="/search" className="btn btn-secondary btn-sm">
            Search games
          </Link>
        </div>
      ) : (
        <ul className="list-group">
          {games.map((g) => (
            <li
              key={g.id}
              className="list-group-item d-flex justify-content-between align-items-start"
            >
              <div>
                <Link to={`/games/${g.id}`} className="fw-semibold text-decoration-none">
                  {g.name}
                </Link>
                {gameMeta(g) && (
                  <small className="text-body-secondary d-block">
                    {gameMeta(g)}
                  </small>
                )}
              </div>
              <div className="d-flex align-items-center gap-1">
                <Link to={`/games/${g.id}`} className="btn btn-outline-secondary btn-sm">
                  Details
                </Link>
                <button
                type="button"
                className="btn btn-outline-danger btn-sm"
                disabled={removing === g.id}
                onClick={() => handleRemove(g.id)}
              >
                {removing === g.id ? "…" : "Remove"}
              </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
