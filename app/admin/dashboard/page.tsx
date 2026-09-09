import Link from "next/link";
import { getAdminDashboardStats } from "@/lib/data/store";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminAnalyticsChart } from "@/components/admin/admin-analytics-chart";
import {
  Users,
  CreditCard,
  Layers,
  FileCheck2,
  HelpCircle,
  TrendingUp,
  Activity,
  ArrowRight,
  Plus,
  UploadCloud,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header with Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-xl border border-border bg-card">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time platform telemetry, subscriber growth, and test terminal throughput.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Link href="/admin/questions/import" className="w-full sm:w-auto">
            <Button size="sm" variant="outline" className="w-full sm:w-auto h-9 sm:h-8 text-xs gap-1.5 border-border">
              <UploadCloud className="h-3.5 w-3.5" />
              Bulk Import Questions
            </Button>
          </Link>
          <Link href="/admin/test-series/create" className="w-full sm:w-auto">
            <Button size="sm" className="w-full sm:w-auto h-9 sm:h-8 text-xs font-semibold gap-1.5 shadow-sm">
              <Plus className="h-3.5 w-3.5" />
              Create Test Series
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <Card className="p-4 border-border">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">
            Total Students
          </span>
          <p className="text-xl font-bold font-mono text-foreground mt-1.5">
            {stats.totalStudents.toLocaleString()}
          </p>
        </Card>

        <Card className="p-4 border-border">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">
            Active Now
          </span>
          <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1.5">
            {stats.activeStudents.toLocaleString()}
          </p>
        </Card>

        <Card className="p-4 border-border">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">
            Total Revenue
          </span>
          <p className="text-xl font-bold font-mono text-foreground mt-1.5">
            {formatCurrency(stats.totalRevenue)}
          </p>
        </Card>

        <Card className="p-4 border-border">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">
            Test Series
          </span>
          <p className="text-xl font-bold font-mono text-foreground mt-1.5">
            {stats.totalTestSeries}
          </p>
        </Card>

        <Card className="p-4 border-border">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">
            Total Tests
          </span>
          <p className="text-xl font-bold font-mono text-foreground mt-1.5">
            {stats.totalTests}
          </p>
        </Card>

        <Card className="p-4 border-border">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">
            Questions
          </span>
          <p className="text-xl font-bold font-mono text-foreground mt-1.5">
            {stats.totalQuestions}
          </p>
        </Card>

        <Card className="p-4 border-border">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">
            Attempts
          </span>
          <p className="text-xl font-bold font-mono text-foreground mt-1.5">
            {stats.testsAttempted.toLocaleString()}
          </p>
        </Card>

        <Card className="p-4 border-border">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">
            Completion
          </span>
          <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1.5">
            {stats.completionRate}%
          </p>
        </Card>
      </div>

      {/* Revenue & Growth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-base font-bold">Revenue Run-Rate</CardTitle>
              <CardDescription className="text-xs">
                Monthly subscription volume generated across all exam series
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs text-emerald-600 dark:text-emerald-400">
              +28% Month-over-Month
            </Badge>
          </div>

          <AdminAnalyticsChart data={stats.revenueChart} />
        </Card>

        <Card className="lg:col-span-1 border-border p-6 space-y-4">
          <CardTitle className="text-base font-bold">Top Test Series</CardTitle>
          <CardDescription className="text-xs">
            Most popular examination packages by student enrollment
          </CardDescription>

          <div className="space-y-3 pt-2">
            {stats.topSeries.map((series, idx) => (
              <div
                key={series.id}
                className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-xs text-muted-foreground">
                    #{idx + 1}
                  </span>
                  <div>
                    <h4 className="font-semibold text-xs text-foreground line-clamp-1">
                      {series.title}
                    </h4>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {series.examName}
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="text-[11px] font-mono">
                  ₹{series.discountPrice || series.price}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
