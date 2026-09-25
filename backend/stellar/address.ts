/**
 * Validación de claves públicas de Stellar (G…), incluido el checksum.
 *
 * Una dirección es base32 de 35 bytes: 1 byte de versión (6 << 3 para cuentas),
 * 32 bytes de clave y 2 bytes de CRC16-XModem (little-endian) sobre los 33 primeros.
 * Comprobar solo el formato dejaría pasar una dirección con un carácter cambiado, y un error
 * así desvía los cobros a otra cuenta. Sin dependencias: se usa en el servidor y en el navegador.
 */

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const ACCOUNT_VERSION_BYTE = 6 << 3;

function decodeBase32(value: string): Uint8Array | null {
  const bytes: number[] = [];
  let buffer = 0;
  let bits = 0;

  for (const char of value) {
    const index = BASE32_ALPHABET.indexOf(char);
    if (index === -1) return null;

    buffer = (buffer << 5) | index;
    bits += 5;

    if (bits >= 8) {
      bits -= 8;
      bytes.push((buffer >> bits) & 0xff);
    }
  }

  return Uint8Array.from(bytes);
}

function crc16Xmodem(data: Uint8Array): number {
  let crc = 0;

  for (const byte of data) {
    crc ^= byte << 8;
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }

  return crc;
}

/** true si es una clave pública de cuenta Stellar válida (formato y checksum). */
export function isValidStellarPublicKey(value: string): boolean {
  if (!/^G[A-Z2-7]{55}$/.test(value)) return false;

  const decoded = decodeBase32(value);
  if (!decoded || decoded.length !== 35 || decoded[0] !== ACCOUNT_VERSION_BYTE) return false;

  const payload = decoded.subarray(0, 33);
  const checksum = decoded[33] | (decoded[34] << 8);

  return crc16Xmodem(payload) === checksum;
}
