import type { Post } from '@/lib/posts';

export type EditPostState = {
  success: boolean;
  errors: Record<string, string>;
  values: {
    title: string;
    description: string;
    authorName: string;
  };
};

export function initialEditPostState(post: Post): EditPostState {
  return {
    success: false,
    errors: {},
    values: {
      title: post.title,
      description: post.description,
      authorName: post.authorName,
    },
  };
}
