# Frontend automated suite

2026-10-10 · source revision `18729dc` plus the corrections below · Node 24.21.0 / pnpm 12.10.1 / Vitest 5.0.1 / happy-dom.

The final complete run passed **931 tests in 70 files**, with zero failures, skips or TODOs. Reported test duration was 56.63s. [Structured results and per-file coverage](frontendTests.json) retain the baseline failure inventory and final totals. Temporary annotated coverage is at `/tmp/quiz-frontend-suite/coverage/index.html`.

| Coverage metric | Covered / measured | Percent |
| --- | ---: | ---: |
| Lines | 4,403 / 10,236 | 43.01% |
| Statements | 4,892 / 12,116 | 40.37% |
| Functions | 1,097 / 3,960 | 27.70% |
| Branches | 2,111 / 8,895 | 23.73% |

These metrics include unexecuted production files within the existing configured scope (292 files). They exclude `src/main.js`, `src/router/index.js`, declaration/config files and i18n data directories. Router behavior and locale catalogs have separate tests despite these coverage exclusions. Generic component-corpus tests import Vue files and shallow-mount leaf components; this verifies import/mount compatibility, not complete workflow behavior.

## Corrections

The original suite could not start because Vitest tried to merge the production Vite configuration callback without evaluating it. The repaired config evaluates that callback, retaining the production alias and Vue/auto-import pipeline, bounds workers to two and generates a JSON coverage summary. Corrected `adminLinks.test..js` to `adminLinks.test.js` so its four navigation/capability tests are discovered. No package or application versions changed.

After restoring startup/discovery, the baseline ran 921 tests: 873 passed and 48 failed. Repaired stale expectations and fixtures against current production code:

- Iris defaults, Ruby in the supported themes, CSS-driven motion and missing-value em dashes.
- Persistent error toasts, eight-second informational toasts, monotonic identities and timer cleanup.
- Scoped bubbling keyboard events, input/button/modifier guards, RTL arrows and Escape no longer finishing an exam.
- Explicit bookmark desired state, account activation response identity, authenticated question-write recovery storage, revision fields and bounded request/export timeouts.
- Master answer `saved_slot`, session/current-question baselines and session-scoped status responses.
- Atomic question stem/options translation fallback, independently translated case fields and normalized locale keys.
- Concatenated translation keys classified as dynamic prefixes, with bilingual prefix expansion checks; current source-book/account-state endpoint snapshot verified against Django routes.

Added ten regression cases across dynamic locale prefixes, keyboard scope, normalized/partial case and question translations, revisioned case translation saves and explicit account-state writes. Existing tests were retained and updated; none was skipped or disabled to get a passing result.

## Production defects found

`masterExamService.removeQuestion()` referenced undefined `sessionId`/`currentId` variables, throwing before the request. Removed the misplaced navigation fields; composition continues to send `question_id` through its existing caller.

`masterExamService.gotoQuestion()` accepted the session/current-question arguments from the attempt store but omitted them from the POST body. It now sends `session_id` and `expected_current_question_id`, matching the current Django goto serializer. The updated service and store tests assert these preconditions. Backend and Android source were unchanged.

## Remaining verification

Passing unit/integration/component-smoke tests do not establish browser-to-Django HTTP behavior, real DOM layout/focus/accessibility, fonts/themes/RTL on devices, production bundles or print/PDF/download behavior. Vue Router deprecation and shallow-mount context warnings remain visible; there were no unhandled test errors. No production build, backend/database mutation, migration work or dependency/version change was performed.

The largest line gaps are question authoring/list controllers, ordinary/master runner/editor controllers, administration settings/database views and the dashboard controller. See per-file details in the JSON and the shared manual matrix before claiming full coverage or deployed readiness.

## Reproduce

From `frontend/` with the existing installed dependencies:

```bash
pnpm test
pnpm run test:coverage
```

The config defaults to two workers; override explicitly if appropriate. To retain machine-readable suite results and coverage outside the working tree:

```bash
pnpm exec vitest run --maxWorkers=2 --coverage \
  --coverage.reportsDirectory=/tmp/quiz-frontend-suite/coverage \
  --reporter=default --reporter=json \
  --outputFile.json=/tmp/quiz-frontend-suite/final.json
```

Raw run logs remain in temporary storage. The committed report contains no raw stack traces or private application data.
