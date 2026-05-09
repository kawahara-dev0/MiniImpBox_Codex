import Link from "next/link";
import { notFound } from "next/navigation";
import { readAdminProposalDetail } from "@/lib/admin/proposal-read";
import type { AdminStatusChangeHistoryDto } from "@/lib/dto/proposal";

type AdminProposalDetailPageProps = {
  params: Promise<{
    id: string;
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

export default async function AdminProposalDetailPage({
  params,
}: AdminProposalDetailPageProps) {
  const { id } = await params;
  const result = await readAdminProposalDetail(id);

  if (!result.allowed) {
    return <AdminAccessDenied />;
  }

  if (!result.proposal) {
    notFound();
  }

  const proposal = result.proposal;

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
