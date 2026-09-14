import Link from "next/link";
import { requireAuth } from "@/lib/auth/session";
import { getAllPreviousYearPapersForStudent } from "@/lib/data/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Lock, FileText, Eye, Sparkles, Gift, CheckCircle2 } from "lucide-react";

export default async function StudentQuestionPapersPage() {
  const session = await requireAuth();
  const papers = await getAllPreviousYearPapersForStudent(session.id);

  const unlockedCount = papers.filter((p) => p.isAccessible).length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Previous Year Question Papers</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Download official examination question papers and review step-by-step verified solutions.
          </p>
        </div>

        {papers.length > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-mono py-1 px-3">
              {unlockedCount} of {papers.length} Papers Unlocked
            </Badge>
          </div>
        )}
      </div>

      {papers.length === 0 ? (
        <Card className="border-dashed border-border bg-card">
          <CardContent className="p-12 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h2 className="text-base font-semibold">No Question Papers Available Yet</h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Our faculty is currently uploading authentic shift-wise question papers. Please check back shortly.
            </p>
            <Link href="/student/test-series" className="inline-block mt-4">
              <Button size="sm" className="text-xs font-semibold">
                Explore My Mock Tests
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {papers.map((paper: any) => {
            const isUnlocked = Boolean(paper.isAccessible);
            const isFree = paper.accessType === "FREE";

            return (
              <Card
                key={paper.id}
                className={`overflow-hidden border flex flex-col justify-between transition-all shadow-sm ${
                  isUnlocked
                    ? "border-border bg-card hover:border-foreground/25"
                    : "border-border/80 bg-muted/20 opacity-90"
                }`}
              >
                <div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                      <Badge variant="outline" className="text-[10px] uppercase tracking-[0.2em] font-mono">
                        {paper.examName}
                      </Badge>
                      {isFree ? (
                        <Badge className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold gap-1">
                          <Gift className="h-2.5 w-2.5" /> Free Practice
                        </Badge>
                      ) : isUnlocked ? (
                        <Badge className="bg-emerald-600 text-white text-[10px] font-bold gap-1">
                          <Sparkles className="h-2.5 w-2.5" /> Paid Access
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-500/40 text-[10px] font-bold gap-1">
                          <Lock className="h-2.5 w-2.5" /> Premium Only
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-base font-bold leading-snug line-clamp-2">
                      {paper.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2.5 pt-0 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Exam Year</span>
                      <span className="font-semibold text-foreground font-mono">{paper.year}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Questions Included</span>
                      <span className="font-semibold text-foreground font-mono">{paper.questions?.length || 0} Questions</span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 pt-1 border-t border-border/60">
                      {paper.description || "Official past examination paper with detailed solutions and answer keys."}
                    </p>
                  </CardContent>
                </div>

                <div className="p-4 pt-0">
                  <div className="flex items-center gap-2 pt-3 border-t border-border">
                    {isUnlocked ? (
                      <>
                        <Link href={`/student/question-papers/${paper.id}/export`} className="flex-1">
                          <Button size="sm" variant="outline" className="w-full text-xs h-8 gap-1.5 border-border font-medium hover:border-primary/50">
                            <Download className="h-3.5 w-3.5 text-primary" />
                            Download PDF
                          </Button>
                        </Link>
                        <Link href={`/student/question-papers/${paper.id}`} className="flex-1">
                          <Button size="sm" variant="secondary" className="w-full text-xs h-8 gap-1.5">
                            <Eye className="h-3.5 w-3.5" />
                            Preview
                          </Button>
                        </Link>
                      </>
                    ) : (
                      <Link href="/pricing" className="w-full">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full text-xs h-8 gap-1.5 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10"
                        >
                          <Lock className="h-3.5 w-3.5 text-amber-600" />
                          Unlock with Paid Subscription
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
