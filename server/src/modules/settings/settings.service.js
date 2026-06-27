// Business logic for user UI settings. Stored as a JSON object on the users row;
// reads always merge over DEFAULT_SETTINGS so the client gets a complete object
// even for accounts created before a given preference existed.
import { getSettingsRaw, saveSettings } from '../users/users.repo.js';
import { DEFAULT_SETTINGS } from './settings.validation.js';
import { notFound } from '../../utils/errors.js';

function parse(raw) {
  if (!raw) return {};
  try {
    const obj = JSON.parse(raw);
    return obj && typeof obj === 'object' ? obj : {};
  } catch {
    return {};
  }
}

export function get(userId) {
  const raw = getSettingsRaw(userId);
  if (raw === null) throw notFound('Пользователь не найден');
  return { ...DEFAULT_SETTINGS, ...parse(raw) };
}

// Merge the validated patch over the stored settings and persist. Returns the
// full, defaults-merged object so the client can replace its local copy.
export function update(userId, patch) {
  const raw = getSettingsRaw(userId);
  if (raw === null) throw notFound('Пользователь не найден');
  const merged = { ...DEFAULT_SETTINGS, ...parse(raw), ...patch };
  saveSettings(userId, JSON.stringify(merged));
  return merged;
}
