import Link from "next/link";
import { notFound } from "next/navigation";
import { readAdminProposalDetail } from "@/lib/admin/proposal-read";
import { STATUS_CHANGE_CONFLICT_MESSAGE } from "@/lib/admin/proposal-status";
import type { AdminStatusChangeHistoryDto } from "@/lib/dto/proposal";
import { PROPOSAL_STATUSES } from "@/lib/domain/proposal";
import { changeProposalStatusAction } from "./status-actions";

type AdminProposalDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<{
    statusResult?: string | string[];
  }>;
};

function formatDate(value: Date) {
  return value.toISOString().slice(0, 16).replace("T", " ");
}

function AdminAccessDenied() {
  return (
    <main className="page">
      <section className="form-section" aria-labelledby="admin-denied-title">
        <p className="eyebrow">Admin</p>
        <h1 id="admin-denied-title">Admin access required</h1>
        <p>Please sign in as an administrator and try again.</p>
      </section>
    </main>
  );
}

function StatusHistory({ histories }: { histories: AdminStatusChangeHistoryDto[] }) {
  if (histories.length === 0) {
    return <p>No status history has been recorded yet.</p>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Changed</th>
            <th>Previous status</th>
            <th>New status</th>
            <th>Changed by</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          {histories.map((history) => (
            <tr key={history.id}>
              <td>{formatDate(history.changedAt)}</td>
              <td>{history.oldStatus}</td>
              <td>{history.newStatus}</td>
              <td>{history.changedBy}</td>
              <td>{history.result}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function getStatusResultMessage(statusResult: string | string[] | undefined) {
  const value = Array.isArray(statusResult) ? statusResult[0] : statusResult;

  switch (value) {
    case "changed":
      return {
        className: "notice success",
        text: "Status was updated.",
      };
    case "conflict":
      return {
        className: "notice error",
        text: STATUS_CHANGE_CONFLICT_MESSAGE,
      };
    case "invalid_status":
      return {
        className: "notice error",
        text: "Select a valid status.",
      };
    case "invalid_version":
      return {
        className: "notice error",
        text: "Reload the latest proposal before changing status.",
      };
    case "forbidden":
      return {
        className: "notice error",
        text: "Admin access is required to change status.",
      };
    default:
      return null;
  }
}

export default async function AdminProposalDetailPage({
  params,
  searchParams,
}: AdminProposalDetailPageProps) {
  const { id } = await params;
  const query = searchParams ? await searchParams : {};
  const result = await readAdminProposalDetail(id);

  if (!result.allowed) {
    return <AdminAccessDenied />;
  }

  if (!result.proposal) {
    notFound();
  }

  const proposal = result.proposal;
  const statusMessage = getStatusResultMessage(query.statusResult);

  return (
    <main className="page admin-page">
      <section className="intro" aria-labelledby="admin-proposal-title">
        <p className="eyebrow">Admin</p>
        <h1 id="admin-proposal-title">{proposal.title}</h1>
        <p>
          <Link href="/admin/proposals">Back to proposal list</Link>
        </p>
      </section>

      <section className="detail-grid" aria-label="Proposal detail">
        <div className="form-section">
          <h2>Details</h2>
          <dl className="metadata-list">
            <div>
              <dt>Status</dt>
              <dd>{proposal.status}</dd>
            </div>
            <div>
              <dt>Version</dt>
              <dd>{proposal.version}</dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{formatDate(proposal.createdAt)}</dd>
            </div>
            <div>
              <dt>Updated</dt>
              <dd>{formatDate(proposal.updatedAt)}</dd>
            </div>
          </dl>
          {statusMessage ? (
            <p className={statusMessage.className}>{statusMessage.text}</p>
          ) : null}
          <form className="status-form" action={changeProposalStatusAction}>
            <input type="hidden" name="proposalId" value={proposal.id} />
            <input
              type="hidden"
              name="expectedVersion"
              value={proposal.version}
            />
            <label htmlFor="nextStatus">Change status</label>
            <div className="inline-action">
              <select
                id="nextStatus"
                name="nextStatus"
                defaultValue={proposal.status}
              >
                {PROPOSAL_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <button type="submit">Update status</button>
            </div>
          </form>
          <p className="proposal-body">{proposal.body}</p>
        </div>

        <aside className="form-section" aria-label="Submitter information">
          <h2>Submitter Information</h2>
          <dl className="metadata-list">
            <div>
              <dt>Name</dt>
              <dd>{proposal.submitterName ?? "Not provided"}</dd>
            </div>
            <div>
              <dt>Contact email</dt>
              <dd>{proposal.submitterContact ?? "Not provided"}</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="form-section" aria-label="Status history">
        <h2>Status History</h2>
        <StatusHistory histories={proposal.statusChanges} />
      </section>
    </main>
  );
}
