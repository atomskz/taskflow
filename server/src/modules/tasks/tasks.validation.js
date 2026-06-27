import { z } from 'zod';

export const STATUSES = ['todo', 'in_progress', 'done', 'archived'];
export const PRIORITIES = ['low', 'medium', 'high', 'critical'];

// Empty strings from the form are treated as "no value" (null).
const emptyToNull = (v) => (v === '' || v === undefined ? null : v);

const dateField = z.preprocess(
  emptyToNull,
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Некорректная дата')
    .nullable()
);
const timeField = z.preprocess(
  emptyToNull,
  z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Некорректное время')
    .nullable()
);

const titleField = z
  .string({ required_error: 'Название обязательно' })
  .trim()
  .min(3, 'Минимум 3 символа')
  .max(100, 'Максимум 100 символов');

const descriptionField = z.string().max(1000, 'Максимум 1000 символов');

const tagsField = z.array(z.string().trim().min(1).max(40)).max(20, 'Слишком много тегов');

// endTime must not be earlier than startTime when both are present.
const timeOrderRefine = (data, ctx) => {
  if (data.startTime && data.endTime && data.endTime < data.startTime) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['endTime'],
      message: 'Раньше времени начала',
    });
  }
};

export const createTaskSchema = z
  .object({
    title: titleField,
    description: descriptionField.optional().default(''),
    status: z.enum(STATUSES).default('todo'),
    priority: z.enum(PRIORITIES).default('medium'),
    dueDate: dateField.optional().default(null),
    calendarDate: dateField.optional().default(null),
    startTime: timeField.optional().default(null),
    endTime: timeField.optional().default(null),
    tags: tagsField.optional().default([]),
  })
  .superRefine(timeOrderRefine);

// Update: every field optional, no defaults (so omitted fields are left as-is).
export const updateTaskSchema = z
  .object({
    title: titleField.optional(),
    description: descriptionField.optional(),
    status: z.enum(STATUSES).optional(),
    priority: z.enum(PRIORITIES).optional(),
    dueDate: dateField.optional(),
    calendarDate: dateField.optional(),
    startTime: timeField.optional(),
    endTime: timeField.optional(),
    tags: tagsField.optional(),
  })
  .superRefine(timeOrderRefine);
