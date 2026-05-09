"use client";

import { useActionState } from "react";
import { submitProposalAction } from "@/app/proposal-actions";
import { initialProposalSubmissionState } from "@/lib/actions/proposal-submission";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="field-error">{message}</p>;
}

export function ProposalForm() {
  const [state, formAction, isPending] = useActionState(
    submitProposalAction,
    initialProposalSubmissionState,
  );

  return (
    <form className="proposal-form" action={formAction}>
      {state.message ? (
        <div className={state.success ? "notice success" : "notice error"}>
          {state.message}
        </div>
      ) : null}

      <div className="field">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          maxLength={100}
          required
          aria-describedby={state.errors.title ? "title-error" : undefined}
        />
        <div id="title-error">
          <FieldError message={state.errors.title} />
        </div>
      </div>

      <div className="field">
        <label htmlFor="body">Proposal details</label>
        <textarea
          id="body"
          name="body"
          maxLength={2000}
          required
          rows={8}
          aria-describedby={state.errors.body ? "body-error" : undefined}
        />
        <div id="body-error">
          <FieldError message={state.errors.body} />
        </div>
      </div>

      <div className="field-grid">
        <div className="field">
          <label htmlFor="submitterName">Name</label>
          <input id="submitterName" name="submitterName" maxLength={100} />
          <FieldError message={state.errors.submitterName} />
        </div>

        <div className="field">
          <label htmlFor="submitterContact">Contact email</label>
          <input
            id="submitterContact"
            name="submitterContact"
            type="email"
            maxLength={254}
          />
          <FieldError message={state.errors.submitterContact} />
        </div>
      </div>

      <button type="submit" disabled={isPending}>
        {isPending ? "Submitting" : "Submit proposal"}
      </button>
    </form>
  );
}
