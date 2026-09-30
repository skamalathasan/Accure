"use client";

import { useState } from "react";
import Button from "@/components/Button";
import ConfirmDialog from "@/components/ConfirmDialog";
import EmptyState from "@/components/EmptyState";
import ErrorMessage from "@/components/ErrorMessage";
import PageHeader from "@/components/PageHeader";
import TransactionForm from "@/components/TransactionForm";
import TransactionTable from "@/components/TransactionTable";
import {
  ApiError,
  createTransaction,
  deleteTransaction,
  getTransactions,
  updateTransaction,
} from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Transaction, TransactionInput } from "@/lib/types";
import { useLoad } from "@/lib/useLoad";

export default function TransactionsPage() {
  const { data: transactions, error, reload, retry } = useLoad(getTransactions);
  // "new" = the add form is open; a Transaction = editing that one; null = closed
  const [formTarget, setFormTarget] = useState<Transaction | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);

  /** If the transaction was already removed elsewhere (404), refresh the list, then pass the error on. */
  async function refreshIfMissing(err: unknown): Promise<never> {
    if (err instanceof ApiError && err.status === 404) await reload();
    throw err;
  }

  async function handleSave(input: TransactionInput) {
    try {
      if (formTarget === "new") await createTransaction(input);
      else if (formTarget) await updateTransaction(formTarget.id, input);
    } catch (err) {
      return refreshIfMissing(err);
    }
    setFormTarget(null);
    await reload();
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteTransaction(deleteTarget.id);
    } catch (err) {
      return refreshIfMissing(err);
    }
    setDeleteTarget(null);
    await reload();
  }

  const addButton = <Button onClick={() => setFormTarget("new")}>+ Add Transaction</Button>;
  const hasTransactions = transactions !== null && transactions.length > 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Transactions"
        description="Every payment in and out of your business."
        action={hasTransactions ? addButton : undefined}
      />

      {error && !transactions && <ErrorMessage message={error} onRetry={retry} />}
      {error && transactions && <ErrorMessage message={error} onRetry={reload} />}

      {!transactions && !error && (
        <div className="space-y-px overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm" aria-busy="true">
          {[0, 1, 2, 3, 4].map((row) => (
            <div key={row} className="h-14 animate-pulse bg-slate-50" />
          ))}
        </div>
      )}

      {transactions && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {transactions.length === 0 ? (
            <EmptyState
              title="No transactions yet"
              description="Start tracking your business finances by adding your first transaction."
              action={addButton}
            />
          ) : (
            <TransactionTable transactions={transactions} onEdit={setFormTarget} onDelete={setDeleteTarget} />
          )}
        </div>
      )}

      {formTarget && (
        <TransactionForm
          key={formTarget === "new" ? "new" : formTarget.id}
          transaction={formTarget === "new" ? null : formTarget}
          onSubmit={handleSave}
          onClose={() => setFormTarget(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Transaction"
          message={`Delete "${deleteTarget.description}" (${formatCurrency(deleteTarget.amount)} on ${formatDate(deleteTarget.date)})? This can't be undone.`}
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
