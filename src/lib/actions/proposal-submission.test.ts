import { describe, expect, it } from "vitest";
import type { CreateProposalInput, ProposalDal } from "@/lib/dal/proposal";
import {
  initialProposalSubmissionState,
  submitProposalWithDal,
} from "@/lib/actions/proposal-submission";

function createFormData(fields: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.set(key, value);
  }
  return formData;
}

function createFakeProposalDal() {
  const created: CreateProposalInput[] = [];

  const dal = {
    createProposal: async (input) => {
      created.push(input);
      return {
        id: "proposal-test-id",
        status: "new",
        createdAt: new Date("2026-05-09T00:00:00.000Z"),
      };
    },
  } satisfies Partial<ProposalDal>;

  return {
    created,
    dal: dal as ProposalDal,
  };
}

describe("proposal submission action", () => {
  it("creates a proposal without optional submitter data", async () => {
    const { created, dal } = createFakeProposalDal();

    const result = await submitProposalWithDal(
      initialProposalSubmissionState,
      createFormData({
        title: "Improve setup",
        body: "Make the trial setup easier.",
        submitterName: "",
        submitterContact: "",
      }),
      dal,
    );

    expect(result).toEqual({
      success: true,
      message: "提案を受け付けました。",
      errors: {},
    });
    expect(created).toEqual([
      {
        title: "Improve setup",
        body: "Make the trial setup easier.",
        submitterName: null,
        submitterContact: null,
      },
    ]);
  });

  it("creates a proposal with optional submitter data", async () => {
    const { created, dal } = createFakeProposalDal();

    await submitProposalWithDal(
      initialProposalSubmissionState,
      createFormData({
        title: "Improve labels",
        body: "Use clearer labels.",
        submitterName: "Example Submitter",
        submitterContact: "submitter@example.com",
      }),
      dal,
    );

    expect(created[0]).toMatchObject({
      submitterName: "Example Submitter",
      submitterContact: "submitter@example.com",
    });
  });

  it("returns validation errors without creating a proposal", async () => {
    const { created, dal } = createFakeProposalDal();

    const result = await submitProposalWithDal(
      initialProposalSubmissionState,
      createFormData({
        title: "",
        body: "",
        submitterName: "",
        submitterContact: "not-an-email",
      }),
      dal,
    );

    expect(result.success).toBe(false);
    expect(result.errors).toMatchObject({
      title: "Title is required.",
      body: "Body is required.",
      submitterContact: "Submitter contact must be an email address.",
    });
    expect(created).toHaveLength(0);
  });

  it("stores HTML-like body as plain text input", async () => {
    const { created, dal } = createFakeProposalDal();

    await submitProposalWithDal(
      initialProposalSubmissionState,
      createFormData({
        title: "Check display safety",
        body: "<script>alert(1)</script>",
      }),
      dal,
    );

    expect(created[0]?.body).toBe("<script>alert(1)</script>");
  });
});
