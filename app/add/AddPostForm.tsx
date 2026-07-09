'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { addPost } from './actions';
import { initialAddPostState } from './state';

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

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      onSuccess();
    }
  }, [state.success, onSuccess]);

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

      <label className="add-form-field">
        Image
        <input name="image" type="file" accept="image/*" />
        {state.errors.image && <span className="add-form-error">{state.errors.image}</span>}
      </label>

      <SubmitButton />
    </form>
  );
}
