'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Post } from '@/lib/posts';
import { nextIndex, prevIndex, clampIndex } from '@/lib/slider';
import { AddPostModal } from './AddPostModal';
import { PostCard } from './PostCard';

const AUTOPLAY_INTERVAL_MS = 6000;

export function Feed({ posts }: { posts: Post[] }) {
  const [index, setIndex] = useState(() => clampIndex(0, posts.length));
  const [isAddOpen, setIsAddOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isAddOpen || posts.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((value) => nextIndex(value, posts.length));
    }, AUTOPLAY_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isAddOpen, posts.length]);

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
        disabled={isAddOpen}
        onClick={() => setIndex((value) => prevIndex(value, posts.length))}
      >
        ‹
      </button>

      <div className="feed-card-stage">
        <div className="feed-viewport">
          <div className="feed-track" style={{ transform: `translateX(-${index * 100}%)` }}>
            {posts.map((post) => (
              <div className="feed-slide" key={post.id}>
                <PostCard post={post} />
              </div>
            ))}
          </div>
        </div>

        {isAddOpen && <AddPostModal onClose={handleAddSuccess} />}
      </div>

      <button
        type="button"
        aria-label="Next post"
        className="feed-arrow feed-arrow-next"
        disabled={isAddOpen}
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
            disabled={isAddOpen}
            onClick={() => setIndex(dotIndex)}
          />
        ))}
      </div>
    </div>
  );
}
