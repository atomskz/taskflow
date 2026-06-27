import React from 'react';
import { css, mix } from '../lib/css.js';
import { Hov, Icon } from '../ui.jsx';
import { useApp } from '../store.jsx';
import { filterSortTasks, taskVM } from '../lib/tasks.js';
import { PRI } from '../lib/constants.js';
import TaskCard from '../components/TaskCard.jsx';

const SELECT = 'padding:10px 32px 10px 13px;background:var(--surface-2);border:1px solid var(--border);border-radius:9px;font-size:13.5px;font-weight:600;outline:none;cursor:pointer;appearance:none';
const SKEL = 'background:linear-gradient(90deg,#eef0f2 25%,#f6f7f9 37%,#eef0f2 63%);background-size:200% 100%;animation:sh 1.3s infinite;border:1px solid var(--border)';

const chipStyle = (active) => {
  const base = 'display:inline-flex;align-items:center;gap:6px;padding:6px 13px;border-radius:8px;font-size:13px;font-weight:600;white-space:nowrap;transition:all .12s;';
  return active
    ? base + 'background:var(--accent);color:#fff;box-shadow:0 2px 6px rgba(79,70,229,.22);'
    : base + 'background:var(--surface);color:var(--text-2);border:1px solid var(--border-2);';
};
const toggleStyle = (active, color) => {
  const base = 'display:inline-flex;align-items:center;gap:7px;padding:6px 13px;border-radius:8px;font-size:13px;font-weight:600;white-space:nowrap;';
  return active ? base + 'background:' + color + ';color:#fff;' : base + 'background:var(--surface);color:var(--text-2);border:1px solid var(--border-2);';
};

const STATUS_CHIPS = [['all', 'Все'], ['todo', 'К выполнению'], ['in_progress', 'В работе'], ['done', 'Выполнено'], ['archived', 'Архив']];
const PRI_CHIPS = [['all', 'Любой'], ['low', 'Низкий'], ['medium', 'Средний'], ['high', 'Высокий'], ['critical', 'Критичный']];

export default function TasksPage() {
  const { tasks, filters, sort, settings, forcedTasks, tasksLoading, tasksError, reloadTasks, setFilter, toggleFilter, setSort, resetFilters, openCreate } = useApp();

  // Real loading/error from the API, plus the demo overrides from Settings.
  const loading = tasksLoading || forcedTasks === 'loading';
  const error = (!!tasksError && !tasksLoading) || forcedTasks === 'error';
  const list = filterSortTasks(tasks, filters, sort, settings, forcedTasks);
  const q = (filters.search || '').trim();
  const activeFilterCount =
    (filters.status !== 'all' ? 1 : 0) +
    (filters.priority !== 'all' ? 1 : 0) +
    (filters.onlyOverdue ? 1 : 0) +
    (filters.onlyToday ? 1 : 0) +
    (q ? 1 : 0);
  const isFiltered = activeFilterCount > 0;
  const empty = !loading && !error && list.length === 0;
  const show = !loading && !error && list.length > 0;

  return (
    <div style={css('max-width:1080px;margin:0 auto;animation:ff .3s ease both')}>
      {/* Filter bar */}
      <div style={css('background:var(--surface);border:1px solid var(--border);border-radius:14px;box-shadow:var(--sh-sm);padding:13px;margin-bottom:16px')}>
        <div style={css('display:flex;gap:10px;align-items:center;margin-bottom:12px')}>
          <div style={css('flex:1;position:relative;display:flex;align-items:center')}>
            <span style={css('position:absolute;left:12px;pointer-events:none;color:#9a9ca6;display:flex')}><Icon name="search" size={16} /></span>
            <Hov as="input" value={filters.search} onChange={(e) => setFilter('search', e.target.value)} placeholder="Поиск по названию, описанию, тегам…" style="width:100%;padding:10px 12px 10px 36px;background:var(--surface-2);border:1px solid var(--border);border-radius:9px;font-size:14px;outline:none;transition:all .12s" styleFocus="border-color:var(--accent);background:#fff;box-shadow:0 0 0 3px var(--accent-soft)" />
          </div>
          <div style={css('position:relative')}>
            <select value={sort} onChange={(e) => setSort(e.target.value)} style={css(SELECT)}>
              <option value="created_desc">Сначала новые</option>
              <option value="created_asc">Сначала старые</option>
              <option value="due_asc">Ближайший дедлайн</option>
              <option value="priority_desc">Высокий приоритет</option>
              <option value="title_asc">По алфавиту</option>
            </select>
            <span style={css('position:absolute;right:11px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--text-3)')}><Icon name="chevronDown" size={14} strokeWidth={2.4} /></span>
          </div>
        </div>
        <div style={css('display:flex;flex-wrap:wrap;gap:7px;align-items:center')}>
          {STATUS_CHIPS.map(([k, l]) => (
            <button key={k} onClick={() => setFilter('status', k)} style={css(chipStyle(filters.status === k))}>{l}</button>
          ))}
          <span style={css('width:1px;height:22px;background:var(--border-2);margin:0 3px')} />
          {PRI_CHIPS.map(([k, l]) => (
            <button key={k} onClick={() => setFilter('priority', k)} style={css(chipStyle(filters.priority === k))}>{l}</button>
          ))}
          <span style={css('width:1px;height:22px;background:var(--border-2);margin:0 3px')} />
          <button onClick={() => toggleFilter('onlyOverdue')} style={css(toggleStyle(filters.onlyOverdue, '#dc2626'))}>
            <Icon name="alert" size={13} strokeWidth={2.2} />Просрочено
          </button>
          <button onClick={() => toggleFilter('onlyToday')} style={css(toggleStyle(filters.onlyToday, '#2563eb'))}>
            <Icon name="clock" size={13} strokeWidth={2.2} />Сегодня
          </button>
        </div>
      </div>

      {/* Count row */}
      <div style={css('display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;padding:0 3px')}>
        <div style={css('font-size:13.5px;color:var(--text-2)')}>Найдено <b style={css('color:var(--text);font-variant-numeric:tabular-nums')}>{list.length}</b> из {tasks.length}</div>
        {isFiltered && (
          <Hov as="button" onClick={resetFilters} style="display:flex;align-items:center;gap:5px;font-size:13px;font-weight:600;color:var(--text-2)" styleHover="color:var(--accent-text)">
            <Icon name="refresh" size={14} />Сбросить
          </Hov>
        )}
      </div>

      {loading && (
        <div style={css('display:flex;flex-direction:column;gap:10px')}>
          {[0, 1, 2, 3].map((i) => <div key={i} style={mix('height:86px;border-radius:12px', SKEL)} />)}
        </div>
      )}

      {error && (
        <div style={css('background:var(--surface);border:1px solid #f3d2d2;border-radius:14px;padding:44px;text-align:center')}>
          <div style={css('width:54px;height:54px;border-radius:14px;background:#fdeaea;display:flex;align-items:center;justify-content:center;margin:0 auto 14px')}><Icon name="alert" size={26} color="#dc2626" /></div>
          <h3 style={css('font-size:17px;font-weight:700;margin:0')}>Не удалось загрузить задачи</h3>
          <p style={css('color:var(--text-2);margin:7px 0 18px;font-size:14px')}>{tasksError || 'Произошла ошибка соединения. Попробуйте обновить.'}</p>
          <Hov as="button" onClick={() => reloadTasks()} style="padding:10px 20px;font-weight:700;font-size:14px;color:#fff;background:var(--accent);border-radius:9px" styleHover="background:var(--accent-h)">Попробовать снова</Hov>
        </div>
      )}

      {empty && (
        <div style={css('background:var(--surface);border:1px dashed var(--border-2);border-radius:14px;padding:54px 30px;text-align:center')}>
          <div style={css('width:58px;height:58px;border-radius:16px;background:var(--accent-soft);display:flex;align-items:center;justify-content:center;margin:0 auto 16px')}><Icon name="checkSquare" size={28} color="#4f46e5" strokeWidth={1.8} /></div>
          {isFiltered ? (
            <>
              <h3 style={css('font-size:18px;font-weight:700;margin:0')}>Ничего не найдено</h3>
              <p style={css('color:var(--text-2);margin:7px 0 18px;font-size:14px')}>Попробуйте изменить фильтры или поисковый запрос.</p>
              <Hov as="button" onClick={resetFilters} style="padding:10px 20px;font-weight:700;font-size:14px;color:var(--text);background:var(--surface);border:1px solid var(--border-2);border-radius:9px" styleHover="background:var(--hover)">Сбросить фильтры</Hov>
            </>
          ) : (
            <>
              <h3 style={css('font-size:18px;font-weight:700;margin:0')}>У вас пока нет задач</h3>
              <p style={css('color:var(--text-2);margin:7px 0 18px;font-size:14px')}>Создайте первую задачу, чтобы начать планирование.</p>
              <Hov as="button" onClick={() => openCreate()} style="display:inline-flex;align-items:center;gap:7px;padding:10px 20px;font-weight:700;font-size:14px;color:#fff;background:var(--accent);border-radius:9px" styleHover="background:var(--accent-h)">
                <Icon name="plus" size={16} strokeWidth={2.3} />Создать задачу
              </Hov>
            </>
          )}
        </div>
      )}

      {show && (
        <div style={css('display:flex;flex-direction:column;gap:10px')}>
          {list.map((t) => <TaskCard key={t.id} vm={taskVM(t)} />)}
        </div>
      )}
    </div>
  );
}
