# Security

## 1. Security Goals

Telkit can send messages through a Telegram bot. Anyone who obtains the bot token may be able to act as that bot.

Credential protection is therefore a primary security requirement.

Security will evolve as the project moves from local-only tooling to a remotely hosted service.

---

## 2. Current Assets

Sensitive:

- `TELEGRAM_BOT_TOKEN`;
- future OAuth/client secrets;
- future deployment credentials;
- future registry/cloud credentials.

Potentially sensitive:

- Telegram chat IDs;
- message contents;
- operational logs.

---

## 3. Current Secret Handling

Required environment variable:

```text
TELEGRAM_BOT_TOKEN
```

Repository policy:

- `.env` is ignored;
- `.env.*` is ignored;
- `.env.example` is committed as a placeholder.

Never put a real secret into `.env.example`.

---

## 4. Secret Exposure Risks

Avoid exposing credentials through:

### Source code

```text
const token = "real-token";
```

Forbidden.

### Logs

Never log:

- bot token;
- full Authorization headers;
- credential-bearing URLs.

### CI

Do not:

- `echo` secrets;
- expose secrets to untrusted pull-request code;
- store them as normal repository variables.

### Docker

Never:

- use `ENV` with a real secret in Dockerfile;
- COPY `.env` into an image;
- bake credentials into layers.

### MCP

Do not define bot credentials as normal tool input.

---

## 5. Telegram API URL Consideration

Telegram Bot API requests contain the bot token in the URL path.

Consequences:

- do not log full request URLs;
- configure HTTP logging carefully;
- sanitize error diagnostics;
- never include the complete URL in telemetry.

This is especially important once structured HTTP instrumentation is added.

---

## 6. Dependency Security

As the project matures, CI should add appropriate checks such as:

- lockfile-controlled installs;
- dependency vulnerability review/audit;
- static analysis;
- secret scanning;
- container image scanning.

Do not add multiple overlapping scanners without understanding what each catches.

---

## 7. Local MCP Threat Model

Current trust model:

```text
trusted local MCP client
        |
      stdio
        |
   Telkit process
        |
      HTTPS
        |
     Telegram
```

Primary risks:

- leaked environment secrets;
- malicious/unexpected tool arguments;
- logs corrupting stdio or exposing data;
- unvalidated output from external API;
- accidental sending to the wrong chat.

Potential controls:

- schema validation;
- clear tool descriptions;
- optional allowlist policy if required;
- sanitized logs.

---

## 8. Remote MCP Threat Model — Later

Remote hosting changes the threat boundary:

```text
Internet
   |
   v
public endpoint
   |
   v
Telkit
   |
   v
Telegram
```

Before remote production:

- require authentication design;
- define authorization;
- TLS;
- rate limiting;
- request size limits;
- abuse controls;
- secure secret injection;
- firewall/network policy;
- logging/redaction;
- dependency/container scanning.

Remote MCP must not simply expose the local tool handler publicly.

---

## 9. CI/CD Credentials

Later, use scoped credentials:

- GitHub Actions permissions should be minimal;
- registry credentials should have required scope only;
- cloud credentials should prefer short-lived/federated identity when available;
- production secrets should be separate from development secrets.

---

## 10. Incident Response

If a Telegram bot token is exposed:

1. revoke/rotate it immediately;
2. update development/CI/production secret stores;
3. inspect Git history and CI logs for exposure;
4. remove leaked content from the repository where appropriate;
5. review Telegram activity;
6. document the cause and prevention.

Deleting a secret from the latest commit alone does not make a leaked credential safe.

---

## 11. Logging Policy

Safe fields may include:

- operation/tool name;
- success/failure;
- duration;
- sanitized error category;
- release/version.

Be cautious with:

- full chat ID;
- message text;
- HTTP URL;
- external response body.

Production logging should prefer data minimization.
