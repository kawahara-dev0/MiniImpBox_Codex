"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { changeAdminProposalStatus } from "@/lib/admin/proposal-status";

function detailPath(proposalId: string, result: string) {
  const id = encodeURIComponent(proposalId);
  return `/admin/proposals/${id}?statusResult=${encodeURIComponent(result)}`;
}

export async function changeProposalStatusAction(formData: FormData) {
  const proposalId = String(formData.get("proposalId") ?? "");
  const result = await changeAdminProposalStatus({
    proposalId,
    nextStatus: formData.get("nextStatus"),
    expectedVersion: formData.get("expectedVersion"),
  });

  if (!result.allowed) {
    redirect(detailPath(proposalId, "forbidden"));
  }

  if (result.ok) {
    revalidatePath(`/admin/proposals/${proposalId}`);
    redirect(detailPath(proposalId, "changed"));
  }

  if (result.reason === "conflict") {
    revalidatePath(`/admin/proposals/${proposalId}`);
    redirect(detailPath(proposalId, "conflict"));
  }

  if (result.reason === "not_found") {
    redirect("/admin/proposals?statusResult=not-found");
  }

  redirect(detailPath(proposalId, result.reason));
}
