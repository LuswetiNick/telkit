# CI/CD Plan

## 1. Objective

Build Telkit's delivery pipeline progressively so that each stage is understandable, reproducible, and useful.

CI/CD is not one workflow file. It is the system that moves a change safely from source code to a running, observable release.

---

# Part A — Continuous Integration

## 2. CI Phase 1 — Quality Pipeline

Prerequisites:

- local formatting command;
- local lint command;
- local typecheck command;
- tests;
- build/package command.

Target pull-request pipeline:

```text
checkout
   ↓
setup Bun
   ↓
install locked dependencies
   ↓
format check
   ↓
lint
   ↓
typecheck
   ↓
tests
   ↓
build
```

Rules:

- use the lockfile;
- avoid production secrets;
- fail fast on genuine errors;
- keep commands reproducible locally.

Do not invent workflow commands that do not exist in `package.json`.

---

## 3. CI Phase 2 — Repository Quality Gate

After CI is stable:

Configure `main` ruleset to require:

- pull request;
- required CI checks;
- resolved conversations if applicable;
- prevent force pushes;
- prevent branch deletion;
- appropriate admin/bypass policy.

The repository is currently solo-developed, so avoid requirements that make legitimate maintenance impossible.

---

## 4. CI Phase 3 — Security

Add security checks deliberately.

Candidate checks:

- secret scanning;
- dependency review/audit;
- CodeQL/static analysis where appropriate.

Later, after Docker:

- container vulnerability scan;
- SBOM/provenance if useful.

Security jobs should not receive unnecessary production credentials.

---

# Part B — Build and Release

## 5. Versioning

Before public releases, choose and document a versioning strategy.

Recommended direction:

```text
v0.x.y
```

while APIs are still evolving.

Release should identify:

- semantic version;
- Git commit;
- build artifact.

---

## 6. Build Once Principle

For deployable remote releases:

```text
source commit
    ↓
CI tests
    ↓
build immutable artifact/image
    ↓
publish
    ↓
deploy same artifact
```

Do not rebuild different application bits independently on the production server.

---

# Part C — Container Pipeline

## 7. Docker CI — Later Phase

Once a remote service exists:

```text
main/tag
   ↓
quality + tests
   ↓
docker build
   ↓
image scan
   ↓
tag:
  - semantic version
  - git SHA
   ↓
push to registry
```

Example identity:

```text
ghcr.io/<owner>/telkit:<version>
ghcr.io/<owner>/telkit:sha-<commit>
```

Do not rely only on `latest`.

---

# Part D — Deployment

## 8. Environment Strategy

Recommended initial environments:

```text
local
staging
production
```

Do not create multiple cloud environments before there is a remote service.

---

## 9. Deployment Flow

Recommended eventual flow:

```text
PR
 ↓
CI
 ↓
merge main
 ↓
build + publish image
 ↓
deploy staging
 ↓
health/smoke checks
 ↓
production approval/promotion
 ↓
deploy production
 ↓
post-deploy verification
```

A manual production approval is acceptable and useful for a portfolio project.

---

## 10. Rollback

Every production deployment strategy must answer:

> How do we return to the previous known-good release?

With immutable images, rollback should be equivalent to deploying the previous version/SHA.

Rollback must not require reconstructing old code manually on the server.

---

# Part E — Infrastructure as Code

## 11. Terraform — Later Phase

Do not start with Terraform.

First understand the manually provisioned/deployed runtime.

Then capture repeatable infrastructure such as:

- compute/VM;
- firewall/security rules;
- static IP where needed;
- DNS-related resources where provider support makes sense.

Never store cloud secrets in Terraform source.

State storage strategy must be documented when Terraform is introduced.

---

# Part F — Verification and Observability

## 12. Deployment Verification

A successful deployment is not merely a successful SSH/Docker command.

Validate:

- container/process running;
- health endpoint;
- MCP endpoint behavior;
- external Telegram dependency behavior where safe;
- correct release/version.

---

## 13. Pipeline Metrics

Later, useful delivery metrics include:

- CI success rate;
- test duration;
- deployment frequency;
- deployment success/failure;
- rollback frequency;
- lead time from merge to deployed release.

Use them to learn delivery reliability, not as vanity metrics.

---

# Part G — Proposed Workflow Files

Do not create these until their phase is active.

Potential final layout:

```text
.github/
└── workflows/
    ├── ci.yml
    ├── security.yml
    ├── release.yml
    └── deploy.yml
```

Prefer a few understandable workflows over many tiny workflows with hidden dependencies.

---

## 14. Codex Implementation Rule

When asked to implement CI/CD:

1. inspect current package scripts;
2. make local scripts reliable first;
3. implement one pipeline stage at a time;
4. explain each GitHub Actions permission;
5. pin/review third-party actions appropriately;
6. keep secrets scoped;
7. run or validate workflow syntax;
8. document required repository settings separately.
