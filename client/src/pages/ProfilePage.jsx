import React from 'react';
import { useNavigate } from 'react-router-dom';
import { css, mix } from '../lib/css.js';
import { Hov, Icon } from '../ui.jsx';
import { useApp } from '../store.jsx';
import { isActive } from '../lib/tasks.js';
import { fmtFull, iso } from '../lib/dates.js';

const TILE = 'background:var(--surface);border:1px solid var(--border);border-radius:13px;padding:17px;box-shadow:var(--sh-sm)';
const TILEK = 'font-size:11px;font-weight:700;color:var(--text-3);text-transform:uppercase;letter-spacing:.06em';
const TILEN = 'font-size:28px;font-weight:800;margin-top:7px;font-variant-numeric:tabular-nums';

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
    <div style={css('max-width:760px;margin:0 auto;animation:ff .3s ease both')}>
      <div style={css('background:var(--surface);border:1px solid var(--border);border-radius:16px;box-shadow:var(--sh-sm);overflow:hidden;margin-bottom:16px')}>
        <div style={css('height:92px;background:linear-gradient(120deg,#4f46e5,#6d5ef0);position:relative')}>
          <div style={css('position:absolute;inset:0;background:radial-gradient(300px 160px at 85% 0%,rgba(255,255,255,.2),transparent 60%)')} />
        </div>
        <div style={css('padding:0 26px 24px')}>
          <div style={css('display:flex;align-items:flex-end;gap:16px;margin-top:-34px')}>
            <div style={css('width:82px;height:82px;border-radius:22px;background:var(--accent-soft-2);color:var(--accent-text);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:29px;border:4px solid #fff;box-shadow:var(--sh)')}>{initials}</div>
            <div style={css('padding-bottom:5px;flex:1;min-width:0')}>
              <h2 style={css('font-size:22px;font-weight:800;margin:0;letter-spacing:-.02em')}>{user?.name}</h2>
              <p style={css('color:var(--text-2);margin:2px 0 0;font-size:14px')}>{user?.email}</p>
            </div>
          </div>
          <div style={css('display:flex;align-items:center;gap:7px;margin-top:16px;color:var(--text-3);font-size:13px')}>
            <Icon name="calendar" size={15} />На TaskFlow с {joinText}
          </div>
        </div>
      </div>

      <div style={css('display:grid;grid-template-columns:repeat(4,1fr);gap:13px;margin-bottom:16px')}>
        <div style={css(TILE)}><div style={css(TILEK)}>Создано</div><div style={css(TILEN)}>{createdCount}</div></div>
        <div style={css(TILE)}><div style={css(TILEK)}>Выполнено</div><div style={mix(TILEN, 'color:#16a34a')}>{doneCount}</div></div>
        <div style={css(TILE)}><div style={css(TILEK)}>Активные</div><div style={mix(TILEN, 'color:var(--accent-text)')}>{activeCount}</div></div>
        <div style={css(TILE)}><div style={css(TILEK)}>Прогресс</div><div style={css(TILEN)}>{pct}%</div></div>
      </div>

      <div style={css('background:var(--surface);border:1px solid var(--border);border-radius:14px;box-shadow:var(--sh-sm);padding:18px;display:flex;align-items:center;justify-content:space-between')}>
        <div>
          <div style={css('font-weight:700;font-size:15px')}>Управление аккаунтом</div>
          <div style={css('font-size:13px;color:var(--text-2);margin-top:2px')}>Настройки приложения и выход из аккаунта</div>
        </div>
        <div style={css('display:flex;gap:9px')}>
          <Hov as="button" onClick={() => navigate('/settings')} style="padding:9px 16px;font-weight:600;font-size:13.5px;color:var(--text);background:var(--surface);border:1px solid var(--border-2);border-radius:9px" styleHover="background:var(--hover)">Настройки</Hov>
          <Hov as="button" onClick={doLogout} style="padding:9px 16px;font-weight:600;font-size:13.5px;color:#dc2626;background:#fdeaea;border-radius:9px" styleHover="background:#fbdcdc">Выйти</Hov>
        </div>
      </div>
    </div>
  );
}
