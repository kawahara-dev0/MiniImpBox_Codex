import { ProposalForm } from "@/app/proposal-form";

export default function Home() {
  return (
    <main className="page">
      <section className="intro" aria-labelledby="home-title">
        <p className="eyebrow">Mini Improvement Box</p>
        <h1 id="home-title">Mini Improvement Box</h1>
        <p>
          Submit improvement proposals anonymously. Name and contact email are
          optional.
        </p>
      </section>
      <section className="form-section" aria-label="Improvement proposal form">
        <ProposalForm />
      </section>
    </main>
  );
}
