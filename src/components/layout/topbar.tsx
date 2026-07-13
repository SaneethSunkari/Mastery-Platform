"use client";

import { ThemeToggle } from "@/components/ui/theme-toggle";

export function Topbar() {
  return (
    <header className="flex flex-col gap-3 rounded-[28px] border border-border/60 bg-card/80 p-4 shadow-[0_20px_70px_-45px_rgba(15,23,42,0.35)] backdrop-blur md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">Focus</p>
        <h2 className="font-heading text-2xl font-semibold tracking-tight">
          Become strong in SQL, Python, and PySpark by doing the work
        </h2>
      </div>
      <div className="flex items-center gap-3 self-end md:self-auto">
        <ThemeToggle />
      </div>
    </header>
  );
}
