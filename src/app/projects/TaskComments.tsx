"use client";

import { useActionState, useEffect, useRef } from "react";
import { addTaskComment, type ActionState } from "@/app/actions";

const initialState: ActionState = { ok: false, errors: {} };

export default function TaskComments({
  projectId,
  taskId,
}: {
  projectId: number;
  taskId: number;
}) {
  const [state, formAction, pending] = useActionState(
    addTaskComment,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const bodyError = state.errors.body?.[0];
  const formError =
    state.errors._form?.[0] ??
    state.errors.projectId?.[0] ??
    state.errors.taskId?.[0];

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form action={formAction} className="mt-4" ref={formRef}>
      <input name="projectId" type="hidden" value={projectId} />
      <input name="taskId" type="hidden" value={taskId} />
      <label
        className="block text-sm font-medium text-slate-700"
        htmlFor={`comment-body-${taskId}`}
      >
        Add a comment
      </label>
      <textarea
        aria-describedby={bodyError ? `comment-error-${taskId}` : undefined}
        aria-invalid={Boolean(bodyError)}
        className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-950"
        id={`comment-body-${taskId}`}
        maxLength={2000}
        name="body"
        required
        rows={3}
      />
      {bodyError && (
        <p
          className="mt-1 text-sm text-red-700"
          id={`comment-error-${taskId}`}
          role="alert"
        >
          {bodyError}
        </p>
      )}
      {formError && (
        <p className="mt-1 text-sm text-red-700" role="alert">
          {formError}
        </p>
      )}
      {state.message && (
        <p aria-live="polite" className="mt-2 text-sm text-emerald-700">
          {state.message}
        </p>
      )}
      <button
        className="mt-2 rounded-lg bg-indigo-700 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-800 disabled:cursor-wait disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Adding..." : "Add comment"}
      </button>
    </form>
  );
}
