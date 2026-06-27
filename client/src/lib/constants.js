// Domain constants: priorities, statuses, localized month / weekday names.

// `soft` uses a translucent tint of `color` so the pills read on both the light
// and dark surfaces (a solid pastel would stay bright in dark mode). Neutral
// statuses use a mid-gray text that stays legible on either background.
export const PRI = {
  low: { label: 'Низкий', color: '#16a34a', soft: 'rgba(22,163,74,0.15)', rank: 1 },
  medium: { label: 'Средний', color: '#2563eb', soft: 'rgba(37,99,235,0.15)', rank: 2 },
  high: { label: 'Высокий', color: '#ea580c', soft: 'rgba(234,88,12,0.15)', rank: 3 },
  critical: { label: 'Критичный', color: '#dc2626', soft: 'rgba(220,38,38,0.15)', rank: 4 },
};

export const ST = {
  todo: { label: 'К выполнению', color: '#8b92a0', soft: 'rgba(139,146,160,0.16)', dot: '#9aa0aa', rank: 1 },
  in_progress: { label: 'В работе', color: '#2563eb', soft: 'rgba(37,99,235,0.15)', dot: '#2563eb', rank: 2 },
  done: { label: 'Выполнено', color: '#16a34a', soft: 'rgba(22,163,74,0.15)', dot: '#16a34a', rank: 3 },
  archived: { label: 'В архиве', color: '#9398a3', soft: 'rgba(147,152,163,0.16)', dot: '#c2c6cd', rank: 4 },
};

// Accent palettes for the theme switcher (Settings).
export const ACCENTS = {
  '#4f46e5': { h: '#4338ca', soft: '#eef0ff', soft2: '#e1e4ff', text: '#4338ca' },
  '#7c3aed': { h: '#6d28d9', soft: '#f3edff', soft2: '#e9ddff', text: '#6d28d9' },
  '#2563eb': { h: '#1d4ed8', soft: '#e8f0fe', soft2: '#d3e2fd', text: '#1d4ed8' },
  '#0d9488': { h: '#0f766e', soft: '#e3f6f3', soft2: '#cdeee9', text: '#0f766e' },
};

export const MON = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

export const MONF = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

export const WD = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
