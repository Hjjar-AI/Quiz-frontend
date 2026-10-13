> Historical snapshot before the 2026-10-10 documentation reorganization. Current status: [documentation index](../../README.md). Do not use unchecked items here as the current queue.

# Frontend completed source work

Updated 2026-10-09. Detailed dates, exact earlier diagnostic scopes and limitations: [archive](../2026-10-09-workDone.md).

- Implemented accessibility corrections for answer submission/confidence/navigation, route context, charts/toasts and reduced motion.
- Corrected shell geometry, shared controls/tokens, selected states/modal focus, RTL/print behavior and study/master navigation sizing.
- Added/coordinated Ruby and Arabic font choices, browser-local lazy font preferences, density/settings/preferences and count-up formatting/overflow.
- Hardened startup/API timeouts, stale reads, repeated writes, expired-account edits and editor/image recovery.
- Added PDF study/quiz answer layouts and manual ordered question selection across PDF/Excel/CSV/JSON with matching backend contracts.
- Organized docs/agent guidance and configurable development startup integration.

Prior isolated source/helper checks are recorded in the archive; they do not establish current browser geometry, screen-reader behavior, live APIs, print output or a successful build.

## 2026-10-09 Android comparison

Read current production routes/endpoints, analytics UI/store, question cards and custom export controls against Android/Django. Recorded remaining native parity in [Android review](../../../../Android/docs/reference/functionalityReview.md). Compacted work records with full historical snapshots retained. Documentation only; no source changes, build, suites, migrations or versions.

## 2026-10-09 agent guidance maintenance

Compacted shared working rules without relaxing explicit build/suite/migration/version restrictions; added source-evidenced cross-client review and bounded-completion guidance. Captured uncertain toggle/create recovery, structured errors and dependent/profile freshness; Android also records compiler-signature/opt-in/cancellation/visibility checks. Frontend AGENTS now links its detailed instructions. Documentation links and whitespace checked; no production or runtime work.

## 2026-10-09 Android connection-file export

Added `admin.settings`-gated **Android connection file** to web System settings. The handler independently checks the capability; a memory-only phone-address field uses existing form validation timing, bilingual labels/errors and a separate download status. Public unencrypted v1 nested JSON matches Android first-launch/Change-server import; decorative randomized identities grant no server/account authority. Existing browser download helper handles Blob/object-URL cleanup. Export does not save runtime settings, reset their draft or call the backend. URL validation rejects credentials/query/fragment/non-HTTP schemes and preserves explicit deployment-prefix API paths.

JavaScript helper/extracted setup-script syntax checks, JSON parsing/bilingual key references and whitespace checks passed. `@vue/compiler-sfc` is unavailable here, so Vue template parsing, browser downloads/accessibility and Android interoperability remain unverified. No dependencies, builds, suites, migrations, backend changes, deployment or versions. See [Android file contract and retained profiles](../../../../Android/docs/contracts/serverConfiguration.md).

## 2026-10-09 full-bank capability description

Added English/Arabic permission descriptions for `tests.download_full_bank`. Existing server-driven role matrix and user override editor resolve the new capability through their current catalogue/description/Allow-Deny-Inherit flow; no new client permission endpoint or write behavior. Backend and Android independently gate full-bank download; member/moderator defaults omit the capability. Locale JSON/lookup and whitespace source checks only; browser/HTTP/device/build verification remains pending. No suites, dependencies, migrations, builds, deployment or versions.

## 2026-10-09 learning review integration

Updated study setup with coverage/balanced/review choices; event-based activity descriptions and distinct/due/mastery metrics; explicit bookmark intent and caller-scoped create/duplicate receipts with read reconciliation and explicit identical retries; archived master weighted scores; retained revision payloads. Unknown create text/image intent stays frozen until reconciliation, with account-reset pending identities in memory. See [backend policies and fresh-schema requirements](../../../../backend/docs/contracts/learningConsistency.md).

JS/extracted Vue script syntax, locale JSON and CRLF-aware whitespace source checks only; no Vue compilation/browser/HTTP/accessibility verification, builds, suites, migrations, database actions, deployment or versions. Verify response loss, pending resets/account switches, revision conflicts, strategy payloads, activity dates/metrics, archived results and bilingual/RTL controls after coordinated rollout.

## 2026-10-09 matching revisions and restart operation identities

Category editing/deletion captures the displayed revision; tag rename/delete/merge captures the tree revision (fallback trees cannot provide a valid write version); runtime Settings and case service methods send matching expected_version. Successful Settings writes retain the returned revision. Failed/conflicting writes retain their current drafts/selections.

Question create/duplicate checkpoints persist only operation IDs in browser storage scoped to account UUID and API origin/base path. Logout/account switches clear the active scope and reset memory. Creates restored after restart have a dedicated check/open/explicit missing-receipt acknowledgement flow; fresh form text/images cannot be applied to the old operation. Duplicate retry uses the same identity, remains explicit and checks supported receipts first. Storage failure prevents dispatch; no sensitive question draft/images are stored.

Production JavaScript/extracted Vue script syntax, locale JSON and whitespace source checks only. No Vue compilation/browser/HTTP/accessibility verification, suites, builds, migrations/setup/database actions, dependencies or versions. Verify restart/response loss, storage failure, account switches and stale revisions against matching backend schema.

## 2026-10-09 project rescan

Inventoried production source and traced recovery/pagination/account/CRUD/ownership/conflict paths across Django, Android and Vue. Recorded seven prioritized findings in [project rescan](../../../../Android/docs/archive/reviews/2026-10-09-projectRescan.md). Review/documentation only; production unchanged, no builds/suites/migrations/database/runtime work. Existing completed source features remain completed; newly evidenced gaps are in the plan.

## 2026-10-09 seven rescan findings fixed in source

- Web transport uses an independent authenticated-session generation for shared requests, cancellation, success/error handling and delayed expiry redirects. Old account requests are aborted/ignored; CRUD completion guards prevent old callbacks from repopulating reset stores. Login/initial restore can publish only their own matching one-step account transition. CSRF rotation remains separate.
- Web AddView marks an orphan pending create as review-only on route departure/re-entry even when storage was already hydrated. Confirmed late results keep their receipt identity for the new view. Save/image flows also check component lifetime/account generation, so an old response cannot consume a new form's images or navigate an unmounted form. Browser draft text/images remain memory-only.
- Question update/delete services recheck current ownership/override against locked rows. Question and knowledge DELETE now require expected_version in query parameters; native detail confirmation and all reachable Vue question-delete handlers capture the displayed version before confirmation. Knowledge native deletion uses its retained editor baseline. Protected relationships/reputation behavior remain, and stale/rejected deletes retain readable items.
- Caller-scoped content receipts report whether their committed target still exists. Native category/knowledge reconciliation distinguishes deleted targets from absent operations/read failures, offers a terminal acknowledgement, preserves the typed draft and retires the exhausted UUID. Only a subsequent explicit new save creates a new identity.
- Shared bilingual Vue revision-review controls load current data independently and expose Keep draft/Use server choices for categories, tags and Settings. Drafts stay intact during read failures; tag source/target identities rebase by ID only after explicit review. Removed categories can prepare a new creation without discarding draft content. Settings dirty-state baselines adopt the reviewed server values without replacing kept inputs. Permissions/account scope gate reads and resolution; no automatic replay.
- Learner case browsing now uses server page/per_page and the configured page size, with Next/Previous. Applied query/results commit only after successful reads; failed search/page requests retain readable results and retry the requested query/page. Management pagination and bounded autocomplete contracts remain intact.

Validation: production Python AST (242 files), JavaScript/extracted Vue script syntax (299), locale JSON, native lexical delimiters (152 files), bilingual XML/resources/positional placeholders (1,382 strings per locale) and CRLF-aware whitespace checks passed. These are source checks, not compilation/runtime evidence. No builds, suites, migration inspection/work, database/setup/data generation, deployment or version changes. Matching backend/native/web rollout is required for the new DELETE preconditions and receipt status; this follow-up introduces no model/schema changes. Verify delayed responses/account switches, orphan creates, deleted receipts, stale ownership/revisions, read failures and large learner case lists over actual HTTP/device/server-database concurrency.

## 2026-10-09 deeper source review

Traced master/ordinary session transactions and callers, offline completion, learning evidence, import updates, planner configuration and web polling. Recorded eight source-evidenced follow-up areas in [deep review](../../../../Android/docs/archive/reviews/2026-10-09-deepTransactionReview.md). Review/documentation only: production unchanged, no builds/suites/migrations/database/runtime actions. Existing learning/offline protections were distinguished from new gaps; concurrency impact remains unexercised.

## 2026-10-10 eight deeper findings fixed in source

All eight bounded findings are addressed in production source; the original review remains historical evidence.

- Assessed parent saves lock linked questions before parent rows; knowledge/question/tag writers and state imports coordinate their dependency locks. Existing imported questions and knowledge objects advance the locked local revision instead of adopting the source revision. Imports deliberately take broad user/question locks; large-import contention still needs measurement.
- Master start locks fresh access relations, rechecks new-start/preview access, resumes either active normal or makeup attempts before new-start classification, and finishes expired attempts without granting extra time. Existing owned work is retained.
- Master answers require session_id and the full expected_slot (including null), compared under lock. Identical saved intent is idempotent; conflicting saved intent returns ATTEMPT_PROGRESS_CHANGED. Navigation requires session_id and expected_current_question_id; current-question reads do not persist fallback navigation. Expiry finish failures propagate.
- Web/native master recovery retains uncertain drafts, reads authoritative full answer slots, and requires explicit comparison/rebase/discard before another conflicting write. Web polling has disposal/cancellation generations and exam/session/store/progress ownership guards; route changes cannot adopt an old attempt response.
- Planner update/delete requires expected_id and expected_version; successful updates return accepted configuration/revision. Both clients retain editor baselines and provide explicit conflict resolution. StudyPlannerScope/ScopeDay preserve timestamp-based historical filter attribution: explicit filter/date changes reset today's displayed progress, taxonomy rename/merge continues it, and historical days include all their original scope activity after midnight without double counting. Global learning events remain intact.

Verification is production AST, JavaScript/extracted Vue script syntax, locale JSON, native lexical/XML/resource/placeholder and whitespace checking only. No builds, compilation, automated suites, migration inspection/work, setup/seeding, database writes, deployment or versions. Matching backend/web/native rollout and matching planner schema are required. Actual HTTP, database interleavings, browser/device recovery and accessibility remain release checks.
