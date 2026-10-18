import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

/**
 * Password hashing with scrypt (memory-hard, in Node's standard library).
 * Stored as `scrypt$N$r$p$salt$hash`, so parameters can be raised later
 * without invalidating existing hashes.
 */
const PARAMS = { N: 2 ** 15, r: 8, p: 1 };
const KEY_LENGTH = 32;

export const PASSWORD_MIN = 10;
export const PASSWORD_MAX = 200;

function derive(password: string, salt: Buffer, options: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password.normalize("NFKC"), salt, KEY_LENGTH, { ...options, maxmem: 256 * 1024 * 1024 }, (error, key) =>
      error ? reject(error) : resolve(key),
    );
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const key = await derive(password, salt, PARAMS);
  return ["scrypt", PARAMS.N, PARAMS.r, PARAMS.p, salt.toString("base64url"), key.toString("base64url")].join("$");
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [scheme, N, r, p, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64url");
  const key = await derive(password, Buffer.from(salt, "base64url"), { N: Number(N), r: Number(r), p: Number(p) });
  return key.length === expected.length && timingSafeEqual(key, expected);
}

/** Hash checked when the account does not exist, so both cases take the same time. */
let dummy: Promise<string> | null = null;
export async function verifyAgainstNothing(password: string): Promise<false> {
  dummy ??= hashPassword("not a real password");
  await verifyPassword(password, await dummy);
  return false;
}

export function passwordProblem(password: unknown): "too_short" | "too_long" | null {
  if (typeof password !== "string" || password.length < PASSWORD_MIN) return "too_short";
  if (password.length > PASSWORD_MAX) return "too_long";
  return null;
}
