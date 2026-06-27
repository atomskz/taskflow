// Date utilities (no external deps). All dates are normalized to local midnight.
import { MON } from './constants.js';

export const sod = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

export const today = () => sod(new Date());

export const iso = (d) => {
  const x = sod(d);
  return (
    x.getFullYear() +
    '-' +
    String(x.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(x.getDate()).padStart(2, '0')
  );
};

export const parse = (s) => {
  if (!s) return null;
  const p = s.split('-').map(Number);
  return sod(new Date(p[0], p[1] - 1, p[2]));
};

export const addDays = (d, n) => {
  const x = sod(d);
  x.setDate(x.getDate() + n);
  return x;
};

export const diffDays = (a, b) => Math.round((sod(a) - sod(b)) / 86400000);

export const fmt = (s) => {
  const d = parse(s);
  if (!d) return '';
  return d.getDate() + ' ' + MON[d.getMonth()];
};

export const fmtFull = (s) => {
  const d = parse(s);
  if (!d) return '';
  return d.getDate() + ' ' + MON[d.getMonth()] + ' ' + d.getFullYear();
};

export const startOfWeek = (d) => {
  const x = sod(d);
  const wd = (x.getDay() + 6) % 7; // Monday = 0
  return addDays(x, -wd);
};

export const uid = () => 't' + Math.random().toString(36).slice(2, 9);
