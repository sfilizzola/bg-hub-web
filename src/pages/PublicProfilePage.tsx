import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Container,
  Paper,
  Stack,
  Avatar,
  Typography,
  Chip,
  Link,
  Divider,
  Skeleton,
  Alert,
  Button,
  ButtonBase,
  Tabs,
  Tab,
  TextField,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { getPublicProfile, updateMyProfile, uploadMyPhoto, getUserCollection, getUserWanted } from "../api/users";
import { followUser, unfollowUser, getFollowing, getOwned, getWishlist } from "../api/me";
import type { PublicProfile } from "../api/users";
import type { GameDto } from "../api/games";
import { useAuth } from "../contexts/useAuth";
import { CompactGameCard } from "../components/CompactGameCard";
import { API_BASE_URL } from "../config/env";

function getFollowButtonLabel(followInFlight: boolean, isFollowing: boolean): string {
  if (followInFlight) return "…";
  return isFollowing ? "Unfollow" : "Follow";
}

/** Resolve avatar URL: relative paths get API base prepended. */
function resolveAvatarUrl(avatarUrl: string | null | undefined): string | undefined {
  if (!avatarUrl) return undefined;
  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) return avatarUrl;
  const base = API_BASE_URL.replace(/\/$/, "");
  const path = avatarUrl.startsWith("/") ? avatarUrl : `/${avatarUrl}`;
  return base + path;
}

interface TabPanelProps {
  readonly children?: React.ReactNode;
  readonly index: number;
  readonly value: number;
  readonly id: string;
  readonly "aria-labelledby": string;
}

function TabPanel({ children, value, index, id, "aria-labelledby": ariaLabelledby }: TabPanelProps) {
  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={id}
      aria-labelledby={ariaLabelledby}
      sx={{ pt: 2 }}
    >
      {value === index && children}
    </Box>
  );
}

export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user } = useAuth();
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [followInFlight, setFollowInFlight] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoaded, setFollowLoaded] = useState(false);

  // Tab state: 0 = Collection, 1 = Wanted (default Collection when entering profile)
  const [tab, setTab] = useState(0);

  // Collection and Wanted lists for the viewed profile user
  const [collectionGames, setCollectionGames] = useState<GameDto[]>([]);
  const [wantedGames, setWantedGames] = useState<GameDto[]>([]);
  const [collectionLoading, setCollectionLoading] = useState(false);
  const [wantedLoading, setWantedLoading] = useState(false);

  // Edit mode: only for own profile
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [profileUpdateError, setProfileUpdateError] = useState("");
  const [editDisplayName, setEditDisplayName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Own profile: logged-in user is viewing their own profile (match username from URL to auth user).
  const isSelf = user?.username === username;

  useEffect(() => {
    if (!username) return;
    getPublicProfile(username)
      .then((p) => {
        setProfile(p);
        setError("");
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      })
      .finally(() => setLoading(false));
  }, [username]);

  useEffect(() => {
    if (!user || !username || isSelf) {
      Promise.resolve().then(() => setFollowLoaded(true));
      return;
    }
    getFollowing()
      .then((res) => {
        setIsFollowing(res.users.some((u) => u.username === username));
      })
      .catch(() => setIsFollowing(false))
      .finally(() => setFollowLoaded(true));
  }, [user, username, isSelf]);

  // Viewed user: from route param (same as profile.username once loaded). Tabs must show THIS user's lists.
  const viewedUsername = username ?? profile?.username;

  // Fetch collection and wanted lists for the viewed user (not the logged-in user when viewing someone else).
  useEffect(() => {
    if (!profile || !viewedUsername) return;

    setCollectionLoading(true);
    setWantedLoading(true);

    if (isSelf) {
      // Own profile: use /me endpoints (current user = viewed user).
      getOwned()
        .then((res) => setCollectionGames(res.games))
        .catch(() => setCollectionGames([]))
        .finally(() => setCollectionLoading(false));
      getWishlist()
        .then((res) => setWantedGames(res.games))
        .catch(() => setWantedGames([]))
        .finally(() => setWantedLoading(false));
    } else {
      // Another user's profile: fetch THAT user's collection and wanted by viewedUsername.
      Promise.all([
        getUserCollection(viewedUsername),
        getUserWanted(viewedUsername),
      ])
        .then(([ownedRes, wantedRes]) => {
          setCollectionGames(ownedRes.games);
          setWantedGames(wantedRes.games);
        })
        .catch(() => {
          setCollectionGames([]);
          setWantedGames([]);
        })
        .finally(() => {
          setCollectionLoading(false);
          setWantedLoading(false);
        });
    }
  }, [profile?.id, isSelf, viewedUsername]);

  // Enter edit mode: initialize form from current profile. Username is never part of the form.
  function handleStartEdit() {
    if (!profile) return;
    setEditDisplayName(profile.displayName ?? "");
    setEditBio(profile.bio ?? "");
    setPhotoFile(null);
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
    setPhotoPreviewUrl(null);
    setProfileUpdateError("");
    setEditMode(true);
  }

  // Cancel: revert and exit edit mode; revoke object URL.
  function handleCancelEdit() {
    if (photoPreviewUrl) {
      URL.revokeObjectURL(photoPreviewUrl);
    }
    setPhotoPreviewUrl(null);
    setPhotoFile(null);
    setEditMode(false);
    setProfileUpdateError("");
  }

  // Photo file selected: show preview in Avatar via object URL.
  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setProfileUpdateError("Please select an image file.");
      return;
    }
    if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
    setPhotoFile(file);
    setPhotoPreviewUrl(URL.createObjectURL(file));
    setProfileUpdateError("");
  }

  // Save: upload photo if new file, then PATCH profile with displayName, bio, avatarUrl (username never sent).
  async function handleSaveProfile() {
    if (!profile || saving) return;
    setSaving(true);
    setProfileUpdateError("");
    try {
      let avatarUrl: string | undefined = profile.avatarUrl;
      if (photoFile) {
        const { url } = await uploadMyPhoto(photoFile);
        avatarUrl = url;
      }
      await updateMyProfile({
        displayName: editDisplayName.trim() || undefined,
        bio: editBio.trim() || undefined,
        avatarUrl,
      });
      setProfile({
        ...profile,
        displayName: editDisplayName.trim() || undefined,
        bio: editBio.trim() || undefined,
        avatarUrl,
      });
      if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
      setPhotoPreviewUrl(null);
      setPhotoFile(null);
      setEditMode(false);
    } catch (err) {
      setProfileUpdateError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleFollowToggle() {
    if (!username || followInFlight) return;
    setFollowInFlight(true);
    try {
      if (isFollowing) {
        await unfollowUser(username);
        setIsFollowing(false);
        if (profile)
          setProfile({ ...profile, followersCount: profile.followersCount - 1 });
      } else {
        await followUser(username);
        setIsFollowing(true);
        if (profile)
          setProfile({ ...profile, followersCount: profile.followersCount + 1 });
      }
    } catch {
      setError("Failed to update follow");
    } finally {
      setFollowInFlight(false);
    }
  }

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Skeleton variant="circular" width={88} height={88} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={36} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="40%" height={24} />
            </Box>
          </Stack>
          <Skeleton variant="text" width="80%" sx={{ mb: 1 }} />
          <Skeleton variant="text" width="90%" />
        </Paper>
      </Container>
    );
  }

  if (error || !profile) {
    return (
      <Container maxWidth="sm" sx={{ py: 3 }}>
        <Alert severity="error" role="alert">
          {error || "User not found"}
        </Alert>
      </Container>
    );
  }

  const displayName = profile.displayName ?? profile.username;
  const initials = profile.username.slice(0, 2).toUpperCase();
  const avatarUrlResolved = resolveAvatarUrl(photoPreviewUrl ? undefined : profile.avatarUrl);
  const avatarPreview = photoPreviewUrl ?? avatarUrlResolved;

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Paper variant="outlined" sx={{ p: 3 }}>
        {/* Header: avatar, name, optional handle, own-profile actions */}
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 2 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
            {editMode ? (
              <Stack alignItems="center" spacing={1}>
                <Avatar
                  src={avatarPreview}
                  alt=""
                  sx={{ width: 88, height: 88 }}
                >
                  {!avatarPreview && initials}
                </Avatar>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  style={{ display: "none" }}
                  tabIndex={-1}
                  aria-label="Upload profile photo"
                />
                <Button
                  size="small"
                  variant="outlined"
                  disabled={saving}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload photo
                </Button>
              </Stack>
            ) : (
              <Avatar
                src={avatarUrlResolved}
                alt=""
                sx={{ width: 88, height: 88 }}
              >
                {!avatarUrlResolved && initials}
              </Avatar>
            )}
            <Box sx={{ minWidth: 0, flex: 1 }}>
              {editMode ? (
                <Stack spacing={1}>
                  <TextField
                    label="Display name"
                    value={editDisplayName}
                    onChange={(e) => setEditDisplayName(e.target.value)}
                    disabled={saving}
                    size="small"
                    fullWidth
                  />
                  <TextField
                    label="Username"
                    value={profile.username}
                    disabled
                    size="small"
                    fullWidth
                    helperText="Username cannot be changed"
                  />
                </Stack>
              ) : (
                <>
                  <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
                    <Typography variant="h5" component="h1" fontWeight={600}>
                      {displayName}
                    </Typography>
                    <Chip label="Member" color="primary" size="small" variant="outlined" />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    @{profile.username}
                  </Typography>
                </>
              )}
            </Box>
          </Stack>
          {isSelf && !editMode && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                size="small"
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={handleStartEdit}
              >
                Edit profile
              </Button>
              {/* TODO: Wire Change Password route/action */}
              <Link href="#" color="primary" underline="hover" sx={{ alignSelf: "center" }}>
                Change password
              </Link>
            </Stack>
          )}
          {isSelf && editMode && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Button size="small" variant="contained" disabled={saving} onClick={handleSaveProfile}>
                {saving ? <CircularProgress size={20} color="inherit" /> : "Save"}
              </Button>
              <Button size="small" variant="outlined" disabled={saving} onClick={handleCancelEdit}>
                Cancel
              </Button>
            </Stack>
          )}
        </Box>

        {profileUpdateError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setProfileUpdateError("")}>
            {profileUpdateError}
          </Alert>
        )}

        {/* Bio: editable in edit mode */}
        <Box sx={{ maxWidth: "100%", mb: editMode ? 2 : 0 }}>
          {editMode ? (
            <TextField
              label="Bio"
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              disabled={saving}
              multiline
              minRows={2}
              maxRows={6}
              fullWidth
            />
          ) : (
            <>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Bio
              </Typography>
              <Typography variant="body1" color="text.primary" sx={{ whiteSpace: "pre-wrap" }}>
                {profile.bio?.trim() ? profile.bio : "No bio yet."}
              </Typography>
            </>
          )}
        </Box>

        {/* Following / Followers counts */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <ButtonBase sx={{ textAlign: "left" }}>
            <Typography variant="body2" fontWeight={500} color="primary">
              {profile.followingCount ?? 0} Following
            </Typography>
          </ButtonBase>
          <ButtonBase sx={{ textAlign: "left" }}>
            <Typography variant="body2" fontWeight={500} color="primary">
              {profile.followersCount ?? 0} Followers
            </Typography>
          </ButtonBase>
        </Stack>

        {user && !isSelf && followLoaded && (
          <Box sx={{ mb: 2 }}>
            <Button
              variant="contained"
              disabled={followInFlight}
              onClick={handleFollowToggle}
            >
              {getFollowButtonLabel(followInFlight, isFollowing)}
            </Button>
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Tabs: Collection (default), Wanted */}
        <Tabs
          value={tab}
          onChange={(_, v: number) => setTab(v)}
          aria-label="Profile sections"
          sx={{ mt: 2, borderBottom: 1, borderColor: "divider" }}
        >
          <Tab id="profile-tab-0" aria-controls="profile-tabpanel-0" label="Collection" />
          <Tab id="profile-tab-1" aria-controls="profile-tabpanel-1" label="Wanted" />
        </Tabs>

        <TabPanel value={tab} index={0} id="profile-tabpanel-0" aria-labelledby="profile-tab-0">
          {collectionLoading && (
            <Stack spacing={1}>
              {[1, 2, 3].map((i) => (
                <Stack key={i} direction="row" spacing={1.5} alignItems="center" sx={{ p: 1 }}>
                  <Skeleton variant="rounded" width={48} height={48} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="70%" height={24} />
                    <Skeleton variant="text" width="50%" height={16} />
                  </Box>
                </Stack>
              ))}
            </Stack>
          )}
          {!collectionLoading && collectionGames.length === 0 && (
            <Alert severity="info">No games in collection yet.</Alert>
          )}
          {!collectionLoading && collectionGames.length > 0 && (
            <Stack component="ul" sx={{ listStyle: "none", m: 0, p: 0 }} spacing={0}>
              {collectionGames.map((game) => (
                <Box component="li" key={game.id}>
                  <CompactGameCard game={game} />
                </Box>
              ))}
            </Stack>
          )}
        </TabPanel>

        <TabPanel value={tab} index={1} id="profile-tabpanel-1" aria-labelledby="profile-tab-1">
          {wantedLoading && (
            <Stack spacing={1}>
              {[1, 2, 3].map((i) => (
                <Stack key={i} direction="row" spacing={1.5} alignItems="center" sx={{ p: 1 }}>
                  <Skeleton variant="rounded" width={48} height={48} />
                  <Box sx={{ flex: 1 }}>
                    <Skeleton variant="text" width="70%" height={24} />
                    <Skeleton variant="text" width="50%" height={16} />
                  </Box>
                </Stack>
              ))}
            </Stack>
          )}
          {!wantedLoading && wantedGames.length === 0 && (
            <Alert severity="info">No wanted games yet.</Alert>
          )}
          {!wantedLoading && wantedGames.length > 0 && (
            <Stack component="ul" sx={{ listStyle: "none", m: 0, p: 0 }} spacing={0}>
              {wantedGames.map((game) => (
                <Box component="li" key={game.id}>
                  <CompactGameCard game={game} />
                </Box>
              ))}
            </Stack>
          )}
        </TabPanel>
      </Paper>
    </Container>
  );
}
