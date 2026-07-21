import { AdminPanel } from "@/components/AdminPanel";
import { Header } from "@/components/Header";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <AdminPanel />
      </main>
    </>
  );
}
