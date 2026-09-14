"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StudentStatusToggle } from "@/components/admin/student-status-toggle";
import { exportToCsv, exportToJson } from "@/lib/utils/export";
import {
  Users,
  Search,
  FileSpreadsheet,
  FileCode2,
  Filter,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface AdminStudentsViewProps {
  students: any[];
}

export function AdminStudentsView({ students }: AdminStudentsViewProps) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | "ACTIVE" | "BLOCKED">("ALL");

  const filtered = React.useMemo(() => {
    return students.filter((st) => {
      if (statusFilter === "ACTIVE" && st.status !== "ACTIVE") return false;
      if (statusFilter === "BLOCKED" && st.status !== "BLOCKED") return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesName = st.name?.toLowerCase().includes(q);
        const matchesEmail = st.email?.toLowerCase().includes(q);
        const matchesExam = (st.profile?.targetExam || st.targetExam)?.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesExam) return false;
      }
      return true;
    });
  }, [students, statusFilter, search]);

  const stats = React.useMemo(() => {
    const active = students.filter((s) => s.status === "ACTIVE").length;
    const totalAttempts = students.reduce((sum, s) => sum + (s.attempts?.length || 0), 0);
    const totalOrders = students.reduce((sum, s) => sum + (s.orders?.length || 0), 0);
    return {
      total: students.length,
      active,
      totalAttempts,
      totalOrders,
    };
  }, [students]);

  const handleExportCsv = () => {
    const headers = [
      "Student ID",
      "Name",
      "Email",
      "Target Exam",
      "Status",
      "Enrolled Series Count",
      "Mock Tests Attempted",
      "Registered On",
    ];

    const rows = filtered.map((st) => [
      st.id,
      st.name,
      st.email,
      st.profile?.targetExam || st.targetExam || "General",
      st.status,
      st.orders?.length ?? 0,
      st.attempts?.length ?? 0,
      new Date(st.createdAt || Date.now()).toLocaleDateString(),
    ]);

    exportToCsv(`students-roster-export-${Date.now()}`, headers, rows);
  };

  const handleExportJson = () => {
    exportToJson(`students-roster-export-${Date.now()}`, filtered);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Student Management</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Registered aspirants, examination attempts, enrolled packages, and account status controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 border-border">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">
            Total Aspirants
          </span>
          <p className="text-xl font-bold font-mono text-foreground mt-1">
            {stats.total}
          </p>
        </Card>

        <Card className="p-4 border-border">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">
            Active Accounts
          </span>
          <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {stats.active}
          </p>
        </Card>

        <Card className="p-4 border-border">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">
            Total Subscriptions
          </span>
          <p className="text-xl font-bold font-mono text-foreground mt-1">
            {stats.totalOrders}
          </p>
        </Card>

        <Card className="p-4 border-border">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">
            Tests Attempted
          </span>
          <p className="text-xl font-bold font-mono text-foreground mt-1">
            {stats.totalAttempts}
          </p>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, email, or target exam..."
            className="pl-9 h-10 text-sm"
          />
        </div>

        {/* Filter Buttons */}
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
            All Aspirants ({students.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("ACTIVE")}
            className={`px-3 py-1 rounded-full border transition-colors shrink-0 font-medium ${
              statusFilter === "ACTIVE"
                ? "bg-emerald-600 text-white border-emerald-600 font-semibold"
                : "border-border hover:bg-muted text-muted-foreground"
            }`}
          >
            Active ({stats.active})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("BLOCKED")}
            className={`px-3 py-1 rounded-full border transition-colors shrink-0 font-medium ${
              statusFilter === "BLOCKED"
                ? "bg-destructive text-white border-destructive font-semibold"
                : "border-border hover:bg-muted text-muted-foreground"
            }`}
          >
            Blocked ({students.length - stats.active})
          </button>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center bg-card">
          <Users className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground">No students found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
            No student accounts match your active search filter.
          </p>
        </div>
      ) : (
        <Card className="border-border">
          {/* Desktop Table View */}
          <CardContent className="p-0 overflow-x-auto hidden lg:block">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground uppercase font-semibold">
                  <th className="py-3.5 px-6">Student</th>
                  <th className="py-3.5 px-4">Target Exam</th>
                  <th className="py-3.5 px-4">Purchased Series</th>
                  <th className="py-3.5 px-4">Tests Attempted</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((st) => (
                  <tr key={st.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-foreground">{st.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{st.email}</div>
                    </td>
                    <td className="py-4 px-4 font-medium">
                      {st.profile?.targetExam || st.targetExam || "SSC CGL 2026"}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold">
                      {st.orders?.length ?? 0} Series
                    </td>
                    <td className="py-4 px-4 font-mono">
                      {st.attempts?.length ?? 0} Mocks Taken
                    </td>
                    <td className="py-4 px-4">
                      {st.status === "ACTIVE" ? (
                        <Badge variant="success" className="text-[10px] font-semibold">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-[10px] font-semibold">
                          Blocked
                        </Badge>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <StudentStatusToggle userId={st.id} currentStatus={st.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>

          {/* Mobile Cards View */}
          <div className="lg:hidden divide-y divide-border">
            {filtered.map((st) => (
              <div key={st.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{st.name}</h3>
                    <p className="text-[11px] text-muted-foreground font-mono">{st.email}</p>
                  </div>
                  {st.status === "ACTIVE" ? (
                    <Badge variant="success" className="text-[10px] font-semibold shrink-0">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="destructive" className="text-[10px] font-semibold shrink-0">
                      Blocked
                    </Badge>
                  )}
                </div>

                <div className="text-xs">
                  <span className="text-muted-foreground">Target Focus: </span>
                  <span className="font-semibold text-foreground">
                    {st.profile?.targetExam || st.targetExam || "SSC CGL 2026"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-muted/40 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block">Subscriptions</span>
                    <span className="font-bold text-foreground">{st.orders?.length ?? 0} Series</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block">Exams Attempted</span>
                    <span className="font-bold text-foreground">{st.attempts?.length ?? 0} Mocks Taken</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-border/60">
                  <span className="text-xs text-muted-foreground">Account Access:</span>
                  <StudentStatusToggle userId={st.id} currentStatus={st.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
