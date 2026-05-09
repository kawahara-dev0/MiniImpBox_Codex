import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export const ADMIN_ROLE = "admin";

export type AdminAuthorizationFailureReason =
  | "unauthenticated"
  | "disabled"
  | "not_admin";

export type AdminSessionUser = {
  id: string;
  email: string;
  name?: string | null;
  role?: string | null;
  enabled?: boolean | null;
};

export type AdminAuthorizationResult =
  | {
      allowed: true;
      user: AdminSessionUser;
    }
  | {
      allowed: false;
      reason: AdminAuthorizationFailureReason;
    };

export class AdminAuthorizationError extends Error {
  constructor(public readonly reason: AdminAuthorizationFailureReason) {
    super(`Admin authorization failed: ${reason}`);
    this.name = "AdminAuthorizationError";
  }
}

export function evaluateAdminUser(
  user: AdminSessionUser | null | undefined,
): AdminAuthorizationResult {
  if (!user) {
    return { allowed: false, reason: "unauthenticated" };
  }

  if (user.enabled !== true) {
    return { allowed: false, reason: "disabled" };
  }

  if (user.role !== ADMIN_ROLE) {
    return { allowed: false, reason: "not_admin" };
  }

  return { allowed: true, user };
}

export async function getCurrentAdmin(): Promise<AdminAuthorizationResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return evaluateAdminUser(session?.user);
}

export async function requireAdmin(): Promise<AdminSessionUser> {
  const result = await getCurrentAdmin();

  if (!result.allowed) {
    throw new AdminAuthorizationError(result.reason);
  }

  return result.user;
}
