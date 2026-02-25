import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="layout">
      <nav className="nav">
        <Link to="/">BG Hub</Link>
        {user ? (
          <>
            <Link to="/search">Search</Link>
            <Link to="/me/owned">Owned</Link>
            <Link to="/me/wishlist">Wishlist</Link>
            <Link to="/me/plays">Plays</Link>
            <span className="nav-user">{user.username}</span>
            <button type="button" onClick={logout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Signup</Link>
          </>
        )}
      </nav>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
