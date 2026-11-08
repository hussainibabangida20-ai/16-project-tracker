import Link from "next/link";
import { getProjects } from "@/lib/queries";
import ProjectForm from "@/app/projects/ProjectForm";
import { requireUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await requireUser();
  const projects = await getProjects(user.id);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-12 sm:px-10">
      <header className="mb-10">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600">
          Workspace
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-slate-950">
          Project tracker
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
          Keep an eye on your projects and see how much work is complete.
        </p>
        <Link
          className="mt-4 inline-flex rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          href="/stats"
        >
          View statistics
        </Link>
      </header>

      <div className="mb-10">
        <ProjectForm />
      </div>

      {projects.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            No projects yet
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Create a project above to get started.
          </p>
        </section>
      ) : (
        <section
          aria-label="Projects"
          className="grid gap-5 md:grid-cols-2 lg:grid-cols-3"
        >
          {projects.map((project) => {
            const progress =
              project.task_count === 0
                ? 0
                : Math.round(
                    (project.done_count / project.task_count) * 100,
                  );

            return (
              <article
                key={project.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div
                  aria-hidden="true"
                  className="h-1.5"
                  style={{ backgroundColor: project.color }}
                />
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-slate-950">
                    <Link
                      className="rounded-sm hover:text-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      href={`/projects/${project.id}`}
                    >
                      {project.name}
                    </Link>
                  </h2>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-slate-600">
                    {project.description || "No description provided."}
                  </p>

                  <div className="mt-7">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-slate-700">
                        Progress
                      </span>
                      <span className="tabular-nums text-slate-600">
                        {project.done_count}/{project.task_count} tasks
                      </span>
                    </div>
                    <div
                      aria-label={`${progress}% complete`}
                      aria-valuemax={100}
                      aria-valuemin={0}
                      aria-valuenow={progress}
                      className="h-2 overflow-hidden rounded-full bg-slate-100"
                      role="progressbar"
                    >
                      <div
                        className="h-full rounded-full transition-[width]"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: project.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </main>
  );
}
