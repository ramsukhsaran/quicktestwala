# ExamForge — CBT Government Exam Test-Taking Portal

> **A modern, developer-grade, production-ready online examination platform for Indian competitive exams (SSC, Banking, Railways, UPSC, State PSC, Defence).**

Inspired by the clean, minimal aesthetic of Vercel, ExamForge features an authentic TCS-patterned Computer-Based Test (CBT) engine, live negative marking, sectional countdown timers, automated answer synchronization, detailed step-by-step solutions, and role-based student and admin portals.

---

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript (Strict)
- **Styling**: Tailwind CSS & shadcn/ui design conventions
- **Icons**: Lucide React
- **ORM**: Prisma ORM (`@prisma/client` & `prisma`)
- **Database**: Neon Serverless PostgreSQL / Standard PostgreSQL
- **Charts**: Recharts (Diagnostic score progression & accuracy trends)
- **Auth**: Edge-compatible JWT session cookies (`jose`) + Bcrypt password hashing
- **Payments**: Modular Payment Provider architecture (**Razorpay** + built-in Sandbox Mock Provider)

---

## ⚡ Quick Start

### 1. Install Dependencies

```bash
npm install --legacy-peer-deps
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```env
DATABASE_URL="postgresql://neondb_owner:...@ep-....neon.tech/neondb?sslmode=require"
AUTH_SECRET="examforge-super-secure-production-secret-token-32chars"
RAZORPAY_KEY_ID="rzp_test_placeholder_key"
RAZORPAY_KEY_SECRET="rzp_test_placeholder_secret"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> **Note**: If `DATABASE_URL` is left as placeholder or offline, ExamForge automatically activates an in-memory development sandbox so every single route, mock test, and admin feature can be run and tested immediately without any setup hurdles!

### 3. Generate Prisma Client & Push Schema

```bash
# Generate Prisma Client
npm run prisma:generate

# Push database schema to Neon / PostgreSQL
npm run prisma:push

# Seed database with realistic exam questions & demo accounts
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Pre-Configured Demo Accounts

For effortless evaluation, 1-click login buttons are available directly on the `/login` page:

| Role | Email | Password | Access Area |
|---|---|---|---|
| **Admin** | `admin@example.com` | `admin123` | `/admin/*` (Full management, question bank, test series, bulk import) |
| **Student** | `student@example.com` | `student123` | `/student/*` (CBT terminal, dashboard, solutions, orders) |

---

## 🎯 Key Capabilities & Architecture

### 1. Computer-Based Test (CBT) Engine (`/student/tests/[id]/attempt`)
- **Sectional Countdown Timer**: Persists across browser refreshes and tab closures. Auto-submits strictly at `00:00` with 5-minute warning alerts.
- **5-State Question Palette**:
  - Gray: *Not Visited*
  - Red: *Visited & Unanswered*
  - Green: *Answered*
  - Purple: *Marked for Review*
  - Purple + Dot: *Answered & Marked for Review*
- **Question Types Supported**: Single MCQ, Multiple Correct, Numerical Input.
- **Anti-Loss Engine**: Auto-saves every response to database in real-time.
- **Submission Confirmation**: Live tally of Answered, Unanswered, and Marked questions before finalizing.

### 2. Detailed Solution Review (`/student/tests/[id]/result`)
- Full scorecard: Score, Percentage, Estimated Rank, Accuracy %, Correct/Incorrect breakdown.
- Color-coded question review: Green (Correct), Red (Incorrect), Gray (Skipped).
- Step-by-step mathematical proofs and reasoning explanations for every question.

### 3. Bulk Question Importer (`/admin/questions/import`)
- Upload CSV spreadsheets containing hundreds of questions.
- Real-time client & server schema validation using Zod.
- Preview dashboard showing Valid vs. Invalid rows with inline error messages.
- 1-click bulk insertion into the master Question Bank.

### 4. Modular Payments (Razorpay + Sandbox)
- Abstraction pattern via `lib/payments/provider.ts`.
- Automatically activates `RazorpayPaymentProvider` when production keys are present in `.env`.
- Seamlessly falls back to `MockPaymentProvider` in development for instantaneous 1-click test checkouts and automated license activation.

---

## 📁 Project Structure

```
├── actions/              # Next.js Server Actions (auth, test, checkout, admin)
├── app/
│   ├── (auth)/           # /login, /register, /forgot-password
│   ├── (public)/         # /, /test-series, /exams, /pricing, /about
│   ├── admin/            # /admin/dashboard, /admin/test-series, /admin/tests, /admin/questions, /admin/orders
│   ├── student/          # /student/dashboard, /student/tests, /student/results, /student/orders
│   ├── globals.css       # Tailwind directives & CBT palette styling
│   └── layout.tsx        # Root HTML layout with ThemeProvider & ToastProvider
├── components/
│   ├── admin/            # Analytics charts, forms, student status toggles
│   ├── brand/            # ExamForge logo and badges
│   ├── student/          # Performance progression charts, student navigation
│   ├── test/             # CBT Exam Engine, question palette, result reviewer
│   └── ui/               # Button, Card, Dialog, Badge, Input, Toast, Tabs
├── lib/
│   ├── auth/             # JWT session cookies (jose) & RBAC guards
│   ├── data/             # Unified Prisma repository with sandbox fallback
│   ├── payments/         # PaymentProvider interface & Razorpay adapter
│   ├── validations/      # Zod validation schemas
│   └── prisma.ts         # Singleton Prisma client instance
├── prisma/
│   └── schema.prisma     # Relational schema (13 PostgreSQL models)
├── scripts/
│   └── seed.ts           # Seeding script for categories, tests, and demo users
└── middleware.ts         # Route protection and RBAC guards
```

---

## 🛡️ License

Built with precision for competitive examination excellence. © ExamForge Technologies Ltd.
