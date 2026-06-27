import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store.jsx';
import './SettingsPage.css';

export default function SettingsPage() {
  const { settings, setSetting, resetDemo, setForcedTasks } = useApp();
  const navigate = useNavigate();

  const goState = (state) => {
    setForcedTasks(state);
    if (state !== 'normal') navigate('/tasks');
  };

  return (
    <div className="page set-page">
      {/* Appearance */}
      <div className="card card--pad">
        <div className="set-section-title">Внешний вид</div>
        <div className="set-section-sub">Тема оформления интерфейса</div>
        <div className="seg-group set-seg-theme">
          <button onClick={() => setSetting('theme', 'light')} className={'seg' + (settings.theme === 'light' ? ' is-active' : '')}>☀ Светлая</button>
          <button onClick={() => setSetting('theme', 'dark')} className={'seg' + (settings.theme === 'dark' ? ' is-active' : '')}>☾ Тёмная</button>
        </div>
      </div>

      {/* Calendar & tasks */}
      <div className="card card--pad">
        <div className="set-section-title set-section-title--tight">Календарь и задачи</div>
        <div className="set-row">
          <div className="set-row-title">Первый день недели</div>
          <div className="seg-group set-seg-firstday">
            <button onClick={() => setSetting('firstDay', 'mon')} className={'seg' + (settings.firstDay === 'mon' ? ' is-active' : '')}>Пн</button>
            <button onClick={() => setSetting('firstDay', 'sun')} className={'seg' + (settings.firstDay === 'sun' ? ' is-active' : '')}>Вс</button>
          </div>
        </div>
        <div className="set-row">
          <div>
            <div className="set-row-title">Показывать выполненные</div>
            <div className="set-row-sub">В общем списке задач</div>
          </div>
          <button onClick={() => setSetting('showCompleted', !settings.showCompleted)} className={'switch' + (settings.showCompleted ? ' is-on' : '')}>
            <span className="switch__knob" />
          </button>
        </div>
        <div className="set-row set-row--last">
          <div>
            <div className="set-row-title">Задач на дашборде</div>
            <div className="set-row-sub">Раздел «Предстоящие»</div>
          </div>
          <div className="set-range-wrap">
            <input type="range" min="4" max="10" step="1" value={settings.dashCount} onChange={(e) => setSetting('dashCount', parseInt(e.target.value, 10))} className="set-range" />
            <span className="set-range-val">{settings.dashCount}</span>
          </div>
        </div>
      </div>

      {/* Demo states */}
      <div className="card card--pad">
        <div className="set-section-title">Демо-состояния интерфейса</div>
        <div className="set-section-sub set-section-sub--13">Посмотреть, как выглядит страница задач в разных состояниях</div>
        <div className="set-states">
          <button onClick={() => goState('normal')} className="btn btn--ghost set-state-btn">Обычное</button>
          <button onClick={() => goState('loading')} className="btn btn--ghost set-state-btn">Загрузка</button>
          <button onClick={() => goState('empty')} className="btn btn--ghost set-state-btn">Пусто</button>
          <button onClick={() => goState('error')} className="btn btn--ghost set-state-btn">Ошибка</button>
        </div>
      </div>

      {/* Data */}
      <div className="card card--pad set-data-card">
        <div>
          <div className="set-data-title">Данные</div>
          <div className="set-data-sub">Восстановить демонстрационные задачи</div>
        </div>
        <button onClick={resetDemo} className="btn btn--ghost set-reset-btn">Сбросить демо</button>
      </div>
    </div>
  );
}
