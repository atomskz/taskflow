// Integration smoke tests for the TaskFlow API. Uses an isolated in-temp SQLite
// file and the real Express app over an ephemeral port. Run with: npm test
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

// Point the DB at a throwaway file BEFORE importing anything that opens it.
const tmpDb = path.join(os.tmpdir(), `taskflow-test-${process.pid}.db`);
process.env.DATABASE_FILE = tmpDb;
process.env.JWT_SECRET = 'test-secret';

const { createApp } = await import('../src/app.js');
const { migrate } = await import('../src/db/migrate.js');

let server;
let base;

before(async () => {
  migrate();
  const app = createApp();
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      base = `http://localhost:${server.address().port}/api`;
      resolve();
    });
  });
});

after(() => {
  server?.close();
  for (const f of [tmpDb, `${tmpDb}-wal`, `${tmpDb}-shm`]) {
    try {
      fs.unlinkSync(f);
    } catch {
      /* ignore */
    }
  }
});

const json = (res) => res.json();

test('register validates weak password', async () => {
  const res = await fetch(`${base}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test', email: 'weak@x.io', password: 'short' }),
  });
  assert.equal(res.status, 400);
  const body = await json(res);
  assert.ok(body.error.fields.password);
});

let token;

test('register + auto-login returns a token', async () => {
  const res = await fetch(`${base}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email: 'test@x.io', password: 'abcd1234' }),
  });
  assert.equal(res.status, 201);
  const body = await json(res);
  assert.ok(body.token);
  assert.equal(body.user.email, 'test@x.io');
  token = body.token;
});

test('duplicate email is rejected with 409', async () => {
  const res = await fetch(`${base}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test Two', email: 'test@x.io', password: 'abcd1234' }),
  });
  assert.equal(res.status, 409);
});

test('wrong password returns generic 401', async () => {
  const res = await fetch(`${base}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@x.io', password: 'nope' }),
  });
  assert.equal(res.status, 401);
});

test('tasks require auth', async () => {
  const res = await fetch(`${base}/tasks`);
  assert.equal(res.status, 401);
});

const auth = () => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' });

test('create, complete and delete a task', async () => {
  // create
  let res = await fetch(`${base}/tasks`, {
    method: 'POST',
    headers: auth(),
    body: JSON.stringify({ title: 'My first task', priority: 'high', tags: ['t'] }),
  });
  assert.equal(res.status, 201);
  const { task } = await json(res);
  assert.equal(task.status, 'todo');
  assert.equal(task.priority, 'high');
  assert.deepEqual(task.tags, ['t']);

  // complete
  res = await fetch(`${base}/tasks/${task.id}/complete`, { method: 'POST', headers: auth() });
  const done = (await json(res)).task;
  assert.equal(done.status, 'done');
  assert.ok(done.completedAt);

  // delete
  res = await fetch(`${base}/tasks/${task.id}`, { method: 'DELETE', headers: auth() });
  assert.equal(res.status, 204);

  // gone
  res = await fetch(`${base}/tasks/${task.id}`, { headers: auth() });
  assert.equal(res.status, 404);
});

test('create rejects endTime before startTime', async () => {
  const res = await fetch(`${base}/tasks`, {
    method: 'POST',
    headers: auth(),
    body: JSON.stringify({ title: 'Bad times', startTime: '10:00', endTime: '09:00' }),
  });
  assert.equal(res.status, 400);
  const body = await json(res);
  assert.ok(body.error.fields.endTime);
});

test('tasks query: filter by status/priority, search, sort, paginate', async () => {
  // fresh user so counts are deterministic
  const reg = await fetch(`${base}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Query', email: 'query@x.io', password: 'abcd1234' }),
  });
  const tok = (await json(reg)).token;
  const h = () => ({ Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' });

  const make = (body) => fetch(`${base}/tasks`, { method: 'POST', headers: h(), body: JSON.stringify(body) });
  await make({ title: 'Alpha report', priority: 'low', tags: ['work'] });
  await make({ title: 'Beta launch', priority: 'critical', tags: ['urgent'] });
  await make({ title: 'Gamma cleanup', priority: 'high', tags: ['work'] });

  // no filters → all three, with total
  let res = await fetch(`${base}/tasks`, { headers: h() });
  let body = await json(res);
  assert.equal(body.total, 3);
  assert.equal(body.tasks.length, 3);

  // priority filter
  res = await fetch(`${base}/tasks?priority=critical`, { headers: h() });
  body = await json(res);
  assert.equal(body.total, 1);
  assert.equal(body.tasks[0].title, 'Beta launch');

  // search (matches title or tags)
  res = await fetch(`${base}/tasks?search=work`, { headers: h() });
  body = await json(res);
  assert.equal(body.total, 2);

  // sort by priority desc → critical first
  res = await fetch(`${base}/tasks?sort=priority_desc`, { headers: h() });
  body = await json(res);
  assert.equal(body.tasks[0].priority, 'critical');

  // pagination: limit 2 returns 2 of total 3
  res = await fetch(`${base}/tasks?limit=2&offset=0`, { headers: h() });
  body = await json(res);
  assert.equal(body.total, 3);
  assert.equal(body.tasks.length, 2);
  res = await fetch(`${base}/tasks?limit=2&offset=2`, { headers: h() });
  body = await json(res);
  assert.equal(body.tasks.length, 1);
});

test('settings: returns defaults, persists a patch, rejects bad values', async () => {
  // defaults for a fresh user
  let res = await fetch(`${base}/settings`, { headers: auth() });
  assert.equal(res.status, 200);
  let body = await json(res);
  assert.equal(body.settings.theme, 'light');
  assert.equal(body.settings.dashCount, 6);

  // partial update is merged and echoed back in full
  res = await fetch(`${base}/settings`, {
    method: 'PATCH',
    headers: auth(),
    body: JSON.stringify({ theme: 'dark', dashCount: 9 }),
  });
  assert.equal(res.status, 200);
  body = await json(res);
  assert.equal(body.settings.theme, 'dark');
  assert.equal(body.settings.dashCount, 9);
  assert.equal(body.settings.firstDay, 'mon'); // untouched default preserved

  // persisted across requests
  res = await fetch(`${base}/settings`, { headers: auth() });
  assert.equal((await json(res)).settings.theme, 'dark');

  // invalid value rejected
  res = await fetch(`${base}/settings`, {
    method: 'PATCH',
    headers: auth(),
    body: JSON.stringify({ dashCount: 99 }),
  });
  assert.equal(res.status, 400);
});

test('users only see their own tasks', async () => {
  // second user
  const r = await fetch(`${base}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Other', email: 'other@x.io', password: 'abcd1234' }),
  });
  const otherToken = (await json(r)).token;

  // user 1 creates a task
  const created = await fetch(`${base}/tasks`, {
    method: 'POST',
    headers: auth(),
    body: JSON.stringify({ title: 'Private task' }),
  });
  const id = (await json(created)).task.id;

  // user 2 cannot read it
  const res = await fetch(`${base}/tasks/${id}`, {
    headers: { Authorization: `Bearer ${otherToken}` },
  });
  assert.equal(res.status, 404);
});
