import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { getStudentDashboardStats } from "@/lib/data/store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, ArrowRight, BookOpenCheck } from "lucide-react";
import { formatSecondsToTime } from "@/lib/utils";

export default async function StudentResultsHistoryPage() {
  const session = await requireAuth();
  const stats = await getStudentDashboardStats(session.id);
  const attempts = stats.recentTests;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Past Examination Results</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Historical record of all completed computer-based tests, scores, and percentile performance.
        </p>
      </div>

      <Card className="border-border">
        <CardContent className="p-0 overflow-x-auto">
          {attempts.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              No examination attempts completed yet.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground uppercase font-semibold">
                  <th className="py-3.5 px-6">Test Title</th>
                  <th className="py-3.5 px-4">Exam Series</th>
                  <th className="py-3.5 px-4">Score</th>
                  <th className="py-3.5 px-4">Percentage</th>
                  <th className="py-3.5 px-4">Accuracy</th>
                  <th className="py-3.5 px-4">Time Taken</th>
                  <th className="py-3.5 px-6 text-right">Solutions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {attempts.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-4 px-6 font-semibold text-foreground">
                      {attempt.test?.title || "Mock Test"}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground">
                      {attempt.test?.testSeries?.examName || "CBT"}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-foreground">
                      {attempt.score} / {attempt.totalMarks}
                    </td>
                    <td className="py-4 px-4 font-mono text-foreground font-semibold">
                      {attempt.percentage}%
                    </td>
                    <td className="py-4 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                      {attempt.accuracy}%
                    </td>
                    <td className="py-4 px-4 font-mono text-muted-foreground">
                      {formatSecondsToTime(attempt.timeTakenSeconds)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link href={`/student/tests/${attempt.testId}/result?attemptId=${attempt.id}`}>
                        <Button size="sm" variant="outline" className="h-8 text-xs font-semibold gap-1">
                          View Solution
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
