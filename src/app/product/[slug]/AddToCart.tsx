"use client";
import Link from "next/link";
import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/lib/store";
import type { Product } from "@/lib/types";

export default function AddToCart({ p }: { p: Product }) {
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);
  const max = Math.min(20, p.stock);

  if (p.stock === 0) return null;
  return (
    <div className="mt-5 flex flex-wrap items-center gap-3">
      <div className="flex items-center rounded-chip border border-rail">
        <button className="p-2.5 text-steel hover:text-ink" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Kamaytirish">
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-8 text-center font-semibold" aria-live="polite">{qty}</span>
        <button className="p-2.5 text-steel hover:text-ink" onClick={() => setQty((q) => Math.min(max, q + 1))} aria-label="Ko'paytirish">
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <button className="btn-primary px-6" onClick={() => { add(p, qty); setDone(true); }}>Savatga qo'shish</button>
      {done && <Link href="/cart" className="text-sm text-ok hover:underline">Savatga qo'shildi — ko'rish</Link>}
    </div>
  );
}
