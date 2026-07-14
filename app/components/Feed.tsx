'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Post } from '@/lib/posts';
import { nextIndex, prevIndex, clampIndex } from '@/lib/slider';
import { AddPostModal } from './AddPostModal';
import { PostCard } from './PostCard';

export function Feed({ posts }: { posts: Post[] }) {
  const [index, setIndex] = useState(() => clampIndex(0, posts.length));
  const [isAddOpen, setIsAddOpen] = useState(false);
  const router = useRouter();

  function handleAddSuccess() {
    setIsAddOpen(false);
    router.refresh();
  }

  return (
    <div className="feed-slider">
      <button
        type="button"
        className="feed-add-button"
        onClick={() => setIsAddOpen(true)}
      >
        + Add news
      </button>

      <button
        type="button"
        aria-label="Previous post"
        className="feed-arrow feed-arrow-prev"
        onClick={() => setIndex((value) => prevIndex(value, posts.length))}
      >
        ‹
      </button>

      <div className="feed-viewport">
        <div className="feed-track" style={{ transform: `translateX(-${index * 100}%)` }}>
          {posts.map((post) => (
            <div className="feed-slide" key={post.id}>
              <PostCard post={post} />
            </div>
          ))}
        </div>
      </div>

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

      {isAddOpen && (
        <AddPostModal onClose={handleAddSuccess} />
      )}
    </div>
  );
}
