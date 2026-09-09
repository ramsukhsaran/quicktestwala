import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getAllTests, createTest } from "@/lib/data/store";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const seriesId = url.searchParams.get("seriesId") || undefined;

    let tests: any[] = await getAllTests();
    if (seriesId) {
      tests = tests.filter((t: any) => t.testSeriesId === seriesId);
    }

    return apiSuccess(tests);
  } catch (err: any) {
    return apiError(err.message || "Failed to retrieve tests", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();

    const {
      testSeriesId,
      title,
      slug,
      description,
      durationMinutes,
      totalMarks,
      passingMarks,
      negativeMarkingRate,
      marksPerQuestion,
      instructions,
      status,
    } = body;

    if (!testSeriesId || !title) {
      return apiError("testSeriesId and title are required fields.");
    }

    const test = await createTest({
      testSeriesId,
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: description || "",
      durationMinutes: durationMinutes ? Number(durationMinutes) : 60,
      totalMarks: totalMarks ? Number(totalMarks) : 100,
      passingMarks: passingMarks ? Number(passingMarks) : 40,
      negativeMarkingRate: negativeMarkingRate !== undefined ? Number(negativeMarkingRate) : 0.5,
      marksPerQuestion: marksPerQuestion ? Number(marksPerQuestion) : 2.0,
      instructions: instructions || "",
      status: status || "PUBLISHED",
    });

    return apiSuccess(test, "Mock test created successfully", 201);
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return apiUnauthorized();
    if (err.message?.includes("Forbidden")) return apiForbidden();
    return apiError(err.message || "Failed to create mock test", 400);
  }
}
