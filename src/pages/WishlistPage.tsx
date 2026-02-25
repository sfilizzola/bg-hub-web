import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getWishlist, removeWishlist } from "../api/me";
import type { GameDto } from "../api/games";

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

  if (loading) return <p className="loading">Loading wishlist…</p>;
  return (
    <div>
      <h1>My Wishlist</h1>
      <p>
        <Link to="/search">Search games</Link> to add more.
      </p>
      {error && <p className="error">{error}</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {games.map((g) => (
          <li key={g.id} style={{ marginBottom: "0.5rem" }}>
            <strong>{g.name}</strong>
            {g.year != null && ` (${g.year})`}
            <button
              type="button"
              disabled={removing === g.id}
              onClick={() => handleRemove(g.id)}
              style={{ marginLeft: "0.5rem" }}
            >
              {removing === g.id ? "…" : "Remove"}
            </button>
          </li>
        ))}
      </ul>
      {games.length === 0 && !error && <p>No wishlist games yet.</p>}
    </div>
  );
}
