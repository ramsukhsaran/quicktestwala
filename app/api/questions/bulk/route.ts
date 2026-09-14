import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { bulkCreateQuestions } from "@/lib/data/store";
import { csvQuestionImportSchema } from "@/lib/validations/test";
import { extractQuestionFigureUrl } from "@/lib/utils/figure";
import { apiSuccess, apiError, apiUnauthorized, apiForbidden } from "@/lib/api/response";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const body = await req.json();

    const rawRows = body.rows || body.questions;
    if (!rawRows || !Array.isArray(rawRows) || rawRows.length === 0) {
      return apiError("A non-empty 'questions' or 'rows' array is required for bulk import");
    }

    const validQuestions: Array<{
      questionText: string;
      questionType?: "MCQ" | "MULTIPLE_CORRECT" | "NUMERICAL";
      subject: string;
      topic?: string;
      difficulty?: "EASY" | "MEDIUM" | "HARD";
      explanation?: string;
      marks?: number;
      negativeMarks?: number;
      imageUrl?: string;
      correctNumericalAnswer?: string;
      options?: { optionKey: string; optionText: string; isCorrect: boolean }[];
    }> = [];

    const errors: string[] = [];

    for (let i = 0; i < rawRows.length; i++) {
      const item = rawRows[i];

      // If already structured question format
      if (item.questionText && item.subject) {
        validQuestions.push({
          questionText: item.questionText,
          questionType: item.questionType || (item.options && item.options.length > 0 ? "MCQ" : "NUMERICAL"),
          subject: item.subject,
          topic: item.topic || "",
          difficulty: item.difficulty || "MEDIUM",
          explanation: item.explanation || "",
          marks: item.marks !== undefined ? Number(item.marks) : 2.0,
          negativeMarks: item.negativeMarks !== undefined ? Number(item.negativeMarks) : 0.5,
          imageUrl: item.imageUrl || extractQuestionFigureUrl(item),
          correctNumericalAnswer: item.correctNumericalAnswer,
          options: Array.isArray(item.options) ? item.options : [],
        });
        continue;
      }

      // If CSV row format
      const parsed = csvQuestionImportSchema.safeParse(item);
      if (!parsed.success) {
        errors.push(`Row ${i + 1}: ${parsed.error.errors.map((e) => e.message).join(", ")}`);
        continue;
      }

      const data = parsed.data;
      const correct = data.correct_answer.toUpperCase().trim();
      const figureUrl = extractQuestionFigureUrl(item);
      const options = [
        { optionKey: "A", optionText: data.option_a || "", isCorrect: correct === "A" },
        { optionKey: "B", optionText: data.option_b || "", isCorrect: correct === "B" },
        { optionKey: "C", optionText: data.option_c || "", isCorrect: correct === "C" },
        { optionKey: "D", optionText: data.option_d || "", isCorrect: correct === "D" },
      ].filter((o) => o.optionText.trim() !== "");

      validQuestions.push({
        questionText: data.question,
        questionType: options.length > 0 ? "MCQ" : "NUMERICAL",
        subject: data.subject,
        topic: data.topic || "",
        difficulty: data.difficulty,
        explanation: data.explanation || "",
        marks: data.marks,
        negativeMarks: data.negative_marks,
        imageUrl: figureUrl,
        correctNumericalAnswer: options.length === 0 ? correct : undefined,
        options: options.length > 0 ? options : undefined,
      });
    }

    if (validQuestions.length === 0) {
      return apiError("No valid questions found to import", 400, { errors });
    }

    const { count, ids } = await bulkCreateQuestions(validQuestions);

    return apiSuccess(
      { createdCount: count, totalAttempted: rawRows.length, ids, errors },
      `Successfully imported ${count} questions into Question Bank!`
    );
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return apiUnauthorized();
    if (err.message?.includes("Forbidden")) return apiForbidden();
    return apiError(err.message || "Failed to bulk import questions", 400);
  }
}

