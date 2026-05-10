import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";
import { handleAuthPostWithAdminLoginAudit } from "@/lib/audit/admin-login";

const handlers = toNextJsHandler(auth);

export const { GET, PUT, PATCH, DELETE } = handlers;

export function POST(request: Request) {
  return handleAuthPostWithAdminLoginAudit(request, {
    authHandler: handlers.POST,
  });
}
