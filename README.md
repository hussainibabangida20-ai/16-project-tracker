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
- **Auth.js** provides GitHub OAuth and JWT sessions. `requireUser()` protects database-backed pages and actions; all project and task operations check `projects.owner_id`.
- **Server Actions** in `src/app/actions.ts` validate writes, issue parameterized SQL statements, enforce ownership, and revalidate affected routes.
- Client forms use `useActionState`; Kanban status changes use `useOptimistic`. Client-provided project and task IDs are validated, and task mutations scope SQL by both IDs.

## Setup

1. Install Node.js 20 or newer.
2. Create a Neon project and database in the [Neon Console](https://console.neon.tech/), then copy its connection string.
3. Create separate GitHub OAuth Apps for local development and production. Set their callback URLs to `http://localhost:3000/api/auth/callback/github` and `https://<your-domain>/api/auth/callback/github`, respectively.
4. Copy `.env.example` to `.env.local` and set `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GITHUB_ID`, and `AUTH_GITHUB_SECRET`. Generate `AUTH_SECRET` with `npx auth secret`. Keep `.env.local` private; it is ignored by Git.
5. Apply `schema.sql`, then `db/migrations/002_task_comments.sql`, to your Neon database using the Neon SQL Editor or `psql`. Existing projects remain unowned and inaccessible; new projects created after sign-in are assigned to their owner.
6. Install dependencies and start the development server:

   ```sh
   npm install
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) and sign in with GitHub.

## Validation and production

```sh
npm run lint
npm run typecheck
npm run build
npm start
```

Set `DATABASE_URL`, `AUTH_SECRET`, `AUTH_GITHUB_ID`, and `AUTH_GITHUB_SECRET` in the Vercel deployment environment before deploying. Set the GitHub OAuth App callback to `https://<your-domain>/api/auth/callback/github`.
For Vercel Preview sign-in, set `AUTH_REDIRECT_PROXY_URL` in the Preview
environment to `https://<production-domain>/api/auth` and use the same
`AUTH_SECRET`; keep the GitHub OAuth callback URL set to the production
`/api/auth/callback/github` endpoint.
`next.config.ts` applies security headers to all routes, including a content
security policy. Inline scripts and styles are permitted for Next.js rendering
and the app's color styling; avoid adding third-party scripts without updating
that policy.

## Schema overview

- **projects**: serial ID, required name, description, hex color, and creation timestamp.
- **tasks**: serial ID, cascading project foreign key, title, status (`todo`, `doing`, or `done`), priority (`low`, `medium`, or `high`), optional due date, and creation timestamp.
- **projects.owner_id** stores the GitHub user ID. Legacy projects remain unowned after the migration and are not visible to signed-in users.
- **task_comments** stores comments with a cascading task foreign key, author ID, body, and creation timestamp.
- An index on `tasks.project_id` supports project task lookups.
