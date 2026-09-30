import { CURRENCY_SYMBOL, formatMoney } from "@/lib/utils/currency";
// Placeholder data for the admin panel until admin API endpoints exist.

export type OrderStatus = "Delivered" | "Shipped" | "Processing" | "Cancelled";

export type AdminOrder = {
  id: string;
  customer: string;
  email: string;
  product: string;
  date: string;
  amount: number;
  status: OrderStatus;
};

export type AdminProduct = {
  id: string;
  name: string;
  category: string;
  image: string;
  price: number;
  stock: number;
  sold: number;
  active: boolean;
};

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  orders: number;
  spent: number;
  joined: string;
};

export const stats = [
  { key: "revenue", label: "Total Revenue", value: 84_254, prefix: CURRENCY_SYMBOL, change: 12.4 },
  { key: "orders", label: "Orders", value: 1_842, change: 8.1 },
  { key: "customers", label: "New Customers", value: 326, change: -3.2 },
  { key: "conversion", label: "Conversion Rate", value: 3.6, suffix: "%", change: 0.4 },
] as const;

export const monthlyRevenue = [
  { month: "Oct", value: 42_300 },
  { month: "Nov", value: 51_800 },
  { month: "Dec", value: 68_400 },
  { month: "Jan", value: 47_900 },
  { month: "Feb", value: 49_200 },
  { month: "Mar", value: 55_600 },
  { month: "Apr", value: 58_100 },
  { month: "May", value: 62_700 },
  { month: "Jun", value: 60_400 },
  { month: "Jul", value: 71_200 },
  { month: "Aug", value: 76_900 },
  { month: "Sep", value: 84_254 },
];

export const salesByCategory = [
  { category: "Electronics", value: 32_480 },
  { category: "Fashion", value: 18_920 },
  { category: "Watches", value: 14_310 },
  { category: "Footwear", value: 11_050 },
  { category: "Accessories", value: 7_494 },
];

export const orders: AdminOrder[] = [
  { id: "NS-10482", customer: "Olivia Martin", email: "olivia@example.com", product: "Nova Pro Headphones", date: "2026-09-23", amount: 199, status: "Processing" },
  { id: "NS-10481", customer: "Liam Chen", email: "liam@example.com", product: "Smart Watch Series 9", date: "2026-09-23", amount: 299, status: "Shipped" },
  { id: "NS-10480", customer: "Ava Patel", email: "ava@example.com", product: "Nike Air Max 270", date: "2026-09-22", amount: 150, status: "Delivered" },
  { id: "NS-10479", customer: "Noah Williams", email: "noah@example.com", product: "iPhone 15 Pro", date: "2026-09-22", amount: 999, status: "Delivered" },
  { id: "NS-10478", customer: "Sophia Nguyen", email: "sophia@example.com", product: "Leather Tote Bag", date: "2026-09-21", amount: 120, status: "Cancelled" },
  { id: "NS-10477", customer: "James Brown", email: "james@example.com", product: "Aviator Sunglasses", date: "2026-09-21", amount: 89, status: "Shipped" },
  { id: "NS-10476", customer: "Mia Rossi", email: "mia@example.com", product: "Modern Lounge Sofa", date: "2026-09-20", amount: 1_249, status: "Processing" },
  { id: "NS-10475", customer: "Ethan Kim", email: "ethan@example.com", product: "Classic Chronograph", date: "2026-09-20", amount: 349, status: "Delivered" },
  { id: "NS-10474", customer: "Isabella Garcia", email: "isabella@example.com", product: "Nova Pro Headphones", date: "2026-09-19", amount: 199, status: "Delivered" },
  { id: "NS-10473", customer: "Lucas Silva", email: "lucas@example.com", product: "Cotton Overshirt", date: "2026-09-19", amount: 65, status: "Shipped" },
];



export const customers: AdminCustomer[] = [
  { id: "c1", name: "Olivia Martin", email: "olivia@example.com", orders: 14, spent: 2_840, joined: "2025-02-11" },
  { id: "c2", name: "Liam Chen", email: "liam@example.com", orders: 9, spent: 1_920, joined: "2025-05-03" },
  { id: "c3", name: "Ava Patel", email: "ava@example.com", orders: 21, spent: 4_310, joined: "2024-11-20" },
  { id: "c4", name: "Noah Williams", email: "noah@example.com", orders: 5, spent: 2_105, joined: "2026-01-14" },
  { id: "c5", name: "Sophia Nguyen", email: "sophia@example.com", orders: 3, spent: 360, joined: "2026-06-28" },
  { id: "c6", name: "James Brown", email: "james@example.com", orders: 11, spent: 1_470, joined: "2025-08-09" },
  { id: "c7", name: "Mia Rossi", email: "mia@example.com", orders: 7, spent: 3_620, joined: "2025-10-30" },
  { id: "c8", name: "Ethan Kim", email: "ethan@example.com", orders: 16, spent: 2_990, joined: "2025-03-17" },
];

// Whole-rupee amounts for admin stats/tables; see lib/utils/currency.
export const formatCurrency = (n: number) => formatMoney(n, { decimals: 0 });

export const formatDate = (iso: string) =>
  new Date(iso.includes("T") ? iso : iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
