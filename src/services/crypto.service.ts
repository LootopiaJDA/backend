import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scrypt,
} from 'node:crypto';
import { promisify } from 'node:util';

// Promisify scrypt for easier async/await usage
const scryptAsync = promisify(scrypt);

// Cache the key to avoid recalculating it on every encryption/decryption
let cachedKey: Buffer | null = null;

/**
 * Get key for encryption/decryption, if not cached, derive it from password.
 * @returns {Promise<Buffer>} - The encryption key.
 */
async function getKey(): Promise<Buffer> {
  if (cachedKey) return cachedKey;

  const password = process.env.ENCRYPTION_PASSWORD;
  if (!password) {
    throw new Error('ENCRYPTION_PASSWORD is not defined');
  }

  cachedKey = (await scryptAsync(password, 'salt', 32)) as Buffer;
  return cachedKey;
}

/**
 * Return the parameter with encryption applied.
 *
 * @param {string} plainText - Text to encrypt.
 * @returns {Promise<string>} - Encrypted text.
 */
export async function encryptText(plainText: string): Promise<string> {
  const key = await getKey();
  const iv = randomBytes(16);

  const cipher = createCipheriv('aes-256-ctr', key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final(),
  ]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Return the parameter with decryption applied.
 *
 * @param {string} payload - Text to decrypt.
 * @returns {Promise<string>} - Decrypted text.
 */
export async function decryptText(payload: string): Promise<string> {
  const key = await getKey();
  const [ivHex, encryptedHex] = payload.split(':');

  if (!ivHex || !encryptedHex) {
    throw new Error('Invalid encrypted payload');
  }

  const iv = Buffer.from(ivHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');

  const decipher = createDecipheriv('aes-256-ctr', key, iv);
  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}
