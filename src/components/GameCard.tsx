import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
} from "@mui/material";
import type { GameDto } from "../api/games";

function gameMeta(g: GameDto): string[] {
  const meta: string[] = [];
  if (g.year != null) meta.push(String(g.year));
  if (g.minPlayers != null && g.maxPlayers != null) {
    meta.push(`${g.minPlayers}-${g.maxPlayers} players`);
  } else if (g.minPlayers != null) meta.push(`${g.minPlayers}+ players`);
  else if (g.maxPlayers != null) meta.push(`up to ${g.maxPlayers} players`);
  if (g.playTime != null) meta.push(`${g.playTime} min`);
  return meta;
}

export type GameCardProps = {
  game: GameDto;
  /** Search variant: show Add to Owned / Add to Wishlist */
  variant?: "search" | "list";
  acting?: string;
  onAddOwned?: () => void;
  onAddWishlist?: () => void;
  removing?: boolean;
  onRemove?: () => void;
};

export function GameCard({
  game,
  variant = "list",
  acting,
  onAddOwned,
  onAddWishlist,
  removing,
  onRemove,
}: Readonly<GameCardProps>) {
  const meta = gameMeta(game);
  const categories = (game.categories ?? []).slice(0, 4);
  const mechanics = (game.mechanics ?? []).slice(0, 4);

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
        <Typography
          component={Link}
          to={`/games/${game.id}`}
          variant="h6"
          sx={{
            fontWeight: 600,
            textDecoration: "none",
            color: "text.primary",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          {game.name}
        </Typography>
        {meta.length > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1 }}>
            {meta.join(" · ")}
          </Typography>
        )}
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1 }}>
          {categories.map((c, i) => (
            <Chip key={`cat-${i}-${c}`} label={c} size="small" color="secondary" />
          ))}
          {mechanics.map((m, i) => (
            <Chip
              key={`mech-${i}-${m}`}
              label={m}
              size="small"
              variant="outlined"
            />
          ))}
        </Box>
      </CardContent>
      <CardActions sx={{ flexWrap: "wrap", gap: 0.5, px: 2, pb: 2, pt: 0 }}>
        <Button component={Link} to={`/games/${game.id}`} size="small" variant="outlined">
          Details
        </Button>
        {variant === "search" && onAddOwned && (
          <Button
            size="small"
            variant="contained"
            disabled={!!acting}
            onClick={onAddOwned}
          >
            {acting === "owned" ? "…" : "Add to Owned"}
          </Button>
        )}
        {variant === "search" && onAddWishlist && (
          <Button
            size="small"
            variant="outlined"
            disabled={!!acting}
            onClick={onAddWishlist}
          >
            {acting === "wishlist" ? "…" : "Add to Wishlist"}
          </Button>
        )}
        {variant === "list" && onRemove && (
          <Button
            size="small"
            color="error"
            variant="outlined"
            disabled={!!removing}
            onClick={onRemove}
          >
            {removing ? "…" : "Remove"}
          </Button>
        )}
      </CardActions>
    </Card>
  );
}
