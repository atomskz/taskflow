// Tasks API. Mirrors the backend routes; returns plain task DTOs that match the
// shape the React components already consume.
import { api } from './client.js';

// Full list (up to the server cap). Used by the calendar and command palette,
// which need the whole set rather than a filtered page.
export async function listTasks() {
  const { tasks } = await api.get('/tasks?limit=500');
  return tasks;
}

// Server-side filtered/sorted/paginated query for the tasks list view.
// `params` mirrors the store's filters/sort plus { limit, offset, today }.
// Returns { tasks, total } where total is the full match count.
export async function queryTasks(params = {}) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  }
  return api.get(`/tasks?${qs.toString()}`);
}

export async function getTask(id) {
  const { task } = await api.get(`/tasks/${id}`);
  return task;
}

export async function createTask(data) {
  const { task } = await api.post('/tasks', data);
  return task;
}

export async function updateTask(id, data) {
  const { task } = await api.patch(`/tasks/${id}`, data);
  return task;
}

export async function deleteTask(id) {
  await api.delete(`/tasks/${id}`);
}

export async function completeTask(id) {
  const { task } = await api.post(`/tasks/${id}/complete`);
  return task;
}

export async function reopenTask(id) {
  const { task } = await api.post(`/tasks/${id}/reopen`);
  return task;
}

export async function archiveTask(id) {
  const { task } = await api.post(`/tasks/${id}/archive`);
  return task;
}

export async function resetDemoTasks() {
  const { tasks } = await api.post('/tasks/reset-demo');
  return tasks;
}
