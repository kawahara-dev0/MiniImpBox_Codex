import { describe, expect, it, vi } from "vitest";
import {
  readAdminProposalDetail,
  readAdminProposalList,
} from "@/lib/admin/proposal-read";
import type { AdminAuthorizationResult } from "@/lib/authz/admin";
import type { ProposalDal } from "@/lib/dal/proposal";
import type {
  AdminProposalDetailDto,
  AdminProposalListItemDto,
} from "@/lib/dto/proposal";

const adminUser = {
  id: "user_test_admin",
  email: "admin@example.com",
  role: "admin",
  enabled: true,
};

const createdAt = new Date("2026-05-09T00:00:00.000Z");
const updatedAt = new Date("2026-05-09T01:00:00.000Z");

function createDependencies(authorization: AdminAuthorizationResult, data = {}) {
  const listAdminProposals = vi.fn<
    ProposalDal["listAdminProposals"]
  >().mockResolvedValue((data as { proposals?: AdminProposalListItemDto[] }).proposals ?? []);
  const getAdminProposalDetail = vi.fn<
    ProposalDal["getAdminProposalDetail"]
  >().mockResolvedValue((data as { proposal?: AdminProposalDetailDto | null }).proposal ?? null);

  return {
    dependencies: {
      getCurrentAdmin: vi.fn().mockResolvedValue(authorization),
      proposalDal: {
        listAdminProposals,
        getAdminProposalDetail,
      },
    },
    listAdminProposals,
    getAdminProposalDetail,
  };
}

describe("admin proposal reads", () => {
  it("rejects unauthenticated list access before reading proposal data", async () => {
    const { dependencies, listAdminProposals } = createDependencies({
      allowed: false,
      reason: "unauthenticated",
    });

    const result = await readAdminProposalList({}, dependencies);

    expect(result).toEqual({
      allowed: false,
      reason: "unauthenticated",
    });
    expect(listAdminProposals).not.toHaveBeenCalled();
    expect(JSON.stringify(result)).not.toContain("submitter@example.com");
  });

  it("rejects unauthorized detail access before reading proposal data", async () => {
    const { dependencies, getAdminProposalDetail } = createDependencies({
      allowed: false,
      reason: "not_admin",
    });

    const result = await readAdminProposalDetail("proposal-1", dependencies);

    expect(result).toEqual({
      allowed: false,
      reason: "not_admin",
    });
    expect(getAdminProposalDetail).not.toHaveBeenCalled();
  });

  it("allows enabled admins to read proposal list DTOs with an approved limit", async () => {
    const proposal = {
      id: "proposal-1",
      title: "Improve labels",
      status: "new",
      createdAt,
      updatedAt,
      submitterName: "Example Submitter",
    } satisfies AdminProposalListItemDto;
    const { dependencies, listAdminProposals } = createDependencies(
      {
        allowed: true,
        user: adminUser,
      },
      { proposals: [proposal] },
    );

    const result = await readAdminProposalList({ limit: 50 }, dependencies);

    expect(listAdminProposals).toHaveBeenCalledWith({ limit: 50 });
    expect(result).toEqual({
      allowed: true,
      proposals: [proposal],
    });
    expect(JSON.stringify(result)).not.toContain("submitterContact");
    expect(JSON.stringify(result)).not.toContain("Full proposal body");
  });

  it("allows enabled admins to read proposal detail and status history", async () => {
    const proposal = {
      id: "proposal-1",
      title: "Improve labels",
      body: "Full proposal body for administrator review.",
      status: "new",
      version: 1,
      createdAt,
      updatedAt,
      submitterName: "Example Submitter",
      submitterContact: "submitter@example.com",
      statusChanges: [
        {
          id: "history-1",
          oldStatus: "new",
          newStatus: "reviewing",
          changedBy: "admin@example.com",
          changedAt: updatedAt,
          result: "success",
        },
      ],
    } satisfies AdminProposalDetailDto;
    const { dependencies, getAdminProposalDetail } = createDependencies(
      {
        allowed: true,
        user: adminUser,
      },
      { proposal },
    );

    const result = await readAdminProposalDetail("proposal-1", dependencies);

    expect(getAdminProposalDetail).toHaveBeenCalledWith("proposal-1");
    expect(result).toEqual({
      allowed: true,
      proposal,
    });
  });

  it("returns a safe null detail result for nonexistent proposals", async () => {
    const { dependencies } = createDependencies(
      {
        allowed: true,
        user: adminUser,
      },
      { proposal: null },
    );

    await expect(readAdminProposalDetail("missing", dependencies)).resolves.toEqual({
      allowed: true,
      proposal: null,
    });
  });
});
