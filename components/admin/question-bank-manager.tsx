"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { deleteQuestionAction } from "@/actions/admin";
import {
  Plus,
  UploadCloud,
  Search,
  BookOpen,
  BrainCircuit,
  Calculator,
  Globe,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Eye,
  Trash2,
  Layers,
  X,
  Filter,
} from "lucide-react";

interface QuestionOption {
  id?: string;
  optionKey: string;
  optionText: string;
  isCorrect: boolean;
  orderIndex?: number;
}

export interface QuestionBankItem {
  id: string;
  questionText: string;
  questionType: string;
  subject: string;
  topic?: string | null;
  difficulty: string;
  marks: number;
  negativeMarks: number;
  explanation?: string | null;
  options?: QuestionOption[];
  createdAt?: string | Date;
}

interface QuestionBankStats {
  total: number;
  subjects: { subject: string; count: number }[];
  difficulties: { difficulty: string; count: number }[];
}

interface QuestionBankManagerProps {
  initialQuestions: QuestionBankItem[];
  stats: QuestionBankStats;
}

export function QuestionBankManager({ initialQuestions, stats }: QuestionBankManagerProps) {
  const [questions, setQuestions] = React.useState<QuestionBankItem[]>(initialQuestions);
  const [selectedSubject, setSelectedSubject] = React.useState<string>("ALL");
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<string>("ALL");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [currentPage, setCurrentPage] = React.useState(1);
  const [previewQuestion, setPreviewQuestion] = React.useState<QuestionBankItem | null>(null);
  const [isDeleting, setIsDeleting] = React.useState<string | null>(null);

  const router = useRouter();
  const { toast } = useToast();
  const PAGE_SIZE = 20;

  // Filter questions
  const filteredQuestions = React.useMemo(() => {
    return questions.filter((q) => {
      // Subject filter
      if (selectedSubject !== "ALL" && q.subject !== selectedSubject) {
        return false;
      }
      // Difficulty filter
      if (selectedDifficulty !== "ALL" && q.difficulty !== selectedDifficulty) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesText = q.questionText.toLowerCase().includes(query);
        const matchesTopic = q.topic?.toLowerCase().includes(query) || false;
        const matchesSubject = q.subject.toLowerCase().includes(query);
        const matchesExplanation = q.explanation?.toLowerCase().includes(query) || false;
        return matchesText || matchesTopic || matchesSubject || matchesExplanation;
      }
      return true;
    });
  }, [questions, selectedSubject, selectedDifficulty, searchQuery]);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [selectedSubject, selectedDifficulty, searchQuery]);

  // Pagination slice
  const totalPages = Math.ceil(filteredQuestions.length / PAGE_SIZE) || 1;
  const paginatedQuestions = React.useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredQuestions.slice(start, start + PAGE_SIZE);
  }, [filteredQuestions, currentPage]);

  const handleDelete = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question from the Question Bank?")) {
      return;
    }

    try {
      setIsDeleting(questionId);
      const res = await deleteQuestionAction(questionId);
      if (res.error) {
        toast({ title: "Error", description: res.error, type: "error" });
        return;
      }

      setQuestions((prev) => prev.filter((q) => q.id !== questionId));
      toast({ title: "Deleted", description: "Question removed from Question Bank.", type: "success" });
      router.refresh();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, type: "error" });
    } finally {
      setIsDeleting(null);
    }
  };

  // Subject icon helper
  const getSubjectIcon = (subject: string) => {
    const s = subject.toLowerCase();
    if (s.includes("english") || s.includes("comprehension") || s.includes("verbal")) {
      return <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    }
    if (s.includes("reasoning") || s.includes("intelligence") || s.includes("logic")) {
      return <BrainCircuit className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
    }
    if (s.includes("math") || s.includes("quant") || s.includes("aptitude") || s.includes("arithmetic")) {
      return <Calculator className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />;
    }
    if (s.includes("aware") || s.includes("general") || s.includes("gk") || s.includes("current") || s.includes("history")) {
      return <Globe className="h-5 w-5 text-amber-600 dark:text-amber-400" />;
    }
    return <Layers className="h-5 w-5 text-teal-600 dark:text-teal-400" />;
  };

  // Subject card color border helper
  const getSubjectColorClasses = (subject: string, isSelected: boolean) => {
    const s = subject.toLowerCase();
    if (isSelected) {
      return "border-primary ring-2 ring-primary/20 bg-primary/5";
    }
    if (s.includes("english")) return "hover:border-blue-500/50 hover:bg-blue-50/20";
    if (s.includes("reasoning")) return "hover:border-purple-500/50 hover:bg-purple-50/20";
    if (s.includes("quant")) return "hover:border-emerald-500/50 hover:bg-emerald-50/20";
    if (s.includes("aware")) return "hover:border-amber-500/50 hover:bg-amber-50/20";
    return "hover:border-teal-500/50 hover:bg-teal-50/20";
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Question Bank</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Master repository of verified examination questions categorized by subject verticals.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/questions/import">
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5 border-border">
              <UploadCloud className="h-3.5 w-3.5" />
              Bulk CSV Import
            </Button>
          </Link>
          <Link href="/admin/questions/create">
            <Button size="sm" className="h-8 text-xs font-semibold gap-1.5 shadow-sm">
              <Plus className="h-3.5 w-3.5" />
              Add Question
            </Button>
          </Link>
        </div>
      </div>

      {/* Category-wise Summary Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Layers className="h-3.5 w-3.5 text-primary" />
            Category-wise Distribution ({stats.subjects.length} Categories)
          </h2>
          {selectedSubject !== "ALL" && (
            <button
              onClick={() => setSelectedSubject("ALL")}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              Show All Categories ({stats.total})
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
          {/* Total Bank Card */}
          <Card
            onClick={() => setSelectedSubject("ALL")}
            className={`p-3 sm:p-4 border transition-all cursor-pointer ${
              selectedSubject === "ALL"
                ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/30"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-primary/10 p-1.5 sm:p-2 text-primary">
                <Layers className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <Badge variant="outline" className="text-[10px] font-mono">
                100%
              </Badge>
            </div>
            <div className="mt-2 sm:mt-3">
              <p className="text-xl sm:text-2xl font-black tracking-tight text-foreground">{stats.total}</p>
              <p className="text-xs font-semibold text-foreground mt-0.5">All Questions</p>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground">Entire Question Bank</p>
            </div>
          </Card>

          {/* Individual Subject Cards */}
          {stats.subjects.map((sub) => {
            const isSelected = selectedSubject === sub.subject;
            const percent = stats.total > 0 ? Math.round((sub.count / stats.total) * 100) : 0;

            return (
              <Card
                key={sub.subject}
                onClick={() => setSelectedSubject(isSelected ? "ALL" : sub.subject)}
                className={`p-3 sm:p-4 border transition-all cursor-pointer ${getSubjectColorClasses(
                  sub.subject,
                  isSelected
                )}`}
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-lg bg-muted/60 p-1.5 sm:p-2">{getSubjectIcon(sub.subject)}</div>
                  <Badge
                    variant={isSelected ? "default" : "outline"}
                    className="text-[10px] font-mono"
                  >
                    {percent}%
                  </Badge>
                </div>
                <div className="mt-2 sm:mt-3">
                  <p className="text-xl sm:text-2xl font-black tracking-tight text-foreground">{sub.count}</p>
                  <p className="text-xs font-semibold text-foreground mt-0.5 line-clamp-1" title={sub.subject}>
                    {sub.subject}
                  </p>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground">
                    {sub.count === 1 ? "1 question" : `${sub.count} questions`}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-border p-3 sm:p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search question text, topic, explanation..."
              className="pl-9 h-9 sm:h-8 text-xs bg-background w-full"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex items-center gap-2 w-full md:w-auto">
            {/* Subject Selector */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Filter className="h-3.5 w-3.5 shrink-0" />
              <span className="font-semibold text-foreground shrink-0">Subject:</span>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="h-9 sm:h-8 w-full rounded-md border border-input bg-background px-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="ALL">All Subjects ({stats.total})</option>
                {stats.subjects.map((s) => (
                  <option key={s.subject} value={s.subject}>
                    {s.subject} ({s.count})
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty Selector */}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground shrink-0">Diff:</span>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="h-9 sm:h-8 w-full rounded-md border border-input bg-background px-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="ALL">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            {(selectedSubject !== "ALL" || selectedDifficulty !== "ALL" || searchQuery) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedSubject("ALL");
                  setSelectedDifficulty("ALL");
                  setSearchQuery("");
                }}
                className="h-8 text-xs text-muted-foreground hover:text-foreground col-span-full lg:col-auto justify-center"
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-2">
          <span>
            Showing <strong>{filteredQuestions.length}</strong> of <strong>{questions.length}</strong> total questions
            {selectedSubject !== "ALL" && (
              <> in <strong>{selectedSubject}</strong></>
            )}
            {selectedDifficulty !== "ALL" && (
              <> ({selectedDifficulty})</>
            )}
          </span>
          <span>Page {currentPage} of {totalPages}</span>
        </div>
      </Card>

      {/* Questions Table & Mobile Cards */}
      <Card className="border-border">
        <CardContent className="p-0">
          {paginatedQuestions.length === 0 ? (
            <div className="text-center py-10 px-4 text-muted-foreground">
              <HelpCircle className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="font-semibold text-foreground text-sm">No questions found matching your criteria.</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Try clearing your search query or subject filters.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-border bg-muted/30 text-muted-foreground uppercase font-semibold">
                      <th className="py-3.5 px-4 w-12 text-center">#</th>
                      <th className="py-3.5 px-5">Question Text</th>
                      <th className="py-3.5 px-4">Subject & Topic</th>
                      <th className="py-3.5 px-3">Difficulty</th>
                      <th className="py-3.5 px-3 text-center">Marks</th>
                      <th className="py-3.5 px-4 text-center">Options</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {paginatedQuestions.map((q, idx) => {
                      const absoluteIndex = (currentPage - 1) * PAGE_SIZE + idx + 1;
                      return (
                        <tr key={q.id} className="hover:bg-muted/20 transition-colors">
                          <td className="py-3.5 px-4 text-center font-mono text-muted-foreground font-semibold">
                            {absoluteIndex}
                          </td>
                          <td className="py-3.5 px-5 max-w-md font-medium text-foreground">
                            <p className="line-clamp-2 leading-relaxed">{q.questionText}</p>
                            {q.explanation && (
                              <p className="text-[11px] text-muted-foreground line-clamp-1 mt-1 italic">
                                💡 {q.explanation}
                              </p>
                            )}
                          </td>
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <span className="font-semibold text-foreground block">{q.subject}</span>
                            <span className="text-muted-foreground text-[11px] block">{q.topic || "General"}</span>
                          </td>
                          <td className="py-3.5 px-3 whitespace-nowrap">
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-mono ${
                                q.difficulty === "EASY"
                                  ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/20"
                                  : q.difficulty === "HARD"
                                  ? "border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-50/20"
                                  : "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/20"
                              }`}
                            >
                              {q.difficulty}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono font-bold whitespace-nowrap text-foreground">
                            +{q.marks} / -{q.negativeMarks}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono text-muted-foreground whitespace-nowrap">
                            <Badge variant="secondary" className="text-[10px]">
                              {q.options?.length || 0} Options
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                onClick={() => setPreviewQuestion(q)}
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                                title="View Options & Solution"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                onClick={() => handleDelete(q.id)}
                                disabled={isDeleting === q.id}
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50/30"
                                title="Delete Question"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="md:hidden divide-y divide-border">
                {paginatedQuestions.map((q, idx) => {
                  const absoluteIndex = (currentPage - 1) * PAGE_SIZE + idx + 1;
                  return (
                    <div key={q.id} className="p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-muted-foreground">
                            #{absoluteIndex}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-mono ${
                              q.difficulty === "EASY"
                                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50/20"
                                : q.difficulty === "HARD"
                                ? "border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-50/20"
                                : "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/20"
                            }`}
                          >
                            {q.difficulty}
                          </Badge>
                          <Badge variant="secondary" className="text-[10px]">
                            {q.questionType}
                          </Badge>
                        </div>
                        <span className="font-mono text-xs font-bold text-foreground">
                          +{q.marks} / -{q.negativeMarks}
                        </span>
                      </div>

                      <div>
                        <p className="text-xs sm:text-sm font-medium text-foreground line-clamp-3 leading-relaxed">
                          {q.questionText}
                        </p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[11px] text-muted-foreground">
                          <span className="font-semibold text-foreground">{q.subject}</span>
                          {q.topic && (
                            <>
                              <span>•</span>
                              <span className="truncate max-w-[180px]">{q.topic}</span>
                            </>
                          )}
                        </div>
                        {q.explanation && (
                          <p className="text-[11px] text-muted-foreground line-clamp-1 mt-1.5 italic">
                            💡 {q.explanation}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50">
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {q.options?.length || 0} Options
                        </Badge>
                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => setPreviewQuestion(q)}
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1.5"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            View Options
                          </Button>
                          <Button
                            onClick={() => handleDelete(q.id)}
                            disabled={isDeleting === q.id}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50/30"
                            title="Delete Question"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border pt-4">
          <p className="text-xs text-muted-foreground text-center sm:text-left">
            Showing {(currentPage - 1) * PAGE_SIZE + 1} to{" "}
            {Math.min(currentPage * PAGE_SIZE, filteredQuestions.length)} of {filteredQuestions.length} questions
          </p>

          <div className="flex items-center justify-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 px-2.5 text-xs gap-1"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Button>

            <span className="text-xs font-semibold px-2 font-mono">
              {currentPage} / {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 px-2.5 text-xs gap-1"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Question Details Preview Modal */}
      {previewQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <Card className="w-full max-w-2xl border-border bg-card shadow-xl overflow-hidden max-h-[90vh] flex flex-col">
            <CardHeader className="p-5 border-b border-border flex flex-row items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {previewQuestion.questionType}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-mono ${
                      previewQuestion.difficulty === "EASY"
                        ? "border-emerald-500 text-emerald-600"
                        : previewQuestion.difficulty === "HARD"
                        ? "border-rose-500 text-rose-600"
                        : "border-amber-500 text-amber-600"
                    }`}
                  >
                    {previewQuestion.difficulty}
                  </Badge>
                  <span className="text-xs font-mono font-bold">
                    +{previewQuestion.marks} / -{previewQuestion.negativeMarks} Marks
                  </span>
                </div>
                <CardTitle className="text-sm font-semibold text-muted-foreground mt-1">
                  {previewQuestion.subject} • {previewQuestion.topic || "General"}
                </CardTitle>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPreviewQuestion(null)}
                className="h-8 w-8 text-muted-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-6 overflow-y-auto space-y-5">
              {/* Question Text */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Question Text
                </span>
                <div className="p-3.5 rounded-lg bg-muted/40 border border-border text-sm font-medium leading-relaxed">
                  {previewQuestion.questionText}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Options ({previewQuestion.options?.length || 0})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {previewQuestion.options?.map((opt) => (
                    <div
                      key={opt.optionKey}
                      className={`p-3 rounded-lg border text-xs flex items-start gap-2.5 ${
                        opt.isCorrect
                          ? "border-emerald-500/50 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300 font-semibold"
                          : "border-border bg-card text-foreground"
                      }`}
                    >
                      <span
                        className={`h-5 w-5 rounded-full flex items-center justify-center font-mono text-[11px] font-bold shrink-0 ${
                          opt.isCorrect
                            ? "bg-emerald-600 text-white"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {opt.optionKey}
                      </span>
                      <span className="flex-1 mt-0.5">{opt.optionText}</span>
                      {opt.isCorrect && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Explanation */}
              {previewQuestion.explanation && (
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Step-by-Step Explanation
                  </span>
                  <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-50/30 dark:bg-amber-950/10 text-xs leading-relaxed text-foreground">
                    {previewQuestion.explanation}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
