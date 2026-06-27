import React from 'react';
import { useNavigate } from 'react-router-dom';
import { css, mix } from '../lib/css.js';
import { Hov } from '../ui.jsx';
import { useApp } from '../store.jsx';

const CARD = 'background:var(--surface);border:1px solid var(--border);border-radius:14px;box-shadow:var(--sh-sm);padding:18px';

const segStyle = (active) => {
  const b = 'flex:1;padding:8px 14px;border-radius:7px;font-size:13.5px;font-weight:600;transition:all .12s;';
  return active ? b + 'background:var(--surface);color:var(--accent-text);box-shadow:var(--sh-sm);' : b + 'background:transparent;color:var(--text-2);';
};
const switchTrack = (on) => 'width:42px;height:24px;border-radius:999px;padding:2px;transition:all .18s;flex-shrink:0;background:' + (on ? 'var(--accent)' : '#d1d3da') + ';';
const switchKnob = (on) => 'width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2);transition:all .18s;transform:translateX(' + (on ? '18px' : '0') + ');';

export default function SettingsPage() {
  const { settings, setSetting, resetDemo, setForcedTasks, toast } = useApp();
  const navigate = useNavigate();

  const goState = (state) => {
    setForcedTasks(state);
    if (state !== 'normal') navigate('/tasks');
  };
  const setDark = () => {
    setSetting('theme', 'dark');
    toast('info', 'Тёмная тема появится в версии 2');
  };

  const stateBtn = 'padding:8px 15px;font-size:13px;font-weight:600;color:var(--text);background:var(--surface);border:1px solid var(--border-2);border-radius:8px';

  return (
    <div style={css('max-width:640px;margin:0 auto;animation:ff .3s ease both;display:flex;flex-direction:column;gap:14px')}>
      {/* Appearance */}
      <div style={css(CARD)}>
        <div style={css('font-weight:700;font-size:15px;margin-bottom:4px')}>Внешний вид</div>
        <div style={css('font-size:13px;color:var(--text-2);margin-bottom:14px')}>Тема оформления интерфейса</div>
        <div style={css('display:flex;gap:6px;background:var(--surface-2);padding:4px;border-radius:9px;max-width:280px')}>
          <button onClick={() => setSetting('theme', 'light')} style={css(segStyle(settings.theme === 'light'))}>☀ Светлая</button>
          <button onClick={setDark} style={css(segStyle(settings.theme === 'dark'))}>☾ Тёмная</button>
        </div>
      </div>

      {/* Calendar & tasks */}
      <div style={css(CARD)}>
        <div style={css('font-weight:700;font-size:15px;margin-bottom:14px')}>Календарь и задачи</div>
        <div style={css('display:flex;align-items:center;justify-content:space-between;padding:11px 0;border-bottom:1px solid var(--border)')}>
          <div style={css('font-weight:600;font-size:14px')}>Первый день недели</div>
          <div style={css('display:flex;gap:6px;background:var(--surface-2);padding:4px;border-radius:9px;width:170px')}>
            <button onClick={() => setSetting('firstDay', 'mon')} style={css(segStyle(settings.firstDay === 'mon'))}>Пн</button>
            <button onClick={() => setSetting('firstDay', 'sun')} style={css(segStyle(settings.firstDay === 'sun'))}>Вс</button>
          </div>
        </div>
        <div style={css('display:flex;align-items:center;justify-content:space-between;padding:11px 0;border-bottom:1px solid var(--border)')}>
          <div>
            <div style={css('font-weight:600;font-size:14px')}>Показывать выполненные</div>
            <div style={css('font-size:12.5px;color:var(--text-3);margin-top:1px')}>В общем списке задач</div>
          </div>
          <button onClick={() => setSetting('showCompleted', !settings.showCompleted)} style={css(switchTrack(settings.showCompleted))}>
            <span style={css(switchKnob(settings.showCompleted))} />
          </button>
        </div>
        <div style={css('display:flex;align-items:center;justify-content:space-between;padding:11px 0')}>
          <div>
            <div style={css('font-weight:600;font-size:14px')}>Задач на дашборде</div>
            <div style={css('font-size:12.5px;color:var(--text-3);margin-top:1px')}>Раздел «Предстоящие»</div>
          </div>
          <div style={css('display:flex;align-items:center;gap:12px')}>
            <input type="range" min="4" max="10" step="1" value={settings.dashCount} onChange={(e) => setSetting('dashCount', parseInt(e.target.value, 10))} style={css('width:120px;accent-color:var(--accent)')} />
            <span style={css('font-family:var(--mono);font-size:14px;font-weight:600;width:18px;text-align:right')}>{settings.dashCount}</span>
          </div>
        </div>
      </div>

      {/* Demo states */}
      <div style={css(CARD)}>
        <div style={css('font-weight:700;font-size:15px;margin-bottom:4px')}>Демо-состояния интерфейса</div>
        <div style={css('font-size:13px;color:var(--text-2);margin-bottom:13px')}>Посмотреть, как выглядит страница задач в разных состояниях</div>
        <div style={css('display:flex;flex-wrap:wrap;gap:8px')}>
          <Hov as="button" onClick={() => goState('normal')} style={stateBtn} styleHover="background:var(--hover)">Обычное</Hov>
          <Hov as="button" onClick={() => goState('loading')} style={stateBtn} styleHover="background:var(--hover)">Загрузка</Hov>
          <Hov as="button" onClick={() => goState('empty')} style={stateBtn} styleHover="background:var(--hover)">Пусто</Hov>
          <Hov as="button" onClick={() => goState('error')} style={stateBtn} styleHover="background:var(--hover)">Ошибка</Hov>
        </div>
      </div>

      {/* Data */}
      <div style={css('background:var(--surface);border:1px solid var(--border);border-radius:14px;box-shadow:var(--sh-sm);padding:18px;display:flex;align-items:center;justify-content:space-between')}>
        <div>
          <div style={css('font-weight:700;font-size:15px')}>Данные</div>
          <div style={css('font-size:13px;color:var(--text-2);margin-top:2px')}>Восстановить демонстрационные задачи</div>
        </div>
        <Hov as="button" onClick={resetDemo} style="padding:9px 16px;font-weight:600;font-size:13.5px;color:var(--text);background:var(--surface);border:1px solid var(--border-2);border-radius:9px" styleHover="background:var(--hover)">Сбросить демо</Hov>
      </div>
    </div>
  );
}
