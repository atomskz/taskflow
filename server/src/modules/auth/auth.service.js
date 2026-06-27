// Business logic for authentication. Pure functions over the repo + crypto utils.
import { createUser, findByEmail, findById, toPublicUser } from '../users/users.repo.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { signToken } from '../../utils/token.js';
import { conflict, unauthorized, notFound } from '../../utils/errors.js';

export function register({ name, email, password }) {
  if (findByEmail(email)) {
    throw conflict('Этот email уже зарегистрирован');
  }
  const user = createUser({ name, email, passwordHash: hashPassword(password) });
  const token = signToken(user.id);
  return { token, user: toPublicUser(user) };
}

export function login({ email, password }) {
  const user = findByEmail(email);
  // Same generic message whether the user is missing or the password is wrong,
  // so we don't leak which emails are registered.
  if (!user || !verifyPassword(password, user.password_hash)) {
    throw unauthorized('Неверный email или пароль');
  }
  const token = signToken(user.id);
  return { token, user: toPublicUser(user) };
}

export function getCurrentUser(userId) {
  const user = findById(userId);
  if (!user) throw notFound('Пользователь не найден');
  return toPublicUser(user);
}
