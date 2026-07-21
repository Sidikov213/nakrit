import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-amber-500/10 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-400/10 text-xl ring-1 ring-amber-400/20 transition group-hover:scale-105 group-hover:bg-amber-400/15">
            🍽️
          </span>
          <div>
            <p className="text-lg font-bold tracking-tight text-white">
              Накрит
            </p>
            <p className="text-[11px] uppercase tracking-widest text-zinc-500">
              Кто платит в кафе?
            </p>
          </div>
        </Link>
        <Link
          href="/admin"
          className="rounded-full border border-zinc-700 bg-zinc-900/80 px-4 py-2 text-sm text-zinc-300 transition hover:border-amber-500/40 hover:text-amber-200"
        >
          ⚙️ Админка
        </Link>
      </div>
    </header>
  );
}
