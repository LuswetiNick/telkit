# AGENTS.md — Telkit

## Purpose

This file is the primary operating context for coding agents working in the Telkit repository.

Read this file before making changes. Then read the documentation relevant to the current task under `docs/`.

The repository and checked-out working tree are always the source of truth. Documentation describes intent and architecture, but agents must inspect the actual code before editing.

---

## Project Summary

**Telkit** is a TypeScript/Bun Telegram integration toolkit designed to expose Telegram capabilities through multiple interfaces, beginning with a command-line interface and a local Model Context Protocol (MCP) server.

The project is also a practical DevOps learning and portfolio project. It will progressively demonstrate:

- modular application design;
- automated testing;
- code-quality gates;
- Continuous Integration;
- containerization;
- secure build pipelines;
- artifact publishing;
- Continuous Delivery/Deployment;
- Infrastructure as Code;
- Linux/server operations;
- observability;
- security hardening;
- release and rollback practices.

The goal is not to maximize infrastructure complexity. Every tool or platform must solve a clear engineering or operational problem.

---

## Current Repository Baseline

At the time this documentation was created, the public `main` branch contained:

```text
telkit/
├── .env.example
├── .gitignore
├── bun.lock
├── package.json
├── tsconfig.json
└── packages/
    └── cli/
        ├── package.json
        └── src/
            └── index.ts
```

Current root characteristics:

- Bun workspace using `packages/*`.
- Root package name: `telkit-workspace`.
- CLI package name: `telkit`.
- CLI uses Commander.
- The CLI currently exposes a `telegram` command.
- Telegram authentication is supplied through `TELEGRAM_BOT_TOKEN`.
- `.env` and `.env.*` are ignored while `.env.example` is allowed.

The developer may have additional local work that is not yet visible on the public branch. Always inspect the working tree before assuming this snapshot is current.

---

## Product Direction

Telkit should evolve toward this logical structure:

```text
                    +------------------+
                    |   Telegram API   |
                    +---------+--------+
                              ^
                              |
                        shared core
                              |
            +-----------------+-----------------+
            |                                   |
     +------+-------+                    +------+-------+
     | CLI adapter  |                    | MCP adapter  |
     +--------------+                    +--------------+
```

Later, a remote MCP adapter may be added without duplicating Telegram business logic:

```text
packages/
├── core/
├── cli/
├── local-mcp/
└── remote-mcp/        # later phase
```

Do not create future packages merely because they appear in this target diagram. Add them only when the current phase requires them.

---

## Current Development Responsibility Split

### Developer-led application work

Until the local MCP milestone is complete, the developer is primarily implementing and learning the application functionality.

Agents may:

- explain code;
- review code;
- identify risks;
- suggest small improvements;
- fix requested defects;
- help verify behavior.

Agents must **not** race ahead and build later application phases unless explicitly instructed.

### Codex/agent-led engineering and DevOps work

After the local MCP baseline is complete, agents will be used heavily to help implement and explain:

1. repository engineering standards;
2. formatting/linting/type checking;
3. automated tests;
4. GitHub Actions CI;
5. branch/ruleset quality gates;
6. packaging and releases;
7. Docker;
8. security scanning;
9. CD;
10. infrastructure automation;
11. monitoring and observability;
12. operational documentation.

---

## Phase Gate Rule

Never implement a later phase just because it exists in the roadmap.

Before starting a task:

1. identify the current phase;
2. read its exit criteria;
3. verify prerequisites;
4. make the smallest change that advances that phase.

Do not add:

- Docker before containerization is the active phase;
- Terraform before deployment infrastructure is understood;
- Kubernetes unless a concrete requirement later justifies it;
- monitoring stacks before there is a deployed service worth monitoring;
- remote MCP infrastructure while the project is still local-only.

---

## Architecture Principles

### 1. Core logic must be interface-independent

Telegram business logic should eventually live outside the CLI/MCP adapters.

Adapters should handle interface-specific concerns such as:

- argument parsing;
- MCP tool registration;
- environment/configuration access;
- input/output formatting;
- process-specific error presentation.

Core logic should handle:

- Telegram request construction;
- response parsing;
- shared validation where appropriate;
- normalized operation results;
- reusable errors.

### 2. Keep dependency direction inward

Preferred direction:

```text
cli -------> core
local-mcp -> core
remote-mcp -> core
```

Avoid:

```text
core -> cli
core -> local-mcp
```

### 3. Avoid duplicate Telegram implementations

Do not create independent `fetch()` implementations for CLI and MCP when a shared operation can be reused.

### 4. Prefer simple architecture

Telkit does not currently require:

- microservices;
- a database;
- Redis;
- message queues;
- Kubernetes;
- a service mesh.

Do not introduce them without a demonstrated requirement.

---

## MCP Rules

For local MCP:

- use stdio;
- treat stdout as protocol output;
- do not emit arbitrary debug logs to stdout;
- send diagnostics to stderr or an appropriate logging mechanism;
- keep secrets out of tool arguments;
- expose focused, predictable tool schemas.

When remote MCP is introduced, reassess:

- authentication;
- authorization;
- HTTP security;
- TLS;
- rate limiting;
- request limits;
- session model;
- deployment topology.

Do not design local MCP as if it were already a public internet service.

---

## Secret Management Rules

`TELEGRAM_BOT_TOKEN` is sensitive.

Never:

- hardcode it;
- commit it;
- print it;
- include it in test snapshots;
- include it in CI logs;
- bake it into Docker images;
- pass it as an MCP tool argument;
- include real values in documentation.

Use:

```text
.env.example
```

only for variable names/placeholders.

Before adding CI or deployment configuration, explicitly identify where secrets come from and where they are injected.

---

## Learning Mode

The developer is using Telkit to learn software engineering and DevOps.

For meaningful changes, explain:

1. **What** is changing.
2. **Why** it is needed.
3. **How** it works.
4. **How** it is verified.
5. **What trade-offs** were considered.

Do not hide important engineering concepts behind generated configuration.

Prefer a smaller implementation the developer can explain in an interview over a sophisticated implementation they cannot.

---

## Agent Workflow

Before modifying code:

1. Read `AGENTS.md`.
2. Read relevant docs.
3. Inspect `git status`.
4. Inspect package manifests and scripts.
5. Inspect the files involved.
6. Confirm the current phase from `docs/roadmap.md`.

During implementation:

1. Keep scope narrow.
2. Avoid unrelated refactors.
3. Preserve existing behavior unless changing it is part of the task.
4. Add or update tests when behavior changes.
5. Keep credentials out of code/logs.
6. Update docs if architecture, setup, commands, or operations change.

Before finishing:

1. Run relevant existing checks.
2. Do not claim a check passed if it was not run.
3. Report changed files.
4. Report commands executed.
5. Report failures or unverified assumptions.
6. Suggest the next small step, not an entire future phase.

---

## Git Workflow

Prefer short-lived branches and pull requests.

Branch examples:

```text
docs/project-foundation
chore/code-quality
test/telegram-core
ci/pull-request-checks
feat/local-mcp
feat/remote-mcp
build/container-image
infra/production-vm
```

Recommended commit prefixes:

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

Do not push directly to `main` once branch protection/rulesets are enabled.

Do not rewrite published history unless explicitly requested.

---

## Quality Philosophy

A professional pipeline is not a collection of badges.

Each check should answer a concrete question:

```text
formatter  -> is formatting consistent?
linter     -> are code-quality rules satisfied?
typecheck  -> does TypeScript type analysis pass?
tests      -> does expected behavior still work?
build      -> can the distributable artifact be created?
security   -> are known risks detected?
smoke test -> does the built application actually start/respond?
```

Prefer local reproducibility:

```text
understand command
      ->
run locally
      ->
make reliable
      ->
automate in CI
```

not:

```text
copy CI template
      ->
debug unknown commands in GitHub Actions
```

---

## Definition of Done

A task is complete when:

- requested scope is implemented;
- relevant tests/checks pass;
- no secret was introduced;
- documentation is updated when necessary;
- the change is understandable;
- no later-phase infrastructure was added without justification.

---

## Documentation Map

Read these when relevant:

- `docs/project-overview.md` — product intent and goals.
- `docs/requirements.md` — functional/non-functional requirements.
- `docs/architecture.md` — current and target architecture.
- `docs/roadmap.md` — phase gates and milestones.
- `docs/development-workflow.md` — branches, PRs, commits, checks.
- `docs/testing-strategy.md` — test layers and CI testing rules.
- `docs/security.md` — secret handling and threat considerations.
- `docs/ci-cd-plan.md` — CI/CD progression.
- `docs/decisions/` — architecture decision records.

---

## Immediate Rule

If the checked-out repository does not yet contain the local MCP implementation, do not create it automatically unless explicitly asked.

If it does contain the local MCP implementation, first verify its behavior and architecture before beginning DevOps changes.
