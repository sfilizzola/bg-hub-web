import { Link } from "react-router-dom";
import {
  Box,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import type { GameDto } from "../api/games";

const THUMB_SIZE = 48;
const MAX_CHIPS = 3;

function gameMetaLine(g: GameDto): string {
  const parts: string[] = [];
  if (g.year != null) parts.push(String(g.year));
  if (g.minPlayers != null && g.maxPlayers != null) {
    parts.push(`${g.minPlayers}-${g.maxPlayers} players`);
  } else if (g.minPlayers != null) parts.push(`${g.minPlayers}+ players`);
  else if (g.maxPlayers != null) parts.push(`up to ${g.maxPlayers} players`);
  if (g.playTime != null) parts.push(`${g.playTime} min`);
  return parts.join(" · ");
}

export type CompactGameCardProps = {
  game: GameDto;
};

export function CompactGameCard({ game }: Readonly<CompactGameCardProps>) {
  const metaLine = gameMetaLine(game);
  const categories = (game.categories ?? []).slice(0, MAX_CHIPS);

  return (
    <Box
      component={Link}
      to={`/games/${game.id}`}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 1,
        borderRadius: 1,
        textDecoration: "none",
        color: "inherit",
        "&:hover": { bgcolor: "action.hover" },
        transition: "background-color 0.15s",
      }}
    >
      <Box
        sx={{
          width: THUMB_SIZE,
          height: THUMB_SIZE,
          borderRadius: 1,
          overflow: "hidden",
          flexShrink: 0,
          bgcolor: "action.hover",
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
          <Skeleton variant="rounded" width={THUMB_SIZE} height={THUMB_SIZE} sx={{ display: "block" }} />
        )}
      </Box>
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="subtitle1" fontWeight={600} noWrap>
          {game.name}
        </Typography>
        {metaLine && (
          <Typography variant="caption" color="text.secondary" display="block" noWrap>
            {metaLine}
          </Typography>
        )}
        {categories.length > 0 && (
          <Stack direction="row" spacing={0.5} sx={{ mt: 0.25 }} flexWrap="wrap" useFlexGap>
            {categories.map((c, i) => (
              <Chip key={`${c}-${i}`} label={c} size="small" variant="outlined" />
            ))}
          </Stack>
        )}
      </Box>
    </Box>
  );
}
