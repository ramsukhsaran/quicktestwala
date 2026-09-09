import { requireAuth } from "@/lib/auth/session";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { StudentNav } from "@/components/student/student-nav";
import { StudentUserMenu } from "@/components/student/student-user-menu";

export default async function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card shrink-0 select-none">
        <div className="flex h-14 items-center px-6 border-b border-border">
          <Logo showBadge href="/student/dashboard" />
        </div>

        <div className="flex-1 py-4 px-3 overflow-y-auto">
          <StudentNav />
        </div>

        <div className="p-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center text-xs shrink-0">
              {session.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="truncate">
              <p className="text-xs font-semibold truncate">{session.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{session.email}</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar for mobile / header */}
        <header className="flex h-14 items-center justify-between border-b border-border px-4 sm:px-6 bg-background/90 backdrop-blur-md">
          <div className="flex items-center gap-3 md:hidden">
            <Logo showBadge href="/student/dashboard" />
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <span>Terminal: Student Portal</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              Ready for Examination
            </span>
          </div>

          <div className="flex items-center gap-3">
            <StudentUserMenu user={session} />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-muted/10">
          {children}
        </main>
      </div>
    </div>
  );
}
