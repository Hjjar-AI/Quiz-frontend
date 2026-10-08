# Work Plan

## Current priorities

- Browser-verify the completed tokenization corrections in `frontendShellReview.md`: reduced-motion theme switching, live modal-tier token overrides, and measured bottom-nav clearance under larger typography/safe areas. Source contracts and Python calculations passed; Node/JavaScript runtime and actual browser/device verification remain unavailable in this shell.

- Browser-verify the completed shared-control corrections in `frontendShellReview.md`: single disabled dimming, enlarged numeric/markdown touch targets, narrow number-field wrapping and unified modal-close sizing. Forty-eight isolated CSS/jsdom assertions passed; actual device/layout verification remains pending.

- Browser-verify the completed additional visual corrections and intentional theme-aware print enhancement in `frontendShellReview.md`: selected theme/language rows, LTR/RTL select arrows, pagination touch sizing, paper accents/borders and full table printing. All 55 semantic screen seeds are preserved; source print contrast calculations passed. Actual print pagination/background retention remains pending.

- Browser-verify the eight completed corrections in [frontendShellReview.md](frontendShellReview.md): mobile Analytics access, desktop toggle cascade, measured navbar/banner offsets, table-container sticky behavior, modal focus/nesting and normalized tokens. Forty isolated assertions passed; Vue lint needs recovery from the installed parser's `Invalid Version: main` error without changing configured versions.
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
