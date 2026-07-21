import { NextResponse } from "next/server";
import { getFriends } from "@/lib/db";
import { pickWeightedRandom } from "@/lib/random";

export const dynamic = "force-dynamic";

export async function POST() {
  const friends = await getFriends();

  if (friends.length === 0) {
    return NextResponse.json(
      { error: "Список пуст — добавь друзей в админке" },
      { status: 400 },
    );
  }

  const winner = pickWeightedRandom(friends);

  return NextResponse.json({
    winner,
    message: `${winner?.emoji} ${winner?.name} накрывает сегодня!`,
  });
}
