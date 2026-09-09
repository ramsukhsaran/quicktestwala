import { requireAuth } from "@/lib/auth/session";
import { INITIAL_QUESTIONS } from "@/lib/data/initial-data";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bookmark, BookOpen } from "lucide-react";

export default async function StudentBookmarksPage() {
  await requireAuth();
  // Sample bookmarked questions for revision
  const bookmarkedQuestions = INITIAL_QUESTIONS.slice(0, 3);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Bookmarked Questions</h1>
        <p className="text-xs text-muted-foreground mt-1">
          High-difficulty and revision questions saved during CBT mock attempts.
        </p>
      </div>

      <div className="space-y-4">
        {bookmarkedQuestions.map((q, idx) => (
          <Card key={q.id} className="border-border p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/80 text-xs">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] font-mono">
                  {q.subject}
                </Badge>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground">{q.topic}</span>
              </div>
              <div className="flex items-center gap-2">
                <Bookmark className="h-4 w-4 fill-current text-amber-500" />
                <span className="text-[11px] font-mono">+{q.marks} / -{q.negativeMarks}</span>
              </div>
            </div>

            <p className="text-sm font-medium leading-relaxed">
              {q.questionText}
            </p>

            {q.explanation && (
              <div className="p-3.5 rounded-lg border border-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/20 text-xs space-y-1">
                <span className="font-semibold text-emerald-800 dark:text-emerald-300 block">
                  Quick Explanation Key:
                </span>
                <p className="text-foreground/90">{q.explanation}</p>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
