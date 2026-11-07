import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteProjectButton from "@/app/projects/DeleteProjectButton";
import KanbanBoard from "@/app/projects/KanbanBoard";
import TaskForm from "@/app/projects/TaskForm";
import { getProject, getTasks } from "@/lib/queries";
import { IdInput, TaskPrioritySchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

type SearchParams = {
  priority?: string | string[];
  q?: string | string[];
};

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const parsedId = IdInput.safeParse(id);
  if (!parsedId.success) notFound();

  const projectId = parsedId.data;
  const rawPriority = firstValue(query.priority);
  const parsedPriority = TaskPrioritySchema.safeParse(rawPriority);
  const rawSearch = firstValue(query.q)?.trim();
  const search = rawSearch ? rawSearch.slice(0, 100) : undefined;
  const filters = {
    ...(parsedPriority.success ? { priority: parsedPriority.data } : {}),
    ...(search ? { q: search } : {}),
  };
  const [project, tasks] = await Promise.all([
    getProject(projectId),
    getTasks(projectId, filters),
  ]);

  if (!project) notFound();

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-12 sm:px-10">
      <Link
        className="text-sm font-medium text-indigo-700 hover:text-indigo-900"
        href="/"
      >
        &larr; All projects
      </Link>

      <header className="my-8 flex flex-wrap items-start justify-between gap-5">
        <div className="flex items-start gap-4">
          <div
            aria-hidden="true"
            className="mt-1 h-12 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: project.color }}
          />
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              {project.name}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              {project.description || "No description provided."}
            </p>
          </div>
        </div>
        <DeleteProjectButton projectId={project.id} />
      </header>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-5">
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Task board</h2>
          <p className="mt-1 text-sm text-slate-600">
            {project.done_count} of {project.task_count} tasks complete
          </p>
        </div>
        <form
          action={`/projects/${project.id}`}
          className="flex flex-wrap items-end gap-3"
          method="get"
        >
          <label className="text-sm font-medium text-slate-700">
            Search tasks
            <input
              className="mt-1 block rounded-lg border border-slate-300 bg-white px-3 py-2"
              defaultValue={search}
              maxLength={100}
              name="q"
              placeholder="e.g. design"
              type="search"
            />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Priority
            <select
              className="mt-1 block rounded-lg border border-slate-300 bg-white px-3 py-2"
              defaultValue={parsedPriority.success ? parsedPriority.data : ""}
              name="priority"
            >
              <option value="">All priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <button
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            type="submit"
          >
            Filter
          </button>
          {(search || parsedPriority.success) && (
            <Link
              className="rounded-lg px-2 py-2 text-sm font-medium text-indigo-700 hover:text-indigo-900"
              href={`/projects/${project.id}`}
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      {tasks.length === 0 && (search || parsedPriority.success) && (
        <p className="mb-5 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          No tasks match these filters. Try changing or clearing them.
        </p>
      )}

      <KanbanBoard projectId={project.id} tasks={tasks} />

      <section className="mt-10 max-w-2xl" aria-label="Create a task">
        <TaskForm projectId={project.id} />
      </section>
    </main>
  );
}
