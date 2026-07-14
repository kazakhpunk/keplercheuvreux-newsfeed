import { describe, it, expect } from 'vitest';
import { rowToPost } from '@/lib/posts';

describe('rowToPost', () => {
  it('maps a database row into a Post with camelCase fields', () => {
    const row = {
      id: 1,
      title: 'Hello',
      description: 'World',
      category: 'News',
      image_url: 'https://example.com/image.png',
      author_name: 'Jane Doe',
      author_avatar_url: null,
      created_at: '2026-07-08T00:00:00.000Z',
      views_count: 5,
      likes_count: 2,
    };

    const post = rowToPost(row);

    expect(post).toEqual({
      id: 1,
      title: 'Hello',
      description: 'World',
      category: 'News',
      imageUrl: 'https://example.com/image.png',
      authorName: 'Jane Doe',
      authorAvatarUrl: null,
      createdAt: '2026-07-08T00:00:00.000Z',
      viewsCount: 5,
      likesCount: 2,
    });
  });
});
