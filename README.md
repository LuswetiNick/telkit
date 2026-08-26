# Telkit

**Telkit** is a TypeScript/Bun toolkit for interacting with Telegram through developer-friendly interfaces such as a CLI and Model Context Protocol (MCP).

The project is designed both as a usable integration toolkit and as a production-engineering project for applying modern software-development and DevOps practices from local development through deployment and operations.

## Project Goals

Telkit is being built to demonstrate how a small application can be engineered progressively rather than over-engineered upfront.

The project will cover:

- Telegram Bot API integration
- command-line tooling
- local MCP over stdio
- remote MCP in a later phase
- modular shared business logic
- automated testing
- Continuous Integration
- secure container builds
- Continuous Delivery/Deployment
- Infrastructure as Code
- observability
- security hardening
- release and rollback practices

## Current Repository

The repository is a Bun workspace:

```text
telkit/
├── packages/
│   └── cli/
├── .env.example
├── bun.lock
├── package.json
└── tsconfig.json
```

The CLI currently provides a Telegram command that sends a text message using the Telegram Bot API.

As development progresses, shared Telegram logic and MCP adapters will be separated into dedicated workspace packages where that separation provides a clear benefit.

## Architecture Direction

```text
                 Telegram Bot API
                        ^
                        |
                 shared core logic
                        ^
              +---------+---------+
              |                   |
          CLI adapter         MCP adapter
```

A remote MCP adapter can later reuse the same core logic rather than duplicating Telegram integration code.

## Configuration

Telkit uses environment-based configuration for secrets.

Create a local environment file from the example:

```bash
cp .env.example .env
```

Set:

```env
TELEGRAM_BOT_TOKEN="<your-bot-token>"
```

Never commit a real bot token.

## Development

Install dependencies:

```bash
bun install
```

Run the current CLI:

```bash
bun run dev:cli
```

Inspect the available CLI commands:

```bash
bun run dev:cli --help
```

The exact development commands will expand as additional workspace packages and quality checks are added.

## Engineering Approach

Telkit follows a phase-gated approach:

```text
Application baseline
        ↓
Code quality
        ↓
Automated tests
        ↓
Continuous Integration
        ↓
Remote service
        ↓
Containerization
        ↓
Continuous Delivery
        ↓
Infrastructure as Code
        ↓
Observability
        ↓
Security hardening
```

Infrastructure is introduced only when there is an operational need for it.

## Documentation

- [Project overview](docs/project-overview.md)
- [Requirements](docs/requirements.md)
- [Architecture](docs/architecture.md)
- [Roadmap](docs/roadmap.md)
- [Development workflow](docs/development-workflow.md)
- [Testing strategy](docs/testing-strategy.md)
- [Security](docs/security.md)
- [CI/CD plan](docs/ci-cd-plan.md)
- [Architecture decisions](docs/decisions/)

Coding agents should read [AGENTS.md](AGENTS.md) before making changes.

## Status

Telkit is under active development. The current focus is establishing the local application and MCP baseline before introducing the full CI/CD and production operations stack.
