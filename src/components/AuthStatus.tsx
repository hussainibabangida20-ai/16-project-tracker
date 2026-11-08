import Link from "next/link";
import { auth, signOut } from "@/auth";

export default async function AuthStatus() {
  const session = await auth();

  if (!session?.user) {
    return (
      <Link
        className="rounded-lg bg-indigo-700 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-800"
        href="/login"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="truncate text-sm text-slate-600">
        {session.user.name ?? "Signed in"}
      </span>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <button
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          type="submit"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
