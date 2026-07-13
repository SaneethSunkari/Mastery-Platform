"use client";

import { useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { createAutomaticBackup, initializeDatabase } from "@/lib/db";

export function AppProviders({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initializeDatabase().then(() => {
      const lastBackupKey = "mastery-last-auto-backup";
      const currentDay = new Date().toISOString().slice(0, 10);
      if (window.localStorage.getItem(lastBackupKey) !== currentDay) {
        createAutomaticBackup("daily-auto").then(() => {
          window.localStorage.setItem(lastBackupKey, currentDay);
        });
      }
    });
  }, []);

  return (
    <ThemeProvider>
      <TooltipProvider>{children}</TooltipProvider>
    </ThemeProvider>
  );
}
