import { requireAdmin } from "@/lib/auth/session";
import { getAdminTestSeriesList } from "@/lib/data/store";
import { UploadQuestionPaperForm } from "@/components/admin/upload-question-paper-form";

export default async function UploadQuestionPaperPage() {
  await requireAdmin();
  const seriesList = await getAdminTestSeriesList();

  return <UploadQuestionPaperForm seriesList={seriesList} />;
}
