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
  CircularProgress,
  Skeleton,
  Stack,
} from "@mui/material";
import type { GameDto } from "../api/games";
import type { GameSearchItemDto } from "../api/search";

const THUMB_SIZE = 48;
const THUMB_SIZE_COMPACT = 72;
const DESC_MAX_LEN = 80;
const CARD_HEIGHT = 260;
const CARD_HEIGHT_COMPACT = 96;

/** Displayable game shape (GameDto or GameSearchItemDto from search). */
type GameCardGame = GameDto | GameSearchItemDto;

function isBggSearchItem(g: GameCardGame): g is GameSearchItemDto & { source: "BGG"; bggId: number } {
  return "source" in g && g.source === "BGG" && g.bggId != null;
}

function gameMeta(g: GameCardGame): string[] {
  const meta: string[] = [];
  const y = "year" in g ? g.year : undefined;
  const minP = "minPlayers" in g ? g.minPlayers : undefined;
  const maxP = "maxPlayers" in g ? g.maxPlayers : undefined;
  const play = "playTime" in g ? g.playTime : undefined;
  if (y != null) meta.push(String(y));
  if (minP != null && maxP != null) meta.push(`${minP}-${maxP} players`);
  else if (minP != null) meta.push(`${minP}+ players`);
  else if (maxP != null) meta.push(`up to ${maxP} players`);
  if (play != null) meta.push(`${play} min`);
  return meta;
}

function clampDescription(description: string | null | undefined, maxLen: number): string | null {
  const t = description?.trim();
  if (!t) return null;
  return t.length > maxLen ? `${t.slice(0, maxLen).trim()}…` : t;
}

function getDescription(g: GameCardGame): string | null | undefined {
  return "description" in g ? g.description : undefined;
}

function getCategories(g: GameCardGame): string[] | null | undefined {
  return "categories" in g ? g.categories : undefined;
}

function getMechanics(g: GameCardGame): string[] | null | undefined {
  return "mechanics" in g ? g.mechanics : undefined;
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
  /** Full game (from DB) or search item (LOCAL with id, or BGG with bggId only). */
  game: GameCardGame;
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
  /** When game is BGG search item: called to import then navigate. */
  onBggGameClick?: (game: GameSearchItemDto) => void;
  /** BGG ID of the item currently being imported (shows loading on that card). */
  importingBggId?: number | null;
  /** When variant=search: use a compact row (smaller thumb, height, padding) for list layout. */
  compact?: boolean;
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
  onBggGameClick,
  importingBggId = null,
  compact = false,
}: Readonly<GameCardProps>) {
  const meta = gameMeta(game);
  const categories = (getCategories(game) ?? []).slice(0, 4);
  const mechanics = (getMechanics(game) ?? []).slice(0, 4);
  const shortDescription = clampDescription(getDescription(game), DESC_MAX_LEN);
  const isBgg = isBggSearchItem(game);
  const isImporting = isBgg && importingBggId === game.bggId;
  const handleBggClick = isBgg && onBggGameClick ? () => onBggGameClick(game) : undefined;
  const thumbSize = compact ? THUMB_SIZE_COMPACT : THUMB_SIZE;
  const cardHeight = compact ? CARD_HEIGHT_COMPACT : CARD_HEIGHT;
  const showCategories = !compact && (categories.length > 0 || mechanics.length > 0);
  const showDescription = !compact && shortDescription;

  const titleSxTwoLines = {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  };

  if (compact) {
    return (
      <Card
        sx={{
          width: "100%",
          minWidth: 0,
          height: cardHeight,
          minHeight: cardHeight,
          display: "flex",
          flexDirection: "row",
          overflow: "hidden",
        }}
      >
        <CardContent
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 2,
            py: 1.25,
            px: 1.5,
            "&:last-child": { pb: 1.25 },
          }}
        >
          <Box
            sx={{
              width: thumbSize,
              height: thumbSize,
              flexShrink: 0,
              borderRadius: 1.5,
              overflow: "hidden",
            }}
          >
            {game.imageUrl ? (
              <Box
                component="img"
                src={game.imageUrl}
                alt=""
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <Skeleton variant="rounded" width={thumbSize} height={thumbSize} sx={{ display: "block" }} />
            )}
          </Box>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            {handleBggClick ? (
              <Typography
                component="button"
                type="button"
                variant="body1"
                onClick={isImporting ? undefined : handleBggClick}
                disabled={!!isImporting}
                sx={{
                  fontWeight: 600,
                  textDecoration: "none",
                  color: "text.primary",
                  border: 0,
                  background: "none",
                  cursor: isImporting ? "wait" : "pointer",
                  textAlign: "left",
                  width: "100%",
                  font: "inherit",
                  lineHeight: 1.35,
                  ...titleSxTwoLines,
                  "&:hover": { textDecoration: isImporting ? "none" : "underline" },
                }}
              >
                {game.name}
              </Typography>
            ) : (
              <Typography
                component={Link}
                to={`/games/${(game as GameDto).id}`}
                variant="body1"
                sx={{
                  fontWeight: 600,
                  textDecoration: "none",
                  color: "text.primary",
                  lineHeight: 1.35,
                  ...titleSxTwoLines,
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                {game.name}
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }} fontSize="0.8125rem">
              {meta.length > 0 ? meta.join(" · ") : game.source}
            </Typography>
          </Box>
        </CardContent>
        <CardActions sx={{ flexShrink: 0, flexWrap: "wrap", gap: 0.5, px: 1.5, py: 0.5, alignItems: "center" }}>
          {handleBggClick ? (
            <Button
              size="small"
              variant="outlined"
              disabled={!!isImporting}
              onClick={handleBggClick}
              startIcon={isImporting ? <CircularProgress size={14} /> : undefined}
            >
              {isImporting ? "Importing…" : "Details"}
            </Button>
          ) : (
            <Button component={Link} to={`/games/${(game as GameDto).id}`} size="small" variant="outlined">
              Details
            </Button>
          )}
          {variant === "search" && !isBgg && (
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
        </CardActions>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        width: "100%",
        minWidth: 0,
        height: cardHeight,
        minHeight: cardHeight,
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
          pr: thumbSize + 2,
          overflow: "hidden",
          py: 1.25,
          px: 1.5,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            width: thumbSize,
            height: thumbSize,
            borderRadius: 1,
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          {game.imageUrl ? (
            <Box component="img" src={game.imageUrl} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <Skeleton variant="rounded" width={thumbSize} height={thumbSize} sx={{ display: "block" }} />
          )}
        </Box>

        {handleBggClick ? (
          <Typography
            component="button"
            type="button"
            variant="h3"
            onClick={isImporting ? undefined : handleBggClick}
            disabled={!!isImporting}
            sx={{
              fontWeight: 600,
              textDecoration: "none",
              color: "text.primary",
              pr: thumbSize + 1,
              border: 0,
              background: "none",
              cursor: isImporting ? "wait" : "pointer",
              textAlign: "left",
              width: "100%",
              font: "inherit",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              "&:hover": { textDecoration: isImporting ? "none" : "underline" },
            }}
          >
            {game.name}
          </Typography>
        ) : (
          <Typography
            component={Link}
            to={`/games/${(game as GameDto).id}`}
            variant="h3"
            sx={{
              fontWeight: 600,
              textDecoration: "none",
              color: "text.primary",
              pr: thumbSize + 1,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {game.name}
          </Typography>
        )}
        {meta.length > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, mb: 0.5 }}>
            {meta.join(" · ")}
          </Typography>
        )}
        {showDescription && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 0.5,
              display: "-webkit-box",
              WebkitLineClamp: 1,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {shortDescription}
          </Typography>
        )}
      </CardContent>

      <CardActions sx={{ flexShrink: 0, flexWrap: "wrap", gap: 0.5, px: 1.5, pt: 0, pb: 0.75 }}>
        {handleBggClick ? (
          <Button
            size="small"
            variant="outlined"
            disabled={!!isImporting}
            onClick={handleBggClick}
            startIcon={isImporting ? <CircularProgress size={14} /> : undefined}
          >
            {isImporting ? "Importing…" : "Details"}
          </Button>
        ) : (
          <Button component={Link} to={`/games/${(game as GameDto).id}`} size="small" variant="outlined">
            Details
          </Button>
        )}
        {variant === "search" && !isBgg && (
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

      {showCategories && (
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
