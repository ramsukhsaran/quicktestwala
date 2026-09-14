import Link from "next/link";
import { requireAdmin } from "@/lib/auth/session";
import { listPreviousYearPapers } from "@/lib/data/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PaperActions } from "@/components/admin/paper-actions";
import { FileText, Plus, ShieldCheck, Gift, Lock } from "lucide-react";

export default async function AdminQuestionPapersPage() {
  await requireAdmin();
  const papers = await listPreviousYearPapers();

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Previous Year Question Papers</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Upload and manage authentic PYQ papers for SSC, RRB, UPSC, Banking, and State examinations.
          </p>
        </div>
        <Link href="/admin/question-papers/upload">
          <Button size="sm" className="h-8 text-xs gap-1.5 shadow-sm font-semibold">
            <Plus className="h-3.5 w-3.5" />
            Upload Paper
          </Button>
        </Link>
      </div>

      {papers.length === 0 ? (
        <Card className="border-dashed border-border bg-card">
          <CardContent className="p-12 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h2 className="text-base font-semibold">No papers uploaded yet</h2>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Upload official previous year question papers with answer keys, solutions, and downloadable PDFs.
            </p>
            <Link href="/admin/question-papers/upload" className="inline-block mt-4">
              <Button size="sm" className="text-xs font-semibold">
                Upload First Paper
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {papers.map((paper: any) => {
            const isFree = paper.accessType === "FREE";
            const isSeriesSpecific = paper.accessType === "SERIES_SPECIFIC";

            return (
              <Card key={paper.id} className="overflow-hidden border-border flex flex-col justify-between hover:border-foreground/25 transition-all shadow-sm">
                <div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                      <Badge variant="outline" className="text-[10px] uppercase tracking-[0.2em] font-mono">
                        {paper.examName}
                      </Badge>
                      {isFree ? (
                        <Badge className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold gap-1">
                          <Gift className="h-2.5 w-2.5" /> Free Access
                        </Badge>
                      ) : isSeriesSpecific ? (
                        <Badge variant="outline" className="text-indigo-600 border-indigo-500/40 text-[10px] font-bold gap-1">
                          <Lock className="h-2.5 w-2.5" /> Series Specific
                        </Badge>
                      ) : (
                        <Badge className="bg-purple-600/15 text-purple-700 dark:text-purple-300 text-[10px] font-bold gap-1">
                          <ShieldCheck className="h-2.5 w-2.5" /> All Paid Students
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
                      <span>Questions Uploaded</span>
                      <span className="font-semibold text-foreground font-mono">{paper.questions?.length || 0} Questions</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Downloadable PDF</span>
                      <span className="font-semibold text-foreground font-mono">
                        {paper.pdfUrl ? "Available" : "Pending"}
                      </span>
                    </div>
                    {paper.description && (
                      <p className="text-[11px] text-muted-foreground line-clamp-2 pt-1 border-t border-border/60">
                        {paper.description}
                      </p>
                    )}
                  </CardContent>
                </div>

                <div className="p-4 pt-0">
                  <PaperActions paperId={paper.id} pdfUrl={paper.pdfUrl} />
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
