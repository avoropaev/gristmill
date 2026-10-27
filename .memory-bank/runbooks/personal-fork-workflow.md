# Personal fork and branch workflow

This checkout maintains the personal fork of Gristmill. Read this document before
starting a feature, changing branches or integrating upstream changes.
Every push requires fresh explicit approval from Alexey because the fork is public.
Before requesting approval, show the remote, refs, exact commits, scope and
secret/privacy scan results. Changed commits or scope require new approval.
Do not infer publication permission from an earlier approval or from a request
to implement, commit, build or install. This applies to every branch, tag and
scheduled run. Leave publication pending during unattended work. Read
[local patch maintenance](local-patch-maintenance.md) before building or installing
an upstream update.

## Repositories and branch roles

The primary checkout is `~/projects/gristmill`. The local Codex project is
`gristmill` and uses this folder as its primary source. Obsidian and the separate
AI automation repository are not dependencies of this project.

| Name                                    | Role                                            | Rule                                                                                                                                  |
| --------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `origin`                                | Original repository: `timurkhakhalev/gristmill` | Fetch upstream changes. Do not push personal changes here.                                                                            |
| `personal`                              | Personal fork: `avoropaev/gristmill`            | Push local features and the maintained branch here.                                                                                   |
| `origin/main`                           | Upstream development branch                     | This is the update source. The original branch is `main`, not `master`.                                                               |
| Local `main`                            | Unmodified upstream tracking branch             | Do not start personal features here. Advance only by fast-forward to upstream when needed.                                            |
| `codex/local-maintained`                | Accepted source for the personal build          | Contains all accepted local features and upstream merges. This is the default base for new work.                                      |
| `codex/meeting-diarization-16khz`       | Historical mixed repair branch                  | Contains WAV and Companion changes. Keep old references intact; do not present it as a Telemost-only contribution.                    |
| `codex/fix-telemost-360`                | Scoped contribution for issue #445              | Based on upstream main and contains only the Telemost change. Publish only after approval; update issue links only after publication. |
| `codex/<topic>`                         | One new feature or repair                       | Branch from the maintained source and merge back after review and checks.                                                             |
| `codex/local-update-<date>-<short-sha>` | Upstream integration candidate                  | Merge upstream into an isolated candidate. Promote only after the update procedure passes.                                            |
| `refs/gristmill/installed`              | Local receipt for the installed source          | Update only after installing and verifying that source. It is not a development branch.                                               |

Remote names are deliberate: `origin` points to the original repository and
`personal` points to the fork. Do not assume that `origin` is the fork. A fork
`main` branch, if present, is not the source of the maintained application.

## Why these branches exist

The following history was verified on 2026-10-27. Commit IDs describe provenance;
they are not instructions to reset a branch to an old version.

| Commit    | Change                                                                                                                                                                                                     |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `2198395` | Upstream base from which the local repairs started.                                                                                                                                                        |
| `644df96` | Added a separate 16 kHz mono input for meeting diarization. Stored 24 kHz audio remains unchanged.                                                                                                         |
| `3dac007` | Fixed preprocessing test isolation so tests cannot migrate and remove the user's model cache. This is a test isolation repair, not a third product feature.                                                |
| `f76309b` | Added Telemost 360 and 10/14-digit room support across Companion and desktop validation. Companion became version 0.3.1 with the same extension identity.                                                  |
| `b7aa87d` | Generalized WAV preparation to the shared diarization entry point, skipped compatible PCM16 WAVs, retained cleanup and integration coverage, and changed empty meeting diarization from blocked to failed. |
| `b613d71` | Added the local update procedure and became the first verified installed source with the persistent local signing certificate.                                                                             |

Both repairs were initially committed on `codex/meeting-diarization-16khz`.
The branch name does not imply that it contains only the WAV repair. The
maintained branch was created from this combined history and then received the
update runbook. Do not cherry-pick these repairs onto the maintained branch again.

The separate `codex/fix-telemost-360` branch carries the same Telemost patch as
`f76309b`, applied directly to the upstream base. It excludes the WAV repairs,
model-cache test repair and personal maintenance documents. Issue #445 describes
this scoped change, not the complete mixed branch. Keep its links aimed at the
scoped branch and its own commit after approved publication. Do not merge the
entire maintained branch into this contribution branch.

The comparison ref `refs/remotes/community/diarization-sample-rate` points to
`92af3d6` from
[the community branch for issue #443](https://github.com/sykobets/gristmill/tree/fix/diarization-sample-rate).
There is no configured `community` remote. This commit was used for comparison;
it was not merged into the personal history. Commit `b7aa87d` combines the shared
entry point and failure classification with local cleanup and integration tests.

Public context:

- [#443](https://github.com/timurkhakhalev/gristmill/issues/443): sample rate failure
  and the community implementation.
- [#444](https://github.com/timurkhakhalev/gristmill/issues/444): separate model
  download discoverability problem. These local repairs do not fix that UI.
- [#445](https://github.com/timurkhakhalev/gristmill/issues/445): Telemost 360
  compatibility, including links to the published personal branch and commit.

The live test confirmed call binding and participant-name evidence in a
single-person Telemost call. It did not establish multi-person voice/name
matching quality. The repair does not solve voice over-clustering. Preserve this
scope when describing the fixes.

## Publication privacy

Every push requires fresh approval for the exact destination, refs and commits.
Run a secret scan and inspect sensitive paths, added content, commit messages,
and both author and committer emails first. Use the account's GitHub noreply
address in this repository's local Git configuration. Do not silently change
global Git identity for unrelated work. Cherry-pick preserves author metadata;
changing `user.email` only changes future default identity and does not repair
old commits. Do not attach private audit reports or detected secret values to
public issues or commits. Any proposed published-history rewrite needs separate
approval; local preparation does not authorize a force-push.

## Start and integrate a new feature

1. Inspect Git status, remotes, branches, worktrees and the installed receipt.
   Read the relevant architecture and quality documents. Do not discard unrelated
   changes or stop another chat's processes.
2. Fetch `personal` and confirm the accepted maintained tip. Advance a clean
   local maintained branch with `--ff-only` if the personal remote is ahead.
   If histories diverge, inspect both sides; do not reset or force-push.
3. Create a separate `codex/<topic>` branch from `codex/local-maintained`.
   Use an isolated worktree when work runs in parallel or needs separate build
   output. Keep the primary checkout on the maintained branch when possible.
   Do not start from upstream `main` or the historical repair branch, because
   that would omit accepted personal changes.
4. Implement one scoped change. Include its regression checks and related
   documentation. Apply the repository quality policy; do not test on private
   meeting data. After a secret/privacy scan, request approval for the exact topic commits and
   push to `personal` for review or backup only after approval.
5. If the maintained source advances during feature work, merge that source into
   the topic branch, resolve conflicts there and repeat affected checks. Do not
   rebase published history.
6. After review and successful required checks, merge the topic into
   `codex/local-maintained` with a merge commit (`--no-ff`). Request approval for the exact publication,
   then push the maintained branch to `personal` without force only after approval. This keeps each feature's integration
   visible without losing its original commits.
7. Source integration and application installation are separate actions. Install
   only when requested or under the agreed scheduled update policy. Leave
   `refs/gristmill/installed` unchanged until the installed package is verified.

Do not create an upstream PR automatically. If the user later requests one,
prepare a separate contribution branch from current `origin/main` and select only
the required feature commits, tests and dependencies. A branch based on the
maintained source can include unrelated personal changes and fork instructions.
Check actual GitHub permissions when the contribution is requested; PR creation
was restricted when #445 was filed.

## Merge original changes into the fork

The direction is:

`origin/main` -> isolated update candidate based on `codex/local-maintained`
-> verified maintained source -> `personal/codex/local-maintained`.

Use merge commits to preserve shared history. Do not replace the maintained
branch with upstream, force-sync it, or rebuild the fork from upstream while
forgetting local commits. Resolve conflicts in the candidate, never in an active
feature worktree or the installed application.

The existing automation has ID `gristmill` and is attached to the project
maintenance chat. Update that automation when the user requests a change; do not
create a duplicate scheduler. It checks upstream `main` on Sunday at 10:00
Asia/Omsk. Follow
[local patch maintenance](local-patch-maintenance.md) for the exact update,
verification, backup, persistent signing, installation and promotion rules.
An unresolved conflict, failed required check or unavailable signing identity
must leave the installed application unchanged. Retire a local implementation
only after an upstream equivalent passes its regression checks. Keep those checks.

The installed receipt is intentionally allowed to lag the maintained branch.
Documentation-only commits do not require rebuilding or reinstalling the app and
must not advance the installed receipt. Inspect changed paths before treating a
different source tip as a new runtime version.

## Discover the live state

Use Git as the current source of truth:

```sh
git status --short
git remote -v
git branch -avv
git worktree list
git log --oneline --graph --decorate --all -20
git rev-parse refs/gristmill/installed
git diff --stat refs/gristmill/installed..codex/local-maintained
```

The installed application is `/Applications/Gristmill.app`. Local signing and
profile recovery are documented in [local builds](local-builds.md). Do not put
private profile contents, certificates, keys, meeting links or backups into Git.
