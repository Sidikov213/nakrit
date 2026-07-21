import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/auth";
import { getFriends, saveFriends } from "@/lib/db";
import type { PaymentInput } from "@/lib/types";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string; paymentId: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, paymentId } = await context.params;
  const body = (await request.json()) as PaymentInput;
  const friends = await getFriends();
  const index = friends.findIndex((friend) => friend.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const paymentIndex = friends[index].payments.findIndex(
    (payment) => payment.id === paymentId,
  );

  if (paymentIndex === -1) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  friends[index].payments[paymentIndex] = {
    ...friends[index].payments[paymentIndex],
    reason: body.reason?.trim() || friends[index].payments[paymentIndex].reason,
  };
  friends[index].updatedAt = new Date().toISOString();

  await saveFriends(friends);
  return NextResponse.json(friends[index]);
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, paymentId } = await context.params;
  const friends = await getFriends();
  const index = friends.findIndex((friend) => friend.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const before = friends[index].payments.length;
  friends[index].payments = friends[index].payments.filter(
    (payment) => payment.id !== paymentId,
  );

  if (friends[index].payments.length === before) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  friends[index].updatedAt = new Date().toISOString();
  await saveFriends(friends);
  return NextResponse.json(friends[index]);
}
