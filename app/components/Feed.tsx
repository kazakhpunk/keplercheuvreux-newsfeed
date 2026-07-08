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
