import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
  Avatar,
} from "@mui/material";
import type { SearchUserDto } from "../api/search";
import type { FollowUser } from "../api/me";

type UserCardUser = SearchUserDto | FollowUser;

function isSearchUser(u: UserCardUser): u is SearchUserDto {
  return "displayName" in u && "avatarUrl" in u && "followsYou" in u && "isFollowing" in u;
}

export type UserCardProps = {
  user: UserCardUser;
  /** When true, show Follow/Unfollow and Profile (for search results). When false, only link to profile (followers/following lists). */
  showActions?: boolean;
  acting?: boolean;
  onFollowToggle?: () => void;
};

export function UserCard({
  user,
  showActions = false,
  acting,
  onFollowToggle,
}: Readonly<UserCardProps>) {
  const displayName = isSearchUser(user) ? (user.displayName ?? user.username) : user.username;
  const avatarUrl = isSearchUser(user) ? user.avatarUrl : null;
  const followsYou = isSearchUser(user) && user.followsYou;
  const isFollowing = isSearchUser(user) && user.isFollowing;

  let followButtonText = "Follow";
  if (acting) followButtonText = "…";
  else if (isSearchUser(user) && user.isFollowing) followButtonText = "Unfollow";

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
          {avatarUrl ? (
            <Avatar
              src={avatarUrl}
              alt=""
              sx={{ width: 40, height: 40 }}
            />
          ) : (
            <Avatar sx={{ width: 40, height: 40 }}>
              {user.username.charAt(0).toUpperCase()}
            </Avatar>
          )}
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              {displayName}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              @{user.username}
            </Typography>
          </Box>
        </Box>
        {followsYou && (
          <Chip label="Follows you" size="small" variant="outlined" sx={{ mb: 1 }} />
        )}
      </CardContent>
      {showActions && (
        <CardActions sx={{ flexWrap: "wrap", gap: 0.5, px: 2, pb: 2, pt: 0 }}>
          <Button
            component={Link}
            to={`/u/${user.username}`}
            size="small"
            variant="outlined"
          >
            Profile
          </Button>
          {isSearchUser(user) && onFollowToggle && (
            <Button
              size="small"
              variant={isFollowing ? "outlined" : "contained"}
              disabled={!!acting}
              onClick={onFollowToggle}
            >
              {followButtonText}
            </Button>
          )}
        </CardActions>
      )}
      {!showActions && (
        <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
          <Button
            component={Link}
            to={`/u/${user.username}`}
            size="small"
            variant="outlined"
          >
            View profile
          </Button>
        </CardActions>
      )}
    </Card>
  );
}
