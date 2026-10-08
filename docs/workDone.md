# Work Done

## Accessibility corrections — 2026-10-08

- Implemented the corrected 16-item review: safer session shortcuts/explicit study-recall commits and leave guards; named radio groups/focus; localized route titles/rendered focus; timed warnings; chart/heatmap alternatives; motion handling; persistent/paused toasts; decorative-icon semantics/local loading; readable shared text and remaining pointer geometry. Added focused ESLint/CSS guardrails without new dependencies. See [accessibilityReview.md](accessibilityReview.md) for scope and limitations.
- Source parsing/scoped ESLint passed with no errors; style guardrails passed across 60 production stylesheets. Isolated production-helper diagnostics passed for toast retention/pausing/dedup/cleanup, countdown milestones/resume reset and keyboard scope/modifiers/native controls/modal/RTL behavior. Both locale/title coverage and local glyph compatibility passed; configured versions/lockfile unchanged. Browser/device/screen-reader verification remains pending. No builds/compilation, test-suite work, migrations, backend or Android changes.

## Accessibility recommendation review — 2026-10-08

- Assessed the supplied 16 recommendations against production source and recorded corrections/priorities in [accessibilityReview.md](accessibilityReview.md). Confirmed Escape finish, immediate answer changes, confidence focus gaps, missing route context/chart alternatives and toast timing/semantics. Deeper implementation tracing found existing unanswered-finish confirmation, global reduced-motion CSS and 8-second error notifications.
- Corrected unsupported grouped-radio arrow behavior (missing names), existing server-backed resume paths, auth dvh/coarse-pointer sizing already present, time-up notifications and incomplete Stylelint wiring. Source/standards review only; browser/screen-reader behavior unverified. No application/dependency/version changes, builds, migrations or test-suite work.

## Agent guidance refresh — 2026-10-08

- Recorded durable frontend contracts for shared tokens/measured shell geometry, coordinated theme naming/PDF palettes, browser-local lazy fonts, bounded startup/requests, pending writes/latest reads, partial-save recovery, preserved account policies and safe animation/touch sizing. Clarified that production study/exam files are application sources while automated test-suite restrictions remain.
- Added matching PDF-theme coordination guidance to the backend agent file. Documentation/link/whitespace checks only; no application behavior, permission requirements or configured versions changed.

## Ruby theme naming — 2026-10-08

- Renamed the crimson palette to Ruby (ياقوت), updated canonical CSS/registry/boot/PDF keys and changed the picker icon to a diamond. Compatibility aliases migrate existing saved choices and export requests; the former name has no visible UI label. Palette values remain identical.
- Source checks passed for both canonical/legacy normalization, pre-paint theme/browser chrome, both locale labels, frontend/PDF registry agreement and scoped whitespace. Actual browser/PDF rendering remains pending. No builds, compilation, test suites, installs, versions or Android changes.

## Ruby theme — 2026-10-08

- Added `ruby` as a light palette with deep crimson accents, warm pale surfaces, contrasting status colors, chart seeds, streak/rank colors and tinted elevation shadows. Registered it in the theme/options/light-group lists, pre-paint allowlist/browser chrome, diamond icon and both locale labels. Preferences consumes the shared options automatically.
- Added matching backend PDF palette seeds/surfaces/text so exports preserve the selected theme. Existing theme blocks and default/automatic/dark behavior remain intact.
- 48 source-derived text/semantic/chart/print contrast pairs passed 4.5:1 (minimum 4.65:1); control boundary passed 3:1 at 3.84:1. Registry/group/preference/bootstrap/icon contracts, backend AST/palette matching, 176 settings/source checks, CSS parses/token references and scoped whitespace checks passed. Actual browser/device/PDF rendering remains pending. No builds, compilation, test suites, installs, version changes or Android edits; previous edits preserved.

## Count-up precision and overflow correction — 2026-10-08

- StatTile now formats animated values through locale-aware number formatting at the target's decimal precision. Integer counts no longer expose raw interpolated fractional strings; formatted percentages, times and leading-zero strings remain verbatim. Negative-zero frames normalize to zero. Long values receive a smaller shared font tier and can wrap; tiles retain bounded inline sizing.
- Count-up uses RAF timestamps consistently and clamps elapsed progress/value endpoints. Exact final values, finite-target/duration guards, stale-frame generations, frame-handle-zero cancellation, reduced-motion snapping and deferred-mount/unmount cleanup prevent oversized or leaked frames.
- 26 isolated assertions passed using production helper/component code, Vue refs, simulated RAF clocks and Intl formatting: integer/decimal/scientific targets, preformatted strings, Arabic digits, backward timestamps, decreasing/negative targets, rapid retargeting, cancellation, reduced motion and cleanup. The 176 settings/source checks, CSS parsing/token references and whitespace checks passed. Actual app/browser font/layout rendering remains pending. No builds, compilation, test suites, installs, versions, backend or Android changes; prior edits preserved.

## Study/exam navigation control layout — 2026-10-08

- Moved keyboard shortcut help from fixed viewport positioning into TestNavigation's tools group beside Pause, separate from Previous/Next/Finish. Removed its redundant keyboard badge, kept existing keyboard-only visibility and constrained the upward popover width/height with wrapping hints.
- Reduced the shared question navigation window from nine/five entries to five/three for desktop/narrow screens. Retained arrows, current/answered status and 44px coarse-pointer targets; used shared compact geometry for fine pointers, reduced surrounding margins and an inline localized numeric counter with a full accessible label. This also updates the master-exam consumer.
- Pause now uses the shared filled warning variant, filled pause icon, bold label and existing accessible pause/save label. Existing support/disabled/action contracts remain. Below 480px, tools and step actions get separate flexible rows.
- 143 isolated runner assertions passed: four production Vue structure/template/script parses, navigation bounds/current inclusion, pause semantics, control placement and production CSS under simulated widths 320/480/640/769/1024px and fine/coarse pointers. Production runner CSS parsing and whitespace checks passed. jsdom has no layout engine; actual app/device/RTL/large-font geometry remains pending. No builds, compilation, test suites, installs, versions, backend or Android changes; earlier reliability edits preserved.

## Global and page-specific reliability corrections — 2026-10-08

- Startup mounts with existing defaults before fetching public configuration; the config read is bounded to 5 seconds with no retries. Ordinary API requests have a 30-second timeout; admin exports allow 120 seconds. Identical JSON mutations share their pending promise, without cancelling an earlier write or retrying uncertain mutations. Binary bodies use object identity to avoid conflating distinct uploads.
- Added request-ownership checks to shared CRUD wrapping and question-list reads, including reset invalidation and suppression of stale errors/status/results. Cancellation releases loading silently. Toasts deduplicate matching message/type, cap visible entries at five and clean timers on removal/reset.
- User-form updates omit expiry/renewal unless explicitly changed, preserving exact expired deadlines and existing renewal intervals on unrelated edits. Create still sends defaults; save guards and native disabled fieldsets protect pending writes. Profile expiry refreshes every minute and on focus/visibility changes with interval/listener cleanup.
- Question load failures remain retryable in the editor; only confirmed 404s/invalid IDs redirect. Question save spans text and image work under one guard. A failed image upload/delete retains its original File/question ID and the frozen draft, shows persistent localized recovery feedback and retries only the image without another create/update.
- Choices/correct-answer/translation errors remain beside their controls; submission focuses the offending input and opens enclosing details. Touched errors revalidate as values/language change. Markdown fields now forward required/error/aria descriptions and blur through BaseField. Shared fieldset styling avoids compounded disabled opacity.
- 64 isolated reliability assertions passed using production functions, Vue refs and mocked transport/DOM/store/lifecycle: duplicate writes/failure cleanup/distinct files, stale responses/reset/cancellation, toast caps/timers, preserved subscriptions, image-only retry, validation/focus, load retry/404 and profile time/cleanup. Parsed seven changed Vue structures/templates/scripts; 176 settings/source checks, 58 CSS parses/token references, changed-JavaScript syntax and whitespace passed. No test suites, builds, compilation, installs, configured versions, backend or Android changes.
- Browser automation tools are not exposed. A read-only check confirmed no preview responding on configured localhost:5173 after sandbox socket access required approved escalation. Full application/browser/device/network/RTL/theme/print verification remains pending; isolated checks do not establish rendering or server-side concurrency.

## Four additional Arabic font choices — 2026-10-08

- Added Tajawal, Cairo, IBM Plex Sans Arabic and Amiri to the existing selector, pre-paint allowlist, localized labels and body/heading token rules. Preferences remain browser-local; only selected families register CDN styles, with no local text-font fallback or preload.
- Used the actual supported weight queries instead of the universal variable range: Tajawal and IBM Plex Sans Arabic use discrete weights, Cairo uses 200–1000, and Amiri uses 400/700. Verified against official Google Fonts metadata: [Tajawal](https://github.com/google/fonts/blob/main/ofl/tajawal/METADATA.pb), [Cairo](https://github.com/google/fonts/blob/main/ofl/cairo/METADATA.pb), [IBM Plex Sans Arabic](https://github.com/google/fonts/blob/main/ofl/ibmplexsansarabic/METADATA.pb), [Amiri](https://github.com/google/fonts/blob/main/ofl/amiri/METADATA.pb).
- 134 isolated font assertions and 176 settings/source assertions passed, covering supported request parameters, single-family registration, saved-choice restoration, locale persistence, CSS token precedence in both locales, bootstrap/localization and unchanged device-font behavior. JavaScript syntax, 58 CSS parses/token references and whitespace checks passed. No actual font download/rendering, app/device/browser verification, builds, compilation, test suites, installs, version changes, backend or Android edits.

## Browser-local font preference and lazy text fonts — 2026-10-08

- Added project-default, device, Noto Sans Arabic, Inter and Outfit choices to Appearance, with Arabic/English preview and localized guidance. Browser-local `pref_font` is independent of account APIs and survives sign-out/browsing-density resets. A pre-paint attribute restores the choice; explicit font selections own shared body/heading tokens in both locales.
- Registered only the active selection's Google Fonts styles, leaving font-file fetches to rendered glyph demand. Project default follows locale (Noto Sans Arabic/Outfit or Inter/Outfit); device mode registers no text-font styles. Removed local text-font URLs and server fallback; existing bundled files remain unused by screen text. No font preloads or forced FontFace loading. Failed CDN styles fall back to installed fonts and can retry on later selection. Existing icon loading/fallback is unchanged.
- 74 isolated assertions passed for preference persistence, default/explicit locale behavior, selected-family-only registration, duplicate prevention, failed-style retry, bootstrap allowlist/storage failure, no local/forced loading, localized options and production font-token precedence in jsdom. The 176 updated settings checks passed; all 58 CSS files parsed with resolved token references. JavaScript syntax and whitespace checks passed. These use mocked document/storage and jsdom CSS, not actual network/font rendering. No app/browser/device checks, builds, compilation, test suites, installs, versions, backend or Android changes.

## Admin settings and user preferences enhancement — 2026-10-08

- Reorganized both pages into named sections with jump links, explanatory hints and responsive shared token-based styling. Personal Appearance, Question Browsing and Account sections include existing theme/language handlers, immediate application guidance and a browsing/density reset that preserves theme/language. Removed exposed sound/auto-advance toggles because production study screens do not consume them; stored values remain intact.
- Admin settings wait for server data and provide load/retry feedback, integer field validation, invalid-input focus, unsaved navigation protection, saved/dirty status and discard. Failed saves preserve drafts; successful saves acknowledge the submitted snapshot without a competing background fetch. Inputs and conflicting actions are guarded while saving.
- Maintenance remains capability-gated with individual errors/results and named actions. Adding demo data uses the existing confirmation dialog; result text is localized. Fixed the existing user-form consumer so a zero renewal default remains zero. Removed obsolete settings CSS from admin.css.
- 168 standalone assertions passed: Vue SFC/template/script parsing, 58 production CSS parses/token references, locale keys, and source-extracted Vue state with mocked API/DOM/services covering failed loads, numeric validation, draft retention, duplicate saves, discard, reset persistence, permission/confirmation gates and store snapshots. JavaScript syntax/whitespace checks passed. No full app rendering, browser/device/RTL layout, live API checks, builds, compilation, test suites, installs or version changes; backend/Android unchanged.

## Tokenization corrections — 2026-10-08

- Theme transitions and cleanup timing share the motion token; explicit reduced-motion precedence disables theme animation. Repeated changes cancel stale cleanup timers.
- Nested modal layers resolve the CSS base/step tokens directly. Mobile bottom-nav height is measured with the existing resize/cleanup helper; floating controls and page padding share clearance including safe-area padding once.
- Source contracts, balanced CSS braces, token references across 57 non-test-named CSS files and whitespace checks passed. Python modeled duration parsing, layer ordering and clearance at multiple text-derived heights/safe-area sizes; these are not JavaScript execution or browser layout checks. Node is unavailable. No builds, test suites, installs, configured versions, backend or Android changes.

## Tokenization risk review — 2026-10-08

- Scanned 57 non-test-named CSS files; no unresolved no-fallback token references or new critical hardcoded screen palette found. Recorded accessibility/motion, modal-tier synchronization and mobile-clearance risks in `frontendShellReview.md` and the work plan.
- Used source specificity and Python geometry calculations. Current modal constants match CSS; larger-text clearance risk remains browser-unverified. Node is unavailable in this shell. Application code unchanged; no builds/test suites, installs or version changes.

## Shared-control corrections — 2026-10-08

- Applied disabled opacity once at BaseField while preserving native disabled behavior and standalone/boundary-only styling. Enlarged coarse-pointer number stepper/field/clear targets and markdown toolbar/help controls to 44px; side-by-side steppers and wrapping preserve narrow-container usability. Kept existing fine-pointer behavior.
- Removed conflicting modal-close dimensions so shared icon-button sizing owns both axes; header shrink prevention retained.
- Forty-eight isolated production-CSS/jsdom assertions passed across LTR/RTL and explicitly simulated fine/coarse pointer media. CSS parsing/whitespace checks passed. Actual browser layout/device verification remains pending. No builds, test suites, installs, configured versions, backend or Android changes.

## Shared-control consistency review — 2026-10-08

- Identified compounded disabled opacity, remaining number-stepper/markdown touch sizing gaps and mixed modal-close geometry. Recorded pending corrections in `frontendShellReview.md` and the work plan. Application code unchanged.
- Production CSS/jsdom confirmed 0.25 combined select opacity, 0.125 number-input opacity, and 36px inline/44px height declarations on the modal close button. Touch sizing was source-traced. No actual layout/device checks, builds, test-suite work, installs or version changes.

## Visual corrections and theme-aware print enhancement — 2026-10-08

- Fixed theme/language selected-row precedence, native select arrow direction and pagination coarse-pointer sizing; widened the per-page select for its value/arrow.
- Honored the user's intentional theme-aware print colors. Added independent palette seed aliases and explicit paper derivation inputs while retaining all 55 screen semantic seeds across 11 themes. Dark-theme paper accents deepen without losing hue; white neutral surfaces, strong borders and full printable table containers improve output.
- Source-color calculations passed for all 55 print accent/white combinations (minimum 5.54:1). Production CSS/jsdom direction checks, selected selector/touch/print contracts, token-reference checks and whitespace checks passed. Actual browser/device/print output remains unverified. No builds, test suites, installs, configured versions, backend or Android changes.

## Additional visual review — 2026-10-08

- Identified four additional inconsistencies: theme/language active backgrounds overwritten by ghost styles, reversed native-select arrow placement, compact pagination buttons without a coarse-pointer minimum, and print derivations losing to themed-root specificity. Recorded follow-up work; existing application edits preserved.
- Production CSS/jsdom confirmed transparent selected rows and reversed select backgrounds. Touch sizing/print precedence were source-traced; no actual device/print rendering. Narrow-navbar and long-dialog fit remain browser checks. Application code unchanged; no builds, test suites, installs or versions changed.

## Frontend shell/layout corrections — 2026-10-08

- Corrected all eight review findings: mobile Analytics reachability, hamburger cascade precedence, measured navbar/banner offsets, explicit container-sticky tables, visible/topmost modal focus handling, knowledge font token and ordered spacing tiers. Capability, service and localization contracts retained.
- Added shared height measurement with resize/removal cleanup and focus candidate filtering. Nested dialogs make covered surfaces inert/aria-hidden and restore focus safely; hidden/disabled controls and invalid explicit targets fall back to visible controls or the dialog container.
- Forty isolated Vue/jsdom assertions, changed SFC/script parsing, JavaScript helper lint, all 57 non-test-named CSS token references and diff whitespace checks passed. Modal setup was source-extracted, native elements rendered, and rectangles supplied for jsdom's absent layout engine. These are not full application browser/real-device checks.
- Vue lint is blocked by installed parser metadata (`Invalid Version: main`); independent source parsing passed. Full breakpoint/locale/density/theme/print/browser verification remains pending. No builds, compilation tasks, test suites, installs, configured versions, backend or Android changes.

## Frontend shell/layout review — 2026-10-08

- Reviewed shared shell/navigation, responsive layout/container rules, theme/locale/density wiring, controls/dialogs/tables and token usage. Recorded eight findings and remaining browser checks in `frontendShellReview.md`; application code unchanged.
- Scanned 57 non-test-named CSS files and 187 declared custom properties. Standalone source/jsdom checks confirmed mobile Analytics omission, desktop hamburger cascade, table offset and hidden modal focus candidates; navbar height mismatch follows source geometry. No full app/browser layout, contrast, print or device verification. No builds, test-suite work, installations, versions, backend or Android changes.

## 2026-10-06

- Reviewed the frontend model usage and its backend API contracts.
- Reviewed the PDF export request and download flow.
- PDF preserves CSRF/localized errors, attachment names, themes/locales/filters/optional front matter.
- Model/PDF reliability fixes required only backend changes.
- Added the project-root working documentation files.
- Added README: setup/architecture/API/localization/exports/production/troubleshooting.

## Configurable development startup — 2026-10-08

- Added `VITE_BACKEND_PROXY_TARGET`, media proxying and strict frontend port; default HTTP 5004. Switching documented in README and backend/docs/START_HERE.md.
- Static source/whitespace review only; Node is absent, so Vite config loading and browser login/media integration remain pending. No builds, compilation, dependency installs, test-suite work or configured version changes were performed.

## Documentation organization and agent guidance — 2026-10-08

- Kept README/Agents at the project root; moved supporting Markdown into `docs/` and added a documentation index. Preserved work history and pending checks.
- Updated relative links and compacted agent guidance around related-code review, explicit work restrictions, portable configuration and honest verification limits.
- Checked documentation targets, moved content and whitespace; no builds, test-suite or migration work, dependency/version changes or runtime changes were performed.

- Documentation compaction: retained commands, technical literals, dates, headings/links and checklist states; consolidated repeated prose/verification scope. Documentation/whitespace checks only.

## PDF study layouts and paper quiz — 2026-10-08

- Database export controls select current-theme study PDF or compact white/light-grey answer-free quiz. Study answers: inline, end, after each 25 questions, or omitted. Quiz displays disabled no-answer placement while retaining the previous study choice; clear resets defaults.
- Structured POST forwards validated `pdf_mode` and `answer_layout` alongside existing title/theme/locale/filters/front matter. Arabic/English labels/hints explain bidirectional answer links and quiz omissions. Existing download/CSRF/error handling and non-PDF exports retained.
- Source/locale/markup/whitespace checks only; Node and PDF/API dependencies are unavailable. No builds, test-suite work or version changes. Matching backend required; browser/PDF-viewer/print verification remains pending.

## Manual PDF question selection — 2026-10-08

- PDF source switches between existing filters and manual search/picking. Public question search uses the existing paginated API; previews include case/image/choices. Selected questions persist across queries/pages/source switches and can be removed/reordered; empty manual selection disables PDF export.
- POST sends ordered `question_ids` with empty content filters; title, quiz/study options, locale and front matter retained. Non-PDF formats retain filter-based selection. Shared search/async/row/checkbox controls and Arabic/English copy are used; stale responses/unmounted requests cannot overwrite current picker results.
- Isolated production-script checks with substituted Vue hooks/API passed for dedup/order/removal, stale searches, pagination errors and unmount handling. Source/locale/markup/whitespace checks passed; browser/Vue/API/PDF integration remains pending. No builds, test-suite work or versions changed.

## Custom selection for all question exports — 2026-10-08

- The shared manual picker now supplies PDF/Excel/CSV/JSON; empty manual selection disables every format, ordered picks replace content filters, and source switching retains picks. Existing filter-based flat downloads use GET; PDF settings and structured POST remain. Portable state packages retain filters; Arabic/English copy clarifies this scope. Generic service/store requests preserve the existing PDF wrapper, CSRF, blob errors and download filenames.
- Nineteen isolated production JavaScript assertions passed for payload/options, all formats, filenames, empty selection, failures, legacy GET/PDF callbacks and ordinary/verified service routing; Vue/browser/API/DOM were substituted. Source/locale/markup/whitespace checks passed. No builds/test suites/version changes; matching backend and actual browser/Excel/PDF integration remain pending.
