import { ProposalForm } from "@/app/proposal-form";

export default function Home() {
  return (
    <main className="page">
      <section className="intro" aria-labelledby="home-title">
        <p className="eyebrow">Mini Improvement Box</p>
        <h1 id="home-title">Mini Improvement Box</h1>
        <p>
          改善提案を匿名で送信できます。名前と連絡先は任意です。
        </p>
      </section>
      <section className="form-section" aria-label="改善提案フォーム">
        <ProposalForm />
      </section>
    </main>
  );
}
