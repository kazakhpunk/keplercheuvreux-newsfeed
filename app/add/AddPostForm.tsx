'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { addPost } from './actions';
import { initialAddPostState } from './state';
import { STOCK_IMAGES } from '@/lib/stockImages';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="add-form-submit" disabled={pending}>
      {pending ? 'Posting…' : 'Add post'}
    </button>
  );
}

export function AddPostForm({ onSuccess }: { onSuccess: () => void }) {
  const [state, formAction] = useActionState(addPost, initialAddPostState);
  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedStockUrl, setSelectedStockUrl] = useState<string | null>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setSelectedStockUrl(null);
      onSuccess();
    }
  }, [state.success, onSuccess]);

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
    <form ref={formRef} action={formAction} className="add-form">
      {state.errors.form && <p className="add-form-error">{state.errors.form}</p>}

      <label className="add-form-field">
        Title
        <input name="title" type="text" defaultValue={state.values.title} />
        {state.errors.title && <span className="add-form-error">{state.errors.title}</span>}
      </label>

      <label className="add-form-field">
        Description
        <textarea name="description" defaultValue={state.values.description} />
        {state.errors.description && (
          <span className="add-form-error">{state.errors.description}</span>
        )}
      </label>

      <label className="add-form-field">
        Category
        <input name="category" type="text" defaultValue={state.values.category} />
        {state.errors.category && <span className="add-form-error">{state.errors.category}</span>}
      </label>

      <label className="add-form-field">
        Author name
        <input name="authorName" type="text" defaultValue={state.values.authorName} />
        {state.errors.authorName && (
          <span className="add-form-error">{state.errors.authorName}</span>
        )}
      </label>

      <label className="add-form-field">
        Author avatar (optional)
        <input name="authorAvatar" type="file" accept="image/*" />
      </label>

      <div className="add-form-field">
        <span>Image</span>
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

      <SubmitButton />
    </form>
  );
}
