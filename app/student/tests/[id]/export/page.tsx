import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { verifyStudentTestExportAccess } from "@/lib/data/store";
import { TestPdfDocument } from "@/components/student/test-pdf-document";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  ArrowLeft,
  BookOpenCheck,
  ShoppingCart,
  ShieldAlert,
  FileSpreadsheet,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function StudentTestExportPage({ params }: PageProps) {
  const session = await requireAuth();
  const { id } = await params;

  const access = await verifyStudentTestExportAccess(session.id, id);

  if (!access.allowed) {
    if (access.reason === "TEST_NOT_FOUND") {
      notFound();
    }

    const isNotSubscribed = access.reason === "NOT_SUBSCRIBED";
    const test = access.test;

    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-border p-6 text-center space-y-6 shadow-lg">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-600">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <Badge variant="outline" className="text-[10px] font-mono border-rose-500/30 text-rose-600 uppercase">
              Access Restricted
            </Badge>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              {isNotSubscribed ? "Subscription Required" : "Test Attempt Required"}
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isNotSubscribed
                ? "PDF Question Paper and Solutions export is exclusively available to subscribed students of this Test Series."
                : "To ensure academic integrity, candidates must attempt and submit this mock test at least once before unlocking the downloadable PDF question paper & solution key."}
            </p>
          </div>

          {test && (
            <div className="p-3.5 rounded-lg bg-muted/40 border border-border text-left space-y-1">
              <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                Target Mock Test
              </span>
              <p className="text-xs font-bold text-foreground line-clamp-1">{test.title}</p>
              <p className="text-[11px] text-muted-foreground">
                {test.testSeries?.title} • {test.durationMinutes} Mins • {test.totalMarks} Marks
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2">
            <Link href="/student/tests" className="w-full sm:w-auto">
              <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Tests
              </Button>
            </Link>

            {isNotSubscribed ? (
              <Link
                href={`/test-series/${test?.testSeries?.slug || ""}`}
                className="w-full sm:w-auto"
              >
                <Button size="sm" className="w-full text-xs font-semibold gap-1.5 shadow-sm">
                  <ShoppingCart className="h-3.5 w-3.5" />
                  View & Subscribe Series
                </Button>
              </Link>
            ) : (
              <Link
                href={`/student/tests/${id}/instructions`}
                className="w-full sm:w-auto"
              >
                <Button size="sm" className="w-full text-xs font-semibold gap-1.5 shadow-sm">
                  <BookOpenCheck className="h-3.5 w-3.5" />
                  Attempt Test Now
                </Button>
              </Link>
            )}
          </div>
        </Card>
      </div>
    );
  }

  return <TestPdfDocument test={access.test} attempt={access.attempt} />;
}
