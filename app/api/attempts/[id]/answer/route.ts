import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { saveAttemptAnswer } from "@/lib/data/store";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/api/response";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await req.json();

    const {
      questionId,
      selectedOptionIds,
      numericalAnswer,
      isMarkedForReview,
      isVisited,
      timeSpentSeconds,
      remainingTimeSeconds,
    } = body;

    if (!questionId) {
      return apiError("questionId is required");
    }

    const res = await saveAttemptAnswer({
      attemptId: id,
      questionId,
      selectedOptionIds,
      numericalAnswer,
      isMarkedForReview,
      isVisited,
      timeSpentSeconds,
      remainingTimeSeconds,
    });

    return apiSuccess(res, "Answer recorded");
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return apiUnauthorized();
    return apiError(err.message || "Failed to record answer", 400);
  }
}
