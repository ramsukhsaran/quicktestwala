"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { createTestAction } from "@/actions/admin";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

const buildInstructionsText = (marksPerQuestion: number, negativeMarkingRate: number) => {
  return [
    "1. The test comprises multiple sections.",
    `2. Each correct answer carries +${marksPerQuestion} marks.`,
    `3. There is a penalty of ${negativeMarkingRate} marks for each incorrect answer.`,
    "4. No marks are deducted for unattempted questions.",
    "5. The countdown timer in the top-right corner shows remaining time. Once the timer reaches zero, the test will automatically submit.",
  ].join("\n");
};

export function CreateTestForm({ seriesList }: { seriesList: any[] }) {
  const [loading, setLoading] = React.useState(false);
  const [instructionText, setInstructionText] = React.useState("");
  const router = useRouter();
  const { toast } = useToast();

  React.useEffect(() => {
    const currentMarks = Number((document.getElementById("marksPerQuestion") as HTMLInputElement)?.value || 0);
    const currentPenalty = Number((document.getElementById("negativeMarkingRate") as HTMLInputElement)?.value || 0);
    setInstructionText(buildInstructionsText(currentMarks, currentPenalty));
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("instructions", instructionText);
    const res = await createTestAction(formData);

    if (res.error) {
      toast({ title: "Error", description: res.error, type: "error" });
      setLoading(false);
      return;
    }

    toast({
      title: "Success",
      description: "Mock test created successfully!",
      type: "success",
    });

    router.push("/admin/tests");
  };

  return (
    <Card className="border-border max-w-3xl mx-auto">
      <CardHeader className="p-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link href="/admin/tests">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <CardTitle className="text-lg font-bold">Create New Mock Test</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Set timing constraints, negative marks, and test instructions.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="testSeriesId">Target Test Series</Label>
            <select
              id="testSeriesId"
              name="testSeriesId"
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {seriesList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.title} ({s.examName})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Test Name / Code</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. SSC CGL Tier 1 Mock 03"
                required
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                placeholder="e.g. ssc-cgl-tier-1-mock-03"
                required
                className="h-10 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="durationMinutes">Duration (Mins)</Label>
              <Input
                id="durationMinutes"
                name="durationMinutes"
                type="number"
                defaultValue="60"
                required
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="totalMarks">Total Marks</Label>
              <Input
                id="totalMarks"
                name="totalMarks"
                type="number"
                defaultValue="200"
                required
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="marksPerQuestion">Per Question</Label>
              <Input
                id="marksPerQuestion"
                name="marksPerQuestion"
                type="number"
                step="0.5"
                defaultValue="2.0"
                required
                className="h-10 text-sm"
                onChange={(e) => {
                  const nextMarks = Number(e.target.value ?? 0);
                  const currentPenalty = Number((document.getElementById("negativeMarkingRate") as HTMLInputElement)?.value ?? 0);
                  setInstructionText(buildInstructionsText(nextMarks, currentPenalty));
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="negativeMarkingRate">Penalty Mark</Label>
              <Input
                id="negativeMarkingRate"
                name="negativeMarkingRate"
                type="number"
                step="0.25"
                defaultValue="0.5"
                required
                className="h-10 text-sm"
                onChange={(e) => {
                  const nextPenalty = Number(e.target.value ?? 0);
                  const currentMarks = Number((document.getElementById("marksPerQuestion") as HTMLInputElement)?.value ?? 0);
                  setInstructionText(buildInstructionsText(currentMarks, nextPenalty));
                }}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="instructions">Test Instructions</Label>
            <Textarea
              id="instructions"
              name="instructions"
              rows={3}
              value={instructionText}
              onChange={(e) => setInstructionText(e.target.value)}
              className="text-sm"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-border">
            <Link href="/admin/tests">
              <Button type="button" variant="outline" className="text-xs">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading} className="text-xs font-semibold">
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Creating...
                </>
              ) : (
                "Save Mock Test"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
