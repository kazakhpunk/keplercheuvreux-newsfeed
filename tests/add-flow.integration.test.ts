import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { NewPost, Post } from '@/lib/posts';

const putMock = vi.fn();

vi.mock('@vercel/blob', () => ({
  put: (...args: unknown[]) => putMock(...args),
}));

let posts: Post[] = [];
let nextId = 1;

vi.mock('@/lib/posts', () => ({
  createPost: async (input: NewPost): Promise<Post> => {
    const post: Post = {
      id: nextId++,
      title: input.title,
      description: input.description,
      category: input.category,
      imageUrl: input.imageUrl,
      authorName: input.authorName,
      authorAvatarUrl: input.authorAvatarUrl,
      createdAt: new Date().toISOString(),
    };
    posts.push(post);
    return post;
  },
  getPosts: async (): Promise<Post[]> => {
    return [...posts].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
}));

import { addPost } from '@/app/add/actions';
import { initialAddPostState } from '@/app/add/state';
import { getPosts } from '@/lib/posts';

function buildFormData(overrides: Partial<Record<string, string>> = {}): FormData {
  const formData = new FormData();
  formData.set('title', overrides.title ?? 'Integration Test Title');
  formData.set('description', overrides.description ?? 'Integration test description');
  formData.set('category', overrides.category ?? 'News');
  formData.set('authorName', overrides.authorName ?? 'Jane Doe');
  formData.set('image', new File(['fake-bytes'], 'photo.png', { type: 'image/png' }));
  return formData;
}

describe('/add -> / integration flow', () => {
  beforeEach(() => {
    putMock.mockReset();
    posts = [];
    nextId = 1;
  });

  it('makes a submitted post show up in the feed', async () => {
    putMock.mockResolvedValue({ url: 'https://blob.example.com/posts/photo.png' });
    const formData = buildFormData();

    const result = await addPost(initialAddPostState, formData);

    expect(result.success).toBe(true);

    const feedPosts = await getPosts();

    expect(feedPosts).toContainEqual(
      expect.objectContaining({
        title: 'Integration Test Title',
        description: 'Integration test description',
        category: 'News',
        authorName: 'Jane Doe',
      })
    );
  });
});
