"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./logo";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/properties", label: "Properties" },
  { href: "/screening", label: "Tenant Screening" },
  { href: "/maintenance", label: "Maintenance" },
  { href: "/rent-ledger", label: "Rent Ledger" },
];

export function Sidebar({
  landlordName,
  logoutSlot,
}: {
  landlordName: string;
  logoutSlot: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col bg-ink text-paper">
      <div className="flex items-center gap-2 px-6 py-6">
        <Logo className="h-7 w-7 text-paper" />
        <span className="font-serif text-lg tracking-wide">
          Property Pulse
        </span>
      </div>

      <nav className="flex-1 px-3">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 border-l-2 px-3 py-2.5 text-sm transition ${
                isActive
                  ? "border-ochre bg-white/5 text-paper"
                  : "border-transparent text-paper/60 hover:border-white/20 hover:text-paper"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-6 py-4">
        <p className="truncate text-sm text-paper/80">{landlordName}</p>
        {logoutSlot}
      </div>
    </aside>
  );
}
