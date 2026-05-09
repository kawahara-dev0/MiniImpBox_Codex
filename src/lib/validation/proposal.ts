import {
  PROPOSAL_BODY_MAX_LENGTH,
  PROPOSAL_TITLE_MAX_LENGTH,
  SUBMITTER_CONTACT_MAX_LENGTH,
  SUBMITTER_NAME_MAX_LENGTH,
  type ProposalStatus,
  isProposalStatus,
} from "@/lib/domain/proposal";

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; errors: Record<string, string> };

export type ProposalInput = {
  title: string;
  body: string;
  submitterName?: string | null;
  submitterContact?: string | null;
};

export type NormalizedProposalInput = {
  title: string;
  body: string;
  submitterName: string | null;
  submitterContact: string | null;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeOptionalText(value: string | null | undefined) {
  const normalized = value?.trim() ?? "";
  return normalized.length === 0 ? null : normalized;
}

export function validateProposalInput(
  input: ProposalInput,
): ValidationResult<NormalizedProposalInput> {
  const title = input.title.trim();
  const body = input.body.trim();
  const submitterName = normalizeOptionalText(input.submitterName);
  const submitterContact = normalizeOptionalText(input.submitterContact);
  const errors: Record<string, string> = {};

  if (title.length < 1) {
    errors.title = "Title is required.";
  } else if (title.length > PROPOSAL_TITLE_MAX_LENGTH) {
    errors.title = `Title must be ${PROPOSAL_TITLE_MAX_LENGTH} characters or fewer.`;
  }

  if (body.length < 1) {
    errors.body = "Body is required.";
  } else if (body.length > PROPOSAL_BODY_MAX_LENGTH) {
    errors.body = `Body must be ${PROPOSAL_BODY_MAX_LENGTH} characters or fewer.`;
  }

  if (
    submitterName !== null &&
    submitterName.length > SUBMITTER_NAME_MAX_LENGTH
  ) {
    errors.submitterName = `Submitter name must be ${SUBMITTER_NAME_MAX_LENGTH} characters or fewer.`;
  }

  if (
    submitterContact !== null &&
    submitterContact.length > SUBMITTER_CONTACT_MAX_LENGTH
  ) {
    errors.submitterContact = `Submitter contact must be ${SUBMITTER_CONTACT_MAX_LENGTH} characters or fewer.`;
  } else if (
    submitterContact !== null &&
    !EMAIL_PATTERN.test(submitterContact)
  ) {
    errors.submitterContact = "Submitter contact must be an email address.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      title,
      body,
      submitterName,
      submitterContact,
    },
  };
}

export function validateProposalStatus(
  value: unknown,
): ValidationResult<ProposalStatus> {
  if (!isProposalStatus(value)) {
    return {
      ok: false,
      errors: {
        status: "Status is invalid.",
      },
    };
  }

  return {
    ok: true,
    value,
  };
}
