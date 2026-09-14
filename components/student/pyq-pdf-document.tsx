"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  FileText,
  Sparkles,
} from "lucide-react";

interface PyqPdfDocumentProps {
  paper: any;
  user: any;
}

export function PyqPdfDocument({ paper, user }: PyqPdfDocumentProps) {
  const candidate = user || { name: "Enrolled Student", id: "STUDENT" };
  const [showSolutions, setShowSolutions] = React.useState(true);

  // Parse questions cleanly
  const questions: any[] = React.useMemo(() => {
    if (Array.isArray(paper?.questions)) return paper.questions;
    if (typeof paper?.questions === "string") {
      try {
        return JSON.parse(paper.questions);
      } catch {
        return [];
      }
    }
    return [];
  }, [paper?.questions]);

  // Group questions by subject / section
  const sectionsMap = React.useMemo(() => {
    const map: Record<string, any[]> = {};
    questions.forEach((q, idx) => {
      const sec = q.subject || q.sectionName || "General Section";
      if (!map[sec]) map[sec] = [];
      map[sec].push({ ...q, questionNumber: idx + 1 });
    });
    return map;
  }, [questions]);

  // Ensure body print styles work cleanly without portal navigation
  React.useEffect(() => {
    document.body.classList.add("export-pdf-mode");
    return () => {
      document.body.classList.remove("export-pdf-mode");
    };
  }, []);

  const handlePrint = () => {
    const originalTitle = document.title;
    const cleanExam = (paper.examName || "PYQ").replace(/[^a-zA-Z0-9_-]/g, "_");
    const cleanYear = (paper.year || "Paper").replace(/[^a-zA-Z0-9_-]/g, "_");
    const cleanCandidate = (candidate.name || "Student").replace(/[^a-zA-Z0-9_-]/g, "_");
    document.title = `QuickTestWala_PYQ_${cleanExam}_${cleanYear}_${cleanCandidate}`;

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
            <Link href="/student/question-papers">
              <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs">
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Question Papers
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

            {paper.pdfUrl ? (
              <a href={paper.pdfUrl} target="_blank" rel="noreferrer">
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-border">
                  <FileText className="h-3.5 w-3.5" />
                  Original PDF
                </Button>
              </a>
            ) : null}

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
              PREVIOUS YEAR QUESTION PAPER • OFFICIAL ARCHIVE
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
            <span>Official Previous Year Examination Paper Archive</span>
          </div>
          <div>
            {paper.examName} • Year {paper.year}
          </div>
        </div>

        {/* -------------------------------------------------------------
            DOCUMENT HEADER & LOGO BANNER
        ------------------------------------------------------------- */}
        <div className="border-b-2 border-slate-900 pb-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
                  QuickTest<span className="text-emerald-600">Wala</span>
                  <span className="text-xs font-semibold align-super ml-0.5 text-slate-600">™</span>
                </span>
                <span className="text-[10px] font-mono uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-300 font-bold">
                  Official PYQ Archive
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 font-medium">
                India&apos;s Premier CBT Online Examination & Test Practice Portal
              </p>
            </div>

            <div className="text-left sm:text-right text-xs text-slate-600 font-mono">
              <p className="font-bold text-slate-900">{paper.examName}</p>
              <p>Examination Year: {paper.year}</p>
              <p className="text-[11px] text-slate-500">Doc ID: QTW-PYQ-{paper.id.slice(0, 8).toUpperCase()}</p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {paper.title}
            </h1>
            {paper.description && (
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {paper.description}
              </p>
            )}
          </div>

          {/* Test & Candidate Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono">
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">Candidate Name</span>
              <span className="font-bold text-slate-900">{candidate.name || "Enrolled Student"}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">Total Questions</span>
              <span className="font-bold text-slate-900">{questions.length} Questions</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">Licensing</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Paid Student License
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] uppercase block">Download Date</span>
              <span className="font-bold text-slate-900">
                {new Date().toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------
            QUESTIONS BODY GROUPED BY SECTION
        ------------------------------------------------------------- */}
        <div className="space-y-8">
          {Object.entries(sectionsMap).map(([sectionName, sectionQuestions]) => (
            <div key={sectionName} className="space-y-4">
              {/* Section Header */}
              <div className="flex items-center justify-between border-b border-slate-300 pb-1.5">
                <h3 className="font-black text-sm uppercase tracking-wider text-slate-900 font-mono">
                  SECTION: {sectionName}
                </h3>
                <span className="text-[11px] text-slate-600 font-mono">
                  {sectionQuestions.length} Questions
                </span>
              </div>

              {/* Questions List */}
              <div className="space-y-6">
                {sectionQuestions.map((q: any) => {
                  const options = Array.isArray(q.options) ? q.options : [];
                  const correctOptionKeys = Array.isArray(q.correctOptionKeys)
                    ? q.correctOptionKeys.join(", ")
                    : q.correctOptionKeys ||
                      options
                        .filter((opt: any) => opt.isCorrect)
                        .map((opt: any) => opt.optionKey)
                        .join(", ");

                  return (
                    <div
                      key={q.id || q.questionNumber}
                      className="p-4 rounded-lg border border-slate-200 bg-white break-inside-avoid print:p-3 print:mb-4 print:border-slate-300"
                    >
                      {/* Question Top Info */}
                      <div className="flex items-center justify-between text-xs text-slate-600 font-mono border-b border-slate-100 pb-1.5 mb-2">
                        <span className="font-bold text-slate-900">
                          Question {q.questionNumber}
                        </span>
                        <div className="flex items-center gap-2 text-[11px]">
                          <span>Subject: {q.subject || sectionName}</span>
                          <span>•</span>
                          <span className="text-emerald-700 font-semibold">
                            +{q.marks || 2.0} / -{q.negativeMarks || 0.5} Marks
                          </span>
                        </div>
                      </div>

                      {/* Question Content */}
                      <div className="text-xs sm:text-sm font-medium text-slate-900 leading-relaxed mb-3">
                        {q.questionText}
                      </div>

                      {/* Options Grid */}
                      {options.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-3">
                          {options.map((opt: any, optIdx: number) => {
                            const isAnswer = opt.isCorrect;

                            return (
                              <div
                                key={opt.id || optIdx}
                                className={`flex items-start gap-2.5 p-2.5 rounded text-xs border transition-colors ${
                                  showSolutions && isAnswer
                                    ? "bg-emerald-50/70 border-emerald-500 font-medium text-slate-900"
                                    : "bg-slate-50/70 border-slate-200 text-slate-700"
                                }`}
                              >
                                <span
                                  className={`h-5 w-5 rounded flex items-center justify-center font-mono font-bold text-[11px] shrink-0 ${
                                    showSolutions && isAnswer
                                      ? "bg-emerald-600 text-white"
                                      : "bg-white border border-slate-300 text-slate-800"
                                  }`}
                                >
                                  {opt.optionKey || String.fromCharCode(65 + optIdx)}
                                </span>
                                <span className="pt-0.5 leading-snug">{opt.optionText}</span>
                                {showSolutions && isAnswer && (
                                  <span className="ml-auto text-[10px] font-bold text-emerald-700 uppercase font-mono shrink-0">
                                    Correct
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Answer Key Strip */}
                      <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <span>Official Answer Key:</span>
                          <span className="font-bold text-emerald-700">
                            {q.questionType === "NUMERICAL"
                              ? q.correctNumericalAnswer
                              : `Option ${correctOptionKeys || "—"}`}
                          </span>
                        </div>
                      </div>

                      {/* Step-by-Step Explanation Box (Toggleable) */}
                      {showSolutions && q.explanation && (
                        <div className="mt-2.5 p-3 rounded bg-amber-50/60 border border-amber-200/80 text-[11px] leading-relaxed text-slate-800 space-y-1">
                          <span className="font-bold uppercase tracking-wider text-amber-900 block font-mono text-[10px]">
                            💡 Verified Solution & Proof:
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
            RUNNING PRINT FOOTER & TRADEMARK NOTICE
        ------------------------------------------------------------- */}
        <div className="mt-12 pt-4 border-t-2 border-slate-900 text-center text-[10px] text-slate-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © {new Date().getFullYear()} QuickTestWala Technologies Ltd. All rights reserved.
          </div>
          <div className="font-bold text-slate-800">
            QuickTestWala™ Registered Trademark • Licensed to {candidate.name || "Student"}
          </div>
          <div>
            Doc ID: QTW-PYQ-{paper.id.slice(0, 8).toUpperCase()}
          </div>
        </div>

        {/* Legal Disclaimer */}
        <div className="mt-2 text-[9px] text-slate-400 text-center font-mono leading-tight">
          QuickTestWala™ is a registered proprietary trademark of TestHero EdTech Pvt Ltd.
          Unauthorized re-uploading, commercial redistribution, or public reproduction of this examination paper is strictly prohibited under Trademark & Copyright Laws.
        </div>
      </div>
    </div>
  );
}
