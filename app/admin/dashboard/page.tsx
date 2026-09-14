import { requireAdmin } from "@/lib/auth/session";
import { getAdminDashboardStats } from "@/lib/data/store";
import { AdminDashboardView } from "@/components/admin/admin-dashboard-view";

export default async function AdminDashboardPage() {
  await requireAdmin();
  const stats = await getAdminDashboardStats();

  return <AdminDashboardView stats={stats} />;
}
