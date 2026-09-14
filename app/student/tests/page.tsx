import { requireAuth } from "@/lib/auth/session";
import { getTestsForStudent, getStudentCompletedTestIds } from "@/lib/data/store";
import { StudentTestsView } from "@/components/student/student-tests-view";

interface PageProps {
  searchParams: Promise<{ seriesId?: string }>;
}

export default async function StudentTestsPage({ searchParams }: PageProps) {
  const session = await requireAuth();
  const { seriesId } = await searchParams;

  const [availableTests, completedTestIds] = await Promise.all([
    getTestsForStudent({ seriesId, userId: session.id }),
    getStudentCompletedTestIds(session.id),
  ]);

  return <StudentTestsView tests={availableTests} completedTestIds={completedTestIds} />;
}
