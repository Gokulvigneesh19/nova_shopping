import { OrderStatus } from "@/features/orders/types/order.types";

// Django Decimals may arrive as numbers or strings; read them with Number().
type Money = number | string;

export interface DashboardStat {
  value: Money;
  previous: Money;
  // null when last period was 0 and this period isn't.
  change_percentage: number | null;
}

export interface DashboardStats {
  total_revenue: DashboardStat;
  orders: DashboardStat;
  new_customers: DashboardStat;
  conversion_rate: DashboardStat;
}

export interface RevenuePoint {
  month: string; // YYYY-MM
  label: string; // "Sep"
  revenue: Money;
  orders: number;
}

export interface CategorySale {
  category_id: string | null;
  name: string | null;
  amount: Money;
  percentage: number;
}

export interface DashboardRecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  product_name: string;
  other_items_count: number;
  created_at: string;
  status: OrderStatus;
  status_display: string;
  payment_status: string;
  total_amount: Money;
}

export interface DashboardTopProduct {
  id: string;
  name: string;
  category: string;
  cover_image: string | null;
  price: Money;
  is_bestseller: boolean;
  units_sold: number;
  revenue: Money;
}

export interface DashboardLowStock {
  threshold: number;
  count: number;
  products: { id: string; name: string; stock: number }[];
}

export interface DashboardResponse {
  message: string;
  period: { start_date: string; end_date: string };
  stats: DashboardStats;
  revenue_chart: { total: Money; this_month: Money; months: RevenuePoint[] };
  sales_by_category: { total: Money; categories: CategorySale[] };
  recent_orders: DashboardRecentOrder[];
  top_products: DashboardTopProduct[];
  low_stock: DashboardLowStock;
}

export interface DashboardParams {
  start_date?: string; // YYYY-MM-DD, defaults to the 1st of this month
  end_date?: string; // YYYY-MM-DD, defaults to today
}
