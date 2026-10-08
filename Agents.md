# Frontend Agent Instructions

## Working rules

- Read applicable parent/local agent instructions, [workPlan](docs/workPlan.md) and
  [workDone](docs/workDone.md); check the working tree and affected folders first.
- Trace related production code and callers before fixing a defect; keep models,
  services, permissions, configuration and client contracts consistent. Prefer
  critical, focused corrections that address the cause and preserve existing behavior.
- Preserve unrelated/current user edits. Do not commit unless requested. Continue
  authorized work without repeated confirmation; ask only for missing decisions.
- Do not inspect, review, edit or create migration files without an explicit migration
  request. Fresh-project/model edits do not authorize migration work.
- Do not inspect, review or run test suites without an explicit test-work request;
  exclude automated-test directories and suite files from source-content searches.
  Production study/exam code (`features/testCommon`, `assets/testing.css` and related
  session modules) is application source, not an automated test suite.
- Do not run Gradle, builds, compilation or packaging without explicit permission;
  supplied logs or user-run builds are not authorization. Change versions only
  when explicitly requested.
- Simple scripts and source/XML/AST/whitespace checks are allowed. Report their
  actual scope; do not claim builds, runtime/device checks or database concurrency.
- If known five-hour usage reaches 20% remaining, finish the bounded step and stop.
- Keep root README/Agents files discoverable; supporting Markdown belongs in `docs/`.
  Update links when moving docs. Record remaining work in the plan and completed
  portions/limits in the work log; keep implementation separate from verification.
- Communicate concisely in English unless asked otherwise; state changes and limits.

## Frontend invariants

- Preserve Vue service/store/component/localization patterns and existing API-client,
  notification and download helpers; avoid parallel implementations.
- Treat backend envelopes/endpoints/capabilities as authoritative. Check production
  contracts in `../backend` when changing payloads, filters or error handling.
- Do not modify Android unless the task explicitly includes it.
- Preserve CSRF/session handling, localized server errors and download filenames.
  Keep readable content/drafts on failure and guard repeated/conflicting writes.
- Check Arabic/English text, RTL, keyboard/accessibility and responsive behavior.
  Follow [UI conventions](docs/UI_CONVENTIONS.md), [themes](docs/theme-guidelines.md)
  and the [visual checklist](docs/visual-qa-checklist.md) for relevant UI work.
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
  settings aligned; see the [startup guide](../backend/docs/START_HERE.md).
