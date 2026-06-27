import { z } from 'zod';

// Canonical UI preferences. Kept in sync with the client's DEFAULT_SETTINGS
// (client/src/store.jsx). The server is the source of truth so values sync
// across devices; unknown keys are dropped, bad values rejected.
export const DEFAULT_SETTINGS = {
  firstDay: 'mon',
  showCompleted: true,
  dashCount: 6,
  dateFormat: 'dmy',
  theme: 'light',
};

// PATCH is partial: every field optional, no defaults (omitted = unchanged).
export const settingsSchema = z
  .object({
    firstDay: z.enum(['mon', 'sun']),
    showCompleted: z.boolean(),
    dashCount: z.number().int().min(4).max(10),
    dateFormat: z.enum(['dmy', 'mdy', 'iso']),
    theme: z.enum(['light', 'dark']),
  })
  .partial()
  .strict();
