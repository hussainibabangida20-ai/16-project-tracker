import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-12">
      <section className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-700">
          404
        </p>
        <h1 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          This page may have moved or the project may no longer exist.
        </p>
        <Link
          className="mt-6 inline-flex rounded-lg bg-indigo-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-800"
          href="/"
        >
          Back to projects
        </Link>
      </section>
    </main>
  );
}
