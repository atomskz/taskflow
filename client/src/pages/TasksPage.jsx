import React from 'react';
import './TasksPage.css';
import { Icon } from '../ui.jsx';
import { useApp } from '../store.jsx';
import { taskVM } from '../lib/tasks.js';
import TaskCard from '../components/TaskCard.jsx';

const STATUS_CHIPS = [['all', 'Все'], ['todo', 'К выполнению'], ['in_progress', 'В работе'], ['done', 'Выполнено'], ['archived', 'Архив']];
const PRI_CHIPS = [['all', 'Любой'], ['low', 'Низкий'], ['medium', 'Средний'], ['high', 'Высокий'], ['critical', 'Критичный']];

export default function TasksPage() {
  const { pagedTasks, pagedTotal, pagedLoading, pagedError, loadMoreTasks, filters, sort, forcedTasks, reloadTasks, setFilter, toggleFilter, setSort, resetFilters, openCreate } = useApp();

  // Server-driven list, plus the demo state overrides from Settings.
  const loading = pagedLoading || forcedTasks === 'loading';
  const error = (!!pagedError && !pagedLoading) || forcedTasks === 'error';
  const list = forcedTasks === 'empty' ? [] : pagedTasks;
  const total = forcedTasks === 'empty' ? 0 : pagedTotal;
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
  const hasMore = show && list.length < total;

  return (
    <div className="page tasks-page">
      {/* Filter bar */}
      <div className="tasks-filterbar">
        <div className="tasks-searchrow">
          <div className="tasks-searchwrap">
            <span className="tasks-searchicon"><Icon name="search" size={16} /></span>
            <input className="input tasks-search" value={filters.search} onChange={(e) => setFilter('search', e.target.value)} placeholder="Поиск по названию, описанию, тегам…" />
          </div>
          <div className="select-wrap">
            <select className="select" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="created_desc">Сначала новые</option>
              <option value="created_asc">Сначала старые</option>
              <option value="due_asc">Ближайший дедлайн</option>
              <option value="priority_desc">Высокий приоритет</option>
              <option value="title_asc">По алфавиту</option>
            </select>
            <span className="select-caret"><Icon name="chevronDown" size={14} strokeWidth={2.4} /></span>
          </div>
        </div>
        <div className="tasks-chips">
          {STATUS_CHIPS.map(([k, l]) => (
            <button key={k} onClick={() => setFilter('status', k)} className={'chip' + (filters.status === k ? ' is-active' : '')}>{l}</button>
          ))}
          <span className="tasks-divider" />
          {PRI_CHIPS.map(([k, l]) => (
            <button key={k} onClick={() => setFilter('priority', k)} className={'chip' + (filters.priority === k ? ' is-active' : '')}>{l}</button>
          ))}
          <span className="tasks-divider" />
          <button onClick={() => toggleFilter('onlyOverdue')} className={'tasks-toggle' + (filters.onlyOverdue ? ' is-active' : '')} style={filters.onlyOverdue ? { '--toggle': '#dc2626' } : undefined}>
            <Icon name="alert" size={13} strokeWidth={2.2} />Просрочено
          </button>
          <button onClick={() => toggleFilter('onlyToday')} className={'tasks-toggle' + (filters.onlyToday ? ' is-active' : '')} style={filters.onlyToday ? { '--toggle': '#2563eb' } : undefined}>
            <Icon name="clock" size={13} strokeWidth={2.2} />Сегодня
          </button>
        </div>
      </div>

      {/* Count row */}
      <div className="tasks-countrow">
        <div className="tasks-count">Найдено <b className="tasks-countnum">{total}</b>{list.length < total ? ` · показано ${list.length}` : ''}</div>
        {isFiltered && (
          <button onClick={resetFilters} className="tasks-reset">
            <Icon name="refresh" size={14} />Сбросить
          </button>
        )}
      </div>

      {loading && (
        <div className="tasks-list">
          {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton tasks-skel" />)}
        </div>
      )}

      {error && (
        <div className="tasks-errcard">
          <div className="tasks-erricon"><Icon name="alert" size={26} color="#dc2626" /></div>
          <h3 className="tasks-errtitle">Не удалось загрузить задачи</h3>
          <p className="tasks-errtext">{tasksError || 'Произошла ошибка соединения. Попробуйте обновить.'}</p>
          <button onClick={() => reloadTasks()} className="btn btn--primary btn--md">Попробовать снова</button>
        </div>
      )}

      {empty && (
        <div className="tasks-emptycard">
          <div className="tasks-emptyicon"><Icon name="checkSquare" size={28} color="#4f46e5" strokeWidth={1.8} /></div>
          {isFiltered ? (
            <>
              <h3 className="tasks-emptytitle">Ничего не найдено</h3>
              <p className="tasks-emptytext">Попробуйте изменить фильтры или поисковый запрос.</p>
              <button onClick={resetFilters} className="btn btn--ghost btn--md">Сбросить фильтры</button>
            </>
          ) : (
            <>
              <h3 className="tasks-emptytitle">У вас пока нет задач</h3>
              <p className="tasks-emptytext">Создайте первую задачу, чтобы начать планирование.</p>
              <button onClick={() => openCreate()} className="btn btn--primary btn--md">
                <Icon name="plus" size={16} strokeWidth={2.3} />Создать задачу
              </button>
            </>
          )}
        </div>
      )}

      {show && (
        <>
          <div className="tasks-list">
            {list.map((t) => <TaskCard key={t.id} vm={taskVM(t)} />)}
          </div>
          {hasMore && (
            <div className="tasks-loadmore">
              <button onClick={loadMoreTasks} className="btn btn--ghost btn--md">
                Показать ещё ({total - list.length})
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
