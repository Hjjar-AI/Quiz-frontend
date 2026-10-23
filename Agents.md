# Frontend Agent Instructions

## Working rules

- Start at [documentation index](docs/README.md). Read applicable instructions and [workPlan](docs/workPlan.md)/[workDone](docs/workDone.md)
  first; inspect current production source and the working tree. Preserve unrelated
  edits and existing authorization; do not commit unless requested.
- Only matching post-fix Android, Vue and backend versions require support, including when revisiting earlier fixes. Do not add or retain old-client/version fallbacks solely for backward compatibility. Check the current Vue callers before changing shared contracts; do not modify frontend application code unless explicitly authorized. Existing stored data, drafts and recovery are separate concerns and must not be discarded under this policy.
- Trace affected contracts and callers before making focused corrections. Do not
  invent endpoints, permissions, idempotency or verification evidence.
- No migration inspection/changes/setup without an explicit request. Supplied logs
  and user-run builds authorize source troubleshooting, not agent-run builds or
  tests. No version changes unless requested. Production study/exam modules are
  application source; exclude suites and migration directories from production searches.
- Internal test-file work and execution follow the milestone approval rules below.
- Lightweight production-source/XML/AST/whitespace checks are allowed. State their
  scope; source completion does not establish compilation, HTTP/device behavior,
  accessibility, deployed schema or database concurrency.
- Reviews must trace reachable controls, DTOs/serializers, gates/ownership, retained
  state and failure/recovery paths across affected clients. Endpoint inventories and
  old Markdown alone are insufficient. Distinguish shared client defects, native
  omissions, backend limits and deployment/runtime gates. Report prioritized findings
  with source evidence; completing a bounded list does not prove full parity.
- Keep remaining work in the plan and completed work/checks/limits in the log.
  Compact stale records with linked archives; keep supporting Markdown in `docs/`
  and root instructions discoverable. Preserve intentional policies when compacting.
- Continue authorized work; ask only for missing decisions. Communicate concise
  findings and limits in English unless requested otherwise. If a visible five-hour
  allowance reaches 20% remaining, finish the current step and stop; never infer usage.
- `features/testCommon`, `assets/testing.css` and related session modules are
  production study/exam code, not automated suites.

## Milestone test approval

- Finish the authorized implementation and lightweight source checks first. At the end of each implementation milestone, propose the smallest useful internal test scope (Android, Python or Vue) and ask for explicit permission to inspect/create/enhance test files and/or run tests, stating the intended coverage and exact run command. Reuse explicit authorization already granted for that milestone and scope; do not treat it as permission for later milestones or broader suites.
- New Android test files are allowed with the same milestone approval as Python/Vue files. A specific user instruction to create or enhance tests authorizes that file work; running them still requires authorization for the proposed command/scope. Continue independent implementation while approval is pending.
- Builds, compilation and packaging require explicit confirmation of their commands/scope, including compilation triggered by a test command. A general implementation request is not confirmation. Migration inspection/changes/setup and version changes still require explicit task authorization.
- Do not start recurring/watch-mode tests, automatic rerun loops, recurring background agent work or other repeated token/resource-intensive checks. Run approved checks once; repeat only after a relevant change, failure or unresolved issue justifies it within the approved scope. Reuse results and keep large output in a local log; report only the result and useful failure context.
- Before an approved build or resource-heavy test run, check active builds/test runners and available memory. Avoid concurrent heavy runs; never stop unrelated processes or clear caches to make room. Check for leftover task-owned runners when finishing; do not leave recurring work running.
- Documentation-only changes need source/link/whitespace checks, not suites. Report source checks, automated tests, compilation and device/browser/live-HTTP verification separately.

## Frontend invariants

- Preserve Vue service/store/component/localization patterns and existing API-client,
  notification and download helpers; avoid parallel implementations.
- Treat backend envelopes/endpoints/capabilities as authoritative. Check production
  contracts in `../backend` when changing payloads, filters or error handling.
- Do not modify Android unless the task explicitly includes it.
- Preserve CSRF/session handling, localized server errors and download filenames.
  Keep readable content/drafts on failure and guard repeated/conflicting writes.
- Busy guards/optimistic rollback do not reconcile lost write responses. A repeated
  toggle can reverse success and a repeated create can duplicate it; read current
  state or supported receipts before permitting another uncertain write. Preserve
  safe structured errors and confirmed success when a follow-up read fails.
- Refresh affected cached selectors and authenticated profile/capabilities after
  relevant confirmed writes or safe re-entry; preserve drafts and active sessions.
- Check Arabic/English text, RTL, keyboard/accessibility and responsive behavior.
  Follow [UI conventions](docs/guides/UI_CONVENTIONS.md), [themes](docs/guides/theme-guidelines.md)
  and the [visual checklist](docs/verification/visual-qa-checklist.md) for relevant UI work.
- Keep palette, geometry, stacking and motion values in shared tokens. Measure
  resizable shell surfaces instead of copying fixed offsets into CSS or JavaScript.
- Theme additions/renames must update the palette, shared registry, pre-paint bootstrap,
  icon, both locale labels and matching PDF palette. Preserve legacy-name aliases;
  follow the linked theme guide for contrast and intentional theme-aware printing.
- Font choice stays browser-local. Register only selected font styles lazily from the
  CDN; do not preload text fonts or add local-server fallback. Device-font mode must
  make no text-font requests; use each family's supported weight query.
- Keep startup independent of optional configuration requests. Bound requests, give
  long exports suitable limits, share identical pending writes without cancelling
  the first, and apply list responses only while their request still owns the view.
- Preserve drafts and pending files after partial saves; retry only the failed stage.
  Omit unchanged account-expiry/renewal fields instead of resending computed defaults.
- Format animated numbers at the target precision, clamp animation progress, respect
  reduced motion and clean up frames/listeners/timers. Keep coarse-pointer targets
  at least 44px; shrink visual clutter without shrinking those targets.
- Select the development API/media proxy through `VITE_BACKEND_PROXY_TARGET`; avoid
  machine-specific committed hosts. Keep backend port, browser origin and CSRF
  settings aligned; see the [startup guide](../backend/docs/guides/START_HERE.md).
