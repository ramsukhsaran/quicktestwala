"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TestActions } from "@/components/admin/test-actions";
import { formatDuration } from "@/lib/utils";
import { exportToCsv, exportToJson } from "@/lib/utils/export";
import {
  Plus,
  Search,
  FileSpreadsheet,
  FileCode2,
  Timer,
  Layers,
  Filter,
} from "lucide-react";

interface AdminTestsViewProps {
  tests: any[];
  testSeriesList: any[];
  initialSeriesId?: string;
}

export function AdminTestsView({ tests, testSeriesList, initialSeriesId }: AdminTestsViewProps) {
  const [selectedSeriesId, setSelectedSeriesId] = React.useState(initialSeriesId || "");
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");
  const [search, setSearch] = React.useState("");

  const filtered = React.useMemo(() => {
    return tests.filter((test) => {
      if (selectedSeriesId && test.testSeriesId !== selectedSeriesId) {
        return false;
      }
      if (statusFilter === "PUBLISHED" && test.status !== "PUBLISHED") {
        return false;
      }
      if (statusFilter === "DRAFT" && test.status === "PUBLISHED") {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesTitle = test.title?.toLowerCase().includes(q);
        const matchesDesc = test.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }
      return true;
    });
  }, [tests, selectedSeriesId, statusFilter, search]);

  const handleExportCsv = () => {
    const headers = [
      "Test ID",
      "Title",
      "Test Series ID",
      "Duration (Mins)",
      "Total Marks",
      "Passing Marks",
      "Marks Per Question",
      "Negative Marking",
      "Questions Count",
      "Status",
      "Created At",
    ];

    const rows = filtered.map((t) => [
      t.id,
      t.title,
      t.testSeriesId,
      t.durationMinutes,
      t.totalMarks,
      t.passingMarks,
      t.marksPerQuestion,
      t.negativeMarkingRate,
      ("questionIds" in t ? t.questionIds?.length : t.testQuestions?.length) || 0,
      t.status,
      new Date(t.createdAt).toLocaleDateString(),
    ]);

    exportToCsv(`mock-tests-export-${Date.now()}`, headers, rows);
  };

  const handleExportJson = () => {
    exportToJson(`mock-tests-export-${Date.now()}`, filtered);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mock Tests Management</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Configure test duration, marks, negative marking, and manage question palette attachments.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
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

          <Link href="/admin/tests/create">
            <Button size="sm" className="h-8 text-xs font-semibold gap-1.5 shadow-sm">
              <Plus className="h-3.5 w-3.5" />
              Create Mock Test
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by mock test title..."
              className="pl-9 h-10 text-sm"
            />
          </div>

          <div>
            <select
              value={selectedSeriesId}
              onChange={(e) => setSelectedSeriesId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="">All Test Series Packages</option>
              {testSeriesList.map((ts) => (
                <option key={ts.id} value={ts.id}>
                  {ts.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-muted-foreground font-medium shrink-0 flex items-center gap-1">
            <Filter className="h-3 w-3" />
            Status:
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
            All Tests ({tests.length})
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
            Active / Published ({tests.filter((t) => t.status === "PUBLISHED").length})
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
            Inactive / Draft ({tests.filter((t) => t.status !== "PUBLISHED").length})
          </button>
        </div>
      </div>

      {/* Tests Table */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center bg-card">
          <Layers className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground">No mock tests found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
            {tests.length === 0
              ? "No mock tests have been created yet. Create a test series first, then attach mock tests to it."
              : "No tests match your current search or test series filter."}
          </p>
          <Link href="/admin/tests/create" className="inline-block mt-4">
            <Button size="sm" className="text-xs font-semibold gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Create Mock Test
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
                  <th className="py-3.5 px-6">Test Title</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Marks & Penalty</th>
                  <th className="py-3.5 px-4">Questions</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((test) => {
                  const qCount = (("questionIds" in test ? test.questionIds?.length : test.testQuestions?.length) || 0);
                  return (
                    <tr key={test.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-4 px-6 font-semibold text-foreground">
                        <div>{test.title}</div>
                        {test.testSeries && (
                          <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
                            Series: {test.testSeries.title}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-4 font-mono">
                        {formatDuration(test.durationMinutes)}
                      </td>
                      <td className="py-4 px-4 font-mono">
                        <span className="font-bold text-foreground">{test.totalMarks} Marks</span>
                        <span className="text-rose-600 dark:text-rose-400 block text-[11px]">
                          -{test.negativeMarkingRate} penalty
                        </span>
                      </td>
                      <td className="py-4 px-4 font-mono font-medium">
                        {qCount} Items
                      </td>
                      <td className="py-4 px-4">
                        {test.status === "PUBLISHED" ? (
                          <Badge variant="success" className="text-[10px]">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30">
                            Draft
                          </Badge>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <TestActions test={test} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>

          {/* Mobile Cards View */}
          <div className="lg:hidden divide-y divide-border">
            {filtered.map((test) => {
              const qCount = (("questionIds" in test ? test.questionIds?.length : test.testQuestions?.length) || 0);
              return (
                <div key={test.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-foreground">{test.title}</h3>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1 font-mono">
                          <Timer className="h-3 w-3" />
                          {formatDuration(test.durationMinutes)}
                        </span>
                        <span>•</span>
                        <span className="font-mono">{qCount} Questions</span>
                      </div>
                    </div>
                    {test.status === "PUBLISHED" ? (
                      <Badge variant="success" className="text-[10px] shrink-0">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] shrink-0 text-amber-600 border-amber-500/30">
                        Draft
                      </Badge>
                    )}
                  </div>

                  {/* Specs Grid */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-muted/40 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block">Total Marks</span>
                      <span className="font-bold text-foreground">{test.totalMarks} Marks</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase block">Marking Ratio</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">+{test.marksPerQuestion}</span>
                      <span className="text-rose-600 dark:text-rose-400 ml-1">(-{test.negativeMarkingRate})</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-border/60">
                    <TestActions test={test} />
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
