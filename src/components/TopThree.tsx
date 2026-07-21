import { getPaymentCount, pluralTimes } from "@/lib/friends";
import type { Friend } from "@/lib/types";

const podiumStyles = [
  {
    rank: 1,
    label: "Главный спонсор",
    medal: "👑",
    height: "h-40",
    border: "border-amber-400/50",
    bg: "from-amber-400/25 via-amber-500/10 to-transparent",
    text: "text-amber-200",
    glow: "shadow-[0_0_40px_rgba(251,191,36,0.2)]",
    ring: "ring-amber-400/30",
  },
  {
    rank: 2,
    label: "Серебряный кошелёк",
    medal: "🥈",
    height: "h-32",
    border: "border-zinc-400/30",
    bg: "from-zinc-300/15 via-zinc-500/5 to-transparent",
    text: "text-zinc-200",
    glow: "",
    ring: "ring-zinc-400/20",
  },
  {
    rank: 3,
    label: "Бронзовый перевод",
    medal: "🥉",
    height: "h-28",
    border: "border-orange-600/30",
    bg: "from-orange-500/15 via-orange-700/5 to-transparent",
    text: "text-orange-200",
    glow: "",
    ring: "ring-orange-600/20",
  },
] as const;

type TopThreeProps = {
  friends: Friend[];
};

export function TopThree({ friends }: TopThreeProps) {
  const top = friends.slice(0, 3);
  const ordered = top.length >= 3 ? [top[1], top[0], top[2]] : top;

  if (top.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-700 p-8 text-center text-zinc-400">
        Пока пусто — добавь друзей в админке
      </p>
    );
  }

  return (
    <section>
      <h2 className="section-title mb-8">
        <span>🏆</span>
        <span>Топ должников кафе</span>
      </h2>
      <div className="flex items-end justify-center gap-4 sm:gap-8">
        {ordered.map((friend) => {
          const rank = top.indexOf(friend) + 1;
          const style = podiumStyles[rank - 1];
          const count = getPaymentCount(friend);

          if (!style) return null;

          return (
            <div
              key={friend.id}
              className={`flex w-full max-w-[180px] flex-col items-center ${rank === 1 ? "-mt-2" : ""}`}
            >
              <div
                className={`mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900/80 text-3xl ring-1 ${style.ring} ${style.glow}`}
              >
                {friend.emoji}
              </div>
              <p className={`text-center font-bold ${style.text}`}>
                {friend.name}
              </p>
              <p className="mt-0.5 text-lg">{style.medal}</p>
              <div
                className={`mt-4 flex w-full ${style.height} flex-col items-center justify-end rounded-t-2xl border bg-gradient-to-t pb-4 ${style.border} ${style.bg} ${style.glow}`}
              >
                <span className="text-3xl font-black text-white">{count}</span>
                <span className="text-[10px] uppercase tracking-wider text-zinc-400">
                  {count === 1 ? "раз" : count >= 2 && count <= 4 ? "раза" : "раз"}
                </span>
              </div>
              <p className="mt-2 text-center text-[11px] text-zinc-500">
                {pluralTimes(count)}
              </p>
              <p className="mt-0.5 text-center text-[10px] text-zinc-600">
                {style.label}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
