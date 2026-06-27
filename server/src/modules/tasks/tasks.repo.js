// Data-access layer for tasks. All queries are scoped by user_id so a user can
// only ever touch their own rows (enforced again above this in the service).
import { db } from '../../db/index.js';
import { newId, nowIso } from '../../utils/ids.js';
import { rowToTask } from './tasks.mapper.js';

export function listByUser(userId) {
  const rows = db
    .prepare('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC')
    .all(userId);
  return rows.map(rowToTask);
}

export function findByIdForUser(id, userId) {
  const row = db.prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ?').get(id, userId);
  return rowToTask(row);
}

export function insert(userId, data) {
  const id = newId();
  const ts = nowIso();
  // Seed data may carry explicit timestamps; normal creates default to now.
  const createdAt = data.createdAt ?? ts;
  const updatedAt = data.updatedAt ?? ts;
  db.prepare(
    `INSERT INTO tasks
       (id, user_id, title, description, status, priority, due_date, calendar_date,
        start_time, end_time, tags, completed_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    id,
    userId,
    data.title,
    data.description ?? '',
    data.status,
    data.priority,
    data.dueDate ?? null,
    data.calendarDate ?? null,
    data.startTime ?? null,
    data.endTime ?? null,
    JSON.stringify(data.tags ?? []),
    data.completedAt ?? null,
    createdAt,
    updatedAt
  );
  return findByIdForUser(id, userId);
}

// Patch only the provided columns. `fields` is a map of db-column -> value.
export function update(id, userId, fields) {
  const cols = Object.keys(fields);
  if (cols.length === 0) return findByIdForUser(id, userId);
  const setClause = cols.map((c) => `${c} = ?`).join(', ');
  const values = cols.map((c) => fields[c]);
  db.prepare(`UPDATE tasks SET ${setClause}, updated_at = ? WHERE id = ? AND user_id = ?`).run(
    ...values,
    nowIso(),
    id,
    userId
  );
  return findByIdForUser(id, userId);
}

export function remove(id, userId) {
  const info = db.prepare('DELETE FROM tasks WHERE id = ? AND user_id = ?').run(id, userId);
  return info.changes > 0;
}

export function deleteAllForUser(userId) {
  db.prepare('DELETE FROM tasks WHERE user_id = ?').run(userId);
}

// Bulk insert used by the demo-reset endpoint and the seed script.
// node:sqlite has no transaction() helper, so we manage BEGIN/COMMIT manually.
export function bulkInsert(userId, tasks) {
  db.exec('BEGIN');
  try {
    for (const t of tasks) insert(userId, t);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }
}
