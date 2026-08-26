# Requirements

## 1. Scope

This document defines Telkit's initial functional and non-functional requirements.

Requirements evolve by phase. Features from later phases should not be implemented early unless the project explicitly changes scope.

---

# Functional Requirements

## FR-001 — Send Telegram Text Message

Telkit must support sending a text message to a Telegram chat.

Input:

- Telegram chat identifier;
- text message.

Expected output:

- clear success result;
- Telegram message identifier when available.

Failures must produce actionable errors without exposing secrets.

---

## FR-002 — Environment-Based Telegram Authentication

Telkit must read the Telegram bot credential from configuration/environment.

Current variable:

```text
TELEGRAM_BOT_TOKEN
```

The credential must not be required as a normal CLI/MCP operation argument.

---

## FR-003 — CLI Interface

Telkit must provide a command-line interface for Telegram operations.

Current operation:

```text
telkit telegram <chatId> <message>
```

The CLI should:

- validate required inputs;
- report missing configuration;
- return useful errors;
- return success information.

---

## FR-004 — Local MCP Interface

The local MCP phase must expose Telegram functionality to MCP-compatible clients.

The local MCP server must:

- run as a local process;
- communicate using stdio;
- expose Telegram operations as MCP tools;
- reuse shared Telegram logic rather than duplicating integration code;
- obtain credentials from process configuration/environment;
- return MCP-compatible structured results.

---

## FR-005 — Shared Telegram Core

Once multiple interfaces exist, reusable Telegram behavior must be extracted into an interface-independent package/module.

Adapters should not maintain separate implementations of the same Telegram request.

---

## FR-006 — Remote MCP

A later phase may expose Telkit as a remote MCP server.

Remote MCP is not an initial requirement.

Before implementation it requires explicit decisions for:

- transport;
- authentication;
- authorization;
- hosting;
- TLS;
- rate limiting;
- secret injection;
- deployment;
- monitoring.

---

# Non-Functional Requirements

## NFR-001 — Security

- secrets must not be committed;
- logs must not expose tokens;
- CI must not echo secrets;
- remote endpoints must not be publicly unauthenticated unless intentionally designed that way;
- production containers should run with least privilege.

---

## NFR-002 — Testability

Core business logic should be independently testable.

Tests should not require sending real Telegram messages unless explicitly marked as controlled end-to-end tests.

---

## NFR-003 — Reliability

External Telegram requests should eventually define:

- timeout behavior;
- response validation;
- error normalization;
- rate-limit behavior;
- retry policy where safe.

Retries must not be added blindly to operations that could create duplicate side effects.

---

## NFR-004 — Maintainability

- keep package responsibilities clear;
- avoid duplicated Telegram logic;
- keep public tool/CLI behavior documented;
- use automated formatting/linting/type checking;
- record important architecture decisions.

---

## NFR-005 — Reproducibility

A clean checkout should be able to:

1. install dependencies;
2. run quality checks;
3. run tests;
4. build packages;
5. run the supported local application.

CI must use the same commands where practical.

---

## NFR-006 — Observability

When Telkit becomes a deployed remote service it should provide enough telemetry to answer:

- is the service healthy?
- how many requests are being handled?
- what is request latency?
- how frequently does Telegram fail?
- which release is currently deployed?
- is the service restarting or exhausting resources?

---

## NFR-007 — Deployment Safety

Production deployment should eventually support:

- immutable versioned artifacts;
- health/smoke verification;
- controlled secrets;
- traceability from deployment to Git commit;
- rollback to a known-good release.

---

## NFR-008 — Cost

Infrastructure should remain appropriate for a portfolio/solo-developer project.

Prefer a simple VM/container platform before distributed orchestration.

---

# Current Acceptance Criteria

For the current application baseline:

- Telegram bot credential is read from `TELEGRAM_BOT_TOKEN`.
- `.env.example` documents the variable without containing a real token.
- `.gitignore` excludes real environment files.
- CLI can send a Telegram text message.
- errors do not intentionally print the bot token.

For the local MCP milestone:

- MCP server starts locally;
- MCP client can connect using stdio;
- Telegram tool is discoverable;
- a Telegram action succeeds end-to-end;
- tool implementation reuses shared Telegram logic once the shared core exists;
- no secret is part of the MCP tool input schema.
