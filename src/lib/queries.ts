import "server-only";

import { sql } from "@/lib/db";

export type TaskStatus = "todo" | "doing" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface ProjectSummary {
  id: number;
  name: string;
  description: string;
  color: string;
  created_at: string;
  task_count: number;
  done_count: number;
}

export interface Task {
  id: number;
  project_id: number;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  created_at: string;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
}

export async function getProjects(): Promise<ProjectSummary[]> {
  return (await sql`
    SELECT
      p.id,
      p.name,
      p.description,
      p.color,
      p.created_at::text AS created_at,
      COUNT(t.id)::int AS task_count,
      COUNT(t.id) FILTER (WHERE t.status = 'done')::int AS done_count
    FROM projects AS p
    LEFT JOIN tasks AS t ON t.project_id = p.id
    GROUP BY p.id
    ORDER BY p.created_at DESC, p.id DESC
  `) as ProjectSummary[];
}

export async function getProject(id: number): Promise<ProjectSummary | null> {
  const rows = (await sql`
    SELECT
      p.id,
      p.name,
      p.description,
      p.color,
      p.created_at::text AS created_at,
      COUNT(t.id)::int AS task_count,
      COUNT(t.id) FILTER (WHERE t.status = 'done')::int AS done_count
    FROM projects AS p
    LEFT JOIN tasks AS t ON t.project_id = p.id
    WHERE p.id = ${id}
    GROUP BY p.id
    LIMIT 1
  `) as ProjectSummary[];

  return rows[0] ?? null;
}

export async function getTasks(
  projectId: number,
  filters: TaskFilters = {},
): Promise<Task[]> {
  const status = filters.status ?? null;
  const priority = filters.priority ?? null;

  return (await sql`
    SELECT
      t.id,
      t.project_id,
      t.title,
      t.status,
      t.priority,
      t.due_date::text AS due_date,
      t.created_at::text AS created_at
    FROM tasks AS t
    WHERE t.project_id = ${projectId}
      AND (${status}::text IS NULL OR t.status = ${status})
      AND (${priority}::text IS NULL OR t.priority = ${priority})
    ORDER BY t.created_at DESC, t.id DESC
  `) as Task[];
}
