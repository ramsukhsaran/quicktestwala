import { getAllOrders } from "@/lib/data/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle2, Clock } from "lucide-react";

export default async function AdminOrdersPage() {
  const orders = await getAllOrders();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Orders & Transactions</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Complete ledger of test series purchases, payment gateways, and license activations.
        </p>
      </div>

      <Card className="border-border">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-muted-foreground uppercase font-semibold">
                <th className="py-3.5 px-6">Order ID</th>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Test Series</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Payment Status</th>
                <th className="py-3.5 px-4">Provider</th>
                <th className="py-3.5 px-6 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o: any) => (
                <tr key={o.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-foreground">
                    {o.orderNumber}
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-foreground block">
                      {o.user?.name || "Student"}
                    </span>
                    <span className="text-[11px] text-muted-foreground block">
                      {o.user?.email || "student@example.com"}
                    </span>
                  </td>
                  <td className="py-4 px-4 font-medium text-foreground">
                    {o.testSeries?.title || "SSC CGL 2026 Complete Series"}
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
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <Clock className="h-3 w-3" /> {o.status}
                      </Badge>
                    )}
                  </td>
                  <td className="py-4 px-4 font-mono text-[11px]">
                    {o.paymentMethod || "Razorpay / UPI"}
                  </td>
                  <td className="py-4 px-6 text-right text-muted-foreground font-mono">
                    {new Date(o.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
