import { Navigate, Route, BrowserRouter, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { LoginPage } from "./pages/LoginPage";
import { SignupPage } from "./pages/SignupPage";
import { SearchPage } from "./pages/SearchPage";
import { OwnedPage } from "./pages/OwnedPage";
import { WishlistPage } from "./pages/WishlistPage";
import { PlaysPage } from "./pages/PlaysPage";
import { GameDetailsPage } from "./pages/GameDetailsPage";
import { PublicProfilePage } from "./pages/PublicProfilePage";
import { FollowingPage } from "./pages/FollowingPage";
import { FollowersPage } from "./pages/FollowersPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/search" replace />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="u/:username" element={<PublicProfilePage />} />
            <Route
              path="search"
              element={
                <ProtectedRoute>
                  <SearchPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="games/:id"
              element={
                <ProtectedRoute>
                  <GameDetailsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="me/owned"
              element={
                <ProtectedRoute>
                  <OwnedPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="me/wishlist"
              element={
                <ProtectedRoute>
                  <WishlistPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="me/plays"
              element={
                <ProtectedRoute>
                  <PlaysPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="me/following"
              element={
                <ProtectedRoute>
                  <FollowingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="me/followers"
              element={
                <ProtectedRoute>
                  <FollowersPage />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
