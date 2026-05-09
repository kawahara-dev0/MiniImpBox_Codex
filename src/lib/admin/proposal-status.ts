import type { AdminAuthorizationResult } from "@/lib/authz/admin";
import { getCurrentAdmin } from "@/lib/authz/admin";
import type { ProposalDal } from "@/lib/dal/proposal";
import { createProposalDal } from "@/lib/dal/proposal";
import type { AdminProposalDetailDto } from "@/lib/dto/proposal";
import { isProposalStatus } from "@/lib/domain/proposal";

export const STATUS_CHANGE_CONFLICT_MESSAGE =
  "この提案は他の管理者により更新されています。最新の内容を確認してから再度操作してください。";

type AdminProposalStatusDependencies = {
  getCurrentAdmin: () => Promise<AdminAuthorizationResult>;
  proposalDal: Pick<ProposalDal, "changeProposalStatus">;
};

export type ChangeAdminProposalStatusInput = {
  proposalId: string;
  nextStatus: unknown;
  expectedVersion: unknown;
};

export type ChangeAdminProposalStatusResult =
  | {
      allowed: true;
      ok: true;
      proposal: AdminProposalDetailDto;
    }
  | {
      allowed: true;
      ok: false;
      reason: "invalid_status" | "invalid_version" | "not_found" | "conflict";
      latest: AdminProposalDetailDto | null;
      message: string;
    }
  | {
      allowed: false;
      reason: Exclude<AdminAuthorizationResult, { allowed: true }>["reason"];
    };

function createDefaultDependencies(): AdminProposalStatusDependencies {
  return {
    getCurrentAdmin,
    proposalDal: createProposalDal(),
  };
}

function parseExpectedVersion(value: unknown): number | null {
  const version =
    typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;

  if (!Number.isInteger(version) || version < 1) {
    return null;
  }

  return version;
}

export async function changeAdminProposalStatus(
  input: ChangeAdminProposalStatusInput,
  dependencies: AdminProposalStatusDependencies = createDefaultDependencies(),
): Promise<ChangeAdminProposalStatusResult> {
  const authorization = await dependencies.getCurrentAdmin();
  if (!authorization.allowed) {
    return authorization;
  }

  if (!isProposalStatus(input.nextStatus)) {
    return {
      allowed: true,
      ok: false,
      reason: "invalid_status",
      latest: null,
      message: "Select a valid status.",
    };
  }

  const expectedVersion = parseExpectedVersion(input.expectedVersion);
  if (expectedVersion === null) {
    return {
      allowed: true,
      ok: false,
      reason: "invalid_version",
      latest: null,
      message: "Reload the latest proposal before changing status.",
    };
  }

  const result = await dependencies.proposalDal.changeProposalStatus({
    proposalId: input.proposalId,
    nextStatus: input.nextStatus,
    expectedVersion,
    changedBy: authorization.user.email,
  });

  if (result.ok) {
    return {
      allowed: true,
      ok: true,
      proposal: result.proposal,
    };
  }

  return {
    allowed: true,
    ok: false,
    reason: result.reason,
    latest: result.latest,
    message:
      result.reason === "conflict"
        ? STATUS_CHANGE_CONFLICT_MESSAGE
        : "The proposal was not found.",
  };
}
