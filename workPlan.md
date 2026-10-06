# Work Plan

## Current priorities

1. Keep frontend export options aligned with the backend request serializer.
2. Surface backend PDF limit errors clearly without replacing their localized
   messages.
3. Perform a browser download smoke check after the backend PDF runtime is
   available.
4. Keep theme and locale parameters synchronized with newly added visual themes
   or supported languages.

## Verification

- Run lint and build checks only when the installed frontend dependencies are
  available.
- Do not inspect or run test suites unless explicitly requested.

