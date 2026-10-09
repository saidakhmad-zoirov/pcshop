// Server komponentlar uchun: backendga to'g'ridan-to'g'ri (ichki tarmoq orqali) so'rov
import type { Category, Product, SavedBuild } from "./types";

const BACKEND = process.env.BACKEND_URL || "http://localhost:8000";

async function get<T>(path: string, revalidate = 60): Promise<T | null> {
  try {
    const r = await fetch(`${BACKEND}${path}`, { next: { revalidate } });
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null; // backend ishlamasa ham sahifa ochiladi
  }
}

export const getCategories = () => get<Category[]>("/api/categories");
export const getFeatured = () => get<SavedBuild[]>("/api/builder/builds/featured");
export const getProduct = (slug: string) => get<Product>(`/api/products/${encodeURIComponent(slug)}`, 30);
export const getRelated = (slug: string) => get<Product[]>(`/api/products/${encodeURIComponent(slug)}/related`);
export const getDeals = () =>
  get<{ items: Product[] }>("/api/products?on_sale=true&size=8&sort=price_desc").then((d) => d?.items ?? []);
