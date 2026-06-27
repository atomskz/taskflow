import React from 'react';
import './charts.css';

export function StatusDonut({ donut, legend }) {
  return (
    <div className="card card--pad">
      <div className="panel-title chart-title">По статусам</div>
      <div className="chart-donut-row">
        <div className="chart-donut-wrap">
          <svg width="128" height="128" viewBox="0 0 128 128">
            <circle cx="64" cy="64" r={donut.r} fill="none" stroke="#f1f2f4" strokeWidth="16" />
            {donut.segs.map((g, i) => (
              <circle
                key={i}
                cx="64"
                cy="64"
                r={donut.r}
                fill="none"
                stroke={g.color}
                strokeWidth="16"
                strokeDasharray={g.dash}
                strokeDashoffset={g.offset}
                transform="rotate(-90 64 64)"
                strokeLinecap="butt"
              />
            ))}
          </svg>
          <div className="chart-donut-center">
            <span className="chart-donut-total">{donut.total}</span>
            <span className="chart-donut-label">всего</span>
          </div>
        </div>
        <div className="chart-legend">
          {legend.map((g) => (
            <div key={g.key} className="chart-legend-row">
              <span className="chart-legend-dot" style={{ '--c': g.color }} />
              <span className="chart-legend-name">{g.label}</span>
              <span className="chart-legend-count">{g.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PriorityBars({ bars }) {
  return (
    <div className="card card--pad">
      <div className="panel-title chart-title--bars">По приоритетам</div>
      <div className="chart-bars">
        {bars.map((b) => (
          <div key={b.label}>
            <div className="chart-bar-head">
              <span className="chart-bar-label">{b.label}</span>
              <span className="chart-bar-count">{b.count}</span>
            </div>
            <div className="chart-bar-track">
              <div className="chart-bar-fill" style={{ '--w': b.pct + '%', '--c': b.color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WeeklyProgress({ weekPct, completedWeek, createdWeek, weekBars, weekRange, ring }) {
  return (
    <div className="chart-week-card">
      <div className="chart-week-glow" />
      <div className="chart-week-head">
        <span className="chart-week-heading">Прогресс недели</span>
        <span className="chart-week-range">{weekRange}</span>
      </div>
      <div className="chart-week-body">
        <div className="chart-ring-wrap">
          <svg width="78" height="78" viewBox="0 0 78 78">
            <circle cx="39" cy="39" r="32" fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="9" />
            <circle
              cx="39"
              cy="39"
              r="32"
              fill="none"
              stroke="#fff"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={ring.dash}
              strokeDashoffset={ring.offset}
              transform="rotate(-90 39 39)"
            />
          </svg>
          <div className="chart-ring-center">{weekPct}%</div>
        </div>
        <div className="chart-week-stats">
          <div className="chart-week-counts">
            <span className="chart-week-done">{completedWeek}</span>
            <span className="chart-week-created">из {createdWeek} созданных</span>
          </div>
          <div className="chart-weekbars">
            {weekBars.map((w, i) => (
              <div key={i} className="chart-weekbar-col">
                <div className="chart-weekbar" style={{ '--h': w.h + 'px' }} />
                <span className="chart-weekbar-label">{w.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
