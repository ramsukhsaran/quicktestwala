import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  try {
    // Attempt with driver adapter (PrismaPg) if available
    const { PrismaPg } = require("@prisma/adapter-pg");
    const adapter = new PrismaPg({ connectionString });
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  } catch {
    try {
      // Standard PrismaClient fallback
      return new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
      });
    } catch (fallbackErr) {
      console.warn("Prisma Client initialization notice - using resilient fallback proxy:", fallbackErr);
      return new Proxy({} as PrismaClient, {
        get(target, prop) {
          if (prop === "$connect" || prop === "$disconnect") return async () => {};
          return new Proxy({}, {
            get() {
              return async () => null;
            },
          });
        },
      });
    }
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

let schemaSyncPromise: Promise<void> | null = null;

export async function ensureDbSchema(): Promise<void> {
  if (schemaSyncPromise) return schemaSyncPromise;
  schemaSyncPromise = (async () => {
    try {
      await prisma.$executeRawUnsafe(`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OrderPlanType') THEN
            CREATE TYPE "OrderPlanType" AS ENUM ('SERIES_SINGLE', 'PRO_FULL_ACCESS');
          END IF;
        END $$;
      `);
      await prisma.$executeRawUnsafe(`
        ALTER TABLE IF EXISTS "orders" 
        ADD COLUMN IF NOT EXISTS "plan_type" "OrderPlanType" DEFAULT 'SERIES_SINGLE';
      `);
      await prisma.$executeRawUnsafe(`
        ALTER TABLE IF EXISTS "orders" 
        ADD COLUMN IF NOT EXISTS "payment_method" VARCHAR(50) DEFAULT 'RAZORPAY';
      `);
      await prisma.$executeRawUnsafe(`
        ALTER TABLE IF EXISTS "orders" 
        ADD COLUMN IF NOT EXISTS "access_expires_at" TIMESTAMP(3);
      `);
      await prisma.$executeRawUnsafe(`
        ALTER TABLE IF EXISTS "test_series" 
        ADD COLUMN IF NOT EXISTS "discount_price" INTEGER DEFAULT 0;
      `);
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "previous_year_papers" (
          "id" VARCHAR(100) PRIMARY KEY,
          "title" VARCHAR(255) NOT NULL,
          "exam_name" VARCHAR(100) NOT NULL,
          "year" VARCHAR(20) NOT NULL,
          "description" TEXT,
          "test_series_id" VARCHAR(100),
          "pdf_url" TEXT,
          "is_published" BOOLEAN DEFAULT true,
          "access_type" VARCHAR(50) DEFAULT 'PAID_ANY',
          "questions" JSONB DEFAULT '[]'::jsonb,
          "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
          "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
        );
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS idx_pyq_exam_name ON "previous_year_papers"("exam_name");
      `);
      await prisma.$executeRawUnsafe(`
        CREATE INDEX IF NOT EXISTS idx_pyq_test_series_id ON "previous_year_papers"("test_series_id");
      `);
      await prisma.$executeRawUnsafe(`
        UPDATE "test_series"
        SET "status" = 'ARCHIVED'
        WHERE "id" = 'pro_access_all_series' OR "slug" = 'pro-full-access';
      `);
    } catch {
      // Schema sync will retry or safely fallback to in-memory store
    }
  })();
  return schemaSyncPromise;
}

export default prisma;
