"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Minus, Plus, Trash2 } from "lucide-react";
import ProductImage from "@/components/ProductImage";
import { api, ApiError } from "@/lib/api";
import { ASSEMBLY_FEE, useAuth, useCart } from "@/lib/store";
import { som } from "@/lib/format";
import type { Order } from "@/lib/types";

export default function CartPage() {
  const router = useRouter();
  const { lines, assembly, setQty, remove, setAssembly, clear } = useCart();
  const { user, ready } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState({ full_name: "", phone: "", address: "", comment: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (user) setForm((f) => ({ ...f, full_name: f.full_name || user.full_name, phone: f.phone || user.phone || "" }));
  }, [user]);

  if (!mounted) return <div className="wrap py-10 text-steel">Yuklanmoqda...</div>;

  const subtotal = lines.reduce((a, l) => a + l.price * l.qty, 0);
  const total = subtotal + (assembly ? ASSEMBLY_FEE : 0);

  if (lines.length === 0) {
    return (
      <div className="wrap py-16 text-center">
        <h1 className="h-display text-3xl">Savat bo'sh</h1>
        <p className="mt-2 text-steel">Katalogdan qism tanlang yoki kompyuterni bosqichma-bosqich yig'ing.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/builder" className="btn-primary">Kompyuter yig'ish</Link>
          <Link href="/catalog" className="btn-ghost">Katalog</Link>
        </div>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setError("");
    if (!user) {
      router.push("/login?next=/cart");
      return;
    }
    setSending(true);
    try {
      const order = await api<Order>("/api/orders", {
        method: "POST",
        json: { ...form, assembly, items: lines.map((l) => ({ product_id: l.id, quantity: l.qty })) },
      });
      clear();
      router.push(`/account?order=${order.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setErrors(Object.fromEntries(err.fields.map((f) => [f.field, f.message])));
      } else setError("Tarmoq xatosi. Internetni tekshiring.");
    } finally {
      setSending(false);
    }
  }

  const field = (name: keyof typeof form, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <label className="block text-sm">
      <span className="text-steel">{label}</span>
      <input className="input mt-1" value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} {...props} />
      {errors[name] && <span className="mt-1 block text-xs text-bad">{errors[name]}</span>}
    </label>
  );

  return (
    <div className="wrap py-8">
      <h1 className="h-display text-3xl">Savat</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_380px]">
        <ul className="flex flex-col gap-3">
          {lines.map((l) => (
            <li key={l.id} className="card flex items-center gap-3 p-3">
              <ProductImage src={l.image_url} alt={l.name} category={l.category_slug} className="h-20 w-20 shrink-0 rounded-chip" />
              <div className="min-w-0 flex-1">
                <Link href={`/product/${l.slug}`} className="line-clamp-2 font-semibold hover:text-amber">{l.name}</Link>
                <p className="mt-1 text-sm text-steel">{som(l.price)}</p>
              </div>
              <div className="flex items-center rounded-chip border border-rail">
                <button className="p-2 text-steel hover:text-ink" onClick={() => setQty(l.id, l.qty - 1)} aria-label="Kamaytirish"><Minus className="h-4 w-4" /></button>
                <span className="w-7 text-center text-sm font-semibold">{l.qty}</span>
                <button className="p-2 text-steel hover:text-ink" onClick={() => setQty(l.id, l.qty + 1)} aria-label="Ko'paytirish"><Plus className="h-4 w-4" /></button>
              </div>
              <p className="hidden w-32 text-right font-semibold sm:block">{som(l.price * l.qty)}</p>
              <button className="p-2 text-steel hover:text-bad" onClick={() => remove(l.id)} aria-label="O'chirish"><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
          <li className="card p-4">
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" className="mt-1 accent-[#F2A93B]" checked={assembly} onChange={(e) => setAssembly(e.target.checked)} />
              <span>
                <span className="font-semibold">Yig'ib berish xizmati — {som(ASSEMBLY_FEE)}</span>
                <span className="block text-sm text-steel">Usta yig'adi, kabellarni tartiblaydi, stress-test qiladi va Windows o'rnatadi.</span>
              </span>
            </label>
          </li>
        </ul>

        <form onSubmit={submit} className="card h-fit space-y-4 p-5 lg:sticky lg:top-24">
          <h2 className="h-display text-xl">Rasmiylashtirish</h2>
          {field("full_name", "Ism familiya", { required: true, minLength: 2, maxLength: 120, autoComplete: "name" })}
          {field("phone", "Telefon", { required: true, placeholder: "+998 90 123 45 67", inputMode: "tel", autoComplete: "tel", maxLength: 20 })}
          {field("address", "Yetkazish manzili", { required: true, minLength: 5, maxLength: 300, autoComplete: "street-address" })}
          {field("comment", "Izoh (ixtiyoriy)", { maxLength: 500 })}

          <div className="space-y-1 border-t border-rail pt-4 text-sm">
            <div className="flex justify-between text-steel"><span>Mahsulotlar</span><span>{som(subtotal)}</span></div>
            {assembly && <div className="flex justify-between text-steel"><span>Yig'ish</span><span>{som(ASSEMBLY_FEE)}</span></div>}
            <div className="flex items-baseline justify-between pt-2">
              <span>Jami</span><span className="h-display text-2xl text-amber">{som(total)}</span>
            </div>
          </div>
          {error && <p className="text-sm text-bad" role="alert">{error}</p>}
          <button className="btn-primary w-full py-3" disabled={sending || !ready}>
            {user ? (sending ? "Yuborilmoqda..." : "Buyurtma berish") : "Buyurtma uchun kiring"}
          </button>
          <p className="text-xs text-steel">To'lov yetkazib berilganda: naqd yoki karta orqali. Operator 15 daqiqada qo'ng'iroq qiladi.</p>
        </form>
      </div>
    </div>
  );
}
