export type Specs = Record<string, string | number | boolean | Array<string | number>>;

export interface Category {
  id: number;
  slug: string;
  name: string;
  icon: string;
  is_build_part: boolean;
  build_required: boolean;
  product_count: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  brand: string;
  price: number;
  old_price: number | null;
  stock: number;
  image_url: string | null;
  description: string;
  specs: Specs;
  category_slug: string;
  category_name: string;
}

export interface ProductPage {
  items: Product[];
  total: number;
  page: number;
  pages: number;
  brands: string[];
  price_min: number;
  price_max: number;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  role: "user" | "admin";
}

export interface CompatIssue {
  level: "error" | "warning";
  message: string;
  parts: string[];
}

export interface BuildCheck {
  total: number;
  estimated_watts: number;
  recommended_psu: number;
  issues: CompatIssue[];
  compatible: boolean;
  missing_required: string[];
  parts: Record<string, Product[]>;
}

export interface SavedBuild extends BuildCheck {
  share_code: string;
  name: string;
  items: Record<string, number | number[]>;
}

export interface OrderItem {
  product_id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  status: string;
  total: number;
  assembly: boolean;
  assembly_fee: number;
  full_name: string;
  phone: string;
  address: string;
  comment: string;
  created_at: string;
  items: OrderItem[];
}
