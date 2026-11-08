BEGIN;

ALTER TABLE projects
  ADD COLUMN owner_id text;

CREATE INDEX projects_owner_idx ON projects(owner_id);

CREATE TABLE task_comments (
  id serial PRIMARY KEY,
  task_id integer NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author_id text NOT NULL,
  body text NOT NULL CHECK (char_length(btrim(body)) BETWEEN 1 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX task_comments_task_created_idx
  ON task_comments(task_id, created_at, id);

COMMIT;
