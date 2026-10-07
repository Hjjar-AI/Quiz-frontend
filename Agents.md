# Agent Instructions

## Scope

- This folder contains the Vue frontend.
- Preserve the existing service, store, component, and localization patterns.
- Treat the backend API response envelope and endpoint contracts as authoritative.
- Check `../backend` when a frontend change depends on an API shape.

## Working rules

- Do not review test-suite files unless explicitly requested.
- Do not modify the Android project unless the task explicitly includes it.
- Preserve unrelated user changes in a dirty worktree.
- Use the existing download, notification, API-client, and localization helpers
  instead of adding parallel implementations.
- Validate user-visible text in both Arabic and English when applicable.

