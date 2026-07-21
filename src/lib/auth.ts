import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "nakryt_admin";
const MAX_AGE = 60 * 60 * 24 * 7;

function getSecret(): Uint8Array | null {
  const secret = process.env.AUTH_SECRET ?? process.env.ADMIN_PASSWORD;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

export function verifyAdminPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;
  return password === adminPassword;
}

export async function createAdminSession(): Promise<string> {
  const secret = getSecret();
  if (!secret) {
    throw new Error("ADMIN_PASSWORD and AUTH_SECRET must be configured");
  }

  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secret);
}

export async function isAdminSession(): Promise<boolean> {
  const secret = getSecret();
  if (!secret) return false;

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;

  try {
    await jwtVerify(token, secret);
    return true;
  } catch {
    return false;
  }
}

export { COOKIE_NAME, MAX_AGE };
