"use client";
import Link from "next/link";
import { useState } from "react";
import { Check, Plus } from "lucide-react";
import type { Product } from "@/lib/types";
import { KEY_SPECS, SPEC_LABELS, som, specValue } from "@/lib/format";
import { useCart } from "@/lib/store";
import ProductImage from "./ProductImage";

export default function ProductCard({ p }: { p: Product }) {
  const add = useCart((s) => s.add);
  const [added, setAdded] = useState(false);
  const keys = KEY_SPECS[p.category_slug] ?? [];
  const sale = p.old_price && p.old_price > p.price;

  return (
    <article className="card group flex flex-col overflow-hidden">
      <Link href={`/product/${p.slug}`} className="relative block">
        <ProductImage src={p.image_url} alt={p.name} category={p.category_slug} className="aspect-[4/3] w-full" />
        {sale && (
          <span className="absolute left-3 top-3 rounded-chip bg-bad px-2 py-0.5 text-xs font-bold text-white">
            −{Math.round((1 - p.price / p.old_price!) * 100)}%
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <p className="text-xs text-steel">{p.brand}</p>
          <Link href={`/product/${p.slug}`} className="mt-0.5 line-clamp-2 font-semibold leading-snug hover:text-amber">
            {p.name}
          </Link>
        </div>
        {keys.length > 0 && (
          <dl className="grid gap-1 text-xs text-steel">
            {keys.filter((k) => p.specs[k] !== undefined).map((k) => (
              <div key={k} className="flex justify-between gap-2">
                <dt className="truncate">{SPEC_LABELS[k] ?? k}</dt>
                <dd className="shrink-0 text-ink">{specValue(p.specs[k])}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div>
            {sale && <p className="text-xs text-steel line-through">{som(p.old_price!)}</p>}
            <p className="h-display text-lg">{som(p.price)}</p>
            <p className={`text-xs ${p.stock > 0 ? "text-ok" : "text-bad"}`}>
              {p.stock > 0 ? (p.stock < 5 ? `Oz qoldi: ${p.stock} ta` : "Omborda bor") : "Tugagan"}
            </p>
          </div>
          <button
            type="button"
            disabled={p.stock === 0}
            onClick={() => {
              add(p);
              setAdded(true);
              setTimeout(() => setAdded(false), 1400);
            }}
            className="btn-primary h-10 w-10 shrink-0 px-0"
            aria-label={`${p.name} — savatga qo'shish`}
          >
            {added ? <Check className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </article>
  );
}
