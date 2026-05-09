import Link from "next/link";
import { readAdminProposalList } from "@/lib/admin/proposal-read";

type AdminProposalListPageProps = {
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

function getListMessage(statusResult: string | string[] | undefined) {
  const value = Array.isArray(statusResult) ? statusResult[0] : statusResult;
  return value === "not-found" ? "The proposal was not found." : null;
}

export default async function AdminProposalListPage({
  searchParams,
}: AdminProposalListPageProps) {
  const query = searchParams ? await searchParams : {};
  const result = await readAdminProposalList({ limit: 50 });

  if (!result.allowed) {
    return <AdminAccessDenied />;
  }

  const message = getListMessage(query.statusResult);

  return (
    <main className="page admin-page">
      <section className="intro" aria-labelledby="admin-proposals-title">
        <p className="eyebrow">Admin</p>
        <h1 id="admin-proposals-title">Proposal List</h1>
        <p>Showing the latest 50 improvement proposals for administrators.</p>
      </section>

      <section className="form-section" aria-label="Proposal list">
        {message ? <p className="notice error">{message}</p> : null}
        {result.proposals.length === 0 ? (
          <p>No proposals have been submitted yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Submitter</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {result.proposals.map((proposal) => (
                  <tr key={proposal.id}>
                    <td>
                      <Link href={`/admin/proposals/${proposal.id}`}>
                        {proposal.title}
                      </Link>
                    </td>
                    <td>{proposal.status}</td>
                    <td>{proposal.submitterName ?? "Anonymous"}</td>
                    <td>{formatDate(proposal.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
