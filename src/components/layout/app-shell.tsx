import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(20,184,166,0.14),_transparent_28%),linear-gradient(180deg,_rgba(255,251,235,0.9),_rgba(255,255,255,1))] px-4 py-4 dark:bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.14),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(20,184,166,0.18),_transparent_25%),linear-gradient(180deg,_rgba(9,11,17,1),_rgba(12,16,24,1))] md:px-6 md:py-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1600px] gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
          <Sidebar />
        </div>
        <div className="flex min-h-full flex-col gap-4">
          <Topbar />
          <main className="flex-1 rounded-[32px] border border-border/60 bg-background/88 p-4 shadow-[0_30px_100px_-55px_rgba(15,23,42,0.45)] backdrop-blur md:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
