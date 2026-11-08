"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { requireUser } from "@/lib/session";
import {
  DeleteProjectInput,
  DeleteTaskInput,
  ProjectInput,
  TaskCommentInput,
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

function databaseFailure(action: string, message: string): ActionState {
  console.error(`Database action failed: ${action}.`);
  return { ok: false, errors: { _form: [message] } };
}

export async function createProject(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = ProjectInput.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    color: formData.get("color"),
  });

  if (!parsed.success) return validationFailure(parsed.error);

  try {
    await sql`
      INSERT INTO projects (name, description, color, owner_id)
      VALUES (
        ${parsed.data.name},
        ${parsed.data.description},
        ${parsed.data.color},
        ${user.id}
      )
    `;
  } catch {
    return databaseFailure(
      "create project",
      "Could not create the project. Please try again.",
    );
  }
  revalidatePath("/");

  return { ...initialActionState, ok: true, message: "Project created." };
}

export async function createTask(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = TaskInput.safeParse({
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    status: formData.get("status"),
    priority: formData.get("priority"),
    due_date: formData.get("due_date") ?? "",
  });

  if (!parsed.success) return validationFailure(parsed.error);

  const { projectId, title, status, priority, due_date } = parsed.data;
  let inserted;
  try {
    inserted = await sql`
      INSERT INTO tasks (project_id, title, status, priority, due_date)
      SELECT p.id, ${title}, ${status}, ${priority}, ${due_date ?? null}::date
      FROM projects AS p
      WHERE p.id = ${projectId} AND p.owner_id = ${user.id}
      RETURNING id
    `;
  } catch {
    return databaseFailure(
      "create task",
      "Could not add the task. Please try again.",
    );
  }

  if (inserted.length === 0) return invalidProject();

  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);

  return { ...initialActionState, ok: true, message: "Task created." };
}

export async function updateTaskStatus(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = UpdateTaskStatusInput.safeParse({
    projectId: formData.get("projectId"),
    taskId: formData.get("taskId"),
    status: formData.get("status"),
  });

  if (!parsed.success) return validationFailure(parsed.error);

  const { projectId, taskId, status } = parsed.data;
  let updated;
  try {
    updated = await sql`
      UPDATE tasks
      SET status = ${status}
      WHERE id = ${taskId}
        AND project_id = ${projectId}
        AND EXISTS (
          SELECT 1 FROM projects AS p
          WHERE p.id = ${projectId} AND p.owner_id = ${user.id}
        )
      RETURNING id
    `;
  } catch {
    return databaseFailure(
      "update task status",
      "Could not update the task. Please try again.",
    );
  }

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
  const user = await requireUser();
  const parsed = DeleteTaskInput.safeParse({
    projectId: formData.get("projectId"),
    taskId: formData.get("taskId"),
  });

  if (!parsed.success) return validationFailure(parsed.error);

  const { projectId, taskId } = parsed.data;
  let deleted;
  try {
    deleted = await sql`
      DELETE FROM tasks
      WHERE id = ${taskId}
        AND project_id = ${projectId}
        AND EXISTS (
          SELECT 1 FROM projects AS p
          WHERE p.id = ${projectId} AND p.owner_id = ${user.id}
        )
      RETURNING id
    `;
  } catch {
    return databaseFailure(
      "delete task",
      "Could not delete the task. Please try again.",
    );
  }

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
  const user = await requireUser();
  const parsed = DeleteProjectInput.safeParse({
    projectId: formData.get("projectId"),
  });

  if (!parsed.success) return validationFailure(parsed.error);

  const { projectId } = parsed.data;
  let deleted;
  try {
    deleted = await sql`
      DELETE FROM projects
      WHERE id = ${projectId} AND owner_id = ${user.id}
      RETURNING id
    `;
  } catch {
    return databaseFailure(
      "delete project",
      "Could not delete the project. Please try again.",
    );
  }

  if (deleted.length === 0) return invalidProject();

  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);

  return { ...initialActionState, ok: true, message: "Project deleted." };
}

export async function addTaskComment(
  _previousState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();
  const parsed = TaskCommentInput.safeParse({
    projectId: formData.get("projectId"),
    taskId: formData.get("taskId"),
    body: formData.get("body"),
  });

  if (!parsed.success) return validationFailure(parsed.error);

  const { projectId, taskId, body } = parsed.data;
  let inserted: unknown[];
  try {
    inserted = await sql`
      INSERT INTO task_comments (task_id, author_id, body)
      SELECT t.id, ${user.id}, ${body}
      FROM tasks AS t
      JOIN projects AS p ON p.id = t.project_id
      WHERE t.id = ${taskId}
        AND p.id = ${projectId}
        AND p.owner_id = ${user.id}
      RETURNING id
    `;
  } catch {
    return databaseFailure(
      "add task comment",
      "Could not add your comment. Please try again.",
    );
  }

  if (inserted.length === 0) {
    return {
      ok: false,
      errors: { taskId: ["Task not found in this project."] },
    };
  }

  revalidatePath(`/projects/${projectId}`);
  return { ...initialActionState, ok: true, message: "Comment added." };
}
