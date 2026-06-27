import React from 'react';
import { useNavigate } from 'react-router-dom';
import { css } from '../lib/css.js';
import { Hov } from '../ui.jsx';
import { useApp } from '../store.jsx';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { isAuth } = useApp();
  return (
    <div style={css('min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px')}>
      <div style={css('max-width:520px;text-align:center;animation:ff .3s ease both')}>
        <div style={css('font-size:96px;font-weight:800;letter-spacing:-.04em;background:linear-gradient(150deg,#4f46e5,#7c6cf0);-webkit-background-clip:text;background-clip:text;color:transparent;line-height:1')}>404</div>
        <h2 style={css('font-size:22px;font-weight:800;margin:8px 0 0')}>Страница не найдена</h2>
        <p style={css('color:var(--text-2);margin:8px 0 22px')}>Возможно, она была перемещена или удалена.</p>
        <Hov as="button" onClick={() => navigate(isAuth ? '/dashboard' : '/')} style="padding:11px 22px;font-weight:700;font-size:14px;color:#fff;background:var(--accent);border-radius:9px" styleHover="background:var(--accent-h)">
          {isAuth ? 'Вернуться на дашборд' : 'На главную'}
        </Hov>
      </div>
    </div>
  );
}
