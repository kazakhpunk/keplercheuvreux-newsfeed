import { describe, it, expect, vi, beforeEach } from 'vitest';

const putMock = vi.fn();
const createPostMock = vi.fn();

vi.mock('@vercel/blob', () => ({
  put: (...args: unknown[]) => putMock(...args),
}));

vi.mock('@/lib/posts', () => ({
  createPost: (...args: unknown[]) => createPostMock(...args),
}));

import { addPost } from '@/app/add/actions';
import { initialAddPostState } from '@/app/add/state';

function buildFormData(
  overrides: Partial<Record<string, string>> = {},
  withImage = true
): FormData {
  const formData = new FormData();
  formData.set('title', overrides.title ?? 'Test Title');
  formData.set('description', overrides.description ?? 'Test description');
  formData.set('category', overrides.category ?? 'News');
  formData.set('authorName', overrides.authorName ?? 'Jane Doe');
  if (withImage) {
    formData.set('image', new File(['fake-bytes'], 'photo.png', { type: 'image/png' }));
  }
  return formData;
}

describe('addPost', () => {
  beforeEach(() => {
    putMock.mockReset();
    createPostMock.mockReset();
  });

  it('returns validation errors and does not upload or save when title is missing', async () => {
    const formData = buildFormData({ title: '' });

    const result = await addPost(initialAddPostState, formData);

    expect(result.success).toBe(false);
    expect(result.errors.title).toBe('Title is required.');
    expect(putMock).not.toHaveBeenCalled();
    expect(createPostMock).not.toHaveBeenCalled();
  });

  it('returns an image error and does not save when no image is provided', async () => {
    const formData = buildFormData({}, false);

    const result = await addPost(initialAddPostState, formData);

    expect(result.success).toBe(false);
    expect(result.errors.image).toBe('An image is required.');
    expect(createPostMock).not.toHaveBeenCalled();
  });

  it('uploads the image and creates the post on valid input', async () => {
    putMock.mockResolvedValue({ url: 'https://blob.example.com/posts/photo.png' });
    createPostMock.mockResolvedValue({ id: 1 });
    const formData = buildFormData();

    const result = await addPost(initialAddPostState, formData);

    expect(result.success).toBe(true);
    expect(putMock).toHaveBeenCalledTimes(1);
    expect(createPostMock).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Test Title',
        description: 'Test description',
        category: 'News',
        authorName: 'Jane Doe',
        imageUrl: 'https://blob.example.com/posts/photo.png',
        authorAvatarUrl: null,
      })
    );
  });

  it('returns a form-level error when saving fails', async () => {
    putMock.mockResolvedValue({ url: 'https://blob.example.com/posts/photo.png' });
    createPostMock.mockRejectedValue(new Error('db down'));
    const formData = buildFormData();

    const result = await addPost(initialAddPostState, formData);

    expect(result.success).toBe(false);
    expect(result.errors.form).toBe('Something went wrong saving your post. Please try again.');
  });
});
