import type { Friend } from "./types";

export function getPaymentCount(friend: Friend): number {
  return friend.payments.length;
}

export function sortByPayments(friends: Friend[]): Friend[] {
  return [...friends].sort(
    (a, b) => getPaymentCount(b) - getPaymentCount(a),
  );
}

export function pluralTimes(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return `${count} раз`;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return `${count} раза`;
  }
  return `${count} раз`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
