import { Suspense } from "react";
import type { Metadata } from "next";
import CatalogView from "./CatalogView";

export const metadata: Metadata = { title: "Katalog" };

export default function CatalogPage() {
  return (
    <Suspense fallback={<div className="wrap py-10 text-steel">Yuklanmoqda...</div>}>
      <CatalogView />
    </Suspense>
  );
}
