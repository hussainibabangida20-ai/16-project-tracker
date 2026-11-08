# Project Tracker demo script

**Target length:** 3 minutes  
**Demo URL:** The repository does not currently have a verified public demo URL. Run the app locally at `http://localhost:3000` or replace this note with the deployed URL when one is available.

Before presenting, start the app, confirm the database connection, and prepare sample projects and tasks so the walkthrough does not depend on entering setup data.

## 0:00–0:20 — Hook and problem

> When tasks are scattered across notes and spreadsheets, it is hard to see what is in progress, what is overdue, and how much work is complete. I built Project Tracker to bring projects, task status, and progress into one workspace.

## 0:20–2:20 — Live walkthrough

### 0:20–0:45 — Project overview

> This is the workspace. Each card represents a project, with its own color and completion progress. I can create a project with a name, description, and color.

Show the project list and, if time permits, the create-project form.

### 0:45–1:25 — Kanban board

> Opening a project shows its tasks in To do, Doing, and Done columns. Each task can have a priority and due date. I can move a task between columns, and the interface updates optimistically while the server action saves the change.

Move one task across a column.

### 1:25–1:45 — Search and filtering

> I can search task titles and filter by priority. These filters use URL parameters, so the view is easy to revisit or share.

Demonstrate a priority filter or search.

### 1:45–2:20 — Statistics

> The statistics page gives a workspace-level summary: task totals by status and priority, completion by project, and overdue tasks. This makes it easier to spot what needs attention.

Open the statistics page and point out completion and overdue tasks.

## 2:20–2:50 — Technical highlight

> One technical decision I’m proud of is how task updates are handled. The board updates optimistically for a responsive feel, but the mutation still goes through a server action. That action validates submitted values with Zod, uses parameterized SQL, and scopes task changes to both the task ID and project ID. If an update fails, the UI shows an error instead of pretending it succeeded.

## 2:50–3:00 — What’s next

> Next, I want to add authentication and project ownership, then deploy the app and add automated tests. Thanks for taking a look.

## Backup plan if the live demo fails

1. Capture screenshots in advance: dashboard, Kanban board, and statistics page. Add them to the README when ready.
2. Keep a short screen recording of the same walkthrough as a fallback.
3. If the app or database is unavailable, say: “The live environment isn’t responding, so I’ll use a recording or screenshots and explain the same flow.”
4. Be clear that authentication and production deployment are future improvements, not features of the current repository.
