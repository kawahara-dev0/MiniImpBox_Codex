"use server";

import {
  type ProposalSubmissionState,
  submitProposalWithDal,
} from "@/lib/actions/proposal-submission";
import { createProposalDal } from "@/lib/dal/proposal";

export async function submitProposalAction(
  previousState: ProposalSubmissionState,
  formData: FormData,
): Promise<ProposalSubmissionState> {
  return submitProposalWithDal(previousState, formData, createProposalDal());
}
