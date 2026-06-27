import React from 'react';
import './Modals.css';
import { Icon } from '../ui.jsx';
import { useApp } from '../store.jsx';
import { taskVM } from '../lib/tasks.js';
import { fmtFull, iso } from '../lib/dates.js';

const stop = (e) => e.stopPropagation();

function TaskFormModal() {
  const { draft, errors, modal, setDraft, addTag, removeTag, saveTask, closeModal } = useApp();
  if (!draft) return null;
  const isEdit = modal && modal.mode === 'edit';
  return (
    <div className="modal-backdrop modal-backdrop--top" onClick={closeModal}>
      <div onClick={stop} className="modal mod-form">
        <div className="modal__head">
          <h3 className="modal__title">{isEdit ? 'Редактировать задачу' : 'Новая задача'}</h3>
          <button onClick={closeModal} className="icon-btn mod-close">
            <Icon name="x" size={18} strokeWidth={2.2} />
          </button>
        </div>

        <div className="modal__body">
          <label className="mod-field">
            <span className="form-label form-label--sm">Название <span className="mod-req">*</span></span>
            <input autoFocus value={draft.title} onChange={(e) => setDraft('title', e.target.value)} placeholder="Что нужно сделать?" className={'input' + (errors.title ? ' is-error' : '')} />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </label>

          <label className="mod-field">
            <span className="form-label form-label--sm mod-desc-label">
              <span>Описание</span>
              <span className="mod-counter">{(draft.description || '').length}/1000</span>
            </span>
            <textarea value={draft.description} onChange={(e) => setDraft('description', e.target.value)} placeholder="Детали задачи…" rows={3} className="textarea" />
            {errors.description && <span className="field-error">{errors.description}</span>}
          </label>

          <div className="mod-grid2">
            <label className="mod-field">
              <span className="form-label form-label--sm">Статус</span>
              <div className="select-wrap">
                <select value={draft.status} onChange={(e) => setDraft('status', e.target.value)} className="select">
                  <option value="todo">К выполнению</option>
                  <option value="in_progress">В работе</option>
                  <option value="done">Выполнено</option>
                  <option value="archived">В архиве</option>
                </select>
                <span className="select-caret"><Icon name="chevronDown" size={14} strokeWidth={2.4} /></span>
              </div>
            </label>
            <label className="mod-field">
              <span className="form-label form-label--sm">Приоритет</span>
              <div className="select-wrap">
                <select value={draft.priority} onChange={(e) => setDraft('priority', e.target.value)} className="select">
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                  <option value="critical">Критичный</option>
                </select>
                <span className="select-caret"><Icon name="chevronDown" size={14} strokeWidth={2.4} /></span>
              </div>
            </label>
          </div>

          <div className="mod-grid2">
            <label className="mod-field">
              <span className="form-label form-label--sm">Дедлайн</span>
              <input type="date" value={draft.dueDate} onChange={(e) => setDraft('dueDate', e.target.value)} className="input mod-dt" />
            </label>
            <label className="mod-field">
              <span className="form-label form-label--sm">Дата в календаре</span>
              <input type="date" value={draft.calendarDate} onChange={(e) => setDraft('calendarDate', e.target.value)} className="input mod-dt" />
            </label>
          </div>

          <div className="mod-grid2">
            <label className="mod-field">
              <span className="form-label form-label--sm">Время начала</span>
              <input type="time" value={draft.startTime} onChange={(e) => setDraft('startTime', e.target.value)} className="input mod-dt" />
            </label>
            <label className="mod-field">
              <span className="form-label form-label--sm">Время окончания</span>
              <input type="time" value={draft.endTime} onChange={(e) => setDraft('endTime', e.target.value)} className={'input mod-dt' + (errors.endTime ? ' is-error' : '')} />
              {errors.endTime && <span className="field-error">{errors.endTime}</span>}
            </label>
          </div>

          <div>
            <span className="form-label form-label--sm">Теги</span>
            <div className="mod-tags">
              {draft.tags.map((tag) => (
                <span key={tag} className="tag-pill">
                  #{tag}
                  <button onClick={() => removeTag(tag)} className="tag-pill__x">
                    <Icon name="x" size={11} strokeWidth={2.6} />
                  </button>
                </span>
              ))}
              <input
                value={draft.tagInput}
                onChange={(e) => setDraft('tagInput', e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Добавить тег…"
                className="mod-taginput"
              />
            </div>
          </div>
        </div>

        <div className="modal__foot">
          <button onClick={closeModal} className="btn btn--ghost mod-cancel">Отмена</button>
          <button onClick={saveTask} className="btn btn--primary btn--md">
            <Icon name="check" size={16} strokeWidth={2.3} />
            {isEdit ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </div>
    </div>
  );
}

function TaskDetailModal() {
  const { tasks, modal, closeModal, openEdit, openConfirm, completeTask, reopenTask } = useApp();
  const t = tasks.find((x) => x.id === modal.id);
  if (!t) return null;
  const vm = taskVM(t);
  const created = fmtFull(iso(new Date(t.createdAt)));
  return (
    <div className="modal-backdrop modal-backdrop--top" onClick={closeModal}>
      <div onClick={stop} className="modal mod-detail">
        <div className="mod-bar" style={{ '--c': vm.priColor }} />
        <div className="mod-detail-head">
          <div className="mod-detail-head-main">
            <div className="mod-badges">
              <span className="badge" style={{ color: vm.stColor, background: vm.stSoft }}>
                <span className="badge-dot" style={{ background: vm.stDot }} />
                {vm.stLabel}
              </span>
              <span className="badge" style={{ color: vm.priColor, background: vm.priSoft }}>{vm.priLabel} приоритет</span>
            </div>
            <h3 className={'mod-detail-title' + (vm.isDone ? ' is-done' : '')}>{vm.title}</h3>
          </div>
          <button onClick={closeModal} className="icon-btn mod-close">
            <Icon name="x" size={18} strokeWidth={2.2} />
          </button>
        </div>
        <div className="mod-detail-body">
          {vm.hasDesc && <p className="mod-desc">{vm.description}</p>}
          <div className="mod-metagrid">
            <div className="mod-meta"><div className="mod-meta-k">Дедлайн</div><div className="mod-meta-v">{t.dueDate ? fmtFull(t.dueDate) : 'Не указан'}</div></div>
            <div className="mod-meta"><div className="mod-meta-k">В календаре</div><div className="mod-meta-v">{t.calendarDate ? fmtFull(t.calendarDate) : 'Не указана'}</div></div>
            <div className="mod-meta"><div className="mod-meta-k">Время</div><div className="mod-meta-v">{vm.time || 'Не указано'}</div></div>
            <div className="mod-meta"><div className="mod-meta-k">Создано</div><div className="mod-meta-v">{created}</div></div>
          </div>
          {vm.hasTags && (
            <div className="mod-detail-tags">
              {vm.tags.map((tag) => (
                <span key={tag} className="mod-detail-tag">#{tag}</span>
              ))}
            </div>
          )}
        </div>
        <div className="mod-detail-foot">
          {vm.isDone ? (
            <button onClick={() => { reopenTask(t.id); closeModal(); }} className="btn btn--ghost mod-foot-action">
              <Icon name="refresh" size={15} />Вернуть в работу
            </button>
          ) : (
            <button onClick={() => { completeTask(t.id); closeModal(); }} className="btn btn--success mod-foot-action--success">
              <Icon name="check" size={15} strokeWidth={2.4} />Завершить
            </button>
          )}
          <span className="mod-spacer" />
          <button title="Редактировать" onClick={() => openEdit(t.id)} className="btn btn--ghost mod-icon-action">
            <Icon name="edit" size={17} />
          </button>
          <button title="Удалить" onClick={() => openConfirm(t.id)} className="btn btn--soft-danger mod-icon-action--danger">
            <Icon name="trash" size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ConfirmDeleteModal() {
  const { tasks, modal, closeModal, deleteTaskConfirmed } = useApp();
  const t = tasks.find((x) => x.id === modal.id);
  return (
    <div className="modal-backdrop modal-backdrop--center mod-confirm-backdrop" onClick={closeModal}>
      <div onClick={stop} className="modal mod-confirm">
        <div className="mod-confirm-icon">
          <Icon name="trash" size={26} color="#dc2626" />
        </div>
        <h3 className="mod-confirm-title">Удалить задачу?</h3>
        <p className="mod-confirm-text">
          «<b className="mod-confirm-name">{t ? t.title : ''}</b>» будет удалена безвозвратно.
        </p>
        <div className="mod-confirm-actions">
          <button onClick={closeModal} className="btn btn--ghost mod-confirm-btn">Отмена</button>
          <button onClick={deleteTaskConfirmed} className="btn btn--danger mod-confirm-btn--danger">Удалить</button>
        </div>
      </div>
    </div>
  );
}

export default function Modals() {
  const { modal } = useApp();
  if (!modal) return null;
  if (modal.type === 'form') return <TaskFormModal />;
  if (modal.type === 'detail') return <TaskDetailModal />;
  if (modal.type === 'confirm') return <ConfirmDeleteModal />;
  return null;
}
