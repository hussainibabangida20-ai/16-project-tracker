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
  is_overdue: boolean;
  created_at: string;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  q?: string;
}

export interface OverdueTask {
  id: number;
  title: string;
  project_id: number;
  project_name: string;
  due_date: string;
  priority: TaskPriority;
}

export interface OverallStats {
  total_tasks: number;
  total_projects: number;
  todo_count: number;
  doing_count: number;
  done_count: number;
  low_count: number;
  medium_count: number;
  high_count: number;
  overdue_tasks: OverdueTask[];
}

export interface ProjectStats {
  id: number;
  name: string;
  color: string;
  task_count: number;
  done_count: number;
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

export async function getOverallStats(): Promise<OverallStats> {
  const rows = (await sql`
    SELECT
      (SELECT COUNT(*)::int FROM tasks) AS total_tasks,
      (SELECT COUNT(*)::int FROM projects) AS total_projects,
      COUNT(*) FILTER (WHERE status = 'todo')::int AS todo_count,
      COUNT(*) FILTER (WHERE status = 'doing')::int AS doing_count,
      COUNT(*) FILTER (WHERE status = 'done')::int AS done_count,
      COUNT(*) FILTER (WHERE priority = 'low')::int AS low_count,
      COUNT(*) FILTER (WHERE priority = 'medium')::int AS medium_count,
      COUNT(*) FILTER (WHERE priority = 'high')::int AS high_count,
      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'id', t.id,
              'title', t.title,
              'project_id', p.id,
              'project_name', p.name,
              'due_date', t.due_date::text,
              'priority', t.priority
            )
            ORDER BY t.due_date ASC, t.id ASC
          )
          FROM tasks AS t
          JOIN projects AS p ON p.id = t.project_id
          WHERE t.due_date < CURRENT_DATE AND t.status <> 'done'
        ),
        '[]'::json
      ) AS overdue_tasks
    FROM tasks
  `) as OverallStats[];

  return rows[0];
}

export async function getProjectStats(): Promise<ProjectStats[]> {
  return (await sql`
    SELECT
      p.id,
      p.name,
      p.color,
      COUNT(t.id)::int AS task_count,
      COUNT(t.id) FILTER (WHERE t.status = 'done')::int AS done_count
    FROM projects AS p
    LEFT JOIN tasks AS t ON t.project_id = p.id
    GROUP BY p.id
    ORDER BY p.name ASC, p.id ASC
  `) as ProjectStats[];
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
  const search = filters.q ? `%${filters.q}%` : null;

  return (await sql`
    SELECT
      t.id,
      t.project_id,
      t.title,
      t.status,
      t.priority,
      t.due_date::text AS due_date,
      (t.due_date < CURRENT_DATE) AS is_overdue,
      t.created_at::text AS created_at
    FROM tasks AS t
    WHERE t.project_id = ${projectId}
      AND (${status}::text IS NULL OR t.status = ${status})
      AND (${priority}::text IS NULL OR t.priority = ${priority})
      AND (${search}::text IS NULL OR t.title ILIKE ${search})
    ORDER BY t.created_at DESC, t.id DESC
  `) as Task[];
}
