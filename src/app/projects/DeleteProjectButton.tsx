"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteProject, type ActionState } from "@/app/actions";

const initialState: ActionState = { ok: false, errors: {} };

export default function DeleteProjectButton({
  projectId,
}: {
  projectId: number;
}) {
  const [state, formAction, pending] = useActionState(
    deleteProject,
    initialState,
  );
  const router = useRouter();
  const errorMessage =
    state.errors.projectId?.[0] ?? state.errors._form?.[0];

  useEffect(() => {
    if (state.ok) router.push("/");
  }, [router, state]);

  return (
    <form action={formAction}>
      <input name="projectId" type="hidden" value={projectId} />
      <button
        className="rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
        disabled={pending}
        type="submit"
      >
        {pending ? "Deleting..." : "Delete project"}
      </button>
      {errorMessage && (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {errorMessage}
        </p>
      )}
    </form>
  );
}
