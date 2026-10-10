# Vue remaining work

Updated 2026-10-10. [Current source status](workDone.md) · [Project map](../../Android/docs/README.md).

The seven rescan and eight deeper-review findings are source-complete. Do not reopen historical unchecked items without tracing current production source. Add new defects with reproduction, affected clients/contracts and priority.

## Pending verification

- Prepare/verify matching [schema and coordinated clients](../../backend/docs/contracts/schemaReadiness.md); no readiness is inferred from source or database deletion.
- Execute the [shared functional matrix](../../Android/docs/verification/manualVerification.md), especially lost responses, account/attempt switches, receipts, permissions, revisions, imports/parent locking and planner late/midnight evidence.
- Check browser lifecycle/polling, conflict controls, Arabic/English/RTL, themes/fonts/density/reduced motion, responsive keyboard/screen-reader behavior, file exports and proxy/CSRF startup. Use the visual checklist.

Builds, suites, migrations/setup, destructive operator actions and versions follow [explicit-request policies](../Agents.md). Current source checks do not establish compilation, HTTP, schema or runtime concurrency.
