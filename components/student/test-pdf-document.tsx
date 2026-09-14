"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff,
  ShieldCheck,
  Calculator,
  MinusCircle,
  AlertTriangle,
} from "lucide-react";

interface Option {
  id: string;
  optionKey: string;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

interface Question {
  id: string;
  questionText: string;
  questionType: string;
  subject: string;
  topic?: string | null;
  difficulty: string;
  marks: number;
  negativeMarks: number;
  imageUrl?: string | null;
  explanation?: string | null;
  correctNumericalAnswer?: string | null;
  options: Option[];
}

interface TestQuestion {
  id: string;
  testId: string;
  questionId: string;
  sectionName?: string;
  orderIndex: number;
  question: Question;
}

interface TestPdfDocumentProps {
  test: any;
  attempt: any;
}

export function TestPdfDocument({ test, attempt }: TestPdfDocumentProps) {
  const candidate = attempt?.user || { name: "Enrolled Student", id: "STUDENT" };
  const [showSolutions, setShowSolutions] = React.useState(true);
  // Memoize stable testQuestions array
  const testQuestions = React.useMemo<TestQuestion[]>(
    () => (test?.testQuestions as TestQuestion[]) || [],
    [test?.testQuestions]
  );

  // Hide student portal header, sidebar, and Sign Out button while on the export document screen
  React.useEffect(() => {
    document.body.classList.add("export-pdf-mode");
    return () => {
      document.body.classList.remove("export-pdf-mode");
    };
  }, []);

  // Parse recorded candidate answers
  const answersMap = React.useMemo(() => {
    const map: Record<string, { selectedOptionIds: string[]; numericalAnswer: string }> = {};
    if (Array.isArray(attempt?.answers)) {
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
  }, [attempt?.answers]);

  // Compute evaluation, correct/wrong counts, and negative marking calculation
  const evaluationStats = React.useMemo(() => {
    const marksPerQ = Number(test?.marksPerQuestion ?? 2.0);
    const penaltyPerQ = Number(test?.negativeMarkingRate ?? 0.0);
    const hasNegativeMarking = penaltyPerQ > 0;

    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;

    testQuestions.forEach((tq) => {
      const q = tq.question;
      const recorded = answersMap[q.id];
      const chosenOptionIds = recorded?.selectedOptionIds || [];
      const numAnswer = recorded?.numericalAnswer?.trim() || "";

      const isAttempted = chosenOptionIds.length > 0 || Boolean(numAnswer);
      if (!isAttempted) {
        unattemptedCount++;
        return;
      }

      if (q.questionType === "NUMERICAL") {
        if (q.correctNumericalAnswer && numAnswer === q.correctNumericalAnswer.trim()) {
          correctCount++;
        } else {
          incorrectCount++;
        }
        return;
      }

      const correctOptionIds = q.options?.filter((o) => o.isCorrect).map((o) => o.id) || [];
      const isCorrect =
        chosenOptionIds.length === correctOptionIds.length &&
        chosenOptionIds.every((id) => correctOptionIds.includes(id));

      if (isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }
    });

    // Fall back to attempt metrics if answers array was not populated
    if (
      testQuestions.length > 0 &&
      correctCount === 0 &&
      incorrectCount === 0 &&
      (attempt?.correctAnswersCount || attempt?.incorrectAnswersCount)
    ) {
      correctCount = attempt.correctAnswersCount ?? 0;
      incorrectCount = attempt.incorrectAnswersCount ?? 0;
      unattemptedCount = Math.max(0, testQuestions.length - (correctCount + incorrectCount));
    }

    const totalQuestions = testQuestions.length || (correctCount + incorrectCount + unattemptedCount);
    const attemptedCount = correctCount + incorrectCount;
    const grossPositiveMarks = correctCount * marksPerQ;
    const totalNegativePenalty = incorrectCount * penaltyPerQ;
    const computedNetScore = Math.max(0, grossPositiveMarks - totalNegativePenalty);
    const finalScore = attempt?.score !== undefined ? Number(attempt.score) : Number(computedNetScore.toFixed(2));
    const totalMarks = Number(test?.totalMarks ?? totalQuestions * marksPerQ);
    const accuracy = attemptedCount > 0 ? Number(((correctCount / attemptedCount) * 100).toFixed(1)) : 0;
    const percentage = totalMarks > 0 ? Number(((finalScore / totalMarks) * 100).toFixed(1)) : 0;

    return {
      totalQuestions,
      correctCount,
      incorrectCount,
      unattemptedCount,
      attemptedCount,
      marksPerQ,
      penaltyPerQ,
      hasNegativeMarking,
      grossPositiveMarks,
      totalNegativePenalty,
      finalScore,
      totalMarks,
      accuracy,
      percentage,
    };
  }, [test, attempt, testQuestions, answersMap]);

  // Group questions by section
  const sectionsMap = React.useMemo(() => {
    const sections: Record<string, TestQuestion[]> = {};
    testQuestions.forEach((tq) => {
      const section = tq.sectionName || tq.question.subject || "General Section";
      if (!sections[section]) sections[section] = [];
      sections[section].push(tq);
    });
    return sections;
  }, [testQuestions]);

  const handlePrint = () => {
    const originalTitle = document.title;
    const cleanTestTitle = (test.title || "Mock_Test").replace(/[^a-zA-Z0-9_-]/g, "_");
    const cleanCandidateName = (candidate.name || "Candidate").replace(/[^a-zA-Z0-9_-]/g, "_");
    document.title = `QuickTestWala_${cleanTestTitle}_${cleanCandidateName}`;

    window.print();

    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 print:min-h-0 print:bg-white print:p-0 print:m-0 print:w-full print:max-w-none">


      {/* -------------------------------------------------------------
          TOP FLOATING ACTION BAR (Hidden when printing)
      ------------------------------------------------------------- */}
      <div className="max-w-4xl mx-auto mb-6 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center gap-3">
            <Link href={`/student/tests/${test.id}/result?attemptId=${attempt.id}`}>
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Scorecard
              </Button>
            </Link>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <Badge variant="outline" className="text-[10px] font-mono gap-1 text-emerald-600 border-emerald-500/30">
              <ShieldCheck className="h-3 w-3" />
              Verified Subscribed Candidate
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSolutions((prev) => !prev)}
              className="h-8 text-xs gap-1.5"
            >
              {showSolutions ? (
                <>
                  <EyeOff className="h-3.5 w-3.5" />
                  Hide Solutions
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5" />
                  Show Solutions
                </>
              )}
            </Button>

            <Button
              size="sm"
              onClick={handlePrint}
              className="h-8 text-xs font-semibold gap-1.5 shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Download className="h-3.5 w-3.5" />
              Download / Print PDF
            </Button>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          PRINTABLE DOCUMENT CONTAINER (Standard A4 Dimensions)
      ------------------------------------------------------------- */}
      <div className="max-w-4xl mx-auto bg-white text-slate-900 border border-slate-200 shadow-md p-8 sm:p-12 rounded-lg relative overflow-hidden print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none print:w-full print:bg-white print:text-black print:overflow-visible print:rounded-none">
        {/* Repeating Watermark across all pages (Visible on screen and in print) */}
        <div
          aria-hidden="true"
          className="pointer-events-none select-none fixed inset-0 flex items-center justify-center z-10 print:flex opacity-[0.035] dark:opacity-[0.045] print:opacity-[0.04]"
          style={{ transform: "rotate(-35deg)" }}
        >
          <div className="text-center font-black tracking-widest leading-tight">
            <p className="text-5xl sm:text-7xl uppercase text-slate-900">QUICKTESTWALA™</p>
            <p className="text-xl sm:text-2xl tracking-normal text-slate-700 mt-2">
              CONFIDENTIAL • COPYRIGHTED TEST PAPER
            </p>
          </div>
        </div>

        {/* -------------------------------------------------------------
            RUNNING PRINT HEADER (Visible on every printed page)
        ------------------------------------------------------------- */}
        <div className="hidden print:flex items-center justify-between border-b border-slate-300 pb-2 mb-6 text-[10px] text-slate-600 font-mono">
          <div className="flex items-center gap-1.5 font-bold text-slate-900">
            <span>QUICKTESTWALA™</span>
            <span>—</span>
            <span>Official Examination Paper & Solutions</span>
          </div>
          <div>{test.title}</div>
        </div>

        {/* -------------------------------------------------------------
            DOCUMENT HEADER & LOGO BANNER
        ------------------------------------------------------------- */}
        <div className="border-b-2 border-slate-900 pb-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  QuickTest<span className="text-primary">Wala</span>
                  <span className="text-xs font-semibold align-super ml-0.5 text-slate-500">™</span>
                </span>
                <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-300">
                  Certified Test Series
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                India&apos;s Premier CBT Online Examination & Test Practice Portal
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-600 font-mono">
              <p className="font-bold text-slate-900">{test.testSeries?.examName || "Competitive Exam"}</p>
              <p>{test.testSeries?.title || "Test Series"}</p>
              <p className="text-[11px] text-slate-500">Doc ID: QTW-{test.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {test.title}
            </h1>
            {test.description && (
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {test.description}
              </p>
            )}
          </div>

          {/* Test & Attempt Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono">
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">Candidate Name</span>
              <span className="font-bold text-slate-900">{candidate.name || "Enrolled Student"}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">Final Net Score</span>
              <span className="font-bold text-slate-900">
                {evaluationStats.finalScore} / {evaluationStats.totalMarks} Marks
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">Marking Scheme</span>
              <span className="font-bold text-slate-900">
                +{evaluationStats.marksPerQ} / -{evaluationStats.penaltyPerQ}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">Attempt Date</span>
              <span className="font-bold text-slate-900">
                {attempt.completedAt || attempt.createdAt
                  ? new Date(attempt.completedAt || attempt.createdAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })
                  : "Completed"}
              </span>
            </div>
          </div>

          {/* -------------------------------------------------------------
              DETAILED SCORE EVALUATION & NEGATIVE MARKING BREAKDOWN
          ------------------------------------------------------------- */}
          <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-300 text-xs font-mono space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <Calculator className="h-4 w-4 text-slate-800" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Candidate Performance & Negative Marking Calculation
                </h2>
              </div>
              {evaluationStats.hasNegativeMarking ? (
                <span className="text-[10px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-amber-700" />
                  Negative Marking Active (-{evaluationStats.penaltyPerQ} per incorrect answer)
                </span>
              ) : (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-700" />
                  No Negative Marking Penalty
                </span>
              )}
            </div>

            {/* 4 Performance Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {/* Correct Answers Card */}
              <div className="p-3 rounded-lg bg-emerald-50/80 border border-emerald-300">
                <div className="flex items-center justify-center gap-1 text-emerald-800 font-bold text-[11px] uppercase">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Correct Answers
                </div>
                <p className="text-2xl font-black text-emerald-950 mt-1">{evaluationStats.correctCount}</p>
                <p className="text-[10px] text-emerald-700 mt-0.5 font-bold">
                  +{evaluationStats.grossPositiveMarks.toFixed(2)} Marks Earned
                </p>
              </div>

              {/* Wrong Answers Card */}
              <div className="p-3 rounded-lg bg-rose-50/80 border border-rose-300">
                <div className="flex items-center justify-center gap-1 text-rose-800 font-bold text-[11px] uppercase">
                  <XCircle className="h-3.5 w-3.5 text-rose-600" />
                  Wrong Answers
                </div>
                <p className="text-2xl font-black text-rose-950 mt-1">{evaluationStats.incorrectCount}</p>
                <p className="text-[10px] text-rose-700 mt-0.5 font-bold">
                  {evaluationStats.hasNegativeMarking
                    ? `-${evaluationStats.totalNegativePenalty.toFixed(2)} Negative Penalty`
                    : "0.00 Penalty (None)"}
                </p>
              </div>

              {/* Unattempted Card */}
              <div className="p-3 rounded-lg bg-slate-100 border border-slate-200">
                <div className="flex items-center justify-center gap-1 text-slate-700 font-bold text-[11px] uppercase">
                  <MinusCircle className="h-3.5 w-3.5 text-slate-500" />
                  Unattempted
                </div>
                <p className="text-2xl font-black text-slate-800 mt-1">{evaluationStats.unattemptedCount}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">0.00 Marks (Skipped)</p>
              </div>

              {/* Accuracy & Percentage Card */}
              <div className="p-3 rounded-lg bg-blue-50/80 border border-blue-300">
                <div className="flex items-center justify-center gap-1 text-blue-800 font-bold text-[11px] uppercase">
                  Accuracy Rate
                </div>
                <p className="text-2xl font-black text-blue-950 mt-1">{evaluationStats.accuracy}%</p>
                <p className="text-[10px] text-blue-700 mt-0.5 font-bold">
                  Score: {evaluationStats.percentage}%
                </p>
              </div>
            </div>

            {/* Formula Breakdown Table */}
            <div className="border border-slate-300 rounded-lg overflow-hidden bg-white shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                    <th className="p-2.5">Evaluation Component</th>
                    <th className="p-2.5">Questions Count</th>
                    <th className="p-2.5">Per-Question Rate</th>
                    <th className="p-2.5 text-right">Formula Calculation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800 font-mono">
                  <tr>
                    <td className="p-2.5 font-semibold text-emerald-800">
                      ✓ Positive Credit (Correct)
                    </td>
                    <td className="p-2.5 font-bold">{evaluationStats.correctCount} Questions</td>
                    <td className="p-2.5">+{evaluationStats.marksPerQ.toFixed(2)} Marks / Q</td>
                    <td className="p-2.5 text-right font-bold text-emerald-700">
                      +{evaluationStats.correctCount} × {evaluationStats.marksPerQ.toFixed(2)} = +{evaluationStats.grossPositiveMarks.toFixed(2)}
                    </td>
                  </tr>

                  {evaluationStats.hasNegativeMarking ? (
                    <tr>
                      <td className="p-2.5 font-semibold text-rose-800">
                        ✗ Negative Deduction (Incorrect)
                      </td>
                      <td className="p-2.5 font-bold">{evaluationStats.incorrectCount} Questions</td>
                      <td className="p-2.5">-{evaluationStats.penaltyPerQ.toFixed(2)} Penalty / Q</td>
                      <td className="p-2.5 text-right font-bold text-rose-700">
                        -{evaluationStats.incorrectCount} × {evaluationStats.penaltyPerQ.toFixed(2)} = -{evaluationStats.totalNegativePenalty.toFixed(2)}
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td className="p-2.5 font-semibold text-slate-600">
                        ✗ Incorrect Questions (No Negative)
                      </td>
                      <td className="p-2.5 font-bold">{evaluationStats.incorrectCount} Questions</td>
                      <td className="p-2.5">0.00 Penalty</td>
                      <td className="p-2.5 text-right text-slate-500">0.00 Marks Deducted</td>
                    </tr>
                  )}

                  <tr>
                    <td className="p-2.5 text-slate-500">
                      — Unanswered / Skipped
                    </td>
                    <td className="p-2.5 text-slate-600 font-bold">{evaluationStats.unattemptedCount} Questions</td>
                    <td className="p-2.5 text-slate-500">0.00 Marks</td>
                    <td className="p-2.5 text-right text-slate-500">0.00 Marks</td>
                  </tr>

                  {/* Final Net Calculation Row */}
                  <tr className="bg-slate-900 text-white font-bold text-xs">
                    <td colSpan={3} className="p-3 uppercase tracking-wider">
                      Final Net Score = (Gross Marks − Negative Penalty)
                    </td>
                    <td className="p-3 text-right font-mono text-sm text-emerald-400">
                      {evaluationStats.grossPositiveMarks.toFixed(2)} − {evaluationStats.totalNegativePenalty.toFixed(2)} ={" "}
                      <span className="underline decoration-emerald-400 underline-offset-4">
                        {evaluationStats.finalScore} / {evaluationStats.totalMarks} Marks
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------
            QUESTIONS BODY (SECTION BY SECTION)
        ------------------------------------------------------------- */}
        <div className="space-y-8">
          {Object.entries(sectionsMap).map(([sectionTitle, tqList], sIdx) => (
            <div key={sectionTitle} className="space-y-4">
              {/* Section Header */}
              <div className="flex items-center justify-between border-b border-slate-400 pb-1.5 pt-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <span className="h-5 w-5 rounded bg-slate-900 text-white flex items-center justify-center text-[10px] font-mono">
                    {sIdx + 1}
                  </span>
                  Section: {sectionTitle}
                </h2>
                <span className="text-xs font-mono text-slate-600">
                  {tqList.length} {tqList.length === 1 ? "Question" : "Questions"}
                </span>
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {tqList.map((tq, qIdx) => {
                  const q = tq.question;
                  const recordedAnswer = answersMap[q.id];
                  const chosenOptionIds = recordedAnswer?.selectedOptionIds || [];
                  const numAnswer = recordedAnswer?.numericalAnswer?.trim() || "";
                  const correctOptions = q.options?.filter((o) => o.isCorrect) || [];
                  const correctOptionKeys = correctOptions.map((o) => o.optionKey).join(", ");
                  const chosenOptions = q.options?.filter((o) => chosenOptionIds.includes(o.id)) || [];
                  const chosenOptionKeys = chosenOptions.map((o) => o.optionKey).join(", ");

                  const isAttempted = chosenOptionIds.length > 0 || Boolean(numAnswer);
                  let isCorrect = false;

                  if (isAttempted) {
                    if (q.questionType === "NUMERICAL") {
                      isCorrect = Boolean(
                        q.correctNumericalAnswer && numAnswer === q.correctNumericalAnswer.trim()
                      );
                    } else {
                      isCorrect =
                        chosenOptionIds.length === correctOptions.length &&
                        chosenOptionIds.every((id) => correctOptions.some((co) => co.id === id));
                    }
                  }

                  const qMarks = Number(test.marksPerQuestion || q.marks || 2.0);
                  const qPenalty = Number(test.negativeMarkingRate || q.negativeMarks || 0.0);

                  return (
                    <div
                      key={tq.id || q.id}
                      className="p-4 rounded-lg border border-slate-200 bg-white space-y-3 break-inside-avoid print:break-inside-avoid shadow-xs print:shadow-none"
                      style={{ pageBreakInside: "avoid" }}
                    >
                      {/* Question Top Meta */}
                      <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 font-mono text-sm">
                            Q.{qIdx + 1}
                          </span>
                          <span className="text-slate-500 font-medium">({q.subject})</span>
                          {q.topic && (
                            <span className="text-[11px] text-slate-400">• {q.topic}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 font-mono text-[11px]">
                          <span className="text-slate-600">
                            [+{qMarks.toFixed(1)}, -{qPenalty.toFixed(1)}]
                          </span>
                          {isAttempted ? (
                            isCorrect ? (
                              <span className="text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <CheckCircle2 className="h-3 w-3" /> Correct (+{qMarks.toFixed(1)})
                              </span>
                            ) : (
                              <span className="text-rose-700 font-bold flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                                <XCircle className="h-3 w-3" /> Incorrect{" "}
                                {qPenalty > 0 ? `(-${qPenalty.toFixed(1)})` : "(0.0)"}
                              </span>
                            )
                          ) : (
                            <span className="text-slate-400 italic bg-slate-100 px-2 py-0.5 rounded">
                              Unattempted (0.0)
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Question Text */}
                      <div className="text-xs sm:text-sm font-medium text-slate-900 leading-relaxed">
                        {q.questionText}
                      </div>

                      {/* Figure / Diagram */}
                      {(q.imageUrl || (q as any).image_url) && (
                        <div className="my-2 p-1.5 border border-slate-200 rounded-md bg-slate-50/50 inline-block">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={q.imageUrl || (q as any).image_url}
                            alt="Question figure"
                            className="max-h-48 w-auto object-contain rounded"
                          />
                        </div>
                      )}

                      {/* Options Grid (For MCQ) */}
                      {q.options && q.options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                          {q.options.map((opt) => {
                            const isSelected = chosenOptionIds.includes(opt.id);
                            const isThisCorrect = opt.isCorrect;

                            let optionBg = "border-slate-200 bg-slate-50/50 text-slate-800";
                            if (showSolutions && isThisCorrect) {
                              optionBg = "border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold";
                            } else if (isSelected && !isThisCorrect) {
                              optionBg = "border-rose-300 bg-rose-50 text-rose-950";
                            }

                            return (
                              <div
                                key={opt.id || opt.optionKey}
                                className={`p-2.5 rounded border text-xs flex items-start gap-2 ${optionBg}`}
                              >
                                <span
                                  className={`h-5 w-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold shrink-0 ${
                                    showSolutions && isThisCorrect
                                      ? "bg-emerald-600 text-white"
                                      : isSelected
                                      ? "bg-slate-700 text-white"
                                      : "bg-slate-200 text-slate-700"
                                  }`}
                                >
                                  {opt.optionKey}
                                </span>
                                <span className="flex-1 mt-0.5 leading-relaxed">{opt.optionText}</span>
                                {showSolutions && isThisCorrect && (
                                  <span className="text-[10px] font-bold text-emerald-700 uppercase shrink-0 font-mono">
                                    [Key]
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Numerical Answer Display */}
                      {q.questionType === "NUMERICAL" && (
                        <div className="p-3 rounded bg-slate-50 border border-slate-200 text-xs font-mono space-y-1">
                          <div>
                            <span className="text-slate-500">Your Numerical Input: </span>
                            <span className="font-bold text-slate-900">{numAnswer || "No value entered"}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Correct Value Key: </span>
                            <span className="font-bold text-emerald-700">{q.correctNumericalAnswer}</span>
                          </div>
                        </div>
                      )}

                      {/* Candidate Answer, Marks Impact & Key Summary Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] font-mono border-t border-slate-100 text-slate-600">
                        <div>
                          <span>Your Response: </span>
                          <span
                            className={`font-bold ${
                              isAttempted
                                ? isCorrect
                                  ? "text-emerald-700"
                                  : "text-rose-700"
                                : "text-slate-400"
                            }`}
                          >
                            {isAttempted
                              ? q.questionType === "NUMERICAL"
                                ? numAnswer
                                : `Option ${chosenOptionKeys}`
                              : "Not Answered"}
                          </span>
                        </div>

                        <div>
                          <span>Marks Impact: </span>
                          <span
                            className={`font-bold ${
                              isAttempted
                                ? isCorrect
                                  ? "text-emerald-700"
                                  : qPenalty > 0
                                  ? "text-rose-700"
                                  : "text-slate-600"
                                : "text-slate-400"
                            }`}
                          >
                            {isAttempted
                              ? isCorrect
                                ? `+${qMarks.toFixed(1)} (Full Credit)`
                                : qPenalty > 0
                                ? `-${qPenalty.toFixed(1)} (Negative Penalty)`
                                : "0.0 (No Deduction)"
                              : "0.0 (Skipped)"}
                          </span>
                        </div>

                        <div>
                          <span>Correct Answer: </span>
                          <span className="font-bold text-emerald-800">
                            {q.questionType === "NUMERICAL"
                              ? q.correctNumericalAnswer
                              : `Option ${correctOptionKeys || "—"}`}
                          </span>
                        </div>
                      </div>

                      {/* Step-by-Step Explanation Box (Toggleable) */}
                      {showSolutions && q.explanation && (
                        <div className="mt-2 p-3 rounded bg-amber-50/60 border border-amber-200/80 text-[11px] leading-relaxed text-slate-800 space-y-1">
                          <span className="font-bold uppercase tracking-wider text-amber-900 block font-mono text-[10px]">
                            💡 Step-by-Step Solution:
                          </span>
                          <p className="whitespace-pre-line text-slate-700">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* -------------------------------------------------------------
            RUNNING PRINT FOOTER (Visible on every printed page)
        ------------------------------------------------------------- */}
        <div className="mt-12 pt-4 border-t-2 border-slate-900 text-center text-[10px] text-slate-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © {new Date().getFullYear()} QuickTestWala Technologies Ltd. All rights reserved.
          </div>
          <div className="font-bold text-slate-700">
            QuickTestWala™ Registered Trademark • Student Revision Copy
          </div>
          <div>
            Candidate ID: {candidate.id?.slice(0, 8) || "STUDENT"}
          </div>
        </div>
      </div>
    </div>
  );
}
