"use client";

import * as React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AdminAnalyticsChart } from "@/components/admin/admin-analytics-chart";
import { formatCurrency } from "@/lib/utils";
import { exportToCsv, exportToJson } from "@/lib/utils/export";
import {
  Users,
  CreditCard,
  Layers,
  FileCheck2,
  TrendingUp,
  Activity,
  ArrowRight,
  Plus,
  UploadCloud,
  FileSpreadsheet,
  FileCode2,
  RefreshCw,
  Gift,
  ShieldCheck,
} from "lucide-react";

interface AdminDashboardViewProps {
  stats: any;
}

export function AdminDashboardView({ stats }: AdminDashboardViewProps) {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    window.location.reload();
  };

  const handleExportSummaryCsv = () => {
    const headers = ["Metric", "Value"];
    const rows = [
      ["Total Students", stats.totalStudents],
      ["Active Students", stats.activeStudents],
      ["Total Test Series", stats.totalTestSeries],
      ["Free Test Series", stats.freeSeriesCount ?? 0],
      ["Paid Test Series", stats.paidSeriesCount ?? 0],
      ["Total Mock Tests", stats.totalTests],
      ["Total Questions in Bank", stats.totalQuestions],
      ["Tests Attempted", stats.testsAttempted],
      ["Total Revenue (INR)", stats.totalRevenue],
      ["Completion Rate (%)", stats.completionRate],
      ["Report Generated At", new Date().toISOString()],
    ];

    exportToCsv(`quicktestwala-platform-metrics-${Date.now()}`, headers, rows);
  };

  const handleExportSummaryJson = () => {
    exportToJson(`quicktestwala-platform-metrics-${Date.now()}`, {
      generatedAt: new Date().toISOString(),
      platformTelemetry: stats,
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto">
      {/* Header with Quick Actions & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-6 rounded-xl border border-border bg-card">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Executive Dashboard</h1>
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Real-time platform telemetry, subscriber growth, test series distribution, and test throughput.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="h-8 text-xs gap-1 border-border"
            title="Refresh live metrics"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportSummaryCsv}
            className="h-8 text-xs gap-1 border-border"
            title="Export CSV summary"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Export CSV</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportSummaryJson}
            className="h-8 text-xs gap-1 border-border"
            title="Export JSON summary"
          >
            <FileCode2 className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
            <span>Export JSON</span>
          </Button>

          <Link href="/admin/test-series/create">
            <Button size="sm" className="h-8 text-xs font-semibold gap-1.5 shadow-sm">
              <Plus className="h-3.5 w-3.5" />
              Create Series
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
            Free Series
          </span>
          <p className="text-xl font-bold font-mono text-sky-600 dark:text-sky-400 mt-1.5">
            {stats.freeSeriesCount ?? 0}
          </p>
        </Card>

        <Card className="p-4 border-border">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">
            Paid Series
          </span>
          <p className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400 mt-1.5">
            {stats.paidSeriesCount ?? 0}
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
            Questions Bank
          </span>
          <p className="text-xl font-bold font-mono text-foreground mt-1.5">
            {stats.totalQuestions}
          </p>
        </Card>
      </div>

      {/* Revenue Chart & Top Series Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-base font-bold">Revenue Run-Rate & Enrollment</CardTitle>
              <CardDescription className="text-xs">
                Monthly student volume and test series subscription revenue
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs text-emerald-600 dark:text-emerald-400">
              Real-Time Tracking
            </Badge>
          </div>

          <AdminAnalyticsChart data={stats.revenueChart} />
        </Card>

        <Card className="lg:col-span-1 border-border p-6 space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold">Latest Test Series</CardTitle>
            <Link href="/admin/test-series" className="text-xs text-primary hover:underline">
              View All
            </Link>
          </div>
          <CardDescription className="text-xs">
            Recently configured mock examination vertical packages
          </CardDescription>

          <div className="space-y-3 pt-2">
            {stats.topSeries.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                No test series created yet.
              </p>
            ) : (
              stats.topSeries.map((series: any, idx: number) => {
                const isFree = Number(series.price) === 0 || Number(series.discountPrice) === 0;
                return (
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
                          {series.examName} • {series.status}
                        </span>
                      </div>
                    </div>
                    {isFree ? (
                      <Badge className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                        FREE
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[11px] font-mono font-bold">
                        ₹{series.discountPrice || series.price}
                      </Badge>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </Card>
      </div>

      {/* Recent Transactions Feed */}
      {stats.recentOrders && stats.recentOrders.length > 0 && (
        <Card className="border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <CardTitle className="text-base font-bold">Recent Transactions & Enrollments</CardTitle>
              <CardDescription className="text-xs">
                Real-time subscriber conversions and payment ledger
              </CardDescription>
            </div>
            <Link href="/admin/orders" className="text-xs text-primary hover:underline">
              View All Orders
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border text-muted-foreground uppercase font-semibold">
                  <th className="py-2 px-4">Order ID</th>
                  <th className="py-2 px-4">Student</th>
                  <th className="py-2 px-4">Package</th>
                  <th className="py-2 px-4">Amount</th>
                  <th className="py-2 px-4">Status</th>
                  <th className="py-2 px-4 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {stats.recentOrders.map((o: any) => (
                  <tr key={o.id} className="hover:bg-muted/20">
                    <td className="py-3 px-4 font-mono font-bold">{o.orderNumber}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold">{o.user?.name || "Student"}</span>
                      <span className="text-[11px] text-muted-foreground block">{o.user?.email}</span>
                    </td>
                    <td className="py-3 px-4 truncate max-w-xs">{o.testSeries?.title || "Test Series"}</td>
                    <td className="py-3 px-4 font-mono font-bold">{formatCurrency(o.amount)}</td>
                    <td className="py-3 px-4">
                      <Badge variant={o.status === "PAID" ? "success" : "outline"} className="text-[10px]">
                        {o.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right text-muted-foreground font-mono">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
