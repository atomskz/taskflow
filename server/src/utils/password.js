// Password hashing with Node's built-in scrypt (no native dependency, no bcrypt).
// Format stored in DB: scrypt$<saltHex>$<hashHex>
import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';

const KEYLEN = 64;

export function hashPassword(plain) {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(plain, salt, KEYLEN).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(plain, stored) {
  if (!stored || typeof stored !== 'string') return false;
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'hex');
  const actual = scryptSync(plain, salt, KEYLEN);
  // Lengths always match here, but guard anyway for timingSafeEqual.
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}
