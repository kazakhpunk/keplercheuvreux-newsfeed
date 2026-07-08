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
