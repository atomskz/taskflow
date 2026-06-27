// Assembles the dashboard payload from SQL aggregations. Returns raw numbers and
// short task lists; the client turns these into chart geometry and view models
// (so presentation/constants stay on the client). Week is Monday-based, matching
// the client's startOfWeek.
import * as repo from './dashboard.repo.js';
import { getSettingsRaw } from '../users/users.repo.js';
import { DEFAULT_SETTINGS } from '../settings/settings.validation.js';
import { nowIso } from '../../utils/ids.js';

// --- date-only helpers (UTC math over 'YYYY-MM-DD' strings) ---
const toUTC = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};
const fmt = (date) =>
  `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(
    date.getUTCDate()
  ).padStart(2, '0')}`;
const addDays = (s, n) => {
  const d = toUTC(s);
  d.setUTCDate(d.getUTCDate() + n);
  return fmt(d);
};
const mondayOf = (s) => {
  const d = toUTC(s);
  const wd = (d.getUTCDay() + 6) % 7; // Monday = 0
  return addDays(s, -wd);
};

function settingsFor(userId) {
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(getSettingsRaw(userId) || '{}') };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function build(userId, todayParam) {
  const today = todayParam || nowIso().slice(0, 10);
  const weekStart = mondayOf(today);
  const weekEnd = addDays(weekStart, 7);
  const settings = settingsFor(userId);

  const counts = repo.counts(userId, { today, weekStart, weekEnd });
  const statusCounts = repo.distribution(userId, 'status');
  const priorityCounts = repo.distribution(userId, 'priority');

  // Completed counts for each day Mon..Sun of the current week.
  const byDay = repo.completedByDay(userId, weekStart, weekEnd);
  const weekDays = Array.from({ length: 7 }, (_, i) => byDay[addDays(weekStart, i)] || 0);

  return {
    counts,
    statusCounts,
    priorityCounts,
    week: {
      createdWeek: counts.createdWeek,
      completedWeek: counts.doneWeek,
      rangeStart: weekStart,
      rangeEnd: addDays(weekStart, 6),
      days: weekDays,
    },
    overdue: repo.overdueList(userId, today, 20),
    upcoming: repo.upcomingList(userId, today, addDays(today, 7), Math.max(settings.dashCount, 10)),
    current: repo.currentList(userId, 5),
  };
}
