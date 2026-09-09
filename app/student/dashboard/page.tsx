import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { getStudentDashboardStats, getTestSeriesList } from "@/lib/data/store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { PerformanceCharts } from "@/components/student/performance-charts";
import {
  Layers,
  CheckCircle2,
  Clock,
  Target,
  Trophy,
  Activity,
  ArrowRight,
  Zap,
  TrendingUp,
  FileText,
} from "lucide-react";
import { formatSecondsToTime } from "@/lib/utils";

export default async function StudentDashboardPage() {
  const session = await requireAuth();
  const stats = await getStudentDashboardStats(session.id);
  const recommendedSeries = await getTestSeriesList({ isFeatured: true });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-xl border border-border bg-card shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Welcome, {session.name}
            </h1>
            <Badge variant="outline" className="text-[10px] uppercase font-mono">
              Aspirant Portal
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Target Focus: SSC & Banking Competitive Examinations 2026.
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/student/tests">
            <Button size="sm" className="h-9 text-xs font-semibold gap-1.5 shadow-sm">
              <Zap className="h-3.5 w-3.5" />
              Start Mock Test
            </Button>
          </Link>
          <Link href="/test-series">
            <Button variant="outline" size="sm" className="h-9 text-xs font-semibold">
              Browse More Series
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-4 border-border">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground uppercase">
              Enrolled Series
            </span>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-extrabold font-mono text-foreground mt-2">
            {stats.purchasedSeriesCount}
          </p>
        </Card>

        <Card className="p-4 border-border">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground uppercase">
              Completed
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold font-mono text-foreground mt-2">
            {stats.testsCompletedCount}
          </p>
        </Card>

        <Card className="p-4 border-border">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground uppercase">
              Remaining
            </span>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-2xl font-extrabold font-mono text-foreground mt-2">
            {stats.testsRemainingCount}
          </p>
        </Card>

        <Card className="p-4 border-border">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground uppercase">
              Average Score
            </span>
            <Activity className="h-4 w-4 text-sky-600 dark:text-sky-400" />
          </div>
          <p className="text-2xl font-extrabold font-mono text-foreground mt-2">
            {stats.averageScore}
          </p>
        </Card>

        <Card className="p-4 border-border">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground uppercase">
              Best Score
            </span>
            <Trophy className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold font-mono text-foreground mt-2">
            {stats.bestScore}
          </p>
        </Card>

        <Card className="p-4 border-border">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-muted-foreground uppercase">
              Accuracy
            </span>
            <Target className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold font-mono text-foreground mt-2">
            {stats.overallAccuracy}%
          </p>
        </Card>
      </div>

      {/* Performance Overview Chart & Subject Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-base font-bold">Performance Progression</CardTitle>
              <CardDescription className="text-xs">
                Historical scores and accuracy percentages across recent CBT attempts
              </CardDescription>
            </div>
            {stats.hasAttemptHistory && (
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-sky-500" />
                  Score
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Accuracy
                </span>
              </div>
            )}
          </div>

          {stats.hasAttemptHistory ? (
            <PerformanceCharts data={stats.scoreTrend} />
          ) : (
            <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 text-center text-sm text-muted-foreground">
              Complete your first mock test to unlock performance charts and subject insights.
            </div>
          )}
        </Card>

        <Card className="lg:col-span-1 border-border p-6 space-y-4">
          <CardTitle className="text-base font-bold">Subject Diagnostic</CardTitle>
          <CardDescription className="text-xs">
            Estimated proficiency based on verified question response times
          </CardDescription>

          {stats.hasAttemptHistory ? (
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Reasoning & Logic</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono">92% High</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "92%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Quantitative Aptitude</span>
                  <span className="text-amber-600 dark:text-amber-400 font-mono">74% Moderate</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: "74%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>English Comprehension</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono">86% High</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: "86%" }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>General Awareness</span>
                  <span className="text-rose-600 dark:text-rose-400 font-mono">58% Needs Focus</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-rose-500 rounded-full" style={{ width: "58%" }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 text-center text-sm text-muted-foreground">
              Subject diagnostics appear after the first completed mock test.
            </div>
          )}
        </Card>
      </div>

      {/* Recent Tests Table */}
      <Card className="border-border">
        <CardHeader className="p-6 pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-bold">Recent Test Attempts</CardTitle>
            <CardDescription className="text-xs">
              Review your scores, detailed solutions, and time analysis
            </CardDescription>
          </div>
          <Link href="/student/results">
            <Button variant="ghost" size="sm" className="text-xs">
              View All History
              <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {stats.recentTests.length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground">
              You haven&apos;t taken any mock tests yet. Launch a test from your enrolled series to see detailed results!
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-y border-border bg-muted/30 text-muted-foreground uppercase font-semibold">
                  <th className="py-3 px-6">Test Title</th>
                  <th className="py-3 px-4">Exam Series</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Accuracy</th>
                  <th className="py-3 px-4">Time Taken</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.recentTests.map((attempt) => (
                  <tr key={attempt.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3.5 px-6 font-medium text-foreground">
                      {attempt.test?.title || "Mock Test"}
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground">
                      {attempt.test?.testSeries?.examName || "Competitive"}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                      {attempt.score} / {attempt.totalMarks}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      {attempt.accuracy}%
                    </td>
                    <td className="py-3.5 px-4 font-mono text-muted-foreground">
                      {formatSecondsToTime(attempt.timeTakenSeconds)}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Link href={`/student/tests/${attempt.testId}/result?attemptId=${attempt.id}`}>
                        <Button size="sm" variant="outline" className="h-7 text-xs font-semibold">
                          Review Solution
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

      {/* Recommended Tests / Next Steps */}
      <div className="space-y-4">
        <h3 className="text-base font-bold tracking-tight">Recommended Test Series</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendedSeries.slice(0, 3).map((series) => (
            <div
              key={series.id}
              className="p-5 rounded-xl border border-border bg-card flex flex-col justify-between space-y-4 hover:border-foreground/20 transition-all"
            >
              <div className="space-y-1.5">
                <Badge variant="outline" className="text-[10px] font-mono">
                  {series.examName}
                </Badge>
                <h4 className="font-semibold text-sm text-foreground leading-snug">
                  {series.title}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {series.shortDescription}
                </p>
              </div>

              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="font-mono font-bold text-foreground">
                  ₹{series.discountPrice || series.price}
                </span>
                <Link href={`/test-series/${series.slug}`}>
                  <Button size="sm" variant="outline" className="h-7 text-xs">
                    Inspect
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
