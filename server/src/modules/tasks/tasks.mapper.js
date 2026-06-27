// Map a DB row (snake_case) to the camelCase DTO the frontend already expects.
// Keeping the exact field shape means React components need no data remapping.
export function rowToTask(row) {
  if (!row) return null;
  let tags = [];
  try {
    tags = JSON.parse(row.tags || '[]');
  } catch {
    tags = [];
  }
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    description: row.description || '',
    status: row.status,
    priority: row.priority,
    dueDate: row.due_date,
    calendarDate: row.calendar_date,
    startTime: row.start_time,
    endTime: row.end_time,
    tags,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
