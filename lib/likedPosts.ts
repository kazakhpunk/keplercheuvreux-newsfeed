const LIKED_POSTS_STORAGE_KEY = 'newsfeed-liked-posts';

export function getLikedPostIds(): Set<number> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = window.localStorage.getItem(LIKED_POSTS_STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as number[]) : []);
  } catch {
    return new Set();
  }
}

export function setPostLiked(postId: number, liked: boolean): void {
  const ids = getLikedPostIds();
  if (liked) {
    ids.add(postId);
  } else {
    ids.delete(postId);
  }
  window.localStorage.setItem(LIKED_POSTS_STORAGE_KEY, JSON.stringify([...ids]));
}
