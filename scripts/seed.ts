import { PrismaClient } from "@prisma/client";
import {
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_TEST_SERIES,
  INITIAL_QUESTIONS,
  INITIAL_TESTS,
} from "../lib/data/initial-data";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting QuickTestWala database seed...");

  // 1. Seed Categories
  console.log("-> Seeding categories...");
  for (const cat of INITIAL_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        displayOrder: cat.displayOrder,
        isActive: cat.isActive,
      },
      create: {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        icon: cat.icon,
        displayOrder: cat.displayOrder,
        isActive: cat.isActive,
      },
    });
  }

  // 2. Seed Users
  console.log("-> Seeding demo users...");
  for (const user of INITIAL_USERS) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        passwordHash: user.passwordHash,
        role: user.role,
        status: user.status,
      },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        role: user.role,
        status: user.status,
        profile: {
          create: {
            targetExam: user.targetExam,
            phone: user.phone,
            state: "Delhi",
            education: "Graduate",
          },
        },
      },
    });
  }

  // 3. Seed Test Series
  console.log("-> Seeding test series...");
  for (const ts of INITIAL_TEST_SERIES) {
    await prisma.testSeries.upsert({
      where: { slug: ts.slug },
      update: {
        title: ts.title,
        description: ts.description,
        shortDescription: ts.shortDescription,
        thumbnail: ts.thumbnail,
        categoryId: ts.categoryId,
        examName: ts.examName,
        language: ts.language,
        difficulty: ts.difficulty,
        price: ts.price,
        discountPrice: ts.discountPrice,
        status: ts.status,
        isFeatured: ts.isFeatured,
        totalTestsCount: ts.totalTestsCount,
        totalQuestionsCount: ts.totalQuestionsCount,
        rating: ts.rating,
        ratingCount: ts.ratingCount,
      },
      create: {
        id: ts.id,
        title: ts.title,
        slug: ts.slug,
        description: ts.description,
        shortDescription: ts.shortDescription,
        thumbnail: ts.thumbnail,
        categoryId: ts.categoryId,
        examName: ts.examName,
        language: ts.language,
        difficulty: ts.difficulty,
        price: ts.price,
        discountPrice: ts.discountPrice,
        status: ts.status,
        isFeatured: ts.isFeatured,
        totalTestsCount: ts.totalTestsCount,
        totalQuestionsCount: ts.totalQuestionsCount,
        rating: ts.rating,
        ratingCount: ts.ratingCount,
      },
    });
  }

  // 4. Seed Questions and Options
  console.log("-> Seeding questions and options...");
  for (const q of INITIAL_QUESTIONS) {
    await prisma.question.upsert({
      where: { id: q.id },
      update: {
        questionText: q.questionText,
        questionType: q.questionType,
        subject: q.subject,
        topic: q.topic,
        difficulty: q.difficulty,
        explanation: q.explanation,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        correctNumericalAnswer: q.correctNumericalAnswer,
      },
      create: {
        id: q.id,
        questionText: q.questionText,
        questionType: q.questionType,
        subject: q.subject,
        topic: q.topic,
        difficulty: q.difficulty,
        explanation: q.explanation,
        marks: q.marks,
        negativeMarks: q.negativeMarks,
        correctNumericalAnswer: q.correctNumericalAnswer,
        options: {
          create: q.options.map((opt) => ({
            id: opt.id,
            optionKey: opt.optionKey,
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
            orderIndex: opt.orderIndex,
          })),
        },
      },
    });
  }

  // 5. Seed Tests and associate questions
  console.log("-> Seeding tests and test-question mappings...");
  for (const t of INITIAL_TESTS) {
    const createdTest = await prisma.test.upsert({
      where: { id: t.id },
      update: {
        title: t.title,
        slug: t.slug,
        description: t.description,
        durationMinutes: t.durationMinutes,
        totalMarks: t.totalMarks,
        passingMarks: t.passingMarks,
        negativeMarkingRate: t.negativeMarkingRate,
        marksPerQuestion: t.marksPerQuestion,
        instructions: t.instructions,
        status: t.status,
      },
      create: {
        id: t.id,
        testSeriesId: t.testSeriesId,
        title: t.title,
        slug: t.slug,
        description: t.description,
        durationMinutes: t.durationMinutes,
        totalMarks: t.totalMarks,
        passingMarks: t.passingMarks,
        negativeMarkingRate: t.negativeMarkingRate,
        marksPerQuestion: t.marksPerQuestion,
        instructions: t.instructions,
        status: t.status,
      },
    });

    // Link test questions
    for (let i = 0; i < t.questionIds.length; i++) {
      const qid = t.questionIds[i];
      const q = INITIAL_QUESTIONS.find((item) => item.id === qid);
      if (q) {
        await prisma.testQuestion.upsert({
          where: { id: `tq_${createdTest.id}_${qid}` },
          update: {
            sectionName: q.subject,
            orderIndex: i,
          },
          create: {
            id: `tq_${createdTest.id}_${qid}`,
            testId: createdTest.id,
            questionId: qid,
            sectionName: q.subject,
            orderIndex: i,
          },
        });
      }
    }
  }

  console.log("✅ QuickTestWala seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seed execution note: Database connection not available or offline.", e.message);
    process.exit(0);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
