# ADR 0002 — Separate Telegram Core Logic from Interface Adapters

- **Status:** Proposed
- **Date:** 2026-08-26

## Context

The current CLI directly contains Telegram API integration logic.

As long as only one interface exists, this is simple.

Once a local MCP adapter is introduced, implementing Telegram API calls independently in both CLI and MCP would create duplication.

That duplication would make it harder to:

- test behavior once;
- normalize errors;
- add timeouts/retry policies;
- change Telegram request handling;
- keep CLI and MCP behavior consistent.

## Decision

When the second interface requires Telegram messaging, extract reusable Telegram behavior into a shared core package/module.

Target:

```text
cli -------> core -------> Telegram API
local-mcp -> core -------> Telegram API
```

## Core Responsibilities

- Telegram request logic;
- shared schemas/types where useful;
- response normalization;
- reusable errors;
- integration-specific rules.

## Adapter Responsibilities

### CLI

- Commander configuration;
- CLI arguments;
- terminal output;
- exit behavior.

### MCP

- MCP server/tool registration;
- stdio transport;
- MCP result formatting.

## Consequences

### Positive

- one Telegram implementation;
- improved testability;
- clean dependency direction;
- easier addition of remote MCP later.

### Negative

- adds a package/module boundary;
- may initially feel more complex than one file.

## Guardrail

Do not create abstraction layers beyond what the two adapters actually need.

The goal is reuse and separation of interface concerns, not a large "clean architecture" framework.
