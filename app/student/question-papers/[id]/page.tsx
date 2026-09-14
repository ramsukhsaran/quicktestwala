import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { getPreviousYearPaperById, hasStudentAccessToPaper } from "@/lib/data/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, CheckCircle2, Download } from "lucide-react";
import { QuestionFigure } from "@/components/ui/question-figure";

export default async function StudentQuestionPaperPreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireAuth();
  const { id } = await params;
  const paper = await getPreviousYearPaperById(id);

  if (!paper) {
    notFound();
  }

  const hasAccess = await hasStudentAccessToPaper(session.id, paper);
  if (!hasAccess) {
    redirect("/student/question-papers?locked=true");
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4">
      <div className="flex items-center justify-between gap-3">
        <Link href="/student/question-papers">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/student/question-papers/${paper.id}/export`}>
            <Button size="sm" className="gap-1.5 font-semibold text-xs bg-primary hover:bg-primary/90">
              <Download className="h-3.5 w-3.5" />
              Download QuickTestWala™ PDF
            </Button>
          </Link>
          {paper.pdfUrl ? (
            <a href={paper.pdfUrl} target="_blank" rel="noreferrer">
              <Button size="sm" variant="outline" className="text-xs">
                Original PDF
              </Button>
            </a>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <Badge variant="outline" className="mb-2 uppercase tracking-[0.2em] text-[10px]">{paper.examName}</Badge>
            <h1 className="text-2xl font-bold tracking-tight">{paper.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">{paper.year}</p>
          </div>
          <Badge className="bg-emerald-600 text-white">Premium Access</Badge>
        </div>

        <div className="mt-6 rounded-xl border border-border bg-muted/20 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-2">Exam Notes</p>
          <p className="text-sm text-muted-foreground">{paper.description || "Previous year practice paper for targeted revision and exam preparation."}</p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <FileText className="h-4 w-4 text-cyan-500" />
            Question Preview
          </div>

          {paper.questions?.length ? (
            <div className="space-y-6">
              {paper.questions.map((question: any, index: number) => (
                <div key={`${question.id || index}`} className="rounded-xl border border-border bg-background p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Q{index + 1}
                    </span>
                    <span className="text-xs text-muted-foreground">{question.subject}</span>
                  </div>
                  <p className="text-sm font-medium leading-7 text-foreground">{question.questionText}</p>
                  <QuestionFigure imageUrl={(question as any).imageUrl} questionText={question.questionText} />

                  {Array.isArray(question.options) && question.options.length > 0 ? (
                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      {question.options.map((option: any) => (
                        <div key={option.id || `${question.id}-${option.optionKey}`} className="rounded-lg border border-border bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                          <span className="mr-2 font-semibold text-foreground">{option.optionKey}.</span>
                          {option.optionText}
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {question.explanation ? (
                    <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
                      <div className="mb-1 flex items-center gap-2 font-semibold">
                        <CheckCircle2 className="h-4 w-4" />
                        Solution
                      </div>
                      <p>{question.explanation}</p>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No questions available for preview.</p>
          )}
        </div>
      </div>
    </div>
  );
}
