import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getTestSeriesById, getCategories } from "@/lib/data/store";
import { EditTestSeriesForm } from "@/components/admin/edit-test-series-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditTestSeriesPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const [series, categories] = await Promise.all([
    getTestSeriesById(id),
    getCategories(),
  ]);

  if (!series) {
    notFound();
  }

  return <EditTestSeriesForm series={series} categories={categories} />;
}
