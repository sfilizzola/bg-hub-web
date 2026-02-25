import { Link } from "react-router-dom";
import CheckCircle from "@mui/icons-material/CheckCircle";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Skeleton,
  Stack,
} from "@mui/material";
import type { GameDto } from "../api/games";

const THUMB_SIZE = 48;
const DESC_MAX_LEN = 80;
const CARD_HEIGHT = 260;

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

function clampDescription(description: string | null | undefined, maxLen: number): string | null {
  const t = description?.trim();
  if (!t) return null;
  return t.length > maxLen ? `${t.slice(0, maxLen).trim()}…` : t;
}

type SearchActionsProps = {
  inCollection: boolean;
  inWishlist: boolean;
  acting?: string;
  onAddOwned?: () => void;
  onAddWishlist?: () => void;
  onRemoveOwned?: () => void;
  onRemoveWishlist?: () => void;
};

function SearchGameCardActions({
  inCollection,
  inWishlist,
  acting,
  onAddOwned,
  onAddWishlist,
  onRemoveOwned,
  onRemoveWishlist,
}: Readonly<SearchActionsProps>) {
  if (inCollection) {
    return (
      <>
        <Button size="small" variant="contained" disabled startIcon={<CheckCircle />}>
          In collection
        </Button>
        {onRemoveOwned && (
          <Button size="small" color="error" variant="outlined" disabled={!!acting} onClick={onRemoveOwned}>
            {acting === "removeOwned" ? "…" : "Remove from collection"}
          </Button>
        )}
      </>
    );
  }
  if (inWishlist) {
    return (
      <>
        <Button size="small" variant="outlined" disabled startIcon={<CheckCircle />}>
          In wanted
        </Button>
        {onAddOwned && (
          <Button size="small" variant="contained" disabled={!!acting} onClick={onAddOwned}>
            {acting === "owned" ? "…" : "Add to collection"}
          </Button>
        )}
        {onRemoveWishlist && (
          <Button size="small" color="error" variant="outlined" disabled={!!acting} onClick={onRemoveWishlist}>
            {acting === "removeWishlist" ? "…" : "Remove from wanted"}
          </Button>
        )}
      </>
    );
  }
  return (
    <>
      {onAddOwned && (
        <Button size="small" variant="contained" disabled={!!acting} onClick={onAddOwned}>
          {acting === "owned" ? "…" : "Add to collection"}
        </Button>
      )}
      {onAddWishlist && (
        <Button size="small" variant="outlined" disabled={!!acting} onClick={onAddWishlist}>
          {acting === "wishlist" ? "…" : "Add to wanted"}
        </Button>
      )}
    </>
  );
}

export type GameCardProps = {
  game: GameDto;
  /** Search variant: show Add to Owned / Add to Wishlist (status-aware when inCollection/inWishlist passed) */
  variant?: "search" | "list";
  /** When variant=search: game is already in user's collection */
  inCollection?: boolean;
  /** When variant=search: game is already in user's wishlist (wanted) */
  inWishlist?: boolean;
  acting?: string;
  onAddOwned?: () => void;
  onAddWishlist?: () => void;
  onRemoveOwned?: () => void;
  onRemoveWishlist?: () => void;
  removing?: boolean;
  onRemove?: () => void;
};

export function GameCard({
  game,
  variant = "list",
  inCollection = false,
  inWishlist = false,
  acting,
  onAddOwned,
  onAddWishlist,
  onRemoveOwned,
  onRemoveWishlist,
  removing,
  onRemove,
}: Readonly<GameCardProps>) {
  const meta = gameMeta(game);
  const categories = (game.categories ?? []).slice(0, 4);
  const mechanics = (game.mechanics ?? []).slice(0, 4);
  const shortDescription = clampDescription(game.description, DESC_MAX_LEN);

  return (
    <Card
      sx={{
        width: "100%",
        minWidth: 0,
        height: CARD_HEIGHT,
        minHeight: CARD_HEIGHT,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <CardContent
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          pr: THUMB_SIZE + 2,
          overflow: "hidden",
          py: 1.25,
          px: 1.5,
        }}
      >
        {/* Thumbnail top-right */}
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            width: THUMB_SIZE,
            height: THUMB_SIZE,
            borderRadius: 1,
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {game.imageUrl ? (
            <Box
              component="img"
              src={game.imageUrl}
              alt=""
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          ) : (
            <Skeleton variant="rounded" width={THUMB_SIZE} height={THUMB_SIZE} sx={{ display: "block" }} />
          )}
        </Box>

        <Typography
          component={Link}
          to={`/games/${game.id}`}
          variant="h6"
          sx={{
            fontWeight: 600,
            textDecoration: "none",
            color: "text.primary",
            pr: THUMB_SIZE + 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          {game.name}
        </Typography>
        {meta.length > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, mb: 0.5 }} fontSize="0.8125rem">
            {meta.join(" · ")}
          </Typography>
        )}
        {shortDescription && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 0.5,
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
            fontSize="0.8125rem"
          >
            {shortDescription}
          </Typography>
        )}
      </CardContent>

      <CardActions sx={{ flexShrink: 0, flexWrap: "wrap", gap: 0.5, px: 1.5, pt: 0, pb: 0.75 }}>
        <Button component={Link} to={`/games/${game.id}`} size="small" variant="outlined">
          Details
        </Button>
        {variant === "search" && (
          <SearchGameCardActions
            inCollection={inCollection}
            inWishlist={inWishlist}
            acting={acting}
            onAddOwned={onAddOwned}
            onAddWishlist={onAddWishlist}
            onRemoveOwned={onRemoveOwned}
            onRemoveWishlist={onRemoveWishlist}
          />
        )}
        {variant === "list" && onRemove && (
          <Button size="small" color="error" variant="outlined" disabled={!!removing} onClick={onRemove}>
            {removing ? "…" : "Remove"}
          </Button>
        )}
      </CardActions>

      {/* Categories at bottom — small, same style, wrap */}
      {(categories.length > 0 || mechanics.length > 0) && (
        <Box sx={{ flexShrink: 0, px: 1.5, pb: 1.25, pt: 0, maxHeight: 40, overflow: "hidden" }}>
          <Stack direction="row" flexWrap="wrap" gap={0.5} useFlexGap>
            {categories.map((c, i) => (
              <Chip key={`cat-${i}-${c}`} label={c} size="small" variant="outlined" />
            ))}
            {mechanics.map((m, i) => (
              <Chip key={`mech-${i}-${m}`} label={m} size="small" variant="outlined" />
            ))}
          </Stack>
        </Box>
      )}
    </Card>
  );
}
