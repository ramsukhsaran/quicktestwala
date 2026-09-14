"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { markOrderAsPaidAction } from "@/actions/admin";
import { formatCurrency } from "@/lib/utils";
import { exportToCsv, exportToJson } from "@/lib/utils/export";
import {
  Search,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  FileCode2,
  Filter,
  DollarSign,
  TrendingUp,
  CreditCard,
  Check,
  Loader2,
  Crown,
} from "lucide-react";

interface AdminOrdersViewProps {
  orders: any[];
}

export function AdminOrdersView({ orders }: AdminOrdersViewProps) {
  const [search, setSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"ALL" | "PAID" | "PENDING">("ALL");
  const [activatingId, setActivatingId] = React.useState<string | null>(null);
  const { toast } = useToast();

  const filtered = React.useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter === "PAID" && o.status !== "PAID") return false;
      if (statusFilter === "PENDING" && o.status !== "PENDING") return false;
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matchesNum = o.orderNumber?.toLowerCase().includes(q);
        const matchesName = o.user?.name?.toLowerCase().includes(q);
        const matchesEmail = o.user?.email?.toLowerCase().includes(q);
        const matchesSeries = o.testSeries?.title?.toLowerCase().includes(q);
        if (!matchesNum && !matchesName && !matchesEmail && !matchesSeries) return false;
      }
      return true;
    });
  }, [orders, statusFilter, search]);

  const stats = React.useMemo(() => {
    const paidOrders = orders.filter((o) => o.status === "PAID");
    const totalRev = paidOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
    const avgOrderVal = paidOrders.length > 0 ? Math.round(totalRev / paidOrders.length) : 0;

    return {
      totalRevenue: totalRev,
      paidCount: paidOrders.length,
      pendingCount: orders.filter((o) => o.status === "PENDING").length,
      averageOrderValue: avgOrderVal,
    };
  }, [orders]);

  const handleMarkAsPaid = async (orderId: string) => {
    try {
      setActivatingId(orderId);
      const res = await markOrderAsPaidAction(orderId);
      if (res.error) {
        toast({ title: "Error", description: res.error, type: "error" });
      } else {
        toast({
          title: "Order Activated",
          description: "Order marked as PAID and test series unlocked for student.",
          type: "success",
        });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message, type: "error" });
    } finally {
      setActivatingId(null);
    }
  };

  const handleExportCsv = () => {
    const headers = [
      "Order Number",
      "Student Name",
      "Student Email",
      "Test Series",
      "Amount (INR)",
      "Status",
      "Payment Gateway",
      "Created At",
    ];

    const rows = filtered.map((o) => {
      const itemTitle =
        o.planType === "PRO_FULL_ACCESS" || o.testSeriesId === "pro_access_all_series"
          ? "Pro Access Membership (1-Year Pass)"
          : (o.testSeries?.title || "Test Series Package");

      return [
        o.orderNumber,
        o.user?.name || "Student",
        o.user?.email || "N/A",
        itemTitle,
        o.amount,
        o.status,
        o.paymentMethod || "Razorpay",
        new Date(o.createdAt).toLocaleDateString(),
      ];
    });

    exportToCsv(`orders-ledger-export-${Date.now()}`, headers, rows);
  };

  const handleExportJson = () => {
    exportToJson(`orders-ledger-export-${Date.now()}`, filtered);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Orders & Transactions</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Complete transaction ledger of test series purchases, payment gateway reconciliations, and student access activations.
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

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="p-4 border-border">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">
            Total Revenue
          </span>
          <p className="text-xl font-bold font-mono text-foreground mt-1">
            {formatCurrency(stats.totalRevenue)}
          </p>
        </Card>

        <Card className="p-4 border-border">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">
            Completed Orders
          </span>
          <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {stats.paidCount}
          </p>
        </Card>

        <Card className="p-4 border-border">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">
            Pending Orders
          </span>
          <p className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">
            {stats.pendingCount}
          </p>
        </Card>

        <Card className="p-4 border-border">
          <span className="text-[10px] font-bold text-muted-foreground uppercase">
            Avg. Order Value
          </span>
          <p className="text-xl font-bold font-mono text-foreground mt-1">
            {formatCurrency(stats.averageOrderValue)}
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
            placeholder="Search by Order ID, student name, email, or test series..."
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
            All Orders ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("PAID")}
            className={`px-3 py-1 rounded-full border transition-colors shrink-0 font-medium ${
              statusFilter === "PAID"
                ? "bg-emerald-600 text-white border-emerald-600 font-semibold"
                : "border-border hover:bg-muted text-muted-foreground"
            }`}
          >
            Paid ({stats.paidCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("PENDING")}
            className={`px-3 py-1 rounded-full border transition-colors shrink-0 font-medium ${
              statusFilter === "PENDING"
                ? "bg-amber-600 text-white border-amber-600 font-semibold"
                : "border-border hover:bg-muted text-muted-foreground"
            }`}
          >
            Pending ({stats.pendingCount})
          </button>
        </div>
      </div>

      {/* Orders Table */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center bg-card">
          <CreditCard className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground">No orders found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
            {orders.length === 0
              ? "No student purchases recorded yet. As students buy test series, transactions will log here in real time."
              : "No orders match your active filter."}
          </p>
        </div>
      ) : (
        <Card className="border-border">
          {/* Desktop Table View */}
          <CardContent className="p-0 overflow-x-auto hidden lg:block">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground uppercase font-semibold">
                  <th className="py-3.5 px-6">Order ID</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Test Series</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Gateway</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-6 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-foreground">
                      {o.orderNumber}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-semibold text-foreground block">
                        {o.user?.name || "Student"}
                      </span>
                      <span className="text-[11px] text-muted-foreground block font-mono">
                        {o.user?.email || "N/A"}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-medium text-foreground max-w-xs truncate">
                      {o.planType === "PRO_FULL_ACCESS" || o.testSeriesId === "pro_access_all_series" ? (
                        <span className="inline-flex items-center gap-1.5 font-bold text-purple-600 dark:text-purple-400">
                          <Crown className="h-3.5 w-3.5" /> Pro Access (1-Year Pass)
                        </span>
                      ) : (
                        o.testSeries?.title || "Test Series"
                      )}
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-foreground">
                      {formatCurrency(o.amount)}
                    </td>
                    <td className="py-4 px-4">
                      {o.status === "PAID" ? (
                        <Badge variant="success" className="text-[10px] gap-1 font-semibold">
                          <CheckCircle2 className="h-3 w-3" /> Paid
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] gap-1 text-amber-600 border-amber-500/30">
                          <Clock className="h-3 w-3" /> Pending
                        </Badge>
                      )}
                    </td>
                    <td className="py-4 px-4 font-mono text-[11px]">
                      {o.paymentMethod || "Razorpay / UPI"}
                    </td>
                    <td className="py-4 px-4 text-muted-foreground font-mono">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      {o.status === "PENDING" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMarkAsPaid(o.id)}
                          disabled={activatingId === o.id}
                          className="h-7 px-2.5 text-xs gap-1 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 font-semibold"
                        >
                          {activatingId === o.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3" />
                          )}
                          <span>Activate (Paid)</span>
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>

          {/* Mobile Cards View */}
          <div className="lg:hidden divide-y divide-border">
            {filtered.map((o) => (
              <div key={o.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-sm text-foreground block">
                      {o.orderNumber}
                    </span>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {o.status === "PAID" ? (
                    <Badge variant="success" className="text-[10px] gap-1 font-semibold shrink-0">
                      <CheckCircle2 className="h-3 w-3" /> Paid
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] gap-1 shrink-0 text-amber-600 border-amber-500/30">
                      <Clock className="h-3 w-3" /> Pending
                    </Badge>
                  )}
                </div>

                <div className="text-xs space-y-0.5">
                  <p className="font-semibold text-foreground">
                    {o.planType === "PRO_FULL_ACCESS" || o.testSeriesId === "pro_access_all_series" ? (
                      <span className="inline-flex items-center gap-1.5 font-bold text-purple-600 dark:text-purple-400">
                        <Crown className="h-3.5 w-3.5" /> Pro Access Membership (1-Year Pass)
                      </span>
                    ) : (
                      o.testSeries?.title || "Test Series Package"
                    )}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Aspirant: <span className="text-foreground font-medium">{o.user?.name || "Student"}</span> ({o.user?.email})
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-muted/40 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block">Amount Paid</span>
                    <span className="font-bold text-foreground text-sm">{formatCurrency(o.amount)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase block">Gateway</span>
                    <span className="text-muted-foreground font-semibold">{o.paymentMethod || "Razorpay / UPI"}</span>
                  </div>
                </div>

                {o.status === "PENDING" && (
                  <div className="pt-2 border-t border-border/60 flex justify-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkAsPaid(o.id)}
                      disabled={activatingId === o.id}
                      className="h-8 text-xs gap-1.5 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 font-semibold"
                    >
                      {activatingId === o.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                      <span>Activate & Mark as Paid</span>
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
