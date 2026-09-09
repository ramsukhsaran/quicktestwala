import { notFound } from "next/navigation";
import { getTestById } from "@/lib/data/store";
import { EditTestForm } from "@/components/admin/edit-test-form";

export default async function EditTestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const test = await getTestById(id);

  if (!test) {
    notFound();
  }

  return <EditTestForm test={test} />;
}
