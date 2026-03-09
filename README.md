# tech-mantra-judging-system## Tech Mantra Judging System (Base Scaffold)

Web platform for managing technical competition judging where **admins create events** and **judges score participants**.

### Architecture (current)

- **Next.js 14 App Router**: routes live under `app/`.
- **UI**: TailwindCSS, with small reusable UI primitives in `components/`.
- **Auth**: Supabase Auth (browser client for now) via `lib/supabaseClient.ts`.
- **API**: placeholder route handlers under `app/api/*` (Next.js Route Handlers).
- **Types**: app-level domain types in `types/models.ts`.

### Local setup

1) Copy env template and fill values:

```bash
cp .env.local.example .env.local
```

Set:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2) Install and run:

```bash
npm install
npm run dev
```

### Routes

- `GET /` redirects to `GET /login`
- `GET /login` basic Supabase Auth login (Admin/Judge selection is a placeholder)
- `GET /admin` Admin dashboard placeholder (events/judges/participants)
- `GET /judge` Judge dashboard placeholder (assignments/scores)

### API placeholders

- `GET/POST /api/events`
- `GET/POST /api/participants`
- `GET/POST /api/judges`
- `GET/POST /api/scores`
