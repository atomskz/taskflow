// Domain constants: priorities, statuses, localized month / weekday names.

export const PRI = {
  low: { label: 'Низкий', color: '#16a34a', soft: '#e7f6ed', rank: 1 },
  medium: { label: 'Средний', color: '#2563eb', soft: '#e8f0fe', rank: 2 },
  high: { label: 'Высокий', color: '#ea580c', soft: '#fdece1', rank: 3 },
  critical: { label: 'Критичный', color: '#dc2626', soft: '#fdeaea', rank: 4 },
};

export const ST = {
  todo: { label: 'К выполнению', color: '#5b6470', soft: '#eef0f2', dot: '#9aa0aa', rank: 1 },
  in_progress: { label: 'В работе', color: '#2563eb', soft: '#e8f0fe', dot: '#2563eb', rank: 2 },
  done: { label: 'Выполнено', color: '#16a34a', soft: '#e7f6ed', dot: '#16a34a', rank: 3 },
  archived: { label: 'В архиве', color: '#8b8f99', soft: '#eef0f2', dot: '#c2c6cd', rank: 4 },
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
