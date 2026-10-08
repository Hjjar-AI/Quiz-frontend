# Accessibility recommendation review — 2026-10-08

Source review of the supplied 16-item list, followed by implementation. No rendered/browser,
screen-reader, build or automated-suite verification. Dependency versions remain unchanged.
The table describes the starting issues; implementation status follows below.

| Item | Assessment for the current app |
| --- | --- |
| 1. Escape finishes | `useTestNavigation` calls the shared controller's finish path. Deeper tracing found that the store already confirms when questions are unanswered; fully answered sessions have no confirmation. Remove this shortcut or confirm user-initiated finishing; preserve forced time-up/completion flows. BaseModal already stops Escape propagation when dismissable, but shortcuts lack a general modal-open guard. |
| 2. Radio arrows submit | `@change` submits immediately, and study/recall lock saved answers. However, answer and confidence radios have no shared `name`, so native grouped arrow navigation cannot be assumed. Establish named, labelled groups and separate selection from commitment in locking modes. Do not remove standard radio keyboard behavior. Digit shortcuts are window-wide outside editable controls; focus-scope, remap or provide an off switch. |
| 3. Leave guard | No runner leave guard was found. Progress is sent to server services; sessionStorage retains session identifiers. Store `resume()`/`restoreFullState()`, setup Resume and dashboard routing already exist. Check pending writes, reload/back, unsent recall text and timed-exam behavior before deciding where warnings are needed. |
| 4. Confidence focus | Confirmed: invisible radio inputs have no corresponding option focus ring. Add a token-based focus-visible treatment to the visible label. |
| 5. Route context | Main sets an app title; router guards do not set route titles or move focus. Router already has afterEach hooks. Add localized titles and deliberate focus after successful page navigation/render; avoid stealing focus for query-only changes or duplicating announcements. |
| 6. Timer | Countdown is not automatically announced; shared controller already notifies at exam time-up. Keep per-second updates quiet and add deduplicated, appropriate remaining-time announcements with textual warning states. The suggested 50%/5min/1min thresholds are product choices. |
| 7. Chart alternatives | Confirmed: canvas has no label/fallback; heatmap day details use nonfocusable title-only divs. Provide understandable summaries and equivalent values. A visible expandable data table/list also serves sighted keyboard/touch users. Hide the visual grid only once equivalent content exists. |
| 8. Motion | A global reduced-motion duration/iteration policy already exists in states.css. Extend its delay/scroll coverage; inspect animation-dependent visibility/completion and JavaScript/Chart.js animation separately. CSS alone is insufficient. |
| 9. Toasts | The store default is 4000ms, while useNotify already extends errors to 8000ms. No pause handlers exist, and polite/alert live-region semantics are nested. Repeated announcements are a risk, not a measured result. Use one intentional announcement strategy, pause while interacting, and retain actionable errors until dismissed/resolved. Eight seconds alone is not a general accessibility guarantee. |
| 10. Icons | Hide decorative icons and keep meaningful status icons understandable. Element counts do not prove actual spoken output. A wrapper is optional; targeted attributes can reuse existing components without a broad refactor. |
| 11. Small text | 0.55rem/0.6rem declarations exist; shared xs token also starts below 0.75rem. Improve readable shared typography and check Arabic/English, scaling and layout. A 0.75rem floor is a design choice, not a universal accessibility pass/fail threshold. |
| 12. Viewport height | Shell layout/app still use 100vh; auth already has 100dvh fallback. Consider svh versus dvh based on desired toolbar behavior and verify mobile keyboard/scrolling. |
| 13. Answer focus/selection | Choice wrapper lacks a focus ring; native radio supplies a non-color checked indicator. Improve wrapper focus without claiming selection is conveyed only by tint. |
| 14. Icon loading | Confirmed CDN-first CSS loader with 5000ms timeout/local fallback. Local-first is reasonable after confirming local CSS and font assets are complete. CSS load timeout does not establish a precise maximum glyph outage because font loading is separate. Preserve the project's independent text-font CDN policy. |
| 15. Targets | Audit remaining controls, but shared btn-icon already receives 44px coarse-pointer minima; question navigation also has coarse-pointer rules. Passive heatmap cells are not automatically interactive target-size failures. Equivalent day-detail access remains needed. |
| 16. Guardrails | ESLint and Stylelint config files exist, but package.json/lockfile contain no Stylelint dependency and no Stylelint script. Accessibility lint can help after pipeline repair. Blanket outline:none bans can flag legitimate replacement styles; automated axe checks cannot establish keyboard, RTL, contrast-theme or screen-reader correctness. Suite changes need explicit user authorization. |

Priority: prevent accidental finishing/locking; repair radio semantics and visible
focus; add route context and chart/day-detail alternatives; improve timed warnings,
toast interaction and motion. Then audit typography, loading and remaining targets.

Standards references: [radio keyboard behavior](https://www.w3.org/WAI/ARIA/apg/patterns/radio/),
[character shortcuts](https://www.w3.org/WAI/WCAG22/Understanding/character-key-shortcuts.html),
[target-size minimum and exceptions](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

## Implemented

- Removed Escape finishing and its shortcut hints/manual entries. Question shortcuts require focus inside the runner, ignore modified/repeated keys and native controls, and stop while any shared modal is open. Auto-advance pauses when a dialog opens. Preserved existing unanswered/forced finish contracts.
- Added named, labelled answer/confidence radio groups. Study/recall radio browsing now selects locally; Submit answer commits explicitly. Number shortcuts still commit deliberately, and saved answers cannot be replaced through that path. Keyboard submission moves focus to confidence once saving unlocks it. Exam answer changes remain editable and retain immediate saving.
- Added shared route/update/unload protection to study/exam and master-exam runners. Pending writes block route departure; explicit successful pause/finish exits without another warning. Saved-session restoration remains unchanged.
- Added translated titles for all 52 named routes. Focus follows rendered route changes to the heading, with a main-content/live-region fallback; query-only changes preserve focus. Path keys ensure parameter changes receive a fresh routed view. Added runner headings.
- Added deduplicated half-time/5min/1min milestones, readable timer warning/critical/overtime states, and time-up ownership that preserves existing exam/grace alerts. Resume establishes a baseline instead of replaying old milestones; grace countdown ticks no longer repeat its alert.
- Labelled chart canvases and provided expandable data tables, plus a keyboard-scrollable daily heatmap list equivalent to the hidden visual grid. Chart.js follows reduced motion; the global CSS policy also removes delays and smooth scrolling.
- Toast errors persist by default; other messages get 8 seconds. Independent hover/focus pauses retain remaining duration and survive duplicate notifications. Toast-level alert/status semantics replace nested live regions. Persistent/focused messages are retained, with bounded viewport scrolling.
- Hid 372 decorative icon elements across 93 components. Preserved the meaningful mastery status with an accessible label. Icons load locally; 11 compatibility names map to existing bundled glyphs, preserving stored category IDs without changing font versions.
- Raised tiny fixed sizes and the shared xs token to 0.75rem. Added choice/confidence focus and selected-weight affordances; shell dvh fallback; 24px fine-pointer number steppers/removal targets and 44px coarse-pointer coverage for remaining shared navigation/dropdown controls. Number steppers sit side by side; text warnings can wrap.
- Added focused ESLint rules for icon semantics and radio names, plus a dependency-free production CSS guard script wired into lint for tiny fixed text and undocumented outline removal. Did not add a Stylelint installation, new accessibility packages or automated-suite files; these guards cover the requested immediate regressions without dependency changes.

## Verification and remaining work

- Changed JavaScript/Vue/style sources parsed successfully; scoped ESLint reported no errors (existing warnings remain). Accessibility CSS guardrails pass across 60 production stylesheets.
- Isolated diagnostics executed production toast/countdown/shortcut helpers with controlled clocks, Vue refs and jsdom events. Persistent errors, independent pause reasons, remaining timeout, duplicates, cleanup, milestones/resume reset, focus scope, native inputs/buttons, modifiers/repeats, modal blocking, Escape removal and RTL arrows passed. These are helper checks, not rendered application verification.
- Confirmed both locale title/key coverage, local icon glyph/font availability and unchanged dependency versions/lockfile. Whitespace checks passed.
- Browser/screen-reader verification remains: study/recall draft/commit/failure and confidence focus; Back/reload/pause/finish with pending writes; route focus including parameter/query changes; timer resume/tab wake and grace handling; data alternatives; notification interaction/overflow; reduced motion; narrow/enlarged Arabic/English typography and targets across every theme/density.
- No builds, compilation, packaging, migrations, automated-suite inspection/execution, backend or Android changes.
