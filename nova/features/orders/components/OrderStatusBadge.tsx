import { OrderStatus } from "../types/order.types";

const styles: Record<string, string> = {
  pending: "bg-warning/10 text-warning",
  paid: "bg-success/10 text-success",
  confirmed: "bg-primary/10 text-primary",
  packed: "bg-primary/10 text-primary",
  in_transit: "bg-primary-blue/10 text-primary-blue",
  processing: "bg-primary/10 text-primary",
  shipped: "bg-primary-blue/10 text-primary-blue",
  delivered: "bg-success/10 text-success",
  cancelled: "bg-soft-background text-text-muted",
  failed: "bg-error/10 text-error",
};

const labels: Record<string, string> = {
  pending: "Payment pending",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const key = status.toLowerCase();
  const label = labels[key] ?? key.replace(/_/g, " ");
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${styles[key] ?? "bg-soft-background text-text-secondary"}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />
      {label}
    </span>
  );
}
