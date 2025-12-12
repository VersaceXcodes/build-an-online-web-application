// Database types for Kake Shop

export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  available: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductModifierGroup {
  id: string;
  product_id: string;
  name: string;
  selection_type: 'single' | 'multi';
  min_selections: number;
  max_selections: number | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface ProductModifierOption {
  id: string;
  modifier_group_id: string;
  name: string;
  price_adjustment: number;
  display_order: number;
  available: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductWithModifiers extends Product {
  modifier_groups?: (ProductModifierGroup & {
    options: ProductModifierOption[];
  })[];
}

export interface CartItemCustomization {
  group_id: string;
  group_name: string;
  option_id: string;
  option_name: string;
  price_adjustment: number;
}

export interface CartItem {
  id: string;
  user_id: string | null;
  product_id: string;
  quantity: number;
  customizations: CartItemCustomization[];
  created_at: string;
  updated_at: string;
}

export interface CartItemWithProduct extends CartItem {
  product: Product;
}
