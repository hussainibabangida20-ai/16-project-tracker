import "server-only";

import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function requireUser(): Promise<{ id: string }> {
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) redirect("/login");

  return { id: userId };
}
