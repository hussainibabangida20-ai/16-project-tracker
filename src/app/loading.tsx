export default function Loading() {
  return (
    <main
      aria-label="Loading projects"
      className="mx-auto min-h-screen max-w-6xl animate-pulse px-6 py-12 sm:px-10"
    >
      <div className="mb-10 space-y-3">
        <div className="h-4 w-28 rounded bg-slate-200" />
        <div className="h-10 w-64 rounded bg-slate-200" />
        <div className="h-5 max-w-lg rounded bg-slate-200" />
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-56 rounded-2xl border border-slate-200 bg-white"
          />
        ))}
      </div>
    </main>
  );
}
