import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { getPreviousYearPaperById, hasStudentAccessToPaper } from "@/lib/data/store";
import { PyqPdfDocument } from "@/components/student/pyq-pdf-document";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lock, ArrowLeft } from "lucide-react";

export default async function ExportQuestionPaperPdfPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireAuth();
  const { id } = await params;
  const paper = await getPreviousYearPaperById(id);

  if (!paper) {
    notFound();
  }

  const hasAccess = await hasStudentAccessToPaper(session.id, paper);
  if (!hasAccess) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-border shadow-md">
          <CardContent className="p-6 text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto">
              <Lock className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-bold">Premium Subscription Required</h2>
              <p className="text-xs text-muted-foreground">
                This Official Previous Year Question Paper ({paper.examName} {paper.year}) with QuickTestWala™ verified solutions is available for paid students.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Link href="/pricing">
                <Button className="w-full text-xs font-semibold">
                  Unlock All PYQ Papers with Subscription
                </Button>
              </Link>
              <Link href="/student/question-papers">
                <Button variant="ghost" className="w-full text-xs gap-1.5">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to Question Papers
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <PyqPdfDocument paper={paper} user={session} />;
}
