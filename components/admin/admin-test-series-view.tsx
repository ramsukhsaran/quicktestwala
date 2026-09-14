"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TestSeriesActions } from "@/components/admin/test-series-actions";
import { formatCurrency } from "@/lib/utils";
import { exportToCsv, exportToJson } from "@/lib/utils/export";
import {
  Plus,
  Search,
  Download,
  FileSpreadsheet,
  FileCode2,
  Filter,
  Layers,
} from "lucide-react";

interface AdminTestSeriesViewProps {
  testSeriesList: any[];
}

export function AdminTestSeriesView({ testSeriesList }: AdminTestSeriesViewProps) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | "PUBLISHED" | "DRAFT" | "FREE" | "PAID">("ALL");

  const cleanSeriesList = React.useMemo(() => {
    return testSeriesList.filter(
      (ts) =>
        ts.id !== "pro_access_all_series" &&
        ts.slug !== "pro-full-access" &&
        ts.slug !== "pro-access-membership-system"
    );
  }, [testSeriesList]);

  const filtered = React.useMemo(() => {
    return cleanSeriesList.filter((ts) => {
      // Status & Price filter
      if (statusFilter === "PUBLISHED" && ts.status !== "PUBLISHED") return false;
      if (statusFilter === "DRAFT" && ts.status === "PUBLISHED") return false;
      if (statusFilter === "FREE") {
        const isFree = Number(ts.price) === 0 || Number(ts.discountPrice) === 0;
        if (!isFree) return false;
      }
      if (statusFilter === "PAID") {
        const isFree = Number(ts.price) === 0 || Number(ts.discountPrice) === 0;
        if (isFree) return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesTitle = ts.title?.toLowerCase().includes(q);
        const matchesExam = ts.examName?.toLowerCase().includes(q);
        const matchesDesc = ts.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesExam && !matchesDesc) return false;
      }

      return true;
    });
  }, [cleanSeriesList, search, statusFilter]);

  const counts = React.useMemo(() => {
    return {
      all: cleanSeriesList.length,
      published: cleanSeriesList.filter((ts) => ts.status === "PUBLISHED").length,
      draft: cleanSeriesList.filter((ts) => ts.status !== "PUBLISHED").length,
      free: cleanSeriesList.filter((ts) => Number(ts.price) === 0 || Number(ts.discountPrice) === 0).length,
      paid: cleanSeriesList.filter((ts) => Number(ts.price) > 0 && Number(ts.discountPrice ?? 1) > 0).length,
    };
  }, [cleanSeriesList]);

  const handleExportCsv = () => {
    const headers = [
      "Series ID",
      "Title",
      "Exam Name",
      "Category",
      "Difficulty",
      "Price (INR)",
      "Discount Price (INR)",
      "Status",
      "Total Mocks",
      "Enrollments",
      "Created At",
    ];

    const rows = filtered.map((ts) => [
      ts.id,
      ts.title,
      ts.examName,
      ts.category?.name || "General",
      ts.difficulty,
      ts.price,
      ts.discountPrice ?? 0,
      ts.status,
      ts.totalTestsCount ?? ts.tests?.length ?? 0,
      ts.enrollmentCount ?? 0,
      new Date(ts.createdAt).toLocaleDateString(),
    ]);

    exportToCsv(`test-series-export-${Date.now()}`, headers, rows);
  };

  const handleExportJson = () => {
    exportToJson(`test-series-export-${Date.now()}`, filtered);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Test Series Management</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Create, publish, price, activate/deactivate, and manage competitive mock test series packages.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Export Dropdown / Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCsv}
            className="h-8 text-xs gap-1.5 border-border"
            title="Download CSV report"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Export CSV</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportJson}
            className="h-8 text-xs gap-1.5 border-border"
            title="Download JSON report"
          >
            <FileCode2 className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
            <span>Export JSON</span>
          </Button>

          <Link href="/admin/test-series/create">
            <Button size="sm" className="h-8 text-xs font-semibold gap-1.5 shadow-sm">
              <Plus className="h-3.5 w-3.5" />
              Create Test Series
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by series title, exam name (e.g. SSC, IBPS, RRB)..."
              className="pl-9 h-10 text-sm"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-muted-foreground font-medium shrink-0 flex items-center gap-1">
            <Filter className="h-3 w-3" />
            Filter:
          </span>
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1 rounded-full border transition-colors shrink-0 font-medium ${
              statusFilter === "ALL"
                ? "bg-foreground text-background border-foreground font-semibold"
                : "border-border hover:bg-muted text-muted-foreground"
            }`}
          >
            All ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("PUBLISHED")}
            className={`px-3 py-1 rounded-full border transition-colors shrink-0 font-medium ${
              statusFilter === "PUBLISHED"
                ? "bg-emerald-600 text-white border-emerald-600 font-semibold"
                : "border-border hover:bg-muted text-muted-foreground"
            }`}
          >
            Active / Published ({counts.published})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("DRAFT")}
            className={`px-3 py-1 rounded-full border transition-colors shrink-0 font-medium ${
              statusFilter === "DRAFT"
                ? "bg-amber-600 text-white border-amber-600 font-semibold"
                : "border-border hover:bg-muted text-muted-foreground"
            }`}
          >
            Inactive / Draft ({counts.draft})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("FREE")}
            className={`px-3 py-1 rounded-full border transition-colors shrink-0 font-medium ${
              statusFilter === "FREE"
                ? "bg-sky-600 text-white border-sky-600 font-semibold"
                : "border-border hover:bg-muted text-muted-foreground"
            }`}
          >
            Free Series ({counts.free})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("PAID")}
            className={`px-3 py-1 rounded-full border transition-colors shrink-0 font-medium ${
              statusFilter === "PAID"
                ? "bg-purple-600 text-white border-purple-600 font-semibold"
                : "border-border hover:bg-muted text-muted-foreground"
            }`}
          >
            Paid Series ({counts.paid})
          </button>
        </div>
      </div>

      {/* Series Listing */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center bg-card">
          <Layers className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground">No test series found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
            {testSeriesList.length === 0
              ? "No test series have been created yet. Get started by creating your first test series."
              : "No test series match your active filters or search query."}
          </p>
          <Link href="/admin/test-series/create" className="inline-block mt-4">
            <Button size="sm" className="text-xs font-semibold gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Create Test Series
            </Button>
          </Link>
        </div>
      ) : (
        <Card className="border-border">
          {/* Desktop Table View */}
          <CardContent className="p-0 overflow-x-auto hidden lg:block">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground uppercase font-semibold">
                  <th className="py-3.5 px-6">Title & Exam</th>
                  <th className="py-3.5 px-4">Difficulty</th>
                  <th className="py-3.5 px-4">Tests Included</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Subscribers</th>
                  <th className="py-3.5 px-6 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((ts) => {
                  const isFree = Number(ts.price) === 0 || Number(ts.discountPrice) === 0;
                  return (
                    <tr key={ts.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-foreground">{ts.title}</div>
                        <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                          {ts.examName} • {ts.language}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {ts.difficulty}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 font-mono font-medium">
                        {ts.totalTestsCount ?? ts.tests?.length ?? 0} Mocks
                      </td>
                      <td className="py-4 px-4 font-mono font-bold text-foreground">
                        {isFree ? (
                          <Badge className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                            FREE
                          </Badge>
                        ) : (
                          <>
                            {formatCurrency(ts.discountPrice || ts.price)}
                            {ts.discountPrice && ts.discountPrice < ts.price && (
                              <span className="text-muted-foreground line-through text-[10px] block font-normal">
                                {formatCurrency(ts.price)}
                              </span>
                            )}
                          </>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {ts.status === "PUBLISHED" ? (
                          <Badge variant="success" className="text-[10px] font-semibold">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] font-semibold text-amber-600 border-amber-500/30">
                            {ts.status === "DRAFT" ? "Inactive (Draft)" : ts.status}
                          </Badge>
                        )}
                      </td>
                      <td className="py-4 px-4 font-mono">
                        {ts.enrollmentCount ?? 0} students
                      </td>
                      <td className="py-4 px-6 text-right">
                        <TestSeriesActions series={ts} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>

          {/* Mobile / Tablet Cards View */}
          <div className="lg:hidden divide-y divide-border">
            {filtered.map((ts) => {
              const isFree = Number(ts.price) === 0 || Number(ts.discountPrice) === 0;
              return (
                <div key={ts.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-foreground">{ts.title}</h3>
                      <p className="text-[11px] text-muted-foreground font-mono mt-0.5">
                        {ts.examName} • {ts.language}
                      </p>
                    </div>
                    {ts.status === "PUBLISHED" ? (
                      <Badge variant="success" className="text-[10px] shrink-0 font-semibold">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] shrink-0 font-semibold text-amber-600 border-amber-500/30">
                        {ts.status === "DRAFT" ? "Inactive" : ts.status}
                      </Badge>
                    )}
                  </div>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-muted/40 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block">Price</span>
                      <span className="font-bold text-foreground">
                        {isFree ? "FREE" : formatCurrency(ts.discountPrice || ts.price)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block">Content</span>
                      <span className="font-bold text-foreground">
                        {ts.totalTestsCount ?? ts.tests?.length ?? 0} Mocks
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block">Difficulty</span>
                      <span className="font-bold text-foreground">{ts.difficulty}</span>
                    </div>
                  </div>

                  {/* Mobile Actions */}
                  <div className="pt-2 border-t border-border/60">
                    <TestSeriesActions series={ts} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
