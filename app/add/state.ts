export type AddPostState = {
  success: boolean;
  errors: Record<string, string>;
  values: {
    title: string;
    description: string;
    category: string;
    authorName: string;
  };
};

export const initialAddPostState: AddPostState = {
  success: false,
  errors: {},
  values: { title: '', description: '', category: '', authorName: '' },
};
