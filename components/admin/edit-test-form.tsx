"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Calculator, Sparkles, Check, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { updateTestAction } from "@/actions/admin";

export const buildInstructionsText = (marksPerQuestion: number, negativeMarkingRate: number) => {
  return [
    "1. The test comprises multiple sections.",
    `2. Each correct answer carries +${marksPerQuestion} marks.`,
    `3. There is a penalty of ${negativeMarkingRate} marks for each incorrect answer.`,
    "4. No marks are deducted for unattempted questions.",
    "5. The countdown timer in the top-right corner shows remaining time. Once the timer reaches zero, the test will automatically submit.",
  ].join("\n");
};

export function EditTestForm({ test }: { test: any }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  // Question count determination
  const linkedQuestionsCount =
    test.testQuestions && Array.isArray(test.testQuestions)
      ? test.testQuestions.length
      : test.questionIds && Array.isArray(test.questionIds)
      ? test.questionIds.length
      : 0;

  const initialQuestionCount =
    linkedQuestionsCount > 0
      ? linkedQuestionsCount
      : test.totalMarks && test.marksPerQuestion && test.marksPerQuestion > 0
      ? Math.round(test.totalMarks / test.marksPerQuestion)
      : 100;

  const initialMarksPerQ =
    test.marksPerQuestion !== undefined && test.marksPerQuestion !== null
      ? Number(test.marksPerQuestion)
      : 2.0;

  const initialTotalMarks =
    linkedQuestionsCount > 0 && initialMarksPerQ > 0
      ? Math.round(linkedQuestionsCount * initialMarksPerQ * 100) / 100
      : test.totalMarks !== undefined && test.totalMarks !== null
      ? Number(test.totalMarks)
      : 100;

  // Controlled form states (support string | number to allow seamless user typing)
  const [questionCount, setQuestionCount] = React.useState<number | string>(initialQuestionCount);
  const [marksPerQuestion, setMarksPerQuestion] = React.useState<number | string>(initialMarksPerQ);
  const [totalMarks, setTotalMarks] = React.useState<number | string>(initialTotalMarks);
  const [negativeMarkingRate, setNegativeMarkingRate] = React.useState<number | string>(
    test.negativeMarkingRate !== undefined && test.negativeMarkingRate !== null
      ? Number(test.negativeMarkingRate)
      : 0.5
  );
  const [passingMarks, setPassingMarks] = React.useState<number | string>(
    test.passingMarks !== undefined && test.passingMarks !== null
      ? Number(test.passingMarks)
      : Math.round(initialTotalMarks * 0.4 * 10) / 10
  );
  const [autoSync, setAutoSync] = React.useState<boolean>(true);
  const [penaltyRatio, setPenaltyRatio] = React.useState<string>("0.25");
  const [instructionText, setInstructionText] = React.useState<string>(
    test.instructions ||
      buildInstructionsText(
        Number(test.marksPerQuestion ?? 2.0),
        Number(test.negativeMarkingRate ?? 0.5)
      )
  );

  // Handlers for dynamic recalculations
  const handleMarksPerQuestionChange = (rawVal: string) => {
    setMarksPerQuestion(rawVal);
    const num = parseFloat(rawVal);
    if (isNaN(num)) return;

    const qCount = typeof questionCount === "number" ? questionCount : parseFloat(questionCount) || 0;

    let nextTotal = typeof totalMarks === "number" ? totalMarks : parseFloat(totalMarks) || 0;
    if (autoSync && qCount > 0) {
      nextTotal = Math.round(num * qCount * 100) / 100;
      setTotalMarks(nextTotal);

      // Keep passing marks at 40% ratio
      setPassingMarks(Math.round(nextTotal * 0.4 * 10) / 10);
    }

    let nextPenalty = typeof negativeMarkingRate === "number" ? negativeMarkingRate : parseFloat(negativeMarkingRate) || 0;
    if (penaltyRatio !== "custom") {
      const ratio = parseFloat(penaltyRatio);
      nextPenalty = Math.round(num * ratio * 1000) / 1000;
      setNegativeMarkingRate(nextPenalty);
    }

    setInstructionText(buildInstructionsText(num, nextPenalty));
  };

  const handleTotalMarksChange = (rawVal: string) => {
    setTotalMarks(rawVal);
    const num = parseFloat(rawVal);
    if (isNaN(num)) return;

    const qCount = typeof questionCount === "number" ? questionCount : parseFloat(questionCount) || 0;

    if (autoSync && qCount > 0) {
      const nextPerQ = Math.round((num / qCount) * 100) / 100;
      setMarksPerQuestion(nextPerQ);

      let nextPenalty = typeof negativeMarkingRate === "number" ? negativeMarkingRate : parseFloat(negativeMarkingRate) || 0;
      if (penaltyRatio !== "custom") {
        const ratio = parseFloat(penaltyRatio);
        nextPenalty = Math.round(nextPerQ * ratio * 1000) / 1000;
        setNegativeMarkingRate(nextPenalty);
      }

      setInstructionText(buildInstructionsText(nextPerQ, nextPenalty));
    }

    // Keep passing marks at 40% ratio
    setPassingMarks(Math.round(num * 0.4 * 10) / 10);
  };

  const handleQuestionCountChange = (rawVal: string) => {
    setQuestionCount(rawVal);
    const count = parseInt(rawVal, 10);
    if (isNaN(count)) return;

    const perQ = typeof marksPerQuestion === "number" ? marksPerQuestion : parseFloat(marksPerQuestion) || 0;

    if (autoSync && count > 0) {
      const nextTotal = Math.round(perQ * count * 100) / 100;
      setTotalMarks(nextTotal);
      setPassingMarks(Math.round(nextTotal * 0.4 * 10) / 10);
    }
  };

  const handlePenaltyPreset = (ratioStr: string) => {
    setPenaltyRatio(ratioStr);
    const perQ = typeof marksPerQuestion === "number" ? marksPerQuestion : parseFloat(marksPerQuestion) || 0;
    if (ratioStr !== "custom") {
      const ratio = parseFloat(ratioStr);
      const nextPenalty = Math.round(perQ * ratio * 1000) / 1000;
      setNegativeMarkingRate(nextPenalty);
      setInstructionText(buildInstructionsText(perQ, nextPenalty));
    }
  };

  const handleManualPenaltyChange = (rawVal: string) => {
    setNegativeMarkingRate(rawVal);
    setPenaltyRatio("custom");
    const num = parseFloat(rawVal);
    const perQ = typeof marksPerQuestion === "number" ? marksPerQuestion : parseFloat(marksPerQuestion) || 0;
    if (!isNaN(num)) {
      setInstructionText(buildInstructionsText(perQ, num));
    }
  };

  const syncFormulaNow = () => {
    const qCount = typeof questionCount === "number" ? questionCount : parseFloat(questionCount) || 0;
    const perQ = typeof marksPerQuestion === "number" ? marksPerQuestion : parseFloat(marksPerQuestion) || 0;
    const nextTotal = Math.round(perQ * qCount * 100) / 100;
    setTotalMarks(nextTotal);
    setPassingMarks(Math.round(nextTotal * 0.4 * 10) / 10);
    const nextPenalty = Math.round(perQ * 0.25 * 1000) / 1000;
    setNegativeMarkingRate(nextPenalty);
    setPenaltyRatio("0.25");
    setInstructionText(buildInstructionsText(perQ, nextPenalty));
    toast({
      title: "Formula Synchronized",
      description: `Total Marks set to ${nextTotal} (${qCount} questions × ${perQ} marks).`,
      type: "success",
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const qCount = typeof questionCount === "number" ? questionCount : parseFloat(questionCount) || 0;
    const perQ = typeof marksPerQuestion === "number" ? marksPerQuestion : parseFloat(marksPerQuestion) || 0;
    const finalTotal =
      autoSync && qCount > 0 && perQ > 0
        ? Math.round(qCount * perQ * 100) / 100
        : typeof totalMarks === "number"
        ? totalMarks
        : parseFloat(totalMarks) || 0;

    const formData = new FormData(e.currentTarget);
    formData.set("id", test.id);
    formData.set("totalMarks", finalTotal.toString());
    formData.set("marksPerQuestion", perQ.toString());
    formData.set("negativeMarkingRate", (negativeMarkingRate ?? 0.5).toString());
    formData.set("passingMarks", (passingMarks ?? 40).toString());
    formData.set("instructions", instructionText);

    const res = await updateTestAction(formData);

    if (res.error) {
      toast({ title: "Error", description: res.error, type: "error" });
      setLoading(false);
      return;
    }

    toast({
      title: "Test Updated",
      description: "Mock test and all linked questions were updated successfully.",
      type: "success",
    });

    router.push("/admin/tests");
  };

  return (
    <Card className="border-border max-w-3xl mx-auto">
      <CardHeader className="p-6 pb-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin/tests">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <CardTitle className="text-lg font-bold">Edit Mock Test</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Dynamic scoring, penalty calibration, and test metadata.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/admin/tests/${test.id}/questions`}>
              <Button type="button" size="sm" variant="secondary" className="h-8 text-xs font-semibold gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                Manage Questions ({linkedQuestionsCount})
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="hidden" name="id" value={test.id} />

          {/* DYNAMIC MARKING FORMULA BANNER */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <Calculator className="h-4 w-4" />
                <span>Dynamic Marking Calculation</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setAutoSync(!autoSync)}
                  className={`h-7 text-[11px] px-2.5 font-medium ${
                    autoSync
                      ? "border-primary text-primary bg-primary/10"
                      : "text-muted-foreground"
                  }`}
                >
                  {autoSync ? (
                    <>
                      <Check className="h-3 w-3 mr-1" /> Auto-Sync Active
                    </>
                  ) : (
                    "Auto-Sync Paused"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={syncFormulaNow}
                  className="h-7 text-[11px] px-2 text-muted-foreground hover:text-foreground"
                  title="Recalculate now"
                >
                  <RefreshCw className="h-3 w-3 mr-1" /> Recalculate
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center pt-1 border-t border-primary/10">
              <div className="bg-background/80 p-2 rounded-lg border border-border/60">
                <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                  Questions
                </span>
                <span className="font-bold text-sm text-foreground">{questionCount}</span>
              </div>
              <div className="bg-background/80 p-2 rounded-lg border border-border/60">
                <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                  Per Question
                </span>
                <span className="font-bold text-sm text-primary">+{marksPerQuestion} Marks</span>
              </div>
              <div className="bg-background/80 p-2 rounded-lg border border-border/60">
                <span className="text-[10px] uppercase font-mono text-muted-foreground block">
                  Total Marks
                </span>
                <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                  {totalMarks} Marks
                </span>
              </div>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Formula:{" "}
              <span className="font-mono font-medium text-foreground">
                {questionCount} questions × {marksPerQuestion} marks = {totalMarks} Total Marks
              </span>
              . Updating &quot;Per Question&quot; automatically recalculates Total Marks, Passing Marks,
              and negative marking penalties.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="title">Test Name / Code</Label>
            <Input
              id="title"
              name="title"
              defaultValue={test.title}
              required
              className="h-10 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                defaultValue={test.slug}
                required
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">Publishing Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={test.status || "PUBLISHED"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="DRAFT">DRAFT</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={2}
              defaultValue={test.description || ""}
              className="text-sm"
            />
          </div>

          {/* DYNAMIC MARKING CONTROLS */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Scoring & Dynamic Marking Grid
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {/* PER QUESTION INPUT (DYNAMIC, step="any", min="0") */}
              <div className="space-y-1.5">
                <Label
                  htmlFor="marksPerQuestion"
                  className="flex items-center gap-1 text-primary font-semibold"
                >
                  <Sparkles className="h-3 w-3" />
                  Per Question
                </Label>
                <Input
                  id="marksPerQuestion"
                  name="marksPerQuestion"
                  type="number"
                  step="any"
                  min="0"
                  value={marksPerQuestion}
                  onChange={(e) => handleMarksPerQuestionChange(e.target.value)}
                  required
                  className="h-10 text-sm border-primary/50 focus:border-primary font-bold"
                />
              </div>

              {/* TOTAL QUESTIONS INPUT */}
              <div className="space-y-1.5">
                <Label htmlFor="questionCount">Total Questions</Label>
                <Input
                  id="questionCount"
                  type="number"
                  step="1"
                  min="1"
                  value={questionCount}
                  onChange={(e) => handleQuestionCountChange(e.target.value)}
                  required
                  className="h-10 text-sm"
                />
              </div>

              {/* TOTAL MARKS INPUT (step="any", min="0") */}
              <div className="space-y-1.5">
                <Label htmlFor="totalMarks">Total Marks</Label>
                <Input
                  id="totalMarks"
                  name="totalMarks"
                  type="number"
                  step="any"
                  min="0"
                  value={totalMarks}
                  onChange={(e) => handleTotalMarksChange(e.target.value)}
                  required
                  className="h-10 text-sm font-semibold"
                />
              </div>

              {/* PASSING MARKS INPUT (step="any", min="0") */}
              <div className="space-y-1.5">
                <Label htmlFor="passingMarks">Passing Marks</Label>
                <Input
                  id="passingMarks"
                  name="passingMarks"
                  type="number"
                  step="any"
                  min="0"
                  value={passingMarks}
                  onChange={(e) => setPassingMarks(e.target.value)}
                  required
                  className="h-10 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {/* PENALTY / NEGATIVE MARKING WITH PRESETS (step="any", min="0") */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="negativeMarkingRate">Penalty Mark (Incorrect Answer)</Label>
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => handlePenaltyPreset("0.25")}
                      className={`px-1.5 py-0.5 rounded border transition-colors ${
                        penaltyRatio === "0.25"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      1/4th (25%)
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePenaltyPreset("0.333")}
                      className={`px-1.5 py-0.5 rounded border transition-colors ${
                        penaltyRatio === "0.333"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      1/3rd (33%)
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePenaltyPreset("0.5")}
                      className={`px-1.5 py-0.5 rounded border transition-colors ${
                        penaltyRatio === "0.5"
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      1/2 (50%)
                    </button>
                  </div>
                </div>
                <Input
                  id="negativeMarkingRate"
                  name="negativeMarkingRate"
                  type="number"
                  step="any"
                  min="0"
                  value={negativeMarkingRate}
                  onChange={(e) => handleManualPenaltyChange(e.target.value)}
                  required
                  className="h-10 text-sm font-mono text-rose-600 dark:text-rose-400"
                />
              </div>

              {/* TEST DURATION */}
              <div className="space-y-2">
                <Label htmlFor="durationMinutes">Duration (Minutes)</Label>
                <Input
                  id="durationMinutes"
                  name="durationMinutes"
                  type="number"
                  step="1"
                  min="1"
                  defaultValue={test.durationMinutes}
                  required
                  className="h-10 text-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* DYNAMIC TEST INSTRUCTIONS */}
          <div className="space-y-1.5 pt-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="instructions">Test Instructions (Auto-Refreshed)</Label>
              <span className="text-[11px] text-muted-foreground">
                Dynamically synced with marking configuration
              </span>
            </div>
            <Textarea
              id="instructions"
              name="instructions"
              rows={5}
              value={instructionText}
              onChange={(e) => setInstructionText(e.target.value)}
              className="text-xs font-mono leading-relaxed"
            />
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-border">
            <Link href="/admin/tests">
              <Button type="button" variant="outline" className="text-xs">
                Cancel
              </Button>
            </Link>

            <Button type="submit" disabled={loading} className="text-xs font-semibold gap-1.5">
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Updating Test & Questions...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
