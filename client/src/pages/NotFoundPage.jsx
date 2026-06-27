import './NotFoundPage.css';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store.jsx';

export default function NotFoundPage() {
  const navigate = useNavigate();
  const { isAuth } = useApp();
  return (
    <div className="nf-wrap">
      <div className="nf-inner">
        <div className="nf-code">404</div>
        <h2 className="nf-title">Страница не найдена</h2>
        <p className="nf-text">Возможно, она была перемещена или удалена.</p>
        <button onClick={() => navigate(isAuth ? '/dashboard' : '/')} className="btn btn--primary nf-btn">
          {isAuth ? 'Вернуться на дашборд' : 'На главную'}
        </button>
      </div>
    </div>
  );
}
