import React from 'react';
import { css, mix } from '../lib/css.js';
import { Hov, Icon } from '../ui.jsx';
import { useApp } from '../store.jsx';

const BADGE = 'display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:7px;font-size:12px;font-weight:600;';

export default function TaskCard({ vm }) {
  const { openDetail, openEdit, openConfirm, completeTask, reopenTask } = useApp();

  const checkStyle = vm.isDone
    ? 'width:21px;height:21px;border-radius:6px;background:#16a34a;border:2px solid #16a34a;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#fff;cursor:pointer'
    : 'width:21px;height:21px;border-radius:6px;border:2px solid var(--border-2);background:var(--surface);flex-shrink:0;cursor:pointer;display:flex;align-items:center;justify-content:center;color:transparent';
  const checkHover = vm.isDone ? 'opacity:0.85' : 'border-color:#16a34a;background:#e7f6ed';

  const toggle = (e) => {
    e.stopPropagation();
    vm.isDone ? reopenTask(vm.id) : completeTask(vm.id);
  };
  const edit = (e) => {
    e.stopPropagation();
    openEdit(vm.id);
  };
  const del = (e) => {
    e.stopPropagation();
    openConfirm(vm.id);
  };

  return (
    <Hov
      onClick={() => openDetail(vm.id)}
      style="display:flex;gap:13px;padding:14px 15px;background:var(--surface);border:1px solid var(--border);border-radius:12px;box-shadow:var(--sh-sm);cursor:pointer;transition:box-shadow .14s,border-color .14s"
      styleHover="box-shadow:var(--sh-md);border-color:var(--border-2)"
    >
      <Hov as="button" title="Завершить" onClick={toggle} style={checkStyle} styleHover={checkHover}>
        <Icon name="check" size={13} strokeWidth={3} />
      </Hov>
      <span style={mix('width:4px;align-self:stretch;border-radius:4px;flex-shrink:0', { background: vm.priColor })} />
      <div style={css('flex:1;min-width:0')}>
        <div
          style={mix(
            'font-weight:650;font-size:15px;line-height:1.35',
            vm.isDone && 'text-decoration:line-through;color:var(--text-3)'
          )}
        >
          {vm.title}
        </div>
        {vm.hasDesc && (
          <p style={css('font-size:13px;color:var(--text-2);margin:3px 0 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>
            {vm.description}
          </p>
        )}
        <div style={css('display:flex;flex-wrap:wrap;gap:6px;margin-top:9px;align-items:center')}>
          <span style={mix(BADGE, { color: vm.stColor, background: vm.stSoft })}>
            <span style={mix('width:6px;height:6px;border-radius:50%', { background: vm.stDot })} />
            {vm.stLabel}
          </span>
          <span style={mix(BADGE, { color: vm.priColor, background: vm.priSoft })}>{vm.priLabel}</span>
          {vm.hasDue && (
            <span style={mix(BADGE, { color: vm.dueColor, background: vm.dueBg })}>
              <Icon name="clock" size={12} strokeWidth={2.2} />
              {vm.dueText}
            </span>
          )}
          {vm.hasCal && (
            <span style={mix(BADGE, 'color:var(--text-2);background:var(--surface-2)')}>
              <Icon name="calendar" size={12} />
              {vm.cal}
            </span>
          )}
          {vm.tags.map((tag) => (
            <span
              key={tag}
              style={css('font-family:var(--mono);font-size:11px;font-weight:500;color:var(--text-3);padding:2px 7px;background:var(--surface-2);border-radius:6px')}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
      <div style={css('display:flex;align-items:flex-start;gap:3px;flex-shrink:0')}>
        <Hov
          as="button"
          title="Редактировать"
          onClick={edit}
          style="width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--text-3)"
          styleHover="background:var(--hover);color:var(--text)"
        >
          <Icon name="edit" size={16} />
        </Hov>
        <Hov
          as="button"
          title="Удалить"
          onClick={del}
          style="width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--text-3)"
          styleHover="background:#fdeaea;color:#dc2626"
        >
          <Icon name="trash" size={16} />
        </Hov>
      </div>
    </Hov>
  );
}
