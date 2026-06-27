import React from 'react';
import { css, mix } from '../lib/css.js';
import { Hov, Icon } from '../ui.jsx';
import { useApp } from '../store.jsx';
import { taskVM } from '../lib/tasks.js';
import { fmtFull, iso } from '../lib/dates.js';

const BACKDROP = 'position:fixed;inset:0;z-index:80;background:rgba(20,21,28,.45);backdrop-filter:blur(3px);display:flex;align-items:flex-start;justify-content:center;padding:38px 20px;overflow:auto;animation:ff .18s ease both';
const INPUT = 'width:100%;padding:10px 13px;background:var(--surface);border:1px solid var(--border-2);border-radius:9px;font-size:14px;outline:none;transition:all .12s';
const INPUT_FOCUS = 'border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)';
const LABEL = 'display:block;font-size:12.5px;font-weight:600;color:var(--text-2);margin-bottom:6px';
const SELECT = 'width:100%;padding:10px 32px 10px 12px;background:var(--surface);border:1px solid var(--border-2);border-radius:9px;font-size:14px;font-weight:500;outline:none;cursor:pointer;appearance:none';
const stop = (e) => e.stopPropagation();

function TaskFormModal() {
  const { draft, errors, modal, setDraft, addTag, removeTag, saveTask, closeModal } = useApp();
  if (!draft) return null;
  const isEdit = modal && modal.mode === 'edit';
  const titleStyle = mix(INPUT, errors.title && 'border-color:#e5484d');
  return (
    <div style={css(BACKDROP)} onClick={closeModal}>
      <div
        onClick={stop}
        style={css('width:100%;max-width:560px;background:var(--surface);border-radius:16px;box-shadow:var(--sh-lg);margin:auto 0;animation:pop .24s cubic-bezier(.2,.9,.3,1) both')}
      >
        <div style={css('display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid var(--border)')}>
          <h3 style={css('font-size:17px;font-weight:700;margin:0')}>{isEdit ? 'Редактировать задачу' : 'Новая задача'}</h3>
          <Hov as="button" onClick={closeModal} style="width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--text-3)" styleHover="background:var(--hover);color:var(--text)">
            <Icon name="x" size={18} strokeWidth={2.2} />
          </Hov>
        </div>

        <div style={css('padding:20px 22px;display:flex;flex-direction:column;gap:16px')}>
          <label style={css('display:block')}>
            <span style={css(LABEL)}>Название <span style={css('color:#dc2626')}>*</span></span>
            <Hov as="input" autoFocus value={draft.title} onChange={(e) => setDraft('title', e.target.value)} placeholder="Что нужно сделать?" style={titleStyle} styleFocus={INPUT_FOCUS} />
            {errors.title && <span style={css('display:block;font-size:12.5px;color:#dc2626;margin-top:6px;font-weight:500')}>{errors.title}</span>}
          </label>

          <label style={css('display:block')}>
            <span style={mix(LABEL, 'display:flex;align-items:center;justify-content:space-between')}>
              <span>Описание</span>
              <span style={css('font-family:var(--mono);font-size:11px;color:var(--text-3);font-weight:500')}>{(draft.description || '').length}/1000</span>
            </span>
            <Hov as="textarea" value={draft.description} onChange={(e) => setDraft('description', e.target.value)} placeholder="Детали задачи…" rows={3} style="width:100%;padding:10px 12px;background:var(--surface);border:1px solid var(--border-2);border-radius:9px;font-size:14px;outline:none;resize:vertical;min-height:74px;transition:all .12s" styleFocus={INPUT_FOCUS} />
            {errors.description && <span style={css('display:block;font-size:12.5px;color:#dc2626;margin-top:6px;font-weight:500')}>{errors.description}</span>}
          </label>

          <div style={css('display:grid;grid-template-columns:1fr 1fr;gap:14px')}>
            <label style={css('display:block')}>
              <span style={css(LABEL)}>Статус</span>
              <div style={css('position:relative')}>
                <select value={draft.status} onChange={(e) => setDraft('status', e.target.value)} style={css(SELECT)}>
                  <option value="todo">К выполнению</option>
                  <option value="in_progress">В работе</option>
                  <option value="done">Выполнено</option>
                  <option value="archived">В архиве</option>
                </select>
                <span style={css('position:absolute;right:11px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--text-3)')}><Icon name="chevronDown" size={14} strokeWidth={2.4} /></span>
              </div>
            </label>
            <label style={css('display:block')}>
              <span style={css(LABEL)}>Приоритет</span>
              <div style={css('position:relative')}>
                <select value={draft.priority} onChange={(e) => setDraft('priority', e.target.value)} style={css(SELECT)}>
                  <option value="low">Низкий</option>
                  <option value="medium">Средний</option>
                  <option value="high">Высокий</option>
                  <option value="critical">Критичный</option>
                </select>
                <span style={css('position:absolute;right:11px;top:50%;transform:translateY(-50%);pointer-events:none;color:var(--text-3)')}><Icon name="chevronDown" size={14} strokeWidth={2.4} /></span>
              </div>
            </label>
          </div>

          <div style={css('display:grid;grid-template-columns:1fr 1fr;gap:14px')}>
            <label style={css('display:block')}>
              <span style={css(LABEL)}>Дедлайн</span>
              <Hov as="input" type="date" value={draft.dueDate} onChange={(e) => setDraft('dueDate', e.target.value)} style="width:100%;padding:9px 12px;background:var(--surface);border:1px solid var(--border-2);border-radius:9px;font-size:14px;outline:none;font-family:var(--sans);color:var(--text)" styleFocus={INPUT_FOCUS} />
            </label>
            <label style={css('display:block')}>
              <span style={css(LABEL)}>Дата в календаре</span>
              <Hov as="input" type="date" value={draft.calendarDate} onChange={(e) => setDraft('calendarDate', e.target.value)} style="width:100%;padding:9px 12px;background:var(--surface);border:1px solid var(--border-2);border-radius:9px;font-size:14px;outline:none;font-family:var(--sans);color:var(--text)" styleFocus={INPUT_FOCUS} />
            </label>
          </div>

          <div style={css('display:grid;grid-template-columns:1fr 1fr;gap:14px')}>
            <label style={css('display:block')}>
              <span style={css(LABEL)}>Время начала</span>
              <Hov as="input" type="time" value={draft.startTime} onChange={(e) => setDraft('startTime', e.target.value)} style="width:100%;padding:9px 12px;background:var(--surface);border:1px solid var(--border-2);border-radius:9px;font-size:14px;outline:none;font-family:var(--sans);color:var(--text)" styleFocus={INPUT_FOCUS} />
            </label>
            <label style={css('display:block')}>
              <span style={css(LABEL)}>Время окончания</span>
              <Hov as="input" type="time" value={draft.endTime} onChange={(e) => setDraft('endTime', e.target.value)} style={mix('width:100%;padding:9px 12px;background:var(--surface);border-radius:9px;font-size:14px;outline:none;font-family:var(--sans);color:var(--text)', errors.endTime ? 'border:1px solid #e5484d' : 'border:1px solid var(--border-2)')} styleFocus={INPUT_FOCUS} />
              {errors.endTime && <span style={css('display:block;font-size:12.5px;color:#dc2626;margin-top:6px;font-weight:500')}>{errors.endTime}</span>}
            </label>
          </div>

          <div>
            <span style={css(LABEL)}>Теги</span>
            <div style={css('display:flex;flex-wrap:wrap;gap:7px;align-items:center;padding:7px 9px;background:var(--surface);border:1px solid var(--border-2);border-radius:9px;min-height:42px')}>
              {draft.tags.map((tag) => (
                <span key={tag} style={css('display:inline-flex;align-items:center;gap:5px;padding:3px 5px 3px 9px;background:var(--accent-soft);color:var(--accent-text);border-radius:6px;font-size:12.5px;font-weight:600')}>
                  #{tag}
                  <Hov as="button" onClick={() => removeTag(tag)} style="width:16px;height:16px;border-radius:4px;display:flex;align-items:center;justify-content:center;color:var(--accent-text)" styleHover="background:var(--accent-soft-2)">
                    <Icon name="x" size={11} strokeWidth={2.6} />
                  </Hov>
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
                style={css('flex:1;min-width:110px;border:none;outline:none;background:transparent;font-size:13.5px;padding:3px 2px')}
              />
            </div>
          </div>
        </div>

        <div style={css('display:flex;align-items:center;justify-content:flex-end;gap:10px;padding:16px 22px;border-top:1px solid var(--border)')}>
          <Hov as="button" onClick={closeModal} style="padding:10px 18px;font-weight:600;font-size:14px;color:var(--text-2);background:var(--surface);border:1px solid var(--border-2);border-radius:9px" styleHover="background:var(--hover)">Отмена</Hov>
          <Hov as="button" onClick={saveTask} style="display:flex;align-items:center;gap:7px;padding:10px 20px;font-weight:700;font-size:14px;color:#fff;background:var(--accent);border-radius:9px;box-shadow:0 3px 9px rgba(79,70,229,.24)" styleHover="background:var(--accent-h)">
            <Icon name="check" size={16} strokeWidth={2.3} />
            {isEdit ? 'Сохранить' : 'Создать'}
          </Hov>
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
  const META = 'background:var(--surface);padding:12px 14px';
  const METAK = 'font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.05em;margin-bottom:4px';
  const METAV = 'font-size:13.5px;font-weight:600';
  return (
    <div style={css(BACKDROP)} onClick={closeModal}>
      <div onClick={stop} style={css('width:100%;max-width:540px;background:var(--surface);border-radius:16px;box-shadow:var(--sh-lg);margin:auto 0;animation:pop .24s cubic-bezier(.2,.9,.3,1) both;overflow:hidden')}>
        <div style={mix('height:5px', { background: vm.priColor })} />
        <div style={css('display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:20px 22px 0')}>
          <div style={css('flex:1;min-width:0')}>
            <div style={css('display:flex;align-items:center;gap:8px;margin-bottom:9px')}>
              <span style={mix('display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:7px;font-size:12px;font-weight:600', { color: vm.stColor, background: vm.stSoft })}>
                <span style={mix('width:6px;height:6px;border-radius:50%', { background: vm.stDot })} />
                {vm.stLabel}
              </span>
              <span style={mix('display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:7px;font-size:12px;font-weight:600', { color: vm.priColor, background: vm.priSoft })}>{vm.priLabel} приоритет</span>
            </div>
            <h3 style={mix('font-size:20px;font-weight:800;margin:0;letter-spacing:-.02em;line-height:1.3', vm.isDone && 'text-decoration:line-through;color:var(--text-3)')}>{vm.title}</h3>
          </div>
          <Hov as="button" onClick={closeModal} style="width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--text-3);flex-shrink:0" styleHover="background:var(--hover);color:var(--text)">
            <Icon name="x" size={18} strokeWidth={2.2} />
          </Hov>
        </div>
        <div style={css('padding:16px 22px 20px')}>
          {vm.hasDesc && <p style={css('font-size:14.5px;color:var(--text-2);line-height:1.6;margin:0 0 18px')}>{vm.description}</p>}
          <div style={css('display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--border);border:1px solid var(--border);border-radius:11px;overflow:hidden')}>
            <div style={css(META)}><div style={css(METAK)}>Дедлайн</div><div style={css(METAV)}>{t.dueDate ? fmtFull(t.dueDate) : 'Не указан'}</div></div>
            <div style={css(META)}><div style={css(METAK)}>В календаре</div><div style={css(METAV)}>{t.calendarDate ? fmtFull(t.calendarDate) : 'Не указана'}</div></div>
            <div style={css(META)}><div style={css(METAK)}>Время</div><div style={css(METAV)}>{vm.time || 'Не указано'}</div></div>
            <div style={css(META)}><div style={css(METAK)}>Создано</div><div style={css(METAV)}>{created}</div></div>
          </div>
          {vm.hasTags && (
            <div style={css('display:flex;flex-wrap:wrap;gap:6px;margin-top:14px')}>
              {vm.tags.map((tag) => (
                <span key={tag} style={css('font-family:var(--mono);font-size:11.5px;font-weight:500;color:var(--text-2);padding:3px 9px;background:var(--surface-2);border-radius:6px')}>#{tag}</span>
              ))}
            </div>
          )}
        </div>
        <div style={css('display:flex;align-items:center;gap:9px;padding:14px 22px;border-top:1px solid var(--border)')}>
          {vm.isDone ? (
            <Hov as="button" onClick={() => { reopenTask(t.id); closeModal(); }} style="display:flex;align-items:center;gap:7px;padding:9px 16px;font-weight:600;font-size:13.5px;color:var(--text);background:var(--surface);border:1px solid var(--border-2);border-radius:9px" styleHover="background:var(--hover)">
              <Icon name="refresh" size={15} />Вернуть в работу
            </Hov>
          ) : (
            <Hov as="button" onClick={() => { completeTask(t.id); closeModal(); }} style="display:flex;align-items:center;gap:7px;padding:9px 16px;font-weight:700;font-size:13.5px;color:#fff;background:#16a34a;border-radius:9px;box-shadow:0 3px 9px rgba(22,163,74,.22)" styleHover="background:#15803d">
              <Icon name="check" size={15} strokeWidth={2.4} />Завершить
            </Hov>
          )}
          <span style={css('flex:1')} />
          <Hov as="button" title="Редактировать" onClick={() => openEdit(t.id)} style="width:38px;height:38px;border-radius:9px;display:flex;align-items:center;justify-content:center;color:var(--text-2);background:var(--surface);border:1px solid var(--border-2)" styleHover="background:var(--hover);color:var(--text)">
            <Icon name="edit" size={17} />
          </Hov>
          <Hov as="button" title="Удалить" onClick={() => openConfirm(t.id)} style="width:38px;height:38px;border-radius:9px;display:flex;align-items:center;justify-content:center;color:#dc2626;background:#fdeaea" styleHover="background:#fbdcdc">
            <Icon name="trash" size={17} />
          </Hov>
        </div>
      </div>
    </div>
  );
}

function ConfirmDeleteModal() {
  const { tasks, modal, closeModal, deleteTaskConfirmed } = useApp();
  const t = tasks.find((x) => x.id === modal.id);
  return (
    <div style={css('position:fixed;inset:0;z-index:82;background:rgba(20,21,28,.45);backdrop-filter:blur(3px);display:flex;align-items:center;justify-content:center;padding:20px;animation:ff .16s ease both')} onClick={closeModal}>
      <div onClick={stop} style={css('width:100%;max-width:400px;background:var(--surface);border-radius:16px;box-shadow:var(--sh-lg);padding:26px;text-align:center;animation:pop .22s cubic-bezier(.2,.9,.3,1) both')}>
        <div style={css('width:52px;height:52px;border-radius:14px;background:#fdeaea;display:flex;align-items:center;justify-content:center;margin:0 auto 14px')}>
          <Icon name="trash" size={26} color="#dc2626" />
        </div>
        <h3 style={css('font-size:18px;font-weight:700;margin:0')}>Удалить задачу?</h3>
        <p style={css('color:var(--text-2);margin:8px 0 0;font-size:14px;line-height:1.5')}>
          «<b style={css('color:var(--text)')}>{t ? t.title : ''}</b>» будет удалена безвозвратно.
        </p>
        <div style={css('display:flex;gap:10px;margin-top:22px')}>
          <Hov as="button" onClick={closeModal} style="flex:1;padding:11px;font-weight:600;font-size:14px;color:var(--text);background:var(--surface);border:1px solid var(--border-2);border-radius:9px" styleHover="background:var(--hover)">Отмена</Hov>
          <Hov as="button" onClick={deleteTaskConfirmed} style="flex:1;padding:11px;font-weight:700;font-size:14px;color:#fff;background:#dc2626;border-radius:9px;box-shadow:0 3px 9px rgba(220,38,38,.24)" styleHover="background:#b91c1c">Удалить</Hov>
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
