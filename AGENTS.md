# Frontend

- Start at [docs/README.md](docs/README.md), then use `docs/workPlan.md` and `docs/workDone.md`; validate parity against current Vue/Django source.
- Reuse shared controls, tokens and measured shell geometry. Preserve Arabic/English, RTL, keyboard/focus, reduced motion, themes/density and existing lazy-font behavior. Coordinate theme keys/palettes with backend PDF exports.
- Guard duplicate writes and stale reads; preserve drafts/selections on failure. Reconcile uncertain mutations without automatic replay. Distinguish source checks from browser/accessibility/print verification.
- Read [Agents.md](Agents.md) for detailed policies, review scope and explicit build/suite/migration restrictions.
- Support matching post-fix clients only; inspect current Vue contracts and do not change frontend application code without explicit authorization. See [compatibility policy](Agents.md).
- Complete implementation before requesting milestone approval for internal Android/Python/Vue test-file work or execution. Explicitly state coverage and commands; builds/compilation/packaging remain separately gated. Reuse approval within its scope; avoid recurring/watch-mode/token-intensive verification. See [milestone test approval](Agents.md#milestone-test-approval).
