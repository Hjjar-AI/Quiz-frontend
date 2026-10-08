# Work Plan

## Current priorities

- Address the eight findings in [frontendShellReview.md](frontendShellReview.md): mobile Analytics access, desktop toggle cascade, actual navbar height, offline banner stacking, table-container sticky offsets, modal focus visibility, undefined knowledge font token and reversed spacing tiers. Application corrections remain pending.
- Browser-verify shell/container behavior at 320/360/480/640/768/769/900px and desktop, both locales/densities, touch pointers, long content, dialogs/keyboard/safe areas, every theme and print. Standalone source/jsdom checks do not establish rendering.

1. Keep frontend export options aligned with the backend request serializer.
2. Surface backend PDF limit errors clearly without replacing their localized messages.
3. Perform a browser download smoke check after the backend PDF runtime is available.
4. Keep theme and locale parameters synchronized with new visual themes or supported languages.
5. Verify PDF mode/answer-placement controls and downloads in both locales: default inline, linked end/after-25, quiz forced no-answers, clear/reset, verified-only API, limits/errors. Check actual PDF links/page breaks and print density on the matching backend; source/HTML checks do not establish viewer behavior.
6. Browser-check manual PDF/Excel/CSV/JSON search/pagination, case/image previews, retained selections, reordering, empty-selection disabling across formats, source switching, unavailable-ID errors and file ordering/PDF numbering in both locales. Script/service checks passed; matching frontend/backend required.

## Verification

- Lint needs installed dependencies; builds additionally require explicit user permission under [Agents.md](../Agents.md).
- Do not inspect or run test suites unless explicitly requested.

## Development startup verification

- With Node and dependencies installed, load the Vite config and verify API/media proxying to ports 5004/5005, occupied-port errors, and matching CSRF browser origins.
