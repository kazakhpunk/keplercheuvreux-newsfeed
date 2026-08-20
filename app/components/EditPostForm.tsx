'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import type { Post } from '@/lib/posts';
import { STOCK_IMAGES } from '@/lib/stockImages';
import { editPost } from '../actions/posts';
import { initialEditPostState } from '../actions/editPostState';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="add-form-submit" disabled={pending}>
      {pending ? 'Saving…' : 'Save changes'}
    </button>
  );
}

export function EditPostForm({
  post,
  onSaved,
  onCancel,
}: {
  post: Post;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [state, formAction] = useActionState(
    editPost.bind(null, post.id),
    initialEditPostState(post)
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedStockUrl, setSelectedStockUrl] = useState<string | null>(null);

  useEffect(() => {
    if (state.success) onSaved();
  }, [state.success, onSaved]);

  function handleStockSelect(url: string) {
    setSelectedStockUrl(url);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function handleFileChange() {
    if (fileInputRef.current?.files?.length) {
      setSelectedStockUrl(null);
    }
  }

  return (
    <form action={formAction} className="add-form">
      {state.errors.form && <p className="add-form-error">{state.errors.form}</p>}

      <label className="add-form-field">
        Title
        <input name="title" type="text" defaultValue={state.values.title} />
        {state.errors.title && <span className="add-form-error">{state.errors.title}</span>}
      </label>

      <label className="add-form-field">
        Content
        <textarea name="description" defaultValue={state.values.description} />
        <span className="add-form-hint">
          Markdown is supported: ## Heading, **bold**, - lists, [links](https://example.com),
          ![image](url).
        </span>
        {state.errors.description && (
          <span className="add-form-error">{state.errors.description}</span>
        )}
      </label>

      <label className="add-form-field">
        Author name
        <input name="authorName" type="text" defaultValue={state.values.authorName} />
        {state.errors.authorName && (
          <span className="add-form-error">{state.errors.authorName}</span>
        )}
      </label>

      <label className="add-form-field">
        Author avatar
        <input name="authorAvatar" type="file" accept="image/*" />
        <span className="add-form-hint">Leave empty to keep the current avatar</span>
        {state.errors.authorAvatar && (
          <span className="add-form-error">{state.errors.authorAvatar}</span>
        )}
      </label>

      <div className="add-form-field">
        <span>Image (optional)</span>
        <span className="add-form-hint">Leave everything untouched to keep the current image</span>
        <div className="stock-image-grid">
          {STOCK_IMAGES.map((image) => (
            <button
              key={image.id}
              type="button"
              className={
                selectedStockUrl === image.url
                  ? 'stock-image-option stock-image-option-selected'
                  : 'stock-image-option'
              }
              aria-pressed={selectedStockUrl === image.url}
              aria-label={image.label}
              onClick={() => handleStockSelect(image.url)}
            >
              <img src={image.thumbUrl} alt={image.label} loading="lazy" />
            </button>
          ))}
        </div>
        <input type="hidden" name="stockImageUrl" value={selectedStockUrl ?? ''} />

        <span className="add-form-hint">Or upload your own</span>
        <input
          ref={fileInputRef}
          name="image"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        {state.errors.image && <span className="add-form-error">{state.errors.image}</span>}
      </div>

      <div className="post-modal-form-actions">
        <button type="button" className="post-modal-button" onClick={onCancel}>
          Cancel
        </button>
        <SubmitButton />
      </div>
    </form>
  );
}
