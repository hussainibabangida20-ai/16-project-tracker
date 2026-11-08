import Link from "next/link";
import {
  getOverallStats,
  getProjectStats,
  type OverallStats,
} from "@/lib/queries";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

function BarChart({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; count: number; color: string }[];
}) {
  const maximum = Math.max(1, ...rows.map((row) => row.count));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <ul className="mt-5 space-y-4">
        {rows.map((row) => (
          <li key={row.label}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-slate-700">{row.label}</span>
              <span className="tabular-nums text-slate-600">{row.count}</span>
            </div>
            <div
              aria-label={`${row.label}: ${row.count}`}
              aria-valuemax={maximum}
              aria-valuemin={0}
              aria-valuenow={row.count}
              className="h-2.5 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
            >
              <div
                className="h-full rounded-full"
                style={{
                  width: `${(row.count / maximum) * 100}%`,
                  backgroundColor: row.color,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function CompletionBar({
  project,
}: {
  project: { id: number; name: string; color: string; task_count: number; done_count: number };
}) {
  const completion =
    project.task_count === 0
      ? 0
      : Math.round((project.done_count / project.task_count) * 100);

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <Link
          className="truncate font-medium text-slate-800 hover:text-indigo-700"
          href={`/projects/${project.id}`}
        >
          {project.name}
        </Link>
        <span className="shrink-0 text-sm tabular-nums text-slate-600">
          {completion}%
        </span>
      </div>
      <div
        aria-label={`${project.name}: ${completion}% complete`}
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={completion}
        className="h-2 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${completion}%`, backgroundColor: project.color }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-500">
        {project.done_count} of {project.task_count} tasks complete
      </p>
    </li>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-2 text-3xl font-bold tabular-nums text-slate-950">
        {value}
      </p>
    </div>
  );
}

function OverdueTasks({ tasks }: { tasks: OverallStats["overdue_tasks"] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-semibold text-slate-950">Overdue tasks</h2>
        <span className="text-sm tabular-nums text-slate-500">
          {tasks.length}
        </span>
      </div>
      {tasks.length === 0 ? (
        <p className="rounded-xl bg-emerald-50 px-4 py-5 text-sm text-emerald-800">
          No overdue tasks. You&apos;re all caught up.
        </p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {tasks.map((task) => (
            <li
              className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              key={task.id}
            >
              <div>
                <p className="font-medium text-slate-900">{task.title}</p>
                <Link
                  className="text-sm text-indigo-700 hover:text-indigo-900"
                  href={`/projects/${task.project_id}`}
                >
                  {task.project_name}
                </Link>
              </div>
              <time
                className="text-sm font-medium text-red-700"
                dateTime={task.due_date}
              >
                Due {task.due_date}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function StatsPage() {
  const user = await requireUser();
  const [stats, projects] = await Promise.all([
    getOverallStats(user.id),
    getProjectStats(user.id),
  ]);
  const completion =
    stats.total_tasks === 0
      ? 0
      : Math.round((stats.done_count / stats.total_tasks) * 100);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-12 sm:px-10">
      <Link
        className="text-sm font-medium text-indigo-700 hover:text-indigo-900"
        href="/"
      >
        &larr; All projects
      </Link>
      <header className="my-8">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
          Workspace
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-950">
          Statistics
        </h1>
        <p className="mt-3 text-slate-600">
          A snapshot of work across all projects.
        </p>
      </header>

      <section
        aria-label="Overall totals"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard label="Projects" value={stats.total_projects} />
        <StatCard label="Tasks" value={stats.total_tasks} />
        <StatCard label="Completed" value={stats.done_count} />
        <StatCard label="Completion %" value={completion} />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <BarChart
          title="Tasks by status"
          rows={[
            { label: "To do", count: stats.todo_count, color: "#64748b" },
            { label: "Doing", count: stats.doing_count, color: "#f59e0b" },
            { label: "Done", count: stats.done_count, color: "#22c55e" },
          ]}
        />
        <BarChart
          title="Tasks by priority"
          rows={[
            { label: "Low", count: stats.low_count, color: "#64748b" },
            { label: "Medium", count: stats.medium_count, color: "#f59e0b" },
            { label: "High", count: stats.high_count, color: "#f43f5e" },
          ]}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-lg font-semibold text-slate-950">
            Completion by project
          </h2>
          {projects.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-8 text-sm text-slate-600">
              Create a project to see completion statistics.
            </p>
          ) : (
            <ul className="space-y-3">
              {projects.map((project) => (
                <CompletionBar key={project.id} project={project} />
              ))}
            </ul>
          )}
        </section>
        <OverdueTasks tasks={stats.overdue_tasks} />
      </div>
    </main>
  );
}
