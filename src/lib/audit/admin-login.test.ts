import { describe, expect, it, vi } from "vitest";
import {
  type AdminLoginAuditDependencies,
  handleAuthPostWithAdminLoginAudit,
} from "@/lib/audit/admin-login";
import type { WriteAdminLoginAuditLogInput } from "@/lib/dal/audit-log";

function createSignInRequest(
  body: Record<string, unknown>,
  headers: Record<string, string> = {},
) {
  return new Request("http://localhost:3000/api/auth/sign-in/email", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

function createDependencies(response: Response) {
  const authHandler = vi.fn().mockResolvedValue(response);
  const writeAuditLog = vi.fn<(input: WriteAdminLoginAuditLogInput) => Promise<unknown>>(
    async () => undefined,
  );
  const getLoginUserState = vi.fn<
    NonNullable<AdminLoginAuditDependencies["getLoginUserState"]>
  >(async () => ({
    found: false,
  }));

  return {
    authHandler,
    writeAuditLog,
    getLoginUserState,
    generateRequestId: () => "request-test-id",
  };
}

describe("admin login audit handling", () => {
  it("passes non-email-sign-in auth requests through without audit writes", async () => {
    const response = Response.json({ ok: true });
    const dependencies = createDependencies(response);
    const request = new Request("http://localhost:3000/api/auth/get-session", {
      method: "POST",
    });

    await expect(
      handleAuthPostWithAdminLoginAudit(request, dependencies),
    ).resolves.toBe(response);

    expect(dependencies.authHandler).toHaveBeenCalledWith(request);
    expect(dependencies.writeAuditLog).not.toHaveBeenCalled();
  });

  it("writes a safe success audit record and propagates request ID", async () => {
    const dependencies = createDependencies(
      Response.json({
        token: "dummy-token-from-auth-library",
        user: { email: "admin@example.com" },
      }, {
        headers: {
          "set-cookie": "better-auth.session_token=dummy-cookie; HttpOnly; Path=/",
          "cache-control": "no-store",
        },
      }),
    );
    const response = await handleAuthPostWithAdminLoginAudit(
      createSignInRequest(
        {
          email: "Admin@Example.com",
          password: "dummy-password-for-test",
        },
        { "x-request-id": "existing-request-id" },
      ),
      dependencies,
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("x-request-id")).toBe("existing-request-id");
    expect(response.headers.get("set-cookie")).toBe(
      "better-auth.session_token=dummy-cookie; HttpOnly; Path=/",
    );
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(dependencies.writeAuditLog).toHaveBeenCalledWith({
      eventType: "admin_login_success",
      adminIdentifier: "admin@example.com",
      result: "success",
      reasonCategory: "none",
      requestId: "existing-request-id",
    });
    expect(JSON.stringify(dependencies.writeAuditLog.mock.calls)).not.toContain(
      "dummy-password-for-test",
    );
    expect(JSON.stringify(dependencies.writeAuditLog.mock.calls)).not.toContain(
      "dummy-token-from-auth-library",
    );
  });

  it("writes a safe invalid-credentials audit record on failed login", async () => {
    const dependencies = createDependencies(
      Response.json(
        {
          code: "UNAUTHORIZED",
          message: "Invalid email or password.",
        },
        { status: 401 },
      ),
    );

    const response = await handleAuthPostWithAdminLoginAudit(
      createSignInRequest({
        email: "admin@example.com",
        password: "wrong-password-for-test",
      }),
      dependencies,
    );

    expect(response.status).toBe(401);
    expect(response.headers.get("x-request-id")).toBe("request-test-id");
    expect(dependencies.writeAuditLog).toHaveBeenCalledWith({
      eventType: "admin_login_failure",
      adminIdentifier: "admin@example.com",
      result: "failure",
      reasonCategory: "invalid_credentials",
      requestId: "request-test-id",
    });
    expect(JSON.stringify(dependencies.writeAuditLog.mock.calls)).not.toContain(
      "wrong-password-for-test",
    );
  });

  it("blocks disabled admin sign-in and writes disabled-account audit", async () => {
    const dependencies = createDependencies(
      Response.json({
        token: "should-not-be-created",
      }),
    );
    dependencies.getLoginUserState.mockResolvedValueOnce({
      found: true,
      role: "admin",
      enabled: false,
    });

    const response = await handleAuthPostWithAdminLoginAudit(
      createSignInRequest({
        email: "disabled-admin@example.com",
        password: "disabled-password-for-test",
      }),
      dependencies,
    );

    expect(response.status).toBe(401);
    expect(response.headers.get("x-request-id")).toBe("request-test-id");
    expect(dependencies.authHandler).not.toHaveBeenCalled();
    expect(dependencies.writeAuditLog).toHaveBeenCalledWith({
      eventType: "admin_login_failure",
      adminIdentifier: "disabled-admin@example.com",
      result: "failure",
      reasonCategory: "disabled_account",
      requestId: "request-test-id",
    });
    expect(JSON.stringify(dependencies.writeAuditLog.mock.calls)).not.toContain(
      "disabled-password-for-test",
    );
  });

  it("blocks non-admin sign-in and writes a safe failure audit", async () => {
    const dependencies = createDependencies(
      Response.json({
        token: "should-not-be-created",
      }),
    );
    dependencies.getLoginUserState.mockResolvedValueOnce({
      found: true,
      role: "none",
      enabled: true,
    });

    const response = await handleAuthPostWithAdminLoginAudit(
      createSignInRequest({
        email: "non-admin@example.com",
        password: "non-admin-password-for-test",
      }),
      dependencies,
    );

    expect(response.status).toBe(401);
    expect(response.headers.get("x-request-id")).toBe("request-test-id");
    expect(dependencies.authHandler).not.toHaveBeenCalled();
    expect(dependencies.writeAuditLog).toHaveBeenCalledWith({
      eventType: "admin_login_failure",
      adminIdentifier: "non-admin@example.com",
      result: "failure",
      reasonCategory: "unknown",
      requestId: "request-test-id",
    });
    expect(JSON.stringify(dependencies.writeAuditLog.mock.calls)).not.toContain(
      "non-admin-password-for-test",
    );
  });
});
