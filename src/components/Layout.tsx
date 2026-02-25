import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

export function Layout() {
  const { user, logout } = useAuth();
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/search">
            BG Hub
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            {user ? (
              <>
                <ul className="navbar-nav me-auto">
                  <li className="nav-item">
                    <Link className="nav-link" to="/search">
                      Search
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/me/owned">
                      Owned
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/me/wishlist">
                      Wishlist
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/me/plays">
                      Plays
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/me/following">
                      Following
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/me/followers">
                      Followers
                    </Link>
                  </li>
                </ul>
                <ul className="navbar-nav">
                  <li className="nav-item">
                    <span className="navbar-text me-2">{user.username}</span>
                  </li>
                  <li className="nav-item">
                    <button
                      type="button"
                      className="btn btn-outline-light btn-sm"
                      onClick={logout}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              </>
            ) : (
              <ul className="navbar-nav ms-auto">
                <li className="nav-item">
                  <Link className="nav-link" to="/login">
                    Login
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/signup">
                    Signup
                  </Link>
                </li>
              </ul>
            )}
          </div>
        </div>
      </nav>
      <div className="container mt-4">
        <Outlet />
      </div>
    </>
  );
}
