import { getCategories } from "@/lib/data/store";
import { CreateTestSeriesForm } from "@/components/admin/create-test-series-form";

export default async function CreateTestSeriesPage() {
  const categories = await getCategories();
  return <CreateTestSeriesForm categories={categories} />;
}
