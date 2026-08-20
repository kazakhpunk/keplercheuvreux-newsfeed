'use client';

import { useEffect, useRef, useState } from 'react';
import type { Post } from '@/lib/posts';
import { recordPostView } from '../actions/engagement';
import { deletePost } from '../actions/posts';
import { EditPostForm } from './EditPostForm';
import { Markdown } from './Markdown';
import { PostStats } from './PostStats';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function PostDetailModal({
  post,
  onClose,
  onChanged,
}: {
  post: Post;
  onClose: () => void;
  onChanged: () => void;
}) {
  const hasRecordedView = useRef(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (hasRecordedView.current) return;
    hasRecordedView.current = true;
    recordPostView(post.id);
  }, [post.id]);

  async function handleDelete() {
    setIsDeleting(true);
    setDeleteError(null);
    const result = await deletePost(post.id);
    if (result.success) {
      onChanged();
      onClose();
      return;
    }
    setIsDeleting(false);
    setDeleteError(result.error);
  }

  return (
    <div className="post-modal-overlay" onClick={onClose}>
      <div className="post-modal-dialog" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="post-modal-close" aria-label="Close" onClick={onClose}>
          ×
        </button>
        {post.imageUrl ? (
          <img src={post.imageUrl} alt={post.title} className="post-modal-image" />
        ) : (
          <div className="post-modal-image post-image-placeholder" aria-hidden="true" />
        )}
        <div className="post-modal-body">
          {isEditing ? (
            <>
              <h2 className="post-modal-title">Edit post</h2>
              <EditPostForm
                post={post}
                onSaved={() => {
                  setIsEditing(false);
                  onChanged();
                  onClose();
                }}
                onCancel={() => setIsEditing(false)}
              />
            </>
          ) : (
            <>
              <h2 className="post-modal-title">{post.title}</h2>
              <Markdown>{post.description}</Markdown>
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
              <PostStats
                postId={post.id}
                viewsCount={post.viewsCount + 1}
                likesCount={post.likesCount}
              />

              {deleteError && <p className="add-form-error">{deleteError}</p>}

              {isConfirmingDelete ? (
                <div className="post-modal-actions">
                  <span className="post-modal-confirm-text">Delete this post permanently?</span>
                  <button
                    type="button"
                    className="post-modal-button"
                    onClick={() => setIsConfirmingDelete(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="post-modal-button post-modal-button-danger"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    {isDeleting ? 'Deleting…' : 'Delete'}
                  </button>
                </div>
              ) : (
                <div className="post-modal-actions">
                  <button
                    type="button"
                    className="post-modal-button"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="post-modal-button post-modal-button-danger"
                    onClick={() => setIsConfirmingDelete(true)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
