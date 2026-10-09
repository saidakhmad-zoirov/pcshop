"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { api } from "@/lib/api";
import type { Category, ProductPage } from "@/lib/types";

// Turkumga xos tez filtrlar (spec=kalit:qiymat)
const SPEC_FILTERS: Record<string, { key: string; label: string; values: string[] }[]> = {
  cpu: [{ key: "socket", label: "Soket", values: ["AM4", "AM5", "LGA1700", "LGA1851"] }],
  motherboard: [
    { key: "socket", label: "Soket", values: ["AM4", "AM5", "LGA1700", "LGA1851"] },
    { key: "form_factor", label: "O'lcham", values: ["ATX", "mATX", "ITX"] },
    { key: "ram_type", label: "Xotira", values: ["DDR4", "DDR5"] },
  ],
  ram: [{ key: "type", label: "Turi", values: ["DDR4", "DDR5"] }],
  storage: [{ key: "interface", label: "Ulanish", values: ["M.2", "SATA"] }],
  cooler: [{ key: "type", label: "Turi", values: ["air", "aio"] }],
};

const SORTS = [
  ["popular", "Ommabop"], ["price_asc", "Avval arzon"], ["price_desc", "Avval qimmat"], ["new", "Yangi"], ["name", "Nomi bo'yicha"],
] as const;

export default function CatalogView() {
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [cats, setCats] = useState<Category[]>([]);
  const [data, setData] = useState<ProductPage | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const category = sp.get("category") ?? "";
  const brands = sp.getAll("brand");
  const specs = sp.getAll("spec");
  const page = Number(sp.get("page") ?? 1);
  const key = sp.toString();

  const [minP, setMinP] = useState(sp.get("min_price") ?? "");
  const [maxP, setMaxP] = useState(sp.get("max_price") ?? "");

  useEffect(() => {
    api<Category[]>("/api/categories").then(setCats).catch(() => {});
  }, []);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    setError("");
    api<ProductPage>(`/api/products?${key}`, { signal: ctrl.signal })
      .then(setData)
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message);
      })
      .finally(() => setLoading(false));
    return () => ctrl.abort(); // eski so'rov bekor — tez bosilganda "sakrash" bo'lmaydi
  }, [key]);

  function update(patch: Record<string, string | string[] | null>) {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(patch)) {
      next.delete(k);
      if (Array.isArray(v)) v.forEach((x) => next.append(k, x));
      else if (v) next.set(k, v);
    }
    if (!("page" in patch)) next.delete("page");
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }

  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const title = useMemo(() => cats.find((c) => c.slug === category)?.name ?? (sp.get("q") ? `«${sp.get("q")}» bo'yicha` : "Barcha mahsulotlar"), [cats, category, sp]);

  const filters = (
    <div className="flex flex-col gap-6 text-sm">
      <fieldset>
        <legend className="mb-2 font-semibold">Turkum</legend>
        <div className="flex flex-col gap-1">
          <button onClick={() => update({ category: null, spec: null })} className={`text-left ${!category ? "text-amber" : "text-steel hover:text-ink"}`}>
            Hammasi
          </button>
          {cats.map((c) => (
            <button key={c.slug} onClick={() => update({ category: c.slug, spec: null, brand: null })}
              className={`flex justify-between text-left ${category === c.slug ? "text-amber" : "text-steel hover:text-ink"}`}>
              <span>{c.name}</span><span className="text-xs">{c.product_count}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {(SPEC_FILTERS[category] ?? []).map((f) => (
        <fieldset key={f.key}>
          <legend className="mb-2 font-semibold">{f.label}</legend>
          <div className="flex flex-wrap gap-1.5">
            {f.values.map((v) => {
              const val = `${f.key}:${v}`;
              const on = specs.includes(val);
              return (
                <button key={v} onClick={() => update({ spec: on ? specs.filter((s) => s !== val) : [...specs.filter((s) => !s.startsWith(f.key + ":")), val] })}
                  aria-pressed={on}
                  className={`rounded-chip border px-2.5 py-1 ${on ? "border-amber bg-amber-soft text-amber" : "border-rail text-steel hover:text-ink"}`}>
                  {v === "air" ? "Havo" : v === "aio" ? "Suyuq (AIO)" : v}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}

      {data && data.brands.length > 0 && (
        <fieldset>
          <legend className="mb-2 font-semibold">Brend</legend>
          <div className="flex max-h-56 flex-col gap-1.5 overflow-auto">
            {data.brands.map((b) => (
              <label key={b} className="flex cursor-pointer items-center gap-2 text-steel hover:text-ink">
                <input type="checkbox" className="accent-[#F2A93B]" checked={brands.includes(b)} onChange={() => update({ brand: toggle(brands, b) })} />
                {b}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset>
        <legend className="mb-2 font-semibold">Narx, so'm</legend>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); update({ min_price: minP, max_price: maxP }); }}>
          <input className="input" inputMode="numeric" placeholder={data ? String(data.price_min) : "dan"} value={minP}
            onChange={(e) => setMinP(e.target.value.replace(/\D/g, ""))} aria-label="Minimal narx" />
          <input className="input" inputMode="numeric" placeholder={data ? String(data.price_max) : "gacha"} value={maxP}
            onChange={(e) => setMaxP(e.target.value.replace(/\D/g, ""))} aria-label="Maksimal narx" />
          <button className="btn-ghost px-3" type="submit">OK</button>
        </form>
      </fieldset>

      <div className="flex flex-col gap-2">
        <label className="flex items-center gap-2 text-steel">
          <input type="checkbox" className="accent-[#F2A93B]" checked={sp.get("in_stock") === "true"} onChange={(e) => update({ in_stock: e.target.checked ? "true" : null })} />
          Faqat omborda borlari
        </label>
        <label className="flex items-center gap-2 text-steel">
          <input type="checkbox" className="accent-[#F2A93B]" checked={sp.get("on_sale") === "true"} onChange={(e) => update({ on_sale: e.target.checked ? "true" : null })} />
          Chegirmadagilar
        </label>
      </div>
    </div>
  );

  return (
    <div className="wrap py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="h-display text-3xl">{title}</h1>
          <p className="mt-1 text-sm text-steel">{data ? `${data.total} ta mahsulot` : " "}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-ghost lg:hidden" onClick={() => setShowFilters(true)}>
            <SlidersHorizontal className="h-4 w-4" /> Filtrlar
          </button>
          <select value={sp.get("sort") ?? "popular"} onChange={(e) => update({ sort: e.target.value })} className="input w-auto" aria-label="Saralash">
            {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[230px_1fr]">
        <aside className="hidden lg:block">{filters}</aside>

        {showFilters && (
          <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true" aria-label="Filtrlar">
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowFilters(false)} />
            <div className="relative ml-auto h-full w-80 max-w-full overflow-auto bg-panel p-5">
              <button className="mb-4 flex items-center gap-1 text-steel" onClick={() => setShowFilters(false)}>
                <X className="h-4 w-4" /> Yopish
              </button>
              {filters}
            </div>
          </div>
        )}

        <div>
          {error && <div className="card p-5 text-bad">{error}</div>}
          {!error && data && data.items.length === 0 && !loading && (
            <div className="card p-8 text-center">
              <p className="font-semibold">Bu filtrlar bo'yicha mahsulot yo'q</p>
              <button className="btn-ghost mt-4" onClick={() => router.push(pathname)}>Filtrlarni tozalash</button>
            </div>
          )}
          <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 ${loading ? "opacity-60" : ""}`} aria-busy={loading}>
            {data?.items.map((p) => <ProductCard key={p.id} p={p} />)}
            {!data && loading && Array.from({ length: 6 }).map((_, i) => <div key={i} className="card h-80 animate-pulse" />)}
          </div>
          {data && data.pages > 1 && (
            <nav className="mt-8 flex flex-wrap justify-center gap-2" aria-label="Sahifalar">
              {Array.from({ length: data.pages }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => update({ page: String(n) })} aria-current={n === page ? "page" : undefined}
                  className={`h-10 min-w-10 rounded-chip border px-3 ${n === page ? "border-amber text-amber" : "border-rail text-steel hover:text-ink"}`}>
                  {n}
                </button>
              ))}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
