"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/actions/auth";
import { LogOut, User, Shield } from "lucide-react";
import Link from "next/link";

export function StudentUserMenu({
  user,
}: {
  user: { name: string; email: string; role: string };
}) {
  const router = useRouter();

  const handleLogout = async () => {
    await logoutAction();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="flex items-center gap-3">
      {user.role === "ADMIN" && (
        <Link href="/admin/dashboard">
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 border-border">
            <Shield className="h-3.5 w-3.5 text-amber-500" />
            Switch to Admin
          </Button>
        </Link>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1.5"
      >
        <LogOut className="h-3.5 w-3.5" />
        Sign Out
      </Button>
    </div>
  );
}
