import { sql } from '@vercel/postgres';

export type Post = {
  id: number;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  authorName: string;
  authorAvatarUrl: string | null;
  createdAt: string;
};

export type NewPost = {
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  authorName: string;
  authorAvatarUrl: string | null;
};

type PostRow = {
  id: number;
  title: string;
  description: string;
  category: string;
  image_url: string;
  author_name: string;
  author_avatar_url: string | null;
  created_at: string;
};

export function rowToPost(row: PostRow): Post {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    imageUrl: row.image_url,
    authorName: row.author_name,
    authorAvatarUrl: row.author_avatar_url,
    createdAt: row.created_at,
  };
}

export async function getPosts(): Promise<Post[]> {
  const { rows } = await sql<PostRow>`
    SELECT id, title, description, category, image_url, author_name, author_avatar_url, created_at
    FROM posts
    ORDER BY created_at DESC
  `;
  return rows.map(rowToPost);
}

export async function createPost(input: NewPost): Promise<Post> {
  const { rows } = await sql<PostRow>`
    INSERT INTO posts (title, description, category, image_url, author_name, author_avatar_url)
    VALUES (${input.title}, ${input.description}, ${input.category}, ${input.imageUrl}, ${input.authorName}, ${input.authorAvatarUrl})
    RETURNING id, title, description, category, image_url, author_name, author_avatar_url, created_at
  `;
  return rowToPost(rows[0]);
}
