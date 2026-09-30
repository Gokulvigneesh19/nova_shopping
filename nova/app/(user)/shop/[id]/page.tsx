import { notFound } from "next/navigation";
import { ProductPageView } from "@/components/user/ProductPageView";


export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;


  return <ProductPageView id={id} />;
}
