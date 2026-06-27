// Pure task selectors and view-model builders (no React, no state).
import { PRI, ST, MON, MONF, WD } from './constants.js';
import { sod, today, iso, parse, addDays, diffDays, fmt, startOfWeek } from './dates.js';

export const isActive = (t) => t.status === 'todo' || t.status === 'in_progress';

export const isOverdue = (t) =>
  t.dueDate &&
  diffDays(parse(t.dueDate), today()) < 0 &&
  t.status !== 'done' &&
  t.status !== 'archived';

// Relative deadline badge: { text, color, bg } or null.
export function dueInfo(t) {
  if (!t.dueDate) return null;
  const diff = diffDays(parse(t.dueDate), today());
  const done = t.status === 'done' || t.status === 'archived';
  if (done) return { text: fmt(t.dueDate), color: '#9aa0aa', bg: '#eef0f2' };
  if (diff < 0) return { text: 'Просрочено на ' + -diff + ' дн.', color: '#dc2626', bg: '#fdeaea' };
  if (diff === 0) return { text: 'Сегодня', color: '#ea580c', bg: '#fdece1' };
  if (diff === 1) return { text: 'Завтра', color: '#b45309', bg: '#fdf3e2' };
  if (diff <= 7) return { text: 'Через ' + diff + ' дн.', color: '#3f6212', bg: '#eef6e6' };
  return { text: fmt(t.dueDate), color: '#5b6470', bg: '#eef0f2' };
}

// Short "when" label used in dashboard lists.
export function whenInfo(t) {
  const ds = t.calendarDate || t.dueDate;
  if (!ds) return { text: '', color: '#9aa0aa' };
  const diff = diffDays(parse(ds), today());
  if (diff < 0) return { text: fmt(ds), color: '#dc2626' };
  if (diff === 0) return { text: 'Сегодня', color: '#ea580c' };
  if (diff === 1) return { text: 'Завтра', color: '#b45309' };
  if (diff <= 7) return { text: 'Через ' + diff + ' дн.', color: '#5b6470' };
  return { text: fmt(ds), color: '#5b6470' };
}

// Display-only view model for a task (no handlers — those live in components).
export function taskVM(t) {
  const pri = PRI[t.priority] || PRI.medium;
  const st = ST[t.status] || ST.todo;
  const due = dueInfo(t);
  const when = whenInfo(t);
  return {
    id: t.id,
    title: t.title,
    description: t.description || '',
    hasDesc: !!(t.description && t.description.trim()),
    priKey: t.priority,
    priLabel: pri.label,
    priColor: pri.color,
    priSoft: pri.soft,
    stKey: t.status,
    stLabel: st.label,
    stColor: st.color,
    stSoft: st.soft,
    stDot: st.dot,
    isDone: t.status === 'done',
    isArchived: t.status === 'archived',
    isActive: isActive(t),
    dueText: due ? due.text : null,
    dueColor: due ? due.color : null,
    dueBg: due ? due.bg : null,
    hasDue: !!due,
    whenText: when.text,
    whenColor: when.color,
    cal: t.calendarDate ? fmt(t.calendarDate) : null,
    hasCal: !!t.calendarDate,
    time: t.startTime ? (t.endTime ? t.startTime + '–' + t.endTime : t.startTime) : null,
    tags: t.tags || [],
    hasTags: (t.tags || []).length > 0,
  };
}

// ---- Dashboard aggregation --------------------------------------------------
export function buildDashboard(tasks, settings) {
  const tdy = today();
  const tIso = iso(tdy);
  const active = tasks.filter(isActive);
  const todays = tasks.filter(
    (t) => (t.calendarDate === tIso || t.dueDate === tIso) && t.status !== 'archived'
  );
  const overdue = tasks
    .filter(isOverdue)
    .sort((a, b) => parse(a.dueDate) - parse(b.dueDate));
  const sow = startOfWeek(tdy);
  const eow = addDays(sow, 7);
  const doneWeek = tasks.filter(
    (t) =>
      t.status === 'done' &&
      t.completedAt &&
      new Date(t.completedAt) >= sow &&
      new Date(t.completedAt) < eow
  );
  const high = active.filter((t) => t.priority === 'high' || t.priority === 'critical');

  const upcoming = tasks
    .filter((t) => {
      if (!isActive(t)) return false;
      const ds = t.calendarDate || t.dueDate;
      if (!ds) return false;
      const df = diffDays(parse(ds), tdy);
      return df >= 0 && df <= 7;
    })
    .sort((a, b) => {
      const da = parse(a.calendarDate || a.dueDate);
      const db = parse(b.calendarDate || b.dueDate);
      if (+da !== +db) return da - db;
      return PRI[b.priority].rank - PRI[a.priority].rank;
    })
    .slice(0, settings.dashCount);

  const current = active
    .slice()
    .sort((a, b) => PRI[b.priority].rank - PRI[a.priority].rank)
    .slice(0, 5);

  const statusKeys = ['todo', 'in_progress', 'done', 'archived'];
  const statusLegend = statusKeys.map((k) => ({
    key: k,
    label: ST[k].label,
    color: ST[k].dot,
    count: tasks.filter((t) => t.status === k).length,
  }));
  const donutTotal = tasks.length;
  const r = 56;
  const C = 2 * Math.PI * r;
  let acc = 0;
  const segs = statusLegend
    .filter((g) => g.count > 0)
    .map((g) => {
      const frac = donutTotal ? g.count / donutTotal : 0;
      const len = frac * C;
      const seg = {
        color: g.color,
        dash: len.toFixed(2) + ' ' + (C - len).toFixed(2),
        offset: (-acc).toFixed(2),
      };
      acc += len;
      return seg;
    });

  const priKeys = ['critical', 'high', 'medium', 'low'];
  const priCounts = priKeys.map((k) => ({
    key: k,
    label: PRI[k].label,
    color: PRI[k].color,
    count: tasks.filter((t) => t.priority === k).length,
  }));
  const maxPri = Math.max(1, ...priCounts.map((p) => p.count));
  const priorityBars = priCounts.map((p) => ({
    label: p.label,
    color: p.color,
    count: p.count,
    pct: Math.round((p.count / maxPri) * 100),
  }));

  const createdWeek = tasks.filter(
    (t) => new Date(t.createdAt) >= sow && new Date(t.createdAt) < eow
  ).length;
  const completedWeek = doneWeek.length;
  const weekPct =
    createdWeek > 0 ? Math.round((completedWeek / createdWeek) * 100) : completedWeek > 0 ? 100 : 0;
  const ringR = 32;
  const ringC = 2 * Math.PI * ringR;
  const ringLen = (ringC * Math.min(weekPct, 100)) / 100;

  const weekBars = [];
  for (let i = 0; i < 7; i++) {
    const day = addDays(sow, i);
    const cnt = tasks.filter(
      (t) =>
        t.status === 'done' &&
        t.completedAt &&
        iso(new Date(t.completedAt)) === iso(day)
    ).length;
    weekBars.push({ label: WD[i], count: cnt });
  }
  const maxW = Math.max(1, ...weekBars.map((w) => w.count));
  weekBars.forEach((w) => {
    w.h = Math.round(6 + (w.count / maxW) * 28);
  });

  return {
    activeCount: active.length,
    activeSub: active.filter((t) => t.status === 'in_progress').length + ' в работе',
    todayCount: todays.length,
    overdueCount: overdue.length,
    doneWeekCount: completedWeek,
    highCount: high.length,
    overdue: overdue.slice(0, 4).map(taskVM),
    upcoming: upcoming.map(taskVM),
    currentCount: active.length,
    current: current.map(taskVM),
    donut: { r, total: donutTotal, segs },
    statusLegend,
    priorityBars,
    weekPct,
    completedWeek,
    createdWeek,
    weekBars,
    weekRange: fmt(iso(sow)) + ' – ' + fmt(iso(addDays(sow, 6))),
    ring: { dash: ringC.toFixed(2), offset: (ringC - ringLen).toFixed(2) },
  };
}

// Build the dashboard view model from the server's aggregated payload
// (GET /api/dashboard). Counts/lists come from the server; chart geometry and
// task view models are derived here, mirroring buildDashboard's presentation so
// the page renders identically without needing the full task list on the client.
export function buildDashboardFromServer(payload, settings) {
  const { counts, statusCounts, priorityCounts, week } = payload;

  const statusKeys = ['todo', 'in_progress', 'done', 'archived'];
  const statusLegend = statusKeys.map((k) => ({
    key: k,
    label: ST[k].label,
    color: ST[k].dot,
    count: statusCounts[k] || 0,
  }));
  const donutTotal = counts.total;
  const r = 56;
  const C = 2 * Math.PI * r;
  let acc = 0;
  const segs = statusLegend
    .filter((g) => g.count > 0)
    .map((g) => {
      const len = (donutTotal ? g.count / donutTotal : 0) * C;
      const seg = { color: g.color, dash: len.toFixed(2) + ' ' + (C - len).toFixed(2), offset: (-acc).toFixed(2) };
      acc += len;
      return seg;
    });

  const priKeys = ['critical', 'high', 'medium', 'low'];
  const priCounts = priKeys.map((k) => ({ key: k, label: PRI[k].label, color: PRI[k].color, count: priorityCounts[k] || 0 }));
  const maxPri = Math.max(1, ...priCounts.map((p) => p.count));
  const priorityBars = priCounts.map((p) => ({ label: p.label, color: p.color, count: p.count, pct: Math.round((p.count / maxPri) * 100) }));

  const createdWeek = week.createdWeek;
  const completedWeek = week.completedWeek;
  const weekPct = createdWeek > 0 ? Math.round((completedWeek / createdWeek) * 100) : completedWeek > 0 ? 100 : 0;
  const ringR = 32;
  const ringC = 2 * Math.PI * ringR;
  const ringLen = (ringC * Math.min(weekPct, 100)) / 100;
  const maxW = Math.max(1, ...week.days);
  const weekBars = week.days.map((count, i) => ({ label: WD[i], count, h: Math.round(6 + (count / maxW) * 28) }));

  return {
    activeCount: counts.active,
    activeSub: counts.inProgress + ' в работе',
    todayCount: counts.today,
    overdueCount: counts.overdue,
    doneWeekCount: completedWeek,
    highCount: counts.high,
    overdue: payload.overdue.slice(0, 4).map(taskVM),
    upcoming: payload.upcoming.slice(0, settings.dashCount).map(taskVM),
    currentCount: counts.active,
    current: payload.current.map(taskVM),
    donut: { r, total: donutTotal, segs },
    statusLegend,
    priorityBars,
    weekPct,
    completedWeek,
    createdWeek,
    weekBars,
    weekRange: fmt(week.rangeStart) + ' – ' + fmt(week.rangeEnd),
    ring: { dash: ringC.toFixed(2), offset: (ringC - ringLen).toFixed(2) },
  };
}

// ---- Tasks list: filter + sort ---------------------------------------------
export function filterSortTasks(tasks, filters, sort, settings, forced) {
  const tdy = today();
  let list = tasks.slice();
  if (forced === 'empty') list = [];
  if (filters.status === 'all') {
    list = list.filter((t) => t.status !== 'archived');
    if (!settings.showCompleted) list = list.filter((t) => t.status !== 'done');
  } else {
    list = list.filter((t) => t.status === filters.status);
  }
  if (filters.priority !== 'all') list = list.filter((t) => t.priority === filters.priority);
  if (filters.onlyOverdue) list = list.filter(isOverdue);
  if (filters.onlyToday) {
    const ti = iso(tdy);
    list = list.filter((t) => t.calendarDate === ti || t.dueDate === ti);
  }
  const q = (filters.search || '').trim().toLowerCase();
  if (q) {
    list = list.filter(
      (t) =>
        (t.title || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        (t.tags || []).some((tag) => tag.toLowerCase().includes(q))
    );
  }
  list.sort((a, b) => {
    if (sort === 'created_desc') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sort === 'created_asc') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sort === 'due_asc') {
      const da = a.dueDate ? +parse(a.dueDate) : Infinity;
      const db = b.dueDate ? +parse(b.dueDate) : Infinity;
      return da - db;
    }
    if (sort === 'priority_desc') return PRI[b.priority].rank - PRI[a.priority].rank;
    if (sort === 'title_asc') return (a.title || '').localeCompare(b.title || '', 'ru');
    return 0;
  });
  return list;
}

// ---- Calendar grid ----------------------------------------------------------
export function buildCalendar(tasks, year, month, settings, openDetail) {
  const tdy = today();
  const tIso = iso(tdy);
  const monFirst = sod(new Date(year, month, 1));
  const startWd = settings.firstDay === 'mon' ? (monFirst.getDay() + 6) % 7 : monFirst.getDay();
  const gridStart = addDays(monFirst, -startWd);
  const byDate = {};
  tasks.forEach((t) => {
    if (t.calendarDate && t.status !== 'archived') {
      (byDate[t.calendarDate] = byDate[t.calendarDate] || []).push(t);
    }
  });
  const weeks = [];
  for (let w = 0; w < 6; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(gridStart, w * 7 + d);
      const di = iso(date);
      const dayTasks = (byDate[di] || []).sort((a, b) => {
        const ta = a.startTime || '99';
        const tb = b.startTime || '99';
        if (ta !== tb) return ta < tb ? -1 : 1;
        return PRI[b.priority].rank - PRI[a.priority].rank;
      });
      const inMonth = date.getMonth() === month;
      const isToday = di === tIso;
      // Emit flags/data only — presentation lives in CalendarPage.css classes.
      days.push({
        iso: di,
        day: date.getDate(),
        inMonth,
        isToday,
        chips: dayTasks.slice(0, 3).map((t) => ({
          id: t.id,
          title: t.title,
          done: t.status === 'done',
          dotColor: t.status === 'done' ? '#c2c6cd' : PRI[t.priority].color,
        })),
        more: Math.max(0, dayTasks.length - 3),
      });
    }
    weeks.push({ days });
  }
  while (weeks.length > 5 && weeks[weeks.length - 1].days.every((d) => !d.inMonth)) weeks.pop();
  let wdl = WD.slice();
  if (settings.firstDay === 'sun') wdl = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  const monthCount = tasks.filter((t) => {
    if (!t.calendarDate) return false;
    const d = parse(t.calendarDate);
    return d.getMonth() === month && d.getFullYear() === year;
  }).length;
  return { weeks, wdLabels: wdl, monthLabel: MONF[month] + ' ' + year, monthCount };
}
