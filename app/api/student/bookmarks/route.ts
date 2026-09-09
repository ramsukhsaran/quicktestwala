import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { getBookmarkedQuestions, toggleBookmarkQuestion } from "@/lib/data/store";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/api/response";
import { bookmarkBodySchema, validateRequestBody } from "@/lib/validations/api";

export async function GET() {
  try {
    const session = await requireAuth();
    const bookmarks = await getBookmarkedQuestions(session.id);
    return apiSuccess(bookmarks);
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return apiUnauthorized();
    return apiError(err.message || "Failed to retrieve bookmarks", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    const body = await req.json().catch(() => null);

    const validation = validateRequestBody(bookmarkBodySchema, body);
    if (!validation.success) {
      return validation.response;
    }

    const { questionId, notes } = validation.data;
    const res = await toggleBookmarkQuestion(session.id, questionId, notes);
    return apiSuccess(res, res.message);
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return apiUnauthorized();
    return apiError(err.message || "Failed to toggle bookmark", 400);
  }
}
