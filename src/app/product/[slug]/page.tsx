import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductImage from "@/components/ProductImage";
import ProductCard from "@/components/ProductCard";
import AddToCart from "./AddToCart";
import { getProduct, getRelated } from "@/lib/server";
import { SPEC_LABELS, som, specValue } from "@/lib/format";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProduct((await params).slug);
  return { title: p?.name ?? "Mahsulot topilmadi", description: p?.description };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [p, related] = await Promise.all([getProduct(slug), getRelated(slug)]);
  if (!p) notFound();
  const sale = p.old_price && p.old_price > p.price;

  return (
    <div className="wrap py-8">
      <nav className="text-sm text-steel" aria-label="Yo'l">
        <Link href="/catalog" className="hover:text-ink">Katalog</Link>
        <span className="mx-2">/</span>
        <Link href={`/catalog?category=${p.category_slug}`} className="hover:text-ink">{p.category_name}</Link>
      </nav>

      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <ProductImage src={p.image_url} alt={p.name} category={p.category_slug} className="aspect-square w-full rounded-card border border-rail" />

        <div>
          <p className="text-steel">{p.brand}</p>
          <h1 className="h-display mt-1 text-3xl leading-tight sm:text-4xl">{p.name}</h1>
          <p className="mt-4 max-w-prose text-steel">{p.description}</p>

          <div className="card mt-6 p-5">
            {sale && <p className="text-sm text-steel line-through">{som(p.old_price!)}</p>}
            <p className="h-display text-3xl text-amber">{som(p.price)}</p>
            <p className={`mt-1 text-sm ${p.stock > 0 ? "text-ok" : "text-bad"}`}>
              {p.stock > 0 ? `Omborda: ${p.stock} ta` : "Hozircha tugagan"}
            </p>
            <AddToCart p={p} />
          </div>

          <h2 className="h-display mt-8 text-xl">Xususiyatlari</h2>
          <dl className="mt-3 divide-y divide-rail border-y border-rail text-sm">
            {Object.entries(p.specs).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2.5">
                <dt className="text-steel">{SPEC_LABELS[k] ?? k}</dt>
                <dd className="text-right">{specValue(v)}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {related && related.length > 0 && (
        <section className="mt-16">
          <h2 className="h-display text-2xl">O'xshash narxdagilar</h2>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => <ProductCard key={r.id} p={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
