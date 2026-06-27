// Business logic for tasks. Enforces ownership and the status/completedAt rules
// from the TZ (sections 6.4.5, 12). Translates DTO fields to DB columns.
import * as repo from './tasks.repo.js';
import { notFound } from '../../utils/errors.js';
import { nowIso } from '../../utils/ids.js';
import { buildDemoTasks } from '../../db/seed-data.js';

const COLUMN_MAP = {
  title: 'title',
  description: 'description',
  status: 'status',
  priority: 'priority',
  dueDate: 'due_date',
  calendarDate: 'calendar_date',
  startTime: 'start_time',
  endTime: 'end_time',
};

export function list(userId) {
  return repo.listByUser(userId);
}

// Filtered/sorted/paginated query. `opts` is the validated query object; we
// default `today` to the server's date when the client didn't supply its own.
export function query(userId, opts) {
  const today = opts.today || nowIso().slice(0, 10);
  return repo.query(userId, { ...opts, today });
}

export function get(id, userId) {
  const task = repo.findByIdForUser(id, userId);
  if (!task) throw notFound('Задача не найдена');
  return task;
}

export function create(userId, data) {
  const completedAt = data.status === 'done' ? nowIso() : null;
  return repo.insert(userId, { ...data, completedAt });
}

export function update(id, userId, data) {
  const existing = repo.findByIdForUser(id, userId);
  if (!existing) throw notFound('Задача не найдена');

  const fields = {};
  for (const [key, col] of Object.entries(COLUMN_MAP)) {
    if (data[key] !== undefined) fields[col] = data[key];
  }
  if (data.tags !== undefined) fields.tags = JSON.stringify(data.tags);

  // Keep completed_at consistent with status transitions.
  if (data.status !== undefined) {
    fields.completed_at =
      data.status === 'done' ? existing.completedAt || nowIso() : null;
  }
  return repo.update(id, userId, fields);
}

export function complete(id, userId) {
  const existing = repo.findByIdForUser(id, userId);
  if (!existing) throw notFound('Задача не найдена');
  return repo.update(id, userId, { status: 'done', completed_at: nowIso() });
}

export function reopen(id, userId) {
  const existing = repo.findByIdForUser(id, userId);
  if (!existing) throw notFound('Задача не найдена');
  return repo.update(id, userId, { status: 'todo', completed_at: null });
}

export function archive(id, userId) {
  const existing = repo.findByIdForUser(id, userId);
  if (!existing) throw notFound('Задача не найдена');
  return repo.update(id, userId, { status: 'archived' });
}

export function remove(id, userId) {
  const ok = repo.remove(id, userId);
  if (!ok) throw notFound('Задача не найдена');
  return true;
}

// Replace the user's tasks with a fresh copy of the demo set (anchored to today).
export function resetDemo(userId) {
  repo.deleteAllForUser(userId);
  repo.bulkInsert(userId, buildDemoTasks());
  return repo.listByUser(userId);
}
