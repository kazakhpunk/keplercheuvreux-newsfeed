import { sql } from '@vercel/postgres';

async function main() {
  await sql`
    ALTER TABLE posts
      ADD COLUMN IF NOT EXISTS views_count INTEGER NOT NULL DEFAULT 0,
      ADD COLUMN IF NOT EXISTS likes_count INTEGER NOT NULL DEFAULT 0
  `;
  console.log('engagement columns ready');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
