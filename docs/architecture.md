# Architecture

## 1. Architecture Status

Telkit is being developed incrementally.

This document separates:

- **current architecture** — verified from the repository;
- **near-term target architecture** — expected once CLI + local MCP share logic;
- **future architecture** — only for later deployment phases.

Agents must not treat target diagrams as proof that packages already exist.

---

# 2. Current Architecture

At the repository snapshot used to create this document:

```text
Terminal
   |
   | CLI arguments
   v
packages/cli
   |
   | HTTPS POST
   | Telegram bot token from environment
   v
Telegram Bot API
```

The CLI currently:

- uses Commander;
- accepts a Telegram chat ID;
- accepts message text;
- reads `TELEGRAM_BOT_TOKEN`;
- calls Telegram's `sendMessage` endpoint;
- evaluates Telegram/HTTP success;
- prints the result.

This is intentionally a small starting point.

---

# 3. Near-Term Target Architecture

Once local MCP exists, Telegram behavior should be shared:

```text
+----------------+
| Terminal/User  |
+-------+--------+
        |
        v
+---------------+
|  CLI adapter  |
+-------+-------+
        |
        |
        v
+----------------------+          +--------------------+
|  Shared Telkit Core  |--------->| Telegram Bot API   |
+----------------------+   HTTPS  +--------------------+
        ^
        |
        |
+-------+--------+
| Local MCP     |
| stdio adapter |
+-------+--------+
        ^
        |
        | MCP / stdio
        |
+-------+--------+
| MCP Client    |
+----------------+
```

Preferred workspace direction:

```text
packages/
├── core/
│   └── reusable Telegram operations and schemas
├── cli/
│   └── CLI-specific adapter
└── local-mcp/
    └── MCP stdio adapter
```

---

# 4. Responsibility Boundaries

## Core

Expected responsibilities:

- input schemas/types shared between adapters;
- Telegram API request logic;
- Telegram response parsing;
- normalized results;
- normalized domain/integration errors.

Core should not know:

- Commander;
- terminal colors/prompts;
- MCP transport;
- MCP tool result formatting;
- process exit codes;
- HTTP server framework.

## CLI Adapter

Responsibilities:

- parse CLI arguments;
- read CLI/runtime configuration;
- call core;
- map errors to terminal output/exit behavior;
- print user-friendly results.

## Local MCP Adapter

Responsibilities:

- create/register MCP tools;
- run using stdio;
- validate MCP tool input;
- read server process configuration;
- invoke core;
- translate results/errors into MCP-compatible responses.

---

# 5. Dependency Direction

Allowed:

```text
cli -------> core
local-mcp -> core
```

Avoid:

```text
core -> cli
core -> local-mcp
```

The adapters can change independently while core remains reusable.

---

# 6. Local MCP Runtime Model

Local MCP is a child/local process, not a public web service.

```text
MCP host/client
      |
      | starts process
      v
Telkit local MCP
      |
      | stdin/stdout protocol traffic
      v
tool handler
      |
      v
core
      |
      | HTTPS
      v
Telegram
```

Operational consequences:

- no public MCP port is needed;
- no reverse proxy is needed;
- no MCP TLS endpoint is needed;
- no cloud deployment is required for local MCP;
- stdout is part of the protocol channel and should not be used for arbitrary logs.

---

# 7. Configuration Boundary

Operation input:

```text
chatId
message
```

Sensitive process configuration:

```text
TELEGRAM_BOT_TOKEN
```

The token belongs to runtime configuration, not the public operation schema.

---

# 8. Future Remote Architecture

When remote MCP becomes an explicit phase:

```text
MCP Client
    |
    | HTTPS
    v
DNS / TLS
    |
    v
Reverse Proxy / Edge
    |
    v
Telkit Remote MCP Container
    |
    v
Shared Core
    |
    v
Telegram Bot API
```

This phase introduces new concerns:

- authentication;
- authorization;
- TLS;
- public network exposure;
- health checks;
- rate limits;
- deployment;
- observability;
- rollback.

An ADR must be written before finalizing the remote hosting model.

---

# 9. Architecture Non-Goals

Do not add without a concrete requirement:

- microservices;
- event buses;
- Redis;
- PostgreSQL;
- Kafka;
- Kubernetes;
- service mesh;
- multi-region deployment.

A small single-purpose application should remain a small single-purpose application until evidence says otherwise.
