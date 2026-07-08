export type PostFieldErrors = Partial<
  Record<'title' | 'description' | 'category' | 'authorName' | 'image' | 'authorAvatar' | 'form', string>
>;

export type PostFieldsInput = {
  title: string;
  description: string;
  category: string;
  authorName: string;
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];

export function validatePostFields(input: PostFieldsInput): PostFieldErrors {
  const errors: PostFieldErrors = {};
  if (!input.title.trim()) errors.title = 'Title is required.';
  if (!input.description.trim()) errors.description = 'Description is required.';
  if (!input.category.trim()) errors.category = 'Category is required.';
  if (!input.authorName.trim()) errors.authorName = 'Author name is required.';
  return errors;
}

export function validateImageFile(file: { type: string; size: number } | null): string | null {
  if (!file || file.size === 0) return 'An image is required.';
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Image must be a PNG, JPEG, WEBP, or GIF file.';
  }
  if (file.size > MAX_IMAGE_BYTES) return 'Image must be smaller than 5MB.';
  return null;
}
