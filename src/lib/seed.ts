import type { Friend, Payment } from "./types";

export const SEED_FRIENDS: Friend[] = [
  {
    id: "1",
    name: "Алишер",
    emoji: "👑",
    payments: [
      { id: "p1", reason: "Заказал тарелку всем, «просто так»", date: "2026-01-15T12:00:00.000Z" },
      { id: "p2", reason: "Проиграл в камень-ножницы-бумага", date: "2026-02-03T18:30:00.000Z" },
      { id: "p3", reason: "Опоздал на 40 минут — штраф по уставу", date: "2026-03-10T14:00:00.000Z" },
      { id: "p4", reason: "Хвастался новой картой", date: "2026-04-22T19:00:00.000Z" },
    ],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Дима",
    emoji: "🍕",
    payments: [
      { id: "p5", reason: "Пришёл последним, счёт уже лежал", date: "2026-01-20T13:00:00.000Z" },
      { id: "p6", reason: "Выиграл спор — проиграл кошелёк", date: "2026-03-05T20:00:00.000Z" },
      { id: "p7", reason: "День рождения у всех, кроме его", date: "2026-05-01T17:00:00.000Z" },
    ],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Саша",
    emoji: "💸",
    payments: [
      { id: "p8", reason: "«Я переведу потом» — не перевёл", date: "2026-02-14T16:00:00.000Z" },
      { id: "p9", reason: "Сел ближе всех к официанту", date: "2026-04-08T15:30:00.000Z" },
    ],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "4",
    name: "Катя",
    emoji: "😇",
    payments: [
      { id: "p10", reason: "Забыла кошелёк (в третий раз)", date: "2026-03-18T12:30:00.000Z" },
    ],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "5",
    name: "Макс",
    emoji: "😤",
    payments: [
      { id: "p11", reason: "Единственный с телефоном без разряженной батареи", date: "2026-06-01T21:00:00.000Z" },
    ],
    updatedAt: new Date().toISOString(),
  },
];

export function migrateFriend(raw: Record<string, unknown>): Friend {
  if (Array.isArray(raw.payments)) {
    return raw as unknown as Friend;
  }

  const payments: Payment[] = [];

  if (typeof raw.reason === "string" && raw.reason.trim()) {
    payments.push({
      id: crypto.randomUUID(),
      reason: raw.reason.trim(),
      date: (raw.updatedAt as string) ?? new Date().toISOString(),
    });
  }

  const score = Number(raw.score) || 0;
  for (let i = 1; i < score; i += 1) {
    payments.push({
      id: crypto.randomUUID(),
      reason: "Причина не указана",
      date: new Date().toISOString(),
    });
  }

  return {
    id: String(raw.id),
    name: String(raw.name),
    emoji: String(raw.emoji ?? "🍽️"),
    payments,
    updatedAt: String(raw.updatedAt ?? new Date().toISOString()),
  };
}
