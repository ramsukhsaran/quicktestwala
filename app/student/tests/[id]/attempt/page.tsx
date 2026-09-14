import { notFound, redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { getOrCreateTestAttempt, hasStudentAccessToTest, getTestById } from "@/lib/data/store";
import { CBTEngine } from "@/components/test/cbt-engine";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TestAttemptPage({ params }: PageProps) {
  const { id } = await params;
  const session = await requireAuth();

  const test = await getTestById(id);
  if (!test) {
    notFound();
  }

  const hasAccess = await hasStudentAccessToTest(session.id, id);
  if (!hasAccess) {
    const slug = (test as any).testSeries?.slug;
    redirect(slug ? `/test-series/${slug}?locked=true` : `/test-series?locked=true`);
  }

  const attempt = await getOrCreateTestAttempt(session.id, id);
  if (!attempt) {
    notFound();
  }

  return <CBTEngine attempt={attempt as any} />;
}
