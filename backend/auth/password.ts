import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keyLength: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;
const LEGACY_PREFIX = "toy-hash:";

/** Genera un hash scrypt con sal aleatoria: "scrypt$<sal>$<hash>". */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(password, salt, KEY_LENGTH);

  return `scrypt$${salt.toString("base64")}$${hash.toString("base64")}`;
}

/**
 * Compara una contraseña con el hash guardado.
 * `needsRehash` indica que el hash es del formato viejo (toy-hash) y conviene reemplazarlo.
 */
export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<{ valid: boolean; needsRehash: boolean }> {
  if (storedHash.startsWith(LEGACY_PREFIX)) {
    const valid = safeEqual(
      Buffer.from(storedHash),
      Buffer.from(`${LEGACY_PREFIX}${password}`),
    );

    return { valid, needsRehash: valid };
  }

  const [scheme, saltBase64, hashBase64] = storedHash.split("$");

  if (scheme !== "scrypt" || !saltBase64 || !hashBase64) {
    return { valid: false, needsRehash: false };
  }

  const expected = Buffer.from(hashBase64, "base64");
  const actual = await scryptAsync(password, Buffer.from(saltBase64, "base64"), expected.length);

  return { valid: safeEqual(actual, expected), needsRehash: false };
}

function safeEqual(a: Buffer, b: Buffer): boolean {
  return a.length === b.length && timingSafeEqual(a, b);
}
