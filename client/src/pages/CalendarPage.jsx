import React from 'react';
import { css, mix } from '../lib/css.js';
import { Hov, Icon } from '../ui.jsx';
import { useApp } from '../store.jsx';
import { buildCalendar } from '../lib/tasks.js';

export default function CalendarPage() {
  const { tasks, calYear, calMonth, settings, calShift, calToday, openCreate, openDetail } = useApp();
  const cal = buildCalendar(tasks, calYear, calMonth, settings);

  return (
    <div style={css('max-width:1180px;margin:0 auto;animation:ff .3s ease both')}>
      <div style={css('background:var(--surface);border:1px solid var(--border);border-radius:14px;box-shadow:var(--sh-sm);overflow:hidden')}>
        <div style={css('display:flex;align-items:center;justify-content:space-between;padding:15px 18px;border-bottom:1px solid var(--border)')}>
          <div style={css('display:flex;align-items:baseline;gap:13px')}>
            <span style={css('font-size:19px;font-weight:800;letter-spacing:-.02em')}>{cal.monthLabel}</span>
            <span style={css('font-family:var(--mono);font-size:12px;color:var(--text-3)')}>{cal.monthCount} задач</span>
          </div>
          <div style={css('display:flex;align-items:center;gap:8px')}>
            <Hov as="button" onClick={calToday} style="padding:7px 14px;font-size:13px;font-weight:600;color:var(--text-2);background:var(--surface);border:1px solid var(--border-2);border-radius:8px" styleHover="background:var(--hover)">Сегодня</Hov>
            <div style={css('display:flex;border:1px solid var(--border-2);border-radius:8px;overflow:hidden')}>
              <Hov as="button" onClick={() => calShift(-1)} style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;color:var(--text-2)" styleHover="background:var(--hover)"><Icon name="chevronLeft" size={17} strokeWidth={2.2} /></Hov>
              <span style={css('width:1px;background:var(--border-2)')} />
              <Hov as="button" onClick={() => calShift(1)} style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;color:var(--text-2)" styleHover="background:var(--hover)"><Icon name="chevronRight" size={17} strokeWidth={2.2} /></Hov>
            </div>
          </div>
        </div>

        <div style={css('display:grid;grid-template-columns:repeat(7,1fr);background:var(--surface-2);border-bottom:1px solid var(--border)')}>
          {cal.wdLabels.map((w) => (
            <div key={w} style={css('padding:9px;text-align:center;font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.05em')}>{w}</div>
          ))}
        </div>

        <div>
          {cal.weeks.map((week, wi) => (
            <div key={wi} style={css('display:grid;grid-template-columns:repeat(7,1fr);border-bottom:1px solid var(--border)')}>
              {week.days.map((day) => (
                <Hov
                  key={day.iso}
                  onClick={() => openCreate(day.iso)}
                  style={mix('min-height:114px;border-right:1px solid var(--border);padding:7px 7px 8px;cursor:pointer;position:relative', { background: day.bg })}
                  styleHover="background:var(--hover)"
                >
                  <div style={css('display:flex;align-items:center;justify-content:flex-end;margin-bottom:5px')}>
                    <span style={css(day.numStyle)}>{day.day}</span>
                  </div>
                  <div style={css('display:flex;flex-direction:column;gap:3px')}>
                    {day.chips.map((c) => (
                      <Hov
                        key={c.id}
                        onClick={(e) => { e.stopPropagation(); openDetail(c.id); }}
                        style="display:flex;align-items:center;gap:6px;padding:3px 7px;border-radius:6px;background:var(--surface-2);cursor:pointer;overflow:hidden"
                        styleHover="background:var(--accent-soft)"
                      >
                        <span style={mix('width:6px;height:6px;border-radius:50%;flex-shrink:0', { background: c.dotColor })} />
                        <span style={mix('font-size:11.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis', c.titleStyle)}>{c.title}</span>
                      </Hov>
                    ))}
                    {day.more > 0 && <span style={css('font-size:11px;color:var(--text-3);font-weight:600;padding-left:7px')}>+ ещё {day.more}</span>}
                  </div>
                </Hov>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={css('display:flex;align-items:center;gap:16px;margin-top:13px;padding:0 4px;flex-wrap:wrap')}>
        {[['#16a34a', 'Низкий'], ['#2563eb', 'Средний'], ['#ea580c', 'Высокий'], ['#dc2626', 'Критичный']].map(([color, label]) => (
          <div key={label} style={css('display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--text-2)')}>
            <span style={mix('width:8px;height:8px;border-radius:50%', { background: color })} />{label}
          </div>
        ))}
        <span style={css('flex:1')} />
        <span style={css('font-size:12.5px;color:var(--text-3)')}>Нажмите на день, чтобы создать задачу</span>
      </div>
    </div>
  );
}
