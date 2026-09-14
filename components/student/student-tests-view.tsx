"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExportTestButton } from "@/components/student/export-test-button";
import { formatDuration, formatCurrency } from "@/lib/utils";
import {
  Timer,
  BookOpenCheck,
  Lock,
  CheckCircle2,
  Gift,
  Layers,
  Filter,
  Sparkles,
} from "lucide-react";

interface StudentTestsViewProps {
  tests: any[];
  completedTestIds: string[];
}

export function StudentTestsView({ tests, completedTestIds }: StudentTestsViewProps) {
  const [filter, setFilter] = React.useState<"ALL" | "UNLOCKED" | "FREE" | "COMPLETED">("ALL");
  const completedTestSet = React.useMemo(() => new Set(completedTestIds), [completedTestIds]);

  const filteredTests = React.useMemo(() => {
    return tests.filter((test) => {
      if (filter === "UNLOCKED" && !test.isAccessible) return false;
      if (filter === "FREE" && !test.isFree) return false;
      if (filter === "COMPLETED" && !completedTestSet.has(test.id)) return false;
      return true;
    });
  }, [tests, filter, completedTestSet]);

  const counts = React.useMemo(() => {
    return {
      all: tests.length,
      unlocked: tests.filter((t) => t.isAccessible).length,
      free: tests.filter((t) => t.isFree).length,
      completed: tests.filter((t) => completedTestSet.has(t.id)).length,
    };
  }, [tests, completedTestSet]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Available Mock Tests</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Attempt free practice tests and your enrolled full-length examination CBT mocks.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-muted-foreground font-medium shrink-0 flex items-center gap-1">
            <Filter className="h-3 w-3" />
            Filter:
          </span>
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={`px-3 py-1 rounded-full border transition-colors shrink-0 font-medium ${
              filter === "ALL"
                ? "bg-foreground text-background border-foreground font-semibold"
                : "border-border hover:bg-muted text-muted-foreground"
            }`}
          >
            All Tests ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => setFilter("UNLOCKED")}
            className={`px-3 py-1 rounded-full border transition-colors shrink-0 font-medium ${
              filter === "UNLOCKED"
                ? "bg-emerald-600 text-white border-emerald-600 font-semibold"
                : "border-border hover:bg-muted text-muted-foreground"
            }`}
          >
            My Unlocked ({counts.unlocked})
          </button>
          <button
            type="button"
            onClick={() => setFilter("FREE")}
            className={`px-3 py-1 rounded-full border transition-colors shrink-0 font-medium ${
              filter === "FREE"
                ? "bg-sky-600 text-white border-sky-600 font-semibold"
                : "border-border hover:bg-muted text-muted-foreground"
            }`}
          >
            Free Practice ({counts.free})
          </button>
          <button
            type="button"
            onClick={() => setFilter("COMPLETED")}
            className={`px-3 py-1 rounded-full border transition-colors shrink-0 font-medium ${
              filter === "COMPLETED"
                ? "bg-purple-600 text-white border-purple-600 font-semibold"
                : "border-border hover:bg-muted text-muted-foreground"
            }`}
          >
            Completed ({counts.completed})
          </button>
        </div>
      </div>

      {filteredTests.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center bg-card">
          <Layers className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground">No mock tests found</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
            {tests.length === 0
              ? "No mock tests are currently available in this test series."
              : "No tests match your selected filter."}
          </p>
          <Link href="/test-series" className="inline-block mt-4">
            <Button size="sm" className="text-xs font-semibold">
              Explore Test Series Catalog
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTests.map((test, idx) => {
            const isSubscribed = Boolean(test.isAccessible);
            const isFree = Boolean(test.isFree);
            const hasAttempted = completedTestSet.has(test.id);
            const seriesPrice = test.testSeries?.discountPrice || test.testSeries?.price || 0;

            return (
              <div
                key={test.id}
                className={`p-5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm ${
                  isSubscribed
                    ? "border-border bg-card hover:border-foreground/25"
                    : "border-border/80 bg-muted/20 opacity-90"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`h-10 w-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm shrink-0 mt-0.5 ${
                      isSubscribed ? "bg-muted text-foreground" : "bg-muted/80 text-muted-foreground"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        CBT Exam
                      </Badge>
                      {isFree ? (
                        <Badge className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold gap-1">
                          <Gift className="h-2.5 w-2.5" /> Free Practice
                        </Badge>
                      ) : isSubscribed ? (
                        <Badge className="bg-purple-600/15 text-purple-700 dark:text-purple-300 text-[10px] font-bold gap-1">
                          <Sparkles className="h-2.5 w-2.5" /> Unlocked
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-amber-600 border-amber-500/40 text-[10px] font-bold gap-1">
                          <Lock className="h-2.5 w-2.5" /> Paid Test Series
                        </Badge>
                      )}
                      <h2 className="text-base font-bold text-foreground">
                        {test.title}
                      </h2>
                    </div>

                    {test.testSeries && (
                      <p className="text-[11px] text-muted-foreground font-mono">
                        Vertical: {test.testSeries.examName} • {test.testSeries.title}
                      </p>
                    )}

                    <p className="text-xs text-muted-foreground line-clamp-1 max-w-2xl">
                      {test.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1 font-mono">
                        <Timer className="h-3 w-3" />
                        {formatDuration(test.durationMinutes)}
                      </span>
                      <span>•</span>
                      <span className="font-mono">
                        {test.totalMarks} Marks
                      </span>
                      <span>•</span>
                      <span>
                        +{test.marksPerQuestion} / -{test.negativeMarkingRate} Marking
                      </span>
                      {hasAttempted && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Completed
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <ExportTestButton
                    testId={test.id}
                    isSubscribed={isSubscribed}
                    hasAttempted={hasAttempted}
                  />

                  {isSubscribed ? (
                    <Link href={`/student/tests/${test.id}/instructions`}>
                      <Button size="sm" className="h-9 px-4 text-xs font-semibold gap-1.5 shadow-sm">
                        <BookOpenCheck className="h-3.5 w-3.5" />
                        {hasAttempted ? "Retake Test" : "Instructions & Start"}
                      </Button>
                    </Link>
                  ) : (
                    <Link href={`/test-series/${test.testSeries?.slug || ""}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9 px-4 text-xs font-semibold gap-1.5 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/10 shadow-sm"
                      >
                        <Lock className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                        Unlock Series ({formatCurrency(seriesPrice)})
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
