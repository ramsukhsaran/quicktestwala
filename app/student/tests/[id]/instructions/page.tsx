import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { getTestById, hasStudentAccessToTest } from "@/lib/data/store";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { InstructionsClient } from "@/components/test/instructions-client";
import { Timer, AlertTriangle, ShieldCheck, HelpCircle } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TestInstructionsPage({ params }: PageProps) {
  const { id } = await params;
  const session = await requireAuth();
  const test = await getTestById(id);

  if (!test) {
    notFound();
  }

  const hasAccess = await hasStudentAccessToTest(session.id, test.id);
  if (!hasAccess) {
    const slug = (test as any).testSeries?.slug;
    redirect(slug ? `/test-series/${slug}?locked=true` : `/test-series?locked=true`);
  }

  const questionCount = test.testQuestions?.length || 8;
  const markingSummary = `Each correct answer carries +${test.marksPerQuestion} marks. Every incorrect answer carries a penalty of -${test.negativeMarkingRate} mark.`;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <Badge variant="outline" className="uppercase tracking-widest text-[10px] font-mono">
          Examination Instructions
        </Badge>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {test.title}
        </h1>
        <p className="text-xs text-muted-foreground">
          Please read the following instructions carefully before initiating the examination terminal.
        </p>
      </div>

      {/* Summary Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl border border-border bg-card">
        <div>
          <span className="text-xs text-muted-foreground block">Duration</span>
          <span className="text-base font-bold font-mono text-foreground">
            {formatDuration(test.durationMinutes)}
          </span>
        </div>
        <div>
          <span className="text-xs text-muted-foreground block">Total Questions</span>
          <span className="text-base font-bold font-mono text-foreground">
            {questionCount}
          </span>
        </div>
        <div>
          <span className="text-xs text-muted-foreground block">Total Marks</span>
          <span className="text-base font-bold font-mono text-foreground">
            {test.totalMarks}
          </span>
        </div>
        <div>
          <span className="text-xs text-muted-foreground block">Negative Marking</span>
          <span className="text-base font-bold font-mono text-rose-600 dark:text-rose-400">
            -{test.negativeMarkingRate}
          </span>
        </div>
      </div>

      <Card className="border-border bg-muted/10">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-sm font-bold">Marking Scheme</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed">
          <p>{markingSummary}</p>
        </CardContent>
      </Card>

      {/* Instructions Body */}
      <Card className="border-border">
        <CardHeader className="p-6 pb-3">
          <CardTitle className="text-base font-bold">General Examination Rules</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0 space-y-6 text-xs text-muted-foreground leading-relaxed">
          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">1. Timer and Auto-Submission</h4>
            <p>
              The clock in the top-right corner of the terminal shows the remaining examination time. When the timer hits 00:00, the test will automatically submit. You cannot extend or pause the clock.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">2. Question Palette Legend</h4>
            <p>
              The Question Palette displayed on the right of the screen will show the status of each question using the following official color symbols:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
              <div className="flex items-center gap-3 p-2 rounded-md border bg-muted/20">
                <div className="h-6 w-6 rounded flex items-center justify-center font-mono font-bold text-xs bg-background border text-muted-foreground">
                  1
                </div>
                <span>You have not visited the question yet.</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-md border bg-muted/20">
                <div className="h-6 w-6 rounded flex items-center justify-center font-mono font-bold text-xs bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-400">
                  2
                </div>
                <span>You have not answered the question.</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-md border bg-muted/20">
                <div className="h-6 w-6 rounded flex items-center justify-center font-mono font-bold text-xs bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300">
                  3
                </div>
                <span>You have answered the question.</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-md border bg-muted/20">
                <div className="h-6 w-6 rounded flex items-center justify-center font-mono font-bold text-xs bg-purple-500/15 border-purple-500 text-purple-700 dark:text-purple-300">
                  4
                </div>
                <span>Marked for Review without answer.</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">3. Navigating Questions</h4>
            <p>
              Click on the question number in the palette to navigate directly to it. To save your answer, click <strong>&quot;Save & Next&quot;</strong>. To change or erase your selection, click <strong>&quot;Clear Response&quot;</strong>.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-semibold text-foreground">4. Real-Time Auto-Save</h4>
            <p>
              Your responses are automatically synced to our database as you select them. If your tab reloads or your connection drops, simply re-open the page to continue.
            </p>
          </div>

          <InstructionsClient testId={test.id} />
        </CardContent>
      </Card>
    </div>
  );
}
