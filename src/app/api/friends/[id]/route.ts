import { NextResponse } from "next/server";
import { isAdminSession } from "@/lib/auth";
import { getFriends, saveFriends } from "@/lib/db";
import type { FriendInput } from "@/lib/types";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as FriendInput;
  const friends = await getFriends();
  const index = friends.findIndex((friend) => friend.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = {
    ...friends[index],
    name: body.name?.trim() || friends[index].name,
    emoji: body.emoji?.trim() || friends[index].emoji,
    updatedAt: new Date().toISOString(),
  };

  friends[index] = updated;
  try {
    await saveFriends(friends);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save changes";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!(await isAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const friends = await getFriends();
    const filtered = friends.filter((friend) => friend.id !== id);

    if (filtered.length === friends.length) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await saveFriends(filtered);
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to save changes";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
