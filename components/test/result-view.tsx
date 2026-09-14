"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  Target,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Bookmark,
  ChevronRight,
  ChevronLeft,
  Download,
} from "lucide-react";
import { formatSecondsToTime } from "@/lib/utils";
import { QuestionFigure } from "@/components/ui/question-figure";
import { cleanQuestionTextWithFigure } from "@/lib/utils/figure";

interface ResultViewProps {
  attempt: any;
}

export function ResultView({ attempt }: ResultViewProps) {
  const test = attempt.test;
  const testQuestions = test.testQuestions || [];
  const [selectedQIdx, setSelectedQIdx] = React.useState(0);
  const [filterMode, setFilterMode] = React.useState<"ALL" | "CORRECT" | "INCORRECT" | "UNANSWERED">("ALL");

  const currentTQ = testQuestions[selectedQIdx];
  const currentQ = currentTQ?.question;
  const perQuestionMarks = Number(test?.marksPerQuestion ?? currentQ?.marks ?? 0);
  const perQuestionPenalty = Number(test?.negativeMarkingRate ?? currentQ?.negativeMarks ?? 0);

  // Process answers
  const answersMap = React.useMemo(() => {
    const map: Record<string, any> = {};
    if (Array.isArray(attempt.answers)) {
      attempt.answers.forEach((a: any) => {
        let optIds: string[] = [];
        if (a.selectedOptionIds) {
          try {
            optIds = JSON.parse(a.selectedOptionIds);
          } catch {
            optIds = [];
          }
        }
        map[a.questionId] = {
          selectedOptionIds: optIds,
          numericalAnswer: a.numericalAnswer || "",
        };
      });
    }
    return map;
  }, [attempt.answers]);

  const getQuestionStatus = (q: any) => {
    const ans = answersMap[q.id];
    if (!ans) return "UNANSWERED";

    if (q.questionType === "NUMERICAL") {
      if (!ans.numericalAnswer || !ans.numericalAnswer.trim()) return "UNANSWERED";
      return ans.numericalAnswer.trim() === q.correctNumericalAnswer?.trim()
        ? "CORRECT"
        : "INCORRECT";
    }

    if (!ans.selectedOptionIds || ans.selectedOptionIds.length === 0) return "UNANSWERED";

    const correctOpts = (q.options || []).filter((o: any) => o.isCorrect).map((o: any) => o.id);
    const isCorrect =
      ans.selectedOptionIds.length === correctOpts.length &&
      ans.selectedOptionIds.every((id: string) => correctOpts.includes(id));

    return isCorrect ? "CORRECT" : "INCORRECT";
  };

  const filteredQuestions = testQuestions.filter((tq: any) => {
    if (filterMode === "ALL") return true;
    return getQuestionStatus(tq.question) === filterMode;
  });

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* -------------------------------------------------------------
          TOP SCORECARD
      ------------------------------------------------------------- */}
      <div className="p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/80 pb-6">
          <div>
            <Badge variant="outline" className="text-[10px] font-mono uppercase mb-1">
              Official CBT Scorecard
            </Badge>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {test.title}
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Attempt completed • Result finalized
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link href={`/student/tests/${test.id}/export`} target="_blank">
              <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 border-border font-semibold shadow-xs">
                <Download className="h-3.5 w-3.5 text-primary" />
                Download PDF Paper
              </Button>
            </Link>
            <Link href={`/student/tests/${test.id}/instructions`}>
              <Button variant="outline" size="sm" className="h-9 text-xs gap-1.5 border-border">
                <RotateCcw className="h-3.5 w-3.5" />
                Retake Test
              </Button>
            </Link>
            <Link href="/student/dashboard">
              <Button size="sm" className="h-9 text-xs font-semibold">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Primary Metric Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          <div className="p-4 rounded-xl border bg-muted/20 text-center">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Score</span>
            <p className="text-2xl font-black font-mono text-foreground mt-1">
              {attempt.score}
              <span className="text-xs font-normal text-muted-foreground">/{test.totalMarks}</span>
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-muted/20 text-center">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Accuracy</span>
            <p className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              {attempt.accuracy}%
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-muted/20 text-center">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Correct</span>
            <p className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1">
              {attempt.correctAnswersCount}
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-muted/20 text-center">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Incorrect</span>
            <p className="text-2xl font-black font-mono text-rose-600 dark:text-rose-400 mt-1">
              {attempt.incorrectAnswersCount}
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-muted/20 text-center">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Unanswered</span>
            <p className="text-2xl font-black font-mono text-muted-foreground mt-1">
              {attempt.unansweredCount}
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-muted/20 text-center">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Est. Rank</span>
            <p className="text-2xl font-black font-mono text-amber-500 mt-1">
              Top 8%
            </p>
          </div>

          <div className="p-4 rounded-xl border bg-muted/20 text-center col-span-2 sm:col-span-1">
            <span className="text-[11px] font-bold text-muted-foreground uppercase">Time Taken</span>
            <p className="text-2xl font-black font-mono text-foreground mt-1">
              {formatSecondsToTime(attempt.timeTakenSeconds)}
            </p>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          DETAILED SOLUTIONS & STEP-BY-STEP REVIEW
      ------------------------------------------------------------- */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Question-by-Question Solution Review</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Review verified explanations, mathematical formulas, and official reasoning.
            </p>
          </div>

          {/* Solution Filters */}
          <div className="flex items-center gap-1.5 p-1 rounded-lg border border-border bg-card text-xs">
            <button
              onClick={() => setFilterMode("ALL")}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterMode === "ALL"
                  ? "bg-foreground text-background font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({testQuestions.length})
            </button>
            <button
              onClick={() => setFilterMode("CORRECT")}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterMode === "CORRECT"
                  ? "bg-emerald-600 text-white font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Correct ({attempt.correctAnswersCount})
            </button>
            <button
              onClick={() => setFilterMode("INCORRECT")}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterMode === "INCORRECT"
                  ? "bg-rose-600 text-white font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Incorrect ({attempt.incorrectAnswersCount})
            </button>
            <button
              onClick={() => setFilterMode("UNANSWERED")}
              className={`px-3 py-1 rounded-md transition-colors ${
                filterMode === "UNANSWERED"
                  ? "bg-muted text-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Skipped ({attempt.unansweredCount})
            </button>
          </div>
        </div>

        {/* Question Review Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Question + Solution Box */}
          <div className="lg:col-span-2 space-y-6">
            {currentQ ? (
              <Card className="border-border p-6 space-y-6">
                {/* Question Status Header */}
                <div className="flex items-center justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">
                      Question {selectedQIdx + 1} of {testQuestions.length}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      {currentQ.subject}
                    </Badge>
                  </div>

                  <div>
                    {getQuestionStatus(currentQ) === "CORRECT" && (
                      <Badge className="bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-400 text-xs font-semibold gap-1">
                        <CheckCircle2 className="h-3 w-3" /> Correct (+{perQuestionMarks})
                      </Badge>
                    )}
                    {getQuestionStatus(currentQ) === "INCORRECT" && (
                      <Badge className="bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-400 text-xs font-semibold gap-1">
                        <XCircle className="h-3 w-3" /> Incorrect (-{perQuestionPenalty})
                      </Badge>
                    )}
                    {getQuestionStatus(currentQ) === "UNANSWERED" && (
                      <Badge variant="outline" className="text-xs text-muted-foreground gap-1">
                        <AlertCircle className="h-3 w-3" /> Not Attempted (0)
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Question Content */}
                <div className="text-sm font-medium text-foreground leading-relaxed whitespace-pre-line">
                  {cleanQuestionTextWithFigure(currentQ.questionText) || currentQ.questionText}
                </div>

                {/* Question Figure / Diagram */}
                <QuestionFigure
                  imageUrl={currentQ.imageUrl}
                  questionText={currentQ.questionText}
                  caption={`Question ${currentIdx + 1} Figure`}
                />

                {/* Options List with Color Highlights */}
                {currentQ.questionType === "NUMERICAL" ? (
                  <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-2 text-xs">
                    <div>
                      <span className="text-muted-foreground block">Your Answer:</span>
                      <span className="font-mono font-bold text-foreground">
                        {answersMap[currentQ.id]?.numericalAnswer || "No answer entered"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Correct Answer:</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {currentQ.correctNumericalAnswer}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5 pt-2">
                    {currentQ.options?.map((opt: any) => {
                      const isUserSelected = answersMap[currentQ.id]?.selectedOptionIds.includes(
                        opt.id
                      );
                      const isCorrect = opt.isCorrect;

                      let borderClass = "border-border bg-card";
                      let indicatorClass = "border-muted-foreground/40 text-muted-foreground";

                      if (isCorrect) {
                        borderClass = "border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 font-semibold";
                        indicatorClass = "border-emerald-500 bg-emerald-500 text-white";
                      } else if (isUserSelected && !isCorrect) {
                        borderClass = "border-rose-500 bg-rose-500/10 text-rose-800 dark:text-rose-200 font-semibold";
                        indicatorClass = "border-rose-500 bg-rose-500 text-white";
                      }

                      return (
                        <div
                          key={opt.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border text-xs leading-relaxed transition-all ${borderClass}`}
                        >
                          <div
                            className={`h-5 w-5 rounded-full border flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold ${indicatorClass}`}
                          >
                            {opt.optionKey}
                          </div>
                          <div className="flex-1">{opt.optionText}</div>
                          {isUserSelected && (
                            <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-foreground/10">
                              Your Choice
                            </span>
                          )}
                          {isCorrect && (
                            <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold">
                              Correct Key
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Explanation Box */}
                {currentQ.explanation && (
                  <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2 text-xs">
                    <h4 className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                      <BookOpen className="h-4 w-4" />
                      Detailed Explanation & Proof
                    </h4>
                    <p className="text-foreground/90 leading-relaxed whitespace-pre-line">
                      {currentQ.explanation}
                    </p>
                  </div>
                )}

                {/* Question Navigation */}
                <div className="pt-4 border-t border-border flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedQIdx(Math.max(0, selectedQIdx - 1))}
                    disabled={selectedQIdx === 0}
                    className="h-8 text-xs gap-1 border-border"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setSelectedQIdx(Math.min(testQuestions.length - 1, selectedQIdx + 1))
                    }
                    disabled={selectedQIdx === testQuestions.length - 1}
                    className="h-8 text-xs gap-1 border-border"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ) : null}
          </div>

          {/* Question List Navigator */}
          <div className="lg:col-span-1">
            <Card className="border-border p-4 sticky top-20">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Question Navigator
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {testQuestions.map((tq: any, i: number) => {
                  const status = getQuestionStatus(tq.question);
                  const isSelected = selectedQIdx === i;

                  let colorClass = "bg-muted text-muted-foreground border-border";
                  if (status === "CORRECT") {
                    colorClass = "bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold";
                  } else if (status === "INCORRECT") {
                    colorClass = "bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-400 font-bold";
                  }

                  return (
                    <button
                      key={tq.id}
                      onClick={() => setSelectedQIdx(i)}
                      className={`h-9 rounded-md flex items-center justify-center text-xs font-mono border transition-all ${colorClass} ${
                        isSelected ? "ring-2 ring-foreground scale-105" : "hover:opacity-80"
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              <div className="pt-4 mt-4 border-t border-border space-y-1.5 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-emerald-500/20 border border-emerald-500" />
                  <span>Correct Answer</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-rose-500/20 border border-rose-500" />
                  <span>Incorrect Answer</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-muted border" />
                  <span>Unanswered / Skipped</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
