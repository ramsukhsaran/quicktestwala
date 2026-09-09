import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { saveAttemptAnswer } from "@/lib/data/store";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/api/response";
import { answerAttemptBodySchema, validateRequestBody } from "@/lib/validations/api";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = await req.json().catch(() => null);

    const validation = validateRequestBody(answerAttemptBodySchema, body);
    if (!validation.success) {
      return validation.response;
    }

    const {
      questionId,
      selectedOptionIds,
      numericalAnswer,
      isMarkedForReview,
      isVisited,
      timeSpentSeconds,
    } = validation.data;

    const res = await saveAttemptAnswer({
      attemptId: id,
      questionId,
      selectedOptionIds,
      numericalAnswer,
      isMarkedForReview,
      isVisited,
      timeSpentSeconds,
      remainingTimeSeconds: body?.remainingTimeSeconds,
    });

    return apiSuccess(res, "Answer recorded");
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return apiUnauthorized();
    return apiError(err.message || "Failed to record answer", 400);
  }
}
