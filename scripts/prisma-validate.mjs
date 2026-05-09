import { spawnSync } from "node:child_process";

const result = spawnSync(
  "npx",
  ["prisma", "validate"],
  {
    env: {
      ...process.env,
      DATABASE_URL: process.env.DATABASE_URL ?? "file:../data/sqlite/app.db",
    },
    shell: process.platform === "win32",
    stdio: "inherit",
  },
);

process.exit(result.status ?? 1);
