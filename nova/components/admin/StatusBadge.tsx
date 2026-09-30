import { CheckCircle2, Clock, Truck, XCircle } from "lucide-react";
import type { OrderStatus } from "@/features/admin/data/mock";

const styles: Record<OrderStatus, { className: string; icon: typeof Clock }> = {
  Delivered: { className: "bg-success/10 text-success", icon: CheckCircle2 },
  Shipped: { className: "bg-primary-blue/10 text-primary-blue", icon: Truck },
  Processing: { className: "bg-warning/10 text-warning", icon: Clock },
  Cancelled: { className: "bg-error/10 text-error", icon: XCircle },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { className, icon: Icon } = styles[status];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${className}`}>
      <Icon className="h-3.5 w-3.5" />
      {status}
    </span>
  );
}
