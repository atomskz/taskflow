// Settings API. UI preferences are stored server-side so they sync across
// devices; the client keeps a localStorage cache as an instant-load fallback.
import { api } from './client.js';

export async function getSettings() {
  const { settings } = await api.get('/settings');
  return settings;
}

export async function updateSettings(patch) {
  const { settings } = await api.patch('/settings', patch);
  return settings;
}
