// Dashboard API. Returns server-computed aggregates so the page doesn't need
// the full task list just to show counts and charts.
import { api } from './client.js';

export async function getDashboard(today) {
  const { dashboard } = await api.get(`/dashboard${today ? `?today=${today}` : ''}`);
  return dashboard;
}
