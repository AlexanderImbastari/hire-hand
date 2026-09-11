'use client';

import { useState } from 'react';

interface Props {
  busy: boolean;
  onSubmit: (priceCents: number, message: string) => void;
}

export function QuoteForm({ busy, onSubmit }: Props) {
  const [price, setPrice] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function submit() {
    const dollars = Number(price);
    if (!Number.isFinite(dollars) || dollars <= 0) {
      return setError('Enter a price above zero.');
    }
    if (!message.trim()) {
      return setError('Say what the price covers.');
    }
    setError('');
    onSubmit(Math.round(dollars * 100), message.trim());
  }

  return (
    <div className="card p-5">
      <h3 className="font-semibold">Send a quote</h3>
      <div className="mt-4 grid gap-4">
        <div className="max-w-40">
          <label className="label" htmlFor="price">
            Your price (USD)
          </label>
          <input
            id="price"
            className="field"
            inputMode="decimal"
            placeholder="280"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            className="field min-h-24"
            placeholder="What the price covers, when you could start, and anything that might change it."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
      </div>
      {error && <p className="mt-3 text-sm text-clay">{error}</p>}
      <button className="btn-primary mt-4" disabled={busy} onClick={submit}>
        Send quote
      </button>
    </div>
  );
}
