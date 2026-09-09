import { getTestSeriesList } from "@/lib/data/store";
import { CreateTestForm } from "@/components/admin/create-test-form";

export default async function CreateTestPage() {
  const seriesList = await getTestSeriesList();
  return <CreateTestForm seriesList={seriesList} />;
}
