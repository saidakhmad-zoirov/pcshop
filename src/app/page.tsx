import Link from "next/link";
import CategoryIcon from "@/components/CategoryIcon";
import PowerMeter from "@/components/PowerMeter";
import ProductCard from "@/components/ProductCard";
import { getCategories, getDeals, getFeatured } from "@/lib/server";
import { som } from "@/lib/format";
import type { SavedBuild } from "@/lib/types";

export const revalidate = 60;

const PART_ORDER = ["cpu", "gpu", "motherboard", "ram", "storage", "psu", "case", "cooler"];

function BuildSheet({ b }: { b: SavedBuild }) {
  const psu = b.parts.psu?.[0]?.specs.wattage;
  return (
    <div className="card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-steel">Tayyor yig'ilma</p>
          <h2 className="h-display text-2xl">{b.name}</h2>
        </div>
        <span className={`rounded-chip px-2 py-1 text-xs font-semibold ${b.compatible ? "bg-ok/15 text-ok" : "bg-bad/15 text-bad"}`}>
          {b.compatible ? "Hammasi mos" : "Moslikda muammo"}
        </span>
      </div>
      <ul className="mt-5 divide-y divide-rail border-y border-rail text-sm">
        {PART_ORDER.filter((k) => b.parts[k]).map((k) => (
          <li key={k} className="flex items-center gap-3 py-2.5">
            <CategoryIcon slug={k} className="h-4 w-4 shrink-0 text-steel" />
            <span className="truncate">{b.parts[k].map((p) => p.name).join(" + ")}</span>
          </li>
        ))}
      </ul>
      <div className="mt-5">
        <PowerMeter watts={b.estimated_watts} psu={typeof psu === "number" ? psu : null} recommended={b.recommended_psu} />
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="h-display text-2xl text-amber">{som(b.total)}</p>
        <Link href={`/builder?code=${b.share_code}`} className="btn-ghost">Builderda ochish</Link>
      </div>
    </div>
  );
}

export default async function Home() {
  const [categories, featured, deals] = await Promise.all([getCategories(), getFeatured(), getDeals()]);
  const hero = featured?.find((b) => b.name.includes("1440")) ?? featured?.[0];

  return (
    <>
      <section className="wrap grid items-center gap-10 py-12 lg:grid-cols-[1.05fr_1fr] lg:py-20">
        <div>
          <h1 className="h-display text-4xl leading-[1.05] sm:text-6xl">
            Kompyuteringizni qismma-qism o'zingiz yig'ing
          </h1>
          <p className="mt-5 max-w-lg text-lg text-steel">
            Har bir qismni tanlaganingizda sayt soket, xotira turi, korpus o'lchami va quvvat blokini darhol tekshiradi.
            Mos kelmasa — sababini aytadi.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/builder" className="btn-primary px-6 py-3 text-base">Yig'ishni boshlash</Link>
            <Link href="/catalog" className="btn-ghost px-6 py-3 text-base">Katalogni ko'rish</Link>
          </div>
          <p className="mt-6 text-sm text-steel">Xohlasangiz, ustalarimiz yig'ib, sinab, Windows o'rnatib beradi.</p>
        </div>
        {hero ? <BuildSheet b={hero} /> : null}
      </section>

      {categories && categories.length > 0 && (
        <section className="wrap" aria-labelledby="cat-h">
          <h2 id="cat-h" className="h-display text-2xl">Turkumlar</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/catalog?category=${c.slug}`}
                className="flex items-center gap-3 rounded-chip border border-rail bg-panel/60 px-3 py-3 hover:border-amber"
              >
                <CategoryIcon name={c.icon} className="h-6 w-6 shrink-0 text-amber" />
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{c.name}</span>
                  <span className="block text-xs text-steel">{c.product_count} ta</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {deals.length > 0 && (
        <section className="wrap mt-16" aria-labelledby="deal-h">
          <div className="flex items-end justify-between">
            <h2 id="deal-h" className="h-display text-2xl">Chegirmadagi qismlar</h2>
            <Link href="/catalog?on_sale=true" className="text-sm text-amber hover:underline">Hammasi</Link>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {deals.slice(0, 4).map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      )}

      {featured && featured.length > 0 && (
        <section className="wrap mt-16" aria-labelledby="build-h">
          <h2 id="build-h" className="h-display text-2xl">Tayyor yig'ilmalar</h2>
          <p className="mt-1 text-steel">Asos sifatida oling va o'zingizga moslab o'zgartiring.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((b) => (
              <Link key={b.share_code} href={`/builder?code=${b.share_code}`} className="card flex flex-col p-5 hover:border-amber">
                <p className="h-display text-lg">{b.name}</p>
                <p className="mt-2 line-clamp-2 text-sm text-steel">
                  {[b.parts.cpu?.[0]?.name, b.parts.gpu?.[0]?.name].filter(Boolean).join(", ") || "Ofis uchun"}
                </p>
                <p className="mt-auto pt-4 text-sm text-steel">{b.estimated_watts} W</p>
                <p className="h-display text-xl text-amber">{som(b.total)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!categories && (
        <section className="wrap py-10">
          <div className="card p-6 text-steel">Server bilan aloqa yo'q. Backend ishga tushganini tekshiring (port 8000).</div>
        </section>
      )}
    </>
  );
}
