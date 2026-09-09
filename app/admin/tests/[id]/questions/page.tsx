import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth/session";
import { getTestQuestionsWithBank } from "@/lib/data/store";
import { TestQuestionManager } from "@/components/admin/test-question-manager";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminTestQuestionsPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const data = await getTestQuestionsWithBank(id);
  if (!data) {
    notFound();
  }

  return <TestQuestionManager testId={id} initialData={data} />;
}
