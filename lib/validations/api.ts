import { z } from "zod";
import { apiError } from "@/lib/api/response";

/**
 * Validates arbitrary input using a Zod schema.
 * Returns { success: true, data } on success or { success: false, errorResponse, error } on failure.
 */
export function validateRequestBody<T>(schema: z.ZodSchema<T>, data: unknown) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const formattedErrors: Record<string, string[]> = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path.join(".") || "body";
      if (!formattedErrors[path]) formattedErrors[path] = [];
      formattedErrors[path].push(issue.message);
    });
    const issueMessages = result.error.issues.map(
      (issue) => `${issue.path.join(".") || "body"}: ${issue.message}`
    );
    const primaryMessage = issueMessages[0] || "Invalid request payload";
    return {
      success: false as const,
      error: primaryMessage,
      issues: result.error.issues,
      response: apiError(primaryMessage, 400, formattedErrors),
    };
  }

  return {
    success: true as const,
    data: result.data,
  };
}

// -------------------------------------------------------------
// COMMON API BODY SCHEMAS
// -------------------------------------------------------------

export const bookmarkBodySchema = z.object({
  questionId: z.string().min(1, "questionId is required"),
  notes: z.string().optional(),
});

export const startAttemptBodySchema = z.object({
  testId: z.string().min(1, "testId is required"),
});

export const answerAttemptBodySchema = z.object({
  questionId: z.string().min(1, "questionId is required"),
  selectedOptionIds: z.array(z.string()).optional(),
  numericalAnswer: z.string().optional(),
  isMarkedForReview: z.boolean().optional(),
  isVisited: z.boolean().optional(),
  timeSpentSeconds: z.coerce.number().optional(),
});

export const submitAttemptBodySchema = z.object({
  isAutoSubmit: z.boolean().optional().default(false),
});

export const linkQuestionsBodySchema = z.object({
  questionIds: z.array(z.string()).min(1, "At least one question ID is required to link"),
  sectionName: z.string().optional(),
});

export const unlinkQuestionBodySchema = z.object({
  questionId: z.string().min(1, "questionId is required"),
});
