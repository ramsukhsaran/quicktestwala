import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import {
  getTestQuestionsWithBank,
  linkQuestionsToTest,
  unlinkQuestionFromTest,
} from "@/lib/data/store";
import {
  apiSuccess,
  apiError,
  apiUnauthorized,
  apiForbidden,
  apiNotFound,
} from "@/lib/api/response";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await getTestQuestionsWithBank(id);
    if (!data) {
      return apiNotFound("Mock test not found");
    }

    return apiSuccess(data);
  } catch (err: any) {
    return apiError(err.message || "Failed to retrieve test questions", 500);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    const { questionIds, sectionName } = body;
    if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
      return apiError("questionIds array is required and must not be empty");
    }

    const result = await linkQuestionsToTest(id, questionIds, sectionName);
    return apiSuccess(result, "Questions linked to mock test successfully");
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return apiUnauthorized();
    if (err.message?.includes("Forbidden")) return apiForbidden();
    return apiError(err.message || "Failed to link questions", 400);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    const url = new URL(req.url);
    let questionId = url.searchParams.get("questionId");

    if (!questionId) {
      const body = await req.json().catch(() => ({}));
      questionId = body.questionId;
    }

    if (!questionId) {
      return apiError("questionId is required to unlink");
    }

    const result = await unlinkQuestionFromTest(id, questionId);
    return apiSuccess(result, "Question unlinked from mock test successfully");
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return apiUnauthorized();
    if (err.message?.includes("Forbidden")) return apiForbidden();
    return apiError(err.message || "Failed to unlink question", 400);
  }
}
