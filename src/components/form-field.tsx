import type { ReactNode } from "react";

export function FormField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
    </div>
  );
}

export const fieldInputClass =
  "mt-1 w-full border-b border-hairline bg-transparent py-1.5 text-sm text-ink outline-none focus:border-moss";
