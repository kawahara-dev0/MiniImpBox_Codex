# Trial Operations Procedures

## Scope

This document defines Step 7 operational procedures for the v1 development and trial verification environment.

It covers:

- administrator account lifecycle references
- backup location and access control
- backup encryption
- restore procedure
- trial end record
- post-retention deletion

This document does not approve production operation, release readiness, residual risk acceptance, final completion, or release.

## Administrator Account Lifecycle

Use `docs/operations/admin-account-lifecycle.md` for:

- initial administrator creation
- administrator disabling
- administrator enabling
- administrator rotation
- password recovery

Rules:

- Do not create public self-registration in v1.
- Do not create administrator lifecycle UI in v1.
- Do not print or record passwords, password hashes, session tokens, or `BETTER_AUTH_SECRET`.
- Record operational account changes in the trial operation record when they affect trial access.

## Docker Compose Paths

The Docker Compose environment uses explicit host bind mounts:

| Purpose | Host path | Container path |
|---|---|---|
| SQLite database | `./data/sqlite` | `/data/sqlite` |
| Backup files | `./data/backups` | `/data/backups` |

Rules:

- The database file and backups must not be stored only inside an ephemeral container filesystem.
- Backup files must remain outside the application public directory.
- Access to `./data/sqlite` and `./data/backups` must be limited to authorized administrators and operators on the host.
- Database files and backup files must not be committed.

## Backup Procedure

Frequency:

- Create one backup per trial day while the trial is active.

Generation count:

- Keep 14 encrypted backup generations unless a human-approved operations decision changes this value.

Required operator-provided secret:

- `BACKUP_ENCRYPTION_KEY`
- Minimum 32 characters.
- Must not be committed, printed in logs, included in screenshots, or shared in chat.

Recommended local PowerShell procedure:

```powershell
$env:BACKUP_ENCRYPTION_KEY = "replace-with-local-backup-key"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$source = "data/sqlite/app.db"
$plainBackup = "data/backups/app-$timestamp.db"
$encryptedBackup = "data/backups/app-$timestamp.db.enc"

if (-not (Test-Path -LiteralPath $source)) {
  throw "Database file not found: $source"
}

try {
  Copy-Item -LiteralPath $source -Destination $plainBackup

  node -e "const fs=require('fs');const crypto=require('crypto');const key=process.env.BACKUP_ENCRYPTION_KEY;if(!key||key.length<32)throw new Error('BACKUP_ENCRYPTION_KEY is required');const input=process.argv[1];const output=process.argv[2];const salt=crypto.randomBytes(16);const iv=crypto.randomBytes(12);const derived=crypto.pbkdf2Sync(key,salt,310000,32,'sha256');const cipher=crypto.createCipheriv('aes-256-gcm',derived,iv);const data=fs.readFileSync(input);const enc=Buffer.concat([cipher.update(data),cipher.final()]);const tag=cipher.getAuthTag();fs.writeFileSync(output,Buffer.concat([Buffer.from('MIB1'),salt,iv,tag,enc]));" $plainBackup $encryptedBackup
}
finally {
  if (Test-Path -LiteralPath $plainBackup) {
    Remove-Item -LiteralPath $plainBackup -Force
  }
}

if (Test-Path -LiteralPath $plainBackup) {
  throw "Plaintext backup cleanup failed: $plainBackup"
}
```

After backup:

1. Confirm the `.db.enc` file exists under `data/backups`.
2. Confirm no unencrypted `.db` copy remains under `data/backups`.
3. Confirm the backup file is not under `public/`.
4. Confirm host filesystem permissions restrict `data/backups` to authorized administrators and operators.
5. If encryption fails, confirm the plaintext backup was still removed before retrying.
6. Record the backup filename, operator, access-control check, plaintext cleanup check, and result in `docs/operations/trial-operation-record.md`.
7. Delete encrypted backup generations older than the latest 14 only after confirming the latest encrypted backup exists.
8. Record any generation cleanup in `docs/operations/trial-operation-record.md`.

## Restore Dry-Run Procedure

Restore verification must be performed before trial start and after material changes to the backup procedure.

Use a separate restore target so the active database is not overwritten during dry-run verification.

```powershell
$env:BACKUP_ENCRYPTION_KEY = "replace-with-local-backup-key"
$encryptedBackup = "data/backups/app-YYYYMMDD-HHMMSS.db.enc"
$restoreTarget = "data/sqlite/restore-dry-run.db"

node -e "const fs=require('fs');const crypto=require('crypto');const key=process.env.BACKUP_ENCRYPTION_KEY;if(!key||key.length<32)throw new Error('BACKUP_ENCRYPTION_KEY is required');const input=process.argv[1];const output=process.argv[2];const packed=fs.readFileSync(input);if(packed.subarray(0,4).toString()!=='MIB1')throw new Error('Unsupported backup format');const salt=packed.subarray(4,20);const iv=packed.subarray(20,32);const tag=packed.subarray(32,48);const enc=packed.subarray(48);const derived=crypto.pbkdf2Sync(key,salt,310000,32,'sha256');const decipher=crypto.createDecipheriv('aes-256-gcm',derived,iv);decipher.setAuthTag(tag);const data=Buffer.concat([decipher.update(enc),decipher.final()]);fs.writeFileSync(output,data);" $encryptedBackup $restoreTarget

if (-not (Test-Path -LiteralPath $restoreTarget)) {
  throw "Restore target was not created."
}
```

After restore dry-run:

1. Verify the restore target exists.
2. Verify the restore target is stored under `data/sqlite`, not under `public/`.
3. Verify the restored database is readable without overwriting the active database. One acceptable local check is:

```powershell
node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient({ datasources: { db: { url: 'file:./data/sqlite/restore-dry-run.db' } } }); prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type = 'table'`.then((tables) => { console.log('restore-readable'); return prisma.$disconnect(); }).catch(async (error) => { await prisma.$disconnect().catch(() => {}); throw error; });"
```

4. Record the backup filename, restore target, readability check, operator, and result in `docs/operations/trial-operation-record.md`.
5. Remove the dry-run restore target when verification evidence is recorded and no longer needed.

## Trial End Record

At trial end, create or update `docs/operations/trial-operation-record.md` with:

- trial end date
- decision maker
- reason
- retention end date, calculated as trial end date plus 90 days
- backup generations present at trial end
- outstanding release-blocking or operations risks

The trial end record is an operations record.
It is not release approval, residual risk acceptance, final completion, or production approval.

## Post-Retention Deletion Procedure

At retention end date:

1. Confirm the trial end record and retention end date.
2. Confirm human approval to perform post-retention deletion.
3. Stop the application if it is running against the target database.
4. Delete the target SQLite database file under `data/sqlite`.
5. Delete target encrypted backups under `data/backups`.
6. Confirm no target database or backup files remain in the documented paths.
7. Record the deletion date, operator, files deleted, and verification result in `docs/operations/trial-operation-record.md`.

Do not implement proposal deletion through application screens or APIs in v1.

## Manual Verification Gates

Release-blocking before trial release:

- Successful encrypted backup creation.
- Restore dry-run from an encrypted backup.
- Verification that database and backup files use documented Docker Compose paths.
- Verification that backups are outside public web-accessible paths.
- Verification that backup encryption key handling does not expose secrets.
- Human residual operational risk acceptance.

Release-blocking at trial end or retention end:

- Trial end record completion.
- Human approval for post-retention deletion.
- Post-retention deletion execution and verification.
