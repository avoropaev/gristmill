# Gristmill agent rules

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
