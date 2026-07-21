import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const COOKIE_NAME = "nakrit_admin";
const MAX_AGE = 60 * 60 * 24 * 7;

function getSecret(): Uint8Array {
  const secret = process.env.AUTH_SECRET ?? process.env.ADMIN_PASSWORD;

  if (!secret) {
    throw new Error("AUTH_SECRET or ADMIN_PASSWORD must be set");
  }

  return new TextEncoder().encode(secret);
}

export function verifyAdminPassword(password: string): boolean {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) return false;

  return password === adminPassword;
}

export async function createAdminSession(): Promise<string> {
  return new SignJWT({ role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(getSecret());
}

export async function isAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return false;

  try {
    await jwtVerify(token, getSecret());
    return true;
  } catch {
    return false;
  }
}

export { COOKIE_NAME, MAX_AGE };
