"use client";

import { useActionState, useEffect, useRef } from "react";
import { createProject, type ActionState } from "@/app/actions";

const initialState: ActionState = { ok: false, errors: {} };

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="mt-1 text-sm text-red-700" role="alert">
      {errors[0]}
    </p>
  );
}

export default function ProjectForm() {
  const [state, formAction, pending] = useActionState(
    createProject,
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      ref={formRef}
    >
      <h2 className="text-lg font-semibold text-slate-950">New project</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Name
          <input
            aria-invalid={Boolean(state.errors.name)}
            aria-describedby={state.errors.name ? "project-name-error" : undefined}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950"
            maxLength={80}
            name="name"
            required
            minLength={2}
          />
          {state.errors.name && (
            <p className="mt-1 text-sm text-red-700" id="project-name-error">
              {state.errors.name[0]}
            </p>
          )}
        </label>
        <label className="text-sm font-medium text-slate-700">
          Color
          <input
            aria-invalid={Boolean(state.errors.color)}
            aria-describedby={state.errors.color ? "project-color-error" : undefined}
            className="mt-1 block h-10 w-full rounded-lg border border-slate-300 px-2"
            defaultValue="#6366f1"
            name="color"
            type="color"
          />
          {state.errors.color && (
            <p className="mt-1 text-sm text-red-700" id="project-color-error">
              {state.errors.color[0]}
            </p>
          )}
        </label>
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">
          Description
          <textarea
            aria-invalid={Boolean(state.errors.description)}
            aria-describedby={
              state.errors.description ? "project-description-error" : undefined
            }
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950"
            maxLength={1000}
            name="description"
            rows={2}
          />
          {state.errors.description && (
            <p
              className="mt-1 text-sm text-red-700"
              id="project-description-error"
            >
              {state.errors.description[0]}
            </p>
          )}
        </label>
      </div>
      <FieldError errors={state.errors._form} />
      {state.message && (
        <p aria-live="polite" className="mt-3 text-sm text-emerald-700">
          {state.message}
        </p>
      )}
      <button
        className="mt-5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-wait disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Creating..." : "Create project"}
      </button>
    </form>
  );
}
