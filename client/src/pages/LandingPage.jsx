import React from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { css } from '../lib/css.js';
import { Hov, Icon } from '../ui.jsx';
import { useApp } from '../store.jsx';

const FEATURES = [
  { icon: 'checkSquare', color: '#4f46e5', bg: 'var(--accent-soft)', title: 'Управление задачами', text: 'Создавайте, редактируйте, завершайте и удаляйте задачи. Статусы и приоритеты под рукой.' },
  { icon: 'calendar', color: '#2563eb', bg: '#e8f0fe', title: 'Календарь', text: 'Планируйте задачи по датам и времени. Создавайте задачи прямо из ячейки календаря.' },
  { icon: 'barChart', color: '#16a34a', bg: '#e7f6ed', title: 'Дашборд и статистика', text: 'Сводка по задачам, прогресс недели и диаграммы по статусам и приоритетам.' },
  { icon: 'flag', color: '#ea580c', bg: '#fdece1', title: 'Приоритеты', text: 'Четыре уровня — от низкого до критичного. Цвет и текст, чтобы ничего не упустить.' },
  { icon: 'search', color: '#7c3aed', bg: '#f1eafe', title: 'Фильтры и поиск', text: 'Мгновенный поиск и фильтры по статусу, приоритету и срокам. Без перезагрузок.' },
  { icon: 'shield', color: '#dc2626', bg: '#fdeaea', title: 'Только ваши данные', text: 'Защищённые маршруты и личный аккаунт. Вы видите только свои задачи.' },
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
    <div style={css('position:relative;overflow:hidden')}>
      <div style={css('position:absolute;inset:0;background:radial-gradient(900px 480px at 82% -8%,rgba(79,70,229,.10),transparent 60%),radial-gradient(700px 420px at 6% 4%,rgba(37,99,235,.06),transparent 55%);pointer-events:none')} />

      <header style={css('position:relative;max-width:1180px;margin:0 auto;padding:22px 32px;display:flex;align-items:center;justify-content:space-between')}>
        <div style={css('display:flex;align-items:center;gap:11px')}>
          <div style={css('width:34px;height:34px;border-radius:9px;background:linear-gradient(150deg,#4f46e5,#7c6cf0);display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(79,70,229,.35)')}>
            <Icon name="check" size={19} color="#fff" strokeWidth={2.4} />
          </div>
          <span style={css('font-weight:800;font-size:19px;letter-spacing:-.02em')}>TaskFlow</span>
        </div>
        <nav style={css('display:flex;align-items:center;gap:10px')}>
          <Hov as="button" onClick={() => navigate('/login')} style="padding:9px 16px;font-weight:600;font-size:14px;color:var(--text);border-radius:8px" styleHover="background:var(--hover)">Войти</Hov>
          <Hov as="button" onClick={() => navigate('/register')} style="padding:9px 18px;font-weight:700;font-size:14px;color:#fff;background:var(--accent);border-radius:8px;box-shadow:0 4px 12px rgba(79,70,229,.3)" styleHover="background:var(--accent-h)">Начать бесплатно</Hov>
        </nav>
      </header>

      <section style={css('position:relative;max-width:1180px;margin:0 auto;padding:64px 32px 40px;text-align:center')}>
        <div style={css('display:inline-flex;align-items:center;gap:8px;padding:6px 14px 6px 8px;background:var(--surface);border:1px solid var(--border);border-radius:999px;box-shadow:var(--sh-sm);font-size:13px;font-weight:600;color:var(--text-2);margin-bottom:26px')}>
          <span style={css('padding:2px 9px;background:var(--accent-soft);color:var(--accent-text);border-radius:999px;font-size:11.5px;font-weight:700')}>Новое</span>
          Календарь, дашборд и аналитика в одном месте
        </div>
        <h1 style={css('font-size:60px;line-height:1.04;font-weight:800;letter-spacing:-.035em;margin:0 auto;max-width:840px')}>Личные задачи,<br />под полным контролем</h1>
        <p style={css('font-size:19px;line-height:1.55;color:var(--text-2);max-width:600px;margin:22px auto 0')}>TaskFlow помогает планировать задачи по датам, следить за дедлайнами и видеть прогресс — без хаоса и лишних кликов.</p>
        <div style={css('display:flex;gap:12px;justify-content:center;margin-top:34px')}>
          <Hov as="button" onClick={() => navigate('/register')} style="display:flex;align-items:center;gap:8px;padding:13px 24px;font-weight:700;font-size:15px;color:#fff;background:var(--accent);border-radius:10px;box-shadow:0 8px 20px rgba(79,70,229,.32)" styleHover="background:var(--accent-h);transform:translateY(-1px)">
            Создать аккаунт<Icon name="arrowRight" size={17} strokeWidth={2.2} />
          </Hov>
          <Hov as="button" onClick={demo} style="display:flex;align-items:center;gap:8px;padding:13px 22px;font-weight:700;font-size:15px;color:var(--text);background:var(--surface);border:1px solid var(--border-2);border-radius:10px;box-shadow:var(--sh-sm)" styleHover="background:var(--hover)">
            <Icon name="play" size={17} />Демо без регистрации
          </Hov>
        </div>
        <p style={css('font-size:13px;color:var(--text-3);margin-top:16px')}>Бесплатно для личного использования · Личный аккаунт и защищённое хранение данных</p>
      </section>

      {/* Product preview mock */}
      <section style={css('position:relative;max-width:1080px;margin:18px auto 0;padding:0 32px')}>
        <div style={css('border-radius:16px 16px 0 0;background:var(--surface);border:1px solid var(--border);border-bottom:none;box-shadow:0 -1px 0 rgba(255,255,255,.6) inset,0 30px 80px rgba(24,25,34,.16);overflow:hidden')}>
          <div style={css('display:flex;align-items:center;gap:7px;padding:13px 16px;border-bottom:1px solid var(--border);background:var(--surface-2)')}>
            <span style={css('width:11px;height:11px;border-radius:50%;background:#f0625b')} />
            <span style={css('width:11px;height:11px;border-radius:50%;background:#f6b73c')} />
            <span style={css('width:11px;height:11px;border-radius:50%;background:#3ec45f')} />
            <span style={css('margin-left:14px;font-family:var(--mono);font-size:12px;color:var(--text-3)')}>app.taskflow.ru/dashboard</span>
          </div>
          <div style={css('padding:18px;background:var(--canvas)')}>
            <div style={css('display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:14px')}>
              {[['Активные', '12', 'var(--text)'], ['На сегодня', '3', '#2563eb'], ['Просрочено', '2', '#dc2626'], ['За неделю', '8', '#16a34a']].map(([l, n, c]) => (
                <div key={l} style={css('background:#fff;border:1px solid var(--border);border-radius:10px;padding:14px')}>
                  <div style={css('font-size:11px;color:var(--text-3);font-weight:700;text-transform:uppercase;letter-spacing:.06em')}>{l}</div>
                  <div style={css('font-size:26px;font-weight:800;margin-top:6px;font-variant-numeric:tabular-nums;color:' + c)}>{n}</div>
                </div>
              ))}
            </div>
            <div style={css('display:grid;grid-template-columns:1.7fr 1fr;gap:12px')}>
              <div style={css('background:#fff;border:1px solid var(--border);border-radius:10px;padding:16px')}>
                <div style={css('font-weight:700;font-size:14px;margin-bottom:12px')}>Предстоящие задачи</div>
                <div style={css('display:flex;flex-direction:column;gap:9px')}>
                  {[['#ea580c', 'Сверстать форму логина', 'Завтра'], ['#2563eb', 'Code review PR #142', 'Сегодня'], ['#16a34a', 'Купить продукты', '+1 дн.']].map(([c, t, w]) => (
                    <div key={t} style={css('display:flex;align-items:center;gap:11px;padding:9px 11px;background:var(--surface-2);border-radius:8px')}>
                      <span style={css('width:8px;height:8px;border-radius:50%;background:' + c)} />
                      <span style={css('font-size:13.5px;font-weight:600;flex:1')}>{t}</span>
                      <span style={css('font-family:var(--mono);font-size:11.5px;color:var(--text-3)')}>{w}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={css('background:#fff;border:1px solid var(--border);border-radius:10px;padding:16px;display:flex;flex-direction:column;align-items:center;justify-content:center')}>
                <div style={css('font-weight:700;font-size:14px;margin-bottom:10px;align-self:flex-start')}>По статусам</div>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="46" fill="none" stroke="#f1f2f4" strokeWidth="15" />
                  <circle cx="60" cy="60" r="46" fill="none" stroke="#16a34a" strokeWidth="15" strokeDasharray="144 289" strokeDashoffset="0" transform="rotate(-90 60 60)" strokeLinecap="round" />
                  <circle cx="60" cy="60" r="46" fill="none" stroke="#2563eb" strokeWidth="15" strokeDasharray="72 289" strokeDashoffset="-148" transform="rotate(-90 60 60)" strokeLinecap="round" />
                  <text x="60" y="56" textAnchor="middle" fontSize="22" fontWeight="800" fill="#1c1d22">20</text>
                  <text x="60" y="73" textAnchor="middle" fontSize="10" fill="#9a9ca6" fontWeight="600">задач</text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={css('position:relative;max-width:1180px;margin:0 auto;padding:72px 32px')}>
        <div style={css('text-align:center;margin-bottom:44px')}>
          <div style={css('font-family:var(--mono);font-size:12.5px;font-weight:600;color:var(--accent-text);text-transform:uppercase;letter-spacing:.12em')}>Возможности</div>
          <h2 style={css('font-size:36px;font-weight:800;letter-spacing:-.03em;margin:12px 0 0')}>Всё для управления задачами</h2>
        </div>
        <div style={css('display:grid;grid-template-columns:repeat(3,1fr);gap:18px')}>
          {FEATURES.map((f) => (
            <Hov key={f.title} style="background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:24px;box-shadow:var(--sh-sm)" styleHover="box-shadow:var(--sh-md);transform:translateY(-2px)">
              <div style={css('width:42px;height:42px;border-radius:11px;display:flex;align-items:center;justify-content:center;margin-bottom:16px;background:' + f.bg)}>
                <Icon name={f.icon} size={21} color={f.color} />
              </div>
              <h3 style={css('font-size:17px;font-weight:700;margin:0 0 7px')}>{f.title}</h3>
              <p style={css('font-size:14px;color:var(--text-2);margin:0;line-height:1.55')}>{f.text}</p>
            </Hov>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={css('position:relative;max-width:1180px;margin:0 auto;padding:0 32px 72px')}>
        <div style={css('background:linear-gradient(135deg,#1c1d22,#2b2c39);border-radius:20px;padding:52px 48px;text-align:center;position:relative;overflow:hidden')}>
          <div style={css('position:absolute;inset:0;background:radial-gradient(600px 300px at 80% 0%,rgba(124,108,240,.35),transparent 60%)')} />
          <h2 style={css('position:relative;font-size:32px;font-weight:800;color:#fff;letter-spacing:-.025em;margin:0')}>Начните планировать сегодня</h2>
          <p style={css('position:relative;font-size:17px;color:rgba(255,255,255,.7);margin:14px 0 28px')}>Создайте аккаунт за минуту или попробуйте демо.</p>
          <div style={css('position:relative;display:flex;gap:12px;justify-content:center')}>
            <Hov as="button" onClick={() => navigate('/register')} style="padding:13px 26px;font-weight:700;font-size:15px;color:#1c1d22;background:#fff;border-radius:10px" styleHover="transform:translateY(-1px)">Создать аккаунт</Hov>
            <Hov as="button" onClick={demo} style="padding:13px 24px;font-weight:700;font-size:15px;color:#fff;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);border-radius:10px" styleHover="background:rgba(255,255,255,.2)">Открыть демо</Hov>
          </div>
        </div>
      </section>

      <footer style={css('position:relative;border-top:1px solid var(--border);padding:28px 32px')}>
        <div style={css('max-width:1180px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px')}>
          <div style={css('display:flex;align-items:center;gap:10px;color:var(--text-2)')}>
            <div style={css('width:26px;height:26px;border-radius:7px;background:linear-gradient(150deg,#4f46e5,#7c6cf0);display:flex;align-items:center;justify-content:center')}>
              <Icon name="check" size={14} color="#fff" strokeWidth={2.6} />
            </div>
            <span style={css('font-weight:700;color:var(--text)')}>TaskFlow</span>
            <span style={css('font-size:13px;color:var(--text-3)')}>— учебный pet-проект</span>
          </div>
          <div style={css('font-size:13px;color:var(--text-3);font-family:var(--mono)')}>React · Vite · React Router · Express · SQLite</div>
        </div>
      </footer>
    </div>
  );
}
