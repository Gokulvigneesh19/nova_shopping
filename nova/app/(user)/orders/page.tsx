import type { Metadata } from "next";
import { OrdersView } from "@/components/user/OrdersView";

export const metadata: Metadata = {
  title: "My orders — NovaShop",
};

export default function OrdersPage() {
  return <OrdersView />;
}
