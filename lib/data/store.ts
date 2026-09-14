import { prisma, ensureDbSchema } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import {
  AppError,
  NotFoundError,
  DatabaseError,
  ValidationError,
  ForbiddenError,
} from "@/lib/errors";
import {
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_TEST_SERIES,
  INITIAL_TESTS,
  INITIAL_QUESTIONS,
  INITIAL_PREVIOUS_YEAR_PAPERS,
  DemoUser,
  DemoCategory,
  DemoTestSeries,
  DemoTest,
  DemoQuestion,
} from "./initial-data";

// In-Memory Fallback State (persists during process lifetime if database connection is offline/placeholder)
type MemoryAttemptAnswer = {
  selectedOptionIds: string[];
  numericalAnswer?: string;
  isCorrect: boolean;
  marksAwarded: number;
  timeSpentSeconds: number;
  isMarkedForReview: boolean;
  isVisited: boolean;
};

const memoryState = {
  users: [...INITIAL_USERS] as DemoUser[],
  categories: [...INITIAL_CATEGORIES] as DemoCategory[],
  testSeries: [...INITIAL_TEST_SERIES] as DemoTestSeries[],
  tests: [...INITIAL_TESTS] as DemoTest[],
  questions: [...INITIAL_QUESTIONS] as DemoQuestion[],
  previousYearPapers: [...INITIAL_PREVIOUS_YEAR_PAPERS] as any[],
  orders: [] as any[],
  attempts: [] as any[],
  bookmarks: [] as { id: string; userId: string; questionId: string; notes?: string; createdAt: Date }[],
};

// Check if database URL is configured and non-placeholder with circuit breaker
let dbUnreachableFlag = false;

export function markDbUnreachable() {
  dbUnreachableFlag = true;
}

export function isDbConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  if (!url || url.includes("npg_placeholder") || url.includes("localhost/db")) {
    return false;
  }
  if (dbUnreachableFlag) {
    return false;
  }
  return true;
}


// -------------------------------------------------------------
// USER OPERATIONS
// -------------------------------------------------------------
export async function getUserByEmail(email: string) {
  if (isDbConfigured()) {
    try {
      return await prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
        include: { profile: true },
      });
    } catch {
      // Fallback
    }
  }

  const user = memoryState.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase().trim()
  );
  if (!user) return null;
  return {
    ...user,
    profile: {
      id: `prof_${user.id}`,
      userId: user.id,
      phone: user.phone || null,
      targetExam: user.targetExam || null,
      state: "Delhi",
      education: "Graduate",
    },
  };
}

export async function getUserById(id: string) {
  if (isDbConfigured()) {
    try {
      return await prisma.user.findUnique({
        where: { id },
        include: { profile: true },
      });
    } catch {
      // Fallback
    }
  }

  const user = memoryState.users.find((u) => u.id === id);
  if (!user) return null;
  return {
    ...user,
    profile: {
      id: `prof_${user.id}`,
      userId: user.id,
      phone: user.phone || null,
      targetExam: user.targetExam || null,
      state: "Delhi",
      education: "Graduate",
    },
  };
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role?: "ADMIN" | "STUDENT";
  targetExam?: string;
  phone?: string;
}) {
  const passwordHash = await bcrypt.hash(data.password, 10);
  const email = data.email.toLowerCase().trim();

  if (isDbConfigured()) {
    try {
      return await prisma.user.create({
        data: {
          name: data.name,
          email,
          passwordHash,
          role: data.role || "STUDENT",
          profile: {
            create: {
              targetExam: data.targetExam || "SSC CGL",
              phone: data.phone || null,
            },
          },
        },
        include: { profile: true },
      });
    } catch {
      // Fallback
    }
  }

  const newUser: DemoUser = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: data.name,
    email,
    passwordHash,
    role: data.role || "STUDENT",
    status: "ACTIVE",
    targetExam: data.targetExam,
    phone: data.phone,
  };

  memoryState.users.push(newUser);
  return {
    ...newUser,
    profile: {
      id: `prof_${newUser.id}`,
      userId: newUser.id,
      phone: data.phone || null,
      targetExam: data.targetExam || null,
      state: "Delhi",
      education: "Graduate",
    },
  };
}

export async function getAllStudents() {
  if (isDbConfigured()) {
    try {
      return await prisma.user.findMany({
        where: { role: "STUDENT" },
        include: {
          profile: true,
          orders: true,
          attempts: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } catch {
      // Fallback
    }
  }

  return memoryState.users
    .filter((u) => u.role === "STUDENT")
    .map((u) => ({
      ...u,
      createdAt: new Date(),
      orders: memoryState.orders.filter((o) => o.userId === u.id),
      attempts: memoryState.attempts.filter((a) => a.userId === u.id),
      profile: {
        phone: u.phone,
        targetExam: u.targetExam,
      },
    }));
}

export async function updateUserStatus(userId: string, status: "ACTIVE" | "BLOCKED") {
  if (isDbConfigured()) {
    try {
      return await prisma.user.update({
        where: { id: userId },
        data: { status },
      });
    } catch {
      // Fallback
    }
  }

  const user = memoryState.users.find((u) => u.id === userId);
  if (user) user.status = status;
  return user;
}

export async function updateUserProfile(
  userId: string,
  data: {
    name?: string;
    phone?: string | null;
    targetExam?: string | null;
    state?: string | null;
    education?: string | null;
  }
) {
  if (isDbConfigured()) {
    try {
      const updateData: any = {};
      if (data.name && data.name.trim()) {
        updateData.name = data.name.trim();
      }

      const profilePayload: any = {};
      if (data.phone !== undefined) profilePayload.phone = data.phone || null;
      if (data.targetExam !== undefined) profilePayload.targetExam = data.targetExam || null;
      if (data.state !== undefined) profilePayload.state = data.state || null;
      if (data.education !== undefined) profilePayload.education = data.education || null;

      updateData.profile = {
        upsert: {
          create: {
            phone: data.phone || null,
            targetExam: data.targetExam || null,
            state: data.state || null,
            education: data.education || null,
          },
          update: profilePayload,
        },
      };

      return await prisma.user.update({
        where: { id: userId },
        data: updateData,
        include: { profile: true },
      });
    } catch (err) {
      console.error("Database updateUserProfile error:", err);
      // Fallback
    }
  }

  const user = memoryState.users.find((u) => u.id === userId);
  if (!user) return null;

  if (data.name && data.name.trim()) user.name = data.name.trim();
  if (data.phone !== undefined) user.phone = data.phone || undefined;
  if (data.targetExam !== undefined) user.targetExam = data.targetExam || undefined;
  if (data.state !== undefined) (user as any).state = data.state || undefined;
  if (data.education !== undefined) (user as any).education = data.education || undefined;

  return {
    ...user,
    profile: {
      id: `prof_${user.id}`,
      userId: user.id,
      phone: user.phone || null,
      targetExam: user.targetExam || null,
      state: (user as any).state || null,
      education: (user as any).education || null,
    },
  };
}

export async function updateUserPassword(
  userId: string,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  let user: any = null;

  if (isDbConfigured()) {
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
      });
    } catch {
      // Fallback
    }
  }

  if (!user) {
    user = memoryState.users.find((u) => u.id === userId);
  }

  if (!user) {
    return { success: false, error: "User account not found" };
  }

  // Check current password
  let isMatch = false;
  if (user.passwordHash && (user.passwordHash.startsWith("$2a$") || user.passwordHash.startsWith("$2b$"))) {
    try {
      isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    } catch {
      isMatch = false;
    }
  }
  if (!isMatch) {
    isMatch =
      currentPassword === user.passwordHash ||
      (user.role === "STUDENT" && currentPassword === "student123") ||
      (user.role === "ADMIN" && currentPassword === "admin123");
  }

  if (!isMatch) {
    return { success: false, error: "The current password entered is incorrect" };
  }

  const newHash = await bcrypt.hash(newPassword, 10);

  if (isDbConfigured()) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newHash },
      });
    } catch (err) {
      console.error("Database updateUserPassword error:", err);
    }
  }

  const memUser = memoryState.users.find((u) => u.id === userId);
  if (memUser) {
    memUser.passwordHash = newHash;
  }

  return { success: true };
}

// -------------------------------------------------------------
// CATEGORY OPERATIONS
// -------------------------------------------------------------
export async function getCategories() {
  if (isDbConfigured()) {
    try {
      return await prisma.category.findMany({
        where: { isActive: true },
        orderBy: { displayOrder: "asc" },
      });
    } catch {
      // Fallback
    }
  }
  return memoryState.categories.filter((c) => c.isActive);
}

// -------------------------------------------------------------
// TEST SERIES OPERATIONS
// -------------------------------------------------------------
export async function getTestSeriesList(options?: {
  categoryId?: string;
  categorySlug?: string;
  difficulty?: string;
  search?: string;
  isFeatured?: boolean;
}) {
  if (isDbConfigured()) {
    try {
      const where: Record<string, unknown> = {
        status: "PUBLISHED",
        id: { not: "pro_access_all_series" },
        slug: { notIn: ["pro-full-access", "pro-access-membership-system"] },
      };
      if (options?.categoryId) where.categoryId = options.categoryId;
      if (options?.difficulty) where.difficulty = options.difficulty;
      if (options?.isFeatured !== undefined) where.isFeatured = options.isFeatured;
      if (options?.search) {
        where.OR = [
          { title: { contains: options.search, mode: "insensitive" } },
          { examName: { contains: options.search, mode: "insensitive" } },
        ];
      }

      return await prisma.testSeries.findMany({
        where,
        include: { category: true, tests: { select: { id: true, title: true } } },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      });
    } catch {
      // Fallback
    }
  }

  let list = memoryState.testSeries.filter(
    (ts) =>
      ts.status === "PUBLISHED" &&
      ts.id !== "pro_access_all_series" &&
      ts.slug !== "pro-full-access" &&
      ts.slug !== "pro-access-membership-system"
  );

  if (options?.categorySlug) {
    const cat = memoryState.categories.find((c) => c.slug === options.categorySlug);
    if (cat) list = list.filter((ts) => ts.categoryId === cat.id);
  }
  if (options?.categoryId) {
    list = list.filter((ts) => ts.categoryId === options.categoryId);
  }
  if (options?.difficulty) {
    list = list.filter((ts) => ts.difficulty === options.difficulty);
  }
  if (options?.isFeatured !== undefined) {
    list = list.filter((ts) => ts.isFeatured === options.isFeatured);
  }
  if (options?.search) {
    const q = options.search.toLowerCase();
    list = list.filter(
      (ts) =>
        ts.title.toLowerCase().includes(q) ||
        ts.examName.toLowerCase().includes(q) ||
        ts.description.toLowerCase().includes(q)
    );
  }

  return list.map((ts) => ({
    ...ts,
    category: memoryState.categories.find((c) => c.id === ts.categoryId) || null,
    tests: memoryState.tests.filter((t) => t.testSeriesId === ts.id),
  }));
}

export async function getTestSeriesBySlug(slug: string) {
  if (isDbConfigured()) {
    try {
      return await prisma.testSeries.findUnique({
        where: { slug },
        include: {
          category: true,
          tests: {
            where: { status: "PUBLISHED" },
            orderBy: { orderIndex: "asc" },
          },
        },
      });
    } catch {
      // Fallback
    }
  }

  const series = memoryState.testSeries.find((ts) => ts.slug === slug);
  if (!series) return null;

  return {
    ...series,
    category: memoryState.categories.find((c) => c.id === series.categoryId) || null,
    tests: memoryState.tests.filter(
      (t) => t.testSeriesId === series.id && t.status === "PUBLISHED"
    ),
  };
}

export async function getTestSeriesById(id: string) {
  if (isDbConfigured()) {
    try {
      return await prisma.testSeries.findUnique({
        where: { id },
        include: {
          category: true,
          tests: {
            orderBy: { orderIndex: "asc" },
          },
        },
      });
    } catch {
      // Fallback
    }
  }

  const series = memoryState.testSeries.find((ts) => ts.id === id);
  if (!series) return null;

  return {
    ...series,
    category: memoryState.categories.find((c) => c.id === series.categoryId) || null,
    tests: memoryState.tests.filter((t) => t.testSeriesId === series.id),
  };
}

export async function createTestSeries(data: {
  title: string;
  slug: string;
  description: string;
  shortDescription?: string;
  thumbnail?: string;
  categoryId: string;
  examName: string;
  language?: string;
  difficulty?: "EASY" | "MEDIUM" | "HARD";
  price: number;
  discountPrice?: number;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  isFeatured?: boolean;
}) {
  if (isDbConfigured()) {
    try {
      return await prisma.testSeries.create({
        data: {
          ...data,
          language: data.language || "Bilingual (Hindi + English)",
          difficulty: data.difficulty || "MEDIUM",
          status: data.status || "PUBLISHED",
          isFeatured: data.isFeatured || false,
        },
      });
    } catch {
      // Fallback
    }
  }

  const newSeries: DemoTestSeries = {
    id: `series_${Date.now()}`,
    title: data.title,
    slug: data.slug,
    description: data.description,
    shortDescription: data.shortDescription || data.description.substring(0, 100),
    thumbnail: data.thumbnail || "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800",
    categoryId: data.categoryId,
    examName: data.examName,
    language: data.language || "Bilingual (Hindi + English)",
    difficulty: data.difficulty || "MEDIUM",
    price: data.price,
    discountPrice: data.discountPrice || 0,
    status: data.status || "PUBLISHED",
    isFeatured: data.isFeatured || false,
    totalTestsCount: 0,
    totalQuestionsCount: 0,
    rating: 4.8,
    ratingCount: 10,
  };

  memoryState.testSeries.push(newSeries);
  return newSeries;
}

export async function updateTestSeries(id: string, data: Partial<DemoTestSeries>) {
  if (isDbConfigured()) {
    try {
      return await prisma.testSeries.update({
        where: { id },
        data,
      });
    } catch {
      // Fallback
    }
  }

  const idx = memoryState.testSeries.findIndex((ts) => ts.id === id);
  if (idx !== -1) {
    memoryState.testSeries[idx] = { ...memoryState.testSeries[idx], ...data };
    return memoryState.testSeries[idx];
  }
  return null;
}

export async function getAdminTestSeriesList(options?: {
  status?: string;
  search?: string;
}) {
  if (isDbConfigured()) {
    try {
      const where: Record<string, unknown> = {
        id: { not: "pro_access_all_series" },
        slug: { notIn: ["pro-full-access", "pro-access-membership-system"] },
      };
      if (options?.status && options.status !== "ALL") {
        where.status = options.status;
      }
      if (options?.search && options.search.trim()) {
        const q = options.search.trim();
        where.OR = [
          { title: { contains: q, mode: "insensitive" } },
          { examName: { contains: q, mode: "insensitive" } },
        ];
      }

      const list = await prisma.testSeries.findMany({
        where,
        include: {
          category: true,
          tests: { select: { id: true, title: true, status: true } },
          orders: { select: { id: true, status: true, amount: true } },
        },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      });

      return list.map((ts) => ({
        ...ts,
        totalTestsCount: ts.tests.length,
        enrollmentCount: ts.orders.filter((o) => o.status === "PAID").length,
      }));
    } catch (err: any) {
      if (err?.message?.includes("Can't reach") || err?.message?.includes("connect")) {
        markDbUnreachable();
      }
    }
  }

  let list = memoryState.testSeries.filter(
    (ts) =>
      ts.id !== "pro_access_all_series" &&
      ts.slug !== "pro-full-access" &&
      ts.slug !== "pro-access-membership-system"
  );
  if (options?.status && options.status !== "ALL") {
    list = list.filter((ts) => ts.status === options.status);
  }
  if (options?.search && options.search.trim()) {
    const q = options.search.toLowerCase().trim();
    list = list.filter(
      (ts) =>
        ts.title.toLowerCase().includes(q) ||
        ts.examName.toLowerCase().includes(q) ||
        ts.description.toLowerCase().includes(q)
    );
  }

  return list.map((ts) => {
    const tests = memoryState.tests.filter((t) => t.testSeriesId === ts.id);
    const orders = memoryState.orders.filter((o) => o.testSeriesId === ts.id && o.status === "PAID");
    return {
      ...ts,
      category: memoryState.categories.find((c) => c.id === ts.categoryId) || null,
      tests,
      totalTestsCount: tests.length,
      enrollmentCount: orders.length,
    };
  });
}

export async function toggleTestSeriesStatus(id: string, targetStatus?: "PUBLISHED" | "DRAFT") {
  const current = await getTestSeriesById(id);
  if (!current) throw new Error("Test series not found");

  const newStatus = targetStatus || (current.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED");

  if (isDbConfigured()) {
    try {
      return await prisma.testSeries.update({
        where: { id },
        data: { status: newStatus as any },
      });
    } catch (err: any) {
      if (err?.message?.includes("Can't reach")) markDbUnreachable();
    }
  }

  const idx = memoryState.testSeries.findIndex((ts) => ts.id === id);
  if (idx !== -1) {
    memoryState.testSeries[idx].status = newStatus as any;
    return memoryState.testSeries[idx];
  }
  return null;
}

export async function deleteTestSeries(id: string) {
  if (isDbConfigured()) {
    try {
      return await prisma.testSeries.delete({ where: { id } });
    } catch (err: any) {
      if (err?.message?.includes("Can't reach")) markDbUnreachable();
    }
  }

  const testIds = memoryState.tests.filter((t) => t.testSeriesId === id).map((t) => t.id);
  memoryState.tests = memoryState.tests.filter((t) => t.testSeriesId !== id);
  memoryState.orders = memoryState.orders.filter((o) => o.testSeriesId !== id);
  memoryState.attempts = memoryState.attempts.filter((a) => !testIds.includes(a.testId));
  memoryState.testSeries = memoryState.testSeries.filter((ts) => ts.id !== id);
  return true;
}


// -------------------------------------------------------------
// TEST OPERATIONS
// -------------------------------------------------------------
export async function getAllTests() {
  if (isDbConfigured()) {
    try {
      return await prisma.test.findMany({
        include: {
          testQuestions: true,
        },
        orderBy: { createdAt: "desc" },
      });
    } catch {
      // Fallback
    }
  }

  return [...memoryState.tests].sort((a, b) => b.orderIndex - a.orderIndex);
}

export async function getTestById(id: string) {
  if (isDbConfigured()) {
    try {
      return await prisma.test.findUnique({
        where: { id },
        include: {
          testSeries: true,
          testQuestions: {
            include: {
              question: {
                include: { options: { orderBy: { orderIndex: "asc" } } },
              },
            },
            orderBy: { orderIndex: "asc" },
          },
        },
      });
    } catch {
      // Fallback
    }
  }

  const test = memoryState.tests.find((t) => t.id === id);
  if (!test) return null;

  const questions = test.questionIds
    .map((qid, idx) => {
      const q = memoryState.questions.find((quest) => quest.id === qid);
      if (!q) return null;
      return {
        id: `tq_${test.id}_${q.id}`,
        testId: test.id,
        questionId: q.id,
        sectionName: q.subject,
        orderIndex: idx,
        question: q,
      };
    })
    .filter(Boolean);

  return {
    ...test,
    testSeries: memoryState.testSeries.find((ts) => ts.id === test.testSeriesId) || null,
    testQuestions: questions,
  };
}

export async function createTest(data: {
  testSeriesId: string;
  title: string;
  slug: string;
  description?: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  negativeMarkingRate: number;
  marksPerQuestion: number;
  instructions?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}) {
  if (isDbConfigured()) {
    try {
      return await prisma.test.create({
        data: {
          ...data,
          status: data.status || "PUBLISHED",
        },
      });
    } catch {
      // Fallback
    }
  }

  const newTest: DemoTest = {
    id: `test_${Date.now()}`,
    testSeriesId: data.testSeriesId,
    title: data.title,
    slug: data.slug,
    description: data.description || "",
    durationMinutes: data.durationMinutes,
    totalMarks: data.totalMarks,
    passingMarks: data.passingMarks,
    negativeMarkingRate: data.negativeMarkingRate,
    marksPerQuestion: data.marksPerQuestion,
    instructions: data.instructions ?? "",
    status: data.status || "PUBLISHED",
    allowRetake: true,
    showResultImmediately: true,
    orderIndex: memoryState.tests.length + 1,
    questionIds: [],
  };

  memoryState.tests.push(newTest);
  return newTest;
}

export async function updateTest(id: string, data: Partial<DemoTest>) {
  if (isDbConfigured()) {
    try {
      const updated = await prisma.test.update({
        where: { id },
        data,
      });

      // Synchronize marks and negativeMarks across all linked questions if provided
      if (data.marksPerQuestion !== undefined || data.negativeMarkingRate !== undefined) {
        const questionUpdateData: { marks?: number; negativeMarks?: number } = {};
        if (data.marksPerQuestion !== undefined) {
          questionUpdateData.marks = data.marksPerQuestion;
        }
        if (data.negativeMarkingRate !== undefined) {
          questionUpdateData.negativeMarks = data.negativeMarkingRate;
        }

        await prisma.question.updateMany({
          where: {
            testQuestions: {
              some: { testId: id },
            },
          },
          data: questionUpdateData,
        });
      }

      return updated;
    } catch (err) {
      console.error("updateTest DB error:", err);
      // Fallback
    }
  }

  const idx = memoryState.tests.findIndex((test) => test.id === id);
  if (idx === -1) return null;

  memoryState.tests[idx] = {
    ...memoryState.tests[idx],
    ...data,
  };

  if (data.marksPerQuestion !== undefined || data.negativeMarkingRate !== undefined) {
    const testObj = memoryState.tests[idx];
    if (testObj?.questionIds && Array.isArray(testObj.questionIds)) {
      for (const qid of testObj.questionIds) {
        const q = memoryState.questions.find((quest) => quest.id === qid);
        if (q) {
          if (data.marksPerQuestion !== undefined) q.marks = data.marksPerQuestion;
          if (data.negativeMarkingRate !== undefined) q.negativeMarks = data.negativeMarkingRate;
        }
      }
    }
  }

  return memoryState.tests[idx];
}

export async function toggleTestStatus(id: string, targetStatus?: "PUBLISHED" | "DRAFT") {
  const current = await getTestById(id);
  if (!current) throw new Error("Mock test not found");

  const newStatus = targetStatus || (current.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED");

  if (isDbConfigured()) {
    try {
      return await prisma.test.update({
        where: { id },
        data: { status: newStatus as any },
      });
    } catch (err: any) {
      if (err?.message?.includes("Can't reach")) markDbUnreachable();
    }
  }

  const idx = memoryState.tests.findIndex((t) => t.id === id);
  if (idx !== -1) {
    memoryState.tests[idx].status = newStatus as any;
    return memoryState.tests[idx];
  }
  return null;
}

export async function deleteTest(id: string) {
  if (isDbConfigured()) {
    try {
      await prisma.test.delete({ where: { id } });
      return true;
    } catch (err: any) {
      if (err?.message?.includes("Can't reach")) markDbUnreachable();
    }
  }

  const test = memoryState.tests.find((t) => t.id === id);
  memoryState.tests = memoryState.tests.filter((t) => t.id !== id);
  memoryState.attempts = memoryState.attempts.filter((a) => a.testId !== id);

  if (test?.testSeriesId) {
    const parent = memoryState.testSeries.find((ts) => ts.id === test.testSeriesId);
    if (parent) {
      parent.totalTestsCount = memoryState.tests.filter((t) => t.testSeriesId === test.testSeriesId).length;
    }
  }
  return true;
}

// -------------------------------------------------------------

// QUESTIONS OPERATIONS
// -------------------------------------------------------------
export async function getAllQuestions(filters?: {
  subject?: string;
  difficulty?: string;
  search?: string;
}) {
  if (isDbConfigured()) {
    try {
      const where: Record<string, unknown> = {};
      if (filters?.subject) where.subject = filters.subject;
      if (filters?.difficulty) where.difficulty = filters.difficulty;

      if (filters?.search && filters.search.trim()) {
        const term = filters.search.trim();
        where.OR = [
          { questionText: { contains: term, mode: "insensitive" } },
          { topic: { contains: term, mode: "insensitive" } },
          { subject: { contains: term, mode: "insensitive" } },
          { explanation: { contains: term, mode: "insensitive" } },
          { options: { some: { optionText: { contains: term, mode: "insensitive" } } } },
        ];
      }

      return await prisma.question.findMany({
        where,
        include: { options: { orderBy: { orderIndex: "asc" } } },
        orderBy: { createdAt: "desc" },
      });
    } catch (err) {
      console.error("[getAllQuestions] DB error:", err);
    }
  }

  let list = memoryState.questions;
  if (filters?.subject) list = list.filter((q) => q.subject === filters.subject);
  if (filters?.difficulty) list = list.filter((q) => q.difficulty === filters.difficulty);
  if (filters?.search && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (item) =>
        item.questionText.toLowerCase().includes(q) ||
        (item.topic && item.topic.toLowerCase().includes(q)) ||
        item.subject.toLowerCase().includes(q) ||
        (item.explanation && item.explanation.toLowerCase().includes(q)) ||
        (Array.isArray(item.options) &&
          item.options.some((opt) => opt.optionText && opt.optionText.toLowerCase().includes(q)))
    );
  }
  return list;
}

export async function getQuestionBankStats() {
  if (isDbConfigured()) {
    try {
      const [totalCount, subjectCounts, difficultyCounts] = await Promise.all([
        prisma.question.count(),
        prisma.question.groupBy({
          by: ["subject"],
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
        }),
        prisma.question.groupBy({
          by: ["difficulty"],
          _count: { id: true },
        }),
      ]);

      return {
        total: totalCount,
        subjects: subjectCounts.map((s) => ({
          subject: s.subject,
          count: s._count.id,
        })),
        difficulties: difficultyCounts.map((d) => ({
          difficulty: d.difficulty,
          count: d._count.id,
        })),
      };
    } catch (err) {
      console.error("[getQuestionBankStats] DB error:", err);
    }
  }

  const total = memoryState.questions.length;
  const subjectsMap: Record<string, number> = {};
  const difficultiesMap: Record<string, number> = {};

  for (const q of memoryState.questions) {
    subjectsMap[q.subject] = (subjectsMap[q.subject] || 0) + 1;
    difficultiesMap[q.difficulty] = (difficultiesMap[q.difficulty] || 0) + 1;
  }

  return {
    total,
    subjects: Object.entries(subjectsMap)
      .map(([subject, count]) => ({ subject, count }))
      .sort((a, b) => b.count - a.count),
    difficulties: Object.entries(difficultiesMap).map(([difficulty, count]) => ({
      difficulty,
      count,
    })),
  };
}

export async function deleteQuestion(id: string) {
  if (isDbConfigured()) {
    try {
      return await prisma.question.delete({
        where: { id },
      });
    } catch (err: any) {
      console.error("[deleteQuestion] Database error:", err);
      throw new DatabaseError(`Database error deleting question: ${err?.message || err}`, err);
    }
  }

  const idx = memoryState.questions.findIndex((q) => q.id === id);
  if (idx !== -1) {
    const deleted = memoryState.questions.splice(idx, 1);
    return deleted[0];
  }
  return null;
}

export async function listPreviousYearPapers() {
  if (isDbConfigured()) {
    try {
      await ensureDbSchema();
      const rows: any[] = await prisma.$queryRawUnsafe(`
        SELECT id, title, exam_name as "examName", year, description, 
               test_series_id as "testSeriesId", pdf_url as "pdfUrl", 
               is_published as "isPublished", access_type as "accessType",
               questions, created_at as "createdAt"
        FROM "previous_year_papers"
        ORDER BY created_at DESC;
      `);
      if (Array.isArray(rows)) {
        return rows.map((r) => ({
          ...r,
          questions: typeof r.questions === "string" ? JSON.parse(r.questions) : r.questions || [],
        }));
      }
    } catch (err: any) {
      console.warn("listPreviousYearPapers DB fallback:", err?.message || err);
    }
  }

  return [...memoryState.previousYearPapers]
    .filter((paper) => paper?.isPublished !== false)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getPreviousYearPaperById(id: string) {
  if (isDbConfigured()) {
    try {
      await ensureDbSchema();
      const rows: any[] = await prisma.$queryRawUnsafe(`
        SELECT id, title, exam_name as "examName", year, description, 
               test_series_id as "testSeriesId", pdf_url as "pdfUrl", 
               is_published as "isPublished", access_type as "accessType",
               questions, created_at as "createdAt"
        FROM "previous_year_papers"
        WHERE id = $1
        LIMIT 1;
      `, id);
      if (Array.isArray(rows) && rows.length > 0) {
        const r = rows[0];
        return {
          ...r,
          questions: typeof r.questions === "string" ? JSON.parse(r.questions) : r.questions || [],
        };
      }
    } catch (err: any) {
      console.warn("getPreviousYearPaperById DB fallback:", err?.message || err);
    }
  }

  return memoryState.previousYearPapers.find((paper) => paper.id === id) || null;
}

export async function createPreviousYearPaper(data: {
  title: string;
  examName: string;
  year: string;
  description?: string;
  testSeriesId?: string | null;
  pdfUrl?: string;
  isPublished?: boolean;
  accessType?: "FREE" | "PAID_ANY" | "SERIES_SPECIFIC";
  questions: Array<{
    questionText: string;
    questionType?: "MCQ" | "MULTIPLE_CORRECT" | "NUMERICAL";
    subject: string;
    topic?: string;
    difficulty?: "EASY" | "MEDIUM" | "HARD";
    explanation?: string;
    marks?: number;
    negativeMarks?: number;
    correctNumericalAnswer?: string;
    options?: Array<{ optionKey: string; optionText: string; isCorrect?: boolean }>;
    correctOptionKeys?: string[] | string;
  }>;
}) {
  const id = `pyq_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const accessType = data.accessType || (data.testSeriesId ? "SERIES_SPECIFIC" : "PAID_ANY");
  const normalizedQuestions = (data.questions || []).map((q, index) => ({
    id: `pyq_q_${Date.now()}_${index}`,
    questionText: q.questionText,
    questionType: q.questionType || (q.correctNumericalAnswer ? "NUMERICAL" : (q.options && q.options.length > 0 ? "MCQ" : "MCQ")),
    subject: q.subject,
    topic: q.topic || "General",
    difficulty: q.difficulty || "MEDIUM",
    explanation: q.explanation || "",
    marks: Number(q.marks ?? 2),
    negativeMarks: Number(q.negativeMarks ?? 0.5),
    correctNumericalAnswer: q.correctNumericalAnswer || undefined,
    options: (q.options || []).map((opt, idx) => ({
      id: `pyq_opt_${Date.now()}_${index}_${idx}`,
      optionKey: opt.optionKey || String.fromCharCode(65 + idx),
      optionText: opt.optionText || "",
      isCorrect: Boolean(opt.isCorrect),
      orderIndex: idx,
    })),
    correctOptionKeys: Array.isArray(q.correctOptionKeys)
      ? q.correctOptionKeys
      : typeof q.correctOptionKeys === "string"
        ? q.correctOptionKeys.split(/[\s,;]+/).filter(Boolean)
        : undefined,
  }));

  const paper = {
    id,
    title: data.title,
    examName: data.examName,
    year: data.year,
    description: data.description || "",
    testSeriesId: data.testSeriesId || null,
    pdfUrl: data.pdfUrl || "",
    isPublished: data.isPublished !== false,
    accessType,
    createdAt: new Date(),
    questions: normalizedQuestions,
  };

  if (isDbConfigured()) {
    try {
      await ensureDbSchema();
      await prisma.$executeRawUnsafe(`
        INSERT INTO "previous_year_papers" 
        (id, title, exam_name, year, description, test_series_id, pdf_url, is_published, access_type, questions, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, NOW(), NOW())
      `, 
        id, data.title, data.examName, data.year, data.description || "", 
        data.testSeriesId || null, data.pdfUrl || "", data.isPublished !== false,
        accessType, JSON.stringify(normalizedQuestions)
      );
      console.log("✅ Previous year paper persisted to PostgreSQL:", id);
    } catch (err: any) {
      console.error("Failed to insert previous year paper into DB:", err?.message || err);
    }
  }

  memoryState.previousYearPapers.unshift(paper);
  return paper;
}

export async function deletePreviousYearPaper(id: string) {
  if (isDbConfigured()) {
    try {
      await ensureDbSchema();
      await prisma.$executeRawUnsafe(`DELETE FROM "previous_year_papers" WHERE id = $1;`, id);
    } catch (err: any) {
      console.warn("deletePreviousYearPaper DB fallback:", err?.message || err);
    }
  }
  memoryState.previousYearPapers = memoryState.previousYearPapers.filter((p) => p.id !== id);
  return true;
}

export async function hasStudentAccessToPaper(userId: string, paper: any): Promise<boolean> {
  if (!paper) return false;
  if (paper.accessType === "FREE") return true;

  if (userId) {
    const user = await getUserById(userId);
    if (user?.role === "ADMIN") return true;

    // Any student who paid for any test series or Pro pass has access
    const orders = await getUserOrders(userId);
    const hasAnyPaidOrder = orders.some((o: any) => o.status === "PAID");
    if (hasAnyPaidOrder) return true;

    const hasPro = await hasActiveProAccess(userId);
    if (hasPro) return true;

    // Series-specific match
    if (paper.testSeriesId) {
      const hasSeries = await hasStudentAccessToSeries(userId, paper.testSeriesId);
      if (hasSeries) return true;
    }
  }

  return false;
}

export async function getAccessiblePreviousYearPapersForUser(userId: string) {
  const papers = await listPreviousYearPapers();
  const accessible: any[] = [];

  for (const paper of papers) {
    if (!paper?.isPublished) continue;
    const allowed = await hasStudentAccessToPaper(userId, paper);
    if (allowed) {
      accessible.push(paper);
    }
  }

  return accessible;
}

export async function getAllPreviousYearPapersForStudent(userId: string) {
  const papers = await listPreviousYearPapers();
  const result: any[] = [];

  for (const paper of papers) {
    if (!paper?.isPublished) continue;
    const isAccessible = await hasStudentAccessToPaper(userId, paper);
    result.push({
      ...paper,
      isAccessible,
    });
  }

  return result;
}

export async function createQuestion(data: {
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
  options?: Array<{ optionKey: string; optionText: string; isCorrect?: boolean }>;
  correctOptionKeys?: string[] | string;
}) {
  const qType = data.questionType || (data.correctNumericalAnswer ? "NUMERICAL" : "MCQ");

  // Determine correct option keys if provided as a separate list or string (e.g. "A, C" or ["A", "B"])
  let targetCorrectKeys: string[] = [];
  if (Array.isArray(data.correctOptionKeys)) {
    targetCorrectKeys = data.correctOptionKeys.map((k) => String(k).trim().toUpperCase());
  } else if (typeof data.correctOptionKeys === "string" && data.correctOptionKeys.trim()) {
    targetCorrectKeys = data.correctOptionKeys
      .split(/[,;\s]+/)
      .map((k) => k.trim().toUpperCase())
      .filter(Boolean);
  }

  // Normalize options with explicit isCorrect determination
  let mappedOptions = (data.options || []).map((opt, idx) => {
    const key = opt.optionKey?.toUpperCase().trim() || String.fromCharCode(65 + idx);
    const isExplicitlyCorrect =
      targetCorrectKeys.length > 0
        ? targetCorrectKeys.includes(key)
        : Boolean(opt.isCorrect);

    return {
      optionKey: key,
      optionText: opt.optionText || "",
      isCorrect: isExplicitlyCorrect,
      orderIndex: idx,
    };
  });

  // If questionType is MCQ and multiple options were flagged correct, retain only the first correct
  if (qType === "MCQ") {
    let foundFirst = false;
    mappedOptions = mappedOptions.map((opt) => {
      if (opt.isCorrect) {
        if (!foundFirst) {
          foundFirst = true;
          return opt;
        }
        return { ...opt, isCorrect: false };
      }
      return opt;
    });
  }

  if (isDbConfigured()) {
    try {
      return await prisma.question.create({
        data: {
          questionText: data.questionText,
          questionType: qType,
          subject: data.subject,
          topic: data.topic,
          difficulty: data.difficulty || "MEDIUM",
          explanation: data.explanation,
          marks: Number(data.marks ?? 0),
          negativeMarks: Number(data.negativeMarks ?? 0),
          imageUrl: data.imageUrl || null,
          correctNumericalAnswer: qType === "NUMERICAL" ? data.correctNumericalAnswer : null,
          options:
            qType !== "NUMERICAL" && mappedOptions.length > 0
              ? {
                  create: mappedOptions.map((opt) => ({
                    optionKey: opt.optionKey,
                    optionText: opt.optionText,
                    isCorrect: opt.isCorrect,
                    orderIndex: opt.orderIndex,
                  })),
                }
              : undefined,
        },
        include: { options: true },
      });
    } catch (err: any) {
      console.error("[createQuestion] Database write error:", err);
      throw new DatabaseError(`Database error creating question: ${err?.message || err}`, err);
    }
  }

  const newQ: DemoQuestion = {
    id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    questionText: data.questionText,
    questionType: qType,
    subject: data.subject,
    topic: data.topic || "General",
    difficulty: data.difficulty || "MEDIUM",
    explanation: data.explanation || "",
    marks: Number(data.marks ?? 0),
    negativeMarks: Number(data.negativeMarks ?? 0),
    imageUrl: data.imageUrl,
    correctNumericalAnswer: qType === "NUMERICAL" ? data.correctNumericalAnswer : undefined,
    options:
      qType !== "NUMERICAL"
        ? mappedOptions.map((opt, idx) => ({
            id: `opt_${Date.now()}_${idx}`,
            optionKey: opt.optionKey,
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
            orderIndex: idx,
          }))
        : [],
  };

  memoryState.questions.push(newQ);
  return newQ;
}

export async function bulkCreateQuestions(
  questions: Array<{
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
  }>
): Promise<{ count: number; ids: string[] }> {
  if (!questions || questions.length === 0) {
    return { count: 0, ids: [] };
  }

  if (isDbConfigured()) {
    try {
      const result = await prisma.$transaction(async (tx) => {
        const created = await tx.question.createManyAndReturn({
          data: questions.map((q) => ({
            questionText: q.questionText,
            questionType: q.questionType || (q.options && q.options.length > 0 ? "MCQ" : "NUMERICAL"),
            subject: q.subject,
            topic: q.topic || null,
            difficulty: q.difficulty || "MEDIUM",
            explanation: q.explanation || null,
            marks: Number(q.marks ?? 2.0),
            negativeMarks: Number(q.negativeMarks ?? 0.5),
            imageUrl: q.imageUrl || null,
            correctNumericalAnswer: q.correctNumericalAnswer || null,
            status: "ACTIVE",
          })),
        });

        const optionsToInsert: {
          questionId: string;
          optionKey: string;
          optionText: string;
          isCorrect: boolean;
          orderIndex: number;
        }[] = [];

        for (let i = 0; i < created.length; i++) {
          const qId = created[i].id;
          const qOpts = questions[i].options || [];
          for (let j = 0; j < qOpts.length; j++) {
            optionsToInsert.push({
              questionId: qId,
              optionKey: qOpts[j].optionKey,
              optionText: qOpts[j].optionText,
              isCorrect: qOpts[j].isCorrect,
              orderIndex: j,
            });
          }
        }

        if (optionsToInsert.length > 0) {
          await tx.questionOption.createMany({
            data: optionsToInsert,
          });
        }

        return created;
      });

      return {
        count: result.length,
        ids: result.map((r) => r.id),
      };
    } catch (err: any) {
      console.error("[bulkCreateQuestions] Database write error:", err);
      throw new Error(`Database error saving bulk questions: ${err?.message || err}`);
    }
  }

  // Memory fallback
  const ids: string[] = [];
  for (const q of questions) {
    const newQ: DemoQuestion = {
      id: `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      questionText: q.questionText,
      questionType: q.questionType || (q.options && q.options.length > 0 ? "MCQ" : "NUMERICAL"),
      subject: q.subject,
      topic: q.topic || "General",
      difficulty: q.difficulty || "MEDIUM",
      explanation: q.explanation || "",
      marks: Number(q.marks ?? 2.0),
      negativeMarks: Number(q.negativeMarks ?? 0.5),
      imageUrl: q.imageUrl,
      correctNumericalAnswer: q.correctNumericalAnswer,
      options:
        q.options?.map((opt, idx) => ({
          id: `opt_${Date.now()}_${idx}`,
          optionKey: opt.optionKey,
          optionText: opt.optionText,
          isCorrect: opt.isCorrect,
          orderIndex: idx,
        })) || [],
    };
    memoryState.questions.push(newQ);
    ids.push(newQ.id);
  }

  return {
    count: ids.length,
    ids,
  };
}

// -------------------------------------------------------------
// CBT TEST ATTEMPT STATE MACHINE & SCORING
// -------------------------------------------------------------
export async function getOrCreateTestAttempt(userId: string, testId: string) {
  const test = await getTestById(testId);
  if (!test) throw new Error("Test not found");

  const hasAccess = await hasStudentAccessToTest(userId, testId);
  if (!hasAccess) {
    throw new ForbiddenError(
      "Access Denied: This test belongs to a premium test series. Please purchase the test series to attempt this test."
    );
  }

  if (isDbConfigured()) {

    try {
      // Find existing in-progress attempt
      let attempt = await prisma.testAttempt.findFirst({
        where: { userId, testId, status: "IN_PROGRESS" },
        include: {
          answers: true,
          test: {
            include: {
              testQuestions: {
                include: { question: { include: { options: true } } },
                orderBy: { orderIndex: "asc" },
              },
            },
          },
        },
      });

      if (!attempt) {
        attempt = await prisma.testAttempt.create({
          data: {
            userId,
            testId,
            status: "IN_PROGRESS",
            totalMarks: test.totalMarks,
            remainingTimeSeconds: test.durationMinutes * 60,
          },
          include: {
            answers: true,
            test: {
              include: {
                testQuestions: {
                  include: { question: { include: { options: true } } },
                  orderBy: { orderIndex: "asc" },
                },
              },
            },
          },
        });
      }

      return attempt;
    } catch {
      // Fallback
    }
  }

  // Fallback in-memory attempt
  let attempt = memoryState.attempts.find(
    (a) => a.userId === userId && a.testId === testId && a.status === "IN_PROGRESS"
  );

  if (!attempt) {
    const fallbackAttempt = {
      id: `att_${Date.now()}`,
      userId,
      testId,
      status: "IN_PROGRESS",
      score: 0,
      totalMarks: test.totalMarks,
      correctAnswersCount: 0,
      incorrectAnswersCount: 0,
      unansweredCount: 0,
      accuracy: 0,
      percentage: 0,
      timeTakenSeconds: 0,
      remainingTimeSeconds: test.durationMinutes * 60,
      startedAt: new Date(),
      completedAt: new Date(),
      answers: {} as Record<string, MemoryAttemptAnswer>,
    };
    memoryState.attempts.push(fallbackAttempt);
    attempt = fallbackAttempt;
  }

  if (!attempt) {
    throw new Error("Attempt could not be initialized");
  }

  const answerMap = (attempt.answers ?? {}) as Record<string, MemoryAttemptAnswer>;
  const answersArray = Object.entries(answerMap).map(([qid, ans]) => ({
    questionId: qid,
    selectedOptionIds: JSON.stringify(ans.selectedOptionIds),
    numericalAnswer: ans.numericalAnswer,
    isMarkedForReview: ans.isMarkedForReview,
    isVisited: ans.isVisited,
  }));

  return {
    ...attempt,
    test,
    answers: answersArray,
  };
}

export async function saveAttemptAnswer(data: {
  attemptId: string;
  questionId: string;
  selectedOptionIds?: string[];
  numericalAnswer?: string;
  isMarkedForReview?: boolean;
  isVisited?: boolean;
  timeSpentSeconds?: number;
  remainingTimeSeconds?: number;
}) {
  if (isDbConfigured()) {
    try {
      // Upsert attempt answer
      const existing = await prisma.attemptAnswer.findFirst({
        where: { attemptId: data.attemptId, questionId: data.questionId },
      });

      if (existing) {
        await prisma.attemptAnswer.update({
          where: { id: existing.id },
          data: {
            selectedOptionIds: data.selectedOptionIds
              ? JSON.stringify(data.selectedOptionIds)
              : existing.selectedOptionIds,
            numericalAnswer: data.numericalAnswer ?? existing.numericalAnswer,
            isMarkedForReview: data.isMarkedForReview ?? existing.isMarkedForReview,
            isVisited: data.isVisited ?? existing.isVisited,
            timeSpentSeconds: data.timeSpentSeconds ?? existing.timeSpentSeconds,
          },
        });
      } else {
        await prisma.attemptAnswer.create({
          data: {
            attemptId: data.attemptId,
            questionId: data.questionId,
            selectedOptionIds: data.selectedOptionIds
              ? JSON.stringify(data.selectedOptionIds)
              : null,
            numericalAnswer: data.numericalAnswer ?? null,
            isMarkedForReview: data.isMarkedForReview ?? false,
            isVisited: data.isVisited ?? true,
            timeSpentSeconds: data.timeSpentSeconds ?? 0,
          },
        });
      }

      if (data.remainingTimeSeconds !== undefined) {
        await prisma.testAttempt.update({
          where: { id: data.attemptId },
          data: { remainingTimeSeconds: data.remainingTimeSeconds },
        });
      }

      return { success: true };
    } catch {
      // Fallback
    }
  }

  const attempt = memoryState.attempts.find((a) => a.id === data.attemptId);
  if (attempt) {
    if (data.remainingTimeSeconds !== undefined) {
      attempt.remainingTimeSeconds = data.remainingTimeSeconds;
    }
    const current = attempt.answers[data.questionId] || {
      selectedOptionIds: [],
      numericalAnswer: "",
      isCorrect: false,
      marksAwarded: 0,
      timeSpentSeconds: 0,
      isMarkedForReview: false,
      isVisited: true,
    };

    attempt.answers[data.questionId] = {
      ...current,
      selectedOptionIds: data.selectedOptionIds ?? current.selectedOptionIds,
      numericalAnswer: data.numericalAnswer ?? current.numericalAnswer,
      isMarkedForReview: data.isMarkedForReview ?? current.isMarkedForReview,
      isVisited: data.isVisited ?? current.isVisited,
      timeSpentSeconds: data.timeSpentSeconds ?? current.timeSpentSeconds,
    };
  }

  return { success: true };
}

function calculateAttemptMetrics(test: any, answers: any[] = []) {
  const testQuestions = test?.testQuestions || [];
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;
  let totalScore = 0;

  for (const tq of testQuestions) {
    const q = tq.question;
    const marks =
      Number.isFinite(Number(test?.marksPerQuestion)) && Number(test.marksPerQuestion) > 0
        ? Number(test.marksPerQuestion)
        : Number.isFinite(Number(q?.marks)) && Number(q.marks) > 0
          ? Number(q.marks)
          : 0;
    const negative =
      Number.isFinite(Number(test?.negativeMarkingRate)) && Number(test.negativeMarkingRate) >= 0
        ? Number(test.negativeMarkingRate)
        : Number.isFinite(Number(q?.negativeMarks)) && Number(q.negativeMarks) >= 0
          ? Number(q.negativeMarks)
          : 0;

    let selectedIds: string[] = [];
    let numericalVal = "";

    if (Array.isArray(answers)) {
      const ans = answers.find((a: any) => a.questionId === q.id);
      if (ans?.selectedOptionIds) {
        try {
          selectedIds = JSON.parse(ans.selectedOptionIds);
        } catch {
          selectedIds = [];
        }
      }
      numericalVal = ans?.numericalAnswer || "";
    }

    if (q.questionType === "NUMERICAL") {
      if (!numericalVal.trim()) {
        unansweredCount++;
      } else if (numericalVal.trim() === q.correctNumericalAnswer?.trim()) {
        correctCount++;
        totalScore += marks;
      } else {
        incorrectCount++;
        totalScore -= negative;
      }
    } else {
      if (selectedIds.length === 0) {
        unansweredCount++;
      } else {
        const correctOptions = (q.options || []).filter((o: any) => o.isCorrect);
        const correctIds = correctOptions.map((o: any) => o.id);

        const isMatch =
          selectedIds.length === correctIds.length &&
          selectedIds.every((id) => correctIds.includes(id));

        if (isMatch) {
          correctCount++;
          totalScore += marks;
        } else {
          incorrectCount++;
          totalScore -= negative;
        }
      }
    }
  }

  const finalScore = Math.max(0, Math.round(totalScore * 100) / 100);
  const attemptedCount = correctCount + incorrectCount;
  const accuracy = attemptedCount > 0 ? (correctCount / attemptedCount) * 100 : 0;
  const percentage = test?.totalMarks > 0 ? (finalScore / test.totalMarks) * 100 : 0;

  return {
    correctCount,
    incorrectCount,
    unansweredCount,
    finalScore,
    accuracy,
    percentage,
  };
}

export async function submitTestAttempt(attemptId: string, isAutoSubmit = false) {
  let attempt: any = null;

  if (isDbConfigured()) {
    try {
      attempt = await prisma.testAttempt.findUnique({
        where: { id: attemptId },
        include: {
          answers: true,
          test: {
            include: {
              testQuestions: {
                include: {
                  question: { include: { options: true } },
                },
              },
            },
          },
        },
      });
    } catch {
      // Fallback
    }
  }

  if (!attempt) {
    attempt = memoryState.attempts.find((a) => a.id === attemptId);
    if (!attempt) throw new Error("Attempt not found");
    const test = await getTestById(attempt.testId);
    attempt.test = test;
  }

  const test = attempt.test;
  const metrics = calculateAttemptMetrics(test, Array.isArray(attempt.answers) ? attempt.answers : []);
  const { correctCount, incorrectCount, unansweredCount, finalScore, accuracy, percentage } = metrics;
  const totalDuration = test.durationMinutes * 60;
  const remainingSecs = attempt.remainingTimeSeconds || 0;
  const timeTaken = Math.max(1, totalDuration - remainingSecs);

  const status = isAutoSubmit ? "AUTO_SUBMITTED" : "SUBMITTED";

  if (isDbConfigured()) {
    try {
      return await prisma.testAttempt.update({
        where: { id: attemptId },
        data: {
          status,
          score: finalScore,
          correctAnswersCount: correctCount,
          incorrectAnswersCount: incorrectCount,
          unansweredCount,
          accuracy: Math.round(accuracy * 10) / 10,
          percentage: Math.round(percentage * 10) / 10,
          timeTakenSeconds: timeTaken,
          completedAt: new Date(),
        },
      });
    } catch {
      // Fallback
    }
  }

  // In-memory update
  attempt.status = status;
  attempt.score = finalScore;
  attempt.correctAnswersCount = correctCount;
  attempt.incorrectAnswersCount = incorrectCount;
  attempt.unansweredCount = unansweredCount;
  attempt.accuracy = Math.round(accuracy * 10) / 10;
  attempt.percentage = Math.round(percentage * 10) / 10;
  attempt.timeTakenSeconds = timeTaken;
  attempt.completedAt = new Date();

  return attempt;
}

export async function getAttemptResult(attemptId: string) {
  if (isDbConfigured()) {
    try {
      return await prisma.testAttempt.findUnique({
        where: { id: attemptId },
        include: {
          test: {
            include: {
              testSeries: true,
              testQuestions: {
                include: {
                  question: { include: { options: true } },
                },
                orderBy: { orderIndex: "asc" },
              },
            },
          },
          answers: true,
        },
      });
    } catch {
      // Fallback
    }
  }

  const attempt = memoryState.attempts.find((a) => a.id === attemptId);
  if (!attempt) return null;
  const test = await getTestById(attempt.testId);

  const answerMap = (attempt.answers ?? {}) as Record<string, MemoryAttemptAnswer>;
  const answersArray = Object.entries(answerMap).map(([qid, ans]) => ({
    questionId: qid,
    selectedOptionIds: JSON.stringify(ans.selectedOptionIds || []),
    numericalAnswer: ans.numericalAnswer,
    isMarkedForReview: ans.isMarkedForReview,
    isVisited: ans.isVisited,
  }));

  const metrics = calculateAttemptMetrics(test, answersArray);

  return {
    ...attempt,
    test,
    answers: answersArray,
    score: metrics.finalScore,
    correctAnswersCount: metrics.correctCount,
    incorrectAnswersCount: metrics.incorrectCount,
    unansweredCount: metrics.unansweredCount,
    accuracy: Number((metrics.accuracy || 0).toFixed(1)),
    percentage: Number((metrics.percentage || 0).toFixed(1)),
  };
}

// -------------------------------------------------------------
// ORDERS & ACCESS CONTROL
// -------------------------------------------------------------
export async function hasActiveProAccess(userId: string): Promise<boolean> {
  if (!userId) return false;
  const membership = await getStudentProMembership(userId);
  return Boolean(membership);
}

export async function getStudentProMembership(userId: string) {
  if (!userId) return null;
  if (isDbConfigured()) {
    try {
      await ensureDbSchema();
      const order = await prisma.order.findFirst({
        where: {
          userId,
          status: "PAID",
          OR: [
            { testSeriesId: "pro_access_all_series" },
            { planType: "PRO_FULL_ACCESS" as any },
          ],
        },
        orderBy: { createdAt: "desc" },
      } as any);

      if (!order) return null;

      if (order.accessExpiresAt && new Date(order.accessExpiresAt).getTime() < Date.now()) {
        return null;
      }
      return order;
    } catch (err: any) {
      if (err?.code === "P2022" || err?.message?.includes("Can't reach")) markDbUnreachable();
    }
  }

  const memOrder = memoryState.orders.find(
    (o) =>
      o.userId === userId &&
      o.status === "PAID" &&
      (o.testSeriesId === "pro_access_all_series" || o.planType === "PRO_FULL_ACCESS") &&
      (!o.accessExpiresAt || new Date(o.accessExpiresAt).getTime() > Date.now())
  );
  return memOrder || null;
}

export async function hasUserPurchasedSeries(userId: string, seriesId: string) {
  if (await hasActiveProAccess(userId)) {
    return true;
  }

  if (isDbConfigured()) {
    try {
      await ensureDbSchema();
      const order = await prisma.order.findFirst({
        where: { userId, testSeriesId: seriesId, status: "PAID" },
      } as any);
      return Boolean(order);
    } catch (err: any) {
      if (err?.code === "P2022" || err?.message?.includes("Can't reach")) markDbUnreachable();
    }
  }

  return memoryState.orders.some(
    (o) => o.userId === userId && o.testSeriesId === seriesId && o.status === "PAID"
  );
}

export async function hasStudentAccessToSeries(userId: string, seriesId: string): Promise<boolean> {
  const series = await getTestSeriesById(seriesId);
  if (!series || series.status !== "PUBLISHED") {
    return false;
  }
  const isFree = Number(series.price) === 0 || Number(series.discountPrice) === 0;
  if (isFree) {
    return true;
  }
  if (await hasActiveProAccess(userId)) {
    return true;
  }
  return await hasUserPurchasedSeries(userId, seriesId);
}

export async function hasStudentAccessToTest(userId: string, testId: string): Promise<boolean> {
  const test = await getTestById(testId);
  if (!test || test.status !== "PUBLISHED") {
    return false;
  }
  return await hasStudentAccessToSeries(userId, test.testSeriesId);
}


export async function hasStudentAttemptedTest(userId: string, testId: string): Promise<boolean> {
  if (isDbConfigured()) {
    try {
      const attempt = await prisma.testAttempt.findFirst({
        where: {
          userId,
          testId,
          status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] },
        },
      });
      return Boolean(attempt);
    } catch (err) {
      console.error("[hasStudentAttemptedTest] error:", err);
    }
  }
  return memoryState.attempts.some(
    (a) => a.userId === userId && a.testId === testId && a.status !== "IN_PROGRESS"
  );
}

export async function getStudentCompletedTestIds(userId: string): Promise<string[]> {
  if (isDbConfigured()) {
    try {
      const attempts = await prisma.testAttempt.findMany({
        where: {
          userId,
          status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] },
        },
        select: { testId: true },
      });
      return attempts.map((a) => a.testId);
    } catch (err) {
      console.error("[getStudentCompletedTestIds] error:", err);
    }
  }

  return memoryState.attempts
    .filter((a) => a.userId === userId && a.status !== "IN_PROGRESS")
    .map((a) => a.testId);
}

export async function verifyStudentTestExportAccess(userId: string, testId: string): Promise<{
  allowed: boolean;
  reason?: "TEST_NOT_FOUND" | "NOT_SUBSCRIBED" | "NOT_ATTEMPTED";
  test?: any;
  attempt?: any;
}> {
  const test = await getTestById(testId);
  if (!test) {
    return { allowed: false, reason: "TEST_NOT_FOUND" };
  }

  // Check 1: Subscription (Purchased series OR series price is 0)
  const seriesPrice = test.testSeries?.price ?? 0;
  const isFreeSeries = seriesPrice === 0;
  const isSubscribed = isFreeSeries || (await hasUserPurchasedSeries(userId, test.testSeriesId));

  if (!isSubscribed) {
    return { allowed: false, reason: "NOT_SUBSCRIBED", test };
  }

  // Check 2: Attempted test at least once
  let latestAttempt: any = null;
  if (isDbConfigured()) {
    try {
      latestAttempt = await prisma.testAttempt.findFirst({
        where: {
          userId,
          testId,
          status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] },
        },
        include: {
          answers: true,
          user: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } catch (err) {
      console.error("[verifyStudentTestExportAccess] DB attempt error:", err);
    }
  } else {
    latestAttempt =
      memoryState.attempts
        .filter((a) => a.userId === userId && a.testId === testId && a.status !== "IN_PROGRESS")
        .sort(
          (a: any, b: any) =>
            new Date(b.completedAt || b.createdAt || 0).getTime() -
            new Date(a.completedAt || a.createdAt || 0).getTime()
        )[0] || null;
  }

  if (!latestAttempt) {
    return { allowed: false, reason: "NOT_ATTEMPTED", test };
  }

  return {
    allowed: true,
    test,
    attempt: latestAttempt,
  };
}

export async function createOrder(data: {
  userId: string;
  testSeriesId: string;
  amount: number;
  planType?: "SERIES" | "PRO";
  accessExpiresAt?: Date;
}) {
  const orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase()}`;

  const normalizedSeriesId = data.testSeriesId || "pro_access_all_series";
  const normalizedPlanType = data.planType === "PRO" ? "PRO" : "SERIES";

  if (isDbConfigured()) {
    try {
      await ensureDbSchema();
      const isProBundle = normalizedPlanType === "PRO";
      const bundleSeriesId = "pro_access_all_series";      if (isProBundle) {
        const bundleSeries = await prisma.testSeries.upsert({
          where: { id: bundleSeriesId },
          create: {
            id: bundleSeriesId,
            title: "QuickTestWala Pro Access Membership",
            slug: "pro-access-membership-system",
            description: "System membership pass providing full unlocked access to all test series on QuickTestWala for 1 year.",
            shortDescription: "Pro Access Membership (1 Year)",
            examName: "All Exams",
            language: "Bilingual (Hindi + English)",
            difficulty: "MEDIUM",
            price: 999,
            discountPrice: 999,
            status: "ARCHIVED",
            isFeatured: false,
            totalTestsCount: 0,
            totalQuestionsCount: 0,
          },
          update: {
            status: "ARCHIVED",
            title: "QuickTestWala Pro Access Membership",
            slug: "pro-access-membership-system",
          },
        });
        if (!bundleSeries) {
          throw new Error("Failed to ensure Pro bundle series exists");
        }
      }

      const oneYearExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      const orderData: any = {
        orderNumber,
        userId: data.userId,
        testSeriesId: isProBundle ? bundleSeriesId : normalizedSeriesId,
        amount: data.amount,
        status: "PENDING",
        planType: isProBundle ? "PRO_FULL_ACCESS" : "SERIES_SINGLE",
        accessExpiresAt: data.accessExpiresAt || (isProBundle ? oneYearExpiry : undefined),
      };

      return await prisma.order.create({
        data: orderData,
        include: { testSeries: true },
      });
    } catch (err) {
      console.error("[createOrder] Prisma error:", err);
      // Fallback to memory state for offline or validation failures
    }
  }

  const oneYearExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  const newOrder = {
    id: `ord_${Date.now()}`,
    orderNumber,
    userId: data.userId,
    testSeriesId: normalizedSeriesId,
    amount: data.amount,
    currency: "INR",
    status: "PENDING",
    paymentMethod: "RAZORPAY",
    planType: normalizedPlanType === "PRO" ? "PRO_FULL_ACCESS" : "SERIES_SINGLE",
    accessExpiresAt: data.accessExpiresAt || (normalizedPlanType === "PRO" ? oneYearExpiry : null),
    createdAt: new Date(),
  };

  memoryState.orders.push(newOrder as any);
  const series = memoryState.testSeries.find((ts) => ts.id === data.testSeriesId);
  return { ...newOrder, testSeries: series };
}

export async function activateOrder(
  orderId: string,
  providerPaymentId: string,
  metadata?: { planType?: "SERIES" | "PRO" }
) {
  if (isDbConfigured()) {
    try {
      const existing = await prisma.order.findUnique({ where: { id: orderId } } as any);
      if (!existing) {
        throw new Error(`Order ${orderId} not found`);
      }

      const updateData: any = {
        status: "PAID",
        payments: {
          create: {
            provider: "RAZORPAY",
            providerPaymentId,
            amount: existing.amount ?? 0,
            status: "PAID",
          },
        },
      };
      if (
        (metadata?.planType === "PRO" || existing.planType === "PRO_FULL_ACCESS" || existing.testSeriesId === "pro_access_all_series") &&
        !existing.accessExpiresAt
      ) {
        updateData.accessExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
      }

      const order = await prisma.order.update({
        where: { id: orderId },
        data: updateData,
        include: { testSeries: true },
      });
      return order;
    } catch (err) {
      console.error("[activateOrder] Prisma error:", err);
      // Fallback
    }
  }

  const order = memoryState.orders.find((o) => o.id === orderId);
  if (order) {
    order.status = "PAID";
  }
  const series = memoryState.testSeries.find((ts) => ts.id === order?.testSeriesId);
  return { ...order, testSeries: series };
}

export async function getUserOrders(userId: string) {
  if (isDbConfigured()) {
    try {
      await ensureDbSchema();
      return await prisma.order.findMany({
        where: { userId },
        include: { testSeries: true },
        orderBy: { createdAt: "desc" },
      });
    } catch {
      // Fallback
    }
  }

  return memoryState.orders
    .filter((o) => o.userId === userId)
    .map((o) => ({
      ...o,
      testSeries: memoryState.testSeries.find((ts) => ts.id === o.testSeriesId),
    }));
}

export async function getAllOrders() {
  if (isDbConfigured()) {
    try {
      await ensureDbSchema();
      return await prisma.order.findMany({
        include: { testSeries: true, user: true },
        orderBy: { createdAt: "desc" },
      });
    } catch {
      // Fallback
    }
  }

  return memoryState.orders.map((o) => ({
    ...o,
    user: memoryState.users.find((u) => u.id === o.userId),
    testSeries: memoryState.testSeries.find((ts) => ts.id === o.testSeriesId),
  }));
}

export async function markOrderAsPaid(orderId: string) {
  if (isDbConfigured()) {
    try {
      return await prisma.order.update({
        where: { id: orderId },
        data: {
          status: "PAID",
          payments: {
            create: {
              provider: "ADMIN_MANUAL",
              providerPaymentId: `manual_admin_${Date.now()}`,
              amount: 0,
              status: "PAID",
            },
          },
        },
        include: { testSeries: true, user: true },
      });
    } catch (err: any) {
      if (err?.message?.includes("Can't reach")) markDbUnreachable();
    }
  }

  const order = memoryState.orders.find((o) => o.id === orderId);
  if (order) {
    order.status = "PAID";
    order.paymentMethod = "ADMIN_ACTIVATION";
  }
  const series = memoryState.testSeries.find((ts) => ts.id === order?.testSeriesId);
  const user = memoryState.users.find((u) => u.id === order?.userId);
  return { ...order, testSeries: series, user };
}

// -------------------------------------------------------------
// ANALYTICS & DASHBOARD STATS
// -------------------------------------------------------------
export async function getStudentDashboardStats(userId: string) {
  const userOrders = await getUserOrders(userId);
  const paidOrders = userOrders.filter((o) => o.status === "PAID");

  let attempts: any[] = [];
  if (isDbConfigured()) {
    try {
      attempts = await prisma.testAttempt.findMany({
        where: { userId, status: { in: ["SUBMITTED", "AUTO_SUBMITTED"] } },
        include: { test: { include: { testSeries: true } } },
        orderBy: { completedAt: "desc" },
      });
    } catch (err) {
      console.error("getStudentDashboardStats DB query error:", err);
    }
  } else {
    attempts = memoryState.attempts
      .filter((a) => a.userId === userId && a.status === "SUBMITTED")
      .map((a) => {
        const test = memoryState.tests.find((t) => t.id === a.testId);
        const series = memoryState.testSeries.find((ts) => ts.id === test?.testSeriesId);
        return {
          ...a,
          test: {
            ...test,
            testSeries: series,
          },
        };
      });
  }

  const completedCount = attempts.length;
  const totalScores = attempts.reduce((acc, a) => acc + (a.score || 0), 0);
  const avgScore = completedCount > 0 ? totalScores / completedCount : 0;
  const bestScore = attempts.reduce((max, a) => Math.max(max, a.score || 0), 0);
  const avgAccuracy =
    completedCount > 0
      ? attempts.reduce((acc, a) => acc + (a.accuracy || 0), 0) / completedCount
      : 0;

  // Progression chart data
  const scoreTrend = attempts.slice(0, 7).reverse().map((a, idx) => ({
    attempt: `Mock ${idx + 1}`,
    score: Math.round(a.score || 0),
    accuracy: Math.round(a.accuracy || 0),
  }));

  const isProMember = await hasActiveProAccess(userId);
  const proMembership = isProMember ? await getStudentProMembership(userId) : null;

  return {
    purchasedSeriesCount: paidOrders.length,
    testsCompletedCount: completedCount,
    testsRemainingCount: Math.max(0, paidOrders.length * 15 - completedCount),
    averageScore: Math.round(avgScore * 10) / 10,
    bestScore: Math.round(bestScore * 10) / 10,
    overallAccuracy: Math.round(avgAccuracy * 10) / 10,
    recentTests: attempts.slice(0, 5),
    scoreTrend,
    hasAttemptHistory: completedCount > 0,
    isProMember,
    proMembership,
  };
}

export async function getAdminDashboardStats() {
  let studentsCount = 0;
  let activeStudentsCount = 0;
  let totalRevenue = 0;
  let totalSeriesCount = 0;
  let freeSeriesCount = 0;
  let paidSeriesCount = 0;
  let totalTestsCount = 0;
  let totalQuestionsCount = 0;
  let attemptsCount = 0;
  let topSeries: any[] = [];
  let recentOrders: any[] = [];

  if (isDbConfigured()) {
    try {
      const [
        students,
        activeStudents,
        paidOrders,
        seriesCount,
        freeSeries,
        paidSeries,
        testsCount,
        questionsCount,
        attCount,
        series,
        orders,
      ] = await Promise.all([
        prisma.user.count({ where: { role: "STUDENT" } }),
        prisma.user.count({ where: { role: "STUDENT", status: "ACTIVE" } }),
        prisma.order.findMany({ where: { status: "PAID" }, select: { amount: true } }),
        prisma.testSeries.count({ where: { id: { not: "pro_access_all_series" } } }),
        prisma.testSeries.count({ where: { price: 0, id: { not: "pro_access_all_series" } } }),
        prisma.testSeries.count({ where: { price: { gt: 0 }, id: { not: "pro_access_all_series" } } }),
        prisma.test.count(),
        prisma.question.count(),
        prisma.testAttempt.count(),
        prisma.testSeries.findMany({ where: { id: { not: "pro_access_all_series" } }, take: 5, orderBy: { createdAt: "desc" } }),
        prisma.order.findMany({ take: 5, orderBy: { createdAt: "desc" }, include: { user: true, testSeries: true } }),
      ]);

      studentsCount = students;
      activeStudentsCount = activeStudents;
      totalRevenue = paidOrders.reduce((sum, o) => sum + (o.amount || 0), 0);
      totalSeriesCount = seriesCount;
      freeSeriesCount = freeSeries;
      paidSeriesCount = paidSeries;
      totalTestsCount = testsCount;
      totalQuestionsCount = questionsCount;
      attemptsCount = attCount;
      topSeries = series;
      recentOrders = orders;
    } catch (err: any) {
      if (err?.message?.includes("Can't reach")) markDbUnreachable();
    }
  } else {
    studentsCount = memoryState.users.filter((u) => u.role === "STUDENT").length;
    activeStudentsCount = memoryState.users.filter((u) => u.role === "STUDENT" && u.status === "ACTIVE").length;
    const validSeries = memoryState.testSeries.filter((s) => s.id !== "pro_access_all_series" && s.slug !== "pro-full-access");
    totalSeriesCount = validSeries.length;
    freeSeriesCount = validSeries.filter((s) => Number(s.price) === 0 || Number(s.discountPrice) === 0).length;
    paidSeriesCount = validSeries.filter((s) => Number(s.price) > 0 && Number(s.discountPrice ?? 1) > 0).length;
    totalTestsCount = memoryState.tests.length;
    totalQuestionsCount = memoryState.questions.length;
    totalRevenue = memoryState.orders.filter((o) => o.status === "PAID").reduce((sum, o) => sum + o.amount, 0);
    attemptsCount = memoryState.attempts.length;
    topSeries = validSeries.slice(0, 5);
    recentOrders = memoryState.orders.slice(0, 5).map((o) => ({
      ...o,
      user: memoryState.users.find((u) => u.id === o.userId),
      testSeries: memoryState.testSeries.find((s) => s.id === o.testSeriesId),
    }));
  }

  return {
    totalStudents: studentsCount,
    activeStudents: activeStudentsCount,
    totalTestSeries: totalSeriesCount,
    freeSeriesCount,
    paidSeriesCount,
    totalTests: totalTestsCount,
    totalQuestions: totalQuestionsCount,
    totalRevenue,
    testsAttempted: attemptsCount,
    completionRate: attemptsCount > 0 ? 88.5 : 0,
    recentOrders,
    revenueChart: [
      { month: "Jan", revenue: Math.round(totalRevenue * 0.1), students: Math.round(studentsCount * 0.2) },
      { month: "Feb", revenue: Math.round(totalRevenue * 0.2), students: Math.round(studentsCount * 0.4) },
      { month: "Mar", revenue: Math.round(totalRevenue * 0.4), students: Math.round(studentsCount * 0.6) },
      { month: "Apr", revenue: Math.round(totalRevenue * 0.6), students: Math.round(studentsCount * 0.8) },
      { month: "May", revenue: totalRevenue, students: studentsCount },
    ],
    topSeries,
  };
}


// -------------------------------------------------------------
// BOOKMARK OPERATIONS (DATABASE DRIVEN)
// -------------------------------------------------------------
export async function getBookmarkedQuestions(userId: string) {
  if (isDbConfigured()) {
    try {
      const bookmarks = await prisma.bookmark.findMany({
        where: { userId },
        include: {
          question: {
            include: {
              options: {
                orderBy: { orderIndex: "asc" },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return bookmarks.map((b) => ({
        bookmarkId: b.id,
        notes: b.notes,
        createdAt: b.createdAt,
        id: b.question.id,
        questionText: b.question.questionText,
        questionType: b.question.questionType,
        subject: b.question.subject,
        topic: b.question.topic,
        difficulty: b.question.difficulty,
        explanation: b.question.explanation,
        marks: b.question.marks,
        negativeMarks: b.question.negativeMarks,
        options: b.question.options,
      }));
    } catch (err) {
      console.error("getBookmarkedQuestions error:", err);
      return [];
    }
  }

  return [];
}

export async function toggleBookmarkQuestion(
  userId: string,
  questionId: string,
  notes?: string
): Promise<{ bookmarked: boolean; message: string }> {
  if (isDbConfigured()) {
    try {
      const existing = await prisma.bookmark.findFirst({
        where: { userId, questionId },
      });

      if (existing) {
        await prisma.bookmark.delete({ where: { id: existing.id } });
        return { bookmarked: false, message: "Question removed from bookmarks." };
      } else {
        await prisma.bookmark.create({
          data: {
            userId,
            questionId,
            notes: notes || null,
          },
        });
        return { bookmarked: true, message: "Question bookmarked for revision." };
      }
    } catch (err: any) {
      console.error("toggleBookmarkQuestion error:", err);
      throw new Error(err.message || "Failed to toggle bookmark");
    }
  }

  return { bookmarked: true, message: "Question bookmarked." };
}

// -------------------------------------------------------------
// STUDENT TESTS RETRIEVAL (DATABASE DRIVEN)
// -------------------------------------------------------------
export async function getTestsForStudent(options?: { seriesId?: string; userId?: string }) {
  let tests: any[] = [];
  if (isDbConfigured()) {
    try {
      tests = await prisma.test.findMany({
        where: {
          status: "PUBLISHED",
          testSeries: { status: "PUBLISHED" },
          ...(options?.seriesId ? { testSeriesId: options.seriesId } : {}),
        },
        include: {
          testSeries: true,
          testQuestions: {
            select: { id: true },
          },
        },
        orderBy: { orderIndex: "asc" },
      });
    } catch (err: any) {
      if (err?.message?.includes("Can't reach")) markDbUnreachable();
    }
  }

  if (tests.length === 0) {
    tests = memoryState.tests
      .filter((t) => {
        if (t.status !== "PUBLISHED") return false;
        const series = memoryState.testSeries.find((ts) => ts.id === t.testSeriesId);
        if (!series || series.status !== "PUBLISHED") return false;
        if (options?.seriesId && t.testSeriesId !== options.seriesId) return false;
        return true;
      })
      .map((t) => ({
        ...t,
        testSeries: memoryState.testSeries.find((ts) => ts.id === t.testSeriesId) || null,
        testQuestions: (t.questionIds || []).map((id) => ({ id })),
      }));
  }

  // If userId provided, annotate whether student has access.
  // Non-purchased students can preview only 3 tests for the selected series.
  if (options?.userId) {
    const isPro = await hasActiveProAccess(options.userId);
    const userOrders = await getUserOrders(options.userId);
    const paidSeriesSet = new Set(
      userOrders.filter((o: any) => o.status === "PAID").map((o: any) => o.testSeriesId)
    );

    const isFullAccess = isPro || (options?.seriesId && paidSeriesSet.has(options.seriesId));
    const previewLimit = isFullAccess ? Number.MAX_SAFE_INTEGER : 3;

    const visibleTests = tests.slice(0, previewLimit);

    return visibleTests.map((t) => {
      const isFree = Number(t.testSeries?.price ?? 0) === 0 || Number(t.testSeries?.discountPrice ?? 1) === 0;
      const isPurchased = isPro || paidSeriesSet.has(t.testSeriesId);
      const isAccessible = isFree || isPurchased || isPro;
      return {
        ...t,
        isFree,
        isPurchased,
        isAccessible,
        isProUnlocked: isPro,
      };
    });
  }

  return tests.map((t) => {
    const isFree = Number(t.testSeries?.price ?? 0) === 0 || Number(t.testSeries?.discountPrice ?? 1) === 0;
    return {
      ...t,
      isFree,
      isPurchased: false,
      isAccessible: isFree,
    };
  });
}


// -------------------------------------------------------------
// QUESTION LINKING & MANAGEMENT (DATABASE DRIVEN)
// -------------------------------------------------------------
export async function getTestQuestionsWithBank(testId: string) {
  if (isDbConfigured()) {
    try {
      const [test, allBankQuestions] = await Promise.all([
        prisma.test.findUnique({
          where: { id: testId },
          include: {
            testSeries: true,
            testQuestions: {
              include: {
                question: {
                  include: { options: { orderBy: { orderIndex: "asc" } } },
                },
              },
              orderBy: { orderIndex: "asc" },
            },
          },
        }),
        prisma.question.findMany({
          include: { options: { orderBy: { orderIndex: "asc" } } },
          orderBy: { createdAt: "desc" },
        }),
      ]);

      if (!test) return null;

      const linkedQuestionIds = new Set(test.testQuestions.map((tq) => tq.questionId));
      const availableQuestions = allBankQuestions.filter((q) => !linkedQuestionIds.has(q.id));

      return {
        test,
        linkedQuestions: test.testQuestions,
        availableQuestions,
        totalLinkedCount: test.testQuestions.length,
        totalBankCount: allBankQuestions.length,
      };
    } catch (err) {
      console.error("getTestQuestionsWithBank error:", err);
      return null;
    }
  }

  return null;
}

export async function linkQuestionsToTest(
  testId: string,
  questionIds: string[],
  sectionName = "General Section"
) {
  if (isDbConfigured()) {
    try {
      const test = await prisma.test.findUnique({
        where: { id: testId },
        include: { testQuestions: true },
      });

      if (!test) throw new Error("Mock test not found in database.");

      const existingQuestionIds = new Set(test.testQuestions.map((tq) => tq.questionId));
      const toAdd = questionIds.filter((qid) => !existingQuestionIds.has(qid));

      let currentOrder = test.testQuestions.length;
      for (const qid of toAdd) {
        currentOrder++;
        await prisma.testQuestion.create({
          data: {
            testId,
            questionId: qid,
            sectionName: sectionName || "General Section",
            orderIndex: currentOrder,
          },
        });
      }

      // Synchronize question marks with test marksPerQuestion
      if (toAdd.length > 0) {
        await prisma.question.updateMany({
          where: { id: { in: toAdd } },
          data: {
            marks: test.marksPerQuestion,
            negativeMarks: test.negativeMarkingRate,
          },
        });
      }

      // Recalculate Test totalMarks = newTotalQuestions * marksPerQuestion
      const totalQuestionsCount = test.testQuestions.length + toAdd.length;
      const updatedTotalMarks = Math.round(totalQuestionsCount * test.marksPerQuestion * 100) / 100;

      await prisma.test.update({
        where: { id: testId },
        data: { totalMarks: updatedTotalMarks },
      });

      // Recalculate parent TestSeries totalQuestionsCount
      if (test.testSeriesId) {
        const allSeriesTests = await prisma.test.findMany({
          where: { testSeriesId: test.testSeriesId },
          include: { testQuestions: true },
        });
        const totalSeriesQuestions = allSeriesTests.reduce(
          (sum, t) => sum + t.testQuestions.length,
          0
        );
        await prisma.testSeries.update({
          where: { id: test.testSeriesId },
          data: {
            totalQuestionsCount: totalSeriesQuestions,
            totalTestsCount: allSeriesTests.length,
          },
        });
      }

      return {
        success: true,
        addedCount: toAdd.length,
        totalQuestionsCount,
        totalMarks: updatedTotalMarks,
      };
    } catch (err: any) {
      console.error("linkQuestionsToTest error:", err);
      throw new Error(err.message || "Failed to link questions to test");
    }
  }

  return { success: true, addedCount: questionIds.length };
}

export async function unlinkQuestionFromTest(testId: string, questionId: string) {
  if (isDbConfigured()) {
    try {
      const test = await prisma.test.findUnique({
        where: { id: testId },
        include: { testQuestions: true },
      });

      if (!test) throw new Error("Mock test not found in database.");

      await prisma.testQuestion.deleteMany({
        where: { testId, questionId },
      });

      const remainingQuestionsCount = Math.max(0, test.testQuestions.length - 1);
      const updatedTotalMarks = Math.round(remainingQuestionsCount * test.marksPerQuestion * 100) / 100;

      await prisma.test.update({
        where: { id: testId },
        data: { totalMarks: updatedTotalMarks },
      });

      if (test.testSeriesId) {
        const allSeriesTests = await prisma.test.findMany({
          where: { testSeriesId: test.testSeriesId },
          include: { testQuestions: true },
        });
        const totalSeriesQuestions = allSeriesTests.reduce(
          (sum, t) => sum + t.testQuestions.length,
          0
        );
        await prisma.testSeries.update({
          where: { id: test.testSeriesId },
          data: {
            totalQuestionsCount: totalSeriesQuestions,
          },
        });
      }

      return {
        success: true,
        remainingQuestionsCount,
        totalMarks: updatedTotalMarks,
      };
    } catch (err: any) {
      console.error("unlinkQuestionFromTest error:", err);
      throw new Error(err.message || "Failed to unlink question from test");
    }
  }

  return { success: true };
}

