import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../ui.jsx';
import { useApp } from '../store.jsx';
import { isActive } from '../lib/tasks.js';
import { fmtFull, iso } from '../lib/dates.js';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, tasks, logout } = useApp();
  const navigate = useNavigate();
  const createdCount = tasks.length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const activeCount = tasks.filter(isActive).length;
  const pct = createdCount ? Math.round((doneCount / createdCount) * 100) : 0;
  const initials = (user?.name || '?').split(/\s+/).map((p) => p[0]).slice(0, 2).join('').toUpperCase();
  const joinText = user ? fmtFull(iso(new Date(user.createdAt))) : '';
  const doLogout = () => { logout(); navigate('/'); };

  return (
    <div className="page prof-page">
      <div className="prof-header-card">
        <div className="prof-banner">
          <div className="prof-banner-overlay" />
        </div>
        <div className="prof-header-body">
          <div className="prof-identity">
            <div className="prof-avatar">{initials}</div>
            <div className="prof-namewrap">
              <h2 className="prof-name">{user?.name}</h2>
              <p className="prof-email">{user?.email}</p>
            </div>
          </div>
          <div className="prof-join">
            <Icon name="calendar" size={15} />На TaskFlow с {joinText}
          </div>
        </div>
      </div>

      <div className="prof-tiles">
        <div className="prof-tile"><div className="prof-tile-k">Создано</div><div className="prof-tile-n">{createdCount}</div></div>
        <div className="prof-tile"><div className="prof-tile-k">Выполнено</div><div className="prof-tile-n prof-tile-n--green">{doneCount}</div></div>
        <div className="prof-tile"><div className="prof-tile-k">Активные</div><div className="prof-tile-n prof-tile-n--accent">{activeCount}</div></div>
        <div className="prof-tile"><div className="prof-tile-k">Прогресс</div><div className="prof-tile-n">{pct}%</div></div>
      </div>

      <div className="card prof-manage">
        <div>
          <div className="prof-manage-title">Управление аккаунтом</div>
          <div className="prof-manage-sub">Настройки приложения и выход из аккаунта</div>
        </div>
        <div className="prof-manage-actions">
          <button onClick={() => navigate('/settings')} className="btn btn--ghost prof-manage-btn">Настройки</button>
          <button onClick={doLogout} className="btn btn--soft-danger prof-manage-btn">Выйти</button>
        </div>
      </div>
    </div>
  );
}
