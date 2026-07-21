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
      <main className="mx-auto max-w-3xl space-y-16 px-5 py-12 sm:py-16">
        <section className="text-center">
          <p className="label">Официальный рейтинг</p>
          <h1 className="display mt-4 text-5xl leading-[1.1] sm:text-6xl">
            Кто накроет сегодня?
          </h1>
          <div className="stat-card mt-10 inline-flex divide-x divide-[var(--border)] overflow-hidden rounded-2xl">
            <div className="px-8 py-4 text-center">
              <p className="display text-3xl text-[var(--accent)]">
                {friends.length}
              </p>
              <p className="label mt-1">друзей</p>
            </div>
            <div className="px-8 py-4 text-center">
              <p className="display text-3xl text-[var(--accent)]">
                {totalPayments}
              </p>
              <p className="label mt-1">раз накрыли</p>
            </div>
          </div>
        </section>

        <RandomPicker />

        <section className="surface-elevated rounded-2xl p-6 sm:p-8">
          <TopThree friends={friends} />
        </section>

        <section className="surface-elevated rounded-2xl p-6 sm:p-8">
          <FriendsList friends={friends} />
        </section>
      </main>
      <footer className="border-t border-[var(--border)] py-10 text-center">
        <p className="text-sm text-[var(--text-subtle)]">Сделано для друзей</p>
      </footer>
    </>
  );
}
