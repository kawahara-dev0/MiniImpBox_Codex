import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { changeAdminProposalStatus } from "@/lib/admin/proposal-status";
import type { AdminProposalDetailDto } from "@/lib/dto/proposal";
import { changeProposalStatusAction } from "./status-actions";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`redirect:${path}`);
  }),
}));

vi.mock("@/lib/admin/proposal-status", () => ({
  changeAdminProposalStatus: vi.fn(),
}));

const mockedChangeAdminProposalStatus = vi.mocked(changeAdminProposalStatus);
const mockedRevalidatePath = vi.mocked(revalidatePath);
const mockedRedirect = vi.mocked(redirect);
const proposal = {
  id: "proposal-1",
  title: "Improve review flow",
  body: "Use clearly fake proposal content for tests.",
  status: "reviewing",
  version: 2,
  createdAt: new Date("2026-05-09T00:00:00.000Z"),
  updatedAt: new Date("2026-05-09T01:00:00.000Z"),
  submitterName: "Example Submitter",
  submitterContact: "submitter@example.com",
  statusChanges: [],
} satisfies AdminProposalDetailDto;

function createFormData() {
  const formData = new FormData();
  formData.set("proposalId", "proposal-1");
  formData.set("nextStatus", "reviewing");
  formData.set("expectedVersion", "1");
  return formData;
}

describe("admin proposal status action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("revalidates and redirects back to detail after a successful status change", async () => {
    mockedChangeAdminProposalStatus.mockResolvedValueOnce({
      allowed: true,
      ok: true,
      proposal,
    });

    await expect(changeProposalStatusAction(createFormData())).rejects.toThrow(
      "redirect:/admin/proposals/proposal-1?statusResult=changed",
    );

    expect(mockedRevalidatePath).toHaveBeenCalledWith("/admin/proposals/proposal-1");
    expect(mockedRedirect).toHaveBeenCalledWith(
      "/admin/proposals/proposal-1?statusResult=changed",
    );
  });

  it("revalidates and redirects with conflict after a stale status change", async () => {
    mockedChangeAdminProposalStatus.mockResolvedValueOnce({
      allowed: true,
      ok: false,
      reason: "conflict",
      latest: null,
      message: "conflict",
    });

    await expect(changeProposalStatusAction(createFormData())).rejects.toThrow(
      "redirect:/admin/proposals/proposal-1?statusResult=conflict",
    );

    expect(mockedRevalidatePath).toHaveBeenCalledWith("/admin/proposals/proposal-1");
    expect(mockedRedirect).toHaveBeenCalledWith(
      "/admin/proposals/proposal-1?statusResult=conflict",
    );
  });

  it("redirects missing proposals to the list with a safe result", async () => {
    mockedChangeAdminProposalStatus.mockResolvedValueOnce({
      allowed: true,
      ok: false,
      reason: "not_found",
      latest: null,
      message: "The proposal was not found.",
    });

    await expect(changeProposalStatusAction(createFormData())).rejects.toThrow(
      "redirect:/admin/proposals?statusResult=not-found",
    );

    expect(mockedRedirect).toHaveBeenCalledWith(
      "/admin/proposals?statusResult=not-found",
    );
  });

  it("redirects denied status changes without revalidating proposal data", async () => {
    mockedChangeAdminProposalStatus.mockResolvedValueOnce({
      allowed: false,
      reason: "unauthenticated",
    });

    await expect(changeProposalStatusAction(createFormData())).rejects.toThrow(
      "redirect:/admin/proposals/proposal-1?statusResult=forbidden",
    );

    expect(mockedRevalidatePath).not.toHaveBeenCalled();
    expect(mockedRedirect).toHaveBeenCalledWith(
      "/admin/proposals/proposal-1?statusResult=forbidden",
    );
  });
});
