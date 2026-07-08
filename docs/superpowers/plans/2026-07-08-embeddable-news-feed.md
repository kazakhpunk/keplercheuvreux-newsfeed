# Embeddable News Feed Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone Next.js site — a dark-navy slider news feed with a comfortable add-post form — that can be embedded via iframe into the SharePoint Embed web part.

**Architecture:** Single Next.js (App Router) project deployed on Vercel. Vercel Postgres stores post rows; Vercel Blob stores uploaded images/avatars. `/` renders the public slider feed (embed target); `/add` is an open (no-auth) form that uploads an image and inserts a post via a server action.

**Tech Stack:** Next.js 14 (App Router, TypeScript), React 18, `@vercel/postgres`, `@vercel/blob`, Vitest for unit/integration tests.

## Global Constraints

- No authentication/login anywhere — `/add` is open to anyone with the link.
- No view-count tracking, no edit/delete UI (v1 scope per spec).
- Posts table columns: `id`, `title`, `description`, `category`, `image_url`, `author_name`, `author_avatar_url` (nullable), `created_at`.
- Image upload is required per post; author avatar upload is optional (falls back to a placeholder).
- Image validation: must be PNG/JPEG/WEBP/GIF, max 5MB.
- Feed layout is a **slider** (one card at a time, prev/next arrows, dot indicators) — not a stacked list.
- Card visual style: dark navy background (`#0a2540`-ish), white text, category pill badge over the image, author avatar + name + date.
- `/` must handle a DB read failure (generic error message) and an empty table (`"No posts yet."`) without crashing.
- Node >=20.6.0 required (uses `node --env-file` and the global `File` API in tests).
- Deployment target is Vercel; the resulting URL is what gets pasted into the SharePoint Embed web part.

---

### Task 1: Project Scaffold & Tooling

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.mjs`
- Create: `next-env.d.ts`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `vitest.config.ts`
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `app/page.tsx` (temporary placeholder — replaced fully in Task 4)

**Interfaces:**
- Consumes: nothing (first task).
- Produces: a buildable Next.js project; npm scripts `dev`, `build`, `start`, `test`, `db:init`; path alias `@/*` → project root (used by every later task's imports).

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "news-feed",
  "version": "0.1.0",
  "private": true,
  "engines": {
    "node": ">=20.6.0"
  },
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "test": "vitest run",
    "db:init": "node --env-file=.env.local scripts/init-db.mjs"
  },
  "dependencies": {
    "@vercel/blob": "^0.27.0",
    "@vercel/postgres": "^0.10.0",
    "next": "14.2.15",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/node": "^20.14.9",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.5.3",
    "vitest": "^2.1.1"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Create `next.config.mjs`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {};

export default nextConfig;
```

- [ ] **Step 4: Create `next-env.d.ts`**

```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.
```

- [ ] **Step 5: Create `.gitignore`**

```
node_modules
.next
.env.local
.env*.local
*.log
```

- [ ] **Step 6: Create `.env.example`**

```
POSTGRES_URL=
BLOB_READ_WRITE_TOKEN=
```

- [ ] **Step 7: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
```

- [ ] **Step 8: Create `app/globals.css`**

```css
* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
```

- [ ] **Step 9: Create `app/layout.tsx`**

```tsx
import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'News Feed',
  description: 'Embeddable news feed',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 10: Create `app/page.tsx` (placeholder, replaced in Task 4)**

```tsx
export default function HomePage() {
  return <main>News feed coming soon.</main>;
}
```

- [ ] **Step 11: Install dependencies**

Run: `npm install`
Expected: installs without error, creates `node_modules` and `package-lock.json`.

- [ ] **Step 12: Verify the project builds**

Run: `npm run build`
Expected: ends with "Compiled successfully" and lists `/` as a generated route.

- [ ] **Step 13: Commit**

```bash
git add package.json package-lock.json tsconfig.json next.config.mjs next-env.d.ts .gitignore .env.example vitest.config.ts app/globals.css app/layout.tsx app/page.tsx
git commit -m "chore: scaffold Next.js project"
```

---

### Task 2: Database Layer

**Files:**
- Create: `lib/posts.ts`
- Create: `scripts/init-db.mjs`
- Test: `tests/posts.test.ts`

**Interfaces:**
- Consumes: `@vercel/postgres` `sql` tagged-template client.
- Produces: `Post` type `{ id: number; title: string; description: string; category: string; imageUrl: string; authorName: string; authorAvatarUrl: string | null; createdAt: string }`; `NewPost` type (same shape minus `id`/`createdAt`); `getPosts(): Promise<Post[]>`; `createPost(input: NewPost): Promise<Post>`; `rowToPost(row: PostRow): Post` (exported for testing). Later tasks (4, 5) import `Post`, `NewPost`, `getPosts`, `createPost` from `@/lib/posts`.

- [ ] **Step 1: Write the failing test**

Create `tests/posts.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { rowToPost } from '@/lib/posts';

describe('rowToPost', () => {
  it('maps a database row into a Post with camelCase fields', () => {
    const row = {
      id: 1,
      title: 'Hello',
      description: 'World',
      category: 'News',
      image_url: 'https://example.com/image.png',
      author_name: 'Jane Doe',
      author_avatar_url: null,
      created_at: '2026-07-08T00:00:00.000Z',
    };

    const post = rowToPost(row);

    expect(post).toEqual({
      id: 1,
      title: 'Hello',
      description: 'World',
      category: 'News',
      imageUrl: 'https://example.com/image.png',
      authorName: 'Jane Doe',
      authorAvatarUrl: null,
      createdAt: '2026-07-08T00:00:00.000Z',
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/posts.test.ts`
Expected: FAIL — cannot resolve `@/lib/posts` (module does not exist yet).

- [ ] **Step 3: Write `lib/posts.ts`**

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/posts.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Create `scripts/init-db.mjs`**

```js
import { sql } from '@vercel/postgres';

async function main() {
  await sql`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      image_url TEXT NOT NULL,
      author_name TEXT NOT NULL,
      author_avatar_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log('posts table ready');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
```

- [ ] **Step 6: Commit**

```bash
git add lib/posts.ts scripts/init-db.mjs tests/posts.test.ts
git commit -m "feat: add posts database layer"
```

---

### Task 3: Validation Logic

**Files:**
- Create: `lib/validation.ts`
- Test: `tests/validation.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `validatePostFields(input: { title: string; description: string; category: string; authorName: string }): Partial<Record<'title' | 'description' | 'category' | 'authorName' | 'image' | 'form', string>>`; `validateImageFile(file: { type: string; size: number } | null): string | null`. Task 5's `app/add/actions.ts` imports both from `@/lib/validation`.

- [ ] **Step 1: Write the failing test**

Create `tests/validation.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { validatePostFields, validateImageFile } from '@/lib/validation';

describe('validatePostFields', () => {
  it('returns no errors when all fields are filled in', () => {
    const errors = validatePostFields({
      title: 'Title',
      description: 'Description',
      category: 'News',
      authorName: 'Jane Doe',
    });

    expect(errors).toEqual({});
  });

  it('flags missing or blank fields', () => {
    const errors = validatePostFields({
      title: '',
      description: '   ',
      category: 'News',
      authorName: 'Jane Doe',
    });

    expect(errors.title).toBe('Title is required.');
    expect(errors.description).toBe('Description is required.');
    expect(errors.category).toBeUndefined();
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/validation.test.ts`
Expected: FAIL — cannot resolve `@/lib/validation`.

- [ ] **Step 3: Write `lib/validation.ts`**

```ts
export type PostFieldErrors = Partial<
  Record<'title' | 'description' | 'category' | 'authorName' | 'image' | 'form', string>
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/validation.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/validation.ts tests/validation.test.ts
git commit -m "feat: add post validation logic"
```

---

### Task 4: Feed UI (Slider, Post Card, Home Page)

**Files:**
- Create: `lib/slider.ts`
- Test: `tests/slider.test.ts`
- Create: `app/components/PostCard.tsx`
- Create: `app/components/Feed.tsx`
- Modify: `app/page.tsx` (replace Task 1 placeholder)
- Modify: `app/globals.css` (append feed styles)
- Create: `public/default-avatar.svg`

**Interfaces:**
- Consumes: `Post` type and `getPosts` from `@/lib/posts` (Task 2).
- Produces: `nextIndex(current: number, length: number): number`, `prevIndex(current: number, length: number): number`, `clampIndex(index: number, length: number): number` from `@/lib/slider`; `<Feed posts={Post[]} />` and `<PostCard post={Post} />` components; CSS classes `feed-page`, `feed-message`, `feed-slider`, `post-card*`, `feed-arrow*`, `feed-dot*`.

- [ ] **Step 1: Write the failing test**

Create `tests/slider.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { nextIndex, prevIndex, clampIndex } from '@/lib/slider';

describe('nextIndex', () => {
  it('advances to the next index', () => {
    expect(nextIndex(0, 3)).toBe(1);
  });

  it('wraps around from the last index to the first', () => {
    expect(nextIndex(2, 3)).toBe(0);
  });

  it('returns 0 when there are no items', () => {
    expect(nextIndex(0, 0)).toBe(0);
  });
});

describe('prevIndex', () => {
  it('moves to the previous index', () => {
    expect(prevIndex(1, 3)).toBe(0);
  });

  it('wraps around from the first index to the last', () => {
    expect(prevIndex(0, 3)).toBe(2);
  });

  it('returns 0 when there are no items', () => {
    expect(prevIndex(0, 0)).toBe(0);
  });
});

describe('clampIndex', () => {
  it('clamps a negative index to 0', () => {
    expect(clampIndex(-1, 3)).toBe(0);
  });

  it('clamps an index past the end to the last item', () => {
    expect(clampIndex(5, 3)).toBe(2);
  });

  it('returns 0 when there are no items', () => {
    expect(clampIndex(0, 0)).toBe(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/slider.test.ts`
Expected: FAIL — cannot resolve `@/lib/slider`.

- [ ] **Step 3: Write `lib/slider.ts`**

```ts
export function nextIndex(current: number, length: number): number {
  if (length === 0) return 0;
  return (current + 1) % length;
}

export function prevIndex(current: number, length: number): number {
  if (length === 0) return 0;
  return (current - 1 + length) % length;
}

export function clampIndex(index: number, length: number): number {
  if (length === 0) return 0;
  if (index < 0) return 0;
  if (index > length - 1) return length - 1;
  return index;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/slider.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Create `public/default-avatar.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" width="40" height="40">
  <circle cx="20" cy="20" r="20" fill="#1e3a5f" />
  <circle cx="20" cy="16" r="7" fill="#9fb8d4" />
  <path d="M6 36c1.5-8 8-12 14-12s12.5 4 14 12" fill="#9fb8d4" />
</svg>
```

- [ ] **Step 6: Create `app/components/PostCard.tsx`**

```tsx
import type { Post } from '@/lib/posts';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function PostCard({ post }: { post: Post }) {
  return (
    <article className="post-card">
      <div className="post-card-image-wrap">
        <img src={post.imageUrl} alt="" className="post-card-image" />
        <span className="post-card-tag">{post.category}</span>
      </div>
      <h2 className="post-card-title">{post.title}</h2>
      <p className="post-card-description">{post.description}</p>
      <div className="post-card-author">
        <img
          src={post.authorAvatarUrl ?? '/default-avatar.svg'}
          alt=""
          className="post-card-avatar"
        />
        <div>
          <div className="post-card-author-name">{post.authorName}</div>
          <div className="post-card-date">{formatDate(post.createdAt)}</div>
        </div>
      </div>
    </article>
  );
}
```

- [ ] **Step 7: Create `app/components/Feed.tsx`**

```tsx
'use client';

import { useState } from 'react';
import type { Post } from '@/lib/posts';
import { nextIndex, prevIndex, clampIndex } from '@/lib/slider';
import { PostCard } from './PostCard';

export function Feed({ posts }: { posts: Post[] }) {
  const [index, setIndex] = useState(() => clampIndex(0, posts.length));
  const current = posts[index];

  return (
    <div className="feed-slider">
      <button
        type="button"
        aria-label="Previous post"
        className="feed-arrow feed-arrow-prev"
        onClick={() => setIndex((value) => prevIndex(value, posts.length))}
      >
        ‹
      </button>

      <PostCard post={current} />

      <button
        type="button"
        aria-label="Next post"
        className="feed-arrow feed-arrow-next"
        onClick={() => setIndex((value) => nextIndex(value, posts.length))}
      >
        ›
      </button>

      <div className="feed-dots">
        {posts.map((post, dotIndex) => (
          <button
            key={post.id}
            type="button"
            aria-label={`Go to post ${dotIndex + 1}`}
            className={dotIndex === index ? 'feed-dot feed-dot-active' : 'feed-dot'}
            onClick={() => setIndex(dotIndex)}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 8: Replace `app/page.tsx`**

```tsx
import { getPosts } from '@/lib/posts';
import { Feed } from './components/Feed';

export default async function HomePage() {
  let posts: Awaited<ReturnType<typeof getPosts>> = [];
  let loadError = false;

  try {
    posts = await getPosts();
  } catch (error) {
    loadError = true;
  }

  if (loadError) {
    return (
      <main className="feed-page">
        <p className="feed-message">Couldn&apos;t load the feed right now.</p>
      </main>
    );
  }

  if (posts.length === 0) {
    return (
      <main className="feed-page">
        <p className="feed-message">No posts yet.</p>
      </main>
    );
  }

  return (
    <main className="feed-page">
      <Feed posts={posts} />
    </main>
  );
}
```

- [ ] **Step 9: Append feed styles to `app/globals.css`**

Add to the end of `app/globals.css`:

```css
.feed-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a2540;
  color: #ffffff;
  padding: 24px;
}

.feed-message {
  font-size: 1.1rem;
  opacity: 0.85;
}

.feed-slider {
  position: relative;
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.post-card {
  width: 100%;
  background: #0a2540;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  overflow: hidden;
}

.post-card-image-wrap {
  position: relative;
}

.post-card-image {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
}

.post-card-tag {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(10, 37, 64, 0.85);
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
}

.post-card-title {
  margin: 16px 16px 8px;
  font-size: 1.25rem;
}

.post-card-description {
  margin: 0 16px 16px;
  font-size: 0.9rem;
  opacity: 0.85;
  line-height: 1.4;
}

.post-card-author {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 16px 16px;
}

.post-card-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.post-card-author-name {
  font-size: 0.85rem;
  font-weight: 600;
}

.post-card-date {
  font-size: 0.75rem;
  opacity: 0.7;
}

.feed-arrow {
  position: absolute;
  top: 40%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #ffffff;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
}

.feed-arrow-prev {
  left: -8px;
}

.feed-arrow-next {
  right: -8px;
}

.feed-dots {
  display: flex;
  gap: 8px;
}

.feed-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  padding: 0;
}

.feed-dot-active {
  background: #ffffff;
}
```

- [ ] **Step 10: Run all tests and verify the build**

Run: `npm test && npm run build`
Expected: all Vitest tests pass; build completes with "Compiled successfully" and lists `/` as a route.

- [ ] **Step 11: Commit**

```bash
git add lib/slider.ts tests/slider.test.ts app/components/PostCard.tsx app/components/Feed.tsx app/page.tsx app/globals.css public/default-avatar.svg
git commit -m "feat: add slider feed UI"
```

---

### Task 5: Add-Post Server Action

**Files:**
- Create: `app/add/actions.ts`
- Test: `tests/actions.test.ts`

**Interfaces:**
- Consumes: `validatePostFields`, `validateImageFile` from `@/lib/validation` (Task 3); `createPost` from `@/lib/posts` (Task 2); `put` from `@vercel/blob`.
- Produces: `AddPostState` type `{ success: boolean; errors: Record<string, string>; values: { title: string; description: string; category: string; authorName: string } }`; `initialAddPostState: AddPostState`; `addPost(prevState: AddPostState, formData: FormData): Promise<AddPostState>`. Task 6's `app/add/page.tsx` imports `addPost` and `initialAddPostState` from `./actions`.

- [ ] **Step 1: Write the failing test**

Create `tests/actions.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const putMock = vi.fn();
const createPostMock = vi.fn();

vi.mock('@vercel/blob', () => ({
  put: (...args: unknown[]) => putMock(...args),
}));

vi.mock('@/lib/posts', () => ({
  createPost: (...args: unknown[]) => createPostMock(...args),
}));

import { addPost, initialAddPostState } from '@/app/add/actions';

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tests/actions.test.ts`
Expected: FAIL — cannot resolve `@/app/add/actions`.

- [ ] **Step 3: Write `app/add/actions.ts`**

```ts
'use server';

import { put } from '@vercel/blob';
import { createPost } from '@/lib/posts';
import { validatePostFields, validateImageFile } from '@/lib/validation';

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

  if (Object.keys(fieldErrors).length > 0) {
    return { success: false, errors: fieldErrors, values };
  }

  try {
    const uploadedImage = await put(`posts/${Date.now()}-${image!.name}`, image!, {
      access: 'public',
    });

    let avatarUrl: string | null = null;
    if (avatar) {
      const uploadedAvatar = await put(`avatars/${Date.now()}-${avatar.name}`, avatar, {
        access: 'public',
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

    return { success: true, errors: {}, values: initialAddPostState.values };
  } catch (error) {
    return {
      success: false,
      errors: { form: 'Something went wrong saving your post. Please try again.' },
      values,
    };
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tests/actions.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add app/add/actions.ts tests/actions.test.ts
git commit -m "feat: add post-creation server action"
```

---

### Task 6: Add-Post Form Page

**Files:**
- Create: `app/add/page.tsx`
- Modify: `app/globals.css` (append form styles)

**Interfaces:**
- Consumes: `addPost`, `initialAddPostState`, `AddPostState` from `./actions` (Task 5).
- Produces: the `/add` route. No new exports consumed by other tasks.

- [ ] **Step 1: Create `app/add/page.tsx`**

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { useRouter } from 'next/navigation';
import { addPost, initialAddPostState } from './actions';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="add-form-submit" disabled={pending}>
      {pending ? 'Posting…' : 'Add post'}
    </button>
  );
}

export default function AddPostPage() {
  const [state, formAction] = useFormState(addPost, initialAddPostState);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      router.push('/');
    }
  }, [state.success, router]);

  return (
    <main className="add-page">
      <h1>Add a post</h1>
      <form ref={formRef} action={formAction} className="add-form">
        {state.errors.form && <p className="add-form-error">{state.errors.form}</p>}

        <label className="add-form-field">
          Title
          <input name="title" type="text" defaultValue={state.values.title} />
          {state.errors.title && <span className="add-form-error">{state.errors.title}</span>}
        </label>

        <label className="add-form-field">
          Description
          <textarea name="description" defaultValue={state.values.description} />
          {state.errors.description && (
            <span className="add-form-error">{state.errors.description}</span>
          )}
        </label>

        <label className="add-form-field">
          Category
          <input name="category" type="text" defaultValue={state.values.category} />
          {state.errors.category && (
            <span className="add-form-error">{state.errors.category}</span>
          )}
        </label>

        <label className="add-form-field">
          Author name
          <input name="authorName" type="text" defaultValue={state.values.authorName} />
          {state.errors.authorName && (
            <span className="add-form-error">{state.errors.authorName}</span>
          )}
        </label>

        <label className="add-form-field">
          Author avatar (optional)
          <input name="authorAvatar" type="file" accept="image/*" />
        </label>

        <label className="add-form-field">
          Image
          <input name="image" type="file" accept="image/*" />
          {state.errors.image && <span className="add-form-error">{state.errors.image}</span>}
        </label>

        <SubmitButton />
      </form>
    </main>
  );
}
```

- [ ] **Step 2: Append form styles to `app/globals.css`**

Add to the end of `app/globals.css`:

```css
.add-page {
  min-height: 100vh;
  background: #0a2540;
  color: #ffffff;
  padding: 32px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.add-form {
  width: 100%;
  max-width: 480px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.add-form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.9rem;
}

.add-form-field input,
.add-form-field textarea {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  font-size: 0.95rem;
}

.add-form-field textarea {
  min-height: 100px;
  resize: vertical;
}

.add-form-error {
  color: #ff9b9b;
  font-size: 0.8rem;
}

.add-form-submit {
  padding: 12px 16px;
  border-radius: 8px;
  border: none;
  background: #ffffff;
  color: #0a2540;
  font-weight: 600;
  cursor: pointer;
}

.add-form-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
```

- [ ] **Step 3: Verify the build**

Run: `npm run build`
Expected: build completes with "Compiled successfully" and lists both `/` and `/add` as routes.

- [ ] **Step 4: Commit**

```bash
git add app/add/page.tsx app/globals.css
git commit -m "feat: add post-submission form page"
```

---

### Task 7: README & Deployment Wiring

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: nothing (documentation only).
- Produces: nothing consumed by code; final verification that the full test suite and build pass together.

- [ ] **Step 1: Create `README.md`**

```markdown
# News Feed

A dark-navy, slider-style news feed built with Next.js, Vercel Postgres, and Vercel Blob — designed to be embedded via iframe into a SharePoint page's Embed web part.

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in the values (see "Provisioning" below):
   ```bash
   cp .env.example .env.local
   ```
3. Create the `posts` table:
   ```bash
   npm run db:init
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```
5. Add a post at `http://localhost:3000/add`; view the feed at `http://localhost:3000/`.

## Provisioning on Vercel

1. Create a new Vercel project from this repository.
2. In the project's Storage tab, create a **Postgres** database and a **Blob** store; Vercel adds `POSTGRES_URL` and `BLOB_READ_WRITE_TOKEN` to the project's environment variables automatically.
3. Pull those variables locally so `npm run db:init` can use them:
   ```bash
   vercel env pull .env.local
   ```
4. Run `npm run db:init` once to create the `posts` table in the deployed database.
5. Deploy:
   ```bash
   vercel deploy --prod
   ```

## Embedding in SharePoint

1. On the SharePoint page, add an **Embed** web part below (or in place of) the native News web part.
2. Paste the deployed URL (e.g. `https://<project>.vercel.app`) into the "Website address or embed code" field.
3. Toggle "Resize to fit the page" on if you want the iframe to match the page width.
4. Republish the page.

## Adding posts

Visit `/add` on the deployed site. No login is required — anyone with the link can submit a post (title, description, category, author name, optional author avatar, and a required image). New posts appear at the top of the feed immediately.
```

- [ ] **Step 2: Run the full test suite and build**

Run: `npm test && npm run build`
Expected: all Vitest test files pass; build completes with "Compiled successfully" listing `/` and `/add`.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add setup, deployment, and embedding instructions"
```
