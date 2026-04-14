# Approval boundaries

- Do not run `pnpm deploy:docker` or `pnpm deploy:docker:local` as routine verification. `deploy:docker` logs into and pushes to a hardcoded private registry, and `deploy:docker:local` writes `images.tar` into the repo root. Only run them when the user explicitly asks.
- Treat values in `env/.env` as sensitive input. Never quote them back in chat, docs, commits, or generated examples.

# Landmines

- BullMQ queue definitions now live in `env/bullmq.config.jsonc`, and that file is intentionally gitignored as private config. Keep the loader path and README example in sync.
- `test/app.e2e-spec.ts` is still the Nest starter test and asserts `GET /` returns `Hello World!`; it is not a reliable description of current Bull Board behavior.
- `package.json` metadata still describes another service (`rag-server`). When summarizing this repo, trust the actual runtime wiring instead of the package metadata.

# Task-specific constraints

- Auth, route mounting, and Bull Board queue wiring are assembled inline in `src/app.module.ts`. Prefer surgical edits there instead of broad refactors.
- When adding or renaming env vars, update `src/config/config.validate.ts` and `src/app.d.ts` in the same change.

# Coding constraints

- Add `/** ... */` JSDoc above every exported function and every `static` class method. Add short inline comments for non-obvious business logic.
- Do not introduce business magic numbers. Promote state, type, task, and switch values into semantic `enum`s before using them in controllers or services.
- Merge `import` and `import type` from the same path into a single statement.
- Keep service responsibilities explicit: writes belong in `*-modify.ts`, reads belong in `*-query.ts`, shared reusable capabilities stay in common service files, and only move orchestration into `logic/` when it is genuinely substantial.
- Avoid over-encapsulation. Do not extract tiny helpers of roughly four lines unless they are reused or carry meaningful business semantics.
- Use readable SQL aliases with complete or clearly meaningful words; do not introduce aliases like `stc` or `ct`.
- Fix TypeScript types precisely. Do not use `any`, `unknown`, `as any`, or `as unknown as ...` as escape hatches.
