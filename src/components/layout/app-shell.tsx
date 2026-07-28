import { AppNavigation } from "@/components/adaptive/app-navigation";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc] text-slate-950">
      <AppNavigation />
      <main className="app-main flex-1 px-4 py-8 sm:px-6 sm:py-12">{children}</main>
    </div>
  );
}
