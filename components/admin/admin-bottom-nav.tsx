"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  FileCheck2,
  HelpCircle,
  MoreHorizontal,
  Users,
  CreditCard,
  Settings,
  UploadCloud,
  GraduationCap,
  Plus,
  LogOut,
  X,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function AdminBottomNav() {
  const [isMoreOpen, setIsMoreOpen] = React.useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Close sheet on route change
  React.useEffect(() => {
    setIsMoreOpen(false);
  }, [pathname]);

  // Handle escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMoreOpen) {
        setIsMoreOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMoreOpen]);

  // Lock body scroll when more sheet is open
  React.useEffect(() => {
    if (isMoreOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMoreOpen]);

  const handleLogout = async () => {
    setIsMoreOpen(false);
    await logoutAction();
    router.push("/");
    router.refresh();
  };

  const navItems = [
    {
      href: "/admin/dashboard",
      label: "Overview",
      icon: LayoutDashboard,
      isActive: pathname === "/admin/dashboard",
    },
    {
      href: "/admin/test-series",
      label: "Series",
      icon: Layers,
      isActive: pathname.startsWith("/admin/test-series"),
    },
    {
      href: "/admin/tests",
      label: "Tests",
      icon: FileCheck2,
      isActive: pathname.startsWith("/admin/tests"),
    },
    {
      href: "/admin/questions",
      label: "Questions",
      icon: HelpCircle,
      isActive: pathname === "/admin/questions",
    },
  ];

  const moreShortcuts = [
    {
      href: "/admin/students",
      label: "Students Management",
      description: "Aspirant roster & account access",
      icon: Users,
      color: "text-blue-500 bg-blue-500/10",
      isActive: pathname === "/admin/students",
    },
    {
      href: "/admin/orders",
      label: "Orders & Revenue",
      description: "Sales transactions & subscriptions",
      icon: CreditCard,
      color: "text-emerald-500 bg-emerald-500/10",
      isActive: pathname === "/admin/orders",
    },
    {
      href: "/admin/questions/import",
      label: "Bulk CSV Import",
      description: "Import question sets via RFC 4180 CSV",
      icon: UploadCloud,
      color: "text-amber-500 bg-amber-500/10",
      isActive: pathname === "/admin/questions/import",
    },
    {
      href: "/admin/tests/create",
      label: "Create Mock Test",
      description: "New CBT mock test with marking formula",
      icon: Plus,
      color: "text-rose-500 bg-rose-500/10",
      isActive: pathname === "/admin/tests/create",
    },
    {
      href: "/admin/test-series/create",
      label: "Create Test Series",
      description: "New package with pricing & syllabus",
      icon: Plus,
      color: "text-indigo-500 bg-indigo-500/10",
      isActive: pathname === "/admin/test-series/create",
    },
    {
      href: "/admin/settings",
      label: "Platform Settings",
      description: "System parameters & environment",
      icon: Settings,
      color: "text-slate-500 bg-slate-500/10",
      isActive: pathname === "/admin/settings",
    },
    {
      href: "/student/dashboard",
      label: "Switch to Student View",
      description: "Inspect student candidate portal",
      icon: GraduationCap,
      color: "text-teal-500 bg-teal-500/10",
      isActive: false,
    },
  ];

  const isAnyMoreActive = moreShortcuts.some((item) => item.isActive);

  return (
    <>
      {/* Bottom Sheet Backdrop */}
      {isMoreOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in-0"
          onClick={() => setIsMoreOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-Up Bottom Sheet for Additional Admin Sections */}
      {isMoreOpen && (
        <div className="md:hidden fixed bottom-14 left-0 right-0 z-50 bg-card border-t border-border rounded-t-2xl shadow-2xl p-4 max-w-lg mx-auto duration-200 animate-in slide-in-from-bottom max-h-[80vh] flex flex-col">
          {/* Top Drag Handle Indicator */}
          <div className="h-1 w-10 bg-muted-foreground/30 rounded-full mx-auto mb-3 shrink-0" />

          {/* Sheet Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border shrink-0">
            <div>
              <h3 className="text-sm font-bold text-foreground">Admin Menu & Tools</h3>
              <p className="text-[11px] text-muted-foreground">Quick access to management sections</p>
            </div>
            <button
              type="button"
              onClick={() => setIsMoreOpen(false)}
              className="h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Shortcuts Scrollable List */}
          <div className="py-2.5 space-y-1 overflow-y-auto flex-1">
            {moreShortcuts.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMoreOpen(false)}
                  className={cn(
                    "flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors",
                    item.isActive
                      ? "bg-foreground text-background font-semibold"
                      : "hover:bg-muted/60 text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                        item.isActive ? "bg-background/20 text-background" : item.color
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold">{item.label}</p>
                      <p
                        className={cn(
                          "text-[10px]",
                          item.isActive ? "text-background/80" : "text-muted-foreground"
                        )}
                      >
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 opacity-40 shrink-0" />
                </Link>
              );
            })}
          </div>

          {/* Bottom Sheet Actions (Theme & Logout) */}
          <div className="pt-2.5 mt-1 border-t border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <span className="text-xs text-muted-foreground">Theme Mode</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5 font-medium"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </Button>
          </div>
        </div>
      )}

      {/* Fixed Bottom Navigation Bar for Admin */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-lg border-t border-border shadow-lg print:hidden pb-[max(0.25rem,env(safe-area-inset-bottom))]">
        <nav className="flex items-center justify-around h-14 px-1 max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors relative",
                  item.isActive
                    ? "text-primary font-bold"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 transition-transform",
                    item.isActive ? "scale-110 stroke-[2.5]" : "stroke-[1.75]"
                  )}
                />
                <span className="mt-1 truncate max-w-[64px]">{item.label}</span>
                {item.isActive && (
                  <span className="absolute top-1 h-1 w-6 rounded-full bg-primary" />
                )}
              </Link>
            );
          })}

          {/* 5th Tab: More Admin Options Toggle */}
          <button
            type="button"
            onClick={() => setIsMoreOpen((prev) => !prev)}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors relative",
              isMoreOpen || isAnyMoreActive
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Toggle more admin tools menu"
          >
            <MoreHorizontal
              className={cn(
                "h-4 w-4 transition-transform",
                isMoreOpen || isAnyMoreActive ? "scale-110 stroke-[2.5]" : "stroke-[1.75]"
              )}
            />
            <span className="mt-1">More</span>
            {(isMoreOpen || isAnyMoreActive) && (
              <span className="absolute top-1 h-1 w-6 rounded-full bg-primary" />
            )}
          </button>
        </nav>
      </div>
    </>
  );
}
