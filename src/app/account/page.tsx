"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/store";
import { som, STATUS } from "@/lib/format";
import type { Order } from "@/lib/types";

interface MyBuild { share_code: string; name: string; created_at: string }

const STATUS_COLOR: Record<string, string> = {
  new: "text-amber", confirmed: "text-ink", assembling: "text-amber", shipped: "text-ok", delivered: "text-ok", cancelled: "text-bad",
};

function Account() {
  const { user, set } = useAuth();
  const router = useRouter();
  const justOrdered = useSearchParams().get("order");
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [builds, setBuilds] = useState<MyBuild[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Order[]>("/api/orders").then(setOrders).catch((e) => setError(e.message));
    api<MyBuild[]>("/api/builder/builds/mine").then(setBuilds).catch(() => {});
  }, []);

  async function cancel(id: number) {
    if (!confirm("Buyurtmani bekor qilasizmi?")) return;
    try {
      const o = await api<Order>(`/api/orders/${id}/cancel`, { method: "POST" });
      setOrders((list) => list?.map((x) => (x.id === id ? o : x)) ?? null);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function logout() {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    set(null, null);
    router.push("/");
  }

  return (
    <div className="wrap py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="h-display text-3xl">{user?.full_name}</h1>
          <p className="text-steel">{user?.email}</p>
        </div>
        <button className="btn-ghost" onClick={logout}><LogOut className="h-4 w-4" /> Chiqish</button>
      </div>

      {justOrdered && (
        <div className="card mt-6 border-ok/50 p-5" role="status">
          <p className="font-semibold text-ok">Buyurtma №{justOrdered} qabul qilindi</p>
          <p className="mt-1 text-sm text-steel">Operator tez orada siz bilan bog'lanadi.</p>
        </div>
      )}
      {error && <p className="mt-4 text-bad" role="alert">{error}</p>}

      <h2 className="h-display mt-10 text-2xl">Buyurtmalarim</h2>
      {orders === null && <p className="mt-4 text-steel">Yuklanmoqda...</p>}
      {orders?.length === 0 && (
        <p className="mt-4 text-steel">Hali buyurtma yo'q. <Link href="/catalog" className="text-amber hover:underline">Katalogga o'ting</Link></p>
      )}
      <div className="mt-4 flex flex-col gap-3">
        {orders?.map((o) => (
          <details key={o.id} className="card p-4" open={String(o.id) === justOrdered}>
            <summary className="flex cursor-pointer flex-wrap items-center gap-x-6 gap-y-1">
              <span className="font-semibold">№{o.id}</span>
              <span className="text-sm text-steel">{new Date(o.created_at).toLocaleDateString("uz-UZ")}</span>
              <span className={`text-sm font-semibold ${STATUS_COLOR[o.status] ?? ""}`}>{STATUS[o.status] ?? o.status}</span>
              <span className="h-display ml-auto text-lg">{som(o.total)}</span>
            </summary>
            <ul className="mt-4 divide-y divide-rail border-t border-rail text-sm">
              {o.items.map((it) => (
                <li key={it.product_id} className="flex justify-between gap-4 py-2">
                  <span>{it.name} × {it.quantity}</span><span className="shrink-0">{som(it.price * it.quantity)}</span>
                </li>
              ))}
              {o.assembly && <li className="flex justify-between py-2"><span>Yig'ib berish</span><span>{som(o.assembly_fee)}</span></li>}
            </ul>
            <p className="mt-3 text-sm text-steel">{o.address}, {o.phone}</p>
            {o.status === "new" && <button className="btn-ghost mt-3 text-bad" onClick={() => cancel(o.id)}>Bekor qilish</button>}
          </details>
        ))}
      </div>

      {builds.length > 0 && (
        <>
          <h2 className="h-display mt-10 text-2xl">Saqlangan yig'ilmalar</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {builds.map((b) => (
              <li key={b.share_code}>
                <Link href={`/builder?code=${b.share_code}`} className="card block p-4 hover:border-amber">
                  <p className="font-semibold">{b.name}</p>
                  <p className="text-sm text-steel">{new Date(b.created_at).toLocaleDateString("uz-UZ")}</p>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default function AccountPage() {
  return (
    <RequireAuth>
      <Suspense>
        <Account />
      </Suspense>
    </RequireAuth>
  );
}
