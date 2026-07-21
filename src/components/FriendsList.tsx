"use client";

import { useState } from "react";
import { formatDate, getPaymentCount, pluralTimes } from "@/lib/friends";
import type { Friend } from "@/lib/types";

type FriendsListProps = {
  friends: Friend[];
};

export function FriendsList({ friends }: FriendsListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const maxCount = Math.max(...friends.map(getPaymentCount), 1);

  if (friends.length === 0) return null;

  return (
    <section>
      <h2 className="section-title mb-2">
        <span>📋</span>
        <span>Полный список</span>
      </h2>
      <p className="mb-6 text-sm text-zinc-500">
        Нажми на человека — увидишь причину каждого раза
      </p>
      <div className="space-y-3">
        {friends.map((friend, index) => {
          const count = getPaymentCount(friend);
          const isExpanded = expandedId === friend.id;

          return (
            <article
              key={friend.id}
              className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
                isExpanded
                  ? "border-amber-500/30 bg-zinc-900/80 shadow-lg shadow-amber-500/5"
                  : "border-zinc-800/80 bg-zinc-900/40 hover:border-zinc-700"
              }`}
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedId(isExpanded ? null : friend.id)
                }
                className="w-full p-4 text-left sm:p-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-zinc-800 text-xs font-bold text-zinc-400">
                      {index + 1}
                    </span>
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-800/80 text-2xl ring-1 ring-zinc-700/50">
                      {friend.emoji}
                    </span>
                    <div>
                      <p className="font-semibold text-white">{friend.name}</p>
                      <p className="text-sm text-zinc-500">
                        {count === 0
                          ? "Ещё ни разу не накрывал"
                          : `Накрывал ${pluralTimes(count)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-2xl font-black text-amber-300">{count}</p>
                      <p className="text-[10px] uppercase tracking-wider text-zinc-600">
                        накрыл
                      </p>
                    </div>
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full bg-zinc-800 text-xs text-zinc-400 transition-transform duration-200 ${isExpanded ? "rotate-180 bg-amber-500/15 text-amber-300" : ""}`}
                    >
                      ▼
                    </span>
                  </div>
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-zinc-800/80">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-yellow-300 transition-all duration-500"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
              </button>

              {isExpanded && (
                <div className="animate-in border-t border-zinc-800/80 bg-zinc-950/40 px-4 py-4 sm:px-5">
                  {friend.payments.length === 0 ? (
                    <p className="text-sm text-zinc-500">
                      Пока чист — ни разу не платил ✨
                    </p>
                  ) : (
                    <ol className="space-y-2">
                      {friend.payments.map((payment, paymentIndex) => (
                        <li
                          key={payment.id}
                          className="flex gap-3 rounded-xl border border-zinc-800/60 bg-zinc-900/60 px-3 py-3"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-xs font-bold text-amber-300 ring-1 ring-amber-500/20">
                            {paymentIndex + 1}
                          </span>
                          <div>
                            <p className="text-sm leading-relaxed text-zinc-200">
                              {payment.reason}
                            </p>
                            <p className="mt-1 text-xs text-zinc-500">
                              {formatDate(payment.date)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
