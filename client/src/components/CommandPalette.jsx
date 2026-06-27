import React from 'react';
import { useNavigate } from 'react-router-dom';
import { css, mix } from '../lib/css.js';
import { Hov, Icon } from '../ui.jsx';
import { useApp } from '../store.jsx';
import { PRI } from '../lib/constants.js';

export default function CommandPalette() {
  const { cmdOpen, cmdQuery, setCmdQuery, closeCmd, tasks, openCreate, openDetail } = useApp();
  const navigate = useNavigate();
  if (!cmdOpen) return null;

  const q = (cmdQuery || '').trim().toLowerCase();
  const nav = [
    { kind: 'Переход', label: 'Дашборд', icon: 'dashboard', run: () => { closeCmd(); navigate('/dashboard'); } },
    { kind: 'Переход', label: 'Задачи', icon: 'list', run: () => { closeCmd(); navigate('/tasks'); } },
    { kind: 'Переход', label: 'Календарь', icon: 'calendar', run: () => { closeCmd(); navigate('/calendar'); } },
    { kind: 'Переход', label: 'Профиль', icon: 'user', run: () => { closeCmd(); navigate('/profile'); } },
    { kind: 'Действие', label: 'Создать задачу', icon: 'plus', run: () => { closeCmd(); openCreate(); } },
  ];
  let results;
  if (!q) {
    results = nav;
  } else {
    const navMatch = nav.filter((n) => n.label.toLowerCase().includes(q));
    const taskMatch = tasks
      .filter((t) => (t.title || '').toLowerCase().includes(q) || (t.tags || []).some((x) => x.toLowerCase().includes(q)))
      .slice(0, 6)
      .map((t) => ({
        kind: 'Задача',
        label: t.title,
        icon: 'checkSquare',
        color: PRI[t.priority].color,
        run: () => { closeCmd(); openDetail(t.id); },
      }));
    results = [...navMatch, ...taskMatch];
  }

  return (
    <div
      onClick={closeCmd}
      style={css('position:fixed;inset:0;z-index:85;background:rgba(20,21,28,.42);backdrop-filter:blur(3px);display:flex;align-items:flex-start;justify-content:center;padding:84px 20px;animation:ff .14s ease both')}
    >
      <div onClick={(e) => e.stopPropagation()} style={css('width:100%;max-width:560px;background:var(--surface);border-radius:14px;box-shadow:var(--sh-lg);overflow:hidden;animation:pop .2s cubic-bezier(.2,.9,.3,1) both')}>
        <div style={css('display:flex;align-items:center;gap:11px;padding:15px 17px;border-bottom:1px solid var(--border)')}>
          <Icon name="search" size={18} color="#9a9ca6" />
          <input
            value={cmdQuery}
            onChange={(e) => setCmdQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && results[0]) results[0].run(); }}
            autoFocus
            placeholder="Поиск задач или переход к разделу…"
            style={css('flex:1;border:none;outline:none;font-size:15px;background:transparent;color:var(--text)')}
          />
          <span style={css('font-family:var(--mono);font-size:11px;padding:2px 7px;background:var(--surface-2);border:1px solid var(--border);border-radius:5px;color:var(--text-3)')}>esc</span>
        </div>
        <div style={css('max-height:344px;overflow:auto;padding:8px')}>
          {results.map((c, i) => (
            <Hov as="button" key={i} onClick={c.run} style="display:flex;align-items:center;gap:12px;width:100%;padding:10px 11px;border-radius:9px;text-align:left" styleHover="background:var(--hover)">
              <span style={css('width:30px;height:30px;border-radius:8px;background:var(--surface-2);display:flex;align-items:center;justify-content:center;flex-shrink:0')}>
                <Icon name={c.icon} size={16} color={c.color || '#62636c'} />
              </span>
              <span style={css('flex:1;font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{c.label}</span>
              <span style={css('font-size:11px;color:var(--text-3);font-weight:600;flex-shrink:0')}>{c.kind}</span>
            </Hov>
          ))}
          {results.length === 0 && <div style={css('padding:30px;text-align:center;color:var(--text-3);font-size:14px')}>Ничего не найдено</div>}
        </div>
      </div>
    </div>
  );
}
