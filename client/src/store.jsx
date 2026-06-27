// Global app store: auth, tasks, filters, calendar, modals, toasts, settings.
// Domain data (user, tasks) comes from the backend REST API via src/api/*.
// Only UI preferences (settings) are persisted locally. The public shape of
// `useApp()` is intentionally stable so page/components need no changes.
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { uid } from './lib/dates.js';
import { ApiError } from './api/client.js';
import * as authApi from './api/auth.js';
import * as tasksApi from './api/tasks.js';
import * as settingsApi from './api/settings.js';

const SETTINGS_KEY = 'taskflow.settings.v1';

// Demo account convenience login. These credentials match the server seed
// (server/.env: SEED_DEMO_EMAIL / SEED_DEMO_PASSWORD). For a public demo this is
// intentional; change both sides for a private deployment.
const DEMO_EMAIL = 'demo@taskflow.app';
const DEMO_PASSWORD = 'demo1234';

const DEFAULT_SETTINGS = {
  firstDay: 'mon',
  showCompleted: true,
  dashCount: 6,
  dateFormat: 'dmy',
  theme: 'light',
};

const DEFAULT_FILTERS = {
  status: 'all',
  priority: 'all',
  search: '',
  onlyOverdue: false,
  onlyToday: false,
};

function loadSettings() {
  try {
    const raw = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
    if (raw) return { ...DEFAULT_SETTINGS, ...raw };
  } catch {
    /* ignore */
  }
  return DEFAULT_SETTINGS;
}

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

const emailValid = (e) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);

export function AppProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState(null);
  const [settings, setSettings] = useState(useMemo(loadSettings, []));

  const [bootstrapping, setBootstrapping] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasksError, setTasksError] = useState(null);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sort, setSort] = useState('created_desc');
  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth());

  const [modal, setModal] = useState(null); // {type:'form'|'detail'|'confirm', mode, id}
  const [draft, setDraftState] = useState(null);
  const [errors, setErrors] = useState({});

  const [toasts, setToasts] = useState([]);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [cmdQuery, setCmdQuery] = useState('');
  const [forcedTasks, setForcedTasks] = useState('normal');
  const [loading, setLoading] = useState(false);

  const [authForm, setAuthForm] = useState({ name: '', email: DEMO_EMAIL, password: '', confirm: '' });
  const [authErrors, setAuthErrors] = useState({});

  // Persist UI settings to localStorage as an instant-load cache. The server is
  // the source of truth (synced below); this cache just avoids a flash of
  // defaults before the server responds, and works offline.
  useEffect(() => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      /* ignore quota / private mode errors */
    }
  }, [settings]);

  // Debounced server sync for settings. Accumulates changed fields and flushes
  // a single PATCH so dragging a slider doesn't spam the API.
  const settingsSaveTimer = useRef(null);
  const pendingSettings = useRef({});

  const loadServerSettings = async () => {
    try {
      const s = await settingsApi.getSettings();
      setSettings((prev) => ({ ...prev, ...s }));
    } catch {
      /* keep the localStorage cache if the server is unreachable */
    }
  };

  // ---- toasts ----
  const toast = (type, message) => {
    const id = uid();
    setToasts((t) => [...t, { id, type, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  };
  const dismissToast = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  // ---- task list helpers ----
  const upsertLocal = (task) =>
    setTasks((list) => {
      const i = list.findIndex((t) => t.id === task.id);
      if (i === -1) return [task, ...list];
      const next = list.slice();
      next[i] = task;
      return next;
    });
  const removeLocal = (id) => setTasks((list) => list.filter((t) => t.id !== id));

  const fetchTasks = async () => {
    setTasksLoading(true);
    setTasksError(null);
    try {
      const list = await tasksApi.listTasks();
      setTasks(list);
    } catch (e) {
      setTasksError(e.message || 'Не удалось загрузить задачи');
      throw e;
    } finally {
      setTasksLoading(false);
    }
  };
  const reloadTasks = async () => {
    setForcedTasks('normal');
    try {
      await fetchTasks();
    } catch {
      /* error surfaced via tasksError */
    }
  };

  // ---- session bootstrap (restore from stored token on first load) ----
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!authApi.hasToken()) {
        setBootstrapping(false);
        return;
      }
      try {
        const u = await authApi.getCurrentUser();
        if (cancelled) return;
        setUser(u);
        setIsAuth(true);
        await Promise.all([fetchTasks(), loadServerSettings()]);
      } catch {
        // Invalid/expired token — clear and fall back to logged-out state.
        authApi.logout();
        if (!cancelled) {
          setIsAuth(false);
          setUser(null);
        }
      } finally {
        if (!cancelled) setBootstrapping(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // ---- auth ----
  const setAuthField = (field, val) => {
    setAuthForm((f) => ({ ...f, [field]: val }));
    setAuthErrors((e) => ({ ...e, [field]: undefined, form: undefined }));
  };

  // Shared post-login routine: store user, load tasks, greet.
  const onAuthSuccess = async (u) => {
    setUser(u);
    setIsAuth(true);
    setAuthErrors({});
    setLoading(true);
    try {
      await Promise.all([fetchTasks(), loadServerSettings()]);
    } catch {
      /* tasksError handles the message */
    } finally {
      setLoading(false);
    }
    toast('success', 'С возвращением, ' + (u.name || '').split(' ')[0] + '!');
  };

  // Map a thrown ApiError to authErrors. Returns false for chaining.
  const handleAuthError = (e) => {
    if (e instanceof ApiError && e.fields) setAuthErrors(e.fields);
    else if (e instanceof ApiError && e.status === 409) setAuthErrors({ email: e.message });
    else setAuthErrors({ form: e.message || 'Не удалось выполнить вход. Попробуйте ещё раз.' });
    return false;
  };

  const loginSubmit = async () => {
    const { email, password } = authForm;
    const err = {};
    if (!email.trim()) err.email = 'Введите email';
    else if (!emailValid(email)) err.email = 'Некорректный email';
    if (!password) err.password = 'Введите пароль';
    if (Object.keys(err).length) {
      setAuthErrors(err);
      return false;
    }
    try {
      const u = await authApi.login({ email: email.trim(), password });
      await onAuthSuccess(u);
      return true;
    } catch (e) {
      return handleAuthError(e);
    }
  };

  const registerSubmit = async () => {
    const { name, email, password, confirm } = authForm;
    const err = {};
    if (!name.trim()) err.name = 'Введите имя';
    else if (name.trim().length < 2) err.name = 'Минимум 2 символа';
    if (!email.trim()) err.email = 'Введите email';
    else if (!emailValid(email)) err.email = 'Некорректный email';
    if (!password) err.password = 'Введите пароль';
    else if (password.length < 8) err.password = 'Минимум 8 символов';
    else if (!/[a-zа-я]/i.test(password) || !/\d/.test(password)) err.password = 'Нужны буква и цифра';
    if (!confirm) err.confirm = 'Повторите пароль';
    else if (confirm !== password) err.confirm = 'Пароли не совпадают';
    if (Object.keys(err).length) {
      setAuthErrors(err);
      return false;
    }
    try {
      const u = await authApi.register({ name: name.trim(), email: email.trim(), password });
      await onAuthSuccess(u);
      return true;
    } catch (e) {
      return handleAuthError(e);
    }
  };

  const demoLogin = async () => {
    setAuthForm((f) => ({ ...f, email: DEMO_EMAIL }));
    try {
      const u = await authApi.login({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
      await onAuthSuccess(u);
      return true;
    } catch (e) {
      return handleAuthError(e);
    }
  };

  const logout = () => {
    authApi.logout(); // best-effort server call + clears stored token
    setIsAuth(false);
    setUser(null);
    setTasks([]);
    setModal(null);
    setCmdOpen(false);
    setTasksError(null);
    toast('info', 'Вы вышли из аккаунта');
  };

  // ---- task CRUD ----
  const blankDraft = (presetDate) => ({
    id: null, title: '', description: '', status: 'todo', priority: 'medium',
    dueDate: '', calendarDate: presetDate || '', startTime: '', endTime: '', tags: [], tagInput: '',
  });
  const openCreate = (presetDate) => {
    setDraftState(blankDraft(presetDate));
    setErrors({});
    setModal({ type: 'form', mode: 'create' });
  };
  const openEdit = (id) => {
    const t = tasks.find((x) => x.id === id);
    if (!t) return;
    setDraftState({
      id: t.id, title: t.title, description: t.description || '', status: t.status, priority: t.priority,
      dueDate: t.dueDate || '', calendarDate: t.calendarDate || '', startTime: t.startTime || '',
      endTime: t.endTime || '', tags: [...(t.tags || [])], tagInput: '',
    });
    setErrors({});
    setModal({ type: 'form', mode: 'edit', id });
  };
  const openDetail = (id) => setModal({ type: 'detail', id });
  const openConfirm = (id) => setModal({ type: 'confirm', id });
  const closeModal = () => {
    setModal(null);
    setDraftState(null);
    setErrors({});
  };
  const setDraft = (field, val) => {
    setDraftState((d) => ({ ...d, [field]: val }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };
  const addTag = () => {
    setDraftState((d) => {
      const v = (d.tagInput || '').trim().replace(/,$/, '');
      if (!v) return { ...d, tagInput: '' };
      if (d.tags.includes(v)) return { ...d, tagInput: '' };
      return { ...d, tags: [...d.tags, v], tagInput: '' };
    });
  };
  const removeTag = (tag) => setDraftState((d) => ({ ...d, tags: d.tags.filter((t) => t !== tag) }));

  const saveTask = async () => {
    const d = draft;
    if (!d) return false;
    // Client-side validation first (mirrors the server rules) — keeps the modal
    // open with inline field errors without a round-trip.
    const err = {};
    const title = (d.title || '').trim();
    if (!title) err.title = 'Название обязательно';
    else if (title.length < 3) err.title = 'Минимум 3 символа';
    else if (title.length > 100) err.title = 'Максимум 100 символов';
    if ((d.description || '').length > 1000) err.description = 'Максимум 1000 символов';
    if (d.startTime && d.endTime && d.endTime < d.startTime) err.endTime = 'Раньше времени начала';
    if (Object.keys(err).length) {
      setErrors(err);
      return false;
    }
    const payload = {
      title,
      description: d.description || '',
      status: d.status,
      priority: d.priority,
      dueDate: d.dueDate || null,
      calendarDate: d.calendarDate || null,
      startTime: d.startTime || null,
      endTime: d.endTime || null,
      tags: d.tags,
    };
    try {
      const task = d.id
        ? await tasksApi.updateTask(d.id, payload)
        : await tasksApi.createTask(payload);
      upsertLocal(task);
      toast('success', d.id ? 'Задача обновлена' : 'Задача создана');
      closeModal();
      return true;
    } catch (e) {
      if (e instanceof ApiError && e.fields) {
        setErrors(e.fields); // keep modal open, show field errors
      } else {
        toast('error', (e && e.message) || 'Не удалось сохранить задачу');
      }
      return false;
    }
  };

  const completeTask = async (id) => {
    try {
      upsertLocal(await tasksApi.completeTask(id));
      toast('success', 'Задача завершена');
    } catch (e) {
      toast('error', (e && e.message) || 'Не удалось завершить задачу');
    }
  };
  const reopenTask = async (id) => {
    try {
      upsertLocal(await tasksApi.reopenTask(id));
      toast('info', 'Задача возвращена в работу');
    } catch (e) {
      toast('error', (e && e.message) || 'Не удалось обновить задачу');
    }
  };
  const archiveTask = async (id) => {
    try {
      upsertLocal(await tasksApi.archiveTask(id));
      setModal(null);
      toast('info', 'Задача в архиве');
    } catch (e) {
      toast('error', (e && e.message) || 'Не удалось архивировать задачу');
    }
  };
  const deleteTaskConfirmed = async () => {
    const id = modal && modal.id;
    if (!id) return;
    try {
      await tasksApi.deleteTask(id);
      removeLocal(id);
      setModal(null);
      toast('info', 'Задача удалена');
    } catch (e) {
      toast('error', (e && e.message) || 'Не удалось удалить задачу');
    }
  };

  // ---- filters / sort ----
  const setFilter = (field, val) => setFilters((f) => ({ ...f, [field]: val }));
  const toggleFilter = (field) => setFilters((f) => ({ ...f, [field]: !f[field] }));
  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
    setSort('created_desc');
  };

  // ---- calendar ----
  const calShift = (n) => {
    let m = calMonth + n;
    let y = calYear;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setCalMonth(m);
    setCalYear(y);
  };
  const calToday = () => {
    const n = new Date();
    setCalYear(n.getFullYear());
    setCalMonth(n.getMonth());
  };

  // ---- settings ----
  const setSetting = (field, val) => {
    setSettings((s) => ({ ...s, [field]: val }));
    // Queue a server sync (debounced). localStorage is updated by the effect
    // above regardless, so the change is never lost if the request fails.
    if (!isAuth) return;
    pendingSettings.current[field] = val;
    clearTimeout(settingsSaveTimer.current);
    settingsSaveTimer.current = setTimeout(() => {
      const patch = pendingSettings.current;
      pendingSettings.current = {};
      settingsApi.updateSettings(patch).catch(() => {
        /* non-fatal: localStorage cache still holds the change */
      });
    }, 500);
  };
  const resetDemo = async () => {
    try {
      const list = await tasksApi.resetDemoTasks();
      setTasks(list);
      toast('success', 'Демо-данные сброшены');
    } catch (e) {
      toast('error', (e && e.message) || 'Не удалось сбросить данные');
    }
  };

  // ---- command palette ----
  const openCmd = () => {
    if (isAuth) {
      setCmdQuery('');
      setCmdOpen(true);
    }
  };
  const closeCmd = () => setCmdOpen(false);

  const value = {
    tasks, isAuth, user, settings, filters, sort, calYear, calMonth,
    modal, draft, errors, toasts, cmdOpen, cmdQuery, forcedTasks, loading,
    bootstrapping, tasksLoading, tasksError,
    authForm, authErrors,
    // actions
    toast, dismissToast,
    setAuthField, loginSubmit, registerSubmit, demoLogin, logout,
    openCreate, openEdit, openDetail, openConfirm, closeModal, setDraft, addTag, removeTag,
    saveTask, completeTask, reopenTask, archiveTask, deleteTaskConfirmed,
    setFilter, toggleFilter, setSort, resetFilters,
    calShift, calToday,
    setSetting, resetDemo, setForcedTasks, reloadTasks,
    openCmd, closeCmd, setCmdQuery,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
