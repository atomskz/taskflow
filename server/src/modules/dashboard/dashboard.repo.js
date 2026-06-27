// SQL aggregations for the dashboard. Every query is scoped to the user and
// excludes soft-deleted tasks. Date-only fields (due_date, calendar_date) and
// the date prefix of timestamps are compared as 'YYYY-MM-DD' strings.
import { db } from '../../db/index.js';
import { rowToTask } from '../tasks/tasks.mapper.js';

const SCOPE = 'user_id = ? AND deleted_at IS NULL';

// Single scalar count with an extra predicate.
function count(userId, predicate, params = []) {
  return db
    .prepare(`SELECT COUNT(*) AS n FROM tasks WHERE ${SCOPE} AND (${predicate})`)
    .get(userId, ...params).n;
}

export function counts(userId, { today, weekStart, weekEnd }) {
  const week = ['substr(completed_at,1,10) >= ? AND substr(completed_at,1,10) < ?', [weekStart, weekEnd]];
  return {
    active: count(userId, "status IN ('todo','in_progress')"),
    inProgress: count(userId, "status = 'in_progress'"),
    today: count(userId, "(calendar_date = ? OR due_date = ?) AND status != 'archived'", [today, today]),
    overdue: count(
      userId,
      "due_date IS NOT NULL AND due_date < ? AND status NOT IN ('done','archived')",
      [today]
    ),
    doneWeek: count(userId, `status = 'done' AND completed_at IS NOT NULL AND ${week[0]}`, week[1]),
    high: count(userId, "status IN ('todo','in_progress') AND priority IN ('high','critical')"),
    createdWeek: count(userId, 'substr(created_at,1,10) >= ? AND substr(created_at,1,10) < ?', [weekStart, weekEnd]),
    total: count(userId, '1 = 1'),
  };
}

// status -> count and priority -> count maps (only present keys).
export function distribution(userId, column) {
  const rows = db
    .prepare(`SELECT ${column} AS k, COUNT(*) AS n FROM tasks WHERE ${SCOPE} GROUP BY ${column}`)
    .all(userId);
  return Object.fromEntries(rows.map((r) => [r.k, r.n]));
}

// Completed-per-day within the week window, keyed by 'YYYY-MM-DD'.
export function completedByDay(userId, weekStart, weekEnd) {
  const rows = db
    .prepare(
      `SELECT substr(completed_at,1,10) AS d, COUNT(*) AS n FROM tasks
       WHERE ${SCOPE} AND status = 'done' AND completed_at IS NOT NULL
         AND substr(completed_at,1,10) >= ? AND substr(completed_at,1,10) < ?
       GROUP BY d`
    )
    .all(userId, weekStart, weekEnd);
  return Object.fromEntries(rows.map((r) => [r.d, r.n]));
}

const PRIORITY_RANK =
  "CASE priority WHEN 'critical' THEN 4 WHEN 'high' THEN 3 WHEN 'medium' THEN 2 ELSE 1 END DESC";

export function overdueList(userId, today, limit) {
  return db
    .prepare(
      `SELECT * FROM tasks WHERE ${SCOPE}
         AND due_date IS NOT NULL AND due_date < ? AND status NOT IN ('done','archived')
       ORDER BY due_date ASC LIMIT ?`
    )
    .all(userId, today, limit)
    .map(rowToTask);
}

export function upcomingList(userId, today, until, limit) {
  return db
    .prepare(
      `SELECT * FROM tasks WHERE ${SCOPE}
         AND status IN ('todo','in_progress')
         AND COALESCE(calendar_date, due_date) IS NOT NULL
         AND COALESCE(calendar_date, due_date) >= ? AND COALESCE(calendar_date, due_date) <= ?
       ORDER BY COALESCE(calendar_date, due_date) ASC, ${PRIORITY_RANK} LIMIT ?`
    )
    .all(userId, today, until, limit)
    .map(rowToTask);
}

export function currentList(userId, limit) {
  return db
    .prepare(
      `SELECT * FROM tasks WHERE ${SCOPE} AND status IN ('todo','in_progress')
       ORDER BY ${PRIORITY_RANK} LIMIT ?`
    )
    .all(userId, limit)
    .map(rowToTask);
}
