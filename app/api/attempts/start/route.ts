import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getOrCreateTestAttempt } from "@/lib/data/store";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/api/response";
import { startAttemptBodySchema, validateRequestBody } from "@/lib/validations/api";

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json().catch(() => null);
    const validation = validateRequestBody(startAttemptBodySchema, body);
    if (!validation.success) {
      return validation.response;
    }

    const { testId } = validation.data;
    const attempt = await getOrCreateTestAttempt(session.id, testId);
    return apiSuccess(attempt, "Test attempt initialized successfully", 201);
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return apiUnauthorized();
    return apiError(err.message || "Failed to start test attempt", 400);
  }
}
