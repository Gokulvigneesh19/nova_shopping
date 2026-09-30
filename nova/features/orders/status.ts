import { BadgeCheck, CreditCard, Home, PackageCheck, Truck } from "lucide-react";

// Fulfilment flow shown in the status stepper. Values must match the backend's `status` choices;
// add, remove or reorder steps here and every stepper follows.
export const FULFILMENT_STEPS = [
  { value: "paid", label: "Paid", description: "Payment received", icon: CreditCard },
  { value: "confirmed", label: "Confirmed", description: "Order accepted", icon: BadgeCheck },
  { value: "packed", label: "Packed", description: "Ready to ship", icon: PackageCheck },
  { value: "in_transit", label: "In transit", description: "On the way", icon: Truck },
  { value: "delivered", label: "Delivered", description: "Handed to customer", icon: Home },
] as const;

export type FulfilmentStatus = (typeof FULFILMENT_STEPS)[number]["value"];

// Statuses that sit outside the flow and replace the stepper with a notice.
export const OFF_FLOW_STATUSES = {
  pending: { title: "Awaiting payment", tone: "warning" },
  cancelled: { title: "Order cancelled", tone: "muted" },
  failed: { title: "Payment failed", tone: "error" },
} as const;

export const stepIndexOf = (status: string) => FULFILMENT_STEPS.findIndex((s) => s.value === status.toLowerCase());

export const stepLabel = (status: string) =>
  FULFILMENT_STEPS.find((s) => s.value === status.toLowerCase())?.label ?? status.replace(/_/g, " ");

export const nextStep = (status: string) => {
  const i = stepIndexOf(status);
  return i === -1 || i === FULFILMENT_STEPS.length - 1 ? null : FULFILMENT_STEPS[i + 1];
};
