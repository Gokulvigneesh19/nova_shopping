import type { Metadata } from "next";
import { OrderDetailView } from "@/components/user/OrderDetailView";

export const metadata: Metadata = {
  title: "Order details — NovaShop",
};

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ paid?: string }>;
}) {
  const { id } = await params;
  const { paid } = await searchParams;
  return <OrderDetailView id={id} justPaid={paid === "1"} />;
}
