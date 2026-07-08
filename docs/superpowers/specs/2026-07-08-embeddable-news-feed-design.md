# Embeddable News Feed — Design

## Purpose

A small standalone website that mimics the look of the SharePoint "News" web part (dark navy cards: image, category tag, title, description, author, date), meant to be embedded via iframe into a SharePoint page's Embed web part. Posts are added through a comfortable web form and stored in a real database, rather than being managed through SharePoint's native news authoring.

## Non-goals

- No authentication/login system (add access is open — anyone with the `/add` link can post).
- No view-count tracking.
- No editing or deleting posts from the UI (out of scope for v1; can be added later if needed).
- No image editing/cropping — uploaded image is used as-is.

## Architecture

Single Next.js (App Router) project deployed on Vercel:

- **Vercel Postgres** — stores post records.
- **Vercel Blob** — stores uploaded images, returns a public CDN URL saved on the post row.
- One deploy target (`https://<project>.vercel.app`) — this URL is what gets pasted into the SharePoint Embed web part's "Website address or embed code" field.

Rejected alternatives:
- Separate frontend/backend (e.g. Vite + Express) — unnecessary extra deploy + CORS setup for a project this size.
- Static site + serverless functions only — file uploads and form handling are more awkward without a real app backend.

## Data model

Single `posts` table:

| column | type | notes |
|---|---|---|
| `id` | serial / uuid PK | |
| `title` | text, required | |
| `description` | text, required | short body/snippet shown on the card |
| `category` | text, required | shown as a pill badge over the image, e.g. "News" |
| `image_url` | text, required | Vercel Blob URL |
| `author_name` | text, required | |
| `author_avatar_url` | text, optional | falls back to a generic avatar placeholder if absent |
| `created_at` | timestamp, default now() | displayed as the post date |

## Pages

### `/` — the feed (embed target)

- Full-bleed dark navy (`#0a2540`-ish) background, white text — visually matched to the SharePoint News card style.
- **Slider** layout: one post card at a time, prev/next arrow controls, dot indicators for position.
- Each card shows: image (with category pill badge top-left), title, description, author avatar + name, formatted date.
- Posts ordered newest first.
- Empty state: "No posts yet" message when the table has zero rows.
- Layout designed to render cleanly at typical iframe embed widths/heights (tested at common SharePoint embed dimensions).

### `/add` — add a post

- Plain form, no auth: title, description, category, author name, optional author avatar (file or skip), image upload (required).
- Client-side + server-side validation: required fields present, image is an actual image file under a sane size limit (e.g. 5MB).
- On submit: image uploads to Vercel Blob, row inserted into Postgres, redirect to `/` on success.
- On failure (bad file, DB error): inline error message on the form, no redirect, form values preserved.

## Error handling

- `/add`: validation errors shown inline next to the relevant field; upload/DB failures shown as a single form-level error banner.
- `/`: DB read failure shows a generic "couldn't load the feed" message rather than crashing; empty result set shows the empty state above.

## Testing

- Unit tests for the post-insert server action (validation edge cases: missing fields, oversized/non-image file).
- Basic integration test for `/add` → `/` flow (submit a post, confirm it appears in the feed).
- Manual visual check of `/` at common iframe embed widths before calling it done.

## Open items for implementation planning

None — scope above is intentionally minimal for v1. Editing/deleting posts and simple spam protection (e.g. a shared password gate) are natural v2 additions if needed later, but are explicitly out of scope now.
