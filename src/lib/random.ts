import type { Friend } from "./types";
import { getPaymentCount } from "./friends";

export function pickWeightedRandom(friends: Friend[]): Friend | null {
  if (friends.length === 0) return null;

  const weights = friends.map((friend) => Math.max(getPaymentCount(friend), 1));
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let roll = Math.random() * total;

  for (let index = 0; index < friends.length; index += 1) {
    roll -= weights[index];
    if (roll <= 0) return friends[index];
  }

  return friends[friends.length - 1];
}
