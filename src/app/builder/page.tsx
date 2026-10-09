import { Suspense } from "react";
import type { Metadata } from "next";
import Builder from "./Builder";

export const metadata: Metadata = { title: "Kompyuter yig'ish" };

export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="wrap py-10 text-steel">Yuklanmoqda...</div>}>
      <Builder />
    </Suspense>
  );
}
