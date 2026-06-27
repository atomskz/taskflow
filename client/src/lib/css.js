// Tiny helpers to keep the prototype's inline-style strings while staying valid React.
// css('color:red;padding:8px') -> { color: 'red', padding: '8px' }
// Custom properties (--accent) and var(...) values pass through untouched.

export function css(str) {
  if (!str) return undefined;
  if (typeof str === 'object') return str;
  const out = {};
  for (const decl of str.split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    if (!prop) continue;
    const val = decl.slice(i + 1).trim();
    const key = prop.startsWith('--')
      ? prop
      : prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    out[key] = val;
  }
  return out;
}

// Merge any number of style strings/objects (falsy entries ignored). Later wins.
export function mix(...parts) {
  const out = {};
  for (const p of parts) {
    if (!p) continue;
    Object.assign(out, typeof p === 'string' ? css(p) : p);
  }
  return out;
}
