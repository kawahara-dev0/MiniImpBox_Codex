import type { PrismaClient } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { createProposalDal } from "@/lib/dal/proposal";

type FakeProposal = {
  id: string;
  title: string;
  body: string;
  status: string;
  submitterName: string | null;
  submitterContact: string | null;
  version: number;
  createdAt: Date;
  updatedAt: Date;
};

type FakeStatusChangeHistory = {
  id: string;
  proposalId: string;
  oldStatus: string;
  newStatus: string;
  changedBy: string;
  changedAt: Date;
  result: string;
};

function createFakePrismaClient() {
  const proposals: FakeProposal[] = [];
  const statusChanges: FakeStatusChangeHistory[] = [];
  let nextProposalId = 1;
  let nextHistoryId = 1;

  const includeStatusChanges = (proposal: FakeProposal) => ({
    ...proposal,
    statusChanges: statusChanges
      .filter((history) => history.proposalId === proposal.id)
      .sort((a, b) => b.changedAt.getTime() - a.changedAt.getTime()),
  });

  type FakePrismaClient = {
    proposal: {
      create: (args: {
        data: {
          title: string;
          body: string;
          status: string;
          submitterName: string | null;
          submitterContact: string | null;
        };
      }) => Promise<Pick<FakeProposal, "id" | "status" | "createdAt">>;
      findMany: () => Promise<
        Array<
          Pick<
            FakeProposal,
            "id" | "title" | "status" | "createdAt" | "updatedAt" | "submitterName"
          >
        >
      >;
      findUnique: (args: { where: { id: string } }) => Promise<
        | (FakeProposal & {
            statusChanges: FakeStatusChangeHistory[];
          })
        | null
      >;
      updateMany: (args: {
        where: { id: string; version: number };
        data: { status: string; version: { increment: number } };
      }) => Promise<{ count: number }>;
    };
    statusChangeHistory: {
      create: (args: {
        data: Omit<FakeStatusChangeHistory, "id" | "changedAt">;
      }) => Promise<FakeStatusChangeHistory>;
    };
    $transaction: <T>(callback: (tx: FakePrismaClient) => Promise<T>) => Promise<T>;
    $disconnect: () => Promise<undefined>;
  };

  const client: FakePrismaClient = {
    proposal: {
      create: async ({
        data,
      }: {
        data: {
          title: string;
          body: string;
          status: string;
          submitterName: string | null;
          submitterContact: string | null;
        };
      }) => {
        const now = new Date();
        const proposal: FakeProposal = {
          id: `proposal-${nextProposalId++}`,
          title: data.title,
          body: data.body,
          status: data.status,
          submitterName: data.submitterName,
          submitterContact: data.submitterContact,
          version: 1,
          createdAt: now,
          updatedAt: now,
        };
        proposals.push(proposal);

        return {
          id: proposal.id,
          status: proposal.status,
          createdAt: proposal.createdAt,
        };
      },
      findMany: async () =>
        [...proposals]
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .map(({ id, title, status, createdAt, updatedAt, submitterName }) => ({
            id,
            title,
            status,
            createdAt,
            updatedAt,
            submitterName,
          })),
      findUnique: async ({ where }: { where: { id: string } }) => {
        const proposal = proposals.find((item) => item.id === where.id);
        return proposal ? includeStatusChanges(proposal) : null;
      },
      updateMany: async ({
        where,
        data,
      }: {
        where: { id: string; version: number };
        data: { status: string; version: { increment: number } };
      }) => {
        const proposal = proposals.find(
          (item) => item.id === where.id && item.version === where.version,
        );

        if (!proposal) {
          return { count: 0 };
        }

        proposal.status = data.status;
        proposal.version += data.version.increment;
        proposal.updatedAt = new Date();
        return { count: 1 };
      },
    },
    statusChangeHistory: {
      create: async ({
        data,
      }: {
        data: Omit<FakeStatusChangeHistory, "id" | "changedAt">;
      }) => {
        const history = {
          ...data,
          id: `history-${nextHistoryId++}`,
          changedAt: new Date(),
        };
        statusChanges.push(history);
        return history;
      },
    },
    $transaction: async <T>(
      callback: (tx: typeof client) => Promise<T>,
    ): Promise<T> => callback(client),
    $disconnect: async () => undefined,
  };

  return client as unknown as PrismaClient;
}

describe("proposal DAL", () => {
  it("creates proposals with new status and no deletion fields", async () => {
    const dal = createProposalDal(createFakePrismaClient());

    const created = await dal.createProposal({
      title: "Improve trial setup",
      body: "Make Docker verification easier for internal trial users.",
      submitterName: "Example Submitter",
      submitterContact: "submitter@example.com",
    });

    expect(created.status).toBe("new");

    const detail = await dal.getAdminProposalDetail(created.id);
    expect(detail).toMatchObject({
      version: 1,
      submitterName: "Example Submitter",
      submitterContact: "submitter@example.com",
    });
    expect(detail && "deletedAt" in detail).toBe(false);
  });

  it("returns admin list DTOs without proposal body or submitter contact", async () => {
    const dal = createProposalDal(createFakePrismaClient());

    await dal.createProposal({
      title: "Reduce setup steps",
      body: "The setup should need fewer manual checks.",
      submitterContact: "submitter@example.com",
    });

    const [item] = await dal.listAdminProposals({ limit: 1 });

    expect(item).toMatchObject({
      title: "Reduce setup steps",
      status: "new",
      submitterName: null,
    });
    expect("body" in item).toBe(false);
    expect("submitterContact" in item).toBe(false);
  });

  it("changes status with version increment and status history transaction", async () => {
    const dal = createProposalDal(createFakePrismaClient());
    const created = await dal.createProposal({
      title: "Track state",
      body: "Status changes should be auditable.",
    });

    const result = await dal.changeProposalStatus({
      proposalId: created.id,
      nextStatus: "reviewing",
      expectedVersion: 1,
      changedBy: "admin@example.com",
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.proposal.status).toBe("reviewing");
      expect(result.proposal.version).toBe(2);
      expect(result.proposal.statusChanges).toHaveLength(1);
      expect(result.proposal.statusChanges[0]).toMatchObject({
        oldStatus: "new",
        newStatus: "reviewing",
        changedBy: "admin@example.com",
        result: "success",
      });
    }
  });

  it("rejects stale status changes without creating success history", async () => {
    const dal = createProposalDal(createFakePrismaClient());
    const created = await dal.createProposal({
      title: "Avoid stale overwrite",
      body: "Conflicting admin updates should not overwrite silently.",
    });

    await dal.changeProposalStatus({
      proposalId: created.id,
      nextStatus: "reviewing",
      expectedVersion: 1,
      changedBy: "admin@example.com",
    });

    const conflict = await dal.changeProposalStatus({
      proposalId: created.id,
      nextStatus: "done",
      expectedVersion: 1,
      changedBy: "second-admin@example.com",
    });

    expect(conflict).toMatchObject({
      ok: false,
      reason: "conflict",
    });
    if (!conflict.ok) {
      expect(conflict.latest?.status).toBe("reviewing");
      expect(conflict.latest?.version).toBe(2);
      expect(conflict.latest?.statusChanges).toHaveLength(1);
    }
  });

  it("returns safe not-found status change results without creating history", async () => {
    const dal = createProposalDal(createFakePrismaClient());

    const result = await dal.changeProposalStatus({
      proposalId: "missing",
      nextStatus: "done",
      expectedVersion: 1,
      changedBy: "admin@example.com",
    });

    expect(result).toEqual({
      ok: false,
      reason: "not_found",
      latest: null,
    });
  });

  it("rejects invalid status change boundary input before persistence", async () => {
    const dal = createProposalDal(createFakePrismaClient());
    const created = await dal.createProposal({
      title: "Validate status input",
      body: "Invalid version values should not reach persistence.",
    });

    await expect(
      dal.changeProposalStatus({
        proposalId: created.id,
        nextStatus: "reviewing",
        expectedVersion: 0,
        changedBy: "admin@example.com",
      }),
    ).rejects.toThrow("Proposal version is invalid.");

    await expect(
      dal.changeProposalStatus({
        proposalId: created.id,
        nextStatus: "reviewing",
        expectedVersion: 1,
        changedBy: "  ",
      }),
    ).rejects.toThrow("Status change actor is required.");
  });
});
