"use client";

import { useEffect } from "react";
import { PartyPopper } from "lucide-react";

const DURATION_MS = 2600;
const COLORS = ["#7c3aed", "#4f46e5", "#6c3bff", "#4f7cff", "#f59e0b", "#16a34a", "#ef4444", "#ec4899"];

export type ConfettiPiece = {
  left: number;
  delay: number;
  duration: number;
  drift: number;
  spin: number;
  size: number;
  color: string;
  round: boolean;
};

// Generated in the event handler (not during render) so each celebration looks different.
export function makeConfetti(count = 80): ConfettiPiece[] {
  return Array.from({ length: count }, () => ({
    left: Math.random() * 100,
    delay: Math.random() * 400,
    duration: 1600 + Math.random() * 1200,
    drift: (Math.random() - 0.5) * 240,
    spin: 360 + Math.random() * 720,
    size: 6 + Math.random() * 6,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    round: Math.random() > 0.6,
  }));
}

type Props = {
  pieces: ConfettiPiece[] | null;
  title: string;
  subtitle?: string;
  onDone: () => void;
};

// Full-screen confetti plus a "you saved" badge; purely decorative, never blocks clicks.
export function Celebration({ pieces, title, subtitle, onDone }: Props) {
  useEffect(() => {
    if (!pieces) return;
    const t = window.setTimeout(onDone, DURATION_MS);
    return () => window.clearTimeout(t);
  }, [pieces, onDone]);

  if (!pieces) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-120 overflow-hidden" aria-live="polite">
      {pieces.map((p, i) => (
        <span
          key={i}
          aria-hidden
          className="confetti-piece absolute top-0 block"
          style={
            {
              left: `${p.left}%`,
              width: p.size,
              height: p.round ? p.size : p.size * 0.45,
              background: p.color,
              borderRadius: p.round ? "9999px" : "2px",
              animation: `confetti-fall ${p.duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94) ${p.delay}ms forwards`,
              opacity: 0,
              "--confetti-drift": `${p.drift}px`,
              "--confetti-spin": `${p.spin}deg`,
            } as React.CSSProperties
          }
        />
      ))}

      <div className="absolute left-1/2 top-1/2 animate-celebrate-pop rounded-3xl border border-success/30 bg-card-background px-7 py-5 text-center shadow-2xl shadow-success/20">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-linear-to-br from-gradient-start to-gradient-end text-white shadow-lg shadow-primary/30">
          <PartyPopper className="h-6 w-6" />
        </span>
        <p className="mt-3 text-lg font-bold text-text-primary">{title}</p>
        {subtitle && <p className="mt-0.5 text-sm font-semibold text-success">{subtitle}</p>}
      </div>
    </div>
  );
}
