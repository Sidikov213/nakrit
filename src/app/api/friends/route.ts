import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/auth";
import { getFriends, saveFriends } from "@/lib/db";
import type { FriendInput } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const friends = await getFriends();
  return NextResponse.json(friends);
}

export async function POST(request: Request) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as FriendInput;

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const friends = await getFriends();
  const newFriend = {
    id: crypto.randomUUID(),
    name: body.name.trim(),
    emoji: body.emoji?.trim() || "🍽️",
    payments: [],
    updatedAt: new Date().toISOString(),
  };

  await saveFriends([...friends, newFriend]);
  return NextResponse.json(newFriend, { status: 201 });
}
