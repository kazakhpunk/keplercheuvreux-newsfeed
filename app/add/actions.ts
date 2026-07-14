'use server';

import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { createPost } from '@/lib/posts';
import { isKnownStockImageUrl, validatePostFields, validateImageFile } from '@/lib/validation';
import { initialAddPostState, type AddPostState } from './state';

export type { AddPostState };

export async function addPost(
  _prevState: AddPostState,
  formData: FormData
): Promise<AddPostState> {
  const values = {
    title: String(formData.get('title') ?? ''),
    description: String(formData.get('description') ?? ''),
    category: String(formData.get('category') ?? ''),
    authorName: String(formData.get('authorName') ?? ''),
  };

  const fieldErrors: Record<string, string> = { ...validatePostFields(values) };

  const imageEntry = formData.get('image');
  const image = imageEntry instanceof File && imageEntry.size > 0 ? imageEntry : null;
  const stockImageUrl = String(formData.get('stockImageUrl') ?? '').trim();

  let imageError: string | null = null;
  if (image) {
    imageError = validateImageFile(image);
  } else if (stockImageUrl) {
    if (!isKnownStockImageUrl(stockImageUrl)) {
      imageError = 'Selected image is not valid.';
    }
  } else {
    imageError = 'An image is required.';
  }
  if (imageError) fieldErrors.image = imageError;

  const avatarEntry = formData.get('authorAvatar');
  const avatar = avatarEntry instanceof File && avatarEntry.size > 0 ? avatarEntry : null;
  if (avatar) {
    const avatarError = validateImageFile(avatar);
    if (avatarError) fieldErrors.authorAvatar = avatarError;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, errors: fieldErrors, values };
  }

  try {
    let uploadedImageUrl: string;
    if (image) {
      const uploadedImage = await put(`posts/${Date.now()}-${image.name}`, image, {
        access: 'public',
        addRandomSuffix: true,
      });
      uploadedImageUrl = uploadedImage.url;
    } else {
      uploadedImageUrl = stockImageUrl;
    }

    let avatarUrl: string | null = null;
    if (avatar) {
      const uploadedAvatar = await put(`avatars/${Date.now()}-${avatar.name}`, avatar, {
        access: 'public',
        addRandomSuffix: true,
      });
      avatarUrl = uploadedAvatar.url;
    }

    await createPost({
      title: values.title,
      description: values.description,
      category: values.category,
      imageUrl: uploadedImageUrl,
      authorName: values.authorName,
      authorAvatarUrl: avatarUrl,
    });

    revalidatePath('/');

    return { success: true, errors: {}, values: initialAddPostState.values };
  } catch (error: unknown) {
    console.error('addPost failed', error);
    return {
      success: false,
      errors: { form: 'Something went wrong saving your post. Please try again.' },
      values,
    };
  }
}
