import Link from "next/link";
import { readAdminProposalList } from "@/lib/admin/proposal-read";

function formatDate(value: Date) {
  return value.toISOString().slice(0, 16).replace("T", " ");
}

function AdminAccessDenied() {
  return (
    <main className="page">
      <section className="form-section" aria-labelledby="admin-denied-title">
        <p className="eyebrow">Admin</p>
        <h1 id="admin-denied-title">管理者権限が必要です</h1>
        <p>管理者としてログインしてから再度アクセスしてください。</p>
      </section>
    </main>
  );
}

export default async function AdminProposalListPage() {
  const result = await readAdminProposalList({ limit: 50 });

  if (!result.allowed) {
    return <AdminAccessDenied />;
  }

  return (
    <main className="page admin-page">
      <section className="intro" aria-labelledby="admin-proposals-title">
        <p className="eyebrow">Admin</p>
        <h1 id="admin-proposals-title">提案一覧</h1>
        <p>最新 50 件の改善提案を管理者向けに表示します。</p>
      </section>

      <section className="form-section" aria-label="提案一覧">
        {result.proposals.length === 0 ? (
          <p>提案はまだありません。</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>タイトル</th>
                  <th>状態</th>
                  <th>提出者</th>
                  <th>作成日時</th>
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
                    <td>{proposal.submitterName ?? "匿名"}</td>
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
