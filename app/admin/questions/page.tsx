import Link from "next/link";
import { getAllQuestions } from "@/lib/data/store";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, UploadCloud, HelpCircle } from "lucide-react";

export default async function AdminQuestionsPage() {
  const questions = await getAllQuestions();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Question Bank</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Master repository of verified examination questions across all competitive verticals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/questions/import">
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 border-border">
              <UploadCloud className="h-3.5 w-3.5" />
              Bulk CSV Import
            </Button>
          </Link>
          <Link href="/admin/questions/create">
            <Button size="sm" className="h-8 text-xs font-semibold gap-1.5 shadow-sm">
              <Plus className="h-3.5 w-3.5" />
              Add Question
            </Button>
          </Link>
        </div>
      </div>

      <Card className="border-border">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/30 text-muted-foreground uppercase font-semibold">
                <th className="py-3.5 px-6">Question Text</th>
                <th className="py-3.5 px-4">Subject & Topic</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Difficulty</th>
                <th className="py-3.5 px-4">Marks</th>
                <th className="py-3.5 px-6 text-right">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {questions.map((q) => (
                <tr key={q.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-4 px-6 max-w-md font-medium text-foreground">
                    <p className="line-clamp-2 leading-relaxed">{q.questionText}</p>
                  </td>
                  <td className="py-4 px-4">
                    <span className="font-semibold text-foreground block">{q.subject}</span>
                    <span className="text-muted-foreground text-[11px] block">{q.topic}</span>
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {q.questionType}
                    </Badge>
                  </td>
                  <td className="py-4 px-4">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-mono ${
                        q.difficulty === "EASY"
                          ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                          : q.difficulty === "HARD"
                          ? "border-rose-500 text-rose-600 dark:text-rose-400"
                          : "border-amber-500 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {q.difficulty}
                    </Badge>
                  </td>
                  <td className="py-4 px-4 font-mono font-bold text-foreground">
                    +{q.marks} / -{q.negativeMarks}
                  </td>
                  <td className="py-4 px-6 text-right font-mono text-muted-foreground">
                    {q.options?.length || 0} Options
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
