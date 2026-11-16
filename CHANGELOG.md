# Changelog

## 0.0.2 (2026-11-16)

### Bug fixes

- Fix the GitHub remote-parsing regex so the owner and repo are captured with named groups and the `u` flag is used for correct Unicode handling. Previously the script could crash with a type error, or fall back to `unknown` for the owner and repo.

### Changes

- Align `biome.json` with the Biome 2 schema (`files.includes`, `assist.actions.source.organizeImports`) and disable rules that conflict with this codebase.
- Apply `biome check --write` formatting and import sorting across the codebase.
