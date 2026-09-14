"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPreviousYearPaperAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import { Loader2, ArrowLeft, UploadCloud, FileText } from "lucide-react";

const sampleQuestions = [
  {
    questionText: "In a class of 40 students, 25% are girls. How many boys are there?",
    questionType: "MCQ",
    subject: "Quantitative Aptitude",
    topic: "Percentages",
    difficulty: "EASY",
    explanation: "25% girls means 75% boys. 75% of 40 = 30 boys.",
    marks: 2,
    negativeMarks: 0.5,
    options: [
      { optionKey: "A", optionText: "10", isCorrect: false },
      { optionKey: "B", optionText: "20", isCorrect: false },
      { optionKey: "C", optionText: "30", isCorrect: true },
      { optionKey: "D", optionText: "40", isCorrect: false },
    ],
  },
  {
    questionText: "The capital of India is?",
    questionType: "MCQ",
    subject: "General Awareness",
    topic: "Geography",
    difficulty: "EASY",
    explanation: "New Delhi is the official national capital territory of India.",
    marks: 2,
    negativeMarks: 0.5,
    options: [
      { optionKey: "A", optionText: "Mumbai", isCorrect: false },
      { optionKey: "B", optionText: "New Delhi", isCorrect: true },
      { optionKey: "C", optionText: "Kolkata", isCorrect: false },
      { optionKey: "D", optionText: "Chennai", isCorrect: false },
    ],
  },
];

interface UploadQuestionPaperFormProps {
  seriesList: any[];
}

export function UploadQuestionPaperForm({ seriesList }: UploadQuestionPaperFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [questionsJson, setQuestionsJson] = React.useState(
    JSON.stringify(sampleQuestions, null, 2)
  );

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      const result = await createPreviousYearPaperAction(formData);

      if (result.error) {
        toast({ title: "Upload Failed", description: result.error, type: "error" });
        setLoading(false);
        return;
      }

      toast({
        title: "Paper Uploaded Successfully",
        description: "The previous year paper and question bank have been synced to the database.",
        type: "success",
      });

      router.push("/admin/question-papers");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Failed to upload question paper.",
        type: "error",
      });
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/question-papers">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Upload Previous Year Question Paper</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Store official exam question papers with questions data, solution explanations, and downloadable PDFs.
          </p>
        </div>
      </div>

      <Card className="border-border shadow-sm">
        <CardHeader className="pb-4 border-b border-border">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <UploadCloud className="h-4 w-4 text-primary" />
            Paper Metadata & Access Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form className="space-y-6" onSubmit={onSubmit}>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="title" className="text-xs font-semibold">
                  Paper Title <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. SSC CGL Tier 1 Official Shift 1 Paper 2025"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="examName" className="text-xs font-semibold">
                  Exam Vertical <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="examName"
                  name="examName"
                  placeholder="e.g. SSC CGL, RRB NTPC, IBPS PO"
                  required
                  className="h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="year" className="text-xs font-semibold">
                  Examination Year <span className="text-rose-500">*</span>
                </Label>
                <Input
                  id="year"
                  name="year"
                  placeholder="e.g. 2025"
                  required
                  className="h-9 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="accessType" className="text-xs font-semibold">
                  Student Access Level
                </Label>
                <select
                  id="accessType"
                  name="accessType"
                  defaultValue="PAID_ANY"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="PAID_ANY">All Paid Students (Any Paid Test Series or Pro)</option>
                  <option value="SERIES_SPECIFIC">Linked Specific Series Only</option>
                  <option value="FREE">Free Practice (All Registered Students)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="testSeriesId" className="text-xs font-semibold">
                  Linked Test Series (Optional)
                </Label>
                <select
                  id="testSeriesId"
                  name="testSeriesId"
                  defaultValue=""
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">-- No specific series (Global) --</option>
                  {seriesList.map((s) => (
                    <option key={s.id} value={s.id}>
                      [{s.examName}] {s.title} ({s.price === 0 ? "Free" : `₹${s.price}`})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-semibold">
                Paper Description & Instructions
              </Label>
              <Textarea
                id="description"
                name="description"
                rows={2}
                placeholder="Include information on exam shift, syllabus covered, negative marking rules..."
                className="text-xs"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 p-4 rounded-xl border border-border bg-muted/20">
              <div className="space-y-1.5">
                <Label htmlFor="pdfFile" className="text-xs font-semibold">
                  Upload PDF File
                </Label>
                <Input
                  id="pdfFile"
                  name="pdfFile"
                  type="file"
                  accept="application/pdf"
                  className="text-xs h-9 file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-primary file:text-primary-foreground"
                />
                <p className="text-[11px] text-muted-foreground">
                  Upload official question paper PDF directly for student download.
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="pdfUrl" className="text-xs font-semibold">
                  Or External PDF URL (Optional)
                </Label>
                <Input
                  id="pdfUrl"
                  name="pdfUrl"
                  placeholder="https://example.com/ssc-cgl-2025.pdf"
                  className="h-9 text-xs"
                />
                <p className="text-[11px] text-muted-foreground">
                  Link an external Google Drive / S3 PDF URL if not uploading file directly.
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="questionsJson" className="text-xs font-semibold flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  Question Bank JSON Data
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuestionsJson(JSON.stringify(sampleQuestions, null, 2))}
                  className="text-[11px] h-6 px-2 text-muted-foreground hover:text-foreground"
                >
                  Reset to Sample
                </Button>
              </div>
              <Textarea
                id="questionsJson"
                name="questionsJson"
                value={questionsJson}
                onChange={(e) => setQuestionsJson(e.target.value)}
                className="min-h-[260px] font-mono text-xs bg-muted/10 leading-relaxed"
                placeholder="Paste JSON array of questions..."
                required
              />
              <p className="text-[11px] text-muted-foreground">
                JSON format: Array of question objects with `questionText`, `options`, `explanation`, `marks`, `subject`.
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-border">
              <Link href="/admin/question-papers">
                <Button type="button" variant="outline" size="sm" className="h-9 text-xs">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading} size="sm" className="h-9 text-xs font-semibold min-w-[150px]">
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Uploading Paper...
                  </>
                ) : (
                  "Save & Sync Paper"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
