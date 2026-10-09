"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Product, User } from "./types";

// ---- Auth: access token faqat xotirada (localStorage'da EMAS — XSS o'g'irlay olmasin) ----
interface AuthState {
  token: string | null;
  user: User | null;
  ready: boolean; // sahifa ochilganda sessiya tekshirib bo'lindimi
  set: (token: string | null, user: User | null) => void;
  setReady: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  token: null,
  user: null,
  ready: false,
  set: (token, user) => set({ token, user }),
  setReady: () => set({ ready: true }),
}));

// ---- Savat: localStorage'da (faqat id, nom, narx — narx serverda qayta hisoblanadi) ----
export interface CartLine {
  id: number;
  slug: string;
  name: string;
  price: number;
  image_url: string | null;
  category_slug: string;
  stock: number;
  qty: number;
}

interface CartState {
  lines: CartLine[];
  assembly: boolean;
  add: (p: Product, qty?: number) => void;
  addMany: (ps: Product[]) => void;
  setQty: (id: number, qty: number) => void;
  remove: (id: number) => void;
  setAssembly: (v: boolean) => void;
  clear: () => void;
}

const toLine = (p: Product, qty: number): CartLine => ({
  id: p.id, slug: p.slug, name: p.name, price: p.price, image_url: p.image_url,
  category_slug: p.category_slug, stock: p.stock, qty,
});

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      assembly: false,
      add: (p, qty = 1) =>
        set((s) => {
          const ex = s.lines.find((l) => l.id === p.id);
          if (ex) return { lines: s.lines.map((l) => (l.id === p.id ? { ...l, qty: Math.min(l.qty + qty, 20, p.stock) } : l)) };
          return { lines: [...s.lines, toLine(p, Math.min(qty, p.stock))] };
        }),
      addMany: (ps) =>
        set((s) => {
          const lines = [...s.lines];
          for (const p of ps) {
            const i = lines.findIndex((l) => l.id === p.id);
            if (i >= 0) lines[i] = { ...lines[i], qty: Math.min(lines[i].qty + 1, 20, p.stock) };
            else lines.push(toLine(p, 1));
          }
          return { lines, assembly: true };
        }),
      setQty: (id, qty) =>
        set((s) => ({ lines: s.lines.map((l) => (l.id === id ? { ...l, qty: Math.max(1, Math.min(qty, 20, l.stock)) } : l)) })),
      remove: (id) => set((s) => ({ lines: s.lines.filter((l) => l.id !== id) })),
      setAssembly: (assembly) => set({ assembly }),
      clear: () => set({ lines: [], assembly: false }),
    }),
    { name: "pcforge-cart", storage: createJSONStorage(() => localStorage) },
  ),
);

export const ASSEMBLY_FEE = 250_000;
