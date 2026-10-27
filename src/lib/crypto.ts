import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 96 bits recommended for GCM

function getMasterKeyBuffer(customKey?: string): Buffer {
  const masterKey = customKey || process.env.ENCRYPTION_MASTER_KEY || 'default-secret-encryption-master-key-32b';
  // Derive exactly 32 bytes using sha256 to ensure valid key length regardless of format
  return crypto.createHash('sha256').update(masterKey).digest();
}

export interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
}

/**
 * Encrypts a sensitive string (e.g. BYOK LLM API Key) using AES-256-GCM.
 */
export function encryptApiKey(plainKey: string, customMasterKey?: string): EncryptedData {
  if (!plainKey) {
    throw new Error('API key to encrypt cannot be empty.');
  }

  const key = getMasterKeyBuffer(customMasterKey);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plainKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');

  return {
    encrypted,
    iv: iv.toString('hex'),
    tag,
  };
}

/**
 * Decrypts an AES-256-GCM encrypted API key. Returns plaintext strictly into RAM.
 */
export function decryptApiKey(
  encryptedHex: string,
  ivHex: string,
  tagHex: string,
  customMasterKey?: string
): string {
  if (!encryptedHex || !ivHex || !tagHex) {
    throw new Error('Missing encryption parameters for decryption.');
  }

  const key = getMasterKeyBuffer(customMasterKey);
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

/**
 * Mask an API key for safe display in UI (e.g., "sk-proj-...a8F9")
 */
export function maskApiKey(apiKey: string): string {
  if (!apiKey || apiKey.length < 8) return '********';
  const prefix = apiKey.slice(0, 7);
  const suffix = apiKey.slice(-4);
  return `${prefix}...${suffix}`;
}
