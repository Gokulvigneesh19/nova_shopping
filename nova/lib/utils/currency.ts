// Single source of truth for money display. Change the symbol/code/locale here and the whole app follows.
export const CURRENCY = {
  symbol: "₹",
  code: "INR",
  // Indian digit grouping: 1,20,000.00
  locale: "en-IN",
} as const;

export const CURRENCY_SYMBOL = CURRENCY.symbol;

type MoneyOptions = {
  /** Fraction digits; defaults to 2 (e.g. ₹1,20,000.00). */
  decimals?: number;
};

// "₹1,20,000.00", "−₹500.00" for negatives. Accepts API decimal strings too.
export function formatMoney(value: number | string | null | undefined, { decimals = 2 }: MoneyOptions = {}) {
  const n = Number(value ?? 0);
  const safe = Number.isFinite(n) ? n : 0;
  const digits = Math.abs(safe).toLocaleString(CURRENCY.locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${safe < 0 ? "−" : ""}${CURRENCY_SYMBOL}${digits}`;
}

// Short form for chart axes: ₹84k, ₹1.2L-style is avoided to keep axes predictable.
export const formatMoneyCompact = (value: number) =>
  value >= 1000 ? `${CURRENCY_SYMBOL}${Number((value / 1000).toFixed(1))}k` : formatMoney(value, { decimals: 0 });
