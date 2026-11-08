import { z } from "zod";

export const TaskStatusSchema = z.enum(["todo", "doing", "done"]);
export const TaskPrioritySchema = z.enum(["low", "medium", "high"]);

export const IdInput = z
  .string()
  .regex(/^[1-9]\d*$/, "Choose a valid ID.")
  .transform(Number)
  .pipe(z.number().int().positive().max(Number.MAX_SAFE_INTEGER));

export const ProjectInput = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(1000),
  color: z.string().regex(/^#[\da-fA-F]{6}$/, "Choose a valid hex color."),
});

const DueDateInput = z.preprocess(
  (value) => (value === "" ? undefined : value),
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a date in YYYY-MM-DD format.")
    .refine((value) => {
      const date = new Date(`${value}T00:00:00.000Z`);
      return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
      );
    }, "Enter a valid calendar date.")
    .optional(),
);

export const TaskInput = z.object({
  projectId: IdInput,
  title: z.string().trim().min(2).max(140),
  status: TaskStatusSchema,
  priority: TaskPrioritySchema,
  due_date: DueDateInput,
});

export const UpdateTaskStatusInput = z.object({
  projectId: IdInput,
  taskId: IdInput,
  status: TaskStatusSchema,
});

export const DeleteTaskInput = z.object({
  projectId: IdInput,
  taskId: IdInput,
});

export const DeleteProjectInput = z.object({
  projectId: IdInput,
});

export const TaskCommentInput = z.object({
  projectId: IdInput,
  taskId: IdInput,
  body: z.string().trim().min(1).max(2000),
});

export type TaskStatus = z.infer<typeof TaskStatusSchema>;
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;
