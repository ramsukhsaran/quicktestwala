import { requireAdmin } from "@/lib/auth/session";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { AdminNav } from "@/components/admin/admin-nav";
import { AdminUserMenu } from "@/components/admin/admin-user-menu";
import { Badge } from "@/components/ui/badge";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card shrink-0 select-none">
        <div className="flex h-14 items-center justify-between px-6 border-b border-border">
          <Logo href="/admin/dashboard" />
          <Badge variant="outline" className="text-[9px] font-mono uppercase bg-muted/60">
            Admin
          </Badge>
        </div>

        <div className="flex-1 py-4 px-3 overflow-y-auto">
          <AdminNav />
        </div>

        <div className="p-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-foreground text-background font-semibold flex items-center justify-center text-xs shrink-0">
              AD
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
            <Logo href="/admin/dashboard" />
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <span>Terminal: Master Administration</span>
            <span>•</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
              Live Control Active
            </span>
          </div>

          <div className="flex items-center gap-3">
            <AdminUserMenu user={session} />
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
