"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Layers,
  FileCheck2,
  HelpCircle,
  UploadCloud,
  Users,
  CreditCard,
  Settings,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const ADMIN_NAV_LINKS = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/test-series", label: "Test Series", icon: Layers },
  { href: "/admin/tests", label: "Tests Management", icon: FileCheck2 },
  { href: "/admin/questions", label: "Question Bank", icon: HelpCircle },
  { href: "/admin/questions/import", label: "Bulk CSV Import", icon: UploadCloud },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/orders", label: "Orders & Revenue", icon: CreditCard },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/student/dashboard", label: "Student View", icon: GraduationCap, isPortalSwitch: true },
];

export function AdminNav() {
  const pathname = usePathname();
  const links = ADMIN_NAV_LINKS;

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
              link.isPortalSwitch && "border border-border/70 mt-3 text-foreground"
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
