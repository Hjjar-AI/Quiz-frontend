# Work Done

## 2026-10-06

- Reviewed the frontend model usage and its backend API contracts.
- Reviewed the PDF export request and download flow.
- PDF preserves CSRF/localized errors, attachment names, themes/locales/filters/optional front matter.
- Model/PDF reliability fixes required only backend changes.
- Added the project-root working documentation files.
- Added README: setup/architecture/API/localization/exports/production/troubleshooting.

## Configurable development startup — 2026-10-08

- Added `VITE_BACKEND_PROXY_TARGET`, media proxying and strict frontend port; default HTTP 5004. Switching documented in README and backend/docs/START_HERE.md.
- Static source/whitespace review only; Node is absent, so Vite config loading and browser login/media integration remain pending. No builds, compilation, dependency installs, test-suite work or configured version changes were performed.

## Documentation organization and agent guidance — 2026-10-08

- Kept README/Agents at the project root; moved supporting Markdown into `docs/` and added a documentation index. Preserved work history and pending checks.
- Updated relative links and compacted agent guidance around related-code review, explicit work restrictions, portable configuration and honest verification limits.
- Checked documentation targets, moved content and whitespace; no builds, test-suite or migration work, dependency/version changes or runtime changes were performed.

- Documentation compaction: retained commands, technical literals, dates, headings/links and checklist states; consolidated repeated prose/verification scope. Documentation/whitespace checks only.
