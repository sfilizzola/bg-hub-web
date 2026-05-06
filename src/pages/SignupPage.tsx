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
  Link as MuiLink,
} from "@mui/material";

export function SignupPage() {
  const { signup, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(email, username, password);
      await login(email, password);
      navigate("/search");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Signup failed");
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
                  Create account
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Join BG Hub to track and share your games
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
                  id="username"
                  label="Username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  fullWidth
                  size="small"
                  helperText="Letters, numbers, and underscores only"
                />
                <TextField
                  id="password"
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  fullWidth
                  size="small"
                  helperText="At least 8 characters"
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
                  {loading ? "Creating account…" : "Sign up"}
                </Button>

                <Typography variant="body2" color="text.secondary" textAlign="center">
                  Already have an account?{" "}
                  <MuiLink component={Link} to="/login" underline="hover">
                    Sign in
                  </MuiLink>
                </Typography>
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
