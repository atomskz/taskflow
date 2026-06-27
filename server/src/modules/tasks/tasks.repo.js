// Data-access layer for tasks. All queries are scoped by user_id so a user can
// only ever touch their own rows (enforced again above this in the service).
import { db } from '../../db/index.js';
import { newId, nowIso } from '../../utils/ids.js';
import { rowToTask } from './tasks.mapper.js';

export function listByUser(userId) {
  const rows = db
    .prepare(
      'SELECT * FROM tasks WHERE user_id = ? AND deleted_at IS NULL ORDER BY created_at DESC'
    )
    .all(userId);
  return rows.map(rowToTask);
}

export function findByIdForUser(id, userId) {
  const row = db
    .prepare('SELECT * FROM tasks WHERE id = ? AND user_id = ? AND deleted_at IS NULL')
    .get(id, userId);
  return rowToTask(row);
}

// ORDER BY clauses keyed by the sort option. Priority uses an explicit rank so
// 'critical' > 'high' > 'medium' > 'low'; due_asc puts tasks without a date last.
const SORT_SQL = {
  created_desc: 'created_at DESC',
  created_asc: 'created_at ASC',
  due_asc: 'due_date IS NULL, due_date ASC',
  priority_desc:
    "CASE priority WHEN 'critical' THEN 4 WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END DESC",
  title_asc: 'title COLLATE NOCASE ASC',
};

// Build the shared WHERE clause + bound params from a normalized filter object.
// `today` is the caller's local date ('YYYY-MM-DD') so overdue/today match what
// the user sees regardless of server timezone.
function buildWhere(userId, f) {
  const where = ['user_id = ?', 'deleted_at IS NULL'];
  const params = [userId];

  if (f.status === 'all') {
    where.push("status != 'archived'");
    if (!f.includeCompleted) where.push("status != 'done'");
  } else {
    where.push('status = ?');
    params.push(f.status);
  }
  if (f.priority !== 'all') {
    where.push('priority = ?');
    params.push(f.priority);
  }
  if (f.onlyOverdue) {
    where.push("due_date IS NOT NULL AND due_date < ? AND status NOT IN ('done','archived')");
    params.push(f.today);
  }
  if (f.onlyToday) {
    where.push('(calendar_date = ? OR due_date = ?)');
    params.push(f.today, f.today);
  }
  if (f.search) {
    // Substring match over title/description/tags (tags are stored as JSON text).
    where.push('(title LIKE ? OR description LIKE ? OR tags LIKE ?)');
    const like = `%${f.search}%`;
    params.push(like, like, like);
  }
  return { clause: where.join(' AND '), params };
}

// Filtered + sorted + paginated query. Returns the page plus the total count of
// all matching rows (for pagination UI). All inputs are bound parameters.
export function query(userId, f) {
  const { clause, params } = buildWhere(userId, f);
  const order = SORT_SQL[f.sort] || SORT_SQL.created_desc;

  const total = db.prepare(`SELECT COUNT(*) AS n FROM tasks WHERE ${clause}`).get(...params).n;

  const rows = db
    .prepare(`SELECT * FROM tasks WHERE ${clause} ORDER BY ${order} LIMIT ? OFFSET ?`)
    .all(...params, f.limit, f.offset);

  return { tasks: rows.map(rowToTask), total };
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
