"use client";

import { useOptimistic, useState, useTransition } from "react";
import {
  deleteTask,
  updateTaskStatus,
  type ActionState,
} from "@/app/actions";
import type { Task, TaskPriority, TaskStatus } from "@/lib/queries";

const initialState: ActionState = { ok: false, errors: {} };

const columns: { status: TaskStatus; title: string }[] = [
  { status: "todo", title: "To do" },
  { status: "doing", title: "Doing" },
  { status: "done", title: "Done" },
];

const priorityClasses: Record<TaskPriority, string> = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-rose-100 text-rose-800",
};

function actionError(result: ActionState): string {
  return (
    Object.values(result.errors).flat()[0] ??
    result.message ??
    "The task could not be updated. Please try again."
  );
}

export default function KanbanBoard({
  projectId,
  tasks,
}: {
  projectId: number;
  tasks: Task[];
}) {
  const [optimisticTasks, setOptimisticTasks] = useOptimistic(
    tasks,
    (currentTasks, update: { taskId: number; status: TaskStatus }) =>
      currentTasks.map((task) =>
        task.id === update.taskId ? { ...task, status: update.status } : task,
      ),
  );
  const [pending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function moveTask(task: Task, status: TaskStatus) {
    const formData = new FormData();
    formData.set("projectId", String(projectId));
    formData.set("taskId", String(task.id));
    formData.set("status", status);
    setErrorMessage(null);

    startTransition(async () => {
      setOptimisticTasks({ taskId: task.id, status });
      try {
        const result = await updateTaskStatus(initialState, formData);
        if (!result.ok) setErrorMessage(actionError(result));
      } catch (error) {
        console.error("Failed to update task status.", error);
        setErrorMessage("Could not update the task. Please try again.");
      }
    });
  }

  function removeTask(task: Task) {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) {
      return;
    }

    const formData = new FormData();
    formData.set("projectId", String(projectId));
    formData.set("taskId", String(task.id));
    setErrorMessage(null);

    startTransition(async () => {
      try {
        const result = await deleteTask(initialState, formData);
        if (!result.ok) setErrorMessage(actionError(result));
      } catch (error) {
        console.error("Failed to delete task.", error);
        setErrorMessage("Could not delete the task. Please try again.");
      }
    });
  }

  return (
    <div>
      {errorMessage && (
        <p
          aria-live="polite"
          className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
          role="alert"
        >
          {errorMessage}
        </p>
      )}
      <div className="grid items-start gap-5 md:grid-cols-3">
        {columns.map((column, columnIndex) => {
          const columnTasks = optimisticTasks.filter(
            (task) => task.status === column.status,
          );

          return (
            <section
              aria-labelledby={`column-${column.status}`}
              className="min-w-0 rounded-2xl bg-slate-100/80 p-4"
              key={column.status}
            >
              <header className="mb-4 flex items-center justify-between gap-3">
                <h2
                  className="font-semibold text-slate-900"
                  id={`column-${column.status}`}
                >
                  {column.title}
                </h2>
                <span
                  aria-label={`${columnTasks.length} tasks`}
                  className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-600"
                >
                  {columnTasks.length}
                </span>
              </header>

              {columnTasks.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-300 bg-white/70 px-4 py-8 text-center text-sm text-slate-500">
                  No tasks in this column.
                </p>
              ) : (
                <ul className="space-y-3">
                  {columnTasks.map((task) => (
                    <li
                      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                      key={task.id}
                    >
                      <h3 className="font-semibold leading-6 text-slate-950">
                        {task.title}
                      </h3>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${priorityClasses[task.priority]}`}
                        >
                          {task.priority}
                        </span>
                        {task.due_date && (
                          <time
                            className={`text-xs font-medium ${task.is_overdue ? "text-red-700" : "text-slate-500"}`}
                            dateTime={task.due_date}
                          >
                            Due {task.due_date}
                            {task.is_overdue ? " · Overdue" : ""}
                          </time>
                        )}
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                        <div className="flex gap-1">
                          <button
                            aria-label={`Move ${task.title} left`}
                            className="rounded-md px-2 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                            disabled={pending || columnIndex === 0}
                            onClick={() =>
                              moveTask(task, columns[columnIndex - 1].status)
                            }
                            type="button"
                          >
                            &larr; Left
                          </button>
                          <button
                            aria-label={`Move ${task.title} right`}
                            className="rounded-md px-2 py-1 text-sm font-medium text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                            disabled={
                              pending || columnIndex === columns.length - 1
                            }
                            onClick={() =>
                              moveTask(task, columns[columnIndex + 1].status)
                            }
                            type="button"
                          >
                            Right &rarr;
                          </button>
                        </div>
                        <button
                          aria-label={`Delete ${task.title}`}
                          className="rounded-md px-2 py-1 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
                          disabled={pending}
                          onClick={() => removeTask(task)}
                          type="button"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
