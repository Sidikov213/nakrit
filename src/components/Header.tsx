import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-3xl items-center px-5 py-5">
        <Link href="/" className="group flex items-center gap-3.5">
          <span className="text-xl leading-none transition-opacity group-hover:opacity-70">
            🍽️
          </span>
          <div>
            <p className="display text-xl">Накрыть</p>
            <p className="label mt-0.5">Кто платит в кафе</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
