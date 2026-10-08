# Work Plan

## Current priorities

1. Keep frontend export options aligned with the backend request serializer.
2. Surface backend PDF limit errors clearly without replacing their localized messages.
3. Perform a browser download smoke check after the backend PDF runtime is available.
4. Keep theme and locale parameters synchronized with new visual themes or supported languages.

## Verification

- Lint needs installed dependencies; builds additionally require explicit user permission under [Agents.md](../Agents.md).
- Do not inspect or run test suites unless explicitly requested.

## Development startup verification

- With Node and dependencies installed, load the Vite config and verify API/media proxying to ports 5004/5005, occupied-port errors, and matching CSRF browser origins.
