import { describe, expect, it } from "vitest";
import { evaluateAdminUser } from "@/lib/authz/admin";

const baseUser = {
  id: "user_test_admin",
  email: "admin@example.com",
  name: "Test Admin",
};

describe("admin authorization", () => {
  it("rejects missing sessions as unauthenticated", () => {
    expect(evaluateAdminUser(null)).toEqual({
      allowed: false,
      reason: "unauthenticated",
    });
  });

  it("rejects authenticated users without the admin role", () => {
    expect(
      evaluateAdminUser({
        ...baseUser,
        role: "none",
        enabled: true,
      }),
    ).toEqual({
      allowed: false,
      reason: "not_admin",
    });
  });

  it("rejects disabled admin users", () => {
    expect(
      evaluateAdminUser({
        ...baseUser,
        role: "admin",
        enabled: false,
      }),
    ).toEqual({
      allowed: false,
      reason: "disabled",
    });
  });

  it("accepts enabled admin users", () => {
    expect(
      evaluateAdminUser({
        ...baseUser,
        role: "admin",
        enabled: true,
      }),
    ).toEqual({
      allowed: true,
      user: {
        ...baseUser,
        role: "admin",
        enabled: true,
      },
    });
  });
});
