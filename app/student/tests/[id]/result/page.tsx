import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { getAttemptResult } from "@/lib/data/store";
import { ResultView } from "@/components/test/result-view";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ attemptId?: string }>;
}

export default async function TestResultPage({ params, searchParams }: PageProps) {
  await requireAuth();
  const { id } = await params;
  const { attemptId } = await searchParams;

  if (!attemptId) {
    notFound();
  }

  const attempt = await getAttemptResult(attemptId);
  if (!attempt) {
    notFound();
  }

  return <ResultView attempt={attempt} />;
}
