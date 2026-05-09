import type { AdminAuthorizationResult } from "@/lib/authz/admin";
import { getCurrentAdmin } from "@/lib/authz/admin";
import type { ProposalDal } from "@/lib/dal/proposal";
import { createProposalDal } from "@/lib/dal/proposal";
import type {
  AdminProposalDetailDto,
  AdminProposalListItemDto,
} from "@/lib/dto/proposal";

type AdminProposalReadDependencies = {
  getCurrentAdmin: () => Promise<AdminAuthorizationResult>;
  proposalDal: Pick<ProposalDal, "listAdminProposals" | "getAdminProposalDetail">;
};

export type AdminProposalListReadResult =
  | {
      allowed: true;
      proposals: AdminProposalListItemDto[];
    }
  | {
      allowed: false;
      reason: Exclude<AdminAuthorizationResult, { allowed: true }>["reason"];
    };

export type AdminProposalDetailReadResult =
  | {
      allowed: true;
      proposal: AdminProposalDetailDto | null;
    }
  | {
      allowed: false;
      reason: Exclude<AdminAuthorizationResult, { allowed: true }>["reason"];
    };

function createDefaultDependencies(): AdminProposalReadDependencies {
  return {
    getCurrentAdmin,
    proposalDal: createProposalDal(),
  };
}

export async function readAdminProposalList(
  input: { limit?: number; offset?: number } = {},
  dependencies: AdminProposalReadDependencies = createDefaultDependencies(),
): Promise<AdminProposalListReadResult> {
  const authorization = await dependencies.getCurrentAdmin();
  if (!authorization.allowed) {
    return authorization;
  }

  return {
    allowed: true,
    proposals: await dependencies.proposalDal.listAdminProposals(input),
  };
}

export async function readAdminProposalDetail(
  id: string,
  dependencies: AdminProposalReadDependencies = createDefaultDependencies(),
): Promise<AdminProposalDetailReadResult> {
  const authorization = await dependencies.getCurrentAdmin();
  if (!authorization.allowed) {
    return authorization;
  }

  return {
    allowed: true,
    proposal: await dependencies.proposalDal.getAdminProposalDetail(id),
  };
}
