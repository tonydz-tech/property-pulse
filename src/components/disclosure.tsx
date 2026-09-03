"use client";

import { useState, type ReactNode } from "react";

export function Disclosure({
  label,
  openLabel,
  children,
}: {
  label: string;
  openLabel?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-8">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-sm font-medium text-moss hover:underline"
      >
        {open ? (openLabel ?? "Cancel") : label}
      </button>
      {open && (
        <div className="mt-4 border border-hairline bg-white/40 p-5">
          {children}
        </div>
      )}
    </div>
  );
}
