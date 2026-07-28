"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Braces, Database, Flame, LayoutGrid, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/sql", label: "SQL", icon: Database },
  { href: "/python", label: "Python", icon: Braces },
  { href: "/pyspark", label: "PySpark", icon: Sparkles },
  { href: "/arcade", label: "Arcade", icon: Flame },
];

export function AppNavigation() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 shrink-0 border-b border-slate-200/80 bg-[#f8fafc]/92 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-5 px-4 sm:px-6">
        <Link href="/dashboard" className="mr-auto flex items-center gap-2 text-sm font-semibold tracking-tight text-slate-950" aria-label="Mastery home">
          <span className="grid size-8 place-items-center rounded-xl bg-slate-950 font-mono text-xs text-white">M</span>
          <span className="hidden sm:inline">Mastery</span>
        </Link>
        <nav className="flex min-w-0 items-center gap-1 overflow-x-auto" aria-label="Primary navigation">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn("flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-slate-950", active && "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200")}>
                <Icon className="size-4" aria-hidden="true" />
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
