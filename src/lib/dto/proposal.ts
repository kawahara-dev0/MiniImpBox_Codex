import type { ProposalStatus } from "@/lib/domain/proposal";

export type AdminProposalListItemDto = {
  id: string;
  title: string;
  status: ProposalStatus;
  createdAt: Date;
  updatedAt: Date;
  submitterName: string | null;
};

export type AdminStatusChangeHistoryDto = {
  id: string;
  oldStatus: ProposalStatus;
  newStatus: ProposalStatus;
  changedBy: string;
  changedAt: Date;
  result: string;
};

export type AdminProposalDetailDto = {
  id: string;
  title: string;
  body: string;
  status: ProposalStatus;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  submitterName: string | null;
  submitterContact: string | null;
  statusChanges: AdminStatusChangeHistoryDto[];
};

export type CreatedProposalDto = {
  id: string;
  status: ProposalStatus;
  createdAt: Date;
};
