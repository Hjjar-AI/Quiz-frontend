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
  exclude test directories and test-named files from source-content searches.
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
- Select the development API/media proxy through `VITE_BACKEND_PROXY_TARGET`; avoid
  machine-specific committed hosts. Keep backend port, browser origin and CSRF
  settings aligned; see the [startup guide](../backend/docs/START_HERE.md).
