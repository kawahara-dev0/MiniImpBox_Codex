import { PrismaClient } from "@prisma/client";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";

process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? "file:../data/sqlite/app.db";

const ADMIN_ROLE = "admin";
const VALID_COMMANDS = new Set(["create", "enable", "disable"]);

const command = process.argv[2];

if (!VALID_COMMANDS.has(command)) {
  console.error("Usage: npm run admin:account -- <create|enable|disable>");
  process.exit(1);
}

const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const adminName = process.env.ADMIN_NAME?.trim() || "Administrator";
const adminPassword = process.env.ADMIN_PASSWORD;
const authBaseUrl = process.env.BETTER_AUTH_URL?.trim();
const authSecret = process.env.BETTER_AUTH_SECRET?.trim();

if (!adminEmail) {
  console.error("ADMIN_EMAIL is required.");
  process.exit(1);
}

if (command === "create" && (!adminPassword || adminPassword.length < 12)) {
  console.error("ADMIN_PASSWORD with at least 12 characters is required.");
  process.exit(1);
}

if (!authBaseUrl) {
  console.error("BETTER_AUTH_URL is required.");
  process.exit(1);
}

if (
  !authSecret ||
  authSecret === "replace-with-a-local-secret-that-is-not-committed"
) {
  console.error("A local BETTER_AUTH_SECRET is required.");
  process.exit(1);
}

const prisma = new PrismaClient();

const seedAuth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),
  baseURL: authBaseUrl,
  secret: authSecret,
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    autoSignIn: false,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: "none",
        input: false,
      },
      enabled: {
        type: "boolean",
        required: true,
        defaultValue: true,
        input: false,
      },
    },
  },
});

try {
  if (command === "create") {
    const existing = await prisma.user.findUnique({
      where: { email: adminEmail },
      select: { id: true },
    });

    if (!existing) {
      await seedAuth.api.signUpEmail({
        body: {
          email: adminEmail,
          name: adminName,
          password: adminPassword,
        },
      });
    }

    await prisma.user.update({
      where: { email: adminEmail },
      data: {
        name: adminName,
        role: ADMIN_ROLE,
        enabled: true,
        emailVerified: true,
      },
    });

    console.log("Administrator account is present and enabled.");
  }

  if (command === "enable") {
    await prisma.user.update({
      where: { email: adminEmail },
      data: { enabled: true },
    });

    console.log("Administrator account is enabled.");
  }

  if (command === "disable") {
    const disabledUser = await prisma.user.update({
      where: { email: adminEmail },
      data: { enabled: false },
      select: { id: true },
    });

    await prisma.session.deleteMany({
      where: { userId: disabledUser.id },
    });

    console.log("Administrator account is disabled.");
  }
} catch {
  console.error("Administrator account operation failed.");
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
