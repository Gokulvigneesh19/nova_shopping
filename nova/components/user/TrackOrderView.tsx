"use client";

import { useState } from "react";

const steps = [
  { label: "Confirmed", icon: "✅", date: "May 1, 10:30 AM" },
  { label: "Shipped", icon: "📦", date: "May 2, 2:00 PM" },
  { label: "Out for Delivery", icon: "🚚", date: "May 4, 9:00 AM" },
  { label: "Delivered", icon: "🏠", date: "Est. May 9" },
];

export function TrackOrderView() {
  const [trackingId, setTrackingId] = useState("");
  const [showResult, setShowResult] = useState(true);
  const currentStep = 1;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1 text-xs text-text-muted">
        <span>Home</span>
        <span>/</span>
        <span className="text-text-primary">Track Order</span>
      </nav>
      <h1 className="mt-4 animate-fade-in-down text-2xl font-bold text-text-primary">
        Track Your Order
      </h1>
      <p className="mt-1 animate-fade-in-down text-sm text-text-secondary [animation-delay:80ms]">
        Stay updated with your order status in real-time.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setShowResult(true);
        }}
        className="mt-8 flex animate-fade-in-up flex-col gap-3 rounded-2xl border border-border bg-card-background p-6 sm:flex-row sm:items-center"
      >
        <input
          value={trackingId}
          onChange={(e) => setTrackingId(e.target.value)}
          placeholder="Enter Tracking ID (e.g. NV324567890)"
          className="w-full flex-1 rounded-full border border-border px-5 py-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="submit"
          className="rounded-full bg-linear-to-r from-gradient-start to-gradient-end px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-transform duration-300 hover:scale-105 active:scale-95"
        >
          Track Order
        </button>
      </form>

      {showResult && (
        <div className="mt-8 animate-fade-in-up rounded-2xl border border-border bg-card-background p-6 [animation-delay:100ms]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-4">
            <div>
              <p className="text-xs text-text-muted">Order ID: NV324567890</p>
              <p className="text-xs text-text-muted">Placed on May 1, 2024 · 10:30 AM</p>
            </div>
            <span className="rounded-full bg-hover-bg px-3 py-1 text-xs font-semibold text-primary">
              In Transit
            </span>
          </div>

          {/* Timeline */}
          <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            {steps.map((step, i) => (
              <div key={step.label} className="flex flex-1 items-center sm:flex-col sm:text-center">
                <div className="flex items-center sm:flex-col">
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 text-lg transition-all duration-500 ${
                      i <= currentStep
                        ? "border-primary bg-linear-to-br from-gradient-start to-gradient-end text-white shadow-md shadow-primary/30"
                        : "border-border bg-soft-background text-text-muted"
                    } ${i === currentStep ? "animate-pulse-ring" : ""}`}
                  >
                    {step.icon}
                  </div>
                  {i < steps.length - 1 && (
                    <div className="mx-3 h-0.5 flex-1 overflow-hidden rounded-full bg-border sm:mx-0 sm:my-3 sm:h-1 sm:w-full">
                      <div
                        className={`h-full rounded-full bg-linear-to-r from-gradient-start to-gradient-end transition-all duration-700 ${
                          i < currentStep ? "w-full" : "w-0"
                        }`}
                      />
                    </div>
                  )}
                </div>
                <div className="ml-3 sm:ml-0 sm:mt-2">
                  <p
                    className={`text-xs font-semibold ${
                      i <= currentStep ? "text-text-primary" : "text-text-muted"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[11px] text-text-muted">{step.date}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 border-t border-border pt-6 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-[#EDE9FE] to-[#DBEAFE] text-2xl">
                🎧
              </span>
              <div>
                <p className="text-sm font-semibold text-text-primary">Nova Pro Headphones</p>
                <p className="text-xs text-text-muted">Cream White · Qty 1</p>
                <p className="text-xs text-text-muted">Courier: 123456789012</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-text-primary">Shipping Details</p>
              <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                Gokul Vigneesh <br />
                12 Cross Street, Coimbatore, Tamil Nadu, India
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
