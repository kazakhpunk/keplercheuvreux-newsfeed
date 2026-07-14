'use server';

import { adjustPostLikes, incrementPostViews } from '@/lib/posts';

export async function recordPostView(postId: number): Promise<number> {
  return incrementPostViews(postId);
}

export async function setPostLike(postId: number, liked: boolean): Promise<number> {
  return adjustPostLikes(postId, liked ? 1 : -1);
}
