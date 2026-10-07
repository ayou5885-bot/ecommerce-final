export type StaffRole = 'admin' | 'staff';

export interface Staff {
  id: string;
  email: string;
  display_name: string | null;
  role: StaffRole;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  created_at: string;
}

export interface Brand {
  id: string;
  name: string;
  created_at: string;
}

export interface Specification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  brand: string;
  name: string;
  slug: string;
  category: string;
  price: number;
  image: string;
  short_description: string | null;
  description: string | null;
  specifications: Specification[];
  features: string[];
  availability: string;
  featured: boolean;
  stock_quantity: number;
  low_stock_threshold: number;
  created_at: string;
}

export interface Wilaya {
  code: string;
  name_ar: string;
  name_fr: string;
  shipping_price: number;
}

export type DiscountType = 'percent' | 'fixed';

export interface Coupon {
  id: string;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  expires_at: string | null;
  active: boolean;
  usage_limit: number | null;
  times_used: number;
  created_at: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  wilaya_code: string;
  wilaya_name: string;
  address: string;
  notes: string | null;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  coupon_code: string | null;
  total: number;
  status: OrderStatus;
  tracking_token: string;
}

export interface ContentBlock {
  type: 'heading' | 'paragraph' | 'image' | 'products' | 'banner';
  text?: string;
  image?: string;
  product_ids?: string[];
}

export interface LandingPage {
  slug: string;
  title: string;
  hero_image: string | null;
  content_blocks: ContentBlock[];
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
}
