const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const compactCurrency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  notation: "compact",
  maximumFractionDigits: 1,
});

export const formatCurrency = (amount: number) => currency.format(amount);
export const formatCompactCurrency = (amount: number) => compactCurrency.format(amount);

/** "2026-09-30" -> "09/30/26". Splits the string so time zones can't shift the day. */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${month}/${day}/${year.slice(2)}`;
}

/** "2026-09" -> "Sep 2026" */
export function formatMonth(yearMonth: string): string {
  const [year, month] = yearMonth.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/** Today's date in the user's local time zone, as "YYYY-MM-DD". */
export function todayISO(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
