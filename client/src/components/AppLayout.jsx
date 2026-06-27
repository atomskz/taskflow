import React, { useEffect } from 'react';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { css, mix } from '../lib/css.js';
import { Hov, Icon } from '../ui.jsx';
import { useApp } from '../store.jsx';
import { isActive } from '../lib/tasks.js';
import Modals from './Modals.jsx';
import CommandPalette from './CommandPalette.jsx';

const TITLES = {
  '/dashboard': ['Дашборд', 'Сводка по вашим задачам'],
  '/tasks': ['Задачи', 'Все задачи в одном месте'],
  '/calendar': ['Календарь', 'Планирование по датам'],
  '/profile': ['Профиль', 'Информация об аккаунте'],
  '/settings': ['Настройки', 'Параметры приложения'],
};

function NavItem({ to, icon, label, badge }) {
  const navigate = useNavigate();
  const loc = useLocation();
  const active = loc.pathname === to;
  const base = 'display:flex;align-items:center;gap:11px;padding:9px 11px;border-radius:9px;font-size:14px;font-weight:600;width:100%;transition:all .12s;';
  const style = active ? base + 'background:var(--accent-soft);color:var(--accent-text);' : base + 'color:var(--text-2);';
  return (
    <Hov as="button" onClick={() => navigate(to)} style={style} styleHover={!active ? 'background:var(--hover);color:var(--text)' : undefined}>
      <Icon name={icon} size={18} />
      <span style={css('flex:1;text-align:left')}>{label}</span>
      {badge != null && (
        <span style={mix('font-family:var(--mono);font-size:11px;padding:1px 7px;border-radius:999px;color:var(--text-3);font-weight:600', active ? 'background:var(--accent-soft-2)' : 'background:var(--surface-2)')}>{badge}</span>
      )}
    </Hov>
  );
}

function Sidebar() {
  const navigate = useNavigate();
  const { user, tasks, openCreate, logout } = useApp();
  const activeCount = tasks.filter(isActive).length;
  const initials = (user?.name || '?').split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const doLogout = () => { logout(); navigate('/'); };
  return (
    <aside style={css('width:236px;flex-shrink:0;background:var(--surface);border-right:1px solid var(--border);display:flex;flex-direction:column;position:sticky;top:0;height:100vh')}>
      <button onClick={() => navigate('/dashboard')} style={css('display:flex;align-items:center;gap:11px;padding:18px 18px 16px;width:100%')}>
        <div style={css('width:32px;height:32px;border-radius:9px;background:linear-gradient(150deg,#4f46e5,#7c6cf0);display:flex;align-items:center;justify-content:center;box-shadow:0 3px 9px rgba(79,70,229,.32)')}>
          <Icon name="check" size={18} color="#fff" strokeWidth={2.5} />
        </div>
        <span style={css('font-weight:800;font-size:17px;letter-spacing:-.02em')}>TaskFlow</span>
      </button>

      <Hov as="button" onClick={() => openCreate()} style="margin:6px 14px 12px;display:flex;align-items:center;justify-content:center;gap:8px;padding:10px;font-weight:700;font-size:14px;color:#fff;background:var(--accent);border-radius:9px;box-shadow:0 3px 9px rgba(79,70,229,.26)" styleHover="background:var(--accent-h)">
        <Icon name="plus" size={17} strokeWidth={2.3} />
        Новая задача
      </Hov>

      <nav style={css('padding:4px 12px;display:flex;flex-direction:column;gap:3px')}>
        <div style={css('padding:10px 10px 5px;font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em')}>Меню</div>
        <NavItem to="/dashboard" icon="dashboard" label="Дашборд" />
        <NavItem to="/tasks" icon="list" label="Задачи" badge={activeCount} />
        <NavItem to="/calendar" icon="calendar" label="Календарь" />
      </nav>

      <nav style={css('padding:4px 12px;display:flex;flex-direction:column;gap:3px')}>
        <div style={css('padding:10px 10px 5px;font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.07em')}>Аккаунт</div>
        <NavItem to="/profile" icon="user" label="Профиль" />
        <NavItem to="/settings" icon="settings" label="Настройки" />
      </nav>

      <div style={css('margin-top:auto;padding:12px;border-top:1px solid var(--border)')}>
        <Hov style="display:flex;align-items:center;gap:10px;padding:8px;border-radius:9px" styleHover="background:var(--hover)">
          <div style={css('width:34px;height:34px;border-radius:9px;background:var(--accent-soft-2);color:var(--accent-text);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;flex-shrink:0')}>{initials}</div>
          <div style={css('flex:1;min-width:0')}>
            <div style={css('font-weight:600;font-size:13.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{user?.name}</div>
            <div style={css('font-size:11.5px;color:var(--text-3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis')}>{user?.email}</div>
          </div>
          <Hov as="button" onClick={doLogout} title="Выйти" style="width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:var(--text-3);flex-shrink:0" styleHover="background:#fdeaea;color:#dc2626">
            <Icon name="logout" size={16} />
          </Hov>
        </Hov>
      </div>
    </aside>
  );
}

function Topbar() {
  const { openCmd, openCreate } = useApp();
  const loc = useLocation();
  const [title, sub] = TITLES[loc.pathname] || ['', ''];
  return (
    <header style={css('position:sticky;top:0;z-index:20;display:flex;align-items:center;gap:16px;padding:14px 28px;background:rgba(246,247,249,.82);backdrop-filter:blur(8px);border-bottom:1px solid var(--border)')}>
      <div style={css('flex:1;min-width:0')}>
        <h1 style={css('font-size:19px;font-weight:700;letter-spacing:-.02em;margin:0')}>{title}</h1>
        <p style={css('font-size:13px;color:var(--text-3);margin:1px 0 0')}>{sub}</p>
      </div>
      <Hov as="button" onClick={openCmd} style="display:flex;align-items:center;gap:10px;padding:8px 12px;min-width:230px;background:var(--surface);border:1px solid var(--border-2);border-radius:9px;color:var(--text-3);font-size:13.5px" styleHover="border-color:#cfd0d8;background:#fff">
        <Icon name="search" size={16} />
        <span style={css('flex:1;text-align:left')}>Поиск задач…</span>
        <span style={css('font-family:var(--mono);font-size:11px;padding:2px 6px;background:var(--surface-2);border:1px solid var(--border);border-radius:5px;color:var(--text-3)')}>⌘K</span>
      </Hov>
      <Hov as="button" onClick={() => openCreate()} style="display:flex;align-items:center;gap:7px;padding:9px 16px;font-weight:700;font-size:14px;color:#fff;background:var(--accent);border-radius:9px;box-shadow:0 3px 9px rgba(79,70,229,.24)" styleHover="background:var(--accent-h)">
        <Icon name="plus" size={16} strokeWidth={2.3} />
        Задача
      </Hov>
    </header>
  );
}

function Toasts() {
  const { toasts, dismissToast } = useApp();
  const MAP = {
    success: { color: '#16a34a', soft: '#e7f6ed', icon: 'check' },
    info: { color: '#4f46e5', soft: '#eef0ff', icon: 'info' },
    error: { color: '#dc2626', soft: '#fdeaea', icon: 'x' },
  };
  return (
    <div style={css('position:fixed;right:20px;bottom:20px;z-index:90;display:flex;flex-direction:column;gap:10px;align-items:flex-end')}>
      {toasts.map((t) => {
        const m = MAP[t.type] || MAP.info;
        return (
          <div key={t.id} style={mix('display:flex;align-items:center;gap:11px;padding:12px 15px;background:var(--surface);border:1px solid var(--border-2);border-radius:10px;box-shadow:var(--sh-lg);min-width:260px;max-width:360px;animation:toastIn .28s cubic-bezier(.2,.9,.3,1) both', { borderLeft: '3px solid ' + m.color })}>
            <span style={mix('width:22px;height:22px;border-radius:6px;flex-shrink:0;display:flex;align-items:center;justify-content:center', { background: m.soft, color: m.color })}>
              <Icon name={m.icon} size={13} color={m.color} />
            </span>
            <span style={css('font-size:13.5px;font-weight:600;flex:1')}>{t.message}</span>
            <Hov as="button" onClick={() => dismissToast(t.id)} style="color:var(--text-3);width:20px;height:20px;display:flex;align-items:center;justify-content:center;flex-shrink:0" styleHover="color:var(--text)">
              <Icon name="x" size={14} strokeWidth={2.2} />
            </Hov>
          </div>
        );
      })}
    </div>
  );
}

function FullPageLoader() {
  return (
    <div style={css('min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px')}>
      <span style={css('width:34px;height:34px;border-radius:50%;border:3px solid var(--border-2);border-top-color:var(--accent);animation:spin .7s linear infinite')} />
      <span style={css('font-size:14px;color:var(--text-3);font-weight:600')}>Загрузка…</span>
    </div>
  );
}

export default function AppLayout() {
  const { isAuth, bootstrapping, cmdOpen, modal, openCmd, closeCmd, closeModal } = useApp();

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === 'k') {
        e.preventDefault();
        cmdOpen ? closeCmd() : openCmd();
      } else if (e.key === 'Escape') {
        if (cmdOpen) closeCmd();
        else if (modal) closeModal();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [cmdOpen, modal, openCmd, closeCmd, closeModal]);

  // While restoring a session from a stored token, don't redirect yet.
  if (bootstrapping) return <FullPageLoader />;
  if (!isAuth) return <Navigate to="/login" replace />;

  return (
    <div style={css('display:flex;min-height:100vh')}>
      <Sidebar />
      <div style={css('flex:1;min-width:0;display:flex;flex-direction:column')}>
        <Topbar />
        <main style={css('flex:1;min-width:0;padding:26px 28px 56px')}>
          <Outlet />
        </main>
      </div>
      <Toasts />
      <Modals />
      <CommandPalette />
    </div>
  );
}
