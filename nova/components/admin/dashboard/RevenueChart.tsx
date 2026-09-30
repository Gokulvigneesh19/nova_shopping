"use client";

import { useState } from "react";
import { formatCurrency } from "@/features/admin/data/mock";
import { DashboardResponse } from "@/features/admin/types/dashboard.types";
import { formatMoneyCompact } from "@/lib/utils/currency";

const W = 640;
const H = 240;
const PAD = { top: 16, right: 12, bottom: 28, left: 44 };
const TICK_COUNT = 4;

const innerW = W - PAD.left - PAD.right;
const innerH = H - PAD.top - PAD.bottom;

// Rounds the tick step up to 1/2/2.5/5 × 10ⁿ so axis labels stay readable.
function niceStep(max: number) {
  const raw = max / TICK_COUNT;
  const mag = 10 ** Math.floor(Math.log10(raw));
  return [1, 2, 2.5, 5, 10].find((m) => m * mag >= raw)! * mag;
}

export function RevenueChart({ data }: { data?: DashboardResponse["revenue_chart"] }) {
  const [hover, setHover] = useState<number | null>(null);

  if (!data) {
    return (
      <div className="rounded-2xl border border-border bg-card-background p-5 sm:p-6">
        <div className="h-4 w-40 animate-pulse rounded bg-hover-bg" />
        <div className="mt-2 h-8 w-32 animate-pulse rounded bg-hover-bg" />
        <div className="mt-4 aspect-640/240 animate-pulse rounded-xl bg-hover-bg" />
      </div>
    );
  }

  const points = data.months.map((m) => ({ label: m.label, value: Number(m.revenue) }));
  const last = points.length - 1;
  const step = niceStep(Math.max(...points.map((p) => p.value), 1000));
  const ticks = Array.from({ length: TICK_COUNT + 1 }, (_, i) => i * step);
  const max = ticks[TICK_COUNT];

  const x = (i: number) => PAD.left + (i / Math.max(last, 1)) * innerW;
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;

  const linePath = points.map((d, i) => `${i ? "L" : "M"}${x(i)},${y(d.value)}`).join(" ");
  const areaPath = `${linePath} L${x(last)},${y(0)} L${x(0)},${y(0)} Z`;

  const handleMove = (e: React.PointerEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    setHover(Math.max(0, Math.min(last, Math.round(ratio * last))));
  };

  const active = hover ?? last;
  const point = points[active];

  return (
    <div className="rounded-2xl border border-border bg-card-background p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-text-secondary">Revenue, last 12 months</h2>
          <p className="mt-1 text-2xl font-bold text-text-primary">{formatCurrency(Number(data.total))}</p>
        </div>
        <div className="rounded-xl bg-soft-background px-3 py-2 text-right">
          <p className="text-xs text-text-muted">{hover === null ? "This month" : point.label}</p>
          <p className="text-sm font-semibold text-text-primary">{formatCurrency(point.value)}</p>
        </div>
      </div>

      <div className="relative mt-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Monthly revenue line chart">
          <defs>
            <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary-purple)" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--color-primary-purple)" stopOpacity="0" />
            </linearGradient>
          </defs>

          {ticks.map((t) => (
            <g key={t}>
              <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--color-border)" strokeDasharray={t ? "3 4" : undefined} />
              <text x={PAD.left - 8} y={y(t)} dy="0.32em" textAnchor="end" className="fill-text-muted text-[11px]">
                {formatMoneyCompact(t)}
              </text>
            </g>
          ))}

          {data.months.map((d, i) => (
            <text key={d.month} x={x(i)} y={H - 8} textAnchor="middle" className="fill-text-muted text-[11px]">
              {d.label}
            </text>
          ))}

          <path d={areaPath} fill="url(#rev-fill)" />
          <path d={linePath} fill="none" stroke="var(--color-primary-purple)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {hover !== null && (
            <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={y(0)} stroke="var(--color-text-muted)" strokeDasharray="3 3" />
          )}
          <circle cx={x(active)} cy={y(point.value)} r={5} fill="var(--color-primary-purple)" stroke="var(--color-card-background)" strokeWidth={2} />

          <rect
            x={PAD.left}
            y={PAD.top}
            width={innerW}
            height={innerH}
            fill="transparent"
            onPointerMove={handleMove}
            onPointerLeave={() => setHover(null)}
          />
        </svg>

        {hover !== null && (
          <div
            className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg bg-text-primary px-2.5 py-1.5 text-xs text-white shadow-lg"
            style={{ left: `${(x(hover) / W) * 100}%`, top: `${(y(point.value) / H) * 100 - 4}%` }}
          >
            <span className="font-semibold">{formatCurrency(point.value)}</span>
            <span className="ml-1.5 text-white/60">{point.label}</span>
          </div>
        )}
      </div>
    </div>
  );
}
