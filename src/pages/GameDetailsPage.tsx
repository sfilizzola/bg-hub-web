import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getGame } from "../api/games";
import { addOwned, addWishlist } from "../api/me";
import type { GameDto } from "../api/games";

export function GameDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<GameDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [acting, setActing] = useState<string | null>(null);

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
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  async function addTo(key: "owned" | "wishlist") {
    if (!game || acting) return;
    setActing(key);
    try {
      if (key === "owned") await addOwned(game.id);
      else await addWishlist(game.id);
    } catch {
      // Ignore add owned/wishlist errors
    } finally {
      setActing(null);
    }
  }

  if (loading) {
    return (
      <div className="d-flex align-items-center gap-2">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
        <span>Loading game…</span>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="alert alert-danger" role="alert">
        {error || "Game not found."}
        <div className="mt-2">
          <Link to="/search" className="btn btn-outline-danger btn-sm">
            Back to Search
          </Link>
        </div>
      </div>
    );
  }

  const meta: string[] = [];
  if (game.year != null) meta.push(String(game.year));
  if (game.minPlayers != null && game.maxPlayers != null) {
    meta.push(`${game.minPlayers}-${game.maxPlayers} players`);
  } else if (game.minPlayers != null) meta.push(`${game.minPlayers}+ players`);
  else if (game.maxPlayers != null) meta.push(`up to ${game.maxPlayers} players`);
  if (game.playTime != null) meta.push(`${game.playTime} min`);
  if (game.complexityWeight != null) meta.push(`Complexity: ${game.complexityWeight.toFixed(1)}`);

  return (
    <div>
      <nav className="mb-3">
        <Link to="/search" className="text-secondary small">
          ← Back to Search
        </Link>
      </nav>
      <h2 className="h3 mb-3">{game.name}</h2>
      {game.imageUrl && (
        <div className="mb-3">
          <img
            src={game.imageUrl}
            alt={game.name}
            className="img-fluid rounded"
            style={{ maxHeight: 300, objectFit: "contain" }}
          />
        </div>
      )}
      {meta.length > 0 && (
        <p className="text-body-secondary small mb-2">{meta.join(" · ")}</p>
      )}
      <div className="mb-3">
        {(game.categories ?? []).map((c, i) => (
            <span key={`cat-${i}-${c}`} className="badge bg-secondary me-1 mb-1">
              {c}
            </span>
          ))}
        {(game.mechanics ?? []).map((m, i) => (
            <span key={`mech-${i}-${m}`} className="badge bg-light text-dark me-1 mb-1">
              {m}
            </span>
          ))}
      </div>
      {game.description && (
        <div
          className="mb-4 p-3 bg-light rounded"
          style={{ whiteSpace: "pre-wrap", maxWidth: "60ch" }}
        >
          {game.description}
        </div>
      )}
      <div className="d-flex gap-2">
        <button
          type="button"
          className="btn btn-primary btn-sm"
          disabled={!!acting}
          onClick={() => addTo("owned")}
        >
          {acting === "owned" ? "…" : "Add to Owned"}
        </button>
        <button
          type="button"
          className="btn btn-outline-primary btn-sm"
          disabled={!!acting}
          onClick={() => addTo("wishlist")}
        >
          {acting === "wishlist" ? "…" : "Add to Wishlist"}
        </button>
      </div>
    </div>
  );
}
