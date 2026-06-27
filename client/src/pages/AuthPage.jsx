import './AuthPage.css';
import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Icon } from '../ui.jsx';
import { useApp } from '../store.jsx';

const PERKS = ['Дашборд с аналитикой', 'Календарь и дедлайны', 'Приоритеты и теги'];

export default function AuthPage({ mode }) {
  const { isAuth, authForm, authErrors, setAuthField, loginSubmit, registerSubmit, demoLogin } = useApp();
  const navigate = useNavigate();
  // All hooks must run before any early return (Rules of Hooks): isAuth flips to
  // true on login, and a hook below the early return would crash the re-render.
  const [submitting, setSubmitting] = React.useState(false);
  if (isAuth) return <Navigate to="/dashboard" replace />;
  const isRegister = mode === 'register';

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const ok = await (isRegister ? registerSubmit() : loginSubmit());
    setSubmitting(false);
    if (ok) navigate('/dashboard');
  };
  const demo = async () => {
    if (submitting) return;
    setSubmitting(true);
    const ok = await demoLogin();
    setSubmitting(false);
    if (ok) navigate('/dashboard');
  };

  return (
    <div className="auth-layout">
      {/* Brand panel */}
      <div className="auth-brand">
        <div className="auth-brand__overlay" />
        <button onClick={() => navigate('/')} className="auth-brand__logo">
          <div className="auth-brand__logo-mark">
            <Icon name="check" size={19} color="#fff" strokeWidth={2.4} />
          </div>
          <span className="auth-brand__logo-name">TaskFlow</span>
        </button>
        <div className="auth-brand__body">
          <div className="auth-brand__quote">«Планируй день, держи дедлайны и видь свой прогресс.»</div>
          <div className="auth-brand__perks">
            {PERKS.map((p) => (
              <div key={p} className="auth-brand__perk">
                <span className="auth-brand__perk-icon">
                  <Icon name="check" size={15} color="#fff" strokeWidth={2.4} />
                </span>
                {p}
              </div>
            ))}
          </div>
        </div>
        <div className="auth-brand__footer">© 2026 TaskFlow · Учебный проект для портфолио</div>
      </div>

      {/* Form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-panel__inner">
          <h1 className="auth-title">{isRegister ? 'Создать аккаунт' : 'С возвращением'}</h1>
          <p className="auth-subtitle">
            {isRegister ? 'Заполните данные, чтобы начать пользоваться TaskFlow' : 'Войдите, чтобы продолжить работу с задачами'}
          </p>

          {authErrors.form && (
            <div className="auth-error">
              <Icon name="alert" size={16} color="#dc2626" />
              {authErrors.form}
            </div>
          )}

          <form onSubmit={onSubmit} className="auth-form">
            {isRegister && (
              <label className="auth-field">
                <span className="form-label">Имя</span>
                <input className={'input' + (authErrors.name ? ' is-error' : '')} value={authForm.name} onChange={(e) => setAuthField('name', e.target.value)} type="text" placeholder="Как вас зовут?" />
                {authErrors.name && <span className="field-error">{authErrors.name}</span>}
              </label>
            )}
            <label className="auth-field">
              <span className="form-label">Email</span>
              <input className={'input' + (authErrors.email ? ' is-error' : '')} value={authForm.email} onChange={(e) => setAuthField('email', e.target.value)} type="email" placeholder="you@example.com" />
              {authErrors.email && <span className="field-error">{authErrors.email}</span>}
            </label>
            <label className="auth-field">
              <span className="form-label">Пароль</span>
              <input className={'input' + (authErrors.password ? ' is-error' : '')} value={authForm.password} onChange={(e) => setAuthField('password', e.target.value)} type="password" placeholder={isRegister ? 'Минимум 8 символов' : 'Ваш пароль'} />
              {authErrors.password && <span className="field-error">{authErrors.password}</span>}
            </label>
            {isRegister && (
              <label className="auth-field">
                <span className="form-label">Подтверждение пароля</span>
                <input className={'input' + (authErrors.confirm ? ' is-error' : '')} value={authForm.confirm} onChange={(e) => setAuthField('confirm', e.target.value)} type="password" placeholder="Повторите пароль" />
                {authErrors.confirm && <span className="field-error">{authErrors.confirm}</span>}
              </label>
            )}

            <button type="submit" disabled={submitting} className={'btn btn--primary btn--block btn--lg' + (submitting ? ' is-busy' : '')}>
              {submitting ? 'Подождите…' : isRegister ? 'Создать аккаунт' : 'Войти'}
            </button>
          </form>

          <button onClick={demo} className="btn btn--ghost btn--block auth-demo-btn">Войти в демо-аккаунт</button>

          <p className="auth-switch">
            {isRegister ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
            <button onClick={() => navigate(isRegister ? '/login' : '/register')} className="auth-switch__link">
              {isRegister ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
