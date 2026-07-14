'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Post } from '@/lib/posts';
import { AddPostForm } from '../add/AddPostForm';
import { PostCard } from './PostCard';
import { PostDetailModal } from './PostDetailModal';

export function Feed({ posts }: { posts: Post[] }) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const router = useRouter();

  function handleAddSuccess() {
    setIsAddOpen(false);
    router.refresh();
  }

  return (
    <div className="feed-list-wrap">
      <div className="feed-list">
        <h2 className="feed-list-title">Latest news</h2>

        <button
          type="button"
          className="feed-add-row"
          aria-expanded={isAddOpen}
          onClick={() => setIsAddOpen((value) => !value)}
        >
          <span className="feed-add-row-icon" aria-hidden="true">
            ›
          </span>
          {isAddOpen ? 'Cancel' : 'Add news'}
        </button>

        <div className={isAddOpen ? 'feed-add-panel feed-add-panel-open' : 'feed-add-panel'}>
          <div className="feed-add-panel-inner">
            <AddPostForm onSuccess={handleAddSuccess} />
          </div>
        </div>

        {posts.map((post) => (
          <PostCard post={post} key={post.id} onSelect={setSelectedPost} />
        ))}
      </div>

      {selectedPost && (
        <PostDetailModal post={selectedPost} onClose={() => setSelectedPost(null)} />
      )}
    </div>
  );
}
