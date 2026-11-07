"use client";

import { useActionState } from "react";
import {
  deleteTask,
  updateTaskStatus,
  type ActionState,
} from "@/app/actions";
import type { Task, TaskStatus } from "@/lib/queries";

const initialState: ActionState = { ok: false, errors: {} };

export default function TaskControls({
  task,
}: {
  task: Pick<Task, "id" | "project_id" | "status">;
}) {
  const [statusState, statusAction, statusPending] = useActionState(
    updateTaskStatus,
    initialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteTask,
    initialState,
  );

  return (
    <div className="flex flex-wrap items-end gap-3">
      <form action={statusAction} className="flex items-end gap-2">
        <input
          name="projectId"
          type="hidden"
          value={task.project_id}
        />
        <input name="taskId" type="hidden" value={task.id} />
        <label className="text-xs font-medium text-slate-600">
          Status
          <select
            className="mt-1 block rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900"
            defaultValue={task.status}
            name="status"
          >
            {(["todo", "doing", "done"] as TaskStatus[]).map((status) => (
              <option key={status} value={status}>
                {status === "todo"
                  ? "To do"
                  : status === "doing"
                    ? "In progress"
                    : "Done"}
              </option>
            ))}
          </select>
        </label>
        <button
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 disabled:opacity-60"
          disabled={statusPending}
          type="submit"
        >
          {statusPending ? "Saving..." : "Save"}
        </button>
      </form>
      <form action={deleteAction}>
        <input
          name="projectId"
          type="hidden"
          value={task.project_id}
        />
        <input name="taskId" type="hidden" value={task.id} />
        <button
          className="rounded-lg px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60"
          disabled={deletePending}
          type="submit"
        >
          {deletePending ? "Deleting..." : "Delete"}
        </button>
      </form>
      {(statusState.errors.taskId || deleteState.errors.taskId) && (
        <p className="w-full text-sm text-red-700" role="alert">
          {statusState.errors.taskId?.[0] ?? deleteState.errors.taskId?.[0]}
        </p>
      )}
    </div>
  );
}
