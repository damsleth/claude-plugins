# claude-plugins

Claude Code marketplace (`damsleth`). One plugin per folder under `plugins/`.

## Adding a plugin

1. Put it in `plugins/<name>/` with `.claude-plugin/plugin.json` (`name` = folder name).
2. Add an entry to `.claude-plugin/marketplace.json`: `{ "name", "source": "./plugins/<name>", "description" }`.
3. Add a row to the table in `README.md`.
4. Check: `claude plugin validate .` and `claude plugin validate plugins/<name>`; mods with tests: `claude plugin test plugins/<name>`.

## Gotchas

- Mods (function-hook plugins) are developed in `~/.claude/dev-mods/<session>/` with hot reload; copy them here when done. Never commit `.claude-plugin/types/`: the engine generates it per build.
- A mod's `$.state` keys must be declared inline in `types/index.d.ts` with a named exported type the module imports, or validate fails with "is not declared".
- Bump `version` in `plugin.json` on every change, or installed copies won't update.
