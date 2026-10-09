import Link from "next/link";

export default function NotFound() {
  return (
    <div className="wrap py-20 text-center">
      <h1 className="h-display text-4xl">Sahifa topilmadi</h1>
      <p className="mt-2 text-steel">Havola eskirgan yoki mahsulot sotuvdan olingan bo'lishi mumkin.</p>
      <Link href="/catalog" className="btn-primary mt-6">Katalogga qaytish</Link>
    </div>
  );
}
