"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { updateTestSeriesAction } from "@/actions/admin";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface EditTestSeriesFormProps {
  series: any;
  categories: any[];
}

export function EditTestSeriesForm({ series, categories }: EditTestSeriesFormProps) {
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    formData.append("id", series.id);
    const res = await updateTestSeriesAction(formData);

    if (res.error) {
      toast({ title: "Error", description: res.error, type: "error" });
      setLoading(false);
      return;
    }

    toast({
      title: "Success",
      description: "Test series updated successfully!",
      type: "success",
    });

    router.push("/admin/test-series");
  };

  return (
    <Card className="border-border max-w-3xl mx-auto">
      <CardHeader className="p-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link href="/admin/test-series">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <CardTitle className="text-lg font-bold">Edit Test Series</CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Update pricing, status (Active/Inactive), description, or category assignment.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="title">Series Title</Label>
            <Input
              id="title"
              name="title"
              defaultValue={series.title}
              required
              className="h-10 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="slug">Slug (URL-friendly)</Label>
              <Input
                id="slug"
                name="slug"
                defaultValue={series.slug}
                required
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="examName">Exam Name</Label>
              <Input
                id="examName"
                name="examName"
                defaultValue={series.examName}
                required
                className="h-10 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="categoryId">Category</Label>
              <select
                id="categoryId"
                name="categoryId"
                defaultValue={series.categoryId || ""}
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="difficulty">Difficulty</Label>
              <select
                id="difficulty"
                name="difficulty"
                defaultValue={series.difficulty || "MEDIUM"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="language">Language</Label>
              <Input
                id="language"
                name="language"
                defaultValue={series.language || "Bilingual (Hindi + English)"}
                className="h-10 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="price">
                Price (₹ INR) <span className="text-muted-foreground font-normal">(0 = Free)</span>
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                defaultValue={series.price ?? 0}
                required
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="discountPrice">Discounted Price (₹ INR)</Label>
              <Input
                id="discountPrice"
                name="discountPrice"
                type="number"
                defaultValue={series.discountPrice ?? 0}
                className="h-10 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">Publish Status</Label>
              <select
                id="status"
                name="status"
                defaultValue={series.status || "PUBLISHED"}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="PUBLISHED">Active (Published)</option>
                <option value="DRAFT">Inactive (Draft)</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="shortDescription">Short Summary</Label>
            <Input
              id="shortDescription"
              name="shortDescription"
              defaultValue={series.shortDescription || ""}
              placeholder="1-line summary for student cards..."
              className="h-10 text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Detailed Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={series.description || ""}
              placeholder="Describe syllabus coverage, difficulty standards, solutions methodology..."
              required
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="thumbnail">Thumbnail Image URL</Label>
            <Input
              id="thumbnail"
              name="thumbnail"
              defaultValue={series.thumbnail || ""}
              placeholder="https://images.unsplash.com/..."
              className="h-10 text-sm"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isFeatured"
              name="isFeatured"
              defaultChecked={Boolean(series.isFeatured)}
              className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
            />
            <Label htmlFor="isFeatured" className="cursor-pointer text-xs font-medium">
              Feature this test series prominently on the student homepage
            </Label>
          </div>

          <div className="pt-4 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 sm:gap-3 border-t border-border">
            <Link href="/admin/test-series" className="w-full sm:w-auto">
              <Button type="button" variant="outline" className="text-xs w-full sm:w-auto h-9 sm:h-8">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={loading} className="text-xs font-semibold w-full sm:w-auto h-9 sm:h-8">
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                  Saving Changes...
                </>
              ) : (
                "Update Test Series"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
