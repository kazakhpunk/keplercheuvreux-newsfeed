'use client';

import { useRouter } from 'next/navigation';
import { AddPostForm } from './AddPostForm';

export default function AddPostPage() {
  const router = useRouter();

  return (
    <main className="add-page">
      <h1>Add a post</h1>
      <AddPostForm onSuccess={() => router.push('/')} />
    </main>
  );
}
