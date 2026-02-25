import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Divider,
  Stack,
  Alert,
  SvgIcon,
  Link as MuiLink,
} from "@mui/material";

/** Google "G" logo icon for "Continue with Google" button. */
function GoogleLogoIcon() {
  return (
    <SvgIcon sx={{ fontSize: 22 }} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </SvgIcon>
  );
}

/** Apple logo icon for "Continue with Apple" button. */
function AppleLogoIcon() {
  return (
    <SvgIcon sx={{ fontSize: 22 }} viewBox="0 0 24 24">
      <path
        fill="currentColor"
        d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"
      />
    </SvgIcon>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/search");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          py: 3,
        }}
      >
        <Container maxWidth="sm">
          <Stack spacing={2} alignItems="center" sx={{ width: "100%", maxWidth: 420, mx: "auto" }}>
            <Typography variant="h4" component="h1" fontWeight={700} textAlign="center">
              Welcome to BG Hub
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              {/* Placeholder: replace with final tagline e.g. "Where the games come to play" */}
              Where the games come to play
            </Typography>

            <Paper
              elevation={0}
              variant="outlined"
              sx={{
                p: 3,
                width: "100%",
                maxWidth: 420,
                borderRadius: 2,
              }}
            >
              <Stack component="form" onSubmit={handleSubmit} spacing={2}>
                <Typography variant="h5" component="h2" fontWeight={600}>
                  Sign in
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Welcome back to BG Hub
                </Typography>

                <TextField
                  id="email"
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  fullWidth
                  size="small"
                />
                <TextField
                  id="password"
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  fullWidth
                  size="small"
                />

                {error && (
                  <Alert severity="error" onClose={() => setError("")}>
                    {error}
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={loading}
                  size="medium"
                >
                  {loading ? "Signing in…" : "Sign in"}
                </Button>

                <Typography variant="body2" color="text.secondary" textAlign="center">
                  No account? <Link to="/signup">Sign up</Link>
                </Typography>

                <Divider sx={{ my: 1 }}>or continue with</Divider>

                <Stack direction="column" spacing={1}>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="medium"
                    startIcon={<GoogleLogoIcon />}
                    sx={{ textTransform: "none" }}
                  >
                    Continue with Google
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="medium"
                    startIcon={<AppleLogoIcon />}
                    sx={{ textTransform: "none" }}
                  >
                    Continue with Apple
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </Box>

      <Box
        component="footer"
        sx={{ py: 2, display: "flex", justifyContent: "center" }}
      >
        <Typography variant="caption" color="text.secondary">
          <MuiLink
            component={Link}
            to="/contact"
            color="text.secondary"
            underline="hover"
          >
            Contact us
          </MuiLink>
        </Typography>
      </Box>
    </Box>
  );
}
