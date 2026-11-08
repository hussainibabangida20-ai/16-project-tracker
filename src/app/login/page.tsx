import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-lg items-center justify-center px-6 py-12">
      <section className="w-full rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950">
          Sign in to Project Tracker
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Sign in with GitHub to access your projects and task comments.
        </p>
        <form
          action={async () => {
            "use server";
            await signIn("github", { redirectTo: "/" });
          }}
        >
          <button
            className="mt-6 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
            type="submit"
          >
            Continue with GitHub
          </button>
        </form>
      </section>
    </main>
  );
}
