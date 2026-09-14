import { requireAdmin } from "@/lib/auth/session";
import { getAllTests, getAdminTestSeriesList } from "@/lib/data/store";
import { AdminTestsView } from "@/components/admin/admin-tests-view";

interface PageProps {
  searchParams: Promise<{ seriesId?: string }>;
}

export default async function AdminTestsPage({ searchParams }: PageProps) {
  await requireAdmin();
  const { seriesId } = await searchParams;

  const [tests, testSeriesList] = await Promise.all([
    getAllTests(),
    getAdminTestSeriesList(),
  ]);

  return (
    <AdminTestsView
      tests={tests}
      testSeriesList={testSeriesList}
      initialSeriesId={seriesId}
    />
  );
}
