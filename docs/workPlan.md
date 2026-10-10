# Frontend remaining work

Updated 2026-10-09. Detailed previous checks/priorities: [archive](archive/2026-10-09-workPlan.md). Current native comparison: [Android source review](../../Android/docs/functionalityReview.md).

- Verify Permissions role/user controls for tests.download_full_bank: localized description, individual Allow/Deny/Inherit and saved grant/revocation applied by Android permission refresh.
- Browser/screen-reader verify [accessibility corrections](accessibilityReview.md): explicit answer submission/confidence focus, pending-write/navigation guards, route context, timed warnings, chart alternatives/toasts/reduced motion and targets.
- Verify [shell/control corrections](frontendShellReview.md): measured chrome/safe areas, sticky tables/modal focus, RTL arrows, selected states, long content and reduced-motion theme switching.
- Verify Arabic/English, all themes (including Ruby), fonts/lazy loading/CDN failures, density, narrow/large text, count-up precision, study/master navigation and Settings/Preferences dirty/save/discard behavior.
- Verify startup/timeouts/stale reads/repeated writes, editor/image recovery, expiry refresh and API errors against running backend.
- Verify custom PDF/Excel/CSV/JSON selections, reorder/order retention, filters/verified-only/errors/downloads; fresh PDF links/answer placement/quiz/front matter and print pagination on matching backend.
- Verify web System settings connection-file download/import on Android, custom phone addresses/deployment prefixes, permission revocation and bilingual/RTL validation; export must preserve runtime-settings drafts.
- Verify Vite/API/media proxy ports, occupied ports and CSRF origins in the real development environment. Historical parser/dependency limitations need rechecking before lint; no dependency/version change is authorized.

This source comparison found Android gaps, not a new Vue implementation defect. Browser/HTTP/print checks remain separate from source checks. No suites/builds/compilation/packaging or migrations without explicit request; preserve user edits.

## 2026-10-09 learning review integration

Updated study setup with coverage/balanced/review choices; event-based activity descriptions and distinct/due/mastery metrics; explicit bookmark intent and caller-scoped create/duplicate receipts with read reconciliation and explicit identical retries; archived master weighted scores; retained revision payloads. Unknown create text/image intent stays frozen until reconciliation, with account/server-scoped pending identities persisted separately from sensitive draft text/images. See [backend policies and fresh-schema requirements](../../backend/docs/learningConsistency.md).

JS/extracted Vue script syntax, locale JSON and CRLF-aware whitespace source checks only; no Vue compilation/browser/HTTP/accessibility verification, builds, suites, migrations, database actions, deployment or versions. Verify response loss, pending resets/account switches, revision conflicts, strategy payloads, activity dates/metrics, archived results and bilingual/RTL controls after coordinated rollout.

Verify the matching category/case/tag/settings revisions and browser operation-identity restart recovery; see [work log](workDone.md). Restored create checks must never apply fresh text/images to the earlier result.

## 2026-10-09 project rescan follow-up

The [new source review](../../Android/docs/projectRescan.md) identifies seven additional bounded gaps: web account-generation guards; orphan pending-create/form association; transactional question ownership checks; knowledge-delete revisions; terminal/deleted receipt recovery; web conflict resolution; learner case pagination/read retention. All seven are now addressed in source; remaining checks are runtime release gates.

The seven rescan findings are source-complete. Validate coordinated DELETE/receipt contracts, account-switch cancellation, conflict review, orphan-save recovery and learner paging; see the latest [work log](workDone.md).

## 2026-10-09 deeper transaction/lifecycle findings

The [deeper source review](../../Android/docs/deepTransactionReview.md) records eight new follow-up areas: knowledge/learning lock order, import revision reuse, master attempt resume/makeup and fresh access gates, master answer/navigation concurrency and web uncertainty handling, polling disposal/attempt scope, and planner revision/scope epochs. All eight findings are now source-complete; verify coordinated contracts, fresh planner schema and live interleavings. See the latest work log.

## 2026-10-10 deeper consistency release scenarios

- Lose master answer responses before/after commit; compare full saved slot, keep/rebase/discard draft explicitly, and verify no automatic resend. Change the same answer/confidence on two devices and verify 409 without overwriting either draft. Check legacy native draft recovery.
- Race answer/goto/current-question/finish and expiry; stale navigation must reject and GET must not change position. Resume normal attempts after closes_at and retry makeup starts: no second attempt or extended timer. Remove audience/co-attending/group membership during new start/preview; verify fresh authorization while existing owned work remains readable.
- Change exam routes as the same user while reads/writes complete; hide/show/unmount during polling backoff. Old responses must not replace the new attempt or restart orphan timers/navigation.
- Edit/delete/recreate planners on two clients; verify retained id/revision conflicts and explicit Keep draft/Use server. Lose accepted update responses and fail post-save reads; preserve confirmed configuration and drafts.
- Record offline answers before/after filter/date resets, then upload late; original scope gets credit, today's reset does not regain old activity. Rename/merge planner tags: preserve today's progress without copying counts. Cross midnight after a reset: historical daily totals include pre-reset activity exactly once. Preserve global heatmap/learning evidence.
- Import replacements carrying lower/equal source revisions, then save old editors: stale local revisions reject. Exercise parent edits, learning completion, tag merge and import on the deployed server database for lock cycles, rollback and large-import contention.
- Verify fresh planner schema and coordinated API rollout, bilingual/RTL/large-text/focus/TalkBack controls. These are pending manual checks, not completed runtime evidence.
