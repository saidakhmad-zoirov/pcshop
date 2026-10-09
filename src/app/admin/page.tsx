"use client";
import { useCallback, useEffect, useState } from "react";
import { ImageIcon, Pencil, Plus, Search, X } from "lucide-react";
import RequireAuth from "@/components/RequireAuth";
import ProductImage from "@/components/ProductImage";
import { api, ApiError } from "@/lib/api";
import { som, STATUS } from "@/lib/format";
import type { Category, Order, Product } from "@/lib/types";

interface Stats {
  products: number; low_stock: number; no_image: number; users: number; orders: number; revenue: number;
  orders_by_status: Record<string, number>;
}
interface ImageResult { url: string; thumbnail: string | null; title: string | null; source: string | null }

const NEXT_STATUS: Record<string, string[]> = {
  new: ["confirmed", "cancelled"], confirmed: ["assembling", "shipped", "cancelled"],
  assembling: ["shipped", "cancelled"], shipped: ["delivered"], delivered: [], cancelled: [],
};

function Admin() {
  const [tab, setTab] = useState<"products" | "orders">("products");
  const [stats, setStats] = useState<Stats | null>(null);
  const loadStats = useCallback(() => { api<Stats>("/api/admin/stats").then(setStats).catch(() => {}); }, []);
  useEffect(loadStats, [loadStats]);

  return (
    <div className="wrap py-8">
      <h1 className="h-display text-3xl">Boshqaruv paneli</h1>
      {stats && (
        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ["Daromad", som(stats.revenue)], ["Buyurtmalar", stats.orders], ["Yangi", stats.orders_by_status.new ?? 0],
            ["Mahsulotlar", stats.products], ["Kam qolgan", stats.low_stock], ["Rasmsiz", stats.no_image],
          ].map(([k, v]) => (
            <div key={k} className="card p-4">
              <dt className="text-sm text-steel">{k}</dt>
              <dd className="h-display mt-1 text-xl">{v}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className="mt-8 flex gap-2 border-b border-rail" role="tablist">
        {(["products", "orders"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold ${tab === t ? "border-amber text-amber" : "border-transparent text-steel hover:text-ink"}`}>
            {t === "products" ? "Mahsulotlar" : "Buyurtmalar"}
          </button>
        ))}
      </div>
      {tab === "products" ? <Products onChange={loadStats} /> : <Orders onChange={loadStats} />}
    </div>
  );
}

function Products({ onChange }: { onChange: () => void }) {
  const [items, setItems] = useState<Product[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [editing, setEditing] = useState<Product | "new" | null>(null);

  const load = useCallback(() => {
    const p = new URLSearchParams({ size: "100" });
    if (q) p.set("q", q);
    if (cat) p.set("category", cat);
    api<Product[]>(`/api/admin/products?${p}`).then(setItems).catch(() => {});
  }, [q, cat]);

  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);
  useEffect(() => { api<Category[]>("/api/categories").then(setCats).catch(() => {}); }, []);

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-60 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />
          <input className="input pl-9" placeholder="Qidirish" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="input w-auto" value={cat} onChange={(e) => setCat(e.target.value)} aria-label="Turkum">
          <option value="">Barcha turkumlar</option>
          {cats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
        </select>
        <button className="btn-primary" onClick={() => setEditing("new")}><Plus className="h-4 w-4" /> Yangi mahsulot</button>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="text-left text-steel">
            <tr className="border-b border-rail"><th className="py-2 font-medium">Mahsulot</th><th className="font-medium">Narx</th><th className="font-medium">Ombor</th><th /></tr>
          </thead>
          <tbody className="divide-y divide-rail">
            {items.map((p) => (
              <tr key={p.id}>
                <td className="py-2">
                  <div className="flex items-center gap-3">
                    <ProductImage src={p.image_url} alt="" category={p.category_slug} className="h-10 w-10 shrink-0 rounded" />
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{p.name}</p>
                      <p className="text-xs text-steel">{p.category_name}{!p.image_url && ", rasm yo'q"}</p>
                    </div>
                  </div>
                </td>
                <td>{som(p.price)}</td>
                <td className={p.stock < 3 ? "text-bad" : ""}>{p.stock}</td>
                <td className="text-right">
                  <button className="btn-ghost px-3 py-1.5" onClick={() => setEditing(p)}><Pencil className="h-4 w-4" /> Tahrirlash</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <ProductEditor
          product={editing === "new" ? null : editing}
          cats={cats}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); onChange(); }}
        />
      )}
    </div>
  );
}

function ProductEditor({ product, cats, onClose, onSaved }: {
  product: Product | null; cats: Category[]; onClose: () => void; onSaved: () => void;
}) {
  const [f, setF] = useState({
    category_slug: product?.category_slug ?? cats[0]?.slug ?? "cpu",
    name: product?.name ?? "", brand: product?.brand ?? "",
    price: String(product?.price ?? ""), old_price: String(product?.old_price ?? ""), stock: String(product?.stock ?? "0"),
    image_url: product?.image_url ?? "", description: product?.description ?? "",
    specs: JSON.stringify(product?.specs ?? {}, null, 2),
  });
  const [images, setImages] = useState<ImageResult[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  async function findImages() {
    setSearching(true);
    setError("");
    try {
      setImages(await api<ImageResult[]>(`/api/admin/images/search?q=${encodeURIComponent(f.name)}`));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSearching(false);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    let specs: Record<string, unknown>;
    try { specs = JSON.parse(f.specs || "{}"); } catch { setError("Xususiyatlar JSON formatida emas"); return; }
    const body = {
      name: f.name, brand: f.brand, price: Number(f.price), stock: Number(f.stock),
      old_price: f.old_price ? Number(f.old_price) : null, image_url: f.image_url || null,
      description: f.description, specs,
    };
    try {
      if (product) await api(`/api/admin/products/${product.id}`, { method: "PATCH", json: body });
      else await api("/api/admin/products", { method: "POST", json: { ...body, category_slug: f.category_slug } });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError && err.fields.length ? err.fields.map((x) => `${x.field}: ${x.message}`).join("; ") : (err as Error).message);
    }
  }

  async function hide() {
    if (!product || !confirm("Mahsulotni saytdan yashirasizmi?")) return;
    await api(`/api/admin/products/${product.id}`, { method: "DELETE" }).then(onSaved).catch((e) => setError(e.message));
  }

  const input = (k: keyof typeof f, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block text-sm">
      <span className="text-steel">{label}</span>
      <input className="input mt-1" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} {...props} />
    </label>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <form onSubmit={save} className="relative max-h-[92vh] w-full max-w-2xl space-y-4 overflow-auto rounded-card border border-rail bg-panel p-5">
        <div className="flex items-center">
          <h2 className="h-display text-xl">{product ? "Tahrirlash" : "Yangi mahsulot"}</h2>
          <button type="button" className="ml-auto p-1 text-steel" onClick={onClose} aria-label="Yopish"><X className="h-5 w-5" /></button>
        </div>
        {!product && (
          <label className="block text-sm">
            <span className="text-steel">Turkum</span>
            <select className="input mt-1" value={f.category_slug} onChange={(e) => setF({ ...f, category_slug: e.target.value })}>
              {cats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
            </select>
          </label>
        )}
        <div className="grid gap-4 sm:grid-cols-2">
          {input("name", "Nomi", { required: true, minLength: 2 })}
          {input("brand", "Brend", { required: true })}
          {input("price", "Narx, so'm", { required: true, inputMode: "numeric", pattern: "\\d+" })}
          {input("old_price", "Eski narx (chegirma uchun)", { inputMode: "numeric", pattern: "\\d*" })}
          {input("stock", "Omborda, dona", { required: true, inputMode: "numeric", pattern: "\\d+" })}
        </div>

        <div>
          <div className="flex items-end gap-3">
            <div className="flex-1">{input("image_url", "Rasm havolasi (https)", { type: "url" })}</div>
            <button type="button" className="btn-ghost" onClick={findImages} disabled={f.name.length < 2 || searching}>
              <ImageIcon className="h-4 w-4" /> {searching ? "Qidirilmoqda..." : "Google'dan topish"}
            </button>
          </div>
          {images && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {images.length === 0 && <p className="col-span-4 text-sm text-steel">Rasm topilmadi</p>}
              {images.map((img) => (
                <button type="button" key={img.url} onClick={() => setF({ ...f, image_url: img.url })} title={img.source ?? ""}
                  className={`overflow-hidden rounded-chip border-2 ${f.image_url === img.url ? "border-amber" : "border-transparent"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.thumbnail ?? img.url} alt={img.title ?? ""} referrerPolicy="no-referrer" className="aspect-square w-full bg-white object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        <label className="block text-sm">
          <span className="text-steel">Tavsif</span>
          <textarea className="input mt-1 min-h-20" value={f.description} maxLength={5000} onChange={(e) => setF({ ...f, description: e.target.value })} />
        </label>
        <label className="block text-sm">
          <span className="text-steel">Xususiyatlar (JSON) — PC Builder moslik tekshiruvi shularga qaraydi</span>
          <textarea className="input mt-1 min-h-40 font-mono text-xs" value={f.specs} onChange={(e) => setF({ ...f, specs: e.target.value })} spellCheck={false} />
        </label>
        {error && <p className="text-sm text-bad" role="alert">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <button className="btn-primary">Saqlash</button>
          <button type="button" className="btn-ghost" onClick={onClose}>Bekor qilish</button>
          {product && <button type="button" className="btn-ghost ml-auto text-bad" onClick={hide}>Saytdan yashirish</button>}
        </div>
      </form>
    </div>
  );
}

function Orders({ onChange }: { onChange: () => void }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api<Order[]>(`/api/admin/orders${filter ? `?status=${filter}` : ""}`).then(setOrders).catch((e) => setError(e.message));
  }, [filter]);

  async function move(id: number, status: string) {
    try {
      const o = await api<Order>(`/api/admin/orders/${id}/status`, { method: "POST", json: { status } });
      setOrders((list) => list.map((x) => (x.id === id ? o : x)));
      onChange();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <div className="mt-6">
      <div className="flex flex-wrap gap-2">
        {["", ...Object.keys(STATUS)].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-chip border px-3 py-1.5 text-sm ${filter === s ? "border-amber text-amber" : "border-rail text-steel hover:text-ink"}`}>
            {s ? STATUS[s] : "Hammasi"}
          </button>
        ))}
      </div>
      {error && <p className="mt-3 text-sm text-bad">{error}</p>}
      <div className="mt-4 flex flex-col gap-3">
        {orders.length === 0 && <p className="text-steel">Buyurtma yo'q</p>}
        {orders.map((o) => (
          <div key={o.id} className="card p-4">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
              <span className="font-semibold">№{o.id}</span>
              <span className="text-sm text-steel">{new Date(o.created_at).toLocaleString("uz-UZ")}</span>
              <span className="text-sm font-semibold text-amber">{STATUS[o.status]}</span>
              {o.assembly && <span className="text-sm text-ok">Yig'ib berish</span>}
              <span className="h-display ml-auto text-lg">{som(o.total)}</span>
            </div>
            <p className="mt-2 text-sm">{o.full_name}, <a href={`tel:${o.phone}`} className="text-amber">{o.phone}</a></p>
            <p className="text-sm text-steel">{o.address}{o.comment && ` — ${o.comment}`}</p>
            <ul className="mt-2 text-sm text-steel">
              {o.items.map((it) => <li key={it.product_id}>{it.name} × {it.quantity}</li>)}
            </ul>
            {NEXT_STATUS[o.status]?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {NEXT_STATUS[o.status].map((s) => (
                  <button key={s} className={s === "cancelled" ? "btn-ghost text-bad" : "btn-primary"} onClick={() => move(o.id, s)}>
                    {STATUS[s]}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <RequireAuth admin>
      <Admin />
    </RequireAuth>
  );
}
