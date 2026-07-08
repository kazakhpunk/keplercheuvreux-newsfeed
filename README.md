# News Feed

A dark-navy, slider-style news feed built with Next.js, Vercel Postgres, and Vercel Blob — designed to be embedded via iframe into a SharePoint page's Embed web part.

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env.local` and fill in the values (see "Provisioning" below):
   ```bash
   cp .env.example .env.local
   ```
3. Create the `posts` table:
   ```bash
   npm run db:init
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```
5. Add a post at `http://localhost:3000/add`; view the feed at `http://localhost:3000/`.

## Provisioning on Vercel

1. Create a new Vercel project from this repository.
2. Provision storage for the project:
   - **Postgres**: Vercel Postgres is now provisioned as a Neon-backed database through the **Vercel Marketplace** rather than the old Storage tab. From the project, go to the **Storage** tab, select **Marketplace Database Providers**, and add a **Neon** (Postgres) integration. The `@vercel/postgres` SDK and `POSTGRES_URL` env var still work the same way against the Neon-backed database — only the provisioning UI path changed.
   - **Blob**: In the project's Storage tab, create a **Blob** store.
   - Either flow adds `POSTGRES_URL` and `BLOB_READ_WRITE_TOKEN` to the project's environment variables automatically.
3. Install the Vercel CLI and link this local checkout to the project (skip if already linked):
   ```bash
   npm i -g vercel && vercel link
   ```
4. Pull those variables locally so `npm run db:init` can use them:
   ```bash
   vercel env pull .env.local
   ```
5. Run `npm run db:init` once to create the `posts` table in the deployed database.
6. Deploy:
   ```bash
   vercel deploy --prod
   ```

## Embedding in SharePoint

1. On the SharePoint page, add an **Embed** web part below (or in place of) the native News web part.
2. Paste the deployed URL (e.g. `https://<project>.vercel.app`) into the "Website address or embed code" field.
3. Toggle "Resize to fit the page" on if you want the iframe to match the page width.
4. Republish the page.

## Adding posts

Visit `/add` on the deployed site. No login is required — anyone with the link can submit a post (title, description, category, author name, optional author avatar, and a required image). New posts appear at the top of the feed immediately.
