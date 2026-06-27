import './CommandPalette.css';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../ui.jsx';
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
    <div onClick={closeCmd} className="cmdp-overlay">
      <div onClick={(e) => e.stopPropagation()} className="cmdp-panel">
        <div className="cmdp-search">
          <Icon name="search" size={18} color="#9a9ca6" />
          <input
            value={cmdQuery}
            onChange={(e) => setCmdQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && results[0]) results[0].run(); }}
            autoFocus
            placeholder="Поиск задач или переход к разделу…"
            className="cmdp-input"
          />
          <span className="cmdp-kbd">esc</span>
        </div>
        <div className="cmdp-list">
          {results.map((c, i) => (
            <button className="cmd-item" key={i} onClick={c.run}>
              <span className="cmdp-item-icon">
                <Icon name={c.icon} size={16} color={c.color || '#62636c'} />
              </span>
              <span className="cmdp-item-label">{c.label}</span>
              <span className="cmdp-item-kind">{c.kind}</span>
            </button>
          ))}
          {results.length === 0 && <div className="cmdp-empty">Ничего не найдено</div>}
        </div>
      </div>
    </div>
  );
}
