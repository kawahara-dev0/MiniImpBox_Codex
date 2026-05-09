export const PROPOSAL_TITLE_MAX_LENGTH = 100;
export const PROPOSAL_BODY_MAX_LENGTH = 2000;
export const SUBMITTER_NAME_MAX_LENGTH = 100;
export const SUBMITTER_CONTACT_MAX_LENGTH = 254;

export const PROPOSAL_STATUSES = [
  "new",
  "reviewing",
  "planned",
  "done",
  "declined",
] as const;

export type ProposalStatus = (typeof PROPOSAL_STATUSES)[number];

export const INITIAL_PROPOSAL_STATUS: ProposalStatus = "new";

export function isProposalStatus(value: unknown): value is ProposalStatus {
  return (
    typeof value === "string" &&
    PROPOSAL_STATUSES.includes(value as ProposalStatus)
  );
}

export const STATUS_CHANGE_RESULT_SUCCESS = "success";

export const ADMIN_ROLE = "admin";
