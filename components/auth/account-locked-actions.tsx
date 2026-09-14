"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/actions/auth";
import { Mail, LogOut, ArrowLeft, Loader2, Phone, MessageSquare } from "lucide-react";

interface AccountLockedActionsProps {
  email?: string;
}

export function AccountLockedActions({ email }: AccountLockedActionsProps) {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = React.useState(false);

  const subject = encodeURIComponent(`Account Unlock Request - QuickTestWala (${email || "Student"})`);
  const body = encodeURIComponent(
    `Hello Administrator,\n\nMy QuickTestWala student account is currently locked. Please review my account status and unlock it so I can resume my test series preparation.\n\nRegistered Email: ${email || "[Your Email Here]"}\nDate: ${new Date().toLocaleDateString()}\n\nThank you.`
  );
  const mailtoUrl = `mailto:support@quicktestwala.com?subject=${subject}&body=${body}`;

  async function handleLogout() {
    try {
      setLoggingOut(true);
      await logoutAction();
      router.push("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  }

  return (
    <div className="space-y-4 pt-2">
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <a href={mailtoUrl} className="w-full sm:flex-1">
          <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold gap-2 h-10 shadow-sm">
            <Mail className="h-4 w-4" />
            Email Admin to Unlock
          </Button>
        </a>

        <a
          href="https://wa.me/919876543210?text=Hello%20Admin,%20my%20QuickTestWala%20account%20is%20locked.%20Please%20help%20me%20unlock%20it."
          target="_blank"
          rel="noreferrer"
          className="w-full sm:flex-1"
        >
          <Button variant="outline" className="w-full text-xs font-semibold gap-2 h-10 border-border">
            <MessageSquare className="h-4 w-4 text-emerald-600" />
            WhatsApp Helpdesk
          </Button>
        </a>
      </div>

      <div className="flex items-center justify-between gap-3 pt-4 border-t border-border">
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-xs gap-1.5 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Home
          </Button>
        </Link>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          disabled={loggingOut}
          className="text-xs gap-1.5 border-border"
        >
          {loggingOut ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
          Log Out
        </Button>
      </div>
    </div>
  );
}
