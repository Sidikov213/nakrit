import { NextResponse } from "next/server";
import {
  COOKIE_NAME,
  MAX_AGE,
  createAdminSession,
  verifyAdminPassword,
} from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { password } = (await request.json()) as { password?: string };

  if (!password || !verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Неверный пароль" }, { status: 401 });
  }

  const token = await createAdminSession();
  const response = NextResponse.json({ ok: true });

  response.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(COOKIE_NAME);
  return response;
}
