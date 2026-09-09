"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { saveAnswerAction, submitTestAction } from "@/actions/test";
import {
  Timer,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  CheckCircle2,
  HelpCircle,
  RotateCcw,
  Loader2,
  Menu,
  X,
} from "lucide-react";
import { formatSecondsToTime } from "@/lib/utils";

interface QuestionOption {
  id: string;
  optionKey: string;
  optionText: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  questionText: string;
  questionType: "MCQ" | "MULTIPLE_CORRECT" | "NUMERICAL";
  subject: string;
  topic?: string | null;
  marks: number;
  negativeMarks: number;
  options?: QuestionOption[];
}

interface TestQuestion {
  id: string;
  questionId: string;
  sectionName: string;
  orderIndex: number;
  question: Question;
}

interface TestAttempt {
  id: string;
  testId: string;
  remainingTimeSeconds: number;
  answers: {
    questionId: string;
    selectedOptionIds?: string | null;
    numericalAnswer?: string | null;
    isMarkedForReview?: boolean;
    isVisited?: boolean;
  }[];
  test: {
    id: string;
    title: string;
    durationMinutes: number;
    totalMarks: number;
    negativeMarkingRate: number;
    marksPerQuestion: number;
    testQuestions: TestQuestion[];
  };
}

export function CBTEngine({ attempt }: { attempt: TestAttempt }) {
  const router = useRouter();
  const { toast } = useToast();

  const testQuestions = attempt.test.testQuestions || [];
  const totalQuestions = testQuestions.length;

  // Extract unique sections
  const sections = React.useMemo(() => {
    const list: string[] = [];
    testQuestions.forEach((tq) => {
      const sec = tq.sectionName || "General Section";
      if (!list.includes(sec)) list.push(sec);
    });
    return list.length > 0 ? list : ["General Section"];
  }, [testQuestions]);

  const [activeSection, setActiveSection] = React.useState(sections[0]);
  const [currentIdx, setCurrentIdx] = React.useState(0);

  // Time state: persist in localStorage to survive refresh & sync with server
  const storageKey = `examforge_timer_${attempt.id}`;
  const [timeLeft, setTimeLeft] = React.useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    }
    return attempt.remainingTimeSeconds > 0
      ? attempt.remainingTimeSeconds
      : attempt.test.durationMinutes * 60;
  });

  // Local state for student's answers & palette states
  // Format: Record<questionId, { selectedOptionIds: string[], numericalAnswer: string, isMarkedForReview: boolean, isVisited: boolean }>
  const [answersState, setAnswersState] = React.useState<
    Record<
      string,
      {
        selectedOptionIds: string[];
        numericalAnswer: string;
        isMarkedForReview: boolean;
        isVisited: boolean;
      }
    >
  >(() => {
    const initial: Record<string, any> = {};

    testQuestions.forEach((tq, i) => {
      initial[tq.question.id] = {
        selectedOptionIds: [],
        numericalAnswer: "",
        isMarkedForReview: false,
        isVisited: i === 0, // First question is visited by default
      };
    });

    // Populate from attempt record
    if (attempt.answers && Array.isArray(attempt.answers)) {
      attempt.answers.forEach((ans) => {
        let optIds: string[] = [];
        if (ans.selectedOptionIds) {
          try {
            optIds = JSON.parse(ans.selectedOptionIds);
          } catch {
            optIds = [];
          }
        }
        if (initial[ans.questionId]) {
          initial[ans.questionId] = {
            selectedOptionIds: optIds,
            numericalAnswer: ans.numericalAnswer || "",
            isMarkedForReview: Boolean(ans.isMarkedForReview),
            isVisited: Boolean(ans.isVisited),
          };
        }
      });
    }

    return initial;
  });

  const [submitModalOpen, setSubmitModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [mobilePaletteOpen, setMobilePaletteOpen] = React.useState(false);

  const currentTQ = testQuestions[currentIdx];
  const currentQ = currentTQ?.question;
  const questionMarks = Number(attempt.test?.marksPerQuestion ?? currentQ?.marks ?? 0);
  const questionPenalty = Number(attempt.test?.negativeMarkingRate ?? currentQ?.negativeMarks ?? 0);

  // Mark current question as visited
  React.useEffect(() => {
    if (!currentQ) return;
    setAnswersState((prev) => {
      const curr = prev[currentQ.id];
      if (curr && !curr.isVisited) {
        return {
          ...prev,
          [currentQ.id]: { ...curr, isVisited: true },
        };
      }
      return prev;
    });
  }, [currentIdx, currentQ]);

  const timeLeftRef = React.useRef(timeLeft);
  React.useEffect(() => {
    timeLeftRef.current = timeLeft;
  }, [timeLeft]);

  const isSubmittingRef = React.useRef(false);
  const hasWarned5MinRef = React.useRef(false);
  const numericalDebounceRef = React.useRef<NodeJS.Timeout | null>(null);

  // Keep isSubmittingRef updated with state
  React.useEffect(() => {
    isSubmittingRef.current = isSubmitting;
  }, [isSubmitting]);

  // Clean up debounce timer on unmount
  React.useEffect(() => {
    return () => {
      if (numericalDebounceRef.current) {
        clearTimeout(numericalDebounceRef.current);
      }
    };
  }, []);

  // Server sync of answer
  const syncAnswerToServer = React.useCallback(
    async (qid: string, state: any) => {
      try {
        await saveAnswerAction({
          attemptId: attempt.id,
          questionId: qid,
          selectedOptionIds: state.selectedOptionIds,
          numericalAnswer: state.numericalAnswer,
          isMarkedForReview: state.isMarkedForReview,
          isVisited: state.isVisited,
          remainingTimeSeconds: timeLeftRef.current,
        });
      } catch (err) {
        console.error("Failed to save answer:", err);
      }
    },
    [attempt.id]
  );

  // Flush any debounced numerical changes before navigation/submission
  const flushPendingSync = React.useCallback(() => {
    if (numericalDebounceRef.current) {
      clearTimeout(numericalDebounceRef.current);
      numericalDebounceRef.current = null;
      if (currentQ && currentQ.questionType === "NUMERICAL") {
        const currentAns = answersState[currentQ.id];
        if (currentAns) {
          syncAnswerToServer(currentQ.id, currentAns);
        }
      }
    }
  }, [currentQ, answersState, syncAnswerToServer]);

  // Handle Option Click (Single or Multiple Choice)
  const handleOptionSelect = (optionId: string) => {
    if (!currentQ) return;
    flushPendingSync();

    const currentAns = answersState[currentQ.id] || {
      selectedOptionIds: [],
      numericalAnswer: "",
      isMarkedForReview: false,
      isVisited: true,
    };

    let newSelected: string[] = [];

    if (currentQ.questionType === "MULTIPLE_CORRECT") {
      if (currentAns.selectedOptionIds.includes(optionId)) {
        newSelected = currentAns.selectedOptionIds.filter((id) => id !== optionId);
      } else {
        newSelected = [...currentAns.selectedOptionIds, optionId];
      }
    } else {
      // Single MCQ: replace
      newSelected = [optionId];
    }

    const updated = {
      ...currentAns,
      selectedOptionIds: newSelected,
      isVisited: true,
    };

    setAnswersState((prev) => ({
      ...prev,
      [currentQ.id]: updated,
    }));

    syncAnswerToServer(currentQ.id, updated);
  };

  // Handle Numerical Input
  const handleNumericalChange = (value: string) => {
    if (!currentQ) return;

    const currentAns = answersState[currentQ.id] || {
      selectedOptionIds: [],
      numericalAnswer: "",
      isMarkedForReview: false,
      isVisited: true,
    };

    const updated = {
      ...currentAns,
      numericalAnswer: value,
      isVisited: true,
    };

    setAnswersState((prev) => ({
      ...prev,
      [currentQ.id]: updated,
    }));

    if (numericalDebounceRef.current) {
      clearTimeout(numericalDebounceRef.current);
    }
    numericalDebounceRef.current = setTimeout(() => {
      syncAnswerToServer(currentQ.id, updated);
    }, 500);
  };

  // Clear Response
  const handleClearResponse = () => {
    if (!currentQ) return;

    if (numericalDebounceRef.current) {
      clearTimeout(numericalDebounceRef.current);
      numericalDebounceRef.current = null;
    }

    const currentAns = answersState[currentQ.id] || {
      selectedOptionIds: [],
      numericalAnswer: "",
      isMarkedForReview: false,
      isVisited: true,
    };

    const updated = {
      ...currentAns,
      selectedOptionIds: [],
      numericalAnswer: "",
    };

    setAnswersState((prev) => ({
      ...prev,
      [currentQ.id]: updated,
    }));

    syncAnswerToServer(currentQ.id, updated);
  };

  // Mark for Review & Next
  const handleMarkForReviewAndNext = () => {
    if (!currentQ) return;
    flushPendingSync();

    const currentAns = answersState[currentQ.id] || {
      selectedOptionIds: [],
      numericalAnswer: "",
      isMarkedForReview: false,
      isVisited: true,
    };

    const updated = {
      ...currentAns,
      isMarkedForReview: !currentAns.isMarkedForReview,
    };

    setAnswersState((prev) => ({
      ...prev,
      [currentQ.id]: updated,
    }));

    syncAnswerToServer(currentQ.id, updated);

    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  // Save & Next
  const handleSaveAndNext = () => {
    flushPendingSync();
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  // Previous
  const handlePrevious = () => {
    flushPendingSync();
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  // Auto Submit when timer hits 0
  const handleAutoSubmit = React.useCallback(async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    if (typeof window !== "undefined") {
      localStorage.removeItem(storageKey);
    }

    toast({
      title: "Time Expired",
      description: "Exam is submitting automatically...",
      type: "info",
    });

    await submitTestAction({ attemptId: attempt.id, isAutoSubmit: true });
    router.push(`/student/tests/${attempt.testId}/result?attemptId=${attempt.id}`);
  }, [attempt.id, attempt.testId, router, storageKey, toast]);

  // Manual Submit
  const handleConfirmSubmit = async () => {
    if (isSubmittingRef.current) return;
    flushPendingSync();
    isSubmittingRef.current = true;
    setIsSubmitting(true);
    if (typeof window !== "undefined") {
      localStorage.removeItem(storageKey);
    }

    const res = await submitTestAction({ attemptId: attempt.id, isAutoSubmit: false });

    if (res.error) {
      toast({ title: "Error", description: res.error, type: "error" });
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    toast({
      title: "Test Submitted",
      description: "Calculating your scorecard and percentile rankings...",
      type: "success",
    });

    router.push(`/student/tests/${attempt.testId}/result?attemptId=${attempt.id}`);
  };

  // Real-time Countdown Timer interval
  React.useEffect(() => {
    if (timeLeft <= 0) {
      handleAutoSubmit();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const nextTime = prev - 1;
        if (typeof window !== "undefined") {
          localStorage.setItem(storageKey, nextTime.toString());
        }
        return nextTime > 0 ? nextTime : 0;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [storageKey, handleAutoSubmit]);

  // Safe timer milestones monitor (5-min warning and auto-submit)
  React.useEffect(() => {
    if (timeLeft === 300 && !hasWarned5MinRef.current) {
      hasWarned5MinRef.current = true;
      toast({
        title: "5 Minutes Remaining!",
        description: "Please review and finalize your responses.",
        type: "error",
      });
    }

    if (timeLeft <= 0 && !isSubmittingRef.current) {
      handleAutoSubmit();
    }
  }, [timeLeft, handleAutoSubmit, toast]);

  // Calculate palette status for any question
  const getQuestionPaletteState = (qId: string) => {
    const ans = answersState[qId];
    if (!ans) return "not-visited";

    const hasAnswer =
      ans.selectedOptionIds.length > 0 || Boolean(ans.numericalAnswer && ans.numericalAnswer.trim());

    if (hasAnswer && ans.isMarkedForReview) return "answered-marked";
    if (ans.isMarkedForReview) return "marked-review";
    if (hasAnswer) return "answered";
    if (ans.isVisited) return "not-answered";
    return "not-visited";
  };

  // Summary counts for submission dialog
  const summaryCounts = React.useMemo(() => {
    let answered = 0;
    let unanswered = 0;
    let marked = 0;

    testQuestions.forEach((tq) => {
      const state = getQuestionPaletteState(tq.question.id);
      if (state === "answered" || state === "answered-marked") answered++;
      if (state === "not-answered" || state === "not-visited") unanswered++;
      if (state === "marked-review" || state === "answered-marked") marked++;
    });

    return { answered, unanswered, marked };
  }, [answersState, testQuestions]);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] -m-4 sm:-m-6 md:-m-8 bg-background overflow-hidden select-none">
      {/* -------------------------------------------------------------
          TOP BAR: Test Name | Countdown Timer | Submit
      ------------------------------------------------------------- */}
      <header className="flex h-14 items-center justify-between border-b border-border px-4 sm:px-6 bg-card shrink-0">
        <div className="flex items-center gap-3 truncate">
          <h1 className="text-sm sm:text-base font-bold text-foreground truncate">
            {attempt.test.title}
          </h1>
          <span className="hidden sm:inline-block text-muted-foreground text-xs">|</span>
          <span className="hidden sm:inline-block text-xs text-muted-foreground font-mono">
            {totalQuestions} Questions
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Live countdown timer */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-mono font-bold text-sm tracking-wider shadow-sm transition-colors ${
              timeLeft < 300
                ? "bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400 animate-pulse"
                : "bg-background border-border text-foreground"
            }`}
          >
            <Timer className="h-4 w-4" />
            <span>{formatSecondsToTime(timeLeft)}</span>
          </div>

          <Button
            size="sm"
            onClick={() => setSubmitModalOpen(true)}
            className="h-9 px-4 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            Submit Test
          </Button>

          {/* Mobile palette toggle */}
          <button
            onClick={() => setMobilePaletteOpen(!mobilePaletteOpen)}
            className="lg:hidden p-1.5 rounded-md border border-border bg-card"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* -------------------------------------------------------------
          SECTION TABS
      ------------------------------------------------------------- */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/30 px-4 sm:px-6 py-2 overflow-x-auto text-xs shrink-0">
        <span className="text-muted-foreground font-semibold uppercase text-[10px] tracking-wider shrink-0">
          Sections:
        </span>
        {sections.map((sec) => (
          <button
            key={sec}
            onClick={() => setActiveSection(sec)}
            className={`px-3 py-1 rounded-md transition-colors whitespace-nowrap font-medium ${
              activeSection === sec
                ? "bg-background text-foreground border border-border shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {sec}
          </button>
        ))}
      </div>

      {/* -------------------------------------------------------------
          MAIN CBT TERMINAL: Question Area + Question Palette
      ------------------------------------------------------------- */}
      <div className="flex flex-1 overflow-hidden">
        {/* Question Area */}
        <div className="flex-1 flex flex-col justify-between overflow-y-auto p-4 sm:p-6 md:p-8">
          {currentQ ? (
            <div className="space-y-6 max-w-4xl mx-auto w-full">
              {/* Question Meta Header */}
              <div className="flex items-center justify-between pb-3 border-b border-border/80">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-foreground">
                    Question {currentIdx + 1}
                  </span>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {currentQ.questionType}
                  </Badge>
                  <span className="text-xs text-muted-foreground hidden sm:inline-block">
                    Section: {currentTQ.sectionName}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs font-mono font-semibold">
                  <span className="text-emerald-600 dark:text-emerald-400">
                    +{questionMarks}
                  </span>
                  <span className="text-rose-600 dark:text-rose-400">
                    -{questionPenalty}
                  </span>
                </div>
              </div>

              {/* Question Text */}
              <div className="text-sm sm:text-base font-medium text-foreground leading-relaxed whitespace-pre-line py-2">
                {currentQ.questionText}
              </div>

              {/* Options or Numerical Input */}
              {currentQ.questionType === "NUMERICAL" ? (
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">
                    Enter Numerical Answer:
                  </label>
                  <input
                    type="text"
                    value={answersState[currentQ.id]?.numericalAnswer || ""}
                    onChange={(e) => handleNumericalChange(e.target.value)}
                    placeholder="e.g. 169"
                    className="h-11 max-w-xs w-full px-4 rounded-lg border border-input bg-card font-mono text-sm font-bold focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              ) : (
                <div className="space-y-3 pt-2">
                  {currentQ.options?.map((opt) => {
                    const isSelected = answersState[currentQ.id]?.selectedOptionIds.includes(
                      opt.id
                    );

                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleOptionSelect(opt.id)}
                        className={`flex items-start gap-3.5 p-3.5 sm:p-4 rounded-xl border text-xs sm:text-sm cursor-pointer transition-all ${
                          isSelected
                            ? "border-foreground bg-accent/60 font-semibold shadow-sm"
                            : "border-border bg-card hover:bg-muted/40"
                        }`}
                      >
                        <div
                          className={`h-5 w-5 rounded-full border flex items-center justify-center text-xs shrink-0 mt-0.5 transition-colors ${
                            isSelected
                              ? "border-foreground bg-foreground text-background"
                              : "border-muted-foreground/60 text-muted-foreground"
                          }`}
                        >
                          {opt.optionKey}
                        </div>
                        <div className="leading-relaxed flex-1">{opt.optionText}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-20 text-muted-foreground text-sm">
              No questions loaded in this test section.
            </div>
          )}

          {/* Action Bar (Previous, Mark for Review, Clear, Save & Next) */}
          <div className="pt-6 border-t border-border/80 max-w-4xl mx-auto w-full flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={currentIdx === 0}
                className="h-9 text-xs gap-1 border-border"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleClearResponse}
                className="h-9 text-xs gap-1 border-border text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Clear Response
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkForReviewAndNext}
                className="h-9 text-xs gap-1.5 border-purple-500/30 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10"
              >
                <Bookmark className="h-3.5 w-3.5" />
                {answersState[currentQ?.id || ""]?.isMarkedForReview
                  ? "Unmark Review"
                  : "Mark for Review & Next"}
              </Button>

              <Button
                size="sm"
                onClick={handleSaveAndNext}
                className="h-9 px-5 text-xs font-semibold gap-1"
              >
                Save & Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* -------------------------------------------------------------
            QUESTION PALETTE (Sidebar on Desktop, Drawer on Mobile)
        ------------------------------------------------------------- */}
        <aside
          className={`fixed inset-y-0 right-0 z-40 w-72 lg:static lg:w-80 border-l border-border bg-card flex flex-col shrink-0 transition-transform duration-200 ${
            mobilePaletteOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
          }`}
        >
          {/* Palette Header */}
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                Question Palette
              </h3>
              <p className="text-[11px] text-muted-foreground font-mono">
                {totalQuestions} Total Questions
              </p>
            </div>
            <button
              onClick={() => setMobilePaletteOpen(false)}
              className="lg:hidden p-1 rounded-md text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Palette Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-5 gap-2">
              {testQuestions.map((tq, index) => {
                const state = getQuestionPaletteState(tq.question.id);
                const isCurrent = currentIdx === index;

                let stateClasses = "cbt-not-visited";
                if (state === "not-answered") stateClasses = "cbt-not-answered";
                if (state === "answered") stateClasses = "cbt-answered";
                if (state === "marked-review") stateClasses = "cbt-marked-review";
                if (state === "answered-marked") stateClasses = "cbt-answered-marked";

                return (
                  <button
                    key={tq.id}
                    onClick={() => {
                      flushPendingSync();
                      setCurrentIdx(index);
                      setMobilePaletteOpen(false);
                    }}
                    className={`h-9 rounded-md flex items-center justify-center text-xs font-mono font-bold border transition-all ${stateClasses} ${
                      isCurrent ? "ring-2 ring-foreground scale-105" : "hover:opacity-80"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend Summary */}
          <div className="p-4 border-t border-border bg-muted/20 space-y-2 text-[11px]">
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <div className="h-3.5 w-3.5 rounded cbt-answered border" />
                <span className="font-mono">Answered ({summaryCounts.answered})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3.5 w-3.5 rounded cbt-not-answered border" />
                <span className="font-mono">Not Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3.5 w-3.5 rounded cbt-marked-review border" />
                <span className="font-mono">Review ({summaryCounts.marked})</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3.5 w-3.5 rounded cbt-not-visited border" />
                <span className="font-mono">Not Visited</span>
              </div>
            </div>

            <div className="pt-3 border-t border-border/80">
              <Button
                onClick={() => setSubmitModalOpen(true)}
                className="w-full h-9 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Submit Examination
              </Button>
            </div>
          </div>
        </aside>
      </div>

      {/* -------------------------------------------------------------
          SUBMIT CONFIRMATION MODAL
      ------------------------------------------------------------- */}
      <Dialog open={submitModalOpen} onOpenChange={setSubmitModalOpen}>
        <DialogContent className="max-w-md" onClose={() => setSubmitModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>Are you sure you want to submit?</DialogTitle>
            <DialogDescription>
              Once submitted, you cannot change your responses. Here is your current attempt summary:
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3">
            <div className="grid grid-cols-3 gap-3 p-3 rounded-lg border border-border bg-muted/30 text-center">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Answered</span>
                <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {summaryCounts.answered}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Unanswered</span>
                <p className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
                  {summaryCounts.unanswered}
                </p>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground uppercase font-bold">Marked</span>
                <p className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400">
                  {summaryCounts.marked}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSubmitModalOpen(false)}
              disabled={isSubmitting}
              className="text-xs"
            >
              Back to Test
            </Button>
            <Button
              onClick={handleConfirmSubmit}
              disabled={isSubmitting}
              className="text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Submitting...
                </>
              ) : (
                "Yes, Submit Test"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
