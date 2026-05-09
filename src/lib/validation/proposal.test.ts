import { describe, expect, it } from "vitest";
import {
  PROPOSAL_BODY_MAX_LENGTH,
  PROPOSAL_TITLE_MAX_LENGTH,
  SUBMITTER_CONTACT_MAX_LENGTH,
  SUBMITTER_NAME_MAX_LENGTH,
  isProposalStatus,
} from "@/lib/domain/proposal";
import {
  validateProposalInput,
  validateProposalStatus,
} from "@/lib/validation/proposal";

describe("proposal validation", () => {
  it("accepts valid proposal input without optional submitter information", () => {
    const result = validateProposalInput({
      title: "Improve onboarding",
      body: "Use a shorter checklist for new trial users.",
    });

    expect(result).toEqual({
      ok: true,
      value: {
        title: "Improve onboarding",
        body: "Use a shorter checklist for new trial users.",
        submitterName: null,
        submitterContact: null,
      },
    });
  });

  it("normalizes and accepts optional submitter information", () => {
    const result = validateProposalInput({
      title: "  Improve labels  ",
      body: "  Use clearer labels.  ",
      submitterName: "  Example Submitter  ",
      submitterContact: "  submitter@example.com  ",
    });

    expect(result).toEqual({
      ok: true,
      value: {
        title: "Improve labels",
        body: "Use clearer labels.",
        submitterName: "Example Submitter",
        submitterContact: "submitter@example.com",
      },
    });
  });

  it("rejects required fields and field length violations", () => {
    const result = validateProposalInput({
      title: "",
      body: "x".repeat(PROPOSAL_BODY_MAX_LENGTH + 1),
      submitterName: "x".repeat(SUBMITTER_NAME_MAX_LENGTH + 1),
      submitterContact: "x".repeat(SUBMITTER_CONTACT_MAX_LENGTH + 1),
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors).toMatchObject({
        title: "Title is required.",
        body: `Body must be ${PROPOSAL_BODY_MAX_LENGTH} characters or fewer.`,
        submitterName: `Submitter name must be ${SUBMITTER_NAME_MAX_LENGTH} characters or fewer.`,
        submitterContact: `Submitter contact must be ${SUBMITTER_CONTACT_MAX_LENGTH} characters or fewer.`,
      });
    }
  });

  it("accepts approved boundary lengths", () => {
    const result = validateProposalInput({
      title: "x".repeat(PROPOSAL_TITLE_MAX_LENGTH),
      body: "x".repeat(PROPOSAL_BODY_MAX_LENGTH),
      submitterName: "x".repeat(SUBMITTER_NAME_MAX_LENGTH),
      submitterContact: "submitter@example.com",
    });

    expect(result.ok).toBe(true);
  });

  it("rejects invalid submitter email format", () => {
    const result = validateProposalInput({
      title: "Improve search",
      body: "Search should be easier to use.",
      submitterContact: "not-an-email",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.submitterContact).toBe(
        "Submitter contact must be an email address.",
      );
    }
  });

  it("validates approved proposal statuses", () => {
    expect(isProposalStatus("new")).toBe(true);
    expect(isProposalStatus("reviewing")).toBe(true);
    expect(isProposalStatus("unknown")).toBe(false);
    expect(validateProposalStatus("done")).toEqual({ ok: true, value: "done" });
    expect(validateProposalStatus("removed").ok).toBe(false);
  });
});
