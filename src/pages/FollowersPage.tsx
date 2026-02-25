import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFollowers } from "../api/me";
import type { FollowUser } from "../api/me";

export function FollowersPage() {
  const [users, setUsers] = useState<FollowUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getFollowers()
      .then((res) => {
        setUsers(res.users);
        setError("");
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load")
      )
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="d-flex align-items-center gap-2">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
        <span>Loading followers…</span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="h3 mb-3">Followers</h1>
      {error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}
      {!error && users.length === 0 && (
        <div className="alert alert-secondary" role="alert">
          You have no followers yet.
        </div>
      )}
      {!error && users.length > 0 && (
        <ul className="list-group">
          {users.map((u) => (
            <li key={u.id} className="list-group-item">
              <Link to={`/u/${u.username}`} className="fw-semibold text-decoration-none">
                {u.username}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
