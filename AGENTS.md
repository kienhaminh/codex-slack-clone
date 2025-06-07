# AGENTS GUIDANCE

## Purpose

This file provides **official instructions and guidelines** for all agents (AI agents, developers, CI agents, tools) working on this project.  
It ensures **consistent quality, stability, and scalability** across all parts of the system.

**You MUST read and follow all instructions** in this file when:
- Writing or modifying code
- Refactoring code
- Writing documentation
- Creating or merging Pull Requests (PRs)
- Running tests or CI pipelines

---

## Scope

- The scope of this AGENTS.md file is the entire directory tree rooted at the folder containing this file.
- If deeper `AGENTS.md` files exist, their instructions **override** this one within their scope.
- If any direct system/developer/user instruction contradicts this file, that instruction takes precedence.
- This file applies even if the file appears outside Git repos (e.g. in `/`, `~`, home directory).

---

## Project Context

This project is a **Slack-clone application** designed to support **1 million concurrent users** with real-time messaging, video calling, and streaming.

### Tech Stack

| Layer           | Tech Stack                                     |
|-----------------|-----------------------------------------------|
| Frontend        | Next.js (TypeScript), React, Turbo monorepo    |
| Backend         | NestJS (TypeScript), Prisma ORM, WebSocket API |
| Database        | PostgreSQL                                     |
| Caching         | Redis (pub/sub, caching, queues)               |
| Streaming / RTC | WebRTC + SFU                                   |
| Queueing        | Kafka or AWS SQS                               |
| Infrastructure  | AWS, Kubernetes (K8s), Terraform               |
| CI/CD           | GitHub Actions                                |

---

## Coding Guidelines

### General Rules

- All code MUST be written in **TypeScript** (no JavaScript in production code).
- Code MUST follow existing project conventions. If in doubt, refer to the most mature modules or consult a Tech Lead.
- Avoid introducing new patterns unless explicitly approved.
- No dead code or unused files should remain in the repository.

### Project Structure & Organization

- Do not change project structure (moving folders/files) unless part of an approved refactor.
- Use feature-based modular architecture:
  - Frontend: components, hooks, services per feature.
  - Backend: modules, services, controllers per feature.
- Respect domain boundaries (e.g. do not mix chat, video, presence, etc.).

### File & Folder Naming

- Use **kebab-case** for folders.
- Use **PascalCase** for React components and NestJS classes.
- Use **camelCase** for variables, functions, hooks, and file names (except components).
- Suffix files clearly:
  - `*.service.ts`, `*.controller.ts`, `*.module.ts`, `*.dto.ts`, `*.entity.ts`, `*.spec.ts`, etc.

### Code Style & Linting

- Prettier and ESLint are enforced. Run:
  ```bash
  npm run lint
  npm run format
  ```
- PRs MUST pass lint checks.
- No inline `eslint-disable` without approval.

### Comments

- Use comments only where necessary.
- No commented-out code in PRs.
- Use JSDoc for complex functions or utilities.

---

## Testing Guidelines

### Testing-first Approach

- All changes MUST include proper tests:
  - **Unit tests** for all business logic.
  - **Integration tests** for services, APIs, DB queries.
  - **E2E tests** where applicable (Playwright / Cypress).

### Coverage

- **Minimum 90% test coverage** is required:
  - Statements
  - Branches
  - Functions
  - Lines
- Coverage is enforced via CI.

### Test tools

| Layer    | Tool                              |
|----------|-----------------------------------|
| Backend  | Jest + Supertest + Testcontainers |
| Frontend | Jest + React Testing Library + Playwright |
| Infra    | Terratest or Checkov              |

### Running Tests

- Before submitting a PR:
  ```bash
  npm run test
  npm run test:e2e
  npm run test:coverage
  ```

### Programmatic Checks (MANDATORY)

- You MUST run all provided programmatic checks even for:
  - Documentation changes
  - Comment-only changes
  - Non-code file changes (e.g. `.md`, `.json`, `.yaml`)
- Example:
  ```bash
  npm run lint
  npm run test
  npm run test:coverage
  ```

- CI will enforce checks, but you MUST validate locally first.

---

## Git & PR Guidelines

### Commit Messages

- Use conventional commits:
  - `feat:`, `fix:`, `chore:`, `refactor:`, `test:`, `docs:`, `ci:`, etc.
- Example:
  ```
  feat(chat): implement message pinning feature
  ```

### PR Messages

- PR messages MUST include:
  - Purpose of change.
  - Related ticket/issue.
  - Description of testing performed.
  - Any migration steps or breaking changes.
  - Check list:
    - [ ] Code passes lint
    - [ ] Tests written and pass
    - [ ] Coverage maintained ≥ 90%
    - [ ] Programmatic checks run and pass

### PR Quality

- Small, focused PRs are preferred (≤ 500 lines diff ideally).
- Avoid mixing unrelated changes.
- Self-review your PR carefully before submitting.
- Do not rely solely on CI to catch issues.

---

## Performance & Scale

### Database

- Optimize PostgreSQL queries:
  - Index critical columns.
  - Avoid N+1 problems (use Prisma includes/selects properly).
  - Use connection pools efficiently.
  - Avoid large transactions blocking writes.

### Caching

- Use Redis for:
  - Session caching.
  - Presence system.
  - Frequently accessed computed values.
- Invalidate caches properly.

### WebSocket / Real-time

- Use Redis pub/sub for cross-node message fanout.
- Ensure backpressure handling on WebSocket streams.
- Optimize payload size — prefer compact JSON.

### Queueing

- Use Kafka or AWS SQS for background processing.
- Idempotent consumers required.
- Ensure retry handling and dead-letter queues (DLQ).

---

## Observability

- All new code MUST have proper logging:
  - Use structured logging.
  - No sensitive data in logs.
- Metrics MUST be added for key operations:
  - Message send/receive latency.
  - WebSocket connect/disconnect.
  - DB query durations (P95 / P99).
- Tracing must propagate across services.

---

## Load Testing & Scalability

- New features must not degrade existing scalability goals:
  - Target P95 latency < 100ms under 1M concurrent users.
- Load testing required for:
  - APIs affecting hot paths.
  - WebSocket message handlers.
  - Background jobs affecting DB.

- Tools:
  - `k6` for HTTP / WebSocket load.
  - `Locust` or `Artillery` for combined user behavior.
  - `Chaos Mesh` or `Litmus` for resilience testing.