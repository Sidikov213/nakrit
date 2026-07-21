"use client";

import { useState } from "react";
import { getPaymentCount, pluralTimes } from "@/lib/friends";
import type { Friend } from "@/lib/types";

export function RandomPicker() {
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Friend | null>(null);
  const [error, setError] = useState("");

  async function handlePick() {
    setSpinning(true);
    setError("");
    setResult(null);

    await new Promise((resolve) => setTimeout(resolve, 1200));

    try {
      const response = await fetch("/api/random", { method: "POST" });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Что-то пошло не так");
        return;
      }

      setResult(data.winner);
    } catch {
      setError("Не удалось выбрать — попробуй ещё раз");
    } finally {
      setSpinning(false);
    }
  }

  return (
    <section className="surface-elevated rounded-2xl px-6 py-10 text-center sm:px-10">
      <div className="section-heading mx-auto max-w-sm">
        <p className="label">Решаем судьбу</p>
        <h2 className="display mt-2 text-3xl sm:text-4xl">Случайный выбор</h2>
        <p>
          Чем чаще уже накрывал — тем выше шанс. Справедливо? Нет. Зато смешно.
        </p>
      </div>

      <button
        type="button"
        onClick={handlePick}
        disabled={spinning}
        className="btn mt-8 px-8 py-3"
      >
        {spinning ? "Выбираем..." : "Выбрать случайно"}
      </button>

      {spinning && (
        <p className="mt-8 text-sm text-[var(--text-subtle)]">Один момент...</p>
      )}

      {result && !spinning && (
        <div className="animate-in mx-auto mt-8 max-w-sm rounded-xl border border-[var(--accent-soft)] bg-[var(--surface-warm)] px-6 py-8">
          <p className="text-4xl">{result.emoji}</p>
          <p className="display mt-4 text-3xl">{result.name}</p>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            Уже накрывал {pluralTimes(getPaymentCount(result))}
          </p>
          <p className="mt-5 rounded-full bg-[var(--accent-muted)] px-4 py-2 text-sm font-medium text-[var(--accent-hover)]">
            Сегодня платит {result.name}
          </p>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-[#9b4a3a]">{error}</p>}
    </section>
  );
}
