import { z } from "zod";

export const testSeriesSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  shortDescription: z.string().optional(),
  thumbnail: z.string().url().optional().or(z.literal("")),
  categoryId: z.string().uuid("Invalid category"),
  examName: z.string().min(2, "Exam name is required"),
  language: z.string().default("Bilingual (Hindi + English)"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  price: z.coerce.number().min(0, "Price must be non-negative"),
  discountPrice: z.coerce.number().min(0).optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
  isFeatured: z.boolean().default(false),
});

export const testSchema = z.object({
  testSeriesId: z.string().uuid("Invalid test series"),
  title: z.string().min(3, "Test title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  description: z.string().optional(),
  durationMinutes: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  totalMarks: z.coerce.number().min(1, "Total marks must be positive"),
  passingMarks: z.coerce.number().min(0, "Passing marks must be non-negative"),
  negativeMarkingRate: z.coerce.number().min(0, "Negative mark rate must be non-negative"),
  marksPerQuestion: z.coerce.number().min(0.5, "Marks per question must be at least 0.5"),
  instructions: z.string().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("PUBLISHED"),
  allowRetake: z.boolean().default(true),
  showResultImmediately: z.boolean().default(true),
  shuffleQuestions: z.boolean().default(false),
  shuffleOptions: z.boolean().default(false),
});

export const questionOptionSchema = z.object({
  optionKey: z.string().min(1),
  optionText: z.string().min(1, "Option text cannot be empty"),
  isCorrect: z.boolean().default(false),
});

export const questionSchema = z.object({
  questionText: z.string().min(5, "Question text must be at least 5 characters"),
  questionType: z.enum(["MCQ", "MULTIPLE_CORRECT", "NUMERICAL"]).default("MCQ"),
  subject: z.string().min(2, "Subject is required"),
  topic: z.string().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).default("MEDIUM"),
  explanation: z.string().optional(),
  marks: z.coerce.number().min(0.5).default(2.0),
  negativeMarks: z.coerce.number().min(0).default(0.5),
  imageUrl: z.string().optional(),
  correctNumericalAnswer: z.string().optional(),
  options: z.array(questionOptionSchema).optional(),
});

export const csvQuestionImportSchema = z.object({
  question: z.string().min(5, "Question is required"),
  option_a: z.string().optional(),
  option_b: z.string().optional(),
  option_c: z.string().optional(),
  option_d: z.string().optional(),
  correct_answer: z.string().min(1, "Correct answer is required (e.g. A, B, C, D or numerical value)"),
  explanation: z.string().optional(),
  subject: z.string().min(2, "Subject is required"),
  topic: z.string().optional(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).catch("MEDIUM"),
  marks: z.coerce.number().default(2.0),
  negative_marks: z.coerce.number().default(0.5),
});

export type TestSeriesInput = z.infer<typeof testSeriesSchema>;
export type TestInput = z.infer<typeof testSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type CsvQuestionImportInput = z.infer<typeof csvQuestionImportSchema>;
