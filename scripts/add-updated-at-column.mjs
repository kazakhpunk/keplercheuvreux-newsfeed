import { sql } from '@vercel/postgres';

async function main() {
  await sql`
    ALTER TABLE posts
      ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
  `;
  console.log('updated_at column ready');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
