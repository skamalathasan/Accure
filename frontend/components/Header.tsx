"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/transactions", label: "Transactions" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
          <span className="flex h-7 w-7 flex-col justify-center gap-1 rounded-md bg-slate-900 px-1.5" aria-hidden="true">
            <span className="h-0.5 rounded bg-white" />
            <span className="h-0.5 w-2/3 rounded bg-white/70" />
            <span className="h-0.5 rounded bg-white" />
          </span>
          Accure
        </Link>
        <nav aria-label="Main" className="flex gap-1">
          {NAV_ITEMS.map(({ href, label }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
