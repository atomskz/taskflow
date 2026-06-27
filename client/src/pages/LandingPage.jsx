import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Icon } from '../ui.jsx';
import { useApp } from '../store.jsx';
import './LandingPage.css';

// Icon chip backgrounds use a translucent tint of `color` so they adapt to the
// active theme instead of staying as bright pastels in dark mode.
const FEATURES = [
  { icon: 'checkSquare', color: '#6366f1', bg: 'rgba(99,102,241,0.16)', title: 'Управление задачами', text: 'Создавайте, редактируйте, завершайте и удаляйте задачи. Статусы и приоритеты под рукой.' },
  { icon: 'calendar', color: '#2563eb', bg: 'rgba(37,99,235,0.16)', title: 'Календарь', text: 'Планируйте задачи по датам и времени. Создавайте задачи прямо из ячейки календаря.' },
  { icon: 'barChart', color: '#16a34a', bg: 'rgba(22,163,74,0.16)', title: 'Дашборд и статистика', text: 'Сводка по задачам, прогресс недели и диаграммы по статусам и приоритетам.' },
  { icon: 'flag', color: '#ea580c', bg: 'rgba(234,88,12,0.16)', title: 'Приоритеты', text: 'Четыре уровня — от низкого до критичного. Цвет и текст, чтобы ничего не упустить.' },
  { icon: 'search', color: '#7c3aed', bg: 'rgba(124,58,237,0.18)', title: 'Фильтры и поиск', text: 'Мгновенный поиск и фильтры по статусу, приоритету и срокам. Без перезагрузок.' },
  { icon: 'shield', color: '#dc2626', bg: 'rgba(220,38,38,0.16)', title: 'Только ваши данные', text: 'Защищённые маршруты и личный аккаунт. Вы видите только свои задачи.' },
];

export default function LandingPage() {
  const { isAuth, demoLogin } = useApp();
  const navigate = useNavigate();
  if (isAuth) return <Navigate to="/dashboard" replace />;
  const demo = async () => {
    const ok = await demoLogin();
    if (ok) navigate('/dashboard');
  };

  return (
    <div className="land-root">
      <div className="land-glow" />

      <header className="land-header">
        <div className="land-brand">
          <div className="land-brand-mark">
            <Icon name="check" size={19} color="#fff" strokeWidth={2.4} />
          </div>
          <span className="land-brand-name">TaskFlow</span>
        </div>
        <nav className="land-nav">
          <button onClick={() => navigate('/login')} className="land-nav-login">Войти</button>
          <button onClick={() => navigate('/register')} className="btn btn--primary land-nav-cta">Начать бесплатно</button>
        </nav>
      </header>

      <section className="land-hero">
        <div className="land-hero-badge">
          <span className="land-hero-badge-tag">Новое</span>
          Календарь, дашборд и аналитика в одном месте
        </div>
        <h1 className="land-hero-title">Личные задачи,<br />под полным контролем</h1>
        <p className="land-hero-lead">TaskFlow помогает планировать задачи по датам, следить за дедлайнами и видеть прогресс — без хаоса и лишних кликов.</p>
        <div className="land-hero-actions">
          <button onClick={() => navigate('/register')} className="land-cta">
            Создать аккаунт<Icon name="arrowRight" size={17} strokeWidth={2.2} />
          </button>
          <button onClick={demo} className="land-cta-ghost">
            <Icon name="play" size={17} />Демо без регистрации
          </button>
        </div>
        <p className="land-hero-note">Бесплатно для личного использования · Личный аккаунт и защищённое хранение данных</p>
      </section>

      {/* Product preview mock */}
      <section className="land-preview">
        <div className="land-preview-window">
          <div className="land-preview-bar">
            <span className="land-preview-dot land-preview-dot--red" />
            <span className="land-preview-dot land-preview-dot--yellow" />
            <span className="land-preview-dot land-preview-dot--green" />
            <span className="land-preview-url">app.taskflow.ru/dashboard</span>
          </div>
          <div className="land-preview-body">
            <div className="land-preview-stats">
              {[['Активные', '12', 'var(--text)'], ['На сегодня', '3', '#2563eb'], ['Просрочено', '2', '#dc2626'], ['За неделю', '8', '#16a34a']].map(([l, n, c]) => (
                <div key={l} className="land-preview-stat">
                  <div className="land-preview-stat-label">{l}</div>
                  <div className="land-preview-stat-num" style={{ '--num-color': c }}>{n}</div>
                </div>
              ))}
            </div>
            <div className="land-preview-cols">
              <div className="land-preview-list">
                <div className="land-preview-list-title">Предстоящие задачи</div>
                <div className="land-preview-list-items">
                  {[['#ea580c', 'Сверстать форму логина', 'Завтра'], ['#2563eb', 'Code review PR #142', 'Сегодня'], ['#16a34a', 'Купить продукты', '+1 дн.']].map(([c, t, w]) => (
                    <div key={t} className="land-preview-row">
                      <span className="land-preview-row-dot" style={{ '--dot-color': c }} />
                      <span className="land-preview-row-title">{t}</span>
                      <span className="land-preview-row-when">{w}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="land-preview-donut">
                <div className="land-preview-donut-title">По статусам</div>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="46" fill="none" stroke="var(--border-2)" strokeWidth="15" />
                  <circle cx="60" cy="60" r="46" fill="none" stroke="#16a34a" strokeWidth="15" strokeDasharray="144 289" strokeDashoffset="0" transform="rotate(-90 60 60)" strokeLinecap="round" />
                  <circle cx="60" cy="60" r="46" fill="none" stroke="#2563eb" strokeWidth="15" strokeDasharray="72 289" strokeDashoffset="-148" transform="rotate(-90 60 60)" strokeLinecap="round" />
                  <text x="60" y="56" textAnchor="middle" fontSize="22" fontWeight="800" fill="var(--text)">20</text>
                  <text x="60" y="73" textAnchor="middle" fontSize="10" fill="var(--text-3)" fontWeight="600">задач</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="land-features">
        <div className="land-features-head">
          <div className="land-features-eyebrow">Возможности</div>
          <h2 className="land-features-title">Всё для управления задачами</h2>
        </div>
        <div className="land-features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="land-feature">
              <div className="land-feature-icon" style={{ '--bg': f.bg }}>
                <Icon name={f.icon} size={21} color={f.color} />
              </div>
              <h3 className="land-feature-title">{f.title}</h3>
              <p className="land-feature-text">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="land-cta-section">
        <div className="land-cta-box">
          <div className="land-cta-box-glow" />
          <h2 className="land-cta-title">Начните планировать сегодня</h2>
          <p className="land-cta-lead">Создайте аккаунт за минуту или попробуйте демо.</p>
          <div className="land-cta-actions">
            <button onClick={() => navigate('/register')} className="land-cta-light">Создать аккаунт</button>
            <button onClick={demo} className="land-cta-outline">Открыть демо</button>
          </div>
        </div>
      </section>

      <footer className="land-footer">
        <div className="land-footer-inner">
          <div className="land-footer-brand">
            <div className="land-footer-mark">
              <Icon name="check" size={14} color="#fff" strokeWidth={2.6} />
            </div>
            <span className="land-footer-name">TaskFlow</span>
            <span className="land-footer-tagline">— учебный pet-проект</span>
          </div>
          <div className="land-footer-stack">React · Vite · React Router · Express · SQLite</div>
        </div>
      </footer>
    </div>
  );
}
