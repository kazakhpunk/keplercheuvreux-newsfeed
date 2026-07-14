'use client';

import { useEffect, useState } from 'react';
import { setPostLike } from '../actions/engagement';
import { getLikedPostIds, setPostLiked } from '@/lib/likedPosts';

export function PostStats({
  postId,
  viewsCount,
  likesCount,
}: {
  postId: number;
  viewsCount: number;
  likesCount: number;
}) {
  const [likes, setLikes] = useState(likesCount);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    setIsLiked(getLikedPostIds().has(postId));
  }, [postId]);

  async function handleLikeClick(event: React.MouseEvent) {
    event.stopPropagation();
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikes((count) => count + (nextLiked ? 1 : -1));
    setPostLiked(postId, nextLiked);

    const updatedCount = await setPostLike(postId, nextLiked);
    setLikes(updatedCount);
  }

  return (
    <div className="post-stats">
      <span className="post-stats-views">{viewsCount} views</span>
      <button
        type="button"
        className={isLiked ? 'post-stats-like post-stats-like-active' : 'post-stats-like'}
        aria-pressed={isLiked}
        onClick={handleLikeClick}
      >
        <span aria-hidden="true">♥</span> {likes}
      </button>
    </div>
  );
}
