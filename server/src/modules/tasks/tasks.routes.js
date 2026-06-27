import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { createTaskSchema, updateTaskSchema } from './tasks.validation.js';
import * as tasks from './tasks.service.js';

export const tasksRouter = Router();

// Every task route requires authentication; req.userId is set by requireAuth.
tasksRouter.use(requireAuth);

// GET /api/tasks — all of the current user's tasks (filtering/sorting is done
// client-side, matching the existing UI; see docs/api.md for query options).
tasksRouter.get('/', (req, res) => {
  res.json({ tasks: tasks.list(req.userId) });
});

// POST /api/tasks/reset-demo — wipe and reseed the user's demo tasks.
tasksRouter.post('/reset-demo', (req, res) => {
  res.json({ tasks: tasks.resetDemo(req.userId) });
});

// POST /api/tasks — create a task.
tasksRouter.post('/', validate(createTaskSchema), (req, res) => {
  res.status(201).json({ task: tasks.create(req.userId, req.validated) });
});

// GET /api/tasks/:id — single task (own only).
tasksRouter.get('/:id', (req, res) => {
  res.json({ task: tasks.get(req.params.id, req.userId) });
});

// PATCH /api/tasks/:id — update fields.
tasksRouter.patch('/:id', validate(updateTaskSchema), (req, res) => {
  res.json({ task: tasks.update(req.params.id, req.userId, req.validated) });
});

// DELETE /api/tasks/:id — permanently delete.
tasksRouter.delete('/:id', (req, res) => {
  tasks.remove(req.params.id, req.userId);
  res.status(204).end();
});

// POST /api/tasks/:id/complete — mark done, stamp completedAt.
tasksRouter.post('/:id/complete', (req, res) => {
  res.json({ task: tasks.complete(req.params.id, req.userId) });
});

// POST /api/tasks/:id/reopen — back to todo, clear completedAt.
tasksRouter.post('/:id/reopen', (req, res) => {
  res.json({ task: tasks.reopen(req.params.id, req.userId) });
});

// POST /api/tasks/:id/archive — move to archive.
tasksRouter.post('/:id/archive', (req, res) => {
  res.json({ task: tasks.archive(req.params.id, req.userId) });
});
