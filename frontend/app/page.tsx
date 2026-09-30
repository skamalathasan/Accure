"use client";

import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import ErrorMessage from "@/components/ErrorMessage";
import IncomeExpenseChart from "@/components/IncomeExpenseChart";
import PageHeader from "@/components/PageHeader";
import SummaryCards from "@/components/SummaryCards";
import { getSummary } from "@/lib/api";
import { useLoad } from "@/lib/useLoad";

export default function DashboardPage() {
  const { data: summary, error, retry } = useLoad(getSummary);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Your income, expenses, and profit at a glance." />

      {error && !summary ? (
        <ErrorMessage message={error} onRetry={retry} />
      ) : (
        <>
          <SummaryCards summary={summary} />

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold">Income vs. Expenses</h2>
            <p className="text-sm text-slate-500">Monthly totals</p>
            <div className="mt-4">
              {!summary ? (
                <div className="h-[300px] animate-pulse rounded-lg bg-slate-100" />
              ) : summary.monthly.length === 0 ? (
                <EmptyState
                  title="Nothing to chart yet"
                  description="Your monthly income and expenses will show up here once you add transactions."
                  action={
                    <Link href="/transactions" className="text-sm font-medium underline underline-offset-4">
                      Go to Transactions
                    </Link>
                  }
                />
              ) : (
                <IncomeExpenseChart monthly={summary.monthly} />
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
