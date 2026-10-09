"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, ShoppingCart, User as UserIcon, Wrench } from "lucide-react";
import { useAuth, useCart } from "@/lib/store";

export default function Header() {
  const router = useRouter();
  const user = useAuth((s) => s.user);
  const count = useCart((s) => s.lines.reduce((a, l) => a + l.qty, 0));
  const [q, setQ] = useState("");
  const [mounted, setMounted] = useState(false); // savat localStorage'dan — faqat brauzerda
  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-40 border-b border-rail bg-bench/95 backdrop-blur">
      <div className="wrap flex h-16 items-center gap-3 sm:gap-6">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="PC Forge bosh sahifa">
          <span className="grid h-8 w-8 place-items-center rounded-chip bg-amber text-bench">
            <Wrench className="h-4 w-4" strokeWidth={2.4} />
          </span>
          <span className="h-display hidden text-lg sm:inline">PC Forge</span>
        </Link>

        <form
          role="search"
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            router.push(`/catalog?q=${encodeURIComponent(q.trim())}`);
          }}
        >
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-steel" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="RTX 5070, Ryzen 7, 32GB DDR5..."
            aria-label="Mahsulot qidirish"
            maxLength={100}
            className="input pl-9"
          />
        </form>

        <nav className="flex items-center gap-1 text-sm sm:gap-2">
          <Link href="/catalog" className="hidden rounded-chip px-3 py-2 text-steel hover:text-ink md:block">Katalog</Link>
          <Link href="/builder" className="hidden rounded-chip px-3 py-2 font-semibold text-amber hover:text-ink sm:block">
            Kompyuter yig'ish
          </Link>
          <Link href="/cart" className="relative rounded-chip p-2 text-steel hover:text-ink" aria-label={`Savat, ${count} ta`}>
            <ShoppingCart className="h-5 w-5" />
            {mounted && count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-amber px-1 text-[11px] font-bold text-bench">
                {count}
              </span>
            )}
          </Link>
          <Link
            href={user ? (user.role === "admin" ? "/admin" : "/account") : "/login"}
            className="flex items-center gap-2 rounded-chip p-2 text-steel hover:text-ink"
            aria-label={user ? "Kabinet" : "Kirish"}
          >
            <UserIcon className="h-5 w-5" />
            <span className="hidden max-w-28 truncate lg:inline">{user ? user.full_name : "Kirish"}</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
