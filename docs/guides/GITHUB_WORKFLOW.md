# GitHub workflow

The frontend, backend, and Android repositories use `main` as their shared
working branch:

| Project | Repository |
| --- | --- |
| Frontend | [Hjjar-AI/frontend](https://github.com/Hjjar-AI/frontend) |
| Backend | [Hjjar-AI/Quiz-backend](https://github.com/Hjjar-AI/Quiz-backend) |
| Android | [Hjjar-AI/Quiz-Android](https://github.com/Hjjar-AI/Quiz-Android) |

## Feature branch and pull request

Keep `main` releasable; make changes on short-lived branches. Use a prefix such
as `feat/`, `fix/`, or `docs/`:

```bash
git switch main
git pull --ff-only origin main
git switch -c feat/short-description
# edit files, then inspect and validate
git diff
git status
git add <files>
git commit -m "Add short description"
git push -u origin HEAD
gh pr create --base main
```

Review the pull request diff and checks before merging. After merge:

```bash
git switch main
git pull --ff-only origin main
git branch -d feat/short-description
git fetch --prune
```

## Keeping a branch current

To replay unpublished feature commits on the latest `main`:

```bash
git fetch origin
git rebase origin/main
```

If conflicts occur, edit the marked files, run `git add <resolved-files>`, then
`git rebase --continue`. Use `git rebase --abort` to return to the pre-rebase
state. Rebase only commits that have not been shared; coordinate before
rewriting a branch other people use.

## Undo and recovery

- Before staging: `git restore <file>` discards that file's edits.
- Unstage without losing edits: `git restore --staged <file>`.
- Undo a committed change on a shared branch: use `git revert <commit>` and
  push the resulting commit.
- `git reset` and `git push --force` can discard shared work. Avoid them for
  routine fixes. If a rewrite is explicitly coordinated, prefer
  `git push --force-with-lease` and verify the exact branch and expected remote
  commit first.

Check `git status`, `git log --oneline --graph --decorate -12`, and
`git diff origin/main...HEAD` before publishing.

## Authentication

For HTTPS, authenticate with GitHub CLI and configure Git to use it:

```bash
gh auth login
gh auth setup-git
gh auth status
```

Use an account with write access to the repository. Verify the configured
remote with `git remote -v` and authentication with `gh auth status`. Never put
a personal access token in a command, source file, or remote URL.

## Rewritten history

Each repository's current snapshot is the initial, parentless commit on `main`;
the previous commit history was replaced. Existing clones may still contain
old history. Back up any local work, then clone the repository again or
carefully recreate a clean `main` tracking branch. Do not merge old history
back into the rewritten branch. Coordinate any future history rewrite with all
collaborators first.
