'use client';

import { useEffect, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { copyToClipboard } from './clipboard';

export function CopyEmailButton({ email, className }: { email: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timeout);
  }, [copied]);

  async function handleCopy() {
    // If copying fails entirely the mailto button next to it still works
    if (await copyToClipboard(email)) setCopied(true);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="E-posta adresini kopyala"
      title={copied ? 'Kopyalandı' : 'E-postayı kopyala'}
      className={className}
    >
      {copied ? (
        <Check aria-hidden="true" className="size-4 text-emerald-300" />
      ) : (
        <Copy aria-hidden="true" className="size-4" />
      )}
      <span className="sr-only" aria-live="polite">
        {copied ? 'Kopyalandı' : ''}
      </span>
    </button>
  );
}
