// Validate req.body against a zod schema. On success, the parsed/normalized
// value is placed on req.validated. On failure, a 400 with per-field messages.
import { badRequest } from '../utils/errors.js';

export function validate(schema) {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body ?? {});
    if (!result.success) {
      const fields = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (key != null && fields[key] == null) fields[key] = issue.message;
      }
      return next(badRequest('Проверьте правильность заполнения полей', fields));
    }
    req.validated = result.data;
    next();
  };
}
