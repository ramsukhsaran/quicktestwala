import { notFound } from "next/navigation";
import { requireAuth } from "@/lib/auth/session";
import { getOrCreateTestAttempt } from "@/lib/data/store";
import { CBTEngine } from "@/components/test/cbt-engine";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TestAttemptPage({ params }: PageProps) {
  const { id } = await params;
  const session = await requireAuth();

  const attempt = await getOrCreateTestAttempt(session.id, id);
  if (!attempt) {
    notFound();
  }

  return <CBTEngine attempt={attempt as any} />;
}
