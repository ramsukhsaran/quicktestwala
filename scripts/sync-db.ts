import { Client } from "pg";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("No DATABASE_URL found in .env");
    process.exit(1);
  }

  console.log("Connecting to PostgreSQL...");
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected successfully!");

    console.log("Ensuring OrderPlanType enum and orders columns...");
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'OrderPlanType') THEN
          CREATE TYPE "OrderPlanType" AS ENUM ('SERIES_SINGLE', 'PRO_FULL_ACCESS');
        END IF;
      END $$;
    `);
    console.log("Checked/created enum OrderPlanType");

    await client.query(`
      ALTER TABLE IF EXISTS "orders" 
      ADD COLUMN IF NOT EXISTS "plan_type" "OrderPlanType" DEFAULT 'SERIES_SINGLE';
    `);
    console.log("Added orders.plan_type");

    await client.query(`
      ALTER TABLE IF EXISTS "orders" 
      ADD COLUMN IF NOT EXISTS "payment_method" VARCHAR(50) DEFAULT 'RAZORPAY';
    `);
    console.log("Added orders.payment_method");

    await client.query(`
      ALTER TABLE IF EXISTS "orders" 
      ADD COLUMN IF NOT EXISTS "access_expires_at" TIMESTAMP(3);
    `);
    console.log("Added orders.access_expires_at");

    // Also check if test_series has discount_price
    await client.query(`
      ALTER TABLE IF EXISTS "test_series"
      ADD COLUMN IF NOT EXISTS "discount_price" INTEGER DEFAULT 0;
    `);

    // Ensure previous_year_papers table exists
    console.log("Ensuring previous_year_papers table...");
    await client.query(`
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
      CREATE INDEX IF NOT EXISTS idx_pyq_exam_name ON "previous_year_papers"("exam_name");
      CREATE INDEX IF NOT EXISTS idx_pyq_test_series_id ON "previous_year_papers"("test_series_id");
    `);
    console.log("Table previous_year_papers verified/created!");

    // Archive dummy pro_access_all_series row so it is never displayed as a test series
    await client.query(`
      UPDATE "test_series" 
      SET "status" = 'ARCHIVED' 
      WHERE "id" = 'pro_access_all_series' OR "slug" = 'pro-full-access';
    `);
    console.log("Ensured pro_access_all_series is set to ARCHIVED status");

    // Verify columns in orders
    const res = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'orders';
    `);
    console.log("Current columns in orders table:", res.rows.map(r => `${r.column_name} (${r.data_type})`).join(", "));

    console.log("Database synchronization completed successfully! 🎉");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await client.end();
  }
}

main();
