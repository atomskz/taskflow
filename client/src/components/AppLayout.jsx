import React, { useEffect, useState } from 'react';
import './AppLayout.css';
import { Outlet, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '../ui.jsx';
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
  return (
    <button onClick={() => navigate(to)} className={'nav-item' + (active ? ' is-active' : '')}>
      <Icon name={icon} size={18} />
      <span className="nav-item__label">{label}</span>
      {badge != null && <span className="nav-item__badge">{badge}</span>}
    </button>
  );
}

function Sidebar({ open }) {
  const navigate = useNavigate();
  const { user, tasks, openCreate, logout } = useApp();
  const activeCount = tasks.filter(isActive).length;
  const initials = (user?.name || '?').split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const doLogout = () => { logout(); navigate('/'); };
  return (
    <aside className={'sidebar' + (open ? ' is-open' : '')}>
      <button onClick={() => navigate('/dashboard')} className="sidebar__brand">
        <div className="brand-mark">
          <Icon name="check" size={18} color="#fff" strokeWidth={2.5} />
        </div>
        <span className="brand-name">TaskFlow</span>
      </button>

      <button onClick={() => openCreate()} className="btn btn--primary lay-newtask">
        <Icon name="plus" size={17} strokeWidth={2.3} />
        Новая задача
      </button>

      <nav className="nav">
        <div className="nav-label">Меню</div>
        <NavItem to="/dashboard" icon="dashboard" label="Дашборд" />
        <NavItem to="/tasks" icon="list" label="Задачи" badge={activeCount} />
        <NavItem to="/calendar" icon="calendar" label="Календарь" />
      </nav>

      <nav className="nav">
        <div className="nav-label">Аккаунт</div>
        <NavItem to="/profile" icon="user" label="Профиль" />
        <NavItem to="/settings" icon="settings" label="Настройки" />
      </nav>

      <div className="lay-account">
        <div className="lay-account-row">
          <div className="lay-account-avatar">{initials}</div>
          <div className="lay-account-info">
            <div className="lay-account-name">{user?.name}</div>
            <div className="lay-account-email">{user?.email}</div>
          </div>
          <button onClick={doLogout} title="Выйти" className="icon-btn icon-btn--danger lay-account-logout">
            <Icon name="logout" size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ onMenu }) {
  const { openCmd, openCreate } = useApp();
  const loc = useLocation();
  const [title, sub] = TITLES[loc.pathname] || ['', ''];
  return (
    <header className="topbar">
      <button onClick={onMenu} className="lay-burger" aria-label="Открыть меню">
        <span />
        <span />
        <span />
      </button>
      <div className="lay-topbar-title">
        <h1 className="topbar__title">{title}</h1>
        <p className="topbar__sub">{sub}</p>
      </div>
      <button onClick={openCmd} className="topbar__search">
        <Icon name="search" size={16} />
        <span className="lay-search-label">Поиск задач…</span>
        <span className="lay-search-kbd">⌘K</span>
      </button>
      <button onClick={() => openCreate()} className="btn btn--primary btn--sm">
        <Icon name="plus" size={16} strokeWidth={2.3} />
        Задача
      </button>
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
    <div className="toast-stack">
      {toasts.map((t) => {
        const m = MAP[t.type] || MAP.info;
        return (
          <div key={t.id} className="toast lay-toast" style={{ '--toast-color': m.color, '--toast-soft': m.soft }}>
            <span className="toast__icon lay-toast-icon">
              <Icon name={m.icon} size={13} color={m.color} />
            </span>
            <span className="toast__msg">{t.message}</span>
            <button onClick={() => dismissToast(t.id)} className="icon-btn lay-toast-close">
              <Icon name="x" size={14} strokeWidth={2.2} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function FullPageLoader() {
  return (
    <div className="full-loader">
      <span className="spinner" />
      <span className="lay-loader-text">Загрузка…</span>
    </div>
  );
}

export default function AppLayout() {
  const { isAuth, bootstrapping, cmdOpen, modal, openCmd, closeCmd, closeModal } = useApp();
  const [navOpen, setNavOpen] = useState(false);
  const location = useLocation();

  // Close the mobile nav drawer whenever the route changes.
  useEffect(() => { setNavOpen(false); }, [location.pathname]);

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
    <div className="app-shell">
      <Sidebar open={navOpen} />
      {navOpen && <div className="app-nav-backdrop" onClick={() => setNavOpen(false)} />}
      <div className="app-body">
        <Topbar onMenu={() => setNavOpen(true)} />
        <main className="app-main">
          <Outlet />
        </main>
      </div>
      <Toasts />
      <Modals />
      <CommandPalette />
    </div>
  );
}
