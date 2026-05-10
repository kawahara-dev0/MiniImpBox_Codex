import type { PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "@/lib/db/prisma";
import {
  type WriteAdminLoginAuditLogInput,
  writeAdminLoginAuditLog,
} from "@/lib/dal/audit-log";

const SIGN_IN_EMAIL_PATH = "/sign-in/email";
const REQUEST_ID_HEADER = "x-request-id";

type LoginUserState =
  | {
      found: true;
      role: string | null;
      enabled: boolean | null;
    }
  | {
      found: false;
    };

export type AdminLoginAuditDependencies = {
  authHandler: (request: Request) => Promise<Response>;
  writeAuditLog?: (input: WriteAdminLoginAuditLogInput) => Promise<unknown>;
  getLoginUserState?: (email: string) => Promise<LoginUserState>;
  generateRequestId?: () => string;
};

function isEmailSignInRequest(request: Request) {
  return new URL(request.url).pathname.endsWith(SIGN_IN_EMAIL_PATH);
}

function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

async function readEmailFromRequest(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  const cloned = request.clone();

  if (contentType.includes("application/json")) {
    const body = (await cloned.json().catch(() => null)) as
      | { email?: unknown }
      | null;
    return normalizeEmail(body?.email);
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const form = await cloned.formData().catch(() => null);
    return normalizeEmail(form?.get("email"));
  }

  return "";
}

function createRequestId(request: Request, generateRequestId: () => string) {
  const existing = request.headers.get(REQUEST_ID_HEADER)?.trim();
  return existing || generateRequestId();
}

function withRequestId(response: Response, requestId: string) {
  const headers = new Headers(response.headers);
  headers.set(REQUEST_ID_HEADER, requestId);

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function safeUnauthorizedResponse(requestId: string) {
  return Response.json(
    {
      code: "UNAUTHORIZED",
      message: "Invalid email or password.",
    },
    {
      status: 401,
      headers: {
        [REQUEST_ID_HEADER]: requestId,
      },
    },
  );
}

async function defaultGetLoginUserState(
  email: string,
  client: PrismaClient = defaultPrisma,
): Promise<LoginUserState> {
  if (!email) {
    return { found: false };
  }

  const user = await client.user.findUnique({
    where: { email },
    select: {
      role: true,
      enabled: true,
    },
  });

  return user ? { found: true, ...user } : { found: false };
}

async function writeAuditSafely(
  input: WriteAdminLoginAuditLogInput,
  writeAuditLog: (input: WriteAdminLoginAuditLogInput) => Promise<unknown>,
) {
  await writeAuditLog(input);
}

export async function handleAuthPostWithAdminLoginAudit(
  request: Request,
  dependencies: AdminLoginAuditDependencies,
) {
  if (!isEmailSignInRequest(request)) {
    return dependencies.authHandler(request);
  }

  const requestId = createRequestId(
    request,
    dependencies.generateRequestId ?? crypto.randomUUID,
  );
  const adminIdentifier = await readEmailFromRequest(request);
  const writeAuditLog = dependencies.writeAuditLog ?? writeAdminLoginAuditLog;
  const getLoginUserState =
    dependencies.getLoginUserState ?? defaultGetLoginUserState;

  const userState = await getLoginUserState(adminIdentifier);
  if (userState.found && userState.role !== "admin") {
    await writeAuditSafely(
      {
        eventType: "admin_login_failure",
        adminIdentifier,
        result: "failure",
        reasonCategory: "unknown",
        requestId,
      },
      writeAuditLog,
    );

    return safeUnauthorizedResponse(requestId);
  }

  if (userState.found && userState.role === "admin" && userState.enabled !== true) {
    await writeAuditSafely(
      {
        eventType: "admin_login_failure",
        adminIdentifier,
        result: "failure",
        reasonCategory: "disabled_account",
        requestId,
      },
      writeAuditLog,
    );

    return safeUnauthorizedResponse(requestId);
  }

  const response = await dependencies.authHandler(request);
  const isSuccess = response.ok;

  await writeAuditSafely(
    {
      eventType: isSuccess ? "admin_login_success" : "admin_login_failure",
      adminIdentifier,
      result: isSuccess ? "success" : "failure",
      reasonCategory: isSuccess ? "none" : "invalid_credentials",
      requestId,
    },
    writeAuditLog,
  );

  return withRequestId(response, requestId);
}
