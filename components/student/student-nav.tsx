"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  BookOpenCheck,
  BarChart3,
  Bookmark,
  Receipt,
  User,
  ShoppingBag,
} from "lucide-react";
import { cn } from "@/lib/utils";

export function StudentNav() {
  const pathname = usePathname();

  const links = [
    { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/student/test-series", label: "My Test Series", icon: Layers },
    { href: "/student/tests", label: "Mock Tests", icon: BookOpenCheck },
    { href: "/student/results", label: "Past Results", icon: BarChart3 },
    { href: "/student/bookmarks", label: "Bookmarked Questions", icon: Bookmark },
    { href: "/student/orders", label: "Order Receipts", icon: Receipt },
    { href: "/student/profile", label: "Profile & Target", icon: User },
    { href: "/test-series", label: "Marketplace", icon: ShoppingBag, isMarketplace: true },
  ];

  return (
    <nav className="space-y-1">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors",
              isActive
                ? "bg-foreground text-background font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
              link.isMarketplace && "border border-border/70 mt-3 text-foreground"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
