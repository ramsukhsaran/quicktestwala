"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { updateTestAction } from "@/actions/admin";

const buildInstructionsText = (marksPerQuestion: number, negativeMarkingRate: number) => {
  return [
    "1. The test comprises multiple sections.",
    `2. Each correct answer carries +${marksPerQuestion} marks.`,
    `3. There is a penalty of ${negativeMarkingRate} marks for each incorrect answer.`,
    "4. No marks are deducted for unattempted questions.",
    "5. The countdown timer in the top-right corner shows remaining time. Once the timer reaches zero, the test will automatically submit.",
  ].join("\n");
};

export function EditTestForm({ test }: { test: any }) {
  const [loading, setLoading] = React.useState(false);
  const [instructionText, setInstructionText] = React.useState(
    test.instructions || buildInstructionsText(Number(test.marksPerQuestion ?? 0), Number(test.negativeMarkingRate ?? 0))
  );
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.set("id", test.id);
    formData.set("instructions", instructionText);

    const res = await updateTestAction(formData);

    if (res.error) {
      toast({ title: "Error", description: res.error, type: "error" });
      setLoading(false);
      return;
    }

    toast({
      title: "Test Updated",
      description: "Mock test details were updated successfully.",
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
            <CardTitle className="text-lg font-bold">Edit Mock Test</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update marks, penalty, duration, and publishing details.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <input type="hidden" name="id" value={test.id} />

          <div className="space-y-1.5">
            <Label htmlFor="title">Test Name / Code</Label>
            <Input id="title" name="title" defaultValue={test.title} required className="h-10 text-sm" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" defaultValue={test.slug} required className="h-10 text-sm" />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} defaultValue={test.description || ""} className="text-sm" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="durationMinutes">Duration (Mins)</Label>
              <Input id="durationMinutes" name="durationMinutes" type="number" defaultValue={test.durationMinutes} required className="h-10 text-sm" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="totalMarks">Total Marks</Label>
              <Input id="totalMarks" name="totalMarks" type="number" step="0.5" defaultValue={test.totalMarks} required className="h-10 text-sm" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="passingMarks">Passing Marks</Label>
              <Input id="passingMarks" name="passingMarks" type="number" step="0.5" defaultValue={test.passingMarks} required className="h-10 text-sm" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="negativeMarkingRate">Penalty Mark</Label>
              <Input
                id="negativeMarkingRate"
                name="negativeMarkingRate"
                type="number"
                step="0.25"
                defaultValue={test.negativeMarkingRate}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="marksPerQuestion">Per Question</Label>
              <Input
                id="marksPerQuestion"
                name="marksPerQuestion"
                type="number"
                step="0.5"
                defaultValue={test.marksPerQuestion}
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
              <Label htmlFor="status">Status</Label>
              <select id="status" name="status" defaultValue={test.status || "PUBLISHED"} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                <option value="DRAFT">DRAFT</option>
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="ARCHIVED">ARCHIVED</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="instructions">Test Instructions</Label>
            <Textarea
              id="instructions"
              name="instructions"
              rows={4}
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
                  Saving...
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
