import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPublicProfile } from "../api/users";
import { followUser, unfollowUser, getFollowing } from "../api/me";
import type { PublicProfile } from "../api/users";
import { useAuth } from "../contexts/useAuth";

function getFollowButtonLabel(followInFlight: boolean, isFollowing: boolean): string {
  if (followInFlight) return "…";
  return isFollowing ? "Unfollow" : "Follow";
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
      <div className="d-flex align-items-center gap-2">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading…</span>
        </div>
        <span>Loading profile…</span>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="alert alert-danger" role="alert">
        {error || "User not found"}
      </div>
    );
  }

  return (
    <div>
      <h1 className="h3 mb-3">{profile.username}</h1>
      <p className="text-body-secondary mb-2">
        {profile.followersCount} followers · {profile.followingCount} following
      </p>
      {user && !isSelf && followLoaded && (
        <button
          type="button"
          className="btn btn-primary"
          disabled={followInFlight}
          onClick={handleFollowToggle}
        >
          {getFollowButtonLabel(followInFlight, isFollowing)}
        </button>
      )}
    </div>
  );
}
