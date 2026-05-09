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
        <h1 id="admin-denied-title">管理者権限が必要です</h1>
        <p>管理者としてログインしてから再度アクセスしてください。</p>
      </section>
    </main>
  );
}

function StatusHistory({ histories }: { histories: AdminStatusChangeHistoryDto[] }) {
  if (histories.length === 0) {
    return <p>状態変更履歴はまだありません。</p>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>変更日時</th>
            <th>変更前</th>
            <th>変更後</th>
            <th>変更者</th>
            <th>結果</th>
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
          <Link href="/admin/proposals">提案一覧へ戻る</Link>
        </p>
      </section>

      <section className="detail-grid" aria-label="提案詳細">
        <div className="form-section">
          <h2>内容</h2>
          <dl className="metadata-list">
            <div>
              <dt>状態</dt>
              <dd>{proposal.status}</dd>
            </div>
            <div>
              <dt>Version</dt>
              <dd>{proposal.version}</dd>
            </div>
            <div>
              <dt>作成日時</dt>
              <dd>{formatDate(proposal.createdAt)}</dd>
            </div>
            <div>
              <dt>更新日時</dt>
              <dd>{formatDate(proposal.updatedAt)}</dd>
            </div>
          </dl>
          <p className="proposal-body">{proposal.body}</p>
        </div>

        <aside className="form-section" aria-label="提出者情報">
          <h2>提出者情報</h2>
          <dl className="metadata-list">
            <div>
              <dt>お名前</dt>
              <dd>{proposal.submitterName ?? "未入力"}</dd>
            </div>
            <div>
              <dt>連絡先メール</dt>
              <dd>{proposal.submitterContact ?? "未入力"}</dd>
            </div>
          </dl>
        </aside>
      </section>

      <section className="form-section" aria-label="状態変更履歴">
        <h2>状態変更履歴</h2>
        <StatusHistory histories={proposal.statusChanges} />
      </section>
    </main>
  );
}
