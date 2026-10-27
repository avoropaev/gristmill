# Maintain a local patched build

This procedure maintains one personal build while upstream development continues.
The maintained source branch is `codex/local-maintained`. Topic branches remain
available for issue links and code review. Do not rewrite their history.
For repository roles, branch history and new feature work, read the
[personal fork workflow](personal-fork-workflow.md).

## Required behavior

Keep these behaviors through each upstream merge until upstream supplies a tested
equivalent:

- All local diarization inputs pass through `DiarizationManager.diarize`. Reuse
  16 kHz mono PCM16 WAV input. Convert other inputs to a private temporary WAV.
  Preserve the source and clean temporary output on success, failure and abort,
  including conversion failure. An empty meeting diarization result is a failed
  run, not a request for new settings.
- Companion supports the exact HTTPS origins `telemost.yandex.ru` and
  `telemost.360.yandex.ru`, and 10- or 14-digit room identifiers on the supported
  routes. URL recognition, adapter selection, worker transitions, the manifest
  and desktop validation must agree. Keep sender, frame, document and session
  checks, the production extension key and its installed directory.
- Preprocessing cancellation tests must isolate model directories without
  migrating or removing the user's model cache.

The local changes are separate commits on the same maintained branch. Do not
drop a change only because an upstream commit or issue has a similar title.
Read the implementation and run its regression tests first. Keep the regression
tests when an upstream implementation replaces local code.

## Prepare an update

1. Read the repository instructions and check all relevant working trees. Keep
   unrelated changes and active build processes. Fetch upstream `main` and the
   personal remote. Upstream `main` is the selected update source; GitHub Releases
   are not required for this personal build.
2. Resolve exact SHAs before changing files. The private Git ref
   `refs/gristmill/installed` records the last verified installed source. If both
   upstream and maintained source are already included in that ref, no update is
   needed. A new local fix also requires an update even if upstream did not change.
   Documentation-only changes do not require a new application package. Inspect
   changed paths and runtime/build inputs, not only tip hashes. Keep the installed
   receipt unchanged when no new package is installed.
3. Create an isolated candidate branch and worktree from `codex/local-maintained`.
   Merge the selected upstream SHA there. Do not rebase, force-push, reset the
   maintained branch or build directly in a working tree with unrelated changes.
4. Resolve conflicts by preserving required behavior, with the upstream structure
   where possible. Remove redundant local implementation only after equivalent
   upstream behavior passes the regression tests. If correctness is uncertain,
   preserve the candidate for review and leave the installed app unchanged.
5. Run focused regression checks, then the full canonical test suite, all
   typechecks, lint and the renderer/Companion builds. Follow current project
   commands and pinned dependencies. Serialize checks and builds that share
   generated output. Use synthetic profiles and audio only. Do not use private
   meetings as fixtures or migrate the production model cache.

## Build and install

1. A persistent `Gristmill Local Signing` identity must be available in the login
   keychain. If it is absent or needs interactive access, stop before installation
   and request user setup. Never create a private key unattended, substitute an
   ad-hoc signature, reset TCC or broaden security settings to continue.
2. Build with the repository's persistent local signing path. Verify the package
   with `codesign --verify --deep --strict`, its bundle identifier, Companion
   identity and supported origins. Exercise the packaged diarization helper with
   synthetic audio and the real local engine. Do not open an empty-profile GUI
   where it can be mistaken for the user's normal profile.
3. Before installation, confirm that the maintained tip did not advance during
   candidate preparation. If it advanced, merge the new accepted source into the
   candidate and repeat the affected checks and package verification first.
   Install only when Gristmill is closed and no capture or processing is active.
   Do not stop an active meeting or quit the app without user involvement. Keep a
   verified candidate if installation must wait; check it again on the next run.
4. Back up the closed production profile to a private archive outside the source
   checkout, and retain the previous app through `install-macos-local.cts`. Keep
   backup paths available for recovery. Use the installer staging and rollback
   path; do not replace the app with a plain recursive copy or keep renamed app
   bundles that can confuse macOS permission lists.
5. Launch only the normal production profile. Check the installed package and
   normal profile availability. Do not change settings, auto-start a recording,
   upload private data or change browser permissions. Companion keeps its
   installed path; if Chrome needs a manual reload, report that explicitly.
6. Only after verification, fast-forward `codex/local-maintained` to the candidate,
   update `refs/gristmill/installed` and push the maintained branch to the personal
   remote without force. Preserve both the source history and the previous app
   archive. A source push failure must be reported honestly.

An installation failure must retain or restore the previous app through the
installer. A profile migration failure needs the profile backup; do not overwrite
new user changes automatically. Report the exact recovery step needed instead.
Do not report an update as installed when it is only built or awaiting setup.
