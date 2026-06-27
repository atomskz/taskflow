// Typed application error. Thrown anywhere in the request lifecycle and turned
// into a clean JSON response by the central error middleware.
export class ApiError extends Error {
  constructor(status, message, fields = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields; // optional { fieldName: 'message' } for form validation
  }
}

export const badRequest = (msg, fields) => new ApiError(400, msg, fields);
export const unauthorized = (msg = 'Требуется авторизация') => new ApiError(401, msg);
export const forbidden = (msg = 'Доступ запрещён') => new ApiError(403, msg);
export const notFound = (msg = 'Не найдено') => new ApiError(404, msg);
export const conflict = (msg) => new ApiError(409, msg);
export const tooManyRequests = (msg = 'Слишком много запросов') => new ApiError(429, msg);
