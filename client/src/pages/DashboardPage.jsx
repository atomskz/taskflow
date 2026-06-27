import React from 'react';
import { useNavigate } from 'react-router-dom';
import { css, mix } from '../lib/css.js';
import { Hov, Icon } from '../ui.jsx';
import { useApp } from '../store.jsx';
import { buildDashboard } from '../lib/tasks.js';
import { StatusDonut, PriorityBars, WeeklyProgress } from '../components/charts.jsx';

const CARD = 'background:var(--surface);border:1px solid var(--border);border-radius:14px;box-shadow:var(--sh-sm);overflow:hidden';
const STAT = 'background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px 17px;box-shadow:var(--sh-sm)';
const STATLABEL = 'font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.06em';
const STATNUM = 'font-size:32px;font-weight:800;margin-top:10px;font-variant-numeric:tabular-nums;letter-spacing:-.02em';
const CHIP = 'width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center';
const SKEL = 'background:linear-gradient(90deg,#eef0f2 25%,#f6f7f9 37%,#eef0f2 63%);background-size:200% 100%;animation:sh 1.3s infinite;border:1px solid var(--border)';

function CompleteBtn({ onClick, soft }) {
  return (
    <Hov as="button" onClick={onClick} style={mix('width:20px;height:20px;border-radius:6px;flex-shrink:0', soft ? 'border:2px solid #d6c2c2' : 'border:2px solid var(--border-2)')} styleHover="border-color:#16a34a;background:#e7f6ed" />
  );
}

export default function DashboardPage() {
  const { tasks, settings, loading, openDetail, completeTask } = useApp();
  const navigate = useNavigate();
  const d = buildDashboard(tasks, settings);
  const comp = (id) => (e) => { e.stopPropagation(); completeTask(id); };

  if (loading) {
    return (
      <div style={css('max-width:1200px;margin:0 auto')}>
        <div style={css('display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:18px')}>
          {[0, 1, 2, 3, 4].map((i) => <div key={i} style={mix('height:104px;border-radius:12px', SKEL)} />)}
        </div>
        <div style={css('display:grid;grid-template-columns:1.7fr 1fr;gap:16px')}>
          <div style={mix('height:340px;border-radius:14px', SKEL)} />
          <div style={mix('height:340px;border-radius:14px', SKEL)} />
        </div>
      </div>
    );
  }

  return (
    <div style={css('max-width:1200px;margin:0 auto;animation:ff .3s ease both')}>
      {/* Stat cards */}
      <div style={css('display:grid;grid-template-columns:repeat(5,1fr);gap:14px;margin-bottom:18px')}>
        <div style={css(STAT)}>
          <div style={css('display:flex;align-items:center;justify-content:space-between')}>
            <span style={css(STATLABEL)}>Активные</span>
            <span style={mix(CHIP, 'background:var(--accent-soft)')}><Icon name="checkCircle" size={16} color="#4f46e5" /></span>
          </div>
          <div style={css(STATNUM)}>{d.activeCount}</div>
          <div style={css('font-size:12.5px;color:var(--text-3);margin-top:2px')}>{d.activeSub}</div>
        </div>
        <div style={css(STAT)}>
          <div style={css('display:flex;align-items:center;justify-content:space-between')}>
            <span style={css(STATLABEL)}>На сегодня</span>
            <span style={mix(CHIP, 'background:#e8f0fe')}><Icon name="clock" size={16} color="#2563eb" /></span>
          </div>
          <div style={mix(STATNUM, 'color:#2563eb')}>{d.todayCount}</div>
          <div style={css('font-size:12.5px;color:var(--text-3);margin-top:2px')}>запланировано</div>
        </div>
        <div style={css(STAT)}>
          <div style={css('display:flex;align-items:center;justify-content:space-between')}>
            <span style={css(STATLABEL)}>Просрочено</span>
            <span style={mix(CHIP, 'background:#fdeaea')}><Icon name="alert" size={16} color="#dc2626" /></span>
          </div>
          <div style={mix(STATNUM, 'color:#dc2626')}>{d.overdueCount}</div>
          <div style={css('font-size:12.5px;color:var(--text-3);margin-top:2px')}>требует внимания</div>
        </div>
        <div style={css(STAT)}>
          <div style={css('display:flex;align-items:center;justify-content:space-between')}>
            <span style={css(STATLABEL)}>За неделю</span>
            <span style={mix(CHIP, 'background:#e7f6ed')}><Icon name="check" size={16} color="#16a34a" /></span>
          </div>
          <div style={mix(STATNUM, 'color:#16a34a')}>{d.doneWeekCount}</div>
          <div style={css('font-size:12.5px;color:var(--text-3);margin-top:2px')}>выполнено</div>
        </div>
        <div style={css(STAT)}>
          <div style={css('display:flex;align-items:center;justify-content:space-between')}>
            <span style={css(STATLABEL)}>Высокий</span>
            <span style={mix(CHIP, 'background:#fdece1')}><Icon name="flag" size={16} color="#ea580c" /></span>
          </div>
          <div style={mix(STATNUM, 'color:#ea580c')}>{d.highCount}</div>
          <div style={css('font-size:12.5px;color:var(--text-3);margin-top:2px')}>приоритет</div>
        </div>
      </div>

      <div style={css('display:grid;grid-template-columns:1.7fr 1fr;gap:16px;align-items:start')}>
        {/* Left column */}
        <div style={css('display:flex;flex-direction:column;gap:16px')}>
          {d.overdueCount > 0 && (
            <div style={css('background:var(--surface);border:1px solid #f3d2d2;border-radius:14px;box-shadow:var(--sh-sm);overflow:hidden')}>
              <div style={css('display:flex;align-items:center;gap:9px;padding:15px 18px 13px;border-bottom:1px solid var(--border)')}>
                <span style={css('width:8px;height:8px;border-radius:50%;background:#dc2626')} />
                <span style={css('font-weight:700;font-size:15px')}>Просроченные</span>
                <span style={css('font-family:var(--mono);font-size:12px;color:#dc2626;background:#fdeaea;padding:2px 8px;border-radius:999px;font-weight:600')}>{d.overdueCount}</span>
              </div>
              <div style={css('padding:8px')}>
                {d.overdue.map((t) => (
                  <Hov key={t.id} onClick={() => openDetail(t.id)} style="display:flex;align-items:center;gap:12px;padding:10px 11px;border-radius:9px;cursor:pointer" styleHover="background:var(--hover)">
                    <CompleteBtn onClick={comp(t.id)} soft />
                    <div style={css('flex:1;min-width:0')}><div style={css('font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{t.title}</div></div>
                    <span style={css('font-family:var(--mono);font-size:12px;color:#dc2626;font-weight:600;flex-shrink:0')}>{t.dueText}</span>
                    <span style={mix('width:7px;height:7px;border-radius:50%;flex-shrink:0', { background: t.priColor })} />
                  </Hov>
                ))}
              </div>
            </div>
          )}

          <div style={css(CARD)}>
            <div style={css('display:flex;align-items:center;justify-content:space-between;padding:15px 18px 13px;border-bottom:1px solid var(--border)')}>
              <span style={css('font-weight:700;font-size:15px')}>Предстоящие 7 дней</span>
              <Hov as="button" onClick={() => navigate('/tasks')} style="font-size:13px;font-weight:600;color:var(--accent-text)" styleHover="text-decoration:underline">Все задачи →</Hov>
            </div>
            {d.upcoming.length > 0 ? (
              <div style={css('padding:8px')}>
                {d.upcoming.map((t) => (
                  <Hov key={t.id} onClick={() => openDetail(t.id)} style="display:flex;align-items:center;gap:12px;padding:11px;border-radius:9px;cursor:pointer" styleHover="background:var(--hover)">
                    <CompleteBtn onClick={comp(t.id)} />
                    <span style={mix('width:8px;height:34px;border-radius:4px;flex-shrink:0', { background: t.priColor })} />
                    <div style={css('flex:1;min-width:0')}>
                      <div style={css('font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{t.title}</div>
                      <div style={css('font-size:12px;color:var(--text-3);margin-top:2px;display:flex;align-items:center;gap:8px')}>
                        <span>{t.priLabel}</span>
                        {t.time && <span style={css('font-family:var(--mono)')}>· {t.time}</span>}
                      </div>
                    </div>
                    <span style={mix('font-family:var(--mono);font-size:12px;font-weight:600;flex-shrink:0', { color: t.whenColor })}>{t.whenText}</span>
                  </Hov>
                ))}
              </div>
            ) : (
              <div style={css('padding:34px;text-align:center;color:var(--text-3)')}>
                <div style={css('font-size:14px;font-weight:600;color:var(--text-2)')}>Нет задач на ближайшую неделю</div>
                <div style={css('font-size:13px;margin-top:4px')}>Свободно — можно отдохнуть 🎉</div>
              </div>
            )}
          </div>

          <div style={css(CARD)}>
            <div style={css('display:flex;align-items:center;justify-content:space-between;padding:15px 18px 13px;border-bottom:1px solid var(--border)')}>
              <span style={css('font-weight:700;font-size:15px')}>Текущие задачи</span>
              <span style={css('font-family:var(--mono);font-size:12px;color:var(--text-3)')}>{d.currentCount} в работе</span>
            </div>
            <div style={css('padding:8px')}>
              {d.current.map((t) => (
                <Hov key={t.id} onClick={() => openDetail(t.id)} style="display:flex;align-items:center;gap:12px;padding:11px;border-radius:9px;cursor:pointer" styleHover="background:var(--hover)">
                  <CompleteBtn onClick={comp(t.id)} />
                  <div style={css('flex:1;min-width:0')}><div style={css('font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{t.title}</div></div>
                  <span style={mix('font-size:11.5px;font-weight:700;padding:3px 9px;border-radius:999px;flex-shrink:0', { color: t.stColor, background: t.stSoft })}>{t.stLabel}</span>
                </Hov>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={css('display:flex;flex-direction:column;gap:16px')}>
          <StatusDonut donut={d.donut} legend={d.statusLegend} />
          <PriorityBars bars={d.priorityBars} />
          <WeeklyProgress weekPct={d.weekPct} completedWeek={d.completedWeek} createdWeek={d.createdWeek} weekBars={d.weekBars} weekRange={d.weekRange} ring={d.ring} />
        </div>
      </div>
    </div>
  );
}
