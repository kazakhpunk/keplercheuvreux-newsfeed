import type { Post } from '@/lib/posts';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function PostDetailModal({ post, onClose }: { post: Post; onClose: () => void }) {
  return (
    <div className="post-modal-overlay" onClick={onClose}>
      <div className="post-modal-dialog" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="post-modal-close" aria-label="Close" onClick={onClose}>
          ×
        </button>
        <img src={post.imageUrl} alt={post.title} className="post-modal-image" />
        <div className="post-modal-body">
          <span className="post-modal-tag">{post.category}</span>
          <h2 className="post-modal-title">{post.title}</h2>
          <p className="post-modal-description">{post.description}</p>
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
        </div>
      </div>
    </div>
  );
}
