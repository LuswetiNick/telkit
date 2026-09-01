# Testing Strategy

## 1. Goal

Testing should give confidence that Telkit can change safely and that CI failures represent real problems.

Tests should be fast, deterministic, and independent of production Telegram credentials by default.

Telkit uses Bun's built-in `bun:test` framework. Run the behavioral test suite
with `bun run test`, or use `bun run test:watch` during local development.

---

## 2. Test Pyramid

```text
          E2E / smoke
             /\
            /  \
           /    \
      integration
         /      \
        /        \
       unit tests
```

Most tests should be unit/integration tests.

Real Telegram calls should be rare and controlled.

---

## 3. Core Unit Tests

Once Telegram behavior is moved into shared core, cover:

### Input validation

Examples:

- missing/invalid chat ID;
- empty message;
- invalid message shape.

### Request construction

Verify:

- correct Telegram endpoint;
- POST method;
- expected headers;
- expected body.

### Response parsing

Cases:

- successful Telegram response;
- non-2xx HTTP response;
- Telegram JSON with `ok: false`;
- malformed/unexpected response;
- network error;
- timeout.

### Secret safety

Ensure errors/results never contain the bot token.

---

## 4. CLI Tests

CLI argument, environment, output, and exit behavior is tested black-box through
fresh subprocesses. Test subprocesses use controlled environments and disable
automatic `.env` loading so local credentials cannot affect the suite.

CLI adapter tests should verify behavior such as:

- required arguments;
- missing `TELEGRAM_BOT_TOKEN`;
- core success mapping;
- core failure mapping;
- exit behavior where practical.

Avoid retesting the Telegram HTTP implementation through the CLI if it is already tested in core.

---

## 5. Local MCP Tests

Tests should verify:

- server can start;
- MCP tool is registered/discoverable;
- expected tool schema;
- missing configuration behavior;
- tool calls shared core;
- result is MCP-compatible;
- no arbitrary stdout logs corrupt stdio.

A higher-level smoke test can spawn the stdio server as a child process and interact with it using an MCP client.

---

## 6. Integration Tests

Preferred integration boundary:

```text
Telkit core
    |
    v
mock/fake HTTP boundary
```

Do not depend on Telegram's live API for ordinary CI.

Possible approaches:

- injected `fetch` implementation;
- local mock HTTP server;
- request interceptor.

Choose the simplest technique compatible with the code structure.

---

## 7. End-to-End Tests

A real Telegram E2E test may eventually exist, but it should:

- use a dedicated test bot;
- use a dedicated test chat;
- use CI secrets;
- be opt-in or run in a controlled workflow;
- prevent accidental spam;
- clearly identify test messages;
- avoid running on every untrusted pull request.

Do not require live E2E tests to validate ordinary code changes.

---

## 8. Coverage

Coverage is a diagnostic tool, not the goal.

Prioritize:

- critical business paths;
- error handling;
- security-sensitive configuration;
- adapter/core boundaries.

Do not create meaningless tests solely to raise a percentage.

A coverage threshold can be introduced only after the test suite is useful and stable.

---

## 9. CI Test Stages

Early CI:

```text
unit
integration
build
```

Later:

```text
PR:
  unit
  integration
  MCP smoke

main/release:
  above +
  package/container validation

controlled post-deploy:
  smoke/health
  optional real Telegram test
```

---

## 10. Test Data Rules

Never include:

- production bot tokens;
- private chat IDs unnecessarily;
- user messages copied from real conversations;
- credentials in snapshots.

Use synthetic fixtures.
