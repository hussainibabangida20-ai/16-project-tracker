# Project Tracker

A project and task tracker built with Next.js 15, the App Router, TypeScript, Tailwind CSS, Zod, and Neon Postgres.

## Features

- Create and delete projects, with color, description, and task progress.
- Project Kanban boards with To do, Doing, and Done columns.
- Create, move, and delete tasks; moves update optimistically.
- Filter tasks by priority and search titles from the project URL.
- View aggregate workspace statistics, project completion, and overdue tasks.
- Validate form input with Zod and use parameterized SQL for database operations.

## Stack

- Next.js 15 App Router and React Server Components
- TypeScript and Tailwind CSS 4
- Neon Postgres through `@neondatabase/serverless`
- Zod for server-side input validation

## Architecture

- **Server Components** render the home page, project pages, and statistics page.
- **`src/lib/queries.ts`** contains server-only reads and SQL aggregate queries.
- **`src/lib/db.ts`** initializes the Neon SQL client from `DATABASE_URL` and is marked `server-only`.
- **Server Actions** in `src/app/actions.ts` validate writes, issue parameterized INSERT/UPDATE/DELETE statements, and revalidate affected routes.
- Client forms use `useActionState`; Kanban status changes use `useOptimistic`. Client-provided project and task IDs are validated, and task mutations scope SQL by both IDs.

## Setup

1. Install Node.js 20 or newer.
2. Create a Neon project and database in the [Neon Console](https://console.neon.tech/), then copy its connection string.
3. Copy `.env.example` to `.env.local` and set `DATABASE_URL` to your Neon connection string. Keep `.env.local` private; it is ignored by Git.
4. Apply `schema.sql` to your Neon database using the Neon SQL Editor or `psql`. This creates the tables and example records.
5. Install dependencies and start the development server:

   ```sh
   npm install
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000).

## Validation and production

```sh
npm run lint
npm run typecheck
npm run build
npm start
```

Set `DATABASE_URL` in the deployment environment before deploying.

## Schema overview

- **projects**: serial ID, required name, description, hex color, and creation timestamp.
- **tasks**: serial ID, cascading project foreign key, title, status (`todo`, `doing`, or `done`), priority (`low`, `medium`, or `high`), optional due date, and creation timestamp.
- An index on `tasks.project_id` supports project task lookups.
