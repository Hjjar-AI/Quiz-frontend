# Frontend remaining work

Updated 2026-10-09. Detailed previous checks/priorities: [archive](archive/2026-10-09-workPlan.md). Current native comparison: [Android source review](../../Android/docs/functionalityReview.md).

- Verify Permissions role/user controls for tests.download_full_bank: localized description, individual Allow/Deny/Inherit and saved grant/revocation applied by Android permission refresh.
- Browser/screen-reader verify [accessibility corrections](accessibilityReview.md): explicit answer submission/confidence focus, pending-write/navigation guards, route context, timed warnings, chart alternatives/toasts/reduced motion and targets.
- Verify [shell/control corrections](frontendShellReview.md): measured chrome/safe areas, sticky tables/modal focus, RTL arrows, selected states, long content and reduced-motion theme switching.
- Verify Arabic/English, all themes (including Ruby), fonts/lazy loading/CDN failures, density, narrow/large text, count-up precision, study/master navigation and Settings/Preferences dirty/save/discard behavior.
- Verify startup/timeouts/stale reads/repeated writes, editor/image recovery, expiry refresh and API errors against running backend.
- Verify custom PDF/Excel/CSV/JSON selections, reorder/order retention, filters/verified-only/errors/downloads; fresh PDF links/answer placement/quiz/front matter and print pagination on matching backend.
- Verify web System settings connection-file download/import on Android, custom phone addresses/deployment prefixes, permission revocation and bilingual/RTL validation; export must preserve runtime-settings drafts.
- Verify Vite/API/media proxy ports, occupied ports and CSRF origins in the real development environment. Historical parser/dependency limitations need rechecking before lint; no dependency/version change is authorized.

This source comparison found Android gaps, not a new Vue implementation defect. Browser/HTTP/print checks remain separate from source checks. No suites/builds/compilation/packaging or migrations without explicit request; preserve user edits.

## 2026-10-09 learning review integration

Updated study setup with coverage/balanced/review choices; event-based activity descriptions and distinct/due/mastery metrics; explicit bookmark intent and caller-scoped create/duplicate receipts with read reconciliation and explicit identical retries; archived master weighted scores; retained revision payloads. Unknown create text/image intent stays frozen until reconciliation, with account/server-scoped pending identities persisted separately from sensitive draft text/images. See [backend policies and fresh-schema requirements](../../backend/docs/learningConsistency.md).

JS/extracted Vue script syntax, locale JSON and CRLF-aware whitespace source checks only; no Vue compilation/browser/HTTP/accessibility verification, builds, suites, migrations, database actions, deployment or versions. Verify response loss, pending resets/account switches, revision conflicts, strategy payloads, activity dates/metrics, archived results and bilingual/RTL controls after coordinated rollout.

Verify the matching category/case/tag/settings revisions and browser operation-identity restart recovery; see [work log](workDone.md). Restored create checks must never apply fresh text/images to the earlier result.

## 2026-10-09 project rescan follow-up

The [new source review](../../Android/docs/projectRescan.md) identifies seven additional bounded gaps: web account-generation guards; orphan pending-create/form association; transactional question ownership checks; knowledge-delete revisions; terminal/deleted receipt recovery; web conflict resolution; learner case pagination/read retention. All seven are now addressed in source; remaining checks are runtime release gates.

The seven rescan findings are source-complete. Validate coordinated DELETE/receipt contracts, account-switch cancellation, conflict review, orphan-save recovery and learner paging; see the latest [work log](workDone.md).
