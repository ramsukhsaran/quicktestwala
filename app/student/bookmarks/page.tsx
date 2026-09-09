import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { getBookmarkedQuestions } from "@/lib/data/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bookmark, BookOpen, BookOpenCheck } from "lucide-react";

export default async function StudentBookmarksPage() {
  const session = await requireAuth();
  const bookmarkedQuestions = await getBookmarkedQuestions(session.id);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bookmarked Questions</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Important revision questions saved directly from CBT mock examinations.
          </p>
        </div>
        <Badge variant="outline" className="text-xs font-mono w-fit">
          {bookmarkedQuestions.length} Saved Questions
        </Badge>
      </div>

      {bookmarkedQuestions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center bg-card">
          <Bookmark className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground">No bookmarked questions</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
            During any CBT mock test, click the bookmark icon on any question to save it here for later review.
          </p>
          <Link href="/student/tests" className="inline-block mt-4">
            <Button size="sm" className="text-xs font-semibold gap-1.5">
              <BookOpenCheck className="h-3.5 w-3.5" />
              Practice Mock Tests
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarkedQuestions.map((q) => (
            <Card key={q.id} className="border-border p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-border/80 text-xs">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {q.subject}
                  </Badge>
                  {q.topic && (
                    <>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{q.topic}</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Bookmark className="h-4 w-4 fill-current text-amber-500" />
                  <span className="text-[11px] font-mono">
                    +{q.marks} / -{q.negativeMarks} Marks
                  </span>
                </div>
              </div>

              <p className="text-sm font-medium leading-relaxed">{q.questionText}</p>

              {q.options && q.options.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {q.options.map((opt: any) => (
                    <div
                      key={opt.id}
                      className={`p-2.5 rounded-lg border text-xs flex items-center gap-2.5 ${
                        opt.isCorrect
                          ? "border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 font-medium"
                          : "border-border bg-muted/20 text-foreground"
                      }`}
                    >
                      <span className="h-5 w-5 rounded font-mono font-bold text-[10px] flex items-center justify-center bg-muted">
                        {opt.optionKey}
                      </span>
                      <span>{opt.optionText}</span>
                    </div>
                  ))}
                </div>
              )}

              {q.explanation && (
                <div className="p-3.5 rounded-lg border border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/20 text-xs space-y-1">
                  <span className="font-semibold text-emerald-800 dark:text-emerald-300 block">
                    Explanation & Solution:
                  </span>
                  <p className="text-foreground/90">{q.explanation}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

