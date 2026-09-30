"use client";

import { useState } from "react";
import { getErrorMessage } from "@/lib/api";
import Button from "./Button";
import Modal from "./Modal";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => Promise<void>; // throw to show an error; resolve and the parent closes the dialog
  onCancel: () => void;
}

export default function ConfirmDialog({ title, message, confirmLabel, onConfirm, onCancel }: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleConfirm() {
    setBusy(true);
    setError(null);
    try {
      await onConfirm();
    } catch (err) {
      setError(getErrorMessage(err));
      setBusy(false);
    }
  }

  return (
    <Modal title={title} onClose={busy ? () => {} : onCancel}>
      <p className="text-sm text-slate-600">{message}</p>
      {error && (
        <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-800">
          {error}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel} disabled={busy} autoFocus>
          Cancel
        </Button>
        <Button variant="danger" onClick={handleConfirm} disabled={busy}>
          {busy ? "Deleting…" : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
