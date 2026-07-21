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

    await new Promise((resolve) => setTimeout(resolve, 1500));

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
    <section className="relative overflow-hidden rounded-3xl border border-amber-500/25 bg-gradient-to-br from-amber-500/12 via-zinc-900/90 to-zinc-950 p-8 text-center shadow-2xl shadow-amber-500/10">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-amber-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-orange-500/10 blur-3xl" />

      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-400/80">
        Решаем судьбу
      </p>
      <h2 className="mt-3 text-3xl font-black text-white sm:text-4xl">
        Кто накроет сегодня?
      </h2>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-zinc-400">
        Чем чаще уже накрывал — тем выше шанс снова. Справедливо? Нет. Зато
        смешно.
      </p>

      <button
        type="button"
        onClick={handlePick}
        disabled={spinning}
        className="btn-primary mt-8 rounded-full px-10 py-3.5 text-base font-bold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {spinning ? "Крутим барабан..." : "🎲 Выбрать случайно"}
      </button>

      {spinning && (
        <div className="mt-8 animate-float text-6xl">🎰</div>
      )}

      {result && !spinning && (
        <div className="mt-8 animate-in rounded-2xl border border-amber-400/30 bg-amber-400/10 p-6 ring-1 ring-amber-400/20">
          <p className="text-6xl">{result.emoji}</p>
          <p className="mt-3 text-3xl font-black text-amber-100">{result.name}</p>
          <p className="mt-1 text-sm text-zinc-400">
            Уже накрывал {pluralTimes(getPaymentCount(result))}
          </p>
          <p className="mt-4 inline-block rounded-full bg-amber-400/20 px-4 py-1.5 text-base font-semibold text-amber-200">
            Сегодня платит {result.name}! 💸
          </p>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </section>
  );
}
