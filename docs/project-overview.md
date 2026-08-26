# Project Overview

## 1. Product

**Telkit**

Telkit is a Telegram integration toolkit that exposes Telegram capabilities through developer-oriented interfaces.

The initial interfaces are:

1. a command-line interface;
2. a local Model Context Protocol server.

Later phases may add a remote MCP service while keeping Telegram business logic reusable across interfaces.

---

## 2. Problem Statement

Telegram's Bot API is straightforward to call directly, but applications and AI clients benefit from a stable integration layer that:

- validates inputs;
- centralizes Telegram operations;
- hides credential handling from callers;
- normalizes errors/results;
- exposes the same capability through multiple interfaces;
- can be tested and operated consistently.

Telkit provides that layer.

---

## 3. Initial Use Case

The first supported capability is sending a Telegram text message.

Conceptually:

```text
caller
   |
   | chatId + message
   v
Telkit
   |
   | authenticated HTTPS request
   v
Telegram Bot API
```

The caller should not need to know how Telegram's request URL, request body, response shape, or bot credentials are handled internally.

---

## 4. Interfaces

### CLI

Useful for:

- direct terminal usage;
- scripting;
- local debugging;
- verifying Telegram integration independently of MCP.

### Local MCP

Useful for:

- MCP-compatible AI clients;
- exposing Telegram operations as structured tools;
- local agent workflows;
- keeping the server process and credentials local.

### Remote MCP — later

Useful when a centrally hosted MCP endpoint is justified.

This creates additional security and operational requirements and is intentionally deferred until the local system is reliable.

---

## 5. Engineering Goals

Telkit should demonstrate:

### Software engineering

- TypeScript;
- clear package boundaries;
- schema/input validation;
- reusable core logic;
- error handling;
- automated tests;
- stable interfaces.

### DevOps

- reproducible dependency installation;
- Git workflow and quality gates;
- GitHub Actions CI;
- build artifacts;
- Docker;
- image registry;
- CD;
- infrastructure automation;
- environment management.

### Operations/SRE

- health checks;
- structured logs;
- metrics;
- dashboards;
- alerting;
- deployment verification;
- rollback procedures.

### Security

- secret hygiene;
- dependency scanning;
- static analysis;
- image scanning;
- least privilege;
- authentication/authorization for remote access;
- secure network exposure.

---

## 6. Constraints

Telkit should remain understandable for a solo developer.

Default constraints:

- no microservices without a strong requirement;
- no database until persistent state is required;
- no queue until asynchronous workload requires one;
- no Kubernetes merely for portfolio appearance;
- prefer low-cost infrastructure;
- every new dependency/tool must have a clear purpose.

---

## 7. Success Criteria

A portfolio-ready release should make it possible to demonstrate:

1. a working Telegram capability;
2. CLI and MCP integration;
3. meaningful automated test coverage;
4. CI quality gates;
5. reproducible builds;
6. secure secret handling;
7. containerized remote runtime if remote MCP is included;
8. automated deployment;
9. IaC-managed infrastructure;
10. monitoring and alerts;
11. documented rollback and operational procedures;
12. architecture and engineering decisions that the developer can explain.

---

## 8. Development Principle

Telkit uses incremental productionization:

```text
make it work
    ↓
make boundaries clear
    ↓
make it testable
    ↓
automate verification
    ↓
package it reproducibly
    ↓
deploy it safely
    ↓
observe it
    ↓
harden it
```
