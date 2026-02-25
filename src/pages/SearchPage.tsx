import { useState } from "react";
import { Link } from "react-router-dom";
import { searchGames } from "../api/games";
import { addOwned, addWishlist } from "../api/me";
import type { GameDto } from "../api/games";

function GameCard({
  game,
  acting,
  onAddOwned,
  onAddWishlist,
}: Readonly<{
  game: GameDto;
  acting: string | undefined;
  onAddOwned: () => void;
  onAddWishlist: () => void;
}>) {
  const categories = (game.categories ?? []).slice(0, 4);
  const mechanics = (game.mechanics ?? []).slice(0, 4);
  const meta: string[] = [];
  if (game.year != null) meta.push(String(game.year));
  if (game.minPlayers != null && game.maxPlayers != null) {
    meta.push(`${game.minPlayers}-${game.maxPlayers} players`);
  } else if (game.minPlayers != null) meta.push(`${game.minPlayers}+ players`);
  else if (game.maxPlayers != null) meta.push(`up to ${game.maxPlayers} players`);
  if (game.playTime != null) meta.push(`${game.playTime} min`);

  return (
    <div className="card h-100">
      <div className="card-body d-flex flex-column">
        <h5 className="card-title">
          <Link to={`/games/${game.id}`} className="text-decoration-none text-dark">
            {game.name}
          </Link>
        </h5>
        {meta.length > 0 && (
          <p className="card-text text-body-secondary small mb-2">
            {meta.join(" · ")}
          </p>
        )}
        <div className="mb-2">
          {categories.map((c) => (
            <span key={c} className="badge bg-secondary me-1 mb-1">
              {c}
            </span>
          ))}
          {mechanics.map((m) => (
            <span key={m} className="badge bg-light text-dark me-1 mb-1">
              {m}
            </span>
          ))}
        </div>
        <div className="mt-auto pt-2 d-flex flex-wrap gap-1">
          <Link to={`/games/${game.id}`} className="btn btn-outline-secondary btn-sm">
            Details
          </Link>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            disabled={!!acting}
            onClick={onAddOwned}
          >
            {acting === "owned" ? "…" : "Add to Owned"}
          </button>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            disabled={!!acting}
            onClick={onAddWishlist}
          >
            {acting === "wishlist" ? "…" : "Add to Wishlist"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SearchPage() {
  const [q, setQ] = useState("");
  const [games, setGames] = useState<GameDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [acting, setActing] = useState<Record<string, string>>({});

  async function handleSearch(e: React.FormEvent<HTMLFormElement>) {
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
      <h1 className="h3 mb-3">Search</h1>
      <form onSubmit={handleSearch} className="mb-4">
        <div className="input-group">
          <input
            type="search"
            className="form-control"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Game name…"
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? "Searching…" : "Search"}
          </button>
        </div>
      </form>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      <div className="row g-3">
        {games.map((g) => (
          <div key={g.id} className="col-12 col-md-6 col-lg-4">
            <GameCard
              game={g}
              acting={acting[g.id]}
              onAddOwned={() => addTo(g.id, "owned")}
              onAddWishlist={() => addTo(g.id, "wishlist")}
            />
          </div>
        ))}
      </div>
      {games.length === 0 && !loading && q && !error && (
        <p className="text-muted">No games found. Try another search.</p>
      )}
    </div>
  );
}
