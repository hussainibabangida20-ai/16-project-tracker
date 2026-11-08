"use client";

import { useActionState, useEffect, useRef } from "react";
import { createTask, type ActionState } from "@/app/actions";

const initialState: ActionState = { ok: false, errors: {} };

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p className="mt-1 text-sm text-red-700" role="alert">
      {errors[0]}
    </p>
  );
}

export default function TaskForm({ projectId }: { projectId: number }) {
  const [state, formAction, pending] = useActionState(createTask, initialState);
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
      <h2 className="text-lg font-semibold text-slate-950">New task</h2>
      <input name="projectId" type="hidden" value={projectId} />
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">
          Title
          <input
            aria-invalid={Boolean(state.errors.title)}
            aria-describedby={state.errors.title ? "task-title-error" : undefined}
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950"
            maxLength={140}
            minLength={2}
            name="title"
            required
          />
          {state.errors.title && (
            <p className="mt-1 text-sm text-red-700" id="task-title-error">
              {state.errors.title[0]}
            </p>
          )}
        </label>
        <label className="text-sm font-medium text-slate-700">
          Status
          <select
            aria-invalid={Boolean(state.errors.status)}
            aria-describedby={state.errors.status ? "task-status-error" : undefined}
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950"
            defaultValue="todo"
            name="status"
          >
            <option value="todo">To do</option>
            <option value="doing">In progress</option>
            <option value="done">Done</option>
          </select>
          {state.errors.status && (
            <p className="mt-1 text-sm text-red-700" id="task-status-error">
              {state.errors.status[0]}
            </p>
          )}
        </label>
        <label className="text-sm font-medium text-slate-700">
          Priority
          <select
            aria-invalid={Boolean(state.errors.priority)}
            aria-describedby={
              state.errors.priority ? "task-priority-error" : undefined
            }
            className="mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-950"
            defaultValue="medium"
            name="priority"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          {state.errors.priority && (
            <p className="mt-1 text-sm text-red-700" id="task-priority-error">
              {state.errors.priority[0]}
            </p>
          )}
        </label>
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">
          Due date <span className="font-normal text-slate-500">(optional)</span>
          <input
            aria-invalid={Boolean(state.errors.due_date)}
            aria-describedby={
              state.errors.due_date ? "task-due-date-error" : undefined
            }
            className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-950"
            name="due_date"
            type="date"
          />
          {state.errors.due_date && (
            <p className="mt-1 text-sm text-red-700" id="task-due-date-error">
              {state.errors.due_date[0]}
            </p>
          )}
        </label>
      </div>
      <FieldError errors={state.errors.projectId} />
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
        {pending ? "Adding..." : "Add task"}
      </button>
    </form>
  );
}
