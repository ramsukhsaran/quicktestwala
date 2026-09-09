import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-12 md:py-16 text-sm text-muted-foreground transition-all">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 space-y-3">
            <Logo showBadge />
            <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
              India&apos;s developer-grade online examination testing portal.
              Built for serious aspirants targeting SSC, Banking, Railways,
              UPSC, and State competitive exams.
            </p>
            <div className="text-xs text-muted-foreground pt-2">
              <span className="font-mono">Engine Version: 2.4.0 (CBT High-Yield)</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
              Exam Verticals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/test-series?category=ssc" className="hover:text-foreground">
                  SSC CGL / CHSL / CPO
                </Link>
              </li>
              <li>
                <Link href="/test-series?category=banking" className="hover:text-foreground">
                  IBPS PO / SBI Clerk
                </Link>
              </li>
              <li>
                <Link href="/test-series?category=railway" className="hover:text-foreground">
                  RRB NTPC & Group D
                </Link>
              </li>
              <li>
                <Link href="/test-series?category=upsc" className="hover:text-foreground">
                  UPSC Civil Services
                </Link>
              </li>
              <li>
                <Link href="/test-series?category=defence" className="hover:text-foreground">
                  CDS / AFCAT / NDA
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/test-series" className="hover:text-foreground">
                  All Test Series
                </Link>
              </li>
              <li>
                <Link href="/exams" className="hover:text-foreground">
                  Exam Syllabus & Pattern
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-foreground">
                  Pass & Membership
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-foreground">
                  CBT Engine Architecture
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground mb-3">
              Security & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="cursor-pointer hover:text-foreground">Privacy Policy</span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-foreground">Terms of Service</span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-foreground">Refund Policy</span>
              </li>
              <li>
                <span className="cursor-pointer hover:text-foreground">Anti-Cheating Policy</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} ExamForge Technologies Ltd. All rights reserved.</p>
          <p className="flex items-center gap-2">
            <span>Powered by Next.js 16</span>
            <span>•</span>
            <span>Neon Serverless</span>
            <span>•</span>
            <span>CBT Real-Time Engine</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
