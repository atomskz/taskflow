// Tiny structured (JSON-lines) logger. Dependency-free, in keeping with the
// rest of the backend. Each call emits one JSON object per line — easy to ship
// to a log collector. In non-prod, output stays human-readable enough to scan.
function emit(level, msg, fields) {
  const line = { level, time: new Date().toISOString(), msg, ...fields };
  const out = level === 'error' ? process.stderr : process.stdout;
  out.write(JSON.stringify(line) + '\n');
}

export const logger = {
  info: (msg, fields) => emit('info', msg, fields),
  warn: (msg, fields) => emit('warn', msg, fields),
  error: (msg, fields) => emit('error', msg, fields),
};
