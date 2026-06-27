import './TaskCard.css';
import React from 'react';
import { Icon } from '../ui.jsx';
import { useApp } from '../store.jsx';

export default function TaskCard({ vm }) {
  const { openDetail, openEdit, openConfirm, completeTask, reopenTask } = useApp();

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
    <div
      onClick={() => openDetail(vm.id)}
      className="card card--hover tc-card"
    >
      <button type="button" title="Завершить" onClick={toggle} className={'task-check' + (vm.isDone ? ' is-done' : '')}>
        <Icon name="check" size={13} strokeWidth={3} />
      </button>
      <span className="tc-bar" style={{ '--bar': vm.priColor }} />
      <div className="tc-body">
        <div className={'tc-title' + (vm.isDone ? ' is-done' : '')}>
          {vm.title}
        </div>
        {vm.hasDesc && (
          <p className="tc-desc">
            {vm.description}
          </p>
        )}
        <div className="tc-meta">
          <span className="badge" style={{ color: vm.stColor, background: vm.stSoft }}>
            <span className="badge-dot" style={{ background: vm.stDot }} />
            {vm.stLabel}
          </span>
          <span className="badge" style={{ color: vm.priColor, background: vm.priSoft }}>{vm.priLabel}</span>
          {vm.hasDue && (
            <span className="badge" style={{ color: vm.dueColor, background: vm.dueBg }}>
              <Icon name="clock" size={12} strokeWidth={2.2} />
              {vm.dueText}
            </span>
          )}
          {vm.hasCal && (
            <span className="badge tc-cal-badge">
              <Icon name="calendar" size={12} />
              {vm.cal}
            </span>
          )}
          {vm.tags.map((tag) => (
            <span key={tag} className="tag">#{tag}</span>
          ))}
        </div>
      </div>
      <div className="tc-actions">
        <button type="button" title="Редактировать" onClick={edit} className="icon-btn tc-icon-btn">
          <Icon name="edit" size={16} />
        </button>
        <button type="button" title="Удалить" onClick={del} className="icon-btn icon-btn--danger tc-icon-btn">
          <Icon name="trash" size={16} />
        </button>
      </div>
    </div>
  );
}
