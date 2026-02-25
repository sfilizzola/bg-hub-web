import { useState } from "react";
import { searchGames } from "../api/games";
import { addOwned, addWishlist } from "../api/me";
import type { GameDto } from "../api/games";

export function SearchPage() {
  const [q, setQ] = useState("");
  const [games, setGames] = useState<GameDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [acting, setActing] = useState<Record<string, string>>({});

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await searchGames(q);
      setGames(res.games);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
      setGames([]);
    } finally {
      setLoading(false);
    }
  }

  async function addTo(gameId: string, key: "owned" | "wishlist") {
    if (acting[gameId]) return;
    setActing((a) => ({ ...a, [gameId]: key }));
    try {
      if (key === "owned") await addOwned(gameId);
      else await addWishlist(gameId);
    } catch {
      // show or ignore
    } finally {
      setActing((a) => {
        const next = { ...a };
        delete next[gameId];
        return next;
      });
    }
  }

  return (
    <div>
      <h1>Search games</h1>
      <form onSubmit={handleSearch}>
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Game name…"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching…" : "Search"}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {games.map((g) => (
          <li key={g.id} style={{ marginBottom: "0.5rem" }}>
            <strong>{g.name}</strong>
            {g.year != null && ` (${g.year})`}
            <div style={{ marginTop: "0.25rem" }}>
              <button
                type="button"
                disabled={!!acting[g.id]}
                onClick={() => addTo(g.id, "owned")}
              >
                {acting[g.id] === "owned" ? "…" : "Add to Owned"}
              </button>
              <button
                type="button"
                disabled={!!acting[g.id]}
                onClick={() => addTo(g.id, "wishlist")}
              >
                {acting[g.id] === "wishlist" ? "…" : "Add to Wishlist"}
              </button>
            </div>
          </li>
        ))}
      </ul>
      {games.length === 0 && !loading && q && !error && (
        <p>No games found. Try another search.</p>
      )}
    </div>
  );
}
