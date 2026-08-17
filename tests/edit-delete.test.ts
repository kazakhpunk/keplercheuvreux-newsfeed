import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Post, PostEdit } from '@/lib/posts';

const putMock = vi.fn();
const updatePostMock = vi.fn();
const deletePostMock = vi.fn();

vi.mock('@vercel/blob', () => ({
  put: (...args: unknown[]) => putMock(...args),
}));

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}));

vi.mock('@/lib/posts', () => ({
  updatePost: (id: number, input: PostEdit) => updatePostMock(id, input),
  deletePost: (id: number) => deletePostMock(id),
}));

import { editPost, deletePost } from '@/app/actions/posts';
import { initialEditPostState } from '@/app/actions/editPostState';

const existingPost: Post = {
  id: 7,
  title: 'Original title',
  description: 'Original description',
  imageUrl: 'https://blob.example.com/posts/original.png',
  authorName: 'Jane Doe',
  authorAvatarUrl: null,
  createdAt: '2026-07-08T00:00:00.000Z',
  updatedAt: '2026-07-08T00:00:00.000Z',
  viewsCount: 3,
  likesCount: 1,
};

function buildFormData(overrides: Partial<Record<string, string>> = {}): FormData {
  const formData = new FormData();
  formData.set('title', overrides.title ?? 'Updated title');
  formData.set('description', overrides.description ?? 'Updated description');
  formData.set('authorName', overrides.authorName ?? 'Jane Doe');
  return formData;
}

describe('editPost', () => {
  beforeEach(() => {
    putMock.mockReset();
    updatePostMock.mockReset();
    updatePostMock.mockImplementation(async (_id: number, input: PostEdit) => ({
      ...existingPost,
      ...input,
    }));
  });

  it('saves the text fields without touching the image when none is supplied', async () => {
    // Arrange
    const formData = buildFormData();

    // Act
    const result = await editPost(existingPost.id, initialEditPostState(existingPost), formData);

    // Assert
    expect(result.success).toBe(true);
    expect(putMock).not.toHaveBeenCalled();
    expect(updatePostMock).toHaveBeenCalledWith(7, {
      title: 'Updated title',
      description: 'Updated description',
      authorName: 'Jane Doe',
      imageUrl: undefined,
      authorAvatarUrl: undefined,
    });
  });

  it('uploads and swaps the image when a new file is supplied', async () => {
    // Arrange
    putMock.mockResolvedValue({ url: 'https://blob.example.com/posts/new.png' });
    const formData = buildFormData();
    formData.set('image', new File(['bytes'], 'new.png', { type: 'image/png' }));

    // Act
    const result = await editPost(existingPost.id, initialEditPostState(existingPost), formData);

    // Assert
    expect(result.success).toBe(true);
    expect(updatePostMock).toHaveBeenCalledWith(
      7,
      expect.objectContaining({ imageUrl: 'https://blob.example.com/posts/new.png' })
    );
  });

  it('returns field errors and does not save when required fields are blank', async () => {
    // Arrange
    const formData = buildFormData({ title: '' });

    // Act
    const result = await editPost(existingPost.id, initialEditPostState(existingPost), formData);

    // Assert
    expect(result.success).toBe(false);
    expect(result.errors.title).toBe('Title is required.');
    expect(updatePostMock).not.toHaveBeenCalled();
  });

  it('returns a form-level error when saving fails', async () => {
    // Arrange
    updatePostMock.mockRejectedValue(new Error('db down'));
    const formData = buildFormData();

    // Act
    const result = await editPost(existingPost.id, initialEditPostState(existingPost), formData);

    // Assert
    expect(result.success).toBe(false);
    expect(result.errors.form).toMatch(/something went wrong/i);
  });
});

describe('deletePost', () => {
  beforeEach(() => {
    deletePostMock.mockReset();
  });

  it('deletes the post by id', async () => {
    // Arrange
    deletePostMock.mockResolvedValue(undefined);

    // Act
    const result = await deletePost(7);

    // Assert
    expect(result).toEqual({ success: true, error: null });
    expect(deletePostMock).toHaveBeenCalledWith(7);
  });

  it('reports a friendly error when the delete fails', async () => {
    // Arrange
    deletePostMock.mockRejectedValue(new Error('db down'));

    // Act
    const result = await deletePost(7);

    // Assert
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/something went wrong/i);
  });
});
