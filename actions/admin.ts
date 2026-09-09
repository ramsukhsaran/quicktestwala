"use server";

import { requireAdmin } from "@/lib/auth/session";
import {
  createTestSeries,
  updateTestSeries,
  deleteTestSeries,
  createTest,
  updateTest,
  createQuestion,
  updateUserStatus,
} from "@/lib/data/store";
import { csvQuestionImportSchema } from "@/lib/validations/test";
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

    return { success: true, series: newSeries };
  } catch (err: any) {
    return { error: err.message || "Failed to create test series" };
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
      correctNumericalAnswer,
      options: questionType === "MCQ" ? options : undefined,
    });

    revalidatePath("/admin/questions");
    return { success: true, question: newQuestion };
  } catch (err: any) {
    return { error: err.message || "Failed to create question" };
  }
}

export async function bulkImportQuestionsAction(rawRows: any[]) {
  try {
    await requireAdmin();

    let validCount = 0;
    const errors: { row: number; error: string }[] = [];

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

      const options = [
        { optionKey: "A", optionText: data.option_a || "", isCorrect: correct === "A" },
        { optionKey: "B", optionText: data.option_b || "", isCorrect: correct === "B" },
        { optionKey: "C", optionText: data.option_c || "", isCorrect: correct === "C" },
        { optionKey: "D", optionText: data.option_d || "", isCorrect: correct === "D" },
      ].filter((o) => o.optionText.trim() !== "");

      await createQuestion({
        questionText: data.question,
        questionType: options.length > 0 ? "MCQ" : "NUMERICAL",
        subject: data.subject,
        topic: data.topic,
        difficulty: data.difficulty,
        explanation: data.explanation,
        marks: data.marks,
        negativeMarks: data.negative_marks,
        correctNumericalAnswer: options.length === 0 ? correct : undefined,
        options: options.length > 0 ? options : undefined,
      });

      validCount++;
    }

    revalidatePath("/admin/questions");

    return {
      success: true,
      totalRows: rawRows.length,
      importedCount: validCount,
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
    return { success: true };
  } catch (err: any) {
    return { error: err.message || "Failed to update student status" };
  }
}
