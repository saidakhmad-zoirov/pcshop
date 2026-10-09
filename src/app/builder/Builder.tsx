"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Link2, Plus, ShoppingCart, Trash2, X, XCircle } from "lucide-react";
import CategoryIcon from "@/components/CategoryIcon";
import PowerMeter from "@/components/PowerMeter";
import ProductImage from "@/components/ProductImage";
import { api } from "@/lib/api";
import { KEY_SPECS, SPEC_LABELS, som, specValue } from "@/lib/format";
import { useCart } from "@/lib/store";
import type { BuildCheck, Category, Product, ProductPage, SavedBuild } from "@/lib/types";

type Selection = Record<string, number[]>;
const MULTI = new Set(["ram", "storage"]);
const STORAGE_KEY = "pcforge-build";

/** Tanlangan qismlarga qarab "faqat mos keladiganlar" filtri */
function smartSpecs(cat: string, parts: Record<string, Product[]>): string[] {
  const s = (c: string, k: string) => parts[c]?.[0]?.specs[k];
  const out: string[] = [];
  if (cat === "cpu" && s("motherboard", "socket")) out.push(`socket:${s("motherboard", "socket")}`);
  if (cat === "motherboard" && s("cpu", "socket")) out.push(`socket:${s("cpu", "socket")}`);
  if (cat === "motherboard" && parts.ram?.[0]) out.push(`ram_type:${s("ram", "type")}`);
  if (cat === "ram" && s("motherboard", "ram_type")) out.push(`type:${s("motherboard", "ram_type")}`);
  if (cat === "cooler" && s("cpu", "socket")) out.push(`sockets:${s("cpu", "socket")}`);
  if (cat === "case" && s("motherboard", "form_factor")) out.push(`form_factors:${s("motherboard", "form_factor")}`);
  return out;
}

export default function Builder() {
  const sp = useSearchParams();
  const router = useRouter();
  const addMany = useCart((s) => s.addMany);
  const [cats, setCats] = useState<Category[]>([]);
  const [sel, setSel] = useState<Selection>({});
  const [check, setCheck] = useState<BuildCheck | null>(null);
  const [picker, setPicker] = useState<string | null>(null);
  const [shareMsg, setShareMsg] = useState("");
  const [loaded, setLoaded] = useState(false);

  // 1) Turkumlar + boshlang'ich yig'ilma (?code= havolasidan yoki oldingi sessiyadan)
  useEffect(() => {
    api<Category[]>("/api/categories").then((c) => setCats(c.filter((x) => x.is_build_part))).catch(() => {});
    const code = sp.get("code");
    if (code) {
      api<SavedBuild>(`/api/builder/builds/${encodeURIComponent(code)}`)
        .then((b) => setSel(Object.fromEntries(Object.entries(b.items).map(([k, v]) => [k, Array.isArray(v) ? v : [v]]))))
        .catch(() => setShareMsg("Yig'ilma topilmadi"))
        .finally(() => setLoaded(true));
    } else {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setSel(JSON.parse(saved));
      } catch {}
      setLoaded(true);
    }
  }, [sp]);

  // 2) Har o'zgarishda serverda tekshirish (250 ms kechikish bilan — ortiqcha so'rov yo'q)
  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sel)); } catch {}
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      const items = Object.fromEntries(Object.entries(sel).filter(([, v]) => v.length).map(([k, v]) => [k, MULTI.has(k) ? v : v[0]]));
      api<BuildCheck>("/api/builder/check", { method: "POST", json: { items }, signal: ctrl.signal })
        .then(setCheck)
        .catch(() => {});
    }, 250);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [sel, loaded]);

  const choose = useCallback((cat: string, p: Product) => {
    setSel((s) => ({ ...s, [cat]: MULTI.has(cat) ? [...(s[cat] ?? []), p.id].slice(0, 4) : [p.id] }));
    if (!MULTI.has(cat)) setPicker(null);
  }, []);

  const removeAt = (cat: string, i: number) => setSel((s) => ({ ...s, [cat]: (s[cat] ?? []).filter((_, j) => j !== i) }));

  const parts = check?.parts ?? {};
  const allProducts = Object.values(parts).flat();
  const psuW = parts.psu?.[0]?.specs.wattage;
  const issueFor = (cat: string) => check?.issues.filter((i) => i.parts.includes(cat)) ?? [];

  async function share() {
    try {
      const items = Object.fromEntries(Object.entries(sel).filter(([, v]) => v.length).map(([k, v]) => [k, MULTI.has(k) ? v : v[0]]));
      const b = await api<{ share_code: string }>("/api/builder/builds", { method: "POST", json: { name: "Mening yig'ilmam", items } });
      const url = `${location.origin}/builder?code=${b.share_code}`;
      await navigator.clipboard?.writeText(url).catch(() => {});
      setShareMsg(`Havola nusxalandi: ${url}`);
    } catch (e) {
      setShareMsg((e as Error).message);
    }
  }

  return (
    <div className="wrap py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="h-display text-3xl sm:text-4xl">Kompyuter yig'ish</h1>
          <p className="mt-1 max-w-xl text-steel">Qismlarni tanlang — moslik va quvvat avtomatik tekshiriladi.</p>
        </div>
        {allProducts.length > 0 && (
          <button className="btn-ghost" onClick={() => { setSel({}); router.replace("/builder"); }}>
            <Trash2 className="h-4 w-4" /> Tozalash
          </button>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Qismlar ro'yxati */}
        <ol className="flex flex-col gap-3">
          {cats.map((c) => {
            const chosen = parts[c.slug] ?? [];
            const issues = issueFor(c.slug);
            const hasErr = issues.some((i) => i.level === "error");
            return (
              <li key={c.slug} className={`card p-4 ${hasErr ? "border-bad/60" : ""}`}>
                <div className="flex items-center gap-3">
                  <CategoryIcon slug={c.slug} className="h-5 w-5 shrink-0 text-amber" />
                  <p className="font-semibold">{c.name}</p>
                  {c.build_required && chosen.length === 0 && <span className="text-xs text-steel">majburiy</span>}
                  {(chosen.length === 0 || MULTI.has(c.slug)) && (
                    <button className="btn-ghost ml-auto px-3 py-1.5" onClick={() => setPicker(c.slug)}>
                      <Plus className="h-4 w-4" /> {chosen.length ? "Yana qo'shish" : "Tanlash"}
                    </button>
                  )}
                </div>
                {chosen.map((p, i) => (
                  <div key={`${p.id}-${i}`} className="mt-3 flex items-center gap-3 rounded-chip bg-bench/60 p-2">
                    <ProductImage src={p.image_url} alt={p.name} category={p.category_slug} className="h-14 w-14 shrink-0 rounded-chip" />
                    <div className="min-w-0 flex-1">
                      <Link href={`/product/${p.slug}`} className="block truncate text-sm font-semibold hover:text-amber">{p.name}</Link>
                      <p className="truncate text-xs text-steel">
                        {(KEY_SPECS[c.slug] ?? []).map((k) => p.specs[k] !== undefined && `${SPEC_LABELS[k]}: ${specValue(p.specs[k])}`).filter(Boolean).join(", ")}
                      </p>
                    </div>
                    <p className="hidden shrink-0 text-sm font-semibold sm:block">{som(p.price)}</p>
                    {!MULTI.has(c.slug) && (
                      <button className="shrink-0 text-xs text-amber hover:underline" onClick={() => setPicker(c.slug)}>Almashtirish</button>
                    )}
                    <button className="shrink-0 p-1 text-steel hover:text-bad" onClick={() => removeAt(c.slug, i)} aria-label={`${p.name} ni olib tashlash`}>
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {issues.map((i, k) => (
                  <p key={k} className={`mt-2 flex items-start gap-2 text-sm ${i.level === "error" ? "text-bad" : "text-amber"}`}>
                    {i.level === "error" ? <XCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
                    {i.message}
                  </p>
                ))}
              </li>
            );
          })}
        </ol>

        {/* Xulosa paneli */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="card p-5">
            <PowerMeter watts={check?.estimated_watts ?? 0} psu={typeof psuW === "number" ? psuW : null} recommended={check?.recommended_psu ?? 0} />

            <div className="mt-5 border-t border-rail pt-4">
              {check && allProducts.length > 0 ? (
                check.compatible ? (
                  <p className="flex items-center gap-2 font-semibold text-ok"><CheckCircle2 className="h-5 w-5" /> Barcha qismlar mos</p>
                ) : (
                  <div className="text-sm">
                    {check.issues.some((i) => i.level === "error") && (
                      <p className="flex items-center gap-2 font-semibold text-bad"><XCircle className="h-5 w-5" /> Moslikda muammo bor</p>
                    )}
                    {check.missing_required.length > 0 && (
                      <p className="mt-1 text-steel">
                        Yana tanlang: {check.missing_required.map((m) => cats.find((c) => c.slug === m)?.name ?? m).join(", ")}
                      </p>
                    )}
                  </div>
                )
              ) : (
                <p className="text-sm text-steel">Protsessordan boshlang — keyin unga mos ona plata ko'rsatiladi.</p>
              )}
            </div>

            <div className="mt-5 flex items-baseline justify-between">
              <span className="text-steel">Jami</span>
              <span className="h-display text-3xl text-amber">{som(check?.total ?? 0)}</span>
            </div>

            <button
              className="btn-primary mt-5 w-full py-3"
              disabled={!check?.compatible}
              onClick={() => { addMany(allProducts); router.push("/cart"); }}
            >
              <ShoppingCart className="h-4 w-4" /> Hammasini savatga
            </button>
            <p className="mt-2 text-center text-xs text-steel">Savatda yig'ib berish xizmati avtomatik qo'shiladi</p>
            <button className="btn-ghost mt-3 w-full" disabled={allProducts.length === 0} onClick={share}>
              <Link2 className="h-4 w-4" /> Saqlash va havola olish
            </button>
            {shareMsg && <p className="mt-2 break-all text-xs text-steel" role="status">{shareMsg}</p>}
          </div>
        </aside>
      </div>

      {picker && (
        <Picker
          cat={picker}
          title={cats.find((c) => c.slug === picker)?.name ?? ""}
          smart={smartSpecs(picker, parts)}
          selectedIds={sel[picker] ?? []}
          onPick={(p) => choose(picker, p)}
          onClose={() => setPicker(null)}
        />
      )}
    </div>
  );
}

function Picker({ cat, title, smart, selectedIds, onPick, onClose }: {
  cat: string; title: string; smart: string[]; selectedIds: number[]; onPick: (p: Product) => void; onClose: () => void;
}) {
  const [onlyCompat, setOnlyCompat] = useState(true);
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Product[] | null>(null);
  const specKey = useMemo(() => (onlyCompat ? smart : []).join("|"), [onlyCompat, smart]);

  useEffect(() => {
    const ctrl = new AbortController();
    const params = new URLSearchParams({ category: cat, size: "60", sort: "price_asc" });
    specKey.split("|").filter(Boolean).forEach((s) => params.append("spec", s));
    if (q.trim()) params.set("q", q.trim());
    const t = setTimeout(() => {
      api<ProductPage>(`/api/products?${params}`, { signal: ctrl.signal }).then((d) => setItems(d.items)).catch(() => {});
    }, 200);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [cat, specKey, q]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-label={`${title} tanlash`}>
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative flex max-h-[88vh] w-full max-w-3xl flex-col rounded-t-card border border-rail bg-panel sm:rounded-card">
        <div className="flex items-center gap-3 border-b border-rail p-4">
          <CategoryIcon slug={cat} className="h-5 w-5 text-amber" />
          <h2 className="h-display text-xl">{title}</h2>
          <button className="ml-auto p-1 text-steel hover:text-ink" onClick={onClose} aria-label="Yopish"><X className="h-5 w-5" /></button>
        </div>
        <div className="flex flex-wrap items-center gap-3 border-b border-rail p-4">
          <input className="input flex-1" placeholder="Nomi bo'yicha qidirish" value={q} onChange={(e) => setQ(e.target.value)} maxLength={100} autoFocus />
          {smart.length > 0 && (
            <label className="flex items-center gap-2 text-sm text-steel">
              <input type="checkbox" className="accent-[#F2A93B]" checked={onlyCompat} onChange={(e) => setOnlyCompat(e.target.checked)} />
              Faqat moslari
            </label>
          )}
        </div>
        <ul className="flex-1 divide-y divide-rail overflow-auto">
          {items === null && <li className="p-6 text-steel">Yuklanmoqda...</li>}
          {items?.length === 0 && <li className="p-6 text-steel">Mos mahsulot topilmadi. "Faqat moslari"ni o'chirib ko'ring.</li>}
          {items?.map((p) => (
            <li key={p.id} className="flex items-center gap-3 p-3 sm:p-4">
              <ProductImage src={p.image_url} alt={p.name} category={cat} className="h-16 w-16 shrink-0 rounded-chip" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{p.name}</p>
                <p className="truncate text-xs text-steel">
                  {(KEY_SPECS[cat] ?? []).map((k) => p.specs[k] !== undefined && `${SPEC_LABELS[k]}: ${specValue(p.specs[k])}`).filter(Boolean).join(", ")}
                </p>
                <p className={`text-xs ${p.stock > 0 ? "text-ok" : "text-bad"}`}>{p.stock > 0 ? "Omborda bor" : "Tugagan"}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="h-display">{som(p.price)}</p>
                <button className="btn-primary mt-1 px-3 py-1.5" disabled={p.stock === 0} onClick={() => onPick(p)}>
                  {selectedIds.includes(p.id) && !MULTI.has(cat) ? "Tanlangan" : "Tanlash"}
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
