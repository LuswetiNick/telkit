# Development Workflow

## 1. Goal

Use a lightweight professional workflow that creates a clear Git history and supports later CI/CD enforcement.

---

## 2. Branching Strategy

Keep `main` releasable.

Use short-lived branches:

```text
feat/*
fix/*
chore/*
docs/*
test/*
ci/*
build/*
infra/*
security/*
```

Examples:

```text
feat/local-mcp
chore/add-linting
test/telegram-core
ci/pr-quality-gates
build/docker-image
infra/production-host
```

Avoid a long-lived `develop` branch unless the team/project later has a real need for it.

---

## 3. Pull Request Strategy

Once branch protection is enabled:

```text
feature branch
      ↓
pull request
      ↓
CI + review
      ↓
main
```

One PR should preferably represent one coherent concern.

Good:

```text
chore: add formatting and linting
test: add telegram core tests
ci: add pull request quality checks
```

Avoid:

```text
feat: add tests docker terraform monitoring and deploy
```

---

## 4. Commit Style

Use clear conventional-style prefixes:

```text
feat:
fix:
docs:
test:
chore:
ci:
build:
refactor:
security:
```

Examples:

```text
feat: add telegram CLI command
docs: document local MCP architecture
test: cover telegram API error handling
ci: run quality checks on pull requests
```

---

## 5. Local-First Quality Checks

Before putting a check into CI:

1. understand it;
2. configure it locally;
3. make it reliable;
4. add a package script;
5. run it;
6. then automate it.

Expected eventual scripts may include:

```text
format
format:check
lint
typecheck
test
test:coverage
build
check
```

Do not add documentation claiming a script exists until it actually exists.

The current local pre-test quality gate is:

```bash
bun run check
```

It runs formatting verification, linting, and type checking sequentially. It
currently excludes tests and build/package verification; how later phases
compose those checks will be decided when they are established.

### Workspace Script Ownership

Executable workspace packages own their development entrypoint commands. Root
scripts orchestrate those package-owned scripts through Bun workspace filters,
so the root does not need to know package source paths. Internal adapter
dependencies on `telkit-core` use `workspace:*` to make local workspace
resolution explicit.

These development conventions do not define the eventual npm package contract.
Package publication boundaries, names, entrypoints, exports, build output,
version ownership, and publishing automation remain deferred to the packaging
phase. That phase will also resolve the existing `0.0.0` package metadata versus
`1.0.0` CLI-reported version discrepancy.

---

## 6. Pull Request Description

A PR should explain:

### What

What changed?

### Why

What problem does it solve?

### Scope

What is intentionally not included?

### Verification

What commands/tests were run?

### Risk

What could break?

### Security

Does it change credentials, dependencies, network exposure, permissions, or logging?

---

## 7. Suggested Early PR Sequence

After the local MCP baseline:

### PR 1

```text
docs: establish project engineering documentation
```

### PR 2

```text
chore: establish code quality tooling
```

### PR 3

```text
test: add telegram core and adapter tests
```

### PR 4

```text
ci: add pull request quality gates
```

### PR 5

```text
chore: configure main branch ruleset
```

Repository settings are not code, so document the final ruleset in the PR/README/docs.

---

## 8. Agent-Assisted Development

Codex should:

- inspect before editing;
- explain significant changes;
- keep tasks phase-scoped;
- run relevant checks;
- avoid silently adding unrelated dependencies;
- avoid later-phase infrastructure;
- surface trade-offs;
- preserve secrets.

The developer should review diffs and be able to explain important code/configuration.

---

## 9. Definition of Ready for CI

Do not create CI merely because GitHub Actions is available.

CI is ready when:

- local scripts exist;
- they pass locally;
- tests are deterministic;
- secret needs are understood;
- a clean dependency install works.

---

## 10. Definition of Done

A normal PR is done when:

- scope is implemented;
- relevant checks pass;
- tests cover behavior changes;
- docs match behavior;
- no secrets are added;
- PR can be safely reverted if needed.
