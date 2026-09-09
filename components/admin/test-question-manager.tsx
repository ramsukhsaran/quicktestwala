"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Link as LinkIcon,
  Trash2,
  Plus,
  Search,
  Filter,
  CheckSquare,
  Square,
  BookOpen,
  CheckCircle2,
  Loader2,
  Sparkles,
  Layers,
  HelpCircle,
} from "lucide-react";

interface TestQuestionManagerProps {
  testId: string;
  initialData: {
    test: any;
    linkedQuestions: any[];
    availableQuestions: any[];
    totalLinkedCount: number;
    totalBankCount: number;
  };
}

export function TestQuestionManager({ testId, initialData }: TestQuestionManagerProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [test, setTest] = React.useState(initialData.test);
  const [linked, setLinked] = React.useState(initialData.linkedQuestions || []);
  const [available, setAvailable] = React.useState(initialData.availableQuestions || []);

  // Filter & Search states for Question Bank
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedSubject, setSelectedSubject] = React.useState<string>("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<string>("ALL");
  const [targetSection, setTargetSection] = React.useState<string>("General Section");

  // Selection state
  const [selectedQIds, setSelectedQIds] = React.useState<Set<string>>(new Set());
  const [isLinking, setIsLinking] = React.useState(false);
  const [unlinkingId, setUnlinkingId] = React.useState<string | null>(null);

  // Extract subjects from available and linked questions
  const subjects = React.useMemo(() => {
    const subs = new Set<string>();
    available.forEach((q) => q.subject && subs.add(q.subject));
    linked.forEach((l) => l.question?.subject && subs.add(l.question.subject));
    return Array.from(subs);
  }, [available, linked]);

  // Filtered available questions
  const filteredAvailable = React.useMemo(() => {
    return available.filter((q) => {
      if (selectedSubject !== "ALL" && q.subject !== selectedSubject) return false;
      if (selectedDifficulty !== "ALL" && q.difficulty !== selectedDifficulty) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const text = (q.questionText || "").toLowerCase();
        const topic = (q.topic || "").toLowerCase();
        if (!text.includes(query) && !topic.includes(query)) return false;
      }
      return true;
    });
  }, [available, selectedSubject, selectedDifficulty, searchQuery]);

  const toggleSelect = (id: string) => {
    setSelectedQIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedQIds.size === filteredAvailable.length) {
      setSelectedQIds(new Set());
    } else {
      setSelectedQIds(new Set(filteredAvailable.map((q) => q.id)));
    }
  };

  // Handle Linking Questions
  const handleLinkQuestions = async () => {
    if (selectedQIds.size === 0) {
      toast({
        title: "No Questions Selected",
        description: "Please select at least one question to link.",
        type: "error",
      });
      return;
    }

    setIsLinking(true);
    const qIdsArray = Array.from(selectedQIds);

    try {
      const res = await fetch(`/api/tests/${testId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionIds: qIdsArray,
          sectionName: targetSection || "General Section",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to link questions");
      }

      toast({
        title: "Questions Linked Successfully",
        description: `Attached ${qIdsArray.length} question(s) to ${test.title}.`,
        type: "success",
      });

      // Update local state
      const newlyLinked = available.filter((q) => selectedQIds.has(q.id));
      const remainingAvailable = available.filter((q) => !selectedQIds.has(q.id));

      const newLinkedItems = newlyLinked.map((q, idx) => ({
        id: `tq_${Date.now()}_${idx}`,
        testId,
        questionId: q.id,
        sectionName: targetSection || "General Section",
        orderIndex: linked.length + idx + 1,
        question: q,
      }));

      setLinked([...linked, ...newLinkedItems]);
      setAvailable(remainingAvailable);
      setSelectedQIds(new Set());

      // Update test total marks in local state
      const newTotalMarks = json.data?.totalMarks ?? (linked.length + qIdsArray.length) * (test.marksPerQuestion || 2);
      setTest((prev: any) => ({ ...prev, totalMarks: newTotalMarks }));

      router.refresh();
    } catch (err: any) {
      toast({
        title: "Error Linking Questions",
        description: err.message || "Failed to link questions to mock test.",
        type: "error",
      });
    } finally {
      setIsLinking(false);
    }
  };

  // Handle Unlinking a Question
  const handleUnlink = async (questionId: string) => {
    setUnlinkingId(questionId);

    try {
      const res = await fetch(`/api/tests/${testId}/questions?questionId=${questionId}`, {
        method: "DELETE",
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to unlink question");
      }

      toast({
        title: "Question Unlinked",
        description: "Removed question from mock test.",
        type: "success",
      });

      const removedItem = linked.find((item) => item.questionId === questionId);
      const remainingLinked = linked.filter((item) => item.questionId !== questionId);

      setLinked(remainingLinked);
      if (removedItem && removedItem.question) {
        setAvailable([removedItem.question, ...available]);
      }

      const newTotalMarks = json.data?.totalMarks ?? Math.max(0, (linked.length - 1) * (test.marksPerQuestion || 2));
      setTest((prev: any) => ({ ...prev, totalMarks: newTotalMarks }));

      router.refresh();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Could not unlink question.",
        type: "error",
      });
    } finally {
      setUnlinkingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Navigation & Test Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/admin/tests">
              <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Tests
              </Button>
            </Link>
            <span className="text-muted-foreground">/</span>
            <h1 className="text-xl font-bold tracking-tight">{test.title}</h1>
            <Badge variant="outline" className="text-xs font-mono">
              {test.testSeries?.examName || "Mock Exam"}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground pl-1">
            Attach verified questions from the Question Bank into this test under specific sections.
          </p>
        </div>

        {/* Live Calculation Pill */}
        <div className="grid grid-cols-3 gap-2 bg-muted/40 p-2.5 px-3 sm:px-4 rounded-xl border border-border w-full sm:w-auto text-center sm:text-right">
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold block truncate">Linked Qs</span>
            <span className="text-xs sm:text-sm font-bold font-mono">{linked.length} Qs</span>
          </div>
          <div className="border-x border-border px-1 sm:px-2">
            <span className="text-[10px] text-muted-foreground uppercase font-semibold block truncate">Total Marks</span>
            <span className="text-xs sm:text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {test.totalMarks}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-semibold block truncate">Per Q</span>
            <span className="text-xs sm:text-sm font-bold font-mono">+{test.marksPerQuestion}/-{test.negativeMarkingRate}</span>
          </div>
        </div>
      </div>

      {/* Main Tabs: Linked Questions vs Add from Bank */}
      <Tabs defaultValue="linked" className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-border pb-3">
          <TabsList className="bg-muted/60 border border-border w-full sm:w-auto grid grid-cols-2">
            <TabsTrigger value="linked" className="text-xs font-semibold gap-1.5">
              <Layers className="h-3.5 w-3.5" />
              Linked ({linked.length})
            </TabsTrigger>
            <TabsTrigger value="add" className="text-xs font-semibold gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add Bank ({available.length})
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <Link href={`/admin/tests/${testId}/edit`} className="flex-1 sm:flex-none">
              <Button variant="outline" size="sm" className="h-8 text-xs w-full sm:w-auto">
                Edit Settings
              </Button>
            </Link>
            <Link href={`/student/tests/${testId}/instructions`} target="_blank" className="flex-1 sm:flex-none">
              <Button size="sm" className="h-8 text-xs font-semibold gap-1 w-full sm:w-auto">
                <BookOpen className="h-3.5 w-3.5" />
                Preview CBT
              </Button>
            </Link>
          </div>
        </div>

        {/* TAB 1: CURRENTLY LINKED QUESTIONS */}
        <TabsContent value="linked" className="mt-4">
          <Card className="border-border">
            <CardHeader className="p-4 sm:p-6 pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold">Active Mock Test Questions</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Questions attached to this test will appear in the candidate CBT examination.
                  </CardDescription>
                </div>
                <Badge variant="outline" className="text-xs font-mono font-bold">
                  {linked.length} Attached
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {linked.length === 0 ? (
                <div className="p-12 text-center text-xs text-muted-foreground space-y-3">
                  <Layers className="h-10 w-10 mx-auto text-muted-foreground/60" />
                  <p className="font-semibold text-foreground text-sm">No questions attached to this mock test yet.</p>
                  <p className="max-w-sm mx-auto">
                    Click the &quot;Add From Question Bank&quot; tab above to select questions and link them to this test.
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border bg-muted/30 text-muted-foreground uppercase font-semibold">
                          <th className="py-3 px-4 w-12 text-center">#</th>
                          <th className="py-3 px-6">Question Text</th>
                          <th className="py-3 px-4">Section Name</th>
                          <th className="py-3 px-4">Subject & Topic</th>
                          <th className="py-3 px-4">Difficulty</th>
                          <th className="py-3 px-4">Marks</th>
                          <th className="py-3 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {linked.map((item, idx) => {
                          const q = item.question || {};
                          return (
                            <tr key={item.id || item.questionId} className="hover:bg-muted/20 transition-colors">
                              <td className="py-3.5 px-4 text-center font-mono font-bold text-muted-foreground">
                                {idx + 1}
                              </td>
                              <td className="py-3.5 px-6 max-w-md font-medium text-foreground">
                                <p className="line-clamp-2 leading-relaxed">{q.questionText}</p>
                              </td>
                              <td className="py-3.5 px-4 font-medium">
                                <Badge variant="secondary" className="text-[10px]">
                                  {item.sectionName || "General Section"}
                                </Badge>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="font-semibold text-foreground block">{q.subject}</span>
                                <span className="text-muted-foreground text-[11px] block">{q.topic || "-"}</span>
                              </td>
                              <td className="py-3.5 px-4">
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
                              <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                                +{test.marksPerQuestion} / -{test.negativeMarkingRate}
                              </td>
                              <td className="py-3.5 px-6 text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={unlinkingId === item.questionId}
                                  onClick={() => handleUnlink(item.questionId)}
                                  className="h-7 px-2.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 border-border"
                                >
                                  {unlinkingId === item.questionId ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    <>
                                      <Trash2 className="h-3 w-3 mr-1" />
                                      Unlink
                                    </>
                                  )}
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card List View */}
                  <div className="md:hidden divide-y divide-border">
                    {linked.map((item, idx) => {
                      const q = item.question || {};
                      return (
                        <div key={item.id || item.questionId} className="p-4 space-y-3">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-muted-foreground">
                                #{idx + 1}
                              </span>
                              <Badge variant="secondary" className="text-[10px]">
                                {item.sectionName || "General Section"}
                              </Badge>
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
                            </div>
                            <span className="font-mono text-xs font-bold text-foreground">
                              +{test.marksPerQuestion} / -{test.negativeMarkingRate}
                            </span>
                          </div>

                          <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-3 leading-relaxed">
                            {q.questionText}
                          </p>

                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50">
                            <div className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                              <span className="font-semibold text-foreground">{q.subject}</span>
                              {q.topic && <span> • {q.topic}</span>}
                            </div>

                            <Button
                              variant="outline"
                              size="sm"
                              disabled={unlinkingId === item.questionId}
                              onClick={() => handleUnlink(item.questionId)}
                              className="h-8 px-3 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 border-border"
                            >
                              {unlinkingId === item.questionId ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <>
                                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                                  Unlink
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: ADD FROM QUESTION BANK */}
        <TabsContent value="add" className="mt-4 space-y-4">
          <Card className="border-border">
            <CardHeader className="p-4 sm:p-6 pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-bold">Select Questions from Master Bank</CardTitle>
                  <CardDescription className="text-xs mt-0.5">
                    Filter by subject or difficulty, select questions with checkboxes, and link them to this mock test.
                  </CardDescription>
                </div>

                {/* Linking Actions Bar */}
                <div className="flex flex-col sm:flex-row sm:items-end gap-2.5 w-full sm:w-auto">
                  <div className="space-y-1 w-full sm:w-48">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold block">Target Section</span>
                    <Input
                      value={targetSection}
                      onChange={(e) => setTargetSection(e.target.value)}
                      placeholder="e.g. Quantitative Aptitude"
                      className="h-9 sm:h-8 text-xs w-full"
                    />
                  </div>
                  <Button
                    size="sm"
                    disabled={selectedQIds.size === 0 || isLinking}
                    onClick={handleLinkQuestions}
                    className="h-9 px-4 text-xs font-semibold gap-1.5 shadow-sm w-full sm:w-auto"
                  >
                    {isLinking ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                        Linking...
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" />
                        Link Selected ({selectedQIds.size})
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
                {/* Search */}
                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search question text or topic..."
                    className="h-9 sm:h-8 pl-8 text-xs"
                  />
                </div>

                {/* Subject Filter */}
                <div>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full h-9 sm:h-8 px-2.5 rounded-md border border-input bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="ALL">All Subjects ({available.length})</option>
                    {subjects.map((sub) => (
                      <option key={sub} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Difficulty Filter */}
                <div>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full h-9 sm:h-8 px-2.5 rounded-md border border-input bg-background text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="ALL">All Difficulties</option>
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {filteredAvailable.length === 0 ? (
                <div className="p-12 text-center text-xs text-muted-foreground">
                  No matching questions found in the Question Bank.
                </div>
              ) : (
                <>
                  {/* Mobile Select All Bar */}
                  <div className="md:hidden flex items-center justify-between p-3 border-b border-border bg-muted/20 text-xs">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="flex items-center gap-2 font-medium text-muted-foreground hover:text-foreground"
                    >
                      {selectedQIds.size === filteredAvailable.length && filteredAvailable.length > 0 ? (
                        <CheckSquare className="h-4 w-4 text-primary" />
                      ) : (
                        <Square className="h-4 w-4" />
                      )}
                      <span>Select All ({filteredAvailable.length})</span>
                    </button>
                    <span className="text-muted-foreground font-mono text-[11px]">
                      {selectedQIds.size} chosen
                    </span>
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border bg-muted/30 text-muted-foreground uppercase font-semibold">
                          <th className="py-3 px-4 w-12 text-center">
                            <button
                              type="button"
                              onClick={toggleSelectAll}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              {selectedQIds.size === filteredAvailable.length && filteredAvailable.length > 0 ? (
                                <CheckSquare className="h-4 w-4 text-primary" />
                              ) : (
                                <Square className="h-4 w-4" />
                              )}
                            </button>
                          </th>
                          <th className="py-3 px-6">Question Text</th>
                          <th className="py-3 px-4">Subject & Topic</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Difficulty</th>
                          <th className="py-3 px-4">Options</th>
                          <th className="py-3 px-6 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredAvailable.map((q) => {
                          const isChecked = selectedQIds.has(q.id);
                          return (
                            <tr
                              key={q.id}
                              onClick={() => toggleSelect(q.id)}
                              className={`cursor-pointer transition-colors ${
                                isChecked ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-muted/20"
                              }`}
                            >
                              <td className="py-3.5 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSelect(q.id);
                                  }}
                                >
                                  {isChecked ? (
                                    <CheckSquare className="h-4 w-4 text-primary" />
                                  ) : (
                                    <Square className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </button>
                              </td>
                              <td className="py-3.5 px-6 max-w-md font-medium text-foreground">
                                <p className="line-clamp-2 leading-relaxed">{q.questionText}</p>
                              </td>
                              <td className="py-3.5 px-4">
                                <span className="font-semibold text-foreground block">{q.subject}</span>
                                <span className="text-muted-foreground text-[11px] block">{q.topic || "-"}</span>
                              </td>
                              <td className="py-3.5 px-4 font-mono text-[10px]">
                                {q.questionType}
                              </td>
                              <td className="py-3.5 px-4">
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
                              <td className="py-3.5 px-4 font-mono text-muted-foreground">
                                {q.options?.length || 0} Options
                              </td>
                              <td className="py-3.5 px-6 text-right">
                                <Button
                                  size="sm"
                                  variant={isChecked ? "secondary" : "outline"}
                                  className="h-7 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleSelect(q.id);
                                  }}
                                >
                                  {isChecked ? "Selected" : "Select"}
                                </Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Card List View */}
                  <div className="md:hidden divide-y divide-border">
                    {filteredAvailable.map((q) => {
                      const isChecked = selectedQIds.has(q.id);
                      return (
                        <div
                          key={q.id}
                          onClick={() => toggleSelect(q.id)}
                          className={`p-4 space-y-3 cursor-pointer transition-colors ${
                            isChecked ? "bg-primary/5" : "hover:bg-muted/10"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSelect(q.id);
                                }}
                                className="h-6 w-6 flex items-center justify-center -ml-1 text-foreground"
                              >
                                {isChecked ? (
                                  <CheckSquare className="h-4 w-4 text-primary" />
                                ) : (
                                  <Square className="h-4 w-4 text-muted-foreground" />
                                )}
                              </button>
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
                              <Badge variant="secondary" className="text-[10px]">
                                {q.questionType}
                              </Badge>
                            </div>
                            <Badge variant="outline" className="text-[10px] font-mono">
                              {q.options?.length || 0} Options
                            </Badge>
                          </div>

                          <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-3 leading-relaxed">
                            {q.questionText}
                          </p>

                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50">
                            <div className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                              <span className="font-semibold text-foreground">{q.subject}</span>
                              {q.topic && <span> • {q.topic}</span>}
                            </div>

                            <Button
                              size="sm"
                              variant={isChecked ? "secondary" : "outline"}
                              className="h-8 px-3 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelect(q.id);
                              }}
                            >
                              {isChecked ? "Selected" : "Select"}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
