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
  viewsCount: number;
  likesCount: number;
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
  views_count: number;
  likes_count: number;
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
    viewsCount: row.views_count,
    likesCount: row.likes_count,
  };
}

export async function getPosts(): Promise<Post[]> {
  const { rows } = await sql<PostRow>`
    SELECT id, title, description, category, image_url, author_name, author_avatar_url, created_at, views_count, likes_count
    FROM posts
    ORDER BY created_at DESC
  `;
  return rows.map(rowToPost);
}

export async function createPost(input: NewPost): Promise<Post> {
  const { rows } = await sql<PostRow>`
    INSERT INTO posts (title, description, category, image_url, author_name, author_avatar_url)
    VALUES (${input.title}, ${input.description}, ${input.category}, ${input.imageUrl}, ${input.authorName}, ${input.authorAvatarUrl})
    RETURNING id, title, description, category, image_url, author_name, author_avatar_url, created_at, views_count, likes_count
  `;
  return rowToPost(rows[0]);
}

export async function incrementPostViews(id: number): Promise<number> {
  const { rows } = await sql<{ views_count: number }>`
    UPDATE posts SET views_count = views_count + 1 WHERE id = ${id}
    RETURNING views_count
  `;
  return rows[0].views_count;
}

export async function adjustPostLikes(id: number, delta: 1 | -1): Promise<number> {
  const { rows } = await sql<{ likes_count: number }>`
    UPDATE posts SET likes_count = GREATEST(likes_count + ${delta}, 0) WHERE id = ${id}
    RETURNING likes_count
  `;
  return rows[0].likes_count;
}
