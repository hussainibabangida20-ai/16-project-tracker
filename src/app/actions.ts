"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import {
  DeleteProjectInput,
  DeleteTaskInput,
  ProjectInput,
  TaskInput,
  UpdateTaskStatusInput,
} from "@/lib/validation";

export interface ActionState {
  ok: boolean;
  errors: Record<string, string[]>;
  message?: string;
}

const initialActionState: ActionState = { ok: false, errors: {} };

function validationFailure(error: {
  issues: Array<{ path: PropertyKey[]; message: string }>;
}): ActionState {
  const errors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const field = issue.path[0];
    const key = typeof field === "string" ? field : "_form";
    (errors[key] ??= []).push(issue.message);
  }

  return { ok: false, errors };
}

function invalidProject(): ActionState {
  return { ok: false, errors: { projectId: ["Project not found."] } };
}

export async function createProject(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = ProjectInput.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    color: formData.get("color"),
  });

  if (!parsed.success) return validationFailure(parsed.error);

  await sql`
    INSERT INTO projects (name, description, color)
    VALUES (${parsed.data.name}, ${parsed.data.description}, ${parsed.data.color})
  `;
  revalidatePath("/");

  return { ...initialActionState, ok: true, message: "Project created." };
}

export async function createTask(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = TaskInput.safeParse({
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    status: formData.get("status"),
    priority: formData.get("priority"),
    due_date: formData.get("due_date") ?? "",
  });

  if (!parsed.success) return validationFailure(parsed.error);

  const { projectId, title, status, priority, due_date } = parsed.data;
  const inserted = await sql`
    INSERT INTO tasks (project_id, title, status, priority, due_date)
    SELECT p.id, ${title}, ${status}, ${priority}, ${due_date ?? null}::date
    FROM projects AS p
    WHERE p.id = ${projectId}
    RETURNING id
  `;

  if (inserted.length === 0) return invalidProject();

  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);

  return { ...initialActionState, ok: true, message: "Task created." };
}

export async function updateTaskStatus(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = UpdateTaskStatusInput.safeParse({
    projectId: formData.get("projectId"),
    taskId: formData.get("taskId"),
    status: formData.get("status"),
  });

  if (!parsed.success) return validationFailure(parsed.error);

  const { projectId, taskId, status } = parsed.data;
  const updated = await sql`
    UPDATE tasks
    SET status = ${status}
    WHERE id = ${taskId} AND project_id = ${projectId}
    RETURNING id
  `;

  if (updated.length === 0) {
    return { ok: false, errors: { taskId: ["Task not found in this project."] } };
  }

  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);

  return { ...initialActionState, ok: true, message: "Task status updated." };
}

export async function deleteTask(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = DeleteTaskInput.safeParse({
    projectId: formData.get("projectId"),
    taskId: formData.get("taskId"),
  });

  if (!parsed.success) return validationFailure(parsed.error);

  const { projectId, taskId } = parsed.data;
  const deleted = await sql`
    DELETE FROM tasks
    WHERE id = ${taskId} AND project_id = ${projectId}
    RETURNING id
  `;

  if (deleted.length === 0) {
    return { ok: false, errors: { taskId: ["Task not found in this project."] } };
  }

  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);

  return { ...initialActionState, ok: true, message: "Task deleted." };
}

export async function deleteProject(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = DeleteProjectInput.safeParse({
    projectId: formData.get("projectId"),
  });

  if (!parsed.success) return validationFailure(parsed.error);

  const { projectId } = parsed.data;
  const deleted = await sql`
    DELETE FROM projects
    WHERE id = ${projectId}
    RETURNING id
  `;

  if (deleted.length === 0) return invalidProject();

  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);

  return { ...initialActionState, ok: true, message: "Project deleted." };
}
