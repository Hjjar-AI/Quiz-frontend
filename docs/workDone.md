# Current Vue source status

## 2026-10-17 ordinary learning-write recovery

Coordinated the backend learning-flow fixes with ordinary Vue writes: retained index/slot preconditions, normalized successful-write acknowledgements, preserved semantic errors and typed-expiry-only forced finish. Failed answer/confidence/reflection/recall/navigation attempts remain memory-only; conflicting actions and navigation wait for explicit server-state read/review. Users may accept saved progress/discard the draft, or explicitly retry the same original question only against an unchanged baseline. Missing/completed/paused/withheld cases retain recovery; generation/session checks reject stale results, logout/reset clears private drafts, and older servers without acknowledgements use a follow-up read without replaying confirmed writes. Arabic/English recovery controls use existing shared components. Other session parity items remain pending.

Changed JavaScript/extracted Vue-script syntax, bilingual JSON keys/placeholders, source/caller tracing and whitespace checked. Vue SFC parser unavailable; template/browser/accessibility/concurrency/HTTP behavior unverified. No builds/compilation, suites, migrations, versions or Android changes. Deploy matching backend first; [shared closure and limits](../../backend/docs/archive/reviews/2026-10-17-learningFlowReview.md#source-corrections).

Updated 2026-10-10. [Remaining gates](workPlan.md) · [Historical evidence](archive/README.md).

## 2026-10-13 distinct tinted theme palettes

Coordinated ten shared palettes with Android/PDF: visibly tinted body/card/alternate surfaces, distinct accent families, darker semantic/text seeds for source contrast and an independent teal-black Onyx override. Updated pre-paint body colours and default Iris browser chrome. Existing theme keys, groups, aliases, print derivations and lazy fonts remain; shared Dark/Midnight palettes are unchanged. Android-only Violet choices now display as Sage/Plum. No web session-flow implementation was included; its existing parity queue remains.

Production token/bootstrap/PDF equality, source core-colour calculations, excluded palette comparisons and whitespace passed. No build/compilation, suites or browser/print evidence. Verify all themes/densities, forms/focus/charts/native inputs and print with the coordinated PDF deployment.

## 2026-10-13 backend/Android session parity source review

Traced current ordinary Vue service/store/controller, question/setup/results/Markdown/navigation/preferences components and Django session payload/precondition/409 handling against the recent Android work. New backend fields/prefetch are additive and socket cleanup needs no frontend endpoint change. Highest-priority native/web difference is ordinary write recovery: web omits expected-index/slot checks, rolls failed answer selection back and re-enables actions without acknowledgement reconciliation, and treats every exam 409 as expiry. Backend expiry/progress conflict currently shares the same untyped 409, so machine-readable reasons are a coordinated improvement. Web lacks ordinary frozen-session prefetch/local feedback and the selected question feedback/bookmark, result-filter, setup-selection and compact tools/image/explanation parity. Current timer/progress/result score/Markdown/localization components should be reused. Browser haptics remain optional platform-specific scope.

Recorded the bounded remaining implementation queue in workPlan. No application source, build/compilation, suites, migration/schema, dependency/version, backend or Android changes made during this review. Current Vue/Django production-source inspection and documentation whitespace checks only; browser/network/accessibility behavior remains unverified.


- Authenticated request/session-generation and CRUD guards; orphan question-create identity recovery with memory-only text/images and protected image association.
- Category/tag/settings/planner revision comparison and explicit Keep draft/Use server controls; retained success on failed later reads.
- Master full-slot uncertainty review, mandatory answer/navigation baselines, route/session/store guards and canceled/disposed polling.
- Learning strategies/metrics, archived weighted results, explicit bookmarks/write receipts, permission descriptions and admin connection-file exports aligned with backend.
- Shared UI/theme/token/accessibility/layout, lazy browser-local fonts and ordered exports remain represented; browser/print/accessibility validation pending.

Backend API policy is canonical in [write recovery](../../backend/docs/contracts/writeRecovery.md) and [learning](../../backend/docs/contracts/learningConsistency.md).


## 2026-10-10 co-attending permission eligibility

Removed the member-role filter from the exam editor co-attending picker; effective `master_exams.create` now determines eligibility across member/moderator/admin roles. Backend relation handling already accepts these roles. JavaScript syntax and diff whitespace checks passed; no builds or suites. Browser/API verification remains pending.

## Evidence and documentation

On 2026-10-10 updated and ran the complete frontend suite at the user's request: 931/931 tests in 70 files passed, zero failures/skips/TODOs, reported duration 56.63s. Fixed Vitest's callback-config merge and an undiscovered admin-link test filename; reconciled all 48 baseline failures with current production contracts and added ten focused regressions. The suite exposed two production master-exam transport defects: removed undefined navigation variables from question removal and forwarded the existing session/current-question arguments for attempt navigation. Backend DTO/serializer/routes were checked without modifying backend/Android. Measured 292 production files: lines 43.01%, statements 40.37%, functions 27.70%, branches 23.73%. [Report, limits and rerun commands](verification/frontendTests.md); JSON/per-file and temporary HTML coverage retained. No production build, database/migration work, dependency/version changes or live browser/backend verification. Router/shallow-mount warnings and browser/accessibility/print gates remain.

On 2026-10-10 changed shared ordinary/master question confidence and reflection headers to collapsed controls showing current/default selections. Certain confidence and Unknown reflection remove mandatory extra selection steps; explicit saved values are retained, and default reflection uses existing navigation or deliberate pause/finish saves. Arabic labels are «نسبة ثقتك بالإجابة» and «أخطأت لأنني», with matching English text. Iris is the initial/Auto-light theme in both pre-paint and runtime selection; saved choices and the legacy Light-to-Stone alias remain intact. JavaScript/template/locale/whitespace source checks only; browser focus/accessibility, auto-advance and single-learning behavior remain pending. No builds, suites, migrations or dependency/version changes.

Latest shared source checks: 242 Python production ASTs, 299 JavaScript/extracted Vue scripts, 152 Kotlin lexical files, 1,383 bilingual resource entries and whitespace/XML/placeholders. No compilation/runtime/schema guarantee follows. No builds, suites, migration/setup/database/deployment/version actions were run in the latest fix batch. Matching deployment and manual checks remain required.

On 2026-10-10 documentation was grouped by function, active records compacted, historical evidence retained and links checked. Runtime behavior was unchanged; launcher/tutorial/comment references were updated to moved guides.

## 2026-10-10 parity contract fixes

The dedicated admin/users/<id>/active/ route requires boolean is_active and sets desired state under existing reauth/canonical locks/self/stub/last-admin rules and returns id/is_active/changed; the old toggle route stays compatible. Both clients use explicit states and retained partial/unknown outcomes with read/review, never automatic resend. Vue initial master clock correction is account/attempt-scoped with independent status; planner week uses server today. Native workflow closure is [archived evidence](../../Android/docs/archive/reviews/2026-10-10-androidParityReview.md).

Matching backend-first rollout required; this batch adds no schema. Source AST/JS/native lexical/XML/locale/whitespace checks only; builds/suites/migrations/setup/database/runtime/deployment/version work unperformed.

On 2026-10-10 fixed recall navigation so choices must be revealed and an answer selected before moving questions/finishing. The existing same-question reveal remains the only reveal control; keyboard answers work after reveal and pause retains its separate busy/confidence guard. Both clients receive bounded display labels from Django without shortening selected-tag filters. JavaScript/extracted Vue-script syntax and whitespace checks passed; browser/device behavior remains pending. [Focused backend regression results](../../backend/docs/verification/pythonTests.md).


## 2026-10-10 source-book exam selection

Added a dedicated Source book / الكتاب المصدر selection to ordinary exam, study and recall setup in Vue and Android. Authenticated `GET /questions/source-books/` lists exact nonempty source-document titles and question counts from the public practice bank; `source_document` restricts available counts and session selection by exact title, combined with existing tag/difficulty/verification refinements. Explicit question-ID starts also enforce a supplied book restriction. Both clients forward the title unchanged, preserve book selection on read failure and provide retry; Android stores the lightweight selection in account-scoped setup recovery. Books appear after questions with source metadata are imported; existing DSM/Kaplan exports already include it. No new models or schema changes.

Verification: production Python AST, JavaScript/extracted Vue-script syntax, bilingual JSON/XML/resources, Kotlin lexical delimiters and diff whitespace. No builds, suites, migrations/setup, database writes or runtime/device verification; deploy the matching backend first and verify book counts, selected-book-only sessions, refinements, retry, account isolation and Arabic/RTL on current clients.

## 2026-10-10 frontend optional case translations

Added a collapsed case-translation editor inside QuestionForm's existing clinical-case section. It saves optional locale title/stem independently through the revisioned case PUT, checks actual linked-question authorship/capabilities, retains drafts on read failure, protects route/enclosing dialog navigation, blocks case target/question submission while pending, and requires explicit read/review after conflicts or uncertain writes. Confirmed saves update case selectors without resetting active sessions. New cases are created by saving the question before editing translations.

Shared question localization now matches case locale keys case-insensitively, applies available title/stem independently with original fallback, and keeps question stem/options together when translations are incomplete. Library and shared ordinary/master/preview readers follow their existing locale without extra translation controls. Manual export previews share the resolver; single-question JSON downloads retain case/question translations. Completed-result language controls remain separate scope. [Shared contract](../../backend/docs/contracts/caseTranslations.md).

Checks: 301 production JavaScript/extracted Vue-script syntax checks, 157 SFC source parses, 1,973 matched bilingual JSON keys/placeholders, new editor resource references and diff/document-link checks. No builds/template compilation, suites, migration/schema/database actions or browser/device verification. Matching backend/schema and the [pending visual/recovery checks](verification/visual-qa-checklist.md) remain required.

## 2026-10-10 multiple-file imports

The file-import tab now accepts multiple Excel/CSV/JSON files through the picker or drag/drop, validates each independently (50 MB per file), appends selections without duplicate queue entries and submits sequentially through the existing single-file API. Shared queue rows show filenames, progress and server messages; removal is available outside a pending write. Confirmed imports stay recorded; a failure stops the batch, preserves remaining files and is never automatically resent. Queue state survives import-tab switches, protects route/browser navigation and stops dispatching after unmount or authenticated-session changes. English/Arabic instructions cover DSM-5 chapter selections. Telegram and package imports retain single-file selection.

Verification: 34 focused tests passed across DropZone, SimpleImportTab and bilingual catalog coverage, including eleven new selection/queue regressions; Vue source parsing, bilingual queue placeholders and diff whitespace checks passed. No production build, dependency/version changes, backend/database mutations or live browser/backend import performed. Existing backend import throttle is 10 requests/hour, so larger batches can pause at that limit; unchanged API parses each file independently. The earlier full-suite coverage report predates this feature; browser/recovery checks remain in the plan.

## 2026-10-10 temporary import-limit unlock

Added an administrator-password control shared across the import page. It reads the current login-session grant, enables the backend-authorized ten-minute bypass, clears entered passwords, expires local feedback and reconciles uncertain unlock responses using GET without replaying POST. The file-import store preserves HTTP 429 through its wrapper so rejected files remain queued for explicit retry; imported files stay excluded. [Backend-authoritative shared contract](../../backend/docs/contracts/importLimits.md).

Focused verification: 96 tests across eight frontend files passed, covering unlock/expiry, wrong passwords, duplicate clicks, stale reads, response loss, HTTP-429 queue resumption, service paths and the updated endpoint snapshot. Vue/JavaScript source syntax/parses, bilingual keys/placeholders and diff whitespace checks passed. No production build, dependency/version changes, live backend writes, browser/device verification or new full-suite coverage report. Backend-first rollout is required.

## 2026-10-11 full availability and source-book refinements

Removed the backend's 200-question truncation from available counts; session selection limits remain server-configured and enforced at start. Blueprint inventory is counted from its filtered public bank because weighted selection redistributes shortages across that bank. Android retains its separate requested-count clamp; Vue now uses the configuration store's session maximum for input validation/clamping and displays full availability separately. Added authenticated GET `/questions/source-book-filters/?source_document=…` with exact-title public-question category/tag facets and per-book tag counts. Both clients show optional book-scoped category/tag pickers, forward selections with the book filter, reset incompatible selections when changing books, and guard stale/failed metadata reads with Retry. Global selector stores remain available to other sources.

Checks: production Python ASTs, Kotlin lexical/import/resource references, bilingual Android XML and Vue JSON/placeholders, JavaScript and extracted Vue-script syntax, and whitespace. No builds/compilation, suites, migrations, database access, versions or deployment. Vue SFC parser is unavailable in this environment; template/browser/device behavior remains unverified. Deploy backend before matching Android/web clients; verify >200 availability, the unchanged 200 session limit, book category/tag membership and filtering, clear/change/retry/rapid switches, saved setup, and Arabic/English/RTL/large text.

## 2026-10-11 category merges and existing-tag destinations

Category cards now expose merging into an existing category through a shared-control confirmation dialog. Source/target revisions and an operation identity guard the write; receipt reads and explicit identical retries handle response loss. Failed writes retain the choice, stale selections require refreshed review, confirmed success updates selectors before a background reload, and busy/uncertain requests guard route/browser exits. Existing tag merge support is now discoverable per tag and includes an existing-destination picker excluding sources/descendants, an impact description and guarded dispatch/review after uncertain responses. Existing free-text new tag destinations remain. Both clients reuse the existing tag backend.

Production JavaScript and five extracted Vue scripts passed syntax checks; bilingual JSON keys/placeholders and whitespace passed. Vue SFC parser is unavailable, so template parsing/browser behavior remains unverified. No builds, suites, migrations/setup, dependency/version changes or live writes. Backend-first rollout is needed for category merges; verify confirmation, receipt loss/retry, stale/missing destinations, tag hierarchy, selector refresh, RTL and keyboard behavior.
