# Frontend

- Start at [docs/README.md](docs/README.md), then use `docs/workPlan.md` and `docs/workDone.md`; validate parity against current Vue/Django source.
- Reuse shared controls, tokens and measured shell geometry. Preserve Arabic/English, RTL, keyboard/focus, reduced motion, themes/density and existing lazy-font behavior. Coordinate theme keys/palettes with backend PDF exports.
- Guard duplicate writes and stale reads; preserve drafts/selections on failure. Reconcile uncertain mutations without automatic replay. Distinguish source checks from browser/accessibility/print verification.
- Read [Agents.md](Agents.md) for detailed policies, review scope and explicit build/suite/migration restrictions.
- Ask the user and receive explicit confirmation before running any build, compilation or packaging command, or extensive tests (including full suites, broad integration/end-to-end runs, or other long-running/resource-heavy checks). State the proposed command and scope before asking; a general implementation/fix request is not confirmation. Reuse confirmation already granted for that scope.
