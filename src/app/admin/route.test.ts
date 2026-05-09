import { describe, expect, it, vi } from "vitest";
import { GET } from "@/app/admin/route";
import { getCurrentAdmin } from "@/lib/authz/admin";

vi.mock("@/lib/authz/admin", () => ({
  getCurrentAdmin: vi.fn(),
}));

const mockedGetCurrentAdmin = vi.mocked(getCurrentAdmin);

describe("admin auth boundary route", () => {
  it("rejects unauthenticated access without returning admin data", async () => {
    mockedGetCurrentAdmin.mockResolvedValueOnce({
      allowed: false,
      reason: "unauthenticated",
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ error: "unauthenticated" });
  });

  it("rejects authenticated non-admin or disabled users", async () => {
    mockedGetCurrentAdmin.mockResolvedValueOnce({
      allowed: false,
      reason: "not_admin",
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body).toEqual({ error: "forbidden" });
  });

  it("accepts enabled admin users without returning session secrets", async () => {
    mockedGetCurrentAdmin.mockResolvedValueOnce({
      allowed: true,
      user: {
        id: "user_test_admin",
        email: "admin@example.com",
        name: "Test Admin",
        role: "admin",
        enabled: true,
      },
    });

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      status: "ok",
      user: {
        id: "user_test_admin",
        email: "admin@example.com",
        role: "admin",
      },
    });
  });
});
