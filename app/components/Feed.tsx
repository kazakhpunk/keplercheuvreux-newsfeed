'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Post } from '@/lib/posts';
import { AddPostModal } from './AddPostModal';
import { PostCard } from './PostCard';

export function Feed({ posts }: { posts: Post[] }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const router = useRouter();

  function handleAddSuccess() {
    setIsAddOpen(false);
    router.refresh();
  }

  return (
    <div className="feed-list-wrap">
      <button
        type="button"
        className="feed-add-button"
        onClick={() => setIsAddOpen(true)}
      >
        + Add news
      </button>

      <div className="feed-list">
        {posts.map((post) => (
          <PostCard post={post} key={post.id} />
        ))}
      </div>

      {isAddOpen && <AddPostModal onClose={handleAddSuccess} />}
    </div>
  );
}
