"use client";

import { useState, type ReactNode } from "react";
import { getErrorMessage } from "@/lib/api";
import { CATEGORIES } from "@/lib/categories";
import { todayISO } from "@/lib/format";
import type { Transaction, TransactionInput, TransactionType } from "@/lib/types";
import Button from "./Button";
import Modal from "./Modal";

interface FormValues {
  description: string;
  amount: string; // kept as text while typing
  type: TransactionType;
  category: string;
  date: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

const INPUT_CLASS =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-2 focus:outline-offset-0 focus:outline-slate-900";

function getInitialValues(transaction: Transaction | null): FormValues {
  if (transaction) {
    return {
      description: transaction.description,
      amount: transaction.amount.toFixed(2),
      type: transaction.type,
      category: transaction.category,
      date: transaction.date,
    };
  }
  return { description: "", amount: "", type: "expense", category: CATEGORIES.expense[0], date: todayISO() };
}

/** Checks the form. Returns the cleaned-up input if valid, otherwise the error messages. */
function validate(values: FormValues): { input?: TransactionInput; errors?: FormErrors } {
  const errors: FormErrors = {};

  const description = values.description.trim();
  if (!description) errors.description = "Enter a description.";
  else if (description.length > 200) errors.description = "Keep the description under 200 characters.";

  const amountText = values.amount.replace(/[$,\s]/g, "");
  const amount = Number(amountText);
  if (!/^\d+(\.\d{1,2})?$/.test(amountText)) errors.amount = "Enter an amount like 25 or 25.50.";
  else if (amount <= 0) errors.amount = "Amount must be greater than 0.";
  else if (amount > 9_999_999_999.99) errors.amount = "That amount is too large.";

  if (!CATEGORIES[values.type].includes(values.category)) errors.category = "Choose a category.";

  const parsedDate = new Date(`${values.date}T00:00:00`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.date) || Number.isNaN(parsedDate.getTime())) {
    errors.date = "Choose a valid date.";
  }

  if (Object.keys(errors).length > 0) return { errors };
  return { input: { description, amount, type: values.type, category: values.category, date: values.date } };
}

function Field({ label, htmlFor, error, children }: { label: string; htmlFor: string; error?: string; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="mt-1 text-sm text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}

interface TransactionFormProps {
  transaction: Transaction | null; // null = adding a new one
  onSubmit: (input: TransactionInput) => Promise<void>; // throw to show an error; resolve and the parent closes the form
  onClose: () => void;
}

export default function TransactionForm({ transaction, onSubmit, onClose }: TransactionFormProps) {
  const [values, setValues] = useState(() => getInitialValues(transaction));
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isEditing = transaction !== null;

  function setValue<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function changeType(type: TransactionType) {
    // Categories depend on the type, so pick a valid one for the new type.
    setValues((current) => ({
      ...current,
      type,
      category: CATEGORIES[type].includes(current.category) ? current.category : CATEGORIES[type][0],
    }));
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const result = validate(values);
    setErrors(result.errors ?? {});
    if (!result.input) return;

    setSaving(true);
    setSubmitError(null);
    try {
      await onSubmit(result.input);
    } catch (err) {
      setSubmitError(getErrorMessage(err));
      setSaving(false);
    }
  }

  const inputClass = (field: keyof FormValues) =>
    `${INPUT_CLASS} ${errors[field] ? "border-rose-400" : "border-slate-300"}`;
  const errorProps = (field: keyof FormValues) =>
    errors[field] ? { "aria-invalid": true, "aria-describedby": `${field}-error` } : {};

  return (
    <Modal title={isEditing ? "Edit Transaction" : "Add Transaction"} onClose={saving ? () => {} : onClose}>
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div role="radiogroup" aria-label="Type" className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
          {(["expense", "income"] as const).map((type) => (
            <button
              key={type}
              type="button"
              role="radio"
              aria-checked={values.type === type}
              onClick={() => changeType(type)}
              className={`rounded-md py-1.5 text-sm font-medium transition-colors ${
                values.type === type ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {type === "income" ? "Income" : "Expense"}
            </button>
          ))}
        </div>

        <Field label="Description" htmlFor="description" error={errors.description}>
          <input
            id="description"
            autoFocus
            value={values.description}
            onChange={(e) => setValue("description", e.target.value)}
            className={inputClass("description")}
            placeholder="e.g. Client payment"
            {...errorProps("description")}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Amount" htmlFor="amount" error={errors.amount}>
            <input
              id="amount"
              inputMode="decimal"
              value={values.amount}
              onChange={(e) => setValue("amount", e.target.value)}
              className={`${inputClass("amount")} tabular-nums`}
              placeholder="0.00"
              {...errorProps("amount")}
            />
          </Field>
          <Field label="Date" htmlFor="date" error={errors.date}>
            <input
              id="date"
              type="date"
              value={values.date}
              onChange={(e) => setValue("date", e.target.value)}
              className={inputClass("date")}
              {...errorProps("date")}
            />
          </Field>
        </div>

        <Field label="Category" htmlFor="category" error={errors.category}>
          <select
            id="category"
            value={values.category}
            onChange={(e) => setValue("category", e.target.value)}
            className={inputClass("category")}
            {...errorProps("category")}
          >
            {CATEGORIES[values.type].map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Field>

        {submitError && (
          <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">
            {submitError}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving…" : isEditing ? "Save Changes" : "Add Transaction"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
