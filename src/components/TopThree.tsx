import { getPaymentCount, pluralTimes } from "@/lib/friends";
import type { Friend } from "@/lib/types";

const ranks = [
  { label: "II", height: "h-32" },
  { label: "I", height: "h-40" },
  { label: "III", height: "h-24" },
] as const;

type TopThreeProps = {
  friends: Friend[];
};

export function TopThree({ friends }: TopThreeProps) {
  const top = friends.slice(0, 3);
  const ordered = top.length >= 3 ? [top[1], top[0], top[2]] : top;
  const orderRanks = top.length >= 3 ? [ranks[0], ranks[1], ranks[2]] : ranks.slice(0, top.length);

  if (top.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-[var(--border-strong)] py-12 text-center text-sm text-[var(--text-subtle)]">
        Пока пусто — добавь друзей в админке
      </p>
    );
  }

  return (
    <section>
      <div className="section-heading text-center sm:text-left">
        <h2>Топ должников</h2>
        <p>Кто чаще всех накрывал за столом</p>
      </div>

      <div className="flex items-end justify-center gap-3 sm:gap-5">
        {ordered.map((friend, index) => {
          const rank = top.indexOf(friend) + 1;
          const rankStyle = orderRanks[index];
          const count = getPaymentCount(friend);
          const isFirst = rank === 1;

          return (
            <div
              key={friend.id}
              className="flex w-full max-w-[140px] flex-col items-center sm:max-w-[160px]"
            >
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full text-2xl ${
                  isFirst ? "avatar-accent" : "avatar-warm"
                }`}
              >
                {friend.emoji}
              </div>
              <p
                className={`text-center text-sm font-medium ${
                  isFirst ? "text-[var(--accent-hover)]" : "text-[var(--text-muted)]"
                }`}
              >
                {friend.name}
              </p>
              <div
                className={`podium-block mt-4 flex w-full ${rankStyle.height} flex-col items-center justify-end rounded-t-xl border border-b-0 pb-4 ${
                  isFirst ? "podium-block--first" : ""
                }`}
              >
                <span className="label mb-2">{rankStyle.label}</span>
                <span className="display text-3xl">{count}</span>
                <span className="label mt-1">
                  {count === 1 ? "раз" : count >= 2 && count <= 4 ? "раза" : "раз"}
                </span>
              </div>
              <p className="mt-3 text-center text-xs text-[var(--text-subtle)]">
                {pluralTimes(count)}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
