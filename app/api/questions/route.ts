import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { getAllQuestions, createQuestion } from "@/lib/data/store";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const subject = url.searchParams.get("subject") || undefined;
    const difficulty = url.searchParams.get("difficulty") || undefined;
    const search = url.searchParams.get("search") || undefined;
    const includeStats = url.searchParams.get("stats") === "true";

    let questions: any[] = await getAllQuestions({ subject, difficulty });
    if (search) {
      const q = search.toLowerCase();
      questions = questions.filter(
        (item: any) =>
          (item.questionText && item.questionText.toLowerCase().includes(q)) ||
          (item.topic && item.topic.toLowerCase().includes(q)) ||
          (item.subject && item.subject.toLowerCase().includes(q))
      );
    }

    if (includeStats) {
      const { getQuestionBankStats } = await import("@/lib/data/store");
      const stats = await getQuestionBankStats();
      return apiSuccess({ questions, stats });
    }

    return apiSuccess(questions);
  } catch (err: any) {
    return apiError(err.message || "Failed to retrieve questions", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();

    const {
      questionText,
      questionType,
      subject,
      topic,
      difficulty,
      explanation,
      marks,
      negativeMarks,
      options,
      correctNumericalAnswer,
    } = body;

    if (!questionText || !subject) {
      return apiError("Question text and subject are required.");
    }

    const question = await createQuestion({
      questionText,
      questionType: questionType || "MCQ",
      subject,
      topic: topic || "",
      difficulty: difficulty || "MEDIUM",
      explanation: explanation || "",
      marks: marks !== undefined ? Number(marks) : 2.0,
      negativeMarks: negativeMarks !== undefined ? Number(negativeMarks) : 0.5,
      correctNumericalAnswer: correctNumericalAnswer || undefined,
      options: Array.isArray(options) ? options : [],
    });

    return apiSuccess(question, "Question created successfully", 201);
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return apiUnauthorized();
    if (err.message?.includes("Forbidden")) return apiForbidden();
    return apiError(err.message || "Failed to create question", 400);
  }
}
