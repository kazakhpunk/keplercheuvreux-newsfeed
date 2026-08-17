import { sql } from '@vercel/postgres';

/**
 * Images and categories are no longer required. The category column is kept
 * (merely made nullable) rather than dropped so existing values survive and
 * the change stays reversible — the app simply stops reading or writing it.
 */
async function main() {
  await sql`ALTER TABLE posts ALTER COLUMN image_url DROP NOT NULL`;
  await sql`ALTER TABLE posts ALTER COLUMN category DROP NOT NULL`;
  console.log('image_url and category are now optional');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
