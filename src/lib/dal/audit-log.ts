import type { PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "@/lib/db/prisma";

export const ADMIN_LOGIN_AUDIT_EVENT_TYPES = [
  "admin_login_success",
  "admin_login_failure",
] as const;

export const ADMIN_LOGIN_AUDIT_RESULTS = ["success", "failure"] as const;

export const ADMIN_LOGIN_FAILURE_REASON_CATEGORIES = [
  "invalid_credentials",
  "disabled_account",
  "unknown",
] as const;

export type AdminLoginAuditEventType =
  (typeof ADMIN_LOGIN_AUDIT_EVENT_TYPES)[number];
export type AdminLoginAuditResult = (typeof ADMIN_LOGIN_AUDIT_RESULTS)[number];
export type AdminLoginFailureReasonCategory =
  (typeof ADMIN_LOGIN_FAILURE_REASON_CATEGORIES)[number];

export type WriteAdminLoginAuditLogInput = {
  eventType: AdminLoginAuditEventType;
  adminIdentifier: string;
  result: AdminLoginAuditResult;
  reasonCategory: AdminLoginFailureReasonCategory | "none";
  requestId: string;
};

export async function writeAdminLoginAuditLog(
  input: WriteAdminLoginAuditLogInput,
  client: PrismaClient = defaultPrisma,
) {
  return client.adminLoginAuditLog.create({
    data: input,
    select: {
      id: true,
      eventType: true,
      adminIdentifier: true,
      timestamp: true,
      result: true,
      reasonCategory: true,
      requestId: true,
    },
  });
}
