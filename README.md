# Mukhtabir Frontend

Vue single-page application for Mukhtabir, a bilingual Arabic/English question
bank, study, examination, and administration platform. The frontend consumes the
Django API in `../backend` and is also built into a static bundle that the backend
can serve in production.

## Main capabilities

- Session authentication, password changes, expiry handling, and capability-aware navigation.
- Question browsing, authoring, review, verification, tags, ratings, bookmarks,
  images, cases, translations, and knowledge objects.
- Exam, study, and recall modes with resumable sessions, confidence/reflection,
  navigation, timers, and detailed results.
- Master-exam composition, lifecycle management, attempts, acknowledgement, and reports.
- Planner, spaced repetition, mistakes, fragile knowledge, streaks, activity,
  groups, leaderboards, analytics, and history.
- User, permission, taxonomy, group, blueprint, flag, settings, import/export,
  backup, and database administration.
- Arabic RTL and English LTR layouts, themes, responsive UI, Markdown, and local fonts.

## Technology

Vue 3, Vite, Pinia, Vue Router, Vue I18n, Axios, Chart.js, Markdown-It,
DOMPurify, and pnpm. Exact versions are pinned in `package.json` and
`pnpm-lock.yaml`.

## Prerequisites

- A Node.js version supported by the Vite release in `package.json`
- Corepack or pnpm (the expected pnpm release is declared in `package.json`)
- A running Mukhtabir backend for authenticated/API functionality

## Local development

```bash
corepack enable
pnpm install
pnpm dev
```

The dev server listens on `http://localhost:5173`. `/api` requests are proxied to
`http://127.0.0.1:5004`, matching the backend SQLite launcher default.

To select another API origin, create an uncommitted `.env`:

```dotenv
VITE_API_BASE_URL=https://example.test/api/v1
```

The value may include or omit a trailing slash. When omitted, the app uses the
same-origin `/api/v1` path.

## Commands

```bash
pnpm dev            # development server
pnpm build          # production bundle in dist/
pnpm preview        # preview the production bundle
pnpm lint           # ESLint with automatic fixes
pnpm format         # Prettier formatting
```

Test commands also exist in `package.json`; follow `Agents.md` before using them.

## Structure

```text
src/
├── assets/          Global styles, tokens, layouts, fonts, and feature CSS
├── components/      Reusable base, common, layout, chart, and Markdown UI
├── composables/     Shared Vue composition logic
├── features/        Route-oriented feature modules and views
├── i18n/            Arabic/English messages, content, and direction helpers
├── router/          Routes and authentication/capability guards
├── services/        API-facing services and the shared Axios client
├── stores/          Pinia state stores
├── utils/           Validation, formatting, import/export, and content helpers
├── App.vue          Application shell
└── main.js          Application bootstrap
```

Configured components and Vue/Pinia/router/i18n APIs are auto-imported. `@`
resolves to `src/`.

## API and authentication

Endpoint definitions live in `src/services/api/endpoints.js`. Feature services
wrap them, while Pinia stores manage UI state and request lifecycles.

The shared API client sends session cookies, acquires/caches Django CSRF tokens,
retries a mutation once after a genuine CSRF rejection, cancels duplicate
mutations, unwraps the standard API envelope, handles session expiry, and decodes
JSON errors returned as download blobs.

Use the shared client for ordinary requests. Reuse `src/utils/downloadFile.js` for
downloads so filenames and object-URL cleanup remain consistent.

## Localization, direction, and themes

Arabic is the default locale; English is the fallback. Locale, direction, theme,
and density are applied before first paint to prevent visual flashes.

When adding a theme, keep these synchronized:

- `src/utils/constants.js`
- theme token blocks under `src/assets/`
- the bootstrap theme registry in `index.html`
- backend PDF theme tokens when exported documents should match

User-facing additions should normally include Arabic and English messages.

## Imports and exports

The admin UI supports flat Excel/CSV/JSON/PDF exports and portable question-bank
state packages. PDF options use a structured POST body so titles and front matter
do not enter URLs. Portable state is the lossless transfer/backup format; flat
formats are intended mainly for review and editing.

## Production

```bash
pnpm build
```

The output is written to `dist/`. Django can serve it with history fallback, or a
separate static host can serve it. For a separate origin, coordinate
`VITE_API_BASE_URL`, backend CORS/CSRF origins, HTTPS, and cookie settings.

## Troubleshooting

- **Wrong API server:** check `VITE_API_BASE_URL` or the Vite proxy target.
- **CSRF failure:** align frontend/backend hosts, trusted origins, cookies, and HTTPS.
- **Repeated expiry:** do not combine secure cookies with plain HTTP development.
- **Route 404 after deployment:** route unknown non-API paths to `index.html`.
- **Offline font/icon failure:** retain the local files under `public/`.
- **Install failure:** verify registry access and the declared pnpm version.

## Working documents

- `Agents.md` — local contributor constraints
- `workPlan.md` — current planned work
- `workDone.md` — completed work log
- `docs/theme-guidelines.md` — visual theme guidance
- `docs/visual-qa-checklist.md` — manual visual verification

