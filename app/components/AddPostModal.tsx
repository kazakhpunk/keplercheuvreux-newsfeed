'use client';

import { AddPostForm } from '../add/AddPostForm';

export function AddPostModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="modal-close" aria-label="Close" onClick={onClose}>
          ×
        </button>
        <h2>Add a post</h2>
        <AddPostForm onSuccess={onClose} />
      </div>
    </div>
  );
}
