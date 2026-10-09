"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/lib/store";

/** Kirmagan foydalanuvchini login sahifasiga yuboradi. admin=true bo'lsa — faqat admin.
 *  Eslatma: bu faqat UI qulayligi. Haqiqiy himoya — backenddagi tekshiruv. */
export default function RequireAuth({ admin = false, children }: { admin?: boolean; children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace(`/login?next=${encodeURIComponent(path)}`);
    else if (admin && user.role !== "admin") router.replace("/");
  }, [ready, user, admin, router, path]);

  if (!ready || !user || (admin && user.role !== "admin")) {
    return <div className="wrap py-10 text-steel">Yuklanmoqda...</div>;
  }
  return <>{children}</>;
}
