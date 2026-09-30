export type Category =
  | "Electronics"
  | "Fashion"
  | "Footwear"
  | "Watches"
  | "Accessories";

export type Review = {
  id: string;
  user: string;
  user_email: string;
  rating: number;
  review: string;
  created_at: string;
  updated_at: string;
};

export type ProductImage = {
  id: string;
  image: string;
};

export type Product = {
  id: string;
  category_id: string;
  category_name: string;
  host: string;
  host_email: string;
  name: string;
  description: string;
  price: string;
  discount_percentage: string;
  price_after_discount: string;
  stock: number;
  image: string;
  cover_image?: string;
  sub_images?: ProductImage[];
  total_ratings: number;
  reviews: Array<Review>;
  is_wishlisted: boolean;
  is_bestseller: boolean;
  is_discounted: boolean;
  is_cart_added: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
