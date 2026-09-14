import { notFound } from "next/navigation";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { getPreviousYearPaperById } from "@/lib/data/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, CheckCircle2, Download } from "lucide-react";

export default async function AdminQuestionPaperPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const paper = await getPreviousYearPaperById(id);

  if (!paper) {
    notFound();
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4">
      <div className="flex items-center justify-between gap-3">
        <Link href="/admin/question-papers">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <ArrowLeft className="h-4 w-4" />
            Back to Papers
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Link href={`/student/question-papers/${paper.id}/export`} target="_blank">
            <Button size="sm" className="text-xs gap-1.5 bg-primary hover:bg-primary/90 font-semibold">
              <Download className="h-3.5 w-3.5" />
              Download QuickTestWala™ PDF
            </Button>
          </Link>
          {paper.pdfUrl ? (
            <a href={paper.pdfUrl} target="_blank" rel="noreferrer">
              <Button size="sm" variant="outline" className="text-xs gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Original Uploaded PDF
              </Button>
            </a>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <Badge variant="outline" className="mb-2 uppercase tracking-[0.2em] text-[10px] font-mono">
              {paper.examName} • Year {paper.year}
            </Badge>
            <h1 className="text-2xl font-bold tracking-tight">{paper.title}</h1>
          </div>
          <Badge className="bg-primary text-primary-foreground text-xs font-semibold">
            Admin Preview
          </Badge>
        </div>

        {paper.description && (
          <div className="mt-6 rounded-xl border border-border bg-muted/20 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-1">
              Description & Notes
            </p>
            <p className="text-sm text-muted-foreground">{paper.description}</p>
          </div>
        )}

        <div className="mt-8 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <FileText className="h-4 w-4 text-cyan-500" />
            Questions List ({paper.questions?.length || 0})
          </div>

          {paper.questions?.length ? (
            <div className="space-y-6">
              {paper.questions.map((question: any, index: number) => (
                <div
                  key={`${question.id || index}`}
                  className="rounded-xl border border-border bg-background p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground font-mono">
                      Q{index + 1}
                    </span>
                    <span className="text-xs text-muted-foreground font-medium">{question.subject}</span>
                  </div>
                  <p className="text-sm font-medium leading-7 text-foreground">
                    {question.questionText}
                  </p>

                  {Array.isArray(question.options) && question.options.length > 0 ? (
                    <div className="grid gap-2 sm:grid-cols-2 pt-1">
                      {question.options.map((option: any) => (
                        <div
                          key={option.id || `${question.id}-${option.optionKey}`}
                          className={`rounded-lg border px-3 py-2 text-sm ${
                            option.isCorrect
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-medium"
                              : "border-border bg-muted/20 text-muted-foreground"
                          }`}
                        >
                          <span className="mr-2 font-semibold font-mono">{option.optionKey}.</span>
                          {option.optionText}
                          {option.isCorrect && (
                            <span className="ml-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              (Correct)
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {question.explanation ? (
                    <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                      <div className="mb-1 flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Explanation / Solution
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
