'use server';

import { put } from '@vercel/blob';
import { revalidatePath } from 'next/cache';
import { createPost } from '@/lib/posts';
import { validatePostFields, validateImageFile } from '@/lib/validation';
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
  const image = imageEntry instanceof File ? imageEntry : null;
  const imageError = validateImageFile(image);
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
    const uploadedImage = await put(`posts/${Date.now()}-${image!.name}`, image!, {
      access: 'public',
      addRandomSuffix: true,
    });

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
      imageUrl: uploadedImage.url,
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
