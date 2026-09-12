'use client';

import { useEffect, useRef } from 'react';

/** Confirmation for the irreversible actions: accepting a quote, deleting a job. */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  busy,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  busy: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-6"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="w-full max-w-md rounded-lg border border-line bg-canvas p-6 shadow-float"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className="text-lg font-extrabold tracking-[-0.01em]">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-[1.6] text-ink-500">{body}</p>
        <div className="mt-6 flex justify-end gap-2.5">
          <button onClick={onCancel} className="btn-secondary" disabled={busy}>
            Cancel
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className="btn-primary"
            disabled={busy}
          >
            {busy ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
