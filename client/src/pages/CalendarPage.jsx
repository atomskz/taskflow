import React from 'react';
import './CalendarPage.css';
import { Icon } from '../ui.jsx';
import { useApp } from '../store.jsx';
import { buildCalendar } from '../lib/tasks.js';

const LEGEND = [
  ['#16a34a', 'Низкий'],
  ['#2563eb', 'Средний'],
  ['#ea580c', 'Высокий'],
  ['#dc2626', 'Критичный'],
];

export default function CalendarPage() {
  const { tasks, calYear, calMonth, settings, calShift, calToday, openCreate, openDetail } = useApp();
  const cal = buildCalendar(tasks, calYear, calMonth, settings);

  return (
    <div className="page cal-page">
      <div className="card cal-card">
        <div className="cal-head">
          <div className="cal-head-left">
            <span className="cal-month">{cal.monthLabel}</span>
            <span className="cal-count">{cal.monthCount} задач</span>
          </div>
          <div className="cal-nav">
            <button onClick={calToday} className="btn btn--ghost cal-today-btn">Сегодня</button>
            <div className="cal-stepper">
              <button onClick={() => calShift(-1)} className="icon-btn cal-step"><Icon name="chevronLeft" size={17} strokeWidth={2.2} /></button>
              <span className="cal-step-sep" />
              <button onClick={() => calShift(1)} className="icon-btn cal-step"><Icon name="chevronRight" size={17} strokeWidth={2.2} /></button>
            </div>
          </div>
        </div>

        <div className="cal-weekhead">
          {cal.wdLabels.map((w) => (
            <div key={w} className="cal-weekhead-cell">{w}</div>
          ))}
        </div>

        <div>
          {cal.weeks.map((week, wi) => (
            <div key={wi} className="cal-week">
              {week.days.map((day) => (
                <div
                  key={day.iso}
                  onClick={() => openCreate(day.iso)}
                  className={'cal-day' + (day.isToday ? ' cal-day--today' : !day.inMonth ? ' cal-day--out' : '')}
                >
                  <div className="cal-daynum-row">
                    <span className={'cal-num' + (day.isToday ? ' cal-num--today' : !day.inMonth ? ' cal-num--out' : '')}>{day.day}</span>
                  </div>
                  <div className="cal-chips">
                    {day.chips.map((c) => (
                      <div
                        key={c.id}
                        onClick={(e) => { e.stopPropagation(); openDetail(c.id); }}
                        className="cal-chip"
                      >
                        <span className="cal-chip-dot" style={{ '--c': c.dotColor }} />
                        <span className={'cal-chip-title' + (c.done ? ' is-done' : '')}>{c.title}</span>
                      </div>
                    ))}
                    {day.more > 0 && <span className="cal-more">+ ещё {day.more}</span>}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="cal-legend">
        {LEGEND.map(([color, label]) => (
          <div key={label} className="cal-legend-item">
            <span className="cal-legend-dot" style={{ '--c': color }} />{label}
          </div>
        ))}
        <span className="cal-spacer" />
        <span className="cal-hint">Нажмите на день, чтобы создать задачу</span>
      </div>
    </div>
  );
}
