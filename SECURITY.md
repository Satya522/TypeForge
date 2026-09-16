# Security Policy

## Supported Versions

Security fixes are applied to the latest commit on `master`. This is an actively developed portfolio project and does not currently publish long-lived release branches.

## Reporting a Vulnerability

Please do not open a public issue for a suspected vulnerability. Report it privately through [GitHub Security Advisories](https://github.com/Satya522/TypeForge/security/advisories/new).

Include:

- A clear description of the issue and its impact
- Reproduction steps or a minimal proof of concept
- The affected route, component, or dependency
- Any suggested mitigation

You can expect an acknowledgement within seven days. Please allow reasonable time for investigation and remediation before public disclosure.

## Development Security Notes

- Never commit `.env`, `.env.local`, OAuth secrets, database credentials, or API keys.
- Use a separate database and credentials for local development.
- Keep Prisma migrations, authentication changes, uploads, and WebSocket changes in focused pull requests.
- Run `npm run typecheck` and `npm run build` before opening a pull request.
