import { requireAdmin } from "@/lib/auth/session";
import { getAdminTestSeriesList } from "@/lib/data/store";
import { AdminTestSeriesView } from "@/components/admin/admin-test-series-view";

export default async function AdminTestSeriesPage() {
  await requireAdmin();
  const list = await getAdminTestSeriesList();

  return <AdminTestSeriesView testSeriesList={list} />;
}
