import React from 'react';
import { css, mix } from '../lib/css.js';

const CARD = 'background:var(--surface);border:1px solid var(--border);border-radius:14px;box-shadow:var(--sh-sm);padding:18px';

export function StatusDonut({ donut, legend }) {
  return (
    <div style={css(CARD)}>
      <div style={css('font-weight:700;font-size:15px;margin-bottom:14px')}>По статусам</div>
      <div style={css('display:flex;align-items:center;gap:18px')}>
        <div style={css('position:relative;width:128px;height:128px;flex-shrink:0')}>
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
          <div style={css('position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center')}>
            <span style={css('font-size:26px;font-weight:800;font-variant-numeric:tabular-nums;letter-spacing:-.02em')}>{donut.total}</span>
            <span style={css('font-size:11px;color:var(--text-3);font-weight:600')}>всего</span>
          </div>
        </div>
        <div style={css('flex:1;display:flex;flex-direction:column;gap:9px')}>
          {legend.map((g) => (
            <div key={g.key} style={css('display:flex;align-items:center;gap:9px')}>
              <span style={mix('width:9px;height:9px;border-radius:3px', { background: g.color })} />
              <span style={css('font-size:13px;color:var(--text-2);flex:1')}>{g.label}</span>
              <span style={css('font-size:13px;font-weight:700;font-variant-numeric:tabular-nums')}>{g.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PriorityBars({ bars }) {
  return (
    <div style={css(CARD)}>
      <div style={css('font-weight:700;font-size:15px;margin-bottom:15px')}>По приоритетам</div>
      <div style={css('display:flex;flex-direction:column;gap:13px')}>
        {bars.map((b) => (
          <div key={b.label}>
            <div style={css('display:flex;align-items:center;justify-content:space-between;margin-bottom:5px')}>
              <span style={css('font-size:13px;color:var(--text-2);font-weight:500')}>{b.label}</span>
              <span style={css('font-size:13px;font-weight:700;font-variant-numeric:tabular-nums')}>{b.count}</span>
            </div>
            <div style={css('height:8px;border-radius:5px;background:var(--surface-2);overflow:hidden')}>
              <div style={mix('height:100%;border-radius:5px;animation:growW .6s ease both', { width: b.pct + '%', background: b.color })} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WeeklyProgress({ weekPct, completedWeek, createdWeek, weekBars, weekRange, ring }) {
  return (
    <div style={css('background:linear-gradient(150deg,#4f46e5,#6d5ef0);border-radius:14px;box-shadow:var(--sh-md);padding:18px;color:#fff;position:relative;overflow:hidden')}>
      <div style={css('position:absolute;inset:0;background:radial-gradient(300px 160px at 90% 0%,rgba(255,255,255,.18),transparent 60%)')} />
      <div style={css('position:relative;display:flex;align-items:center;justify-content:space-between;margin-bottom:14px')}>
        <span style={css('font-weight:700;font-size:15px')}>Прогресс недели</span>
        <span style={css('font-family:var(--mono);font-size:12px;color:rgba(255,255,255,.75)')}>{weekRange}</span>
      </div>
      <div style={css('position:relative;display:flex;align-items:center;gap:18px')}>
        <div style={css('position:relative;width:78px;height:78px;flex-shrink:0')}>
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
          <div style={css('position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:19px;font-weight:800')}>{weekPct}%</div>
        </div>
        <div style={css('flex:1')}>
          <div style={css('display:flex;align-items:baseline;gap:6px')}>
            <span style={css('font-size:24px;font-weight:800;font-variant-numeric:tabular-nums')}>{completedWeek}</span>
            <span style={css('font-size:13px;color:rgba(255,255,255,.8)')}>из {createdWeek} созданных</span>
          </div>
          <div style={css('display:flex;align-items:flex-end;gap:4px;height:38px;margin-top:10px')}>
            {weekBars.map((w, i) => (
              <div key={i} style={css('flex:1;display:flex;flex-direction:column;align-items:center;gap:4px')}>
                <div style={mix('width:100%;border-radius:3px;background:rgba(255,255,255,.85);min-height:3px', { height: w.h + 'px' })} />
                <span style={css('font-size:9px;color:rgba(255,255,255,.7);font-weight:600')}>{w.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
