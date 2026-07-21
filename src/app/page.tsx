import { FriendsList } from "@/components/FriendsList";
import { Header } from "@/components/Header";
import { RandomPicker } from "@/components/RandomPicker";
import { TopThree } from "@/components/TopThree";
import { getFriends } from "@/lib/db";
import { getPaymentCount, sortByPayments } from "@/lib/friends";

export const dynamic = "force-dynamic";

export default async function Home() {
  const friends = sortByPayments(await getFriends());
  const totalPayments = friends.reduce(
    (sum, friend) => sum + getPaymentCount(friend),
    0,
  );

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl space-y-12 px-4 py-10 sm:py-14">
        <section className="relative text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-4 py-1.5 text-xs font-medium uppercase tracking-widest text-amber-300/90">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Официальный рейтинг
          </div>
          <h1 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-6xl">
            Кто{" "}
            <span className="bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 bg-clip-text text-transparent">
              накроет
            </span>{" "}
            сегодня?
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-zinc-400 sm:text-lg">
            Рейтинг друзей, которые чаще всех платят в кафешках. Научно не
            доказано — зато все согласны.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <div className="glass-card rounded-2xl px-5 py-3 text-center">
              <p className="text-2xl font-black text-amber-300">{friends.length}</p>
              <p className="text-xs text-zinc-500">друзей</p>
            </div>
            <div className="glass-card rounded-2xl px-5 py-3 text-center">
              <p className="text-2xl font-black text-amber-300">{totalPayments}</p>
              <p className="text-xs text-zinc-500">раз накрыли</p>
            </div>
          </div>
        </section>

        <RandomPicker />

        <section className="glass-card rounded-3xl p-6 sm:p-8">
          <TopThree friends={friends} />
        </section>

        <section className="glass-card rounded-3xl p-6 sm:p-8">
          <FriendsList friends={friends} />
        </section>
      </main>
      <footer className="border-t border-zinc-800/80 py-8 text-center">
        <p className="text-sm text-zinc-600">
          Сделано для друзей · Редактировать могут только админы
        </p>
      </footer>
    </>
  );
}
