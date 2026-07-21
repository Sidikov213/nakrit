"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDate, getPaymentCount, pluralTimes } from "@/lib/friends";
import type { Friend, FriendInput } from "@/lib/types";

const emptyForm: FriendInput = {
  name: "",
  emoji: "🍽️",
};

export function AdminPanel() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [password, setPassword] = useState("");
  const [form, setForm] = useState<FriendInput>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [newReason, setNewReason] = useState<Record<string, string>>({});
  const [editingPayment, setEditingPayment] = useState<{
    friendId: string;
    paymentId: string;
    reason: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadFriends = useCallback(async () => {
    const response = await fetch("/api/friends");
    setFriends(await response.json());
  }, []);

  const checkAuth = useCallback(async () => {
    const response = await fetch("/api/auth/me");
    const data = await response.json();
    setIsAdmin(Boolean(data.admin));
  }, []);

  useEffect(() => {
    Promise.all([loadFriends(), checkAuth()]).finally(() => setLoading(false));
  }, [loadFriends, checkAuth]);

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const response = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      setError("Неверный пароль");
      return;
    }

    setIsAdmin(true);
    setPassword("");
    setMessage("Добро пожаловать, админ!");
  }

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    setIsAdmin(false);
    setEditingId(null);
    setExpandedId(null);
    setForm(emptyForm);
    setMessage("Вы вышли");
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");

    const url = editingId ? `/api/friends/${editingId}` : "/api/friends";
    const method = editingId ? "PUT" : "POST";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      const data = await response.json();
      setError(data.error ?? "Ошибка сохранения");
      return;
    }

    setForm(emptyForm);
    setEditingId(null);
    setMessage(editingId ? "Обновлено!" : "Друг добавлен!");
    await loadFriends();
  }

  function startEdit(friend: Friend) {
    setEditingId(friend.id);
    setForm({ name: friend.name, emoji: friend.emoji });
  }

  async function handleDelete(id: string) {
    if (!confirm("Удалить из списка?")) return;

    const response = await fetch(`/api/friends/${id}`, { method: "DELETE" });

    if (!response.ok) {
      setError("Не удалось удалить");
      return;
    }

    setMessage("Удалено");
    await loadFriends();
  }

  async function handleAddPayment(friendId: string) {
    const reason = newReason[friendId]?.trim();
    if (!reason) return;

    setError("");
    const response = await fetch(`/api/friends/${friendId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });

    if (!response.ok) {
      setError("Не удалось добавить");
      return;
    }

    setNewReason((prev) => ({ ...prev, [friendId]: "" }));
    setMessage("Раз добавлен!");
    await loadFriends();
  }

  async function handleDeletePayment(friendId: string, paymentId: string) {
    if (!confirm("Удалить этот раз?")) return;

    const response = await fetch(
      `/api/friends/${friendId}/payments/${paymentId}`,
      { method: "DELETE" },
    );

    if (!response.ok) {
      setError("Не удалось удалить");
      return;
    }

    setMessage("Удалено");
    await loadFriends();
  }

  async function handleSavePayment() {
    if (!editingPayment) return;

    const response = await fetch(
      `/api/friends/${editingPayment.friendId}/payments/${editingPayment.paymentId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: editingPayment.reason }),
      },
    );

    if (!response.ok) {
      setError("Не удалось сохранить");
      return;
    }

    setEditingPayment(null);
    setMessage("Причина обновлена");
    await loadFriends();
  }

  if (loading) {
    return <p className="text-center text-zinc-400">Загрузка...</p>;
  }

  if (!isAdmin) {
    return (
      <form
        onSubmit={handleLogin}
        className="mx-auto max-w-sm rounded-3xl border border-zinc-800 bg-zinc-900/60 p-8"
      >
        <h1 className="text-center text-2xl font-bold text-white">🔐 Админка</h1>
        <p className="mt-2 text-center text-sm text-zinc-400">
          Только избранные могут редактировать список
        </p>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Пароль"
          className="mt-6 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-amber-400"
        />
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          className="mt-4 w-full rounded-xl bg-amber-400 py-3 font-semibold text-zinc-950 hover:bg-amber-300"
        >
          Войти
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">⚙️ Управление списком</h1>
          <p className="text-sm text-zinc-400">
            Добавляй друзей и записывай каждый раз с причиной
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-xl border border-zinc-700 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
        >
          Выйти
        </button>
      </div>

      {message && (
        <p className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-300">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-300">
          {error}
        </p>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-3xl border border-zinc-800 bg-zinc-900/60 p-6 sm:grid-cols-2"
      >
        <h2 className="sm:col-span-2 text-lg font-semibold text-white">
          {editingId ? "Редактировать друга" : "Добавить друга"}
        </h2>

        <input
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          placeholder="Имя"
          required
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-amber-400"
        />
        <input
          value={form.emoji}
          onChange={(event) => setForm({ ...form, emoji: event.target.value })}
          placeholder="Эмодзи"
          className="rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none focus:border-amber-400"
        />

        <div className="flex gap-3 sm:col-span-2">
          <button
            type="submit"
            className="rounded-xl bg-amber-400 px-6 py-3 font-semibold text-zinc-950 hover:bg-amber-300"
          >
            {editingId ? "Сохранить" : "Добавить"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="rounded-xl border border-zinc-700 px-6 py-3 text-zinc-300 hover:bg-zinc-800"
            >
              Отмена
            </button>
          )}
        </div>
      </form>

      <div className="space-y-4">
        {friends.map((friend) => {
          const isExpanded = expandedId === friend.id;
          const count = getPaymentCount(friend);

          return (
            <div
              key={friend.id}
              className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 p-4">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : friend.id)
                  }
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <span className="text-2xl">{friend.emoji}</span>
                  <div>
                    <p className="font-semibold text-white">
                      {friend.name}{" "}
                      <span className="text-amber-300">
                        — {pluralTimes(count)}
                      </span>
                    </p>
                    <p className="text-sm text-zinc-500">
                      {isExpanded ? "Свернуть" : "Развернуть записи"}
                    </p>
                  </div>
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(friend)}
                    className="rounded-lg border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-800"
                  >
                    Имя
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(friend.id)}
                    className="rounded-lg border border-red-500/30 px-3 py-1.5 text-sm text-red-300 hover:bg-red-500/10"
                  >
                    Удалить
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="space-y-3 border-t border-zinc-800 p-4">
                  {friend.payments.map((payment, index) => (
                    <div
                      key={payment.id}
                      className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-zinc-950/60 p-3"
                    >
                      {editingPayment?.paymentId === payment.id ? (
                        <div className="flex flex-1 gap-2">
                          <span className="mt-2 text-sm text-amber-300">
                            #{index + 1}
                          </span>
                          <input
                            value={editingPayment.reason}
                            onChange={(event) =>
                              setEditingPayment({
                                ...editingPayment,
                                reason: event.target.value,
                              })
                            }
                            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-amber-400"
                          />
                          <button
                            type="button"
                            onClick={handleSavePayment}
                            className="rounded-lg bg-amber-400 px-3 py-2 text-sm font-medium text-zinc-950"
                          >
                            OK
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingPayment(null)}
                            className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-400"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex gap-3">
                            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-xs font-bold text-amber-300">
                              {index + 1}
                            </span>
                            <div>
                              <p className="text-sm text-zinc-200">
                                {payment.reason}
                              </p>
                              <p className="text-xs text-zinc-500">
                                {formatDate(payment.date)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setEditingPayment({
                                  friendId: friend.id,
                                  paymentId: payment.id,
                                  reason: payment.reason,
                                })
                              }
                              className="rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-800"
                            >
                              Изменить
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleDeletePayment(friend.id, payment.id)
                              }
                              className="rounded-lg border border-red-500/20 px-2 py-1 text-xs text-red-400 hover:bg-red-500/10"
                            >
                              ✕
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}

                  <div className="flex gap-2 pt-1">
                    <input
                      value={newReason[friend.id] ?? ""}
                      onChange={(event) =>
                        setNewReason((prev) => ({
                          ...prev,
                          [friend.id]: event.target.value,
                        }))
                      }
                      placeholder="Причина нового раза..."
                      className="flex-1 rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm text-white outline-none focus:border-amber-400"
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          handleAddPayment(friend.id);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddPayment(friend.id)}
                      className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-amber-300"
                    >
                      + Раз
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
