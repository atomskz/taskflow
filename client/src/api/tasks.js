// Tasks API. Mirrors the backend routes; returns plain task DTOs that match the
// shape the React components already consume.
import { api } from './client.js';

export async function listTasks() {
  const { tasks } = await api.get('/tasks');
  return tasks;
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
