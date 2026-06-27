// Unit tests for the pure task selectors/view-model builders. No React, no DOM:
// runs under Node's built-in test runner (`node --test`).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { isOverdue, filterSortTasks, buildDashboard, buildCalendar, dueInfo } from '../tasks.js';
import { iso, today, addDays } from '../dates.js';

const todayIso = iso(today());
const yesterday = iso(addDays(today(), -1));
const tomorrow = iso(addDays(today(), 1));

let seq = 0;
// Minimal task with overridable fields; createdAt increments so sort is stable.
const make = (over = {}) => ({
  id: 't' + ++seq,
  title: 'Task',
  description: '',
  status: 'todo',
  priority: 'medium',
  dueDate: null,
  calendarDate: null,
  startTime: null,
  endTime: null,
  tags: [],
  completedAt: null,
  createdAt: new Date(2020, 0, seq).toISOString(),
  updatedAt: new Date(2020, 0, seq).toISOString(),
  ...over,
});

const settings = { showCompleted: true, dashCount: 6, firstDay: 'mon' };

test('isOverdue: past due & active → true; future/done/none → false', () => {
  assert.ok(isOverdue(make({ dueDate: yesterday, status: 'todo' })));
  assert.ok(!isOverdue(make({ dueDate: tomorrow, status: 'todo' })));
  assert.ok(!isOverdue(make({ dueDate: yesterday, status: 'done' })));
  assert.ok(!isOverdue(make({ dueDate: yesterday, status: 'archived' })));
  assert.ok(!isOverdue(make({ dueDate: null })));
});

test('dueInfo: overdue badge reports days late', () => {
  const info = dueInfo(make({ dueDate: yesterday, status: 'todo' }));
  assert.match(info.text, /Просрочено/);
});

test('filterSortTasks: status/priority/search filters', () => {
  const tasks = [
    make({ title: 'Alpha', priority: 'high', status: 'todo' }),
    make({ title: 'Beta', priority: 'low', status: 'in_progress', tags: ['work'] }),
    make({ title: 'Gamma', priority: 'high', status: 'done' }),
    make({ title: 'Archived one', priority: 'medium', status: 'archived' }),
  ];
  // 'all' excludes archived
  assert.equal(filterSortTasks(tasks, { status: 'all', priority: 'all', search: '' }, 'created_desc', settings, 'normal').length, 3);
  // hide completed
  assert.equal(
    filterSortTasks(tasks, { status: 'all', priority: 'all', search: '' }, 'created_desc', { ...settings, showCompleted: false }, 'normal').length,
    2
  );
  // priority filter
  assert.equal(filterSortTasks(tasks, { status: 'all', priority: 'high', search: '' }, 'created_desc', settings, 'normal').length, 2);
  // search by tag
  const byTag = filterSortTasks(tasks, { status: 'all', priority: 'all', search: 'work' }, 'created_desc', settings, 'normal');
  assert.equal(byTag.length, 1);
  assert.equal(byTag[0].title, 'Beta');
});

test('filterSortTasks: sorting by priority and title', () => {
  const tasks = [
    make({ title: 'Bbb', priority: 'low' }),
    make({ title: 'Aaa', priority: 'critical' }),
  ];
  assert.equal(filterSortTasks(tasks, { status: 'all', priority: 'all', search: '' }, 'priority_desc', settings, 'normal')[0].priority, 'critical');
  assert.equal(filterSortTasks(tasks, { status: 'all', priority: 'all', search: '' }, 'title_asc', settings, 'normal')[0].title, 'Aaa');
});

test('buildDashboard: counts active/overdue/high and week progress', () => {
  const tasks = [
    make({ title: 'Overdue', dueDate: yesterday, status: 'todo', priority: 'high' }),
    make({ title: 'Active crit', status: 'in_progress', priority: 'critical' }),
    make({ title: 'Done today', status: 'done', completedAt: new Date().toISOString() }),
  ];
  const d = buildDashboard(tasks, settings);
  assert.equal(d.activeCount, 2);
  assert.equal(d.overdueCount, 1);
  assert.equal(d.highCount, 2); // high + critical, both active
  assert.equal(d.doneWeekCount, 1);
  assert.equal(d.overdue.length, 1);
  assert.equal(d.statusLegend.find((s) => s.key === 'done').count, 1);
});

test('buildCalendar: grid shape and task placement', () => {
  const now = today();
  const y = now.getFullYear();
  const m = now.getMonth();
  const onDay = iso(new Date(y, m, 15));
  const cal = buildCalendar([make({ calendarDate: onDay })], y, m, settings, () => {});
  assert.equal(cal.wdLabels.length, 7);
  assert.match(cal.monthLabel, new RegExp(String(y)));
  assert.equal(cal.monthCount, 1);
  const hasChip = cal.weeks.some((w) => w.days.some((dd) => dd.chips.length > 0));
  assert.ok(hasChip);
});
