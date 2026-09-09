import { requireAuth } from "@/lib/auth/session";
import { getUserOrders } from "@/lib/data/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Receipt, CheckCircle2, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default async function StudentOrdersPage() {
  const session = await requireAuth();
  const orders = await getUserOrders(session.id);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Order & Payment Receipts</h1>
        <p className="text-xs text-muted-foreground mt-1">
          Complete transaction ledger for test series purchases and active licenses.
        </p>
      </div>

      <Card className="border-border">
        <CardContent className="p-0 overflow-x-auto">
          {orders.length === 0 ? (
            <div className="p-12 text-center text-xs text-muted-foreground">
              No orders or purchases found.
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-muted-foreground uppercase font-semibold">
                  <th className="py-3.5 px-6">Order ID</th>
                  <th className="py-3.5 px-4">Test Series</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Status</th>
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
                    <td className="py-4 px-4 font-medium text-foreground">
                      {o.testSeries?.title || "Test Series Package"}
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
                        <Badge variant="outline" className="text-[10px]">
                          {o.status}
                        </Badge>
                      )}
                    </td>
                    <td className="py-4 px-4 font-mono text-muted-foreground text-[11px]">
                      {o.paymentMethod || "Razorpay"}
                    </td>
                    <td className="py-4 px-6 text-right text-muted-foreground">
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
