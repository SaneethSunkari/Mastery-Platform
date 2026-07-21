"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BrainCircuit,
  BookOpenText,
  Cpu,
  Gem,
  House,
  Settings2,
  TerminalSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: House },
  { href: "/materials/sql", label: "Materials", icon: BookOpenText },
  { href: "/arcade", label: "Candy Arcade", icon: Gem },
  { href: "/sql", label: "SQL Mastery", icon: TerminalSquare },
  { href: "/python", label: "Python Mastery", icon: BrainCircuit },
  { href: "/pyspark", label: "PySpark Mastery", icon: Cpu },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-full flex-col gap-6 rounded-[28px] border border-border/60 bg-card/85 p-5 shadow-[0_20px_80px_-40px_rgba(15,23,42,0.35)] backdrop-blur">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">
          Mastery Stack
        </p>
        <div className="space-y-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            SQL + Python + PySpark
          </h1>
          <p className="max-w-xs text-sm leading-6 text-muted-foreground">
            Practice-first learning for data engineering mastery.
          </p>
        </div>
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl border border-border/70 bg-muted/35 p-4 text-sm leading-6 text-muted-foreground">
        Focus area: learn simply, write code every day, unlock the next step, and build data-engineering depth.
      </div>
    </aside>
  );
}
