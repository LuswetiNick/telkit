# Roadmap

## Principle

Telkit is developed in phases so that each DevOps practice solves a real problem encountered in the previous phase.

Do not skip phase gates just to add portfolio technologies.

---

## Phase 0 — Repository Foundation

**Status: active/partially complete**

Goals:

- Git repository;
- Bun workspace;
- environment example;
- secret-safe `.gitignore`;
- CLI package;
- baseline documentation.

Exit criteria:

- repository structure understood;
- project purpose documented;
- secrets excluded from Git;
- developer can run current CLI locally.

---

## Phase 1 — Application + Local MCP Baseline

**Developer-led**

Goals:

- working Telegram CLI;
- shared core once more than one adapter needs Telegram logic;
- local MCP package;
- stdio transport;
- Telegram MCP tool;
- successful end-to-end tool call.

Exit criteria:

- CLI Telegram operation works;
- MCP server starts locally;
- MCP client discovers the tool;
- tool can perform the Telegram operation;
- token is injected from environment;
- no duplicated Telegram API implementation remains between CLI and MCP.

Do not proceed to remote MCP yet.

---

## Phase 2 — Engineering Foundation

**Codex-assisted**

Goals:

- formatting;
- linting;
- type checking;
- consistent scripts;
- package boundaries reviewed;
- repository conventions;
- branch/PR strategy;
- documentation aligned with code.

Exit criteria:

- documented local quality command(s);
- checks pass from clean installation;
- developer understands each check.

---

## Phase 3 — Automated Testing

**Codex-assisted**

Goals:

- unit tests for shared core;
- deterministic Telegram API mocks/fakes;
- adapter tests;
- local MCP smoke/integration test;
- failure-path coverage.

Important:

Ordinary tests must not send real Telegram messages.

Exit criteria:

- critical behavior has automated coverage;
- tests are deterministic;
- no test depends on a production secret;
- test suite runs locally with one command.

---

## Phase 4 — Continuous Integration

**Codex-assisted**

Goals:

- GitHub Actions pull-request workflow;
- deterministic dependency installation;
- format/lint/typecheck;
- tests;
- build/package verification;
- optional security checks after basics are stable.

Target flow:

```text
branch
  ↓
pull request
  ↓
CI
  ├── install
  ├── format check
  ├── lint
  ├── typecheck
  ├── tests
  └── build
  ↓
merge allowed
```

Exit criteria:

- CI runs from a clean GitHub runner;
- failures block merge through repository rules;
- CI commands are reproducible locally.

---

## Phase 5 — Local Distribution / Release Discipline

Goals:

- define versioning strategy;
- produce build artifacts;
- Git tags/releases;
- package local CLI/MCP reliably;
- release notes.

Exit criteria:

- release can be tied to a specific commit;
- installation/run instructions are reproducible.

---

## Phase 6 — Remote MCP

Goals:

- define remote transport;
- implement remote MCP adapter;
- health endpoint;
- authentication design;
- secure configuration.

Write architecture/security ADRs before exposing the service publicly.

Exit criteria:

- authenticated remote operation works;
- health behavior is defined;
- deployment artifact can be built.

---

## Phase 7 — Containerization

Goals:

- production Dockerfile;
- multi-stage build;
- non-root runtime;
- small runtime image;
- `.dockerignore`;
- health check strategy;
- immutable image tagging.

Exit criteria:

- image builds reproducibly;
- container starts successfully;
- image contains no secrets;
- runtime behavior is documented.

---

## Phase 8 — Container CI + Security

Goals:

- build image in CI;
- vulnerability scan;
- secret scan;
- dependency/static analysis as appropriate;
- publish trusted image to registry.

Target:

```text
main
  ↓
test/build
  ↓
container build
  ↓
security scan
  ↓
GHCR
```

---

## Phase 9 — Deployment + CD

Goals:

- choose a simple production host;
- automated staging deployment;
- smoke/health verification;
- controlled production promotion;
- rollback.

Prefer simple VM/container hosting before orchestration platforms.

Exit criteria:

- deployment is repeatable;
- deployed version maps to Git SHA;
- rollback is documented and tested.

---

## Phase 10 — Infrastructure as Code

Goals:

- provision required infrastructure with Terraform;
- network/firewall rules;
- DNS-related resources where appropriate;
- VM/container-host infrastructure;
- outputs/documentation.

Infrastructure automation comes after a manual deployment is understood.

---

## Phase 11 — Observability

Goals:

- structured logs;
- health/readiness checks;
- metrics;
- dashboards;
- alerts;
- deployment/version visibility.

Questions the system should answer:

- Is Telkit up?
- Is Telegram failing?
- What is latency?
- What version is running?
- Is the service restarting?
- Are resources near limits?

---

## Phase 12 — Security Hardening

Security exists throughout the project; this phase deepens it.

Goals:

- threat model;
- least privilege;
- log redaction;
- dependency update policy;
- container hardening;
- authentication/authorization review;
- rate limiting;
- backup/recovery decisions if state is introduced.

---

## Phase 13 — Portfolio Release

Goals:

- polished README;
- architecture diagram;
- CI/CD diagram;
- deployment diagram;
- screenshots of GitHub Actions;
- monitoring screenshots;
- release/rollback demonstration;
- runbook;
- concise project case study.

The repository should demonstrate not only technologies used, but why each was introduced.
