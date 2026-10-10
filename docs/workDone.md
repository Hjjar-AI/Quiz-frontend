# Current Vue source status

Updated 2026-10-10. [Remaining gates](workPlan.md) · [Historical evidence](archive/README.md).


- Authenticated request/session-generation and CRUD guards; orphan question-create identity recovery with memory-only text/images and protected image association.
- Category/tag/settings/planner revision comparison and explicit Keep draft/Use server controls; retained success on failed later reads.
- Master full-slot uncertainty review, mandatory answer/navigation baselines, route/session/store guards and canceled/disposed polling.
- Learning strategies/metrics, archived weighted results, explicit bookmarks/write receipts, permission descriptions and admin connection-file exports aligned with backend.
- Shared UI/theme/token/accessibility/layout, lazy browser-local fonts and ordered exports remain represented; browser/print/accessibility validation pending.

Backend API policy is canonical in [write recovery](../../backend/docs/contracts/writeRecovery.md) and [learning](../../backend/docs/contracts/learningConsistency.md).

## Evidence and documentation

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
