import type { PrismaClient } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { writeAdminLoginAuditLog } from "@/lib/dal/audit-log";

function createFakePrismaClient() {
  const create = vi.fn(async () => ({
    id: "audit-1",
    eventType: "admin_login_success",
    adminIdentifier: "admin@example.com",
    timestamp: new Date("2026-05-10T00:00:00.000Z"),
    result: "success",
    reasonCategory: "none",
    requestId: "request-test-id",
  }));

  return {
    client: {
      adminLoginAuditLog: {
        create,
      },
    } as unknown as PrismaClient,
    create,
  };
}

describe("admin login audit DAL", () => {
  it("persists only approved safe login audit fields", async () => {
    const { client, create } = createFakePrismaClient();

    const result = await writeAdminLoginAuditLog(
      {
        eventType: "admin_login_success",
        adminIdentifier: "admin@example.com",
        result: "success",
        reasonCategory: "none",
        requestId: "request-test-id",
      },
      client,
    );

    expect(create).toHaveBeenCalledWith({
      data: {
        eventType: "admin_login_success",
        adminIdentifier: "admin@example.com",
        result: "success",
        reasonCategory: "none",
        requestId: "request-test-id",
      },
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
    expect(result).toEqual({
      id: "audit-1",
      eventType: "admin_login_success",
      adminIdentifier: "admin@example.com",
      timestamp: new Date("2026-05-10T00:00:00.000Z"),
      result: "success",
      reasonCategory: "none",
      requestId: "request-test-id",
    });
    expect(JSON.stringify(create.mock.calls)).not.toContain("password");
    expect(JSON.stringify(create.mock.calls)).not.toContain("token");
    expect(JSON.stringify(create.mock.calls)).not.toContain("proposal");
    expect(JSON.stringify(create.mock.calls)).not.toContain("submitter");
  });

  it("persists safe failure reason categories without secret fields", async () => {
    const { client, create } = createFakePrismaClient();

    await writeAdminLoginAuditLog(
      {
        eventType: "admin_login_failure",
        adminIdentifier: "admin@example.com",
        result: "failure",
        reasonCategory: "invalid_credentials",
        requestId: "request-test-id",
      },
      client,
    );

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          eventType: "admin_login_failure",
          adminIdentifier: "admin@example.com",
          result: "failure",
          reasonCategory: "invalid_credentials",
          requestId: "request-test-id",
        },
      }),
    );
    expect(JSON.stringify(create.mock.calls)).not.toContain("wrong-password");
    expect(JSON.stringify(create.mock.calls)).not.toContain("session");
  });
});
