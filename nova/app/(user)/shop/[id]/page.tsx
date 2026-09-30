import { notFound } from "next/navigation";
import { getProductById, products } from "@/features/products/data/products";
import { ProductPageView } from "@/components/user/ProductPageView";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;


  return <ProductPageView id={id} />;
}
