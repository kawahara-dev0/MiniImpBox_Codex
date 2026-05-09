import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";

type CreateAuthOptions = {
  allowEmailSignUp?: boolean;
};

export function createAuth(options: CreateAuthOptions = {}) {
  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: "sqlite",
    }),
    baseURL: process.env.BETTER_AUTH_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    emailAndPassword: {
      enabled: true,
      disableSignUp: options.allowEmailSignUp !== true,
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
}

export const auth = createAuth();
