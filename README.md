# Mukhtabir Frontend

Arabic/English Vue SPA for Mukhtabir question bank/study/exam/admin; consumes Django in `../backend` and builds a backend-served production bundle.

## Main capabilities

- Session authentication, password changes, expiry handling, and capability-aware navigation.
- Question browsing, authoring, review, verification, tags, ratings, bookmarks, images, cases, translations, and knowledge objects.
- Exam, study, and recall modes with resumable sessions, confidence/reflection, navigation, timers, and detailed results.
- Master-exam composition, lifecycle management, attempts, acknowledgement, and reports.
- Planner, spaced repetition, mistakes, fragile knowledge, streaks, activity, groups, leaderboards, analytics, and history.
- User, permission, taxonomy, group, blueprint, flag, settings, import/export, backup, and database administration.
- Arabic RTL and English LTR layouts, themes, responsive UI, Markdown, and local fonts.

## Technology

Stack: Vue 3/Vite/Pinia/Router/I18n, Axios/Chart.js/Markdown-It/DOMPurify/pnpm. Pins: `package.json`, `pnpm-lock.yaml`.

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

The dev server listens on `http://localhost:5173`. `/api` requests are proxied to `http://127.0.0.1:5004`, matching the backend SQLite launcher default.

Other backend ports (e.g. MariaDB 5005): set `VITE_BACKEND_PROXY_TARGET=http://127.0.0.1:5005` in `.env.local`; restart `pnpm dev`. Proxy forwards `/api`/`/media`; leave `VITE_API_BASE_URL` unset or `/api/v1`. [Startup guide](../backend/docs/START_HERE.md): simultaneous instances/Termux. Occupied frontend ports fail; select `pnpm dev --port 5174`.

To select another API origin, create an uncommitted `.env`:

```dotenv
VITE_API_BASE_URL=https://example.test/api/v1
```

The value may include or omit a trailing slash. When omitted, the app uses the same-origin `/api/v1` path.

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

Configured components and Vue/Pinia/router/i18n APIs are auto-imported. `@` resolves to `src/`.

## API and authentication

Endpoint definitions live in `src/services/api/endpoints.js`. Feature services wrap them, while Pinia stores manage UI state and request lifecycles.

Shared client sends cookies, acquires/caches CSRF, retries mutation once after genuine CSRF rejection, cancels duplicate mutations, unwraps API envelopes, handles expiry and decodes download-blob JSON errors.

Use shared requests and `src/utils/downloadFile.js` for consistent filenames/object-URL cleanup.

## Localization, direction, and themes

Default Arabic, fallback English; locale/direction/theme/density apply before paint to prevent flashes.

When adding a theme, keep these synchronized:

- `src/utils/constants.js`
- theme token blocks under `src/assets/`
- the bootstrap theme registry in `index.html`
- backend PDF theme tokens when exported documents should match

User-facing additions should include Arabic and English messages.

## Imports and exports

Admin exports: flat Excel/CSV/JSON/PDF and portable state. PDF structured POST keeps titles/front matter out of URLs. Portable state is lossless transfer/backup; flat formats target review/editing.

## Production

```bash
pnpm build
```

Output: `dist/`; Django history fallback or separate static host. Separate origin requires aligned `VITE_API_BASE_URL`, CORS/CSRF, HTTPS/cookies.

## Troubleshooting

- **Wrong API server:** check `VITE_API_BASE_URL` or the Vite proxy target.
- **CSRF failure:** align frontend/backend hosts, trusted origins, cookies, and HTTPS.
- **Repeated expiry:** do not combine secure cookies with plain HTTP development.
- **Route 404 after deployment:** route unknown non-API paths to `index.html`.
- **Offline font/icon failure:** retain the local files under `public/`.
- **Install failure:** verify registry access and the declared pnpm version.

## Working documents

See the [documentation index](docs/README.md) for all supporting guides.

- [Agents.md](Agents.md) — local contributor constraints
- [workPlan.md](docs/workPlan.md) — current planned work
- [workDone.md](docs/workDone.md) — completed work log
- [theme-guidelines.md](docs/theme-guidelines.md) — visual theme guidance
- [visual-qa-checklist.md](docs/visual-qa-checklist.md) — manual visual verification
