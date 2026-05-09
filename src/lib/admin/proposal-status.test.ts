import { describe, expect, it, vi } from "vitest";
import {
  STATUS_CHANGE_CONFLICT_MESSAGE,
  changeAdminProposalStatus,
} from "@/lib/admin/proposal-status";
import type { AdminAuthorizationResult } from "@/lib/authz/admin";
import type { ProposalDal } from "@/lib/dal/proposal";
import type { AdminProposalDetailDto } from "@/lib/dto/proposal";

const adminUser = {
  id: "user_test_admin",
  email: "admin@example.com",
  role: "admin",
  enabled: true,
};

const createdAt = new Date("2026-05-09T00:00:00.000Z");
const updatedAt = new Date("2026-05-09T01:00:00.000Z");

const proposal = {
  id: "proposal-1",
  title: "Improve review flow",
  body: "Use clearly fake proposal content for tests.",
  status: "reviewing",
  version: 2,
  createdAt,
  updatedAt,
  submitterName: "Example Submitter",
  submitterContact: "submitter@example.com",
  statusChanges: [],
} satisfies AdminProposalDetailDto;

function createDependencies(
  authorization: AdminAuthorizationResult,
  changeResult: Awaited<ReturnType<ProposalDal["changeProposalStatus"]>> = {
    ok: true,
    proposal,
  },
) {
  const changeProposalStatus = vi
    .fn<ProposalDal["changeProposalStatus"]>()
    .mockResolvedValue(changeResult);

  return {
    dependencies: {
      getCurrentAdmin: vi.fn().mockResolvedValue(authorization),
      proposalDal: {
        changeProposalStatus,
      },
    },
    changeProposalStatus,
  };
}

describe("admin proposal status changes", () => {
  it("rejects unauthenticated status changes before calling the proposal DAL", async () => {
    const { dependencies, changeProposalStatus: dalChange } = createDependencies({
      allowed: false,
      reason: "unauthenticated",
    });

    const result = await changeAdminProposalStatus(
      {
        proposalId: "proposal-1",
        nextStatus: "reviewing",
        expectedVersion: "1",
      },
      dependencies,
    );

    expect(result).toEqual({
      allowed: false,
      reason: "unauthenticated",
    });
    expect(dalChange).not.toHaveBeenCalled();
  });

  it("rejects unauthorized status changes before calling the proposal DAL", async () => {
    const { dependencies, changeProposalStatus: dalChange } = createDependencies({
      allowed: false,
      reason: "not_admin",
    });

    const result = await changeAdminProposalStatus(
      {
        proposalId: "proposal-1",
        nextStatus: "reviewing",
        expectedVersion: "1",
      },
      dependencies,
    );

    expect(result).toEqual({
      allowed: false,
      reason: "not_admin",
    });
    expect(dalChange).not.toHaveBeenCalled();
  });

  it("rejects disabled admin status changes before calling the proposal DAL", async () => {
    const { dependencies, changeProposalStatus: dalChange } = createDependencies({
      allowed: false,
      reason: "disabled",
    });

    const result = await changeAdminProposalStatus(
      {
        proposalId: "proposal-1",
        nextStatus: "reviewing",
        expectedVersion: "1",
      },
      dependencies,
    );

    expect(result).toEqual({
      allowed: false,
      reason: "disabled",
    });
    expect(dalChange).not.toHaveBeenCalled();
  });

  it("rejects invalid status values before persistence", async () => {
    const { dependencies, changeProposalStatus: dalChange } = createDependencies({
      allowed: true,
      user: adminUser,
    });

    const result = await changeAdminProposalStatus(
      {
        proposalId: "proposal-1",
        nextStatus: "closed",
        expectedVersion: "1",
      },
      dependencies,
    );

    expect(result).toMatchObject({
      allowed: true,
      ok: false,
      reason: "invalid_status",
      latest: null,
    });
    expect(dalChange).not.toHaveBeenCalled();
  });

  it("rejects invalid expected versions before persistence", async () => {
    const { dependencies, changeProposalStatus: dalChange } = createDependencies({
      allowed: true,
      user: adminUser,
    });

    const result = await changeAdminProposalStatus(
      {
        proposalId: "proposal-1",
        nextStatus: "reviewing",
        expectedVersion: "tampered",
      },
      dependencies,
    );

    expect(result).toMatchObject({
      allowed: true,
      ok: false,
      reason: "invalid_version",
      latest: null,
    });
    expect(dalChange).not.toHaveBeenCalled();
  });

  it("changes status as an enabled admin with the read proposal version", async () => {
    const { dependencies, changeProposalStatus: dalChange } = createDependencies({
      allowed: true,
      user: adminUser,
    });

    const result = await changeAdminProposalStatus(
      {
        proposalId: "proposal-1",
        nextStatus: "planned",
        expectedVersion: "2",
      },
      dependencies,
    );

    expect(dalChange).toHaveBeenCalledWith({
      proposalId: "proposal-1",
      nextStatus: "planned",
      expectedVersion: 2,
      changedBy: "admin@example.com",
    });
    expect(result).toEqual({
      allowed: true,
      ok: true,
      proposal,
    });
  });

  it("returns a safe nonexistent proposal error", async () => {
    const { dependencies } = createDependencies(
      {
        allowed: true,
        user: adminUser,
      },
      {
        ok: false,
        reason: "not_found",
        latest: null,
      },
    );

    const result = await changeAdminProposalStatus(
      {
        proposalId: "missing",
        nextStatus: "done",
        expectedVersion: "1",
      },
      dependencies,
    );

    expect(result).toEqual({
      allowed: true,
      ok: false,
      reason: "not_found",
      latest: null,
      message: "The proposal was not found.",
    });
  });

  it("returns the approved safe conflict message with latest state", async () => {
    const { dependencies } = createDependencies(
      {
        allowed: true,
        user: adminUser,
      },
      {
        ok: false,
        reason: "conflict",
        latest: proposal,
      },
    );

    const result = await changeAdminProposalStatus(
      {
        proposalId: "proposal-1",
        nextStatus: "done",
        expectedVersion: "1",
      },
      dependencies,
    );

    expect(result).toEqual({
      allowed: true,
      ok: false,
      reason: "conflict",
      latest: proposal,
      message: STATUS_CHANGE_CONFLICT_MESSAGE,
    });
  });
});
