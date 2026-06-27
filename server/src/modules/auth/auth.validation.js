import { z } from 'zod';

// Mirrors the client-side rules in the TZ (section 6.1) so the server is the
// source of truth even if the UI is bypassed.
export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Введите имя' })
    .trim()
    .min(2, 'Минимум 2 символа')
    .max(50, 'Максимум 50 символов'),
  email: z
    .string({ required_error: 'Введите email' })
    .trim()
    .toLowerCase()
    .email('Некорректный email'),
  password: z
    .string({ required_error: 'Введите пароль' })
    .min(8, 'Минимум 8 символов')
    .regex(/[a-zA-Zа-яА-Я]/, 'Нужна хотя бы одна буква')
    .regex(/\d/, 'Нужна хотя бы одна цифра'),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Введите email' })
    .trim()
    .toLowerCase()
    .email('Некорректный email'),
  password: z.string({ required_error: 'Введите пароль' }).min(1, 'Введите пароль'),
});
