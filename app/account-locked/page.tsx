import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getUserById } from "@/lib/data/store";
import { Logo } from "@/components/brand/logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AccountLockedActions } from "@/components/auth/account-locked-actions";
import { Lock, ShieldAlert, AlertTriangle, Mail, Phone, Clock, UserX } from "lucide-react";

interface AccountLockedPageProps {
  searchParams: Promise<{ email?: string }>;
}

export default async function AccountLockedPage({ searchParams }: AccountLockedPageProps) {
  const resolvedParams = await searchParams;
  const session = await getSession();

  let userEmail = resolvedParams.email || session?.email || "";
  let userName = session?.name || "Student Aspirant";

  if (session?.id) {
    try {
      const user = await getUserById(session.id);
      if (user) {
        userEmail = user.email;
        userName = user.name;
      }
    } catch {
      // Fallback
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background flex flex-col justify-between py-12 px-4 sm:px-6">
      {/* Top Header */}
      <div className="max-w-xl mx-auto w-full flex items-center justify-center mb-6">
        <Logo href="/" />
      </div>

      {/* Main Locked Card */}
      <div className="max-w-xl mx-auto w-full">
        <Card className="border-rose-500/30 bg-card shadow-lg overflow-hidden relative">
          <div className="h-2 w-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500" />

          <CardHeader className="text-center pt-8 pb-4 space-y-3">
            {/* Lock Avatar */}
            <div className="relative mx-auto w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 shadow-inner">
              <Lock className="h-8 w-8" />
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-600" />
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2">
                <Badge variant="outline" className="text-rose-600 border-rose-500/40 bg-rose-500/5 text-[11px] font-bold font-mono uppercase tracking-wider">
                  Account Locked
                </Badge>
              </div>
              <CardTitle className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
                Your Account is Locked
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                Access to this account and all platform resources has been suspended by the administrator.
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 px-6 sm:px-8 pb-8">
            {/* Notice Callout */}
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-700 dark:text-rose-300">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                <span>Access Restriction Notice</span>
              </div>
              <p className="text-xs text-rose-900/80 dark:text-rose-200/80 leading-relaxed">
                You cannot access mock tests, test series, previous year papers, or submit exam attempts while your account is locked.
              </p>
              <div className="pt-1 text-xs font-semibold text-rose-700 dark:text-rose-300">
                👉 Please contact the administrator to unlock your account.
              </div>
            </div>

            {/* Account Details Box */}
            <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground uppercase text-[10px]">Aspirant Name</span>
                <span className="font-semibold text-foreground">{userName}</span>
              </div>
              {userEmail && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground uppercase text-[10px]">Registered Email</span>
                  <span className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-xs">{userEmail}</span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground uppercase text-[10px]">Account Status</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">BLOCKED BY ADMIN</span>
              </div>
            </div>

            {/* Contact Helpdesk Grid */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider block font-mono">
                Administrator Contact Details
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-border bg-card flex items-start gap-2.5">
                  <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase font-mono">Admin Support Email</span>
                    <a href="mailto:support@quicktestwala.com" className="font-semibold text-foreground hover:underline">
                      support@quicktestwala.com
                    </a>
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-border bg-card flex items-start gap-2.5">
                  <Phone className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[10px] text-muted-foreground block uppercase font-mono">Support Helpline</span>
                    <span className="font-semibold text-foreground">+91 98765 43210</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <AccountLockedActions email={userEmail} />
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-muted-foreground font-mono mt-8">
        © {new Date().getFullYear()} QuickTestWala. All rights reserved.
      </div>
    </div>
  );
}
