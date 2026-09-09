import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { getUserOrders, getTestsForStudent, getStudentCompletedTestIds } from "@/lib/data/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExportTestButton } from "@/components/student/export-test-button";
import { Timer, ArrowRight, BookOpenCheck, CheckCircle2 } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface PageProps {
  searchParams: Promise<{ seriesId?: string }>;
}

export default async function StudentTestsPage({ searchParams }: PageProps) {
  const session = await requireAuth();
  const { seriesId } = await searchParams;

  const [orders, availableTests, completedTestIds] = await Promise.all([
    getUserOrders(session.id),
    getTestsForStudent({ seriesId }),
    getStudentCompletedTestIds(session.id),
  ]);

  const paidOrders = orders.filter((o) => o.status === "PAID");
  const paidSeriesSet = new Set(paidOrders.map((o) => o.testSeriesId));
  const completedTestSet = new Set(completedTestIds);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Available Mock Tests</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Select any full-length CBT test to begin under exam conditions with live countdown timers and auto-save.
        </p>
      </div>

      <div className="space-y-4">
        {availableTests.map((test, idx) => {
          const isSubscribed = ((test as any).testSeries?.price === 0) || paidSeriesSet.has(test.testSeriesId);
          const hasAttempted = completedTestSet.has(test.id);

          return (
            <div
              key={test.id}
              className="p-5 rounded-xl border border-border bg-card hover:border-foreground/25 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center font-mono font-bold text-sm shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      CBT Exam
                    </Badge>
                    <h2 className="text-base font-bold text-foreground">
                      {test.title}
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 max-w-2xl">
                    {test.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <Timer className="h-3 w-3" />
                      {formatDuration(test.durationMinutes)}
                    </span>
                    <span>•</span>
                    <span className="font-mono">
                      {test.totalMarks} Marks
                    </span>
                    <span>•</span>
                    <span>
                      +{test.marksPerQuestion} / -{test.negativeMarkingRate} Marking
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <ExportTestButton
                  testId={test.id}
                  isSubscribed={isSubscribed}
                  hasAttempted={hasAttempted}
                />
                <Link href={`/student/tests/${test.id}/instructions`}>
                  <Button size="sm" className="h-9 px-4 text-xs font-semibold gap-1.5 shadow-sm">
                    <BookOpenCheck className="h-3.5 w-3.5" />
                    Instructions & Start
                  </Button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
