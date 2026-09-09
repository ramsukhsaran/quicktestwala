"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  BookOpenCheck,
  BarChart3,
  MoreHorizontal,
  Bookmark,
  Receipt,
  User,
  ShoppingBag,
  LogOut,
  X,
  ChevronRight,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function StudentBottomNav() {
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
      href: "/student/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      isActive: pathname === "/student/dashboard",
    },
    {
      href: "/student/test-series",
      label: "My Series",
      icon: Layers,
      isActive: pathname === "/student/test-series",
    },
    {
      href: "/student/tests",
      label: "Mock Tests",
      icon: BookOpenCheck,
      isActive: pathname.startsWith("/student/tests") && !pathname.includes("/export"),
    },
    {
      href: "/student/results",
      label: "Results",
      icon: BarChart3,
      isActive: pathname === "/student/results",
    },
  ];

  const moreShortcuts = [
    {
      href: "/student/bookmarks",
      label: "Bookmarked Questions",
      description: "Review flagged and saved questions",
      icon: Bookmark,
      color: "text-amber-500 bg-amber-500/10",
      isActive: pathname === "/student/bookmarks",
    },
    {
      href: "/student/orders",
      label: "Order Receipts",
      description: "Invoices and subscription passes",
      icon: Receipt,
      color: "text-blue-500 bg-blue-500/10",
      isActive: pathname === "/student/orders",
    },
    {
      href: "/student/profile",
      label: "Profile & Target Exam",
      description: "Target exam, state & password",
      icon: User,
      color: "text-emerald-500 bg-emerald-500/10",
      isActive: pathname === "/student/profile",
    },
    {
      href: "/test-series",
      label: "Explore Marketplace",
      description: "Discover new test packages",
      icon: ShoppingBag,
      color: "text-purple-500 bg-purple-500/10",
      isActive: pathname === "/test-series",
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

      {/* Slide-Up Bottom Sheet for Additional Shortcuts */}
      {isMoreOpen && (
        <div className="md:hidden fixed bottom-14 left-0 right-0 z-50 bg-card border-t border-border rounded-t-2xl shadow-2xl p-4 max-w-lg mx-auto duration-200 animate-in slide-in-from-bottom">
          {/* Top Drag Handle Indicator */}
          <div className="h-1 w-10 bg-muted-foreground/30 rounded-full mx-auto mb-3" />

          {/* Sheet Header */}
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <div>
              <h3 className="text-sm font-bold text-foreground">Menu & Shortcuts</h3>
              <p className="text-[11px] text-muted-foreground">Quick access to student services</p>
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

          {/* Shortcuts List */}
          <div className="py-2.5 space-y-1">
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
          <div className="pt-2.5 mt-1 border-t border-border flex items-center justify-between">
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

      {/* Fixed Bottom Navigation Bar */}
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

          {/* 5th Tab: More (Bottom-Anchored Sheet Toggle) */}
          <button
            type="button"
            onClick={() => setIsMoreOpen((prev) => !prev)}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full py-1 text-[10px] font-medium transition-colors relative",
              isMoreOpen || isAnyMoreActive
                ? "text-primary font-bold"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-label="Toggle more shortcuts menu"
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
