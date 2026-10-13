# Vue remaining work

Updated 2026-10-10. [Current source status](workDone.md) · [Project map](../../Android/docs/README.md).

The seven rescan and eight deeper-review findings are source-complete. Do not reopen historical unchecked items without tracing current production source. Add new defects with reproduction, affected clients/contracts and priority.


Pending verification: co-attending choices include moderators/admins and members granted `master_exams.create`, omit users without that capability, and preserve selections through save/read failure on the current server.

## 2026-10-13 remaining presentation verification

- Verify richer tinted palettes, pre-paint/background/browser chrome, independent Onyx semantics, forms/focus/charts, all densities/RTL/large text and theme-aware print after coordinated PDF rollout. Dark/Midnight remain unchanged; source calculations do not establish browser/print contrast.

## Session parity implementation findings (2026-10-13 source review)

- P1: ordinary web answer/navigation writes omit backend `expected_index`/`expected_slot`. The controller rolls a failed answer back to its previous store value and re-enables controls without reading acknowledgement; every exam 409 triggers forced finish. Preserve the attempted draft, reconcile uncertain writes before another mutation, and coordinate machine-readable expiry/progress-conflict reasons with the backend (currently both share an undifferentiated 409).
- P1 enhancement: web service/store lacks owned-session prefetch and local downloaded study feedback. Any parity implementation must retain exam/recall reveal rules, explicit uncertain-write recovery, account-scoped browser storage policy and server deadlines; Android encrypted persistence is not automatically a browser storage authorization.
- P2: align setup with current Android all-bank default, optional book, shared category/tag filters and removable summaries. Current source clears source-specific selections on pool changes, requires book metadata even without chosen chips and automatically clamps typed counts when availability changes.
- P2 UI parity: active choice feedback labels/highlights and question bookmark; results All/Incorrect/Unanswered and unanswered metric; real-heading explanation links/opacity-only reveal; conditional stable image loading/Retry; compact measured-shell navigation/tools and fuller resume summary. Reuse existing score/progress/timer/Markdown/RTL components. Browser haptics are optional platform-specific follow-up, not a required backend compatibility fix.

Implementation has not started; this is a bounded source review, not an exhaustive parity claim. Existing availability/book-facet/merge/import updates are already present. The backend socket cleanup changes require no frontend API adjustment.

## Pending verification

- Verify category merge and direct tag merge controls after matching backend/client rollout: all source links, planner targets/progress, overlapping blueprint weights, editor revisions, receipt/review recovery, concurrent changes, Arabic/English/RTL and large text. Source checks passed; HTTP, browser/device, concurrency and compilation remain unverified.


- Verify backend-first full available counts and book-specific category/tag refinements on matching clients: >200 matching questions with the unchanged session cap, combined filters, changed/cleared books, read failure/Retry, rapid switches and saved setup. Source checks passed; compilation, template/browser/device and live API verification remain pending.

- Verify multiple-file import in the browser against the running backend: DSM-5 CSV/JSON chapters, Arabic/RTL, picker/drop, retained queue on tab changes, partial/lost responses and the normal hourly throttle/password-authorized ten-minute bypass. Source and focused component checks do not establish live import behavior.

- Expand behavioral coverage beyond the [passing 931-test frontend suite](verification/frontendTests.md), particularly question authoring, ordinary/master session controllers and administration workflows. Current measured line/branch coverage is 43.01%/23.73%; the requested suite update and full run are complete.
- Prepare/verify matching [schema and coordinated clients](../../backend/docs/contracts/schemaReadiness.md); no readiness is inferred from source or database deletion.
- Execute the [shared functional matrix](../../Android/docs/verification/manualVerification.md), especially lost responses, account/attempt switches, receipts, permissions, revisions, imports/parent locking and planner late/midnight evidence.
- Check browser lifecycle/polling, conflict controls, Arabic/English/RTL, themes/fonts/density/reduced motion, responsive keyboard/screen-reader behavior, file exports and proxy/CSRF startup. Use the visual checklist.

Builds, suites, migrations/setup, destructive operator actions and versions follow [explicit-request policies](../Agents.md). Current source checks do not establish compilation, HTTP, schema or runtime concurrency.

## 2026-10-10 parity-review follow-up

All seven native gaps, smaller workflow differences and shared web defects from the [latest parity review](../../Android/docs/archive/reviews/2026-10-10-androidParityReview.md) are source-complete. Verify the dedicated account set-state route, partial/unknown batch outcomes, clock-read ownership and the shared manual matrix after matching rollout. Old servers reject the new route without changing account state. Earlier completed fixes remain complete.

## Optional case translations

Frontend case-translation editor and shared display support are source-complete. Verify the matching backend/schema, independent saves, actual case permissions, stale account/target reads, response-loss review, original fallback and Arabic/English rendering using the [visual checklist](verification/visual-qa-checklist.md). No build/browser verification has been performed. [Shared contract](../../backend/docs/contracts/caseTranslations.md).
