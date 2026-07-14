"use client";

import { ChangeEvent, useState } from "react";
import { Download, HardDriveDownload, RotateCcw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  createAutomaticBackup,
  exportBackup,
  importBackup,
  resetAllProgress,
  resetCandyArcadeProgress,
  resetCourseProgress,
} from "@/lib/db";
import { AppBackupPayload } from "@/lib/types";

export function SettingsView() {
  const [message, setMessage] = useState<string | null>(null);

  async function handleExport() {
    const payload = await exportBackup();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `mastery-backup-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage("Backup exported successfully.");
  }

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const payload = JSON.parse(text) as AppBackupPayload;
    await importBackup(payload);
    setMessage("Backup imported successfully. Refreshing the local workspace...");
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-muted-foreground">
          IndexedDB stores progress, notes, revision data, and activity locally. Theme preference uses localStorage only.
        </p>
      </div>

      {message ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800 dark:text-emerald-200">
          {message}
        </div>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl">Backup and restore</CardTitle>
            <CardDescription>Export progress as JSON, import backups, or create a manual local snapshot.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <Button onClick={handleExport}>
              <Download className="mr-2 size-4" />
              Export JSON
            </Button>
            <Button variant="outline" onClick={() => createAutomaticBackup("manual")}>
              <HardDriveDownload className="mr-2 size-4" />
              Manual backup
            </Button>
            <label className="inline-flex cursor-pointer items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground">
              <Upload className="mr-2 size-4" />
              Import JSON
              <input type="file" accept="application/json" className="hidden" onChange={handleImport} />
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-heading text-xl">Reset controls</CardTitle>
            <CardDescription>Reset one path or the entire platform without affecting the local codebase.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button variant="outline" onClick={() => resetCourseProgress("sql")}>
              <RotateCcw className="mr-2 size-4" />
              Reset SQL progress
            </Button>
            <Button variant="outline" onClick={() => resetCourseProgress("python")}>
              <RotateCcw className="mr-2 size-4" />
              Reset Python progress
            </Button>
            <Button variant="outline" onClick={() => resetCourseProgress("pyspark")}>
              <RotateCcw className="mr-2 size-4" />
              Reset PySpark progress
            </Button>
            <Button variant="outline" onClick={() => resetCandyArcadeProgress()}>
              <RotateCcw className="mr-2 size-4" />
              Reset Candy Arcade
            </Button>
            <Button variant="destructive" onClick={() => resetAllProgress()}>
              <RotateCcw className="mr-2 size-4" />
              Reset all progress
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
