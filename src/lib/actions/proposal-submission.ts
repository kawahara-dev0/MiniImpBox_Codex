import type { ProposalDal } from "@/lib/dal/proposal";
import { validateProposalInput } from "@/lib/validation/proposal";

export type ProposalSubmissionState = {
  success: boolean;
  message: string | null;
  errors: Record<string, string>;
};

export const initialProposalSubmissionState: ProposalSubmissionState = {
  success: false,
  message: null,
  errors: {},
};

function getFormString(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function submitProposalWithDal(
  _previousState: ProposalSubmissionState,
  formData: FormData,
  dal: ProposalDal,
): Promise<ProposalSubmissionState> {
  const input = {
    title: getFormString(formData, "title"),
    body: getFormString(formData, "body"),
    submitterName: getFormString(formData, "submitterName"),
    submitterContact: getFormString(formData, "submitterContact"),
  };

  const validation = validateProposalInput(input);
  if (!validation.ok) {
    return {
      success: false,
      message: "入力内容を確認してください。",
      errors: validation.errors,
    };
  }

  await dal.createProposal(validation.value);

  return {
    success: true,
    message: "提案を受け付けました。",
    errors: {},
  };
}
