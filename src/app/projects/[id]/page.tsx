import Link from "next/link";
import { notFound } from "next/navigation";
import DeleteProjectButton from "@/app/projects/DeleteProjectButton";
import TaskControls from "@/app/projects/TaskControls";
import TaskForm from "@/app/projects/TaskForm";
import { getProject, getTasks } from "@/lib/queries";
import { IdInput } from "@/lib/validation";

export const dynamic = "force-dynamic";

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const parsedId = IdInput.safeParse(id);
  if (!parsedId.success) notFound();

  const projectId = parsedId.data;
  const [project, tasks] = await Promise.all([
    getProject(projectId),
    getTasks(projectId),
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

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <section aria-labelledby="tasks-heading">
          <div className="mb-4 flex items-baseline justify-between gap-4">
            <h2
              className="text-xl font-semibold text-slate-950"
              id="tasks-heading"
            >
              Tasks
            </h2>
            <p className="text-sm text-slate-600">
              {project.done_count} of {project.task_count} complete
            </p>
          </div>

          {tasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
              <p className="text-sm text-slate-600">
                No tasks yet. Add one using the form.
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {tasks.map((task) => (
                <li
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  key={task.id}
                >
                  <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-950">
                        {task.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {task.priority[0].toUpperCase() +
                          task.priority.slice(1)}{" "}
                        priority
                        {task.due_date ? ` · Due ${task.due_date}` : ""}
                      </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium capitalize text-slate-700">
                      {task.status === "doing" ? "In progress" : task.status}
                    </span>
                  </div>
                  <TaskControls task={task} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside>
          <TaskForm projectId={project.id} />
        </aside>
      </div>
    </main>
  );
}
