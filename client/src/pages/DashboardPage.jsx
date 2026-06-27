import './DashboardPage.css';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../ui.jsx';
import { useApp } from '../store.jsx';
import { buildDashboard, buildDashboardFromServer } from '../lib/tasks.js';
import { getDashboard } from '../api/dashboard.js';
import { iso, today as todayDate } from '../lib/dates.js';
import { StatusDonut, PriorityBars, WeeklyProgress } from '../components/charts.jsx';

function CompleteBtn({ onClick, soft }) {
  return (
    <button onClick={onClick} className={'task-check task-check--sm' + (soft ? ' task-check--soft' : '')} />
  );
}

export default function DashboardPage() {
  const { tasks, settings, loading, openDetail, completeTask, tasksVersion } = useApp();
  const navigate = useNavigate();
  const [serverDash, setServerDash] = useState(null);
  const [failed, setFailed] = useState(false);

  // Fetch server-computed aggregates; refetch after any task mutation. Falls
  // back to the client-side computation over the in-memory list if it fails.
  useEffect(() => {
    let cancelled = false;
    getDashboard(iso(todayDate()))
      .then((p) => { if (!cancelled) { setServerDash(p); setFailed(false); } })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; };
  }, [tasksVersion]);

  const useServer = serverDash && !failed;
  const d = useServer ? buildDashboardFromServer(serverDash, settings) : buildDashboard(tasks, settings);
  const comp = (id) => (e) => { e.stopPropagation(); completeTask(id); };

  if (loading || (!serverDash && !failed)) {
    return (
      <div className="dash-skel-wrap">
        <div className="dash-skel-stats">
          {[0, 1, 2, 3, 4].map((i) => <div key={i} className="skeleton dash-skel-stat" />)}
        </div>
        <div className="dash-skel-cols">
          <div className="skeleton dash-skel-panel" />
          <div className="skeleton dash-skel-panel" />
        </div>
      </div>
    );
  }

  return (
    <div className="page dash-page">
      {/* Stat cards */}
      <div className="dash-stats-grid">
        <div className="stat">
          <div className="dash-stat-head">
            <span className="stat__label">Активные</span>
            <span className="stat__chip dash-chip-accent"><Icon name="checkCircle" size={16} color="#4f46e5" /></span>
          </div>
          <div className="stat__num">{d.activeCount}</div>
          <div className="stat__sub">{d.activeSub}</div>
        </div>
        <div className="stat">
          <div className="dash-stat-head">
            <span className="stat__label">На сегодня</span>
            <span className="stat__chip dash-chip-blue"><Icon name="clock" size={16} color="#2563eb" /></span>
          </div>
          <div className="stat__num dash-num-blue">{d.todayCount}</div>
          <div className="stat__sub">запланировано</div>
        </div>
        <div className="stat">
          <div className="dash-stat-head">
            <span className="stat__label">Просрочено</span>
            <span className="stat__chip dash-chip-red"><Icon name="alert" size={16} color="#dc2626" /></span>
          </div>
          <div className="stat__num dash-num-red">{d.overdueCount}</div>
          <div className="stat__sub">требует внимания</div>
        </div>
        <div className="stat">
          <div className="dash-stat-head">
            <span className="stat__label">За неделю</span>
            <span className="stat__chip dash-chip-green"><Icon name="check" size={16} color="#16a34a" /></span>
          </div>
          <div className="stat__num dash-num-green">{d.doneWeekCount}</div>
          <div className="stat__sub">выполнено</div>
        </div>
        <div className="stat">
          <div className="dash-stat-head">
            <span className="stat__label">Высокий</span>
            <span className="stat__chip dash-chip-orange"><Icon name="flag" size={16} color="#ea580c" /></span>
          </div>
          <div className="stat__num dash-num-orange">{d.highCount}</div>
          <div className="stat__sub">приоритет</div>
        </div>
      </div>

      <div className="dash-cols">
        {/* Left column */}
        <div className="dash-col">
          {d.overdueCount > 0 && (
            <div className="dash-overdue-card">
              <div className="dash-overdue-head">
                <span className="dash-overdue-dot" />
                <span className="panel-title">Просроченные</span>
                <span className="dash-overdue-count">{d.overdueCount}</span>
              </div>
              <div className="dash-list">
                {d.overdue.map((t) => (
                  <div key={t.id} onClick={() => openDetail(t.id)} className="dash-row dash-row--overdue">
                    <CompleteBtn onClick={comp(t.id)} soft />
                    <div className="dash-row-main"><div className="dash-row-title">{t.title}</div></div>
                    <span className="dash-due">{t.dueText}</span>
                    <span className="dash-pri-dot" style={{ '--c': t.priColor }} />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card dash-card-clip">
            <div className="panel-head">
              <span className="panel-title">Предстоящие 7 дней</span>
              <button className="link-action" onClick={() => navigate('/tasks')}>Все задачи →</button>
            </div>
            {d.upcoming.length > 0 ? (
              <div className="dash-list">
                {d.upcoming.map((t) => (
                  <div key={t.id} onClick={() => openDetail(t.id)} className="dash-row">
                    <CompleteBtn onClick={comp(t.id)} />
                    <span className="dash-pri-bar" style={{ '--c': t.priColor }} />
                    <div className="dash-row-main">
                      <div className="dash-row-title">{t.title}</div>
                      <div className="dash-row-meta">
                        <span>{t.priLabel}</span>
                        {t.time && <span className="dash-row-time">· {t.time}</span>}
                      </div>
                    </div>
                    <span className="dash-when" style={{ color: t.whenColor }}>{t.whenText}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="dash-empty">
                <div className="dash-empty-title">Нет задач на ближайшую неделю</div>
                <div className="dash-empty-sub">Свободно — можно отдохнуть 🎉</div>
              </div>
            )}
          </div>

          <div className="card dash-card-clip">
            <div className="panel-head">
              <span className="panel-title">Текущие задачи</span>
              <span className="dash-head-count">{d.currentCount} в работе</span>
            </div>
            <div className="dash-list">
              {d.current.map((t) => (
                <div key={t.id} onClick={() => openDetail(t.id)} className="dash-row">
                  <CompleteBtn onClick={comp(t.id)} />
                  <div className="dash-row-main"><div className="dash-row-title">{t.title}</div></div>
                  <span className="dash-status" style={{ color: t.stColor, background: t.stSoft }}>{t.stLabel}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="dash-col">
          <StatusDonut donut={d.donut} legend={d.statusLegend} />
          <PriorityBars bars={d.priorityBars} />
          <WeeklyProgress weekPct={d.weekPct} completedWeek={d.completedWeek} createdWeek={d.createdWeek} weekBars={d.weekBars} weekRange={d.weekRange} ring={d.ring} />
        </div>
      </div>
    </div>
  );
}
