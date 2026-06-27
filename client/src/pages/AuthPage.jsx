import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { css, mix } from '../lib/css.js';
import { Hov, Icon } from '../ui.jsx';
import { useApp } from '../store.jsx';

const authInput = (err) =>
  'width:100%;padding:11px 13px;background:var(--surface);border:1px solid ' +
  (err ? '#e5484d' : 'var(--border-2)') +
  ';border-radius:9px;font-size:14.5px;outline:none;transition:all .12s';
const FOCUS = 'border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)';
const LABEL = 'display:block;font-size:13px;font-weight:600;color:var(--text-2);margin-bottom:7px';
const ERR = 'display:block;font-size:12.5px;color:#dc2626;margin-top:6px;font-weight:500';

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
    <div style={css('min-height:100vh;display:grid;grid-template-columns:1.05fr .95fr')}>
      {/* Brand panel */}
      <div style={css('position:relative;background:linear-gradient(150deg,#3f37c9 0%,#4f46e5 45%,#6d5ef0 100%);padding:48px;display:flex;flex-direction:column;justify-content:space-between;overflow:hidden')}>
        <div style={css('position:absolute;inset:0;background:radial-gradient(600px 400px at 90% 110%,rgba(255,255,255,.16),transparent 60%);pointer-events:none')} />
        <button onClick={() => navigate('/')} style={css('position:relative;display:flex;align-items:center;gap:11px;align-self:flex-start')}>
          <div style={css('width:34px;height:34px;border-radius:9px;background:rgba(255,255,255,.16);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center')}>
            <Icon name="check" size={19} color="#fff" strokeWidth={2.4} />
          </div>
          <span style={css('font-weight:800;font-size:19px;color:#fff;letter-spacing:-.02em')}>TaskFlow</span>
        </button>
        <div style={css('position:relative')}>
          <div style={css('font-size:30px;line-height:1.25;font-weight:700;color:#fff;letter-spacing:-.02em;max-width:420px')}>«Планируй день, держи дедлайны и видь свой прогресс.»</div>
          <div style={css('margin-top:26px;display:flex;flex-direction:column;gap:14px')}>
            {PERKS.map((p) => (
              <div key={p} style={css('display:flex;align-items:center;gap:12px;color:rgba(255,255,255,.92);font-weight:600')}>
                <span style={css('width:26px;height:26px;border-radius:7px;background:rgba(255,255,255,.16);display:flex;align-items:center;justify-content:center')}>
                  <Icon name="check" size={15} color="#fff" strokeWidth={2.4} />
                </span>
                {p}
              </div>
            ))}
          </div>
        </div>
        <div style={css('position:relative;font-size:13px;color:rgba(255,255,255,.6)')}>© 2026 TaskFlow · Учебный проект для портфолио</div>
      </div>

      {/* Form panel */}
      <div style={css('display:flex;align-items:center;justify-content:center;padding:40px 32px')}>
        <div style={css('width:100%;max-width:380px;animation:su .4s ease both')}>
          <h1 style={css('font-size:27px;font-weight:800;letter-spacing:-.025em;margin:0')}>{isRegister ? 'Создать аккаунт' : 'С возвращением'}</h1>
          <p style={css('color:var(--text-2);margin:8px 0 26px;font-size:15px')}>
            {isRegister ? 'Заполните данные, чтобы начать пользоваться TaskFlow' : 'Войдите, чтобы продолжить работу с задачами'}
          </p>

          {authErrors.form && (
            <div style={css('display:flex;align-items:center;gap:9px;padding:11px 13px;margin-bottom:16px;background:#fdeaea;border:1px solid #f3d2d2;border-radius:9px;color:#dc2626;font-size:13.5px;font-weight:600')}>
              <Icon name="alert" size={16} color="#dc2626" />
              {authErrors.form}
            </div>
          )}

          <form onSubmit={onSubmit} style={css('display:flex;flex-direction:column;gap:16px')}>
            {isRegister && (
              <label style={css('display:block')}>
                <span style={css(LABEL)}>Имя</span>
                <Hov as="input" value={authForm.name} onChange={(e) => setAuthField('name', e.target.value)} type="text" placeholder="Как вас зовут?" style={authInput(authErrors.name)} styleFocus={FOCUS} />
                {authErrors.name && <span style={css(ERR)}>{authErrors.name}</span>}
              </label>
            )}
            <label style={css('display:block')}>
              <span style={css(LABEL)}>Email</span>
              <Hov as="input" value={authForm.email} onChange={(e) => setAuthField('email', e.target.value)} type="email" placeholder="you@example.com" style={authInput(authErrors.email)} styleFocus={FOCUS} />
              {authErrors.email && <span style={css(ERR)}>{authErrors.email}</span>}
            </label>
            <label style={css('display:block')}>
              <span style={css(LABEL)}>Пароль</span>
              <Hov as="input" value={authForm.password} onChange={(e) => setAuthField('password', e.target.value)} type="password" placeholder={isRegister ? 'Минимум 8 символов' : 'Ваш пароль'} style={authInput(authErrors.password)} styleFocus={FOCUS} />
              {authErrors.password && <span style={css(ERR)}>{authErrors.password}</span>}
            </label>
            {isRegister && (
              <label style={css('display:block')}>
                <span style={css(LABEL)}>Подтверждение пароля</span>
                <Hov as="input" value={authForm.confirm} onChange={(e) => setAuthField('confirm', e.target.value)} type="password" placeholder="Повторите пароль" style={authInput(authErrors.confirm)} styleFocus={FOCUS} />
                {authErrors.confirm && <span style={css(ERR)}>{authErrors.confirm}</span>}
              </label>
            )}

            <Hov as="button" type="submit" disabled={submitting} style={mix('margin-top:4px;display:flex;align-items:center;justify-content:center;gap:8px;padding:13px;font-weight:700;font-size:15px;color:#fff;background:var(--accent);border-radius:9px;box-shadow:0 4px 12px rgba(79,70,229,.28)', submitting && 'opacity:.7;cursor:default')} styleHover={!submitting ? 'background:var(--accent-h)' : undefined}>
              {submitting ? 'Подождите…' : isRegister ? 'Создать аккаунт' : 'Войти'}
            </Hov>
          </form>

          <Hov as="button" onClick={demo} style="width:100%;margin-top:12px;padding:12px;font-weight:600;font-size:14px;color:var(--text-2);background:var(--surface);border:1px solid var(--border-2);border-radius:9px" styleHover="background:var(--hover)">Войти в демо-аккаунт</Hov>

          <p style={css('text-align:center;font-size:14px;color:var(--text-2);margin-top:22px')}>
            {isRegister ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}{' '}
            <button onClick={() => navigate(isRegister ? '/login' : '/register')} style={css('color:var(--accent-text);font-weight:700')}>
              {isRegister ? 'Войти' : 'Зарегистрироваться'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
