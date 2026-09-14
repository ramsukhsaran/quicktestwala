"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { createQuestionAction } from "@/actions/admin";
import { Loader2, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";

export function CreateQuestionForm() {
  const [loading, setLoading] = React.useState(false);
  const [questionType, setQuestionType] = React.useState<"MCQ" | "NUMERICAL">("MCQ");
  const [imageUrl, setImageUrl] = React.useState("");
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const res = await createQuestionAction(formData);

    if (res.error) {
      toast({ title: "Error", description: res.error, type: "error" });
      setLoading(false);
      return;
    }

    toast({
      title: "Success",
      description: "Question added to Question Bank!",
      type: "success",
    });

    router.push("/admin/questions");
  };

  return (
    <Card className="border-border max-w-3xl mx-auto">
      <CardHeader className="p-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link href="/admin/questions">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <CardTitle className="text-lg font-bold">Add Question to Bank</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Draft verified competitive exam questions with options and step-by-step solutions.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="questionType">Question Type</Label>
              <select
                id="questionType"
                name="questionType"
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as any)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="MCQ">Multiple Choice (Single Correct)</option>
                <option value="NUMERICAL">Numerical Answer</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subject">Subject</Label>
              <select
                id="subject"
                name="subject"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="General Intelligence & Reasoning">Reasoning & Logic</option>
                <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                <option value="English Comprehension">English Comprehension</option>
                <option value="General Awareness">General Awareness</option>
                <option value="Current Affairs">Current Affairs</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="difficulty">Difficulty</Label>
              <select
                id="difficulty"
                name="difficulty"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="MEDIUM">Medium</option>
                <option value="EASY">Easy</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="topic">Topic / Sub-theme</Label>
            <Input
              id="topic"
              name="topic"
              placeholder="e.g. Syllogisms, Profit & Loss, Indian Polity..."
              className="h-10 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="questionText">Question Text</Label>
            <Textarea
              id="questionText"
              name="questionText"
              rows={3}
              placeholder="Type the question content clearly..."
              required
              className="text-sm"
            />
          </div>

          {/* Optional Figure / Diagram Image */}
          <div className="space-y-2 p-3.5 rounded-xl border border-border/80 bg-muted/20">
            <div className="flex items-center justify-between">
              <Label htmlFor="imageUrl" className="text-xs font-semibold">
                Figure / Diagram Image URL (Optional)
              </Label>
              <span className="text-[10px] text-muted-foreground font-mono">
                Web URL, /images/... path, or base64 data URI
              </span>
            </div>
            <Input
              id="imageUrl"
              name="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="e.g. https://example.com/diagram.png or /images/questions/geometry1.svg"
              className="h-9 text-xs font-mono"
            />
            {imageUrl.trim() && (
              <div className="mt-2 p-2.5 rounded-lg border border-border bg-card">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Figure Live Preview:
                </p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl.trim()}
                  alt="Figure preview"
                  className="max-h-48 w-auto object-contain rounded mx-auto border border-border bg-muted/10 p-1"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              </div>
            )}
          </div>

          {questionType === "MCQ" ? (
            <div className="space-y-3 pt-2">
              <Label>Answer Options & Correct Key</Label>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold font-mono text-xs w-6 text-center">A</span>
                  <Input name="option_A" placeholder="Option A text" required className="h-9 text-xs" />
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                    <input type="radio" name="correct_option" value="A" required defaultChecked />
                    Correct
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold font-mono text-xs w-6 text-center">B</span>
                  <Input name="option_B" placeholder="Option B text" required className="h-9 text-xs" />
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                    <input type="radio" name="correct_option" value="B" required />
                    Correct
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold font-mono text-xs w-6 text-center">C</span>
                  <Input name="option_C" placeholder="Option C text" required className="h-9 text-xs" />
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                    <input type="radio" name="correct_option" value="C" required />
                    Correct
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold font-mono text-xs w-6 text-center">D</span>
                  <Input name="option_D" placeholder="Option D text" required className="h-9 text-xs" />
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                    <input type="radio" name="correct_option" value="D" required />
                    Correct
                  </label>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 pt-2">
              <Label htmlFor="correctNumericalAnswer">Correct Numerical Answer</Label>
              <Input
                id="correctNumericalAnswer"
                name="correctNumericalAnswer"
                placeholder="e.g. 169"
                required
                className="h-10 text-sm max-w-xs font-mono"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="marks">Marks Awarded</Label>
              <Input
                id="marks"
                name="marks"
                type="number"
                step="0.5"
                defaultValue="2.0"
                required
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="negativeMarks">Negative Penalty</Label>
              <Input
                id="negativeMarks"
                name="negativeMarks"
                type="number"
                step="0.25"
                defaultValue="0.5"
                required
                className="h-10 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="explanation">Step-by-Step Solution & Explanation</Label>
            <Textarea
              id="explanation"
              name="explanation"
              rows={3}
              placeholder="Explain the solution step-by-step with formulas or historical context..."
              className="text-sm"
            />
          </div>

          <div className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3 border-t border-border">
            <Link href="/admin/questions" className="w-full sm:w-auto">
              <Button type="button" variant="outline" className="text-xs w-full sm:w-auto h-9 sm:h-8">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading} className="text-xs font-semibold w-full sm:w-auto h-9 sm:h-8">
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Adding...
                </>
              ) : (
                "Save Question"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
