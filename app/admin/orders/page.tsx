import { requireAdmin } from "@/lib/auth/session";
import { getAllOrders } from "@/lib/data/store";
import { AdminOrdersView } from "@/components/admin/admin-orders-view";

export default async function AdminOrdersPage() {
  await requireAdmin();
  const orders = await getAllOrders();

  return <AdminOrdersView orders={orders} />;
}
