'use server';

import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { deletePost as deletePostRow, updatePost } from '@/lib/posts';
import { isKnownStockImageUrl, validatePostFields, validateImageFile } from '@/lib/validation';
import type { EditPostState } from './editPostState';

export type { EditPostState };

export type DeletePostState = {
  success: boolean;
  error: string | null;
};

export async function editPost(
  postId: number,
  _prevState: EditPostState,
  formData: FormData
): Promise<EditPostState> {
  const values = {
    title: String(formData.get('title') ?? ''),
    description: String(formData.get('description') ?? ''),
    category: String(formData.get('category') ?? ''),
    authorName: String(formData.get('authorName') ?? ''),
  };

  const fieldErrors: Record<string, string> = { ...validatePostFields(values) };

  // An unchanged image is the common case on edit, so a blank file input and an
  // unselected stock image both mean "keep the current one" rather than an error.
  const imageEntry = formData.get('image');
  const image = imageEntry instanceof File && imageEntry.size > 0 ? imageEntry : null;
  const stockImageUrl = String(formData.get('stockImageUrl') ?? '').trim();

  if (image) {
    const imageError = validateImageFile(image);
    if (imageError) fieldErrors.image = imageError;
  } else if (stockImageUrl && !isKnownStockImageUrl(stockImageUrl)) {
    fieldErrors.image = 'Selected image is not valid.';
  }

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
    let imageUrl: string | undefined;
    if (image) {
      const uploadedImage = await put(`posts/${Date.now()}-${image.name}`, image, {
        access: 'public',
        addRandomSuffix: true,
      });
      imageUrl = uploadedImage.url;
    } else if (stockImageUrl) {
      imageUrl = stockImageUrl;
    }

    let authorAvatarUrl: string | undefined;
    if (avatar) {
      const uploadedAvatar = await put(`avatars/${Date.now()}-${avatar.name}`, avatar, {
        access: 'public',
        addRandomSuffix: true,
      });
      authorAvatarUrl = uploadedAvatar.url;
    }

    await updatePost(postId, { ...values, imageUrl, authorAvatarUrl });

    revalidatePath('/');

    return { success: true, errors: {}, values };
  } catch (error: unknown) {
    console.error('editPost failed', error);
    return {
      success: false,
      errors: { form: 'Something went wrong saving your changes. Please try again.' },
      values,
    };
  }
}

export async function deletePost(postId: number): Promise<DeletePostState> {
  try {
    await deletePostRow(postId);
    revalidatePath('/');
    return { success: true, error: null };
  } catch (error: unknown) {
    console.error('deletePost failed', error);
    return { success: false, error: 'Something went wrong deleting this post. Please try again.' };
  }
}
