import { AlertCircle, Check, Clock, Loader2, XCircle } from "lucide-react";
import { FULFILMENT_STEPS, OFF_FLOW_STATUSES, stepIndexOf } from "../status";

type Props = {
  status: string;
  /** When the order last changed; shown under the current step. */
  updatedAt?: string;
  /** Admin mode: steps become buttons that request a status change. */
  editable?: boolean;
  onSelect?: (status: string) => void;
  /** Step currently being saved, to show a spinner on it. */
  savingStatus?: string | null;
  disabled?: boolean;
};

const noticeTone = {
  warning: { box: "border-warning/30 bg-warning/10 text-warning", icon: Clock },
  muted: { box: "border-border bg-soft-background text-text-secondary", icon: XCircle },
  error: { box: "border-error/30 bg-error/10 text-error", icon: AlertCircle },
} as const;

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

export function OrderStatusStepper({ status, updatedAt, editable = false, onSelect, savingStatus = null, disabled = false }: Props) {
  const key = status.toLowerCase();
  const current = stepIndexOf(key);
  const offFlow = OFF_FLOW_STATUSES[key as keyof typeof OFF_FLOW_STATUSES];
  const lastIndex = FULFILMENT_STEPS.length - 1;
  // Fill the connector up to the current step (the track spans first to last step centres).
  const progress = current <= 0 ? 0 : (current / lastIndex) * 100;

  return (
    <div className="space-y-3">
      {offFlow && (
        <p className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${noticeTone[offFlow.tone].box}`}>
          {(() => {
            const Icon = noticeTone[offFlow.tone].icon;
            return <Icon className="h-4 w-4 shrink-0" />;
          })()}
          {offFlow.title}
          {key === "pending" && <span className="font-normal opacity-80">· Fulfilment starts once the payment is received.</span>}
        </p>
      )}

      <ol className={`relative grid ${offFlow ? "opacity-50" : ""}`} style={{ gridTemplateColumns: `repeat(${FULFILMENT_STEPS.length}, minmax(0, 1fr))` }}>
        {/* Track between the first and last step centres */}
        <span
          className="absolute top-4.5 h-0.5 rounded-full bg-border"
          style={{ left: `${50 / FULFILMENT_STEPS.length}%`, right: `${50 / FULFILMENT_STEPS.length}%` }}
          aria-hidden
        />
        <span
          className="absolute top-4.5 h-0.5 rounded-full bg-linear-to-r from-gradient-start to-gradient-end transition-all duration-700 ease-brand"
          style={{ left: `${50 / FULFILMENT_STEPS.length}%`, width: `${(progress * (FULFILMENT_STEPS.length - 1)) / FULFILMENT_STEPS.length}%` }}
          aria-hidden
        />

        {FULFILMENT_STEPS.map((step, i) => {
          const done = current !== -1 && i < current;
          const active = i === current;
          const isNext = current !== -1 && i === current + 1;
          const saving = savingStatus === step.value;
          const Icon = step.icon;
          const clickable = editable && !offFlow && !active && !disabled && !!onSelect;

          const circle = (
            <span
              className={`relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 ease-brand ${
                done
                  ? "border-transparent bg-linear-to-br from-gradient-start to-gradient-end text-white shadow-md shadow-primary/30"
                  : active
                    ? "border-primary bg-card-background text-primary ring-4 ring-primary/15"
                    : isNext && editable
                      ? "border-dashed border-primary/50 bg-card-background text-primary/70"
                      : "border-border bg-card-background text-text-muted"
              } ${clickable ? "group-hover:scale-110 group-hover:border-primary group-hover:text-primary" : ""}`}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              {active && !offFlow && key !== "delivered" && (
                <span className="absolute inset-0 animate-ping rounded-full border-2 border-primary/40" aria-hidden />
              )}
            </span>
          );

          const text = (
            <>
              <span className={`mt-2 block text-[11px] font-semibold sm:text-xs ${active || done ? "text-text-primary" : "text-text-muted"}`}>
                {step.label}
              </span>
              <span className="hidden text-[10px] text-text-muted sm:block">
                {active && updatedAt ? formatWhen(updatedAt) : step.description}
              </span>
              {isNext && editable && !offFlow && (
                <span className="mt-0.5 inline-block rounded-full bg-primary/10 px-1.5 text-[9px] font-bold uppercase tracking-wide text-primary">Next</span>
              )}
            </>
          );

          return (
            <li key={step.value} className="flex flex-col items-center text-center" aria-current={active ? "step" : undefined}>
              {clickable ? (
                <button
                  type="button"
                  onClick={() => onSelect?.(step.value)}
                  title={`Mark as ${step.label}`}
                  className="group flex flex-col items-center rounded-lg px-1 focus-visible:outline-2 focus-visible:outline-primary"
                >
                  {circle}
                  {text}
                </button>
              ) : (
                <div className="flex flex-col items-center px-1">
                  {circle}
                  {text}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
