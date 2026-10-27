# Gristmill agent rules

## Public repository: approval before every push

This fork is public. Every push to any remote requires fresh explicit approval
from Alexey for that exact publication. This includes topic branches, tags,
maintenance updates and scheduled runs. Before asking, show the destination,
branch/ref names, commit IDs, scope and secret/privacy scan results. If the scope
or commits change, obtain approval again. Earlier push approval and permission
to implement, commit, build or install do not authorize another push.
Prepare and verify changes locally first. An unattended run must leave publication
pending and request approval. Check both author and committer metadata as well
as file contents. Use the account's GitHub noreply email in this public repository;
cherry-pick can retain an older author email even after local config changes.
Never force-push or rewrite published history
without separate approval for the exact rewrite.

## Start here

1. Read [.memory-bank/index.md](.memory-bank/index.md). Then read only the documents that your task needs.
2. Before you select or run checks, read the [quality steering](.memory-bank/steerings/quality.md).
3. Before you write documentation, read the [documentation steering](.memory-bank/steerings/documentation.md).

## Personal fork

This checkout maintains `avoropaev/gristmill`. Before feature, branch or upstream
integration work, read [the fork workflow](.memory-bank/runbooks/personal-fork-workflow.md).
Base new `codex/<topic>` branches on `codex/local-maintained`, not `main` or the
historical repair branch. `origin` is the original repository; push personal
changes to `personal`. The installed receipt `refs/gristmill/installed` can lag
the source branch. Follow the linked update procedure before any installation.

## Main commands

- `pnpm install --frozen-lockfile` — install dependencies (Node 24 or later, pnpm 10.19.0).
- `pnpm dev` — start the renderer and the development Electron app.
- `pnpm run typecheck` — run all typecheck targets.
- `pnpm run lint` — lint the root and renderer code.
- `pnpm test` — run the full suite. Select a part with `--domain` and `--kind`.
- `pnpm run build:renderer` — examine the renderer bundle.

Full command semantics: [project commands](.memory-bank/steerings/project-commands.md).
