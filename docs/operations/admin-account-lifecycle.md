# Administrator Account Lifecycle

## Scope

This note covers the Step 3 operational path for administrator account creation, disabling, rotation, and password recovery in local development and trial verification environments.

It does not approve production operation, release readiness, residual risk acceptance, or final completion.

## Account Creation

Create the initial administrator with the administrative script:

```powershell
$env:BETTER_AUTH_URL="http://localhost:3000"
$env:BETTER_AUTH_SECRET="replace-with-a-local-secret"
$env:ADMIN_EMAIL="admin@example.com"
$env:ADMIN_NAME="Administrator"
$env:ADMIN_PASSWORD="replace-with-a-local-password"
npm run admin:account -- create
```

Rules:

- Use a local password that is not committed.
- Do not place real passwords in documentation, screenshots, commit messages, or shared chat.
- The script must not print the password, password hash, session token, or secret.
- Normal UI-based administrator self-registration is not provided in v1.

## Disable or Enable

Disable an administrator:

```powershell
$env:BETTER_AUTH_URL="http://localhost:3000"
$env:BETTER_AUTH_SECRET="replace-with-a-local-secret"
$env:ADMIN_EMAIL="admin@example.com"
npm run admin:account -- disable
```

Rules:

- Disabling an administrator also revokes that user's active sessions.
- Verify that the disabled administrator can no longer reach the admin boundary.
- Do not provide an administrator disabling UI in v1.

Enable an administrator:

```powershell
$env:BETTER_AUTH_URL="http://localhost:3000"
$env:BETTER_AUTH_SECRET="replace-with-a-local-secret"
$env:ADMIN_EMAIL="admin@example.com"
npm run admin:account -- enable
```

## Rotation

Administrator rotation is handled operationally:

1. Create the replacement administrator with `npm run admin:account -- create`.
2. Confirm the replacement administrator can authenticate and reach the admin boundary.
3. Disable the previous administrator with `npm run admin:account -- disable`.

No administrator rotation UI is provided in v1.

## Password Recovery

Public self-service password reset is not provided in v1.

For password recovery during the trial:

1. Create a replacement administrator account or use an existing enabled administrator account.
2. Disable the account whose password is no longer usable.
3. Record the operational action in the trial operation notes.

Do not directly edit password hashes unless a separate approved Better Auth-side recovery procedure is documented.
