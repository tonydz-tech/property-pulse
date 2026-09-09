"use client";

import { useActionState, useState } from "react";
import { createPaymentLink } from "@/app/(dashboard)/rent-ledger/actions";

export function PaymentLinkButton({ paymentId }: { paymentId: string }) {
  const [url, formAction, pending] = useActionState(
    createPaymentLink,
    undefined
  );
  const [copied, setCopied] = useState(false);

  if (url) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="text-xs font-medium text-moss hover:underline"
        >
          {copied ? "Copied!" : "Copy payment link"}
        </button>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="paymentId" value={paymentId} />
      <button
        type="submit"
        disabled={pending}
        className="text-xs font-medium text-moss hover:underline disabled:opacity-50"
      >
        {pending ? "Generating…" : "Get payment link"}
      </button>
    </form>
  );
}
