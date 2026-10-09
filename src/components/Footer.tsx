import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-rail">
      <div className="wrap grid gap-8 py-10 text-sm text-steel sm:grid-cols-3">
        <div>
          <p className="h-display text-base text-ink">PC Forge</p>
          <p className="mt-2 max-w-xs">Kompyuter qismlari, moslik tekshiruvi va yig'ib berish xizmati. Toshkent bo'ylab yetkazamiz.</p>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/catalog" className="hover:text-ink">Katalog</Link>
          <Link href="/builder" className="hover:text-ink">Kompyuter yig'ish</Link>
          <Link href="/account" className="hover:text-ink">Buyurtmalarim</Link>
        </div>
        <div>
          <p>Har kuni 9:00 dan 21:00 gacha</p>
          <p className="mt-1">+998 71 000 00 00</p>
          <p className="mt-4 text-xs">© {new Date().getFullYear()} PC Forge</p>
        </div>
      </div>
    </footer>
  );
}
