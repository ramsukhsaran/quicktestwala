import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Database, KeyRound, Cpu, CheckCircle2, AlertTriangle } from "lucide-react";

export default function AdminSettingsPage() {
  const isRazorpayConfigured = Boolean(
    process.env.RAZORPAY_KEY_ID &&
      process.env.RAZORPAY_KEY_SECRET &&
      !process.env.RAZORPAY_KEY_ID.includes("placeholder")
  );

  const isDbLive = Boolean(
    process.env.DATABASE_URL &&
      !process.env.DATABASE_URL.includes("npg_placeholder")
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">System & Environment Settings</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Infrastructure health, payment provider configurations, and database connectivity.
        </p>
      </div>

      <div className="space-y-4">
        {/* Database Status */}
        <Card className="border-border">
          <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <Database className="h-5 w-5 text-foreground shrink-0" />
                <CardTitle className="text-base font-bold">Database Engine</CardTitle>
              </div>
              {isDbLive ? (
                <Badge variant="success" className="text-xs gap-1 font-mono w-fit">
                  <CheckCircle2 className="h-3 w-3" /> Neon Live PG Connected
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs gap-1 font-mono border-amber-500/30 text-amber-600 dark:text-amber-400 w-fit">
                  <AlertTriangle className="h-3 w-3" /> Local / Sandbox Fallback Active
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs mt-1 leading-relaxed">
              {isDbLive
                ? "Connected directly to Neon PostgreSQL with connection pooling and Prisma ORM."
                : "Active in self-contained sandbox mode with instant mock and demo resilience. Set DATABASE_URL in .env to connect live Neon cluster."}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Payment Gateway Status */}
        <Card className="border-border">
          <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <KeyRound className="h-5 w-5 text-foreground shrink-0" />
                <CardTitle className="text-base font-bold">Payment Gateway (Razorpay)</CardTitle>
              </div>
              {isRazorpayConfigured ? (
                <Badge variant="success" className="text-xs gap-1 font-mono w-fit">
                  <CheckCircle2 className="h-3 w-3" /> Razorpay Production Keys Set
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs gap-1 font-mono border-sky-500/30 text-sky-600 dark:text-sky-400 w-fit">
                  Sandbox Mock Provider Active (1-Click Test Checkout)
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs mt-1 leading-relaxed">
              Supports UPI, NetBanking, Credit/Debit Cards, and Wallets via Razorpay Indian payments gateway.
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Security & Sessions */}
        <Card className="border-border">
          <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="h-5 w-5 text-foreground shrink-0" />
                <CardTitle className="text-base font-bold">Authentication & Security</CardTitle>
              </div>
              <Badge variant="success" className="text-xs font-mono w-fit">
                Active & Enforced
              </Badge>
            </div>
            <CardDescription className="text-xs mt-1 leading-relaxed">
              JWT session cookies signed with Jose HS256 algorithm. Bcrypt password hashing (salt rounds: 10). Next.js edge middleware protecting /admin/* and /student/* routes.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
