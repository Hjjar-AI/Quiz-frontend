# Frontend remaining work

Updated 2026-10-09. Detailed previous checks/priorities: [archive](archive/2026-10-09-workPlan.md). Current native comparison: [Android source review](../../Android/docs/functionalityReview.md).

- Browser/screen-reader verify [accessibility corrections](accessibilityReview.md): explicit answer submission/confidence focus, pending-write/navigation guards, route context, timed warnings, chart alternatives/toasts/reduced motion and targets.
- Verify [shell/control corrections](frontendShellReview.md): measured chrome/safe areas, sticky tables/modal focus, RTL arrows, selected states, long content and reduced-motion theme switching.
- Verify Arabic/English, all themes (including Ruby), fonts/lazy loading/CDN failures, density, narrow/large text, count-up precision, study/master navigation and Settings/Preferences dirty/save/discard behavior.
- Verify startup/timeouts/stale reads/repeated writes, editor/image recovery, expiry refresh and API errors against running backend.
- Verify custom PDF/Excel/CSV/JSON selections, reorder/order retention, filters/verified-only/errors/downloads; fresh PDF links/answer placement/quiz/front matter and print pagination on matching backend.
- Verify Vite/API/media proxy ports, occupied ports and CSRF origins in the real development environment. Historical parser/dependency limitations need rechecking before lint; no dependency/version change is authorized.

This source comparison found Android gaps, not a new Vue implementation defect. Browser/HTTP/print checks remain separate from source checks. No suites/builds/compilation/packaging or migrations without explicit request; preserve user edits.
