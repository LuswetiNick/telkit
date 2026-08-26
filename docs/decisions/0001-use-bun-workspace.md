# ADR 0001 — Use a Bun Workspace

- **Status:** Accepted
- **Date:** 2026-08-26

## Context

Telkit is expected to expose shared Telegram functionality through more than one interface.

The initial repository already uses a root package with:

```json
{
  "workspaces": ["packages/*"]
}
```

and Bun as its package manager/runtime tooling.

Likely packages include:

- CLI;
- shared core;
- local MCP;
- remote MCP later.

These components are strongly related and should evolve together.

## Decision

Use a single repository with Bun workspaces for Telkit packages.

## Rationale

A workspace provides:

- one source repository;
- one lockfile;
- shared developer tooling;
- atomic cross-package changes;
- simple CI;
- straightforward local linking between packages.

This is appropriate for the current project size.

## Consequences

### Positive

- easier dependency management;
- shared tooling;
- simple changes across adapters/core;
- good fit for a solo developer.

### Negative

- package boundaries must be maintained intentionally;
- root scripts/tooling need care as packages grow.

## Alternatives Considered

### Separate repositories

Rejected for now because the components are tightly coupled and the operational overhead would provide little value.

### Microservices

Not applicable. Workspace packages are code organization, not independently deployed services.

## Revisit When

Reconsider only if packages acquire independent teams, release lifecycles, access controls, or deployment requirements.
