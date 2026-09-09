import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
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
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        options: { orderBy: { orderIndex: "asc" } },
      },
    });

    if (!question) return apiNotFound("Question not found");
    return apiSuccess(question);
  } catch (err: any) {
    return apiError(err.message || "Failed to retrieve question", 500);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;
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
      correctNumericalAnswer,
      options,
    } = body;

    const question = await prisma.question.update({
      where: { id },
      data: {
        ...(questionText ? { questionText } : {}),
        ...(questionType ? { questionType } : {}),
        ...(subject ? { subject } : {}),
        ...(topic !== undefined ? { topic } : {}),
        ...(difficulty ? { difficulty } : {}),
        ...(explanation !== undefined ? { explanation } : {}),
        ...(marks !== undefined ? { marks: Number(marks) } : {}),
        ...(negativeMarks !== undefined ? { negativeMarks: Number(negativeMarks) } : {}),
        ...(correctNumericalAnswer !== undefined ? { correctNumericalAnswer } : {}),
      },
    });

    // Update options if provided
    if (Array.isArray(options) && options.length > 0) {
      await prisma.questionOption.deleteMany({ where: { questionId: id } });
      for (let i = 0; i < options.length; i++) {
        const opt = options[i];
        await prisma.questionOption.create({
          data: {
            questionId: id,
            optionKey: opt.optionKey || String.fromCharCode(65 + i),
            optionText: opt.optionText,
            isCorrect: Boolean(opt.isCorrect),
            orderIndex: i + 1,
          },
        });
      }
    }

    const updatedWithOpts = await prisma.question.findUnique({
      where: { id },
      include: { options: { orderBy: { orderIndex: "asc" } } },
    });

    return apiSuccess(updatedWithOpts, "Question updated successfully");
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return apiUnauthorized();
    if (err.message?.includes("Forbidden")) return apiForbidden();
    return apiError(err.message || "Failed to update question", 400);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
    const { id } = await params;

    await prisma.question.delete({ where: { id } });
    return apiSuccess({ id }, "Question deleted successfully");
  } catch (err: any) {
    if (err.message?.includes("Unauthorized")) return apiUnauthorized();
    if (err.message?.includes("Forbidden")) return apiForbidden();
    return apiError(err.message || "Failed to delete question", 400);
  }
}
