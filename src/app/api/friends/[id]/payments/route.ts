import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/auth";
import { getFriends, saveFriends } from "@/lib/db";
import type { PaymentInput } from "@/lib/types";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, context: RouteContext) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as PaymentInput;

  if (!body.reason?.trim()) {
    return NextResponse.json({ error: "Reason is required" }, { status: 400 });
  }

  const friends = await getFriends();
  const index = friends.findIndex((friend) => friend.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const payment = {
    id: crypto.randomUUID(),
    reason: body.reason.trim(),
    date: new Date().toISOString(),
  };

  friends[index] = {
    ...friends[index],
    payments: [...friends[index].payments, payment],
    updatedAt: new Date().toISOString(),
  };

  await saveFriends(friends);
  return NextResponse.json(friends[index], { status: 201 });
}
