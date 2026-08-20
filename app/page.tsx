import { getPosts } from '@/lib/posts';
import { Feed } from './components/Feed';

// The feed must reflect the database on every request: posts can change outside
// the app (direct DB edits), which revalidatePath in the server actions misses.
export const dynamic = 'force-dynamic';

export default async function HomePage() {
  let posts: Awaited<ReturnType<typeof getPosts>> = [];
  let loadError = false;

  try {
    posts = await getPosts();
  } catch (error: unknown) {
    console.error('Failed to load posts for feed', error);
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
