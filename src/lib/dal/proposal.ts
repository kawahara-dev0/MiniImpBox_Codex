import type { Prisma, PrismaClient } from "@prisma/client";
import {
  INITIAL_PROPOSAL_STATUS,
  STATUS_CHANGE_RESULT_SUCCESS,
  type ProposalStatus,
  isProposalStatus,
} from "@/lib/domain/proposal";
import type {
  AdminProposalDetailDto,
  AdminProposalListItemDto,
  CreatedProposalDto,
} from "@/lib/dto/proposal";
import { validateProposalInput } from "@/lib/validation/proposal";
import { prisma as defaultPrisma } from "@/lib/db/prisma";

export type ProposalDal = {
  createProposal(input: CreateProposalInput): Promise<CreatedProposalDto>;
  listAdminProposals(input?: {
    limit?: number;
    offset?: number;
  }): Promise<AdminProposalListItemDto[]>;
  getAdminProposalDetail(id: string): Promise<AdminProposalDetailDto | null>;
  changeProposalStatus(input: ChangeProposalStatusInput): Promise<
    | { ok: true; proposal: AdminProposalDetailDto }
    | {
        ok: false;
        reason: "not_found" | "conflict";
        latest: AdminProposalDetailDto | null;
      }
  >;
};

export type CreateProposalInput = {
  title: string;
  body: string;
  submitterName?: string | null;
  submitterContact?: string | null;
};

export type ChangeProposalStatusInput = {
  proposalId: string;
  nextStatus: ProposalStatus;
  expectedVersion: number;
  changedBy: string;
};

const DEFAULT_ADMIN_LIST_LIMIT = 50;
const MAX_ADMIN_LIST_LIMIT = 100;

type PrismaExecutor = PrismaClient | Prisma.TransactionClient;

function assertValidStatusChangeInput(input: ChangeProposalStatusInput) {
  if (!Number.isInteger(input.expectedVersion) || input.expectedVersion < 1) {
    throw new Error("Proposal version is invalid.");
  }

  if (input.changedBy.trim().length === 0) {
    throw new Error("Status change actor is required.");
  }
}

function toProposalStatus(value: string): ProposalStatus {
  if (!isProposalStatus(value)) {
    throw new Error("Stored proposal status is invalid.");
  }

  return value;
}

function toAdminListItemDto(proposal: {
  id: string;
  title: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  submitterName: string | null;
}): AdminProposalListItemDto {
  return {
    ...proposal,
    status: toProposalStatus(proposal.status),
  };
}

function toAdminDetailDto(proposal: {
  id: string;
  title: string;
  body: string;
  status: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  submitterName: string | null;
  submitterContact: string | null;
  statusChanges: Array<{
    id: string;
    oldStatus: string;
    newStatus: string;
    changedBy: string;
    changedAt: Date;
    result: string;
  }>;
}): AdminProposalDetailDto {
  return {
    ...proposal,
    status: toProposalStatus(proposal.status),
    statusChanges: proposal.statusChanges.map((history) => ({
      ...history,
      oldStatus: toProposalStatus(history.oldStatus),
      newStatus: toProposalStatus(history.newStatus),
    })),
  };
}

async function getAdminProposalDetailWithClient(
  client: PrismaExecutor,
  id: string,
) {
  const proposal = await client.proposal.findUnique({
    where: { id },
    include: {
      statusChanges: {
        orderBy: { changedAt: "desc" },
      },
    },
  });

  return proposal ? toAdminDetailDto(proposal) : null;
}

export function createProposalDal(client: PrismaClient = defaultPrisma): ProposalDal {
  return {
    async createProposal(input) {
      const validation = validateProposalInput(input);
      if (!validation.ok) {
        throw new Error("Proposal input is invalid.");
      }

      const proposal = await client.proposal.create({
        data: {
          title: validation.value.title,
          body: validation.value.body,
          status: INITIAL_PROPOSAL_STATUS,
          submitterName: validation.value.submitterName,
          submitterContact: validation.value.submitterContact,
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
        },
      });

      return {
        id: proposal.id,
        status: toProposalStatus(proposal.status),
        createdAt: proposal.createdAt,
      };
    },

    async listAdminProposals(input = {}) {
      const requestedLimit = input.limit ?? DEFAULT_ADMIN_LIST_LIMIT;
      const limit = Math.min(Math.max(requestedLimit, 1), MAX_ADMIN_LIST_LIMIT);
      const proposals = await client.proposal.findMany({
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: limit,
        skip: input.offset ?? 0,
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          submitterName: true,
        },
      });

      return proposals.map(toAdminListItemDto);
    },

    async getAdminProposalDetail(id) {
      return getAdminProposalDetailWithClient(client, id);
    },

    async changeProposalStatus(input) {
      assertValidStatusChangeInput(input);

      return client.$transaction(async (tx) => {
        const current = await tx.proposal.findUnique({
          where: { id: input.proposalId },
          select: {
            id: true,
            status: true,
            version: true,
          },
        });

        if (!current) {
          return {
            ok: false,
            reason: "not_found",
            latest: null,
          };
        }

        const updateResult = await tx.proposal.updateMany({
          where: {
            id: input.proposalId,
            version: input.expectedVersion,
          },
          data: {
            status: input.nextStatus,
            version: {
              increment: 1,
            },
          },
        });

        if (updateResult.count === 0) {
          return {
            ok: false,
            reason: "conflict",
            latest: await getAdminProposalDetailWithClient(tx, input.proposalId),
          };
        }

        await tx.statusChangeHistory.create({
          data: {
            proposalId: input.proposalId,
            oldStatus: current.status,
            newStatus: input.nextStatus,
            changedBy: input.changedBy,
            result: STATUS_CHANGE_RESULT_SUCCESS,
          },
        });

        const updated = await getAdminProposalDetailWithClient(tx, input.proposalId);
        if (!updated) {
          throw new Error("Updated proposal was not found.");
        }

        return {
          ok: true,
          proposal: updated,
        };
      });
    },
  };
}
