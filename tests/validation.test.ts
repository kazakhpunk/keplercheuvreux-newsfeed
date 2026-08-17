import { describe, it, expect } from 'vitest';
import { validatePostFields, validateImageFile } from '@/lib/validation';

describe('validatePostFields', () => {
  it('returns no errors when all fields are filled in', () => {
    const errors = validatePostFields({
      title: 'Title',
      description: 'Description',
      authorName: 'Jane Doe',
    });

    expect(errors).toEqual({});
  });

  it('flags missing or blank fields', () => {
    const errors = validatePostFields({
      title: '',
      description: '   ',
      authorName: 'Jane Doe',
    });

    expect(errors.title).toBe('Title is required.');
    expect(errors.description).toBe('Content is required.');
    expect(errors.authorName).toBeUndefined();
  });
});

describe('validateImageFile', () => {
  it('rejects a missing file', () => {
    expect(validateImageFile(null)).toBe('An image is required.');
  });

  it('rejects a non-image file type', () => {
    expect(validateImageFile({ type: 'application/pdf', size: 1000 })).toBe(
      'Image must be a PNG, JPEG, WEBP, or GIF file.'
    );
  });

  it('rejects a file over 5MB', () => {
    expect(validateImageFile({ type: 'image/png', size: 6 * 1024 * 1024 })).toBe(
      'Image must be smaller than 5MB.'
    );
  });

  it('accepts a valid image under the size limit', () => {
    expect(validateImageFile({ type: 'image/png', size: 1024 })).toBeNull();
  });
});
