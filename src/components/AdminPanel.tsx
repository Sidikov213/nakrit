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

    setError("");
    setMessage("");

    const response = await fetch(`/api/friends/${id}`, { method: "DELETE" });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(
        (data as { error?: string }).error ??
          "Не удалось удалить. Проверь, что Redis подключён на Vercel.",
      );
      return;
    }

    setFriends((current) => current.filter((friend) => friend.id !== id));
    setMessage("Удалено");
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
    return <p className="text-center text-[var(--text-subtle)]">Загрузка...</p>;
  }

  if (!isAdmin) {
    return (
      <form
        onSubmit={handleLogin}
        className="surface-elevated mx-auto max-w-sm rounded-2xl p-8"
      >
        <h1 className="display text-center text-3xl">Вход</h1>
        <p className="mt-2 text-center text-sm text-[var(--text-subtle)]">
          Только для тех, кто управляет списком
        </p>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Пароль"
          className="input mt-6"
        />
        {error && <p className="alert-error mt-3">{error}</p>}
        <button type="submit" className="btn mt-4 w-full py-3">
          Войти
        </button>
      </form>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="display text-3xl">Управление</h1>
          <p className="mt-1 text-sm text-[var(--text-subtle)]">
            Добавляй друзей и записывай каждый раз с причиной
          </p>
        </div>
        <button type="button" onClick={handleLogout} className="btn-secondary">
          Выйти
        </button>
      </div>

      {message && <p className="alert-success">{message}</p>}
      {error && <p className="alert-error">{error}</p>}

      <form
        onSubmit={handleSubmit}
        className="surface-elevated grid gap-4 rounded-2xl p-6 sm:grid-cols-2"
      >
        <h2 className="display sm:col-span-2 text-xl">
          {editingId ? "Редактировать друга" : "Добавить друга"}
        </h2>

        <input
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          placeholder="Имя"
          required
          className="input"
        />
        <input
          value={form.emoji}
          onChange={(event) => setForm({ ...form, emoji: event.target.value })}
          placeholder="Эмодзи"
          className="input"
        />

        <div className="flex gap-3 sm:col-span-2">
          <button type="submit" className="btn px-6 py-3">
            {editingId ? "Сохранить" : "Добавить"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="btn-secondary px-6 py-3"
            >
              Отмена
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {friends.map((friend) => {
          const isExpanded = expandedId === friend.id;
          const count = getPaymentCount(friend);

          return (
            <div
              key={friend.id}
              className="surface overflow-hidden rounded-xl"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 p-4">
                <button
                  type="button"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : friend.id)
                  }
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <span className="avatar-warm flex h-10 w-10 items-center justify-center rounded-full text-xl">
                    {friend.emoji}
                  </span>
                  <div>
                    <p className="font-medium text-[var(--text)]">
                      {friend.name}{" "}
                      <span className="text-[var(--text-subtle)]">· {pluralTimes(count)}</span>
                    </p>
                    <p className="text-sm text-[var(--text-subtle)]">
                      {isExpanded ? "Свернуть" : "Развернуть записи"}
                    </p>
                  </div>
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(friend)}
                    className="btn-secondary text-sm"
                  >
                    Имя
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(friend.id)}
                    className="rounded-full border border-[#e8c4b8] px-3 py-1.5 text-sm text-[#9b4a3a] hover:bg-[#f5ebe8]"
                  >
                    Удалить
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="space-y-3 border-t border-[var(--border)] bg-[var(--surface-soft)] p-4">
                  {friend.payments.map((payment, index) => (
                    <div
                      key={payment.id}
                      className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3"
                    >
                      {editingPayment?.paymentId === payment.id ? (
                        <div className="flex flex-1 gap-2">
                          <span className="label mt-3">{index + 1}</span>
                          <input
                            value={editingPayment.reason}
                            onChange={(event) =>
                              setEditingPayment({
                                ...editingPayment,
                                reason: event.target.value,
                              })
                            }
                            className="input"
                          />
                          <button
                            type="button"
                            onClick={handleSavePayment}
                            className="btn px-3 py-2 text-sm"
                          >
                            OK
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingPayment(null)}
                            className="btn-secondary px-3 py-2 text-sm"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex gap-3">
                            <span className="label mt-0.5">{index + 1}</span>
                            <div>
                              <p className="text-sm text-[var(--text)]">
                                {payment.reason}
                              </p>
                              <p className="mt-1 text-xs text-[var(--text-subtle)]">
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
                              className="btn-secondary text-xs"
                            >
                              Изменить
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleDeletePayment(friend.id, payment.id)
                              }
                              className="rounded-full px-2 py-1 text-xs text-[#9b4a3a] hover:bg-[#f5ebe8]"
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
                      className="input"
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
                      className="btn shrink-0 px-4 py-2 text-sm"
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
