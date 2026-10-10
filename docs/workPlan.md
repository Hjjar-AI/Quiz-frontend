# Vue remaining work

Updated 2026-10-10. [Current source status](workDone.md) · [Project map](../../Android/docs/README.md).

The seven rescan and eight deeper-review findings are source-complete. Do not reopen historical unchecked items without tracing current production source. Add new defects with reproduction, affected clients/contracts and priority.

## Pending verification

- Verify multiple-file import in the browser against the running backend: DSM-5 CSV/JSON chapters, Arabic/RTL, picker/drop, retained queue on tab changes, partial/lost responses and the configured 10-import-requests/hour throttle. Source and focused component checks do not establish live import behavior.

- Expand behavioral coverage beyond the [passing 931-test frontend suite](verification/frontendTests.md), particularly question authoring, ordinary/master session controllers and administration workflows. Current measured line/branch coverage is 43.01%/23.73%; the requested suite update and full run are complete.
- Prepare/verify matching [schema and coordinated clients](../../backend/docs/contracts/schemaReadiness.md); no readiness is inferred from source or database deletion.
- Execute the [shared functional matrix](../../Android/docs/verification/manualVerification.md), especially lost responses, account/attempt switches, receipts, permissions, revisions, imports/parent locking and planner late/midnight evidence.
- Check browser lifecycle/polling, conflict controls, Arabic/English/RTL, themes/fonts/density/reduced motion, responsive keyboard/screen-reader behavior, file exports and proxy/CSRF startup. Use the visual checklist.

Builds, suites, migrations/setup, destructive operator actions and versions follow [explicit-request policies](../Agents.md). Current source checks do not establish compilation, HTTP, schema or runtime concurrency.

## 2026-10-10 parity-review follow-up

All seven native gaps, smaller workflow differences and shared web defects from the [latest parity review](../../Android/docs/archive/reviews/2026-10-10-androidParityReview.md) are source-complete. Verify the dedicated account set-state route, partial/unknown batch outcomes, clock-read ownership and the shared manual matrix after matching rollout. Old servers reject the new route without changing account state. Earlier completed fixes remain complete.

## Optional case translations

Frontend case-translation editor and shared display support are source-complete. Verify the matching backend/schema, independent saves, actual case permissions, stale account/target reads, response-loss review, original fallback and Arabic/English rendering using the [visual checklist](verification/visual-qa-checklist.md). No build/browser verification has been performed. [Shared contract](../../backend/docs/contracts/caseTranslations.md).
