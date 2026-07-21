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
      <div className="section-heading">
        <h2>Полный список</h2>
        <p>Нажми на человека — увидишь причину каждого раза</p>
      </div>

      <div className="list-card divide-y divide-[var(--border)] overflow-hidden rounded-xl">
        {friends.map((friend, index) => {
          const count = getPaymentCount(friend);
          const isExpanded = expandedId === friend.id;

          return (
            <article
              key={friend.id}
              className={isExpanded ? "list-expanded" : ""}
            >
              <button
                type="button"
                onClick={() =>
                  setExpandedId(isExpanded ? null : friend.id)
                }
                className="list-row w-full px-5 py-5 text-left transition-colors sm:px-5"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="label w-5 shrink-0 text-center">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="avatar-warm flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl">
                      {friend.emoji}
                    </span>
                    <div>
                      <p className="font-medium text-[var(--text)]">{friend.name}</p>
                      <p className="mt-0.5 text-sm text-[var(--text-subtle)]">
                        {count === 0
                          ? "Ещё ни разу не накрывал"
                          : pluralTimes(count)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="display text-2xl text-[var(--accent)]">{count}</p>
                    <span
                      className={`text-[var(--text-subtle)] transition-transform duration-200 ${isExpanded ? "rotate-180 text-[var(--accent)]" : ""}`}
                    >
                      ↓
                    </span>
                  </div>
                </div>
                <div className="progress-track mt-4 h-1.5 overflow-hidden rounded-full">
                  <div
                    className="progress-fill h-full rounded-full transition-all duration-500"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
              </button>

              {isExpanded && (
                <div className="animate-in border-t border-[var(--border)] bg-[var(--surface-soft)] px-5 py-4">
                  {friend.payments.length === 0 ? (
                    <p className="text-sm text-[var(--text-subtle)]">
                      Пока чист — ни разу не платил
                    </p>
                  ) : (
                    <ol className="space-y-3">
                      {friend.payments.map((payment, paymentIndex) => (
                        <li
                          key={payment.id}
                          className="flex gap-4 border-b border-[var(--border)] pb-3 last:border-0 last:pb-0"
                        >
                          <span className="label mt-0.5 w-5 shrink-0">
                            {paymentIndex + 1}
                          </span>
                          <div>
                            <p className="text-sm leading-relaxed text-[var(--text)]">
                              {payment.reason}
                            </p>
                            <p className="mt-1 text-xs text-[var(--text-subtle)]">
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
