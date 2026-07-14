import type { Post } from '@/lib/posts';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function PostCard({ post, onSelect }: { post: Post; onSelect: (post: Post) => void }) {
  return (
    <article
      className="post-card"
      role="button"
      tabIndex={0}
      onClick={() => onSelect(post)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(post);
        }
      }}
    >
      <img src={post.imageUrl} alt={post.title} className="post-card-image" />
      <div className="post-card-body">
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
      </div>
    </article>
  );
}
