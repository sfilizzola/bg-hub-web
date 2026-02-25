import { useState } from "react";
import { Link } from "react-router-dom";
import { search } from "../api/search";
import { addOwned, addWishlist, followUserById, unfollowUserById } from "../api/me";
import type { GameDto } from "../api/games";
import type { SearchUserDto } from "../api/search";

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
          {categories.map((c, i) => (
            <span key={`cat-${i}-${c}`} className="badge bg-secondary me-1 mb-1">
              {c}
            </span>
          ))}
          {mechanics.map((m, i) => (
            <span key={`mech-${i}-${m}`} className="badge bg-light text-dark me-1 mb-1">
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

function UserCard({
  user,
  acting,
  onFollowToggle,
}: Readonly<{
  user: SearchUserDto;
  acting: boolean;
  onFollowToggle: () => void;
}>) {
  const displayName = user.displayName ?? user.username;
  let followButtonText = "Follow";
  if (acting) followButtonText = "…";
  else if (user.isFollowing) followButtonText = "Unfollow";

  return (
    <div className="card h-100">
      <div className="card-body d-flex flex-column">
        <div className="d-flex align-items-center gap-2 mb-2">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="rounded-circle"
              width={40}
              height={40}
              style={{ objectFit: "cover" }}
            />
          ) : (
            <div
              className="rounded-circle bg-secondary d-flex align-items-center justify-content-center text-white"
              style={{ width: 40, height: 40, fontSize: "1rem" }}
              aria-hidden
            >
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-grow-1 min-width-0">
            <h5 className="card-title mb-0 text-truncate">{displayName}</h5>
            <p className="card-text text-body-secondary small mb-0">@{user.username}</p>
          </div>
        </div>
        {user.followsYou && (
          <span className="badge bg-light text-dark border mb-2 align-self-start">Follows you</span>
        )}
        <div className="mt-auto pt-2">
          <Link to={`/u/${user.username}`} className="btn btn-outline-secondary btn-sm me-1">
            Profile
          </Link>
          <button
            type="button"
            className={user.isFollowing ? "btn btn-outline-secondary btn-sm" : "btn btn-primary btn-sm"}
            disabled={acting}
            onClick={onFollowToggle}
          >
            {followButtonText}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SearchPage() {
  const [q, setQ] = useState("");
  const [games, setGames] = useState<GameDto[]>([]);
  const [users, setUsers] = useState<SearchUserDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [acting, setActing] = useState<Record<string, string>>({});
  const [actingFollow, setActingFollow] = useState<Record<string, boolean>>({});

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
      if (key === "owned") await addOwned(gameId);
      else await addWishlist(gameId);
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
            placeholder="Games and users…"
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

      {games.length > 0 && (
        <>
          <h2 className="h6 text-body-secondary mb-2">Games</h2>
          <div className="row g-3 mb-4">
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
        </>
      )}

      {users.length > 0 && (
        <>
          <h2 className="h6 text-body-secondary mb-2">Users</h2>
          <div className="row g-3 mb-4">
            {users.map((u) => (
              <div key={u.id} className="col-12 col-md-6 col-lg-4">
                <UserCard
                  user={u}
                  acting={!!actingFollow[u.id]}
                  onFollowToggle={() => handleFollowToggle(u)}
                />
              </div>
            ))}
          </div>
        </>
      )}

      {isEmpty && !error && (
        <p className="text-muted">No games or users found. Try another search.</p>
      )}
    </div>
  );
}
