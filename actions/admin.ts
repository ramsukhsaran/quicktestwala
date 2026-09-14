"use server";

import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { requireAdmin } from "@/lib/auth/session";
import {
  createTestSeries,
  updateTestSeries,
  toggleTestSeriesStatus,
  deleteTestSeries,
  createTest,
  updateTest,
  toggleTestStatus,
  deleteTest,
  createQuestion,
  bulkCreateQuestions,
  deleteQuestion,
  updateUserStatus,
  linkQuestionsToTest,
  unlinkQuestionFromTest,
  markOrderAsPaid,
  createPreviousYearPaper,
  deletePreviousYearPaper,
} from "@/lib/data/store";
import { csvQuestionImportSchema } from "@/lib/validations/test";
import { extractQuestionFigureUrl } from "@/lib/utils/figure";
import { revalidatePath } from "next/cache";

export async function createTestSeriesAction(formData: FormData) {
  try {
    await requireAdmin();

    const data = {
      title: formData.get("title") as string,
      slug: (formData.get("slug") as string).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: formData.get("description") as string,
      shortDescription: formData.get("shortDescription") as string,
      thumbnail: (formData.get("thumbnail") as string) || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800",
      categoryId: formData.get("categoryId") as string,
      examName: formData.get("examName") as string,
      language: (formData.get("language") as string) || "Bilingual (Hindi + English)",
      difficulty: (formData.get("difficulty") as "EASY" | "MEDIUM" | "HARD") || "MEDIUM",
      price: parseInt((formData.get("price") as string) || "0", 10),
      discountPrice: parseInt((formData.get("discountPrice") as string) || "0", 10),
      status: (formData.get("status") as "DRAFT" | "PUBLISHED" | "ARCHIVED") || "PUBLISHED",
      isFeatured: formData.get("isFeatured") === "on" || formData.get("isFeatured") === "true",
    };

    const newSeries = await createTestSeries(data);
    revalidatePath("/admin/test-series");
    revalidatePath("/test-series");
    revalidatePath("/student/test-series");

    return { success: true, series: newSeries };
  } catch (err: any) {
    return { error: err.message || "Failed to create test series" };
  }
}

export async function updateTestSeriesAction(formData: FormData) {
  try {
    await requireAdmin();

    const id = formData.get("id") as string;
    if (!id) throw new Error("Test series id is required");

    const data = {
      title: formData.get("title") as string,
      slug: (formData.get("slug") as string).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: formData.get("description") as string,
      shortDescription: formData.get("shortDescription") as string,
      thumbnail: (formData.get("thumbnail") as string) || undefined,
      categoryId: formData.get("categoryId") as string,
      examName: formData.get("examName") as string,
      language: (formData.get("language") as string) || "Bilingual (Hindi + English)",
      difficulty: (formData.get("difficulty") as "EASY" | "MEDIUM" | "HARD") || "MEDIUM",
      price: parseInt((formData.get("price") as string) || "0", 10),
      discountPrice: parseInt((formData.get("discountPrice") as string) || "0", 10),
      status: (formData.get("status") as "DRAFT" | "PUBLISHED" | "ARCHIVED") || "PUBLISHED",
      isFeatured: formData.get("isFeatured") === "on" || formData.get("isFeatured") === "true",
    };

    const updated = await updateTestSeries(id, data as any);
    revalidatePath("/admin/test-series");
    revalidatePath(`/admin/test-series/${id}/edit`);
    revalidatePath("/test-series");
    revalidatePath(`/test-series/${data.slug}`);
    revalidatePath("/student/test-series");

    return { success: true, series: updated };
  } catch (err: any) {
    return { error: err.message || "Failed to update test series" };
  }
}

export async function toggleTestSeriesStatusAction(seriesId: string, currentStatus?: string) {
  try {
    await requireAdmin();
    const targetStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const updated = await toggleTestSeriesStatus(seriesId, targetStatus);
    revalidatePath("/admin/test-series");
    revalidatePath("/test-series");
    revalidatePath("/student/test-series");
    return { success: true, series: updated };
  } catch (err: any) {
    return { error: err.message || "Failed to update test series status" };
  }
}

export async function deleteTestSeriesAction(seriesId: string) {
  try {
    await requireAdmin();
    await deleteTestSeries(seriesId);
    revalidatePath("/admin/test-series");
    revalidatePath("/test-series");
    revalidatePath("/student/test-series");
    revalidatePath("/admin/tests");
    revalidatePath("/student/tests");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to delete test series" };
  }
}


export async function createTestAction(formData: FormData) {
  try {
    await requireAdmin();

    const data = {
      testSeriesId: formData.get("testSeriesId") as string,
      title: formData.get("title") as string,
      slug: (formData.get("slug") as string).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: formData.get("description") as string,
      durationMinutes: parseInt((formData.get("durationMinutes") as string) || "60", 10),
      totalMarks: parseFloat((formData.get("totalMarks") as string) || "100"),
      passingMarks: parseFloat((formData.get("passingMarks") as string) || "40"),
      negativeMarkingRate: parseFloat((formData.get("negativeMarkingRate") as string) || "0.5"),
      marksPerQuestion: parseFloat((formData.get("marksPerQuestion") as string) || "2.0"),
      instructions: formData.get("instructions") as string,
      status: (formData.get("status") as "DRAFT" | "PUBLISHED" | "ARCHIVED") || "PUBLISHED",
    };

    const newTest = await createTest(data);
    revalidatePath("/admin/tests");

    return { success: true, test: newTest };
  } catch (err: any) {
    return { error: err.message || "Failed to create test" };
  }
}

export async function updateTestAction(formData: FormData) {
  try {
    await requireAdmin();

    const id = formData.get("id") as string;
    if (!id) throw new Error("Test id is required");

    const data = {
      title: formData.get("title") as string,
      slug: (formData.get("slug") as string).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      description: formData.get("description") as string,
      durationMinutes: parseInt((formData.get("durationMinutes") as string) || "60", 10),
      totalMarks: parseFloat((formData.get("totalMarks") as string) || "100"),
      passingMarks: parseFloat((formData.get("passingMarks") as string) || "40"),
      negativeMarkingRate: parseFloat((formData.get("negativeMarkingRate") as string) || "0.5"),
      marksPerQuestion: parseFloat((formData.get("marksPerQuestion") as string) || "2.0"),
      instructions: formData.get("instructions") as string,
      status: (formData.get("status") as "DRAFT" | "PUBLISHED" | "ARCHIVED") || "PUBLISHED",
    };

    const updatedTest = await updateTest(id, data as any);
    if (!updatedTest) {
      return { error: "Failed to update test. Record not found or database unavailable." };
    }
    revalidatePath("/admin/tests");

    return { success: true, test: updatedTest };
  } catch (err: any) {
    return { error: err.message || "Failed to update test" };
  }
}

export async function createQuestionAction(formData: FormData) {
  try {
    await requireAdmin();

    const questionText = formData.get("questionText") as string;
    const subject = formData.get("subject") as string;
    const topic = formData.get("topic") as string;
    const difficulty = (formData.get("difficulty") as "EASY" | "MEDIUM" | "HARD") || "MEDIUM";
    const explanation = formData.get("explanation") as string;
    const marks = parseFloat((formData.get("marks") as string) || "2.0");
    const negativeMarks = parseFloat((formData.get("negativeMarks") as string) || "0.5");
    const questionType = (formData.get("questionType") as "MCQ" | "NUMERICAL") || "MCQ";
    const correctNumericalAnswer = formData.get("correctNumericalAnswer") as string;
    const imageUrl = (formData.get("imageUrl") as string)?.trim() || undefined;

    const optA = formData.get("option_A") as string;
    const optB = formData.get("option_B") as string;
    const optC = formData.get("option_C") as string;
    const optD = formData.get("option_D") as string;
    const correctOpt = formData.get("correct_option") as string;

    const options = [
      { optionKey: "A", optionText: optA, isCorrect: correctOpt === "A" },
      { optionKey: "B", optionText: optB, isCorrect: correctOpt === "B" },
      { optionKey: "C", optionText: optC, isCorrect: correctOpt === "C" },
      { optionKey: "D", optionText: optD, isCorrect: correctOpt === "D" },
    ].filter((o) => o.optionText && o.optionText.trim() !== "");

    const newQuestion = await createQuestion({
      questionText,
      questionType,
      subject,
      topic,
      difficulty,
      explanation,
      marks,
      negativeMarks,
      imageUrl,
      correctNumericalAnswer,
      options: questionType === "MCQ" ? options : undefined,
    });

    revalidatePath("/admin/questions");
    return { success: true, question: newQuestion };
  } catch (err: any) {
    return { error: err.message || "Failed to create question" };
  }
}

export async function createPreviousYearPaperAction(formData: FormData) {
  try {
    await requireAdmin();

    const title = (formData.get("title") as string)?.trim();
    const examName = (formData.get("examName") as string)?.trim();
    const year = (formData.get("year") as string)?.trim();
    const description = (formData.get("description") as string)?.trim();
    const testSeriesId = (formData.get("testSeriesId") as string)?.trim() || null;
    const rawQuestions = (formData.get("questionsJson") as string)?.trim();
    const pdfUrlInput = (formData.get("pdfUrl") as string)?.trim();
    const uploadedPdf = formData.get("pdfFile");

    if (!title || !examName || !year) {
      return { error: "Title, exam name, and year are required." };
    }

    let resolvedPdfUrl = pdfUrlInput || "";
    if (uploadedPdf && typeof uploadedPdf !== "string" && "name" in uploadedPdf && uploadedPdf.size > 0) {
      const fileName = `${Date.now()}-${String(uploadedPdf.name).replace(/[^a-zA-Z0-9_.-]/g, "_")}`;
      const uploadDir = path.join(process.cwd(), "public", "uploads", "question-papers");
      await mkdir(uploadDir, { recursive: true });
      const destination = path.join(uploadDir, fileName);
      const buffer = Buffer.from(await uploadedPdf.arrayBuffer());
      await writeFile(destination, buffer);
      resolvedPdfUrl = `/uploads/question-papers/${fileName}`;
    }

    let parsedQuestions: any[] = [];
    if (rawQuestions) {
      const candidate = JSON.parse(rawQuestions);
      parsedQuestions = Array.isArray(candidate) ? candidate : [candidate];
    }

    if (parsedQuestions.length === 0) {
      return { error: "Please provide at least one question in the same question format used in the platform." };
    }

    const rawAccessType = (formData.get("accessType") as string)?.trim();
    const accessType = (rawAccessType as "FREE" | "PAID_ANY" | "SERIES_SPECIFIC") || (testSeriesId ? "SERIES_SPECIFIC" : "PAID_ANY");

    const paper = await createPreviousYearPaper({
      title,
      examName,
      year,
      description,
      testSeriesId,
      pdfUrl: resolvedPdfUrl,
      accessType,
      questions: parsedQuestions.map((q: any) => ({
        questionText: q.questionText || q.question || "",
        questionType: q.questionType || (q.correctNumericalAnswer ? "NUMERICAL" : "MCQ"),
        subject: q.subject || "General",
        topic: q.topic || "General",
        difficulty: q.difficulty || "MEDIUM",
        explanation: q.explanation || "",
        marks: q.marks ?? 2,
        negativeMarks: q.negativeMarks ?? 0.5,
        correctNumericalAnswer: q.correctNumericalAnswer || undefined,
        options: Array.isArray(q.options)
          ? q.options.map((opt: any) => ({
              optionKey: opt.optionKey || opt.key || "",
              optionText: opt.optionText || opt.text || "",
              isCorrect: Boolean(opt.isCorrect),
            }))
          : undefined,
        correctOptionKeys: q.correctOptionKeys || undefined,
      })),
    });

    revalidatePath("/admin/question-papers");
    revalidatePath("/student/question-papers");
    return { success: true, paper };
  } catch (err: any) {
    return { error: err.message || "Failed to upload previous year question paper." };
  }
}

export async function deletePreviousYearPaperAction(paperId: string) {
  try {
    await requireAdmin();
    if (!paperId) throw new Error("Paper ID is required");
    await deletePreviousYearPaper(paperId);
    revalidatePath("/admin/question-papers");
    revalidatePath("/student/question-papers");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to delete previous year paper." };
  }
}

export async function bulkImportQuestionsAction(rawRows: any[]) {
  try {
    await requireAdmin();

    const errors: { row: number; error: string }[] = [];
    const questionsToCreate: Array<{
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

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const parsed = csvQuestionImportSchema.safeParse(row);

      if (!parsed.success) {
        errors.push({
          row: i + 1,
          error: parsed.error.errors.map((e) => e.message).join(", "),
        });
        continue;
      }

      const data = parsed.data;
      const correct = data.correct_answer.toUpperCase().trim();
      const figureUrl = extractQuestionFigureUrl(row);

      const options = [
        { optionKey: "A", optionText: data.option_a || "", isCorrect: correct === "A" },
        { optionKey: "B", optionText: data.option_b || "", isCorrect: correct === "B" },
        { optionKey: "C", optionText: data.option_c || "", isCorrect: correct === "C" },
        { optionKey: "D", optionText: data.option_d || "", isCorrect: correct === "D" },
      ].filter((o) => o.optionText.trim() !== "");

      questionsToCreate.push({
        questionText: data.question,
        questionType: options.length > 0 ? "MCQ" : "NUMERICAL",
        subject: data.subject,
        topic: data.topic,
        difficulty: data.difficulty,
        explanation: data.explanation,
        marks: data.marks,
        negativeMarks: data.negative_marks,
        imageUrl: figureUrl,
        correctNumericalAnswer: options.length === 0 ? correct : undefined,
        options: options.length > 0 ? options : undefined,
      });
    }

    if (questionsToCreate.length === 0) {
      return {
        error: "No valid questions found to import",
        errorsCount: errors.length,
        errors,
      };
    }

    const { count } = await bulkCreateQuestions(questionsToCreate);

    revalidatePath("/admin/questions");

    return {
      success: true,
      totalRows: rawRows.length,
      importedCount: count,
      errorsCount: errors.length,
      errors,
    };
  } catch (err: any) {
    return { error: err.message || "Bulk import failed" };
  }
}

export async function toggleStudentStatusAction(userId: string, newStatus: "ACTIVE" | "BLOCKED") {
  try {
    await requireAdmin();
    await updateUserStatus(userId, newStatus);
    revalidatePath("/admin/students");
    revalidatePath("/student");
    revalidatePath("/student/dashboard");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to update student status" };
  }
}

export async function linkQuestionsToTestAction(
  testId: string,
  questionIds: string[],
  sectionName = "General Section"
) {
  try {
    await requireAdmin();
    const res = await linkQuestionsToTest(testId, questionIds, sectionName);
    revalidatePath(`/admin/tests/${testId}/questions`);
    revalidatePath(`/admin/tests/${testId}/edit`);
    revalidatePath("/admin/tests");
    return { ...res };
  } catch (err: any) {
    return { error: err.message || "Failed to link questions to test" };
  }
}

export async function unlinkQuestionFromTestAction(testId: string, questionId: string) {
  try {
    await requireAdmin();
    const res = await unlinkQuestionFromTest(testId, questionId);
    revalidatePath(`/admin/tests/${testId}/questions`);
    revalidatePath(`/admin/tests/${testId}/edit`);
    revalidatePath("/admin/tests");
    return { ...res };
  } catch (err: any) {
    return { error: err.message || "Failed to unlink question from test" };
  }
}

export async function deleteQuestionAction(questionId: string) {
  try {
    await requireAdmin();
    await deleteQuestion(questionId);
    revalidatePath("/admin/questions");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to delete question" };
  }
}

export async function toggleTestStatusAction(testId: string, currentStatus?: string) {
  try {
    await requireAdmin();
    const targetStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    const updated = await toggleTestStatus(testId, targetStatus);
    revalidatePath("/admin/tests");
    revalidatePath("/student/tests");
    return { success: true, test: updated };
  } catch (err: any) {
    return { error: err.message || "Failed to toggle test status" };
  }
}

export async function deleteTestAction(testId: string) {
  try {
    await requireAdmin();
    await deleteTest(testId);
    revalidatePath("/admin/tests");
    revalidatePath("/student/tests");
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to delete mock test" };
  }
}

export async function markOrderAsPaidAction(orderId: string) {
  try {
    await requireAdmin();
    const updated = await markOrderAsPaid(orderId);
    revalidatePath("/admin/orders");
    revalidatePath("/admin/dashboard");
    revalidatePath("/student/test-series");
    revalidatePath("/student/tests");
    return { success: true, order: updated };
  } catch (err: any) {
    return { error: err.message || "Failed to mark order as paid" };
  }
}


