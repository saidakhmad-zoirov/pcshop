"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/store";
import type { User } from "@/lib/types";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const sp = useSearchParams();
  const setAuth = useAuth((s) => s.set);
  const [form, setForm] = useState({ email: "", password: "", full_name: "", phone: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Faqat sayt ichidagi yo'lga qaytaramiz (open redirect'dan himoya)
  const nextRaw = sp.get("next") ?? "";
  const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setErrors({});
    try {
      const body = mode === "login" ? { email: form.email, password: form.password } : { ...form, phone: form.phone || null };
      const d = await api<{ access_token: string; user: User }>(`/api/auth/${mode}`, { method: "POST", json: body });
      setAuth(d.access_token, d.user);
      router.push(d.user.role === "admin" && next === "/" ? "/admin" : next);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        setErrors(Object.fromEntries(err.fields.map((f) => [f.field, f.message])));
      } else setError("Tarmoq xatosi");
    } finally {
      setBusy(false);
    }
  }

  const input = (name: keyof typeof form, label: string, props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <label className="block text-sm">
      <span className="text-steel">{label}</span>
      <input className="input mt-1" value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} {...props} />
      {errors[name] && <span className="mt-1 block text-xs text-bad">{errors[name]}</span>}
    </label>
  );

  return (
    <div className="wrap flex justify-center py-16">
      <form onSubmit={submit} className="card w-full max-w-sm space-y-4 p-6">
        <h1 className="h-display text-2xl">{mode === "login" ? "Kirish" : "Ro'yxatdan o'tish"}</h1>
        {mode === "register" && input("full_name", "Ism familiya", { required: true, minLength: 2, maxLength: 120, autoComplete: "name" })}
        {input("email", "Email", { type: "email", required: true, autoComplete: "email", maxLength: 254 })}
        {mode === "register" && input("phone", "Telefon (ixtiyoriy)", { inputMode: "tel", autoComplete: "tel", maxLength: 20 })}
        {input("password", "Parol", {
          type: "password", required: true, minLength: mode === "register" ? 8 : 1, maxLength: 128,
          autoComplete: mode === "login" ? "current-password" : "new-password",
        })}
        {mode === "register" && <p className="text-xs text-steel">Kamida 8 belgi, harf va raqam bo'lsin.</p>}
        {error && <p className="text-sm text-bad" role="alert">{error}</p>}
        <button className="btn-primary w-full py-3" disabled={busy}>
          {busy ? "Kuting..." : mode === "login" ? "Kirish" : "Ro'yxatdan o'tish"}
        </button>
        <p className="text-center text-sm text-steel">
          {mode === "login" ? (
            <>Akkauntingiz yo'qmi? <Link href={`/register?next=${encodeURIComponent(next)}`} className="text-amber hover:underline">Ro'yxatdan o'ting</Link></>
          ) : (
            <>Akkauntingiz bormi? <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-amber hover:underline">Kiring</Link></>
          )}
        </p>
      </form>
    </div>
  );
}
