import { formatCurrency } from "@/lib/format";
import type { Summary } from "@/lib/types";

function Card({ label, value, valueClass = "" }: { label: string; value: string | null; valueClass?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      {value === null ? (
        <div className="mt-3 h-8 w-32 animate-pulse rounded bg-slate-200" />
      ) : (
        <p className={`mt-2 text-3xl font-semibold tracking-tight tabular-nums ${valueClass}`}>{value}</p>
      )}
    </div>
  );
}

/** Pass `summary={null}` to show loading placeholders. */
export default function SummaryCards({ summary }: { summary: Summary | null }) {
  const netProfit = summary?.net_profit ?? 0;
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Card label="Total Income" value={summary && formatCurrency(summary.total_income)} />
      <Card label="Total Expenses" value={summary && formatCurrency(summary.total_expenses)} />
      <Card
        label="Net Profit"
        value={summary && formatCurrency(netProfit)}
        valueClass={netProfit < 0 ? "text-rose-600" : "text-emerald-600"}
      />
    </div>
  );
}
